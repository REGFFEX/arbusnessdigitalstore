// ─── Centre d'informations du produit ────────────────────────────────────────
// Trois sources distinctes : Organisation (importée d'AR BUSINESS), Produit
// (gérée par l'administrateur), Système (détectée par l'application).

export type InfoSource = 'organization' | 'product' | 'system'

export interface LegalInfo {
    information: string
    privacy_policy: string
}

export interface SupportInfo {
    email: string
    phone: string
}

export interface OrganizationInfo {
    name: string
    description: string
    website: string
    email: string
    phone: string
    address: string
    team: string
    legal: LegalInfo
    support: SupportInfo
}

export interface ProductInfo {
    name: string
    description: string
    logo_url: string
    owner: string
    team: string
    features: string
    platforms: string
    languages: string
    website: string
    contacts: string
    support: string
    documentation: string
    terms: string
}

export interface PublicationMeta {
    publication_version: string
    published_at: string
    schema_version: string
    locale: string
    publisher: string
    verified: boolean
    fingerprint: string | null
    imported_at: string
}

export interface PublicationRecord extends PublicationMeta {
    id: string
    organization: OrganizationInfo
}

export interface OperationRecord {
    id: string
    at: string
    action: string
    detail: string
}

export interface TrustedKey {
    fingerprint: string
    publicKeyJwk: JsonWebKey
    label: string
    added_at: string
}

export interface SigningKeyPair {
    fingerprint: string
    publicKeyJwk: JsonWebKey
    privateKeyJwk: JsonWebKey
    created_at: string
}

export interface OrganizationPacket {
    package_type: 'organization_profile'
    publisher: string
    schema_version: string
    publication_version: string
    published_at: string
    locale: string
    organization: {
        name: string
        description: string
        website: string
        email: string
        phone: string
        address: string
        team: string
    }
    legal: {
        legal_information: string
        privacy_policy: string
    }
    support: {
        email: string
        phone: string
    }
    integrity: {
        algorithm: string
        signature: string
        public_key: JsonWebKey
    }
}

export const PACKAGE_TYPE = 'organization_profile'
export const SCHEMA_VERSION = '1.0'
export const PACKET_ALGORITHM = 'ECDSA-P256-SHA256'
