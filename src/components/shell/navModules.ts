import type { ComponentType } from 'react'
import {
    IconHome,
    IconGrid,
    IconLayout,
    IconShield,
    IconBriefcase,
    IconTrending,
    IconMessageCircle,
    IconGlobe,
    IconHelpCircle,
    IconCenterLogo,
    IconSchool,
    IconPackage,
    IconSearch,
    IconDownload,
    IconInfoCircle,
} from '../Icons'

export type ShellIcon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>

export interface ShellModule {
    label: string
    path: string
    icon: ShellIcon
    hint?: string
}

export interface ShellGroup {
    label: string
    modules: ShellModule[]
}

// Source unique de vérité pour la sidebar, la palette flottante et la nav mobile.
export const MODULE_GROUPS: ShellGroup[] = [
    {
        label: 'Boutique',
        modules: [
            { label: 'Accueil', path: '/', icon: IconHome, hint: 'Page principale' },
            { label: 'Store', path: '/store', icon: IconPackage, hint: 'Catalogue complet' },
            { label: 'Catégories', path: '/categories', icon: IconLayout, hint: 'Filtres avancés' },
            { label: 'Premium', path: '/premium', icon: IconShield, hint: 'Contenus exclusifs' },
            { label: 'Recherche', path: '/search', icon: IconSearch, hint: 'Recherche globale' },
        ],
    },
    {
        label: 'Solutions',
        modules: [
            { label: 'Services', path: '/services', icon: IconBriefcase, hint: 'Solutions B2B' },
            { label: 'Formations', path: '/categories?category=formation', icon: IconSchool, hint: 'Cours en ligne' },
            { label: 'Téléchargements', path: '/secure-download', icon: IconDownload, hint: 'Accès sécurisé' },
        ],
    },
    {
        label: 'AR Business',
        modules: [
            { label: 'Centre AR', path: '/ar-center', icon: IconCenterLogo, hint: 'Ressources & annonces' },
            { label: 'Communauté', path: '/community', icon: IconMessageCircle, hint: 'Flux de nouvelles' },
            { label: 'Roadmap', path: '/roadmap', icon: IconTrending, hint: 'Vision 2026' },
            { label: 'Guide & Aide', path: '/guide', icon: IconHelpCircle, hint: 'Tutoriels' },
            { label: 'Informations', path: '/informations', icon: IconInfoCircle, hint: 'Organisation & produit' },
            { label: 'À propos', path: '/about', icon: IconGlobe, hint: 'Notre vision' },
        ],
    },
]

export const ALL_MODULES: ShellModule[] = MODULE_GROUPS.flatMap(group => group.modules)

export interface ShellTab {
    label: string
    path: string | null
    icon: ShellIcon
    primary?: boolean
}

// Onglets de la barre flottante mobile (5 places).
export const PRIMARY_TABS: ShellTab[] = [
    { label: 'Accueil', path: '/', icon: IconHome },
    { label: 'Store', path: '/store', icon: IconGrid },
    { label: 'Centre', path: '/ar-center', icon: IconCenterLogo, primary: true },
    { label: 'Services', path: '/services', icon: IconBriefcase },
    { label: 'Modules', path: null, icon: IconLayout },
]

export function isModuleActive(pathname: string, path: string) {
    const base = path.split('?')[0]
    if (base === '/') return pathname === '/'
    return pathname === base || pathname.startsWith(`${base}/`)
}

// Titre affiché dans l'en-tête pour la route courante.
export function moduleTitleFor(pathname: string) {
    const match = ALL_MODULES
        .filter(m => isModuleActive(pathname, m.path))
        .sort((a, b) => b.path.length - a.path.length)[0]
    if (match) return match.label
    if (pathname.startsWith('/product')) return 'Produit'
    if (pathname.startsWith('/services/')) return 'Service'
    return 'AR Business'
}
