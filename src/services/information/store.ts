import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
    OperationRecord,
    OrganizationInfo,
    OrganizationPacket,
    ProductInfo,
    PublicationRecord,
    SigningKeyPair,
    TrustedKey,
} from './types'
import { buildSignedPacket, formatPacket, validatePacket } from './packet'
import type { PacketDraft, PacketValidation } from './packet'
import { generateSigningKeyPair } from './crypto'

const STORAGE_KEY = 'arb.productInformation.v1'

export const EMPTY_ORGANIZATION: OrganizationInfo = {
    // Seules les informations déjà publiées par l'application sont pré-remplies.
    name: 'AR Business Digital Solutions',
    description:
        'Solutions numériques professionnelles et applications innovantes, portées par un écosystème multi-domaines basé au Congo-Brazzaville.',
    website: '',
    email: '',
    phone: '',
    address: '',
    team: '',
    legal: { information: '', privacy_policy: '' },
    support: { email: '', phone: '' },
}

export const EMPTY_PRODUCT: ProductInfo = {
    name: 'AR Business Digital Store',
    description:
        'La division dédiée à la distribution de solutions numériques, applications et logiciels certifiés par AR Business.',
    logo_url: '',
    owner: 'AR Business Digital',
    team: '',
    features: '',
    platforms: 'Web',
    languages: 'Français',
    website: '',
    contacts: 'arbusinessdigitalstore@gmail.com',
    support: '',
    documentation: '',
    terms: '',
}

function uid(prefix: string) {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

interface ImportOutcome extends PacketValidation {
    imported: boolean
}

interface InformationState {
    organization: OrganizationInfo
    publication: PublicationRecord | null
    history: PublicationRecord[]
    product: ProductInfo
    trustedKeys: TrustedKey[]
    signingKey: SigningKeyPair | null
    operations: OperationRecord[]

    updateProduct: (patch: Partial<ProductInfo>) => void
    updateOrganization: (patch: Partial<OrganizationInfo>) => void
    logOperation: (action: string, detail: string) => void
    approveKey: (fingerprint: string, publicKeyJwk: JsonWebKey, label?: string) => void
    ensureSigningKey: () => Promise<SigningKeyPair>
    regenerateSigningKey: () => Promise<SigningKeyPair>
    publishOrganization: (draft: PacketDraft) => Promise<string>
    validateImport: (raw: string) => Promise<PacketValidation>
    importPacket: (raw: string, approveKey: boolean) => Promise<ImportOutcome>
    restorePublication: (id: string) => void
}

export const useInformationStore = create<InformationState>()(
    persist(
        (set, get) => ({
            organization: EMPTY_ORGANIZATION,
            publication: null,
            history: [],
            product: EMPTY_PRODUCT,
            trustedKeys: [],
            signingKey: null,
            operations: [],

            updateProduct: patch => set(state => ({ product: { ...state.product, ...patch } })),

            updateOrganization: patch =>
                set(state => ({
                    organization: {
                        ...state.organization,
                        ...patch,
                        legal: { ...state.organization.legal, ...(patch.legal || {}) },
                        support: { ...state.organization.support, ...(patch.support || {}) },
                    },
                })),

            logOperation: (action, detail) =>
                set(state => ({
                    operations: [
                        { id: uid('op'), at: new Date().toISOString(), action, detail },
                        ...state.operations,
                    ].slice(0, 40),
                })),

            approveKey: (fingerprint, publicKeyJwk, label = 'AR Business Digital Solutions') =>
                set(state => ({
                    trustedKeys: state.trustedKeys.some(k => k.fingerprint === fingerprint)
                        ? state.trustedKeys
                        : [
                            ...state.trustedKeys,
                            { fingerprint, publicKeyJwk, label, added_at: new Date().toISOString() },
                        ],
                })),

            ensureSigningKey: async () => {
                const existing = get().signingKey
                if (existing) return existing
                const pair = await generateSigningKeyPair()
                set({ signingKey: pair })
                return pair
            },

            regenerateSigningKey: async () => {
                const pair = await generateSigningKeyPair()
                set({ signingKey: pair })
                get().logOperation(
                    'Clé de signature renouvelée',
                    `Nouvelle empreinte ${pair.fingerprint}. Les anciens paquets restent valables si l'ancienne clé est approuvée.`
                )
                return pair
            },

            publishOrganization: async draft => {
                const pair = await get().ensureSigningKey()
                const packet: OrganizationPacket = await buildSignedPacket(
                    get().organization,
                    draft,
                    pair.privateKeyJwk,
                    pair.publicKeyJwk
                )
                get().logOperation(
                    'Publication préparée',
                    `Version ${draft.publication_version} signée avec la clé ${pair.fingerprint}.`
                )
                return formatPacket(packet)
            },

            validateImport: async raw => {
                const state = get()
                return validatePacket(
                    raw,
                    state.publication ? state.organization : null,
                    state.trustedKeys.map(k => k.fingerprint)
                )
            },

            importPacket: async (raw, approveKey) => {
                const validation = await get().validateImport(raw)
                if (!validation.signatureValid) return { ...validation, imported: false }

                const trusted = get().trustedKeys.map(k => k.fingerprint)
                const mustApprove = !!validation.fingerprint && !trusted.includes(validation.fingerprint)
                if (mustApprove && !approveKey) {
                    return { ...validation, imported: false }
                }
                if (mustApprove && approveKey && validation.fingerprint && validation.packet) {
                    get().approveKey(
                        validation.fingerprint,
                        validation.packet.integrity.public_key,
                        validation.packet.publisher || 'AR Business'
                    )
                }

                if (validation.errors.length > 0 || !validation.packet || !validation.organization) {
                    return { ...validation, imported: false }
                }

                const packet = validation.packet
                const record: PublicationRecord = {
                    id: uid('pub'),
                    organization: validation.organization,
                    publication_version: packet.publication_version,
                    published_at: packet.published_at,
                    schema_version: packet.schema_version,
                    locale: packet.locale,
                    publisher: packet.publisher,
                    verified: validation.signatureValid,
                    fingerprint: validation.fingerprint,
                    imported_at: new Date().toISOString(),
                }

                set(current => ({
                    organization: record.organization,
                    publication: record,
                    history: [
                        record,
                        ...(current.publication ? [current.publication] : []),
                        ...current.history,
                    ].slice(0, 20),
                }))

                get().logOperation(
                    'Publication institutionnelle importée',
                    `Version ${record.publication_version} · ${record.verified ? 'signature vérifiée' : 'non vérifiée'}.`
                )

                return { ...validation, imported: true }
            },

            restorePublication: id => {
                const record = get().history.find(entry => entry.id === id)
                if (!record) return
                set({ organization: record.organization, publication: record })
                get().logOperation(
                    'Publication restaurée',
                    `Version ${record.publication_version} réappliquée.`
                )
            },
        }),
        {
            name: STORAGE_KEY,
            partialize: state => ({
                organization: state.organization,
                publication: state.publication,
                history: state.history,
                product: state.product,
                trustedKeys: state.trustedKeys,
                signingKey: state.signingKey,
                operations: state.operations,
            }),
        }
    )
)
