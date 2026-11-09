import pkg from '../../../package.json'
import type { OperationRecord, PublicationRecord } from './types'

export interface SystemInfo {
    version: string
    build: string
    build_date: string
    environment: string
    runtime: string
    language: string
    network: string
    sync_state: string
    compatibility: string
    diagnostics: { label: string; value: string }[]
    operations: OperationRecord[]
}

const BUILD_DATE = typeof __APP_BUILD_DATE__ !== 'undefined' ? __APP_BUILD_DATE__ : new Date().toISOString()

function runtimeLabel(): string {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    if (/Android/i.test(ua)) return 'Navigateur · Android'
    if (/iPhone|iPad|iPod/i.test(ua)) return 'Navigateur · iOS'
    if (/Macintosh/i.test(ua)) return 'Navigateur · macOS'
    if (/Windows/i.test(ua)) return 'Navigateur · Windows'
    if (/Linux/i.test(ua)) return 'Navigateur · Linux'
    return 'Navigateur web'
}

function syncLabel(meta: PublicationRecord | null): string {
    if (!meta) return 'Aucune publication institutionnelle importée'
    const parts = [`Publication ${meta.publication_version}`, `du ${meta.published_at || '—'}`]
    return parts.join(' · ')
}

/**
 * Informations techniques : détectées par l'application, jamais saisies à la main.
 */
export function getSystemInfo(
    publication: PublicationRecord | null,
    operations: OperationRecord[]
): SystemInfo {
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true
    const screenSize =
        typeof window !== 'undefined' ? `${window.screen.width} × ${window.screen.height}` : '—'
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '—'

    return {
        version: pkg.version,
        build: `${pkg.name}@${pkg.version}`,
        build_date: BUILD_DATE,
        environment: import.meta.env.MODE === 'production' ? 'Production' : 'Développement',
        runtime: runtimeLabel(),
        language: typeof navigator !== 'undefined' ? navigator.language : 'fr',
        network: online ? 'En ligne' : 'Hors ligne',
        sync_state: syncLabel(publication),
        compatibility: online
            ? 'Web moderne (ES2022) · API Web Crypto disponible'
            : 'Connexion indisponible : certaines fonctions sont limitées',
        diagnostics: [
            { label: 'Résolution détectée', value: screenSize },
            { label: 'Fuseau horaire', value: timezone },
            { label: 'Stockage local', value: typeof localStorage !== 'undefined' ? 'Disponible' : 'Indisponible' },
            { label: 'API cryptographique', value: globalThis.crypto?.subtle ? 'Disponible' : 'Indisponible' },
        ],
        operations: operations.slice(0, 20),
    }
}
