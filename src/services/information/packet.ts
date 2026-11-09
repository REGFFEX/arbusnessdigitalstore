import { PACKAGE_TYPE, PACKET_ALGORITHM, SCHEMA_VERSION } from './types'
import type { OrganizationInfo, OrganizationPacket } from './types'
import { canonicalize, fingerprintOf, signPayload, verifyPayload } from './crypto'

export interface PacketDraft {
    publication_version: string
    published_at: string
    locale: string
    publisher: string
}

export interface PacketChange {
    field: string
    from: string
    to: string
}

export interface PacketValidation {
    errors: string[]
    warnings: string[]
    signatureValid: boolean
    keyTrusted: boolean
    fingerprint: string | null
    packet: OrganizationPacket | null
    organization: OrganizationInfo | null
    changes: PacketChange[]
}

export function organizationFromPacket(packet: OrganizationPacket): OrganizationInfo {
    return {
        name: packet.organization.name || '',
        description: packet.organization.description || '',
        website: packet.organization.website || '',
        email: packet.organization.email || '',
        phone: packet.organization.phone || '',
        address: packet.organization.address || '',
        team: packet.organization.team || '',
        legal: {
            information: packet.legal?.legal_information || '',
            privacy_policy: packet.legal?.privacy_policy || '',
        },
        support: {
            email: packet.support?.email || '',
            phone: packet.support?.phone || '',
        },
    }
}

function packetBody(organization: OrganizationInfo, draft: PacketDraft) {
    return {
        package_type: PACKAGE_TYPE,
        publisher: draft.publisher,
        schema_version: SCHEMA_VERSION,
        publication_version: draft.publication_version,
        published_at: draft.published_at,
        locale: draft.locale,
        organization: {
            name: organization.name,
            description: organization.description,
            website: organization.website,
            email: organization.email,
            phone: organization.phone,
            address: organization.address,
            team: organization.team,
        },
        legal: {
            legal_information: organization.legal.information,
            privacy_policy: organization.legal.privacy_policy,
        },
        support: {
            email: organization.support.email,
            phone: organization.support.phone,
        },
    }
}

/** Construit et signe le paquet institutionnel à publier. */
export async function buildSignedPacket(
    organization: OrganizationInfo,
    draft: PacketDraft,
    privateKeyJwk: JsonWebKey,
    publicKeyJwk: JsonWebKey
): Promise<OrganizationPacket> {
    const body = packetBody(organization, draft)
    const signature = await signPayload(body, privateKeyJwk)
    return {
        ...body,
        integrity: {
            algorithm: PACKET_ALGORITHM,
            signature,
            public_key: publicKeyJwk,
        },
    } as OrganizationPacket
}

export function parsePacket(raw: string): { packet: OrganizationPacket | null; error: string | null } {
    const trimmed = (raw || '').trim()
    if (!trimmed) return { packet: null, error: 'Aucun contenu fourni.' }
    try {
        const parsed = JSON.parse(trimmed)
        if (!parsed || typeof parsed !== 'object') {
            return { packet: null, error: 'Le paquet doit être un objet JSON.' }
        }
        return { packet: parsed as OrganizationPacket, error: null }
    } catch {
        return { packet: null, error: "JSON illisible : vérifiez que le paquet a été collé en entier." }
    }
}

function labelOf(path: string): string {
    const labels: Record<string, string> = {
        name: "Nom de l'organisation",
        description: "Présentation de l'organisation",
        website: 'Site officiel',
        email: 'Email officiel',
        phone: 'Téléphone officiel',
        address: 'Adresse',
        team: 'Équipe centrale',
        'legal.information': 'Mentions légales',
        'legal.privacy_policy': 'Politique de confidentialité',
        'support.email': "Email d'assistance",
        'support.phone': "Téléphone d'assistance",
    }
    return labels[path] || path
}

function flatten(value: unknown, prefix = ''): Record<string, string> {
    if (!value || typeof value !== 'object') return prefix ? { [prefix]: String(value ?? '') } : {}
    return Object.entries(value as Record<string, unknown>).reduce((acc, [key, entry]) => {
        const path = prefix ? `${prefix}.${key}` : key
        if (entry && typeof entry === 'object') return { ...acc, ...flatten(entry, path) }
        return { ...acc, [path]: String(entry ?? '') }
    }, {} as Record<string, string>)
}

export function diffOrganization(current: OrganizationInfo | null, incoming: OrganizationInfo): PacketChange[] {
    if (!current) return []
    const before = flatten(current)
    const after = flatten(incoming)
    return Object.keys(after)
        .filter(key => (before[key] || '') !== (after[key] || ''))
        .map(key => ({ field: labelOf(key), from: before[key] || '', to: after[key] || '' }))
}

/** Contrôle format, champs obligatoires, version, origine et intégrité. */
export async function validatePacket(
    raw: string,
    current: OrganizationInfo | null,
    trustedFingerprints: string[]
): Promise<PacketValidation> {
    const result: PacketValidation = {
        errors: [],
        warnings: [],
        signatureValid: false,
        keyTrusted: false,
        fingerprint: null,
        packet: null,
        organization: null,
        changes: [],
    }

    const { packet, error } = parsePacket(raw)
    if (!packet || error) {
        result.errors.push(error || 'Paquet invalide.')
        return result
    }

    if (packet.package_type !== PACKAGE_TYPE) {
        result.errors.push(`Type de paquet inattendu : « ${String(packet.package_type)} » (attendu : ${PACKAGE_TYPE}).`)
    }
    if (!packet.schema_version || String(packet.schema_version).split('.')[0] !== SCHEMA_VERSION.split('.')[0]) {
        result.warnings.push(`Version de schéma « ${String(packet.schema_version)} » : l'application lit le schéma ${SCHEMA_VERSION}.`)
    }
    if (!packet.publication_version) result.errors.push('Version de publication manquante.')
    if (!packet.published_at) result.errors.push('Date de publication manquante.')
    if (!packet.organization?.name) result.errors.push("Nom de l'organisation manquant.")
    if (!packet.integrity?.signature || !packet.integrity?.public_key) {
        result.errors.push("Signature absente : l'origine du paquet ne peut pas être vérifiée.")
        return result
    }

    const { integrity, ...body } = packet
    try {
        result.fingerprint = await fingerprintOf(integrity.public_key)
        result.signatureValid = await verifyPayload(body, integrity.signature, integrity.public_key)
    } catch (err) {
        result.errors.push("Impossible de vérifier la signature du paquet.")
        result.signatureValid = false
    }

    if (!result.signatureValid) {
        result.errors.push('Signature invalide : le contenu a été modifié ou la clé ne correspond pas.')
    }
    result.keyTrusted = !!result.fingerprint && trustedFingerprints.includes(result.fingerprint)
    if (result.signatureValid && !result.keyTrusted) {
        result.warnings.push(
            `Clé de signature non approuvée sur cette application (empreinte ${result.fingerprint}). Approuvez-la pour faire de cette publication une source officielle.`
        )
    }

    if (packet.organization?.name) {
        result.packet = packet
        result.organization = organizationFromPacket(packet)
        result.changes = diffOrganization(current, result.organization)
    }

    return result
}

export function formatPacket(packet: OrganizationPacket): string {
    return JSON.stringify(packet, null, 2)
}

/** Contrôle de non-régression : le paquet doit rester stable une fois re-sérialisé. */
export function packetFingerprint(packet: OrganizationPacket): string {
    return canonicalize({ ...packet, integrity: undefined })
}
