// Signature et vérification des paquets institutionnels (ECDSA P-256).
// La clé privée ne quitte jamais le navigateur qui a préparé la publication ;
// les applications importantes ne conservent que la clé publique approuvée.
import type { SigningKeyPair } from './types'

const encoder = new TextEncoder()

function subtle(): SubtleCrypto {
    if (!globalThis.crypto?.subtle) {
        throw new Error(
            "Le contexte n'autorise pas la cryptographie Web (SubtleCrypto). Ouvrez l'application en HTTPS ou sur localhost."
        )
    }
    return globalThis.crypto.subtle
}

function toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(b => { binary += String.fromCharCode(b) })
    return btoa(binary)
}

/** Sérialisation stable : même contenu ⇒ même chaîne signée. */
export function canonicalize(value: unknown): string {
    if (value === null || value === undefined) return 'null'
    if (typeof value !== 'object') return JSON.stringify(value)
    if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`
    const record = value as Record<string, unknown>
    const keys = Object.keys(record).sort()
    return `{${keys.map(key => `${JSON.stringify(key)}:${canonicalize(record[key])}`).join(',')}}`
}

async function digest(value: string): Promise<string> {
    const hash = await subtle().digest('SHA-256', encoder.encode(value))
    return toBase64(hash)
}

/** Empreinte courte et lisible d'une clé publique. */
export async function fingerprintOf(publicKeyJwk: JsonWebKey): Promise<string> {
    const raw = await digest(canonicalize(publicKeyJwk))
    const hex = Array.from(atob(raw))
        .slice(0, 8)
        .map(b => b.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    return hex.match(/.{1,4}/g)?.join('-') ?? hex
}

export async function generateSigningKeyPair(): Promise<SigningKeyPair> {
    const pair = await subtle().generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])
    const publicKeyJwk = await subtle().exportKey('jwk', pair.publicKey)
    const privateKeyJwk = await subtle().exportKey('jwk', pair.privateKey)
    return {
        publicKeyJwk,
        privateKeyJwk,
        fingerprint: await fingerprintOf(publicKeyJwk),
        created_at: new Date().toISOString(),
    }
}

export async function signPayload(payload: unknown, privateKeyJwk: JsonWebKey): Promise<string> {
    const key = await subtle().importKey(
        'jwk',
        privateKeyJwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
    )
    const signature = await subtle().sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        key,
        encoder.encode(canonicalize(payload))
    )
    return toBase64(signature)
}

export async function verifyPayload(
    payload: unknown,
    signature: string,
    publicKeyJwk: JsonWebKey
): Promise<boolean> {
    try {
        const key = await subtle().importKey(
            'jwk',
            publicKeyJwk,
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['verify']
        )
        const binary = atob(signature)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
        return await subtle().verify(
            { name: 'ECDSA', hash: 'SHA-256' },
            key,
            bytes,
            encoder.encode(canonicalize(payload))
        )
    } catch {
        return false
    }
}
