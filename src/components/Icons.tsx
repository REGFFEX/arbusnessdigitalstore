/**
 * AR Business Digital Store — Icônes SVG
 * 
 * Système d'icônes cohérent basé sur SVG.
 * Couleurs adaptées au design system (or #D4AF37, zinc, white).
 * Chaque icône suit son rôle sémantique.
 */

import React from 'react'

interface IconProps {
    size?: number
    className?: string
    strokeWidth?: number
    fill?: string
}

// ── Navigation & Actions ──────────────────────────────────────

/** Flèche gauche — Retour arrière */
export const IconArrowLeft = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
)

/** Coeur — Favori / Wishlist */
export const IconHeart = ({ size = 20, className = '', strokeWidth = 2, fill = 'none' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
)

/** Partager — Share API */
export const IconShare = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
)

/** Dossier — Catégories / Fichiers */
export const IconFolder = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
)

/** Maison — Accueil */
export const IconHome = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
)

/** Flèche droite — Suivant / Voir plus */
export const IconArrowRight = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
)

/** Chevron droit — Accordéon / Suivant */
export const IconChevronRight = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
)

/** Chevron gauche */
export const IconChevronLeft = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m15 18-6-6 6-6" />
    </svg>
)

/** Chevron haut */
export const IconChevronUp = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m18 15-6-6-6 6" />
    </svg>
)

/** Chevron bas */
export const IconChevronDown = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
)

/** Lien externe */
export const IconCloudUpload = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M12 12v9" />
        <path d="m16 16-4-4-4 4" />
    </svg>
)

export const IconExternalLink = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
)

/** Croix — Fermer / Annuler */
export const IconX = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
)

// ── Téléchargement ────────────────────────────────────────────

/** Flèche téléchargement — Download principal */
export const IconDownload = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

/** Cadenas fermé — Mode Privé / Sécurisé */
export const IconLock = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

/** Globe — Mode Public / Mondial */
export const IconGlobe = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
)

// ── Administration ────────────────────────────────────────────

/** Engrenage — Paramètres / Settings */
export const IconSettings = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

/** Utilisateurs — Gestion des admins */
export const IconUsers = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

/** Utilisateur seul */
export const IconUser = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

/** Bulle de message / Chat */
export const IconMessageCircle = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
)

/** Plus / Ajouter — Créer un produit */
export const IconPlus = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

/** Grille / Catalogue — Gérer les produits */
export const IconGrid = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
)

/** Megaphone / Ads — Gérer les publicités */
export const IconMegaphone = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
)

/** Valise / Services — Gérer les services */
export const IconBriefcase = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
)

// ── Contenu & Média ───────────────────────────────────────────

/** Étoile — Note / Favori */
export const IconStar = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

/** Shield — Sécurité / Vérifié */
export const IconShield = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

/** Package — Produit / Fichier */
export const IconPackage = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
)

/** Musique — Audio */
export const IconMusic = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
)

/** Fichier — Generic File */
export const IconFile = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
)

/** Épingle — Pin Premium */
export const IconPin = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 17v5" />
        <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A.5.5 0 0 0 6 13.9v.1a.5.5 0 0 0 .5.5H12m0 0h5.5a.5.5 0 0 0 .5-.5v-.1a.5.5 0 0 0-.11-.45l-1.78-.9A2 2 0 0 1 15 10.76V7a2 2 0 0 1 2-2h.5a.5.5 0 0 0 .5-.5v-.1a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v.1a.5.5 0 0 0 .5.5H7a2 2 0 0 1 2 2v3.76z" />
    </svg>
)

/** Horloge — Histoire / Récent */
export const IconClock = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

/** Historique — Actions passées */
export const IconHistory = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
)

/** Loupe — Recherche */
export const IconSearch = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

/** WhatsApp */
export const IconWhatsApp = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
)

/** Telegram */
export const IconTelegram = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
)

/** LinkedIn */
export const IconLinkedIn = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
    </svg>
)

/** Facebook */
export const IconFacebook = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
)

/** Lien / Link */
export const IconLink = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
)

/** Smartphone */
export const IconSmartphone = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
)

/** Éclair / Flame — Tendance / Populaire */
export const IconTrending = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
)

/** Nouveau / Sparkle — Nouveauté */
export const IconSparkle = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2l2.4 7.6H22l-6.4 4.6 2.4 7.6L12 17.2l-6 4.6 2.4-7.6L2 9.6h7.6z" />
    </svg>
)

/** Vérification checkmark */
export const IconCheck = ({ size = 20, className = '', strokeWidth = 2.5 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

/** Poubelle — Supprimer */
export const IconTrash = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
)

/** Crayon — Modifier */
export const IconEdit = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

/** Œil — Voir / Aperçu */
export const IconEye = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

/** Play / Vidéo */
export const IconPlay = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
)

/** Éveil / Attention / Erreur */
export const IconAlert = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

/** Diamant — En Vedette */
export const IconDiamond = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2.7 10.3 12 21l9.3-10.7" />
        <path d="m6 3 3 7h6l3-7Z" />
        <path d="M2 10h20" />
    </svg>
)

/** Trophée — Choix Rédaction / Top */
export const IconTrophy = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 22V18" />
        <path d="M14 22V18" />
        <path d="M12 18a6 6 0 0 1-6-6V3h12v9a6 6 0 0 1-6 6Z" />
    </svg>
)

/** Flamme — Tendance */
export const IconFlame = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
)

/** Fiole / Test — Bêta */
export const IconFlask = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 3h6" />
        <path d="M10 3v10.17a4 4 0 1 1-2 0V3" />
        <path d="M8.5 2h7" />
        <path d="m14 11 1 7h-6l1-7" />
    </svg>
)

/** Cadeau — Promotion */
export const IconGift = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="8" width="18" height="4" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1 -5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </svg>
)

/** Éclair — Vente Flash */
export const IconZap = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
)

/** Calendrier — Abonnement */
export const IconCalendar = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

/** Carte Bancaire — Payant */
export const IconCreditCard = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
)

/** Couronne — Premium */
export const IconCrown = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
)

/** Device Mobile — AR-DES */
export const IconDeviceMobile = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
)

/** Cerveau — Recherche Intelligente */
export const IconBrain = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z" />
    </svg>
)

// ── Plateformes ───────────────────────────────────────────────

/** Android Icon */
export const IconAndroid = ({ size = 20, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <path d="M17.523 15.3414c-.5511 0-.998.4469-.998.998 0 .5511.4469.998.998.998.5511 0 .998-.4469.998-.998 0-.5511-.4469-.998-.998-.998zm-11.046 0c-.5511 0-.998.4469-.998.998 0 .5511.4469.998.998.998.5511 0 .998-.4469.998-.998 0-.5511-.4469-.998-.998-.998zm11.4045-3.5516l1.9961-3.4573c.112-.194.045-.4416-.149-.5536-.194-.112-.4416-.045-.5536.149l-2.0221 3.5024C15.9388 10.4357 14.1207 10 12 10s-3.9388.4357-5.1529 1.4303L4.8251 7.9279c-.112-.194-.3596-.261-.5536-.149-.194.112-.261.3596-.149.5536l1.9961 3.4573C3.6015 13.5651 2 16.5866 2 20h20c0-3.4134-1.6015-6.4349-4.1185-8.2102z" />
    </svg>
)
/** Windows Icon */
export const IconWindows = ({ size = 20, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <path d="M0 3.449L9.75 2.1l0.01 9.451-9.76 0.05zM0 12.109l9.75 0.05 0.01 9.516-9.76-1.341zM11.03 1.932l12.97-1.932v11.583l-12.97 0.12zM11.03 12.308l12.97 0.12v11.572l-12.97-1.932z" />
    </svg>
)

/** Linux Icon */
export const IconLinux = ({ size = 20, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <path d="M20.1 19.33c.42.36.42.94 0 1.25l-.83.74c-.42.36-1.1.36-1.52 0l-.82-.74a.89.89 0 0 1 0-1.25l.83-.74c.42-.36 1.1-.36 1.52 0l.82.74ZM6.64 19.33c.42.36.42.94 0 1.25l-.82.74c-.42.36-1.1.36-1.52 0l-.83-.74c-.42-.36-.42-.94 0-1.25l.83-.74c.42-.36 1.1-.36 1.52 0l.82.74ZM12 2c3.31 0 6 2.69 6 6 0 1.94-.92 3.67-2.36 4.77C16.5 15.5 18 18 18 20c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2 0-2 1.5-4.5 2.36-7.23C6.92 11.67 6 9.94 6 8c0-3.31 2.69-6 6-6Z" />
    </svg>
)

/** Apple Icon (macOS/iOS) */
export const IconApple = ({ size = 20, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.75.9.01 2.22-.84 3.86-.68 1.9.18 3.3 1.02 3.96 2.5-3.86 2.15-3.23 7.02.65 8.4-.53 1.56-1.56 2.92-2.55 4ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-3.25.13 2.58-2.34 4.59-3.74 3.25Z" />
    </svg>
)

/** Copier — Copier le texte */
export const IconCopy = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
)

/** Sélectionner Tout — Select All text */
export const IconSelectAll = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 4" />
        <path d="M7 12h10M12 7v10" />
    </svg>
)

/** Bâtiment / Office — Institutionnel / Logo */
export const IconBuilding = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01" />
    </svg>
)

/** Graphique à barres — Statistiques Premium */
export const IconChartBar = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradChart" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
        </defs>
        <line x1="12" y1="20" x2="12" y2="10" stroke="url(#gradChart)" />
        <line x1="18" y1="20" x2="18" y2="4" stroke="url(#gradChart)" opacity="0.6" />
        <line x1="6" y1="20" x2="6" y2="14" stroke="url(#gradChart)" opacity="0.8" />
    </svg>
)


/** Help Circle — Aide */
export const IconHelpCircle = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
)

/** Éveil / Attention / Erreur (Cercle) */
export const IconAlertCircle = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

/** Shield Check — Sécurité Validée */
export const IconShieldCheck = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
)

/** Cercle avec Check — Succès */
export const IconCircleCheck = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
)

/** Mail Icon */
export const IconMail = ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
)

/** Handshake Icon */
export const IconHandshake = ({ size = 20, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>
)

/** Home Icon */
// Redundant IconHome removed here to avoid duplication

// Palette Icon
export const IconPalette = ({ size = 18, className = "" }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.464-1.128-.282-.29-.45-.7-.45-1.148 0-.926.748-1.648 1.648-1.648h1.993a3.456 3.456 0 0 0 3.456-3.456C22 6.726 17.522 2 12 2z" />
    </svg>
)

/** Loader / Spinner */
export const IconLoader2 = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
)


/** Map Pin — Localisation */
export const IconMapPin = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

/** Info Circle — Information */
export const IconInfoCircle = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
)

// ── Categories Shapes ──────────────────────────────────────────

/** Grille d'apps */
export const IconApps = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
)

/** Laptop */
export const IconDeviceLaptop = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
    </svg>
)

/** Gamepad */
export const IconDeviceGamepad = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="15.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="12.5" r=".5" fill="currentColor" />
        <circle cx="15.5" cy="12.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    </svg>
)

/** Chapeau de diplômé / École */
export const IconSchool = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 10 12 5 2 10l10 5 10-5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
)

/** Marteau / Clé */
export const IconTools = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m2 22 5-5m1.5 1.5L11 16m9-11c-2.3-2.3-6.4-1.5-9.2 1.3-3 3-3.6 7-1.3 9.3l.5.5-5 5-2-1.5-2 2 4 4 2-2-1.5-2 5-5 .5.5c2.3 2.3 6.3 1.7 9.3-1.3 2.8-2.8 3.6-6.9 1.3-9.2z" />
    </svg>
)

/** Boîte / Ressource */
export const IconBox = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
)

/** Coeur avec utilisateur (Service/Support) */
export const IconUserHeart = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <circle cx="12" cy="11" r="3" />
    </svg>
)
/** Layout / Grid list */
export const IconLayoutList = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
        <path d="M14 4h7M14 9h7M14 15h7M14 20h7" />
    </svg>
)

/** Layout / Structure */
export const IconLayout = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="3" x2="21" y1="9" y2="9" />
        <line x1="9" x2="9" y1="21" y2="9" />
    </svg>
)

/** Monitor / Screen — Logiciel / Desktop */
export const IconMonitor = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
)

/** Book / Document — Ressource / Formation */
export const IconBook = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
)

/** Map des icônes par catégorie pour usage universel */
export const CATEGORY_ICONS: Record<string, any> = {
    Application: IconDeviceMobile,
    Apps: IconDeviceMobile,
    Logiciel: IconMonitor,
    Logiciels: IconMonitor,
    Outil: IconTools,
    Outils: IconTools,
    Service: IconUserHeart,
    Services: IconUserHeart,
    Jeu: IconDeviceGamepad,
    Jeux: IconDeviceGamepad,
    Ressource: IconBook,
    Ressources: IconBook,
    Formation: IconSchool,
    Formations: IconSchool,
    Système: IconSettings,
    Systèmes: IconSettings,
    Default: IconBox
}

/** Mapping des icônes pour les placements / collections */
export const PLACEMENT_ICONS: Record<string, any> = {
    top_10: IconStar,
    trending: IconFlame,
    featured: IconDiamond,
    editors_choice: IconTrophy,
    beta_test: IconFlask,
    active_dev: IconTools,
    coming_soon: IconClock,
    promo: IconGift,
    flash_sale: IconZap,
    free_trial: IconCircleCheck,
    formation_week: IconSchool,
    game_of_week: IconDeviceGamepad,
    tool_spotlight: IconSearch,
    partner: IconUsers,
    project_mode: IconBriefcase
}

/** Mapping des icônes pour la monétisation */
export const MONETIZATION_ICONS: Record<string, any> = {
    free: IconCheck,
    free_ads: IconMonitor,
    freemium: IconZap,
    paid: IconCreditCard,
    premium: IconCrown,
    subscription_monthly: IconCalendar,
    subscription_annual: IconCalendar,
    ads: IconMonitor,
    donation: IconUserHeart,
    enterprise: IconBuilding,
    pay_per_session: IconTrophy
}
// ── AR Center Specific Icons ──────────────────────────────────

/** Annonce — Micro-ordinateur / Haut-parleur Premium */
export const IconCenterAnnouncement = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradAnnounce" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
        </defs>
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="url(#gradAnnounce)" fillOpacity="0.2" />
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="url(#gradAnnounce)" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="url(#gradAnnounce)" opacity="0.5" />
    </svg>
)

/** Important — Alerte Premium */
export const IconCenterAlert = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradAlert" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill="url(#gradAlert)" fillOpacity="0.1" />
        <path d="M12 8v4" stroke="url(#gradAlert)" />
        <path d="M12 16h.01" stroke="url(#gradAlert)" />
        <circle cx="12" cy="12" r="10" stroke="url(#gradAlert)" />
    </svg>
)

/** Publicité — Ad Premium */
export const IconCenterAd = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradAd" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>
        </defs>
        <rect x="2" y="5" width="20" height="14" rx="2" fill="url(#gradAd)" fillOpacity="0.1" />
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="url(#gradAd)" />
        <path d="M7 15h.01M12 12h.01M17 15h.01" stroke="url(#gradAd)" />
        <circle cx="12" cy="12" r="3" stroke="url(#gradAd)" />
    </svg>
)

/** Vidéo — Clap Premium */
export const IconCenterVideo = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradVid" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
        </defs>
        <path d="m22 8-6 4 6 4V8Z" fill="url(#gradVid)" fillOpacity="0.2" />
        <rect x="2" y="6" width="14" height="12" rx="2" ry="2" fill="url(#gradVid)" fillOpacity="0.1" />
        <rect x="2" y="6" width="14" height="12" rx="2" ry="2" stroke="url(#gradVid)" />
        <path d="m22 8-6 4 6 4V8Z" stroke="url(#gradVid)" />
        <circle cx="9" cy="12" r="2" fill="url(#gradVid)" />
    </svg>
)

/** Audio — Micro Premium */
export const IconCenterAudio = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradAud" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>
        </defs>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="url(#gradAud)" fillOpacity="0.2" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="url(#gradAud)" />
        <line x1="12" y1="19" x2="12" y2="23" stroke="url(#gradAud)" />
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="url(#gradAud)" />
    </svg>
)

/** Galerie — Multi-images Premium */
export const IconCenterGallery = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradGal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="url(#gradGal)" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="url(#gradGal)" />
        <polyline points="21 15 16 10 5 21" stroke="url(#gradGal)" />
        <path d="M16 16l-3-3-4 4" stroke="url(#gradGal)" opacity="0.5" />
    </svg>
)

/** Texte — Message simple Premium */
export const IconCenterText = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <defs>
            <linearGradient id="gradText" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
            </linearGradient>
        </defs>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="url(#gradText)" fillOpacity="0.1" />
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="url(#gradText)" />
        <path d="M8 7h8M8 11h8" stroke="url(#gradText)" opacity="0.6" strokeWidth={1.5} />
    </svg>
)

/** AR Center Logo — Avion Telegram + AR en bas à droite */
export const IconCenterLogo = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <defs>
      <linearGradient id="gradLogo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />
        <stop offset="100%" stopColor="#D4AF37" />
      </linearGradient>
    </defs>
    <path d="m22 2-7 20-4-9-9-4Z" fill="url(#gradLogo)" fillOpacity="0.2" />
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
    {/* Petit AR en bas à droite */}
    <text x="14" y="22" className="font-black" fontSize="9" fill="currentColor" style={{ fontStyle: 'normal' }}>AR</text>
  </svg>
)

/** Statistiques — Icône de graphique premium */
export const IconStats = ({ size = 20, className = '', strokeWidth = 2 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
/** Mapping des icônes pour le Centre AR (Localisé en Français) */
export const CENTER_TYPE_ICONS: Record<string, any> = {
    announcement: { icon: IconCenterAnnouncement, label: 'Annonce', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    important: { icon: IconCenterAlert, label: 'Important', color: 'text-red-500', bg: 'bg-red-500/10' },
    ad: { icon: IconCenterAd, label: 'Publicité', color: 'text-gold', bg: 'bg-gold/10' },
    video: { icon: IconCenterVideo, label: 'Vidéo', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    audio: { icon: IconCenterAudio, label: 'Audio', color: 'text-green-400', bg: 'bg-green-400/10' },
    text: { icon: IconCenterText, label: 'Texte', color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
    file: { icon: IconFolder, label: 'Fichier', color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
    product_link: { icon: IconPackage, label: 'Lien Produit', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    service_link: { icon: IconBriefcase, label: 'Lien Service', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    external_link: { icon: IconExternalLink, label: 'Lien Externe', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    gallery: { icon: IconCenterGallery, label: 'Galerie', color: 'text-pink-400', bg: 'bg-pink-400/10' },
}
