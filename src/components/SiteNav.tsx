import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    IconGlobe,
    IconGrid,
    IconShield,
    IconBriefcase,
    IconSettings,
    IconHome,
    IconTrending,
    IconMessageCircle,
    IconLayout,
} from './Icons'

// Icônes SVG pour chaque page
const PAGE_ICONS: Record<string, React.ReactNode> = {
    '/': <IconHome size={14} strokeWidth={2} />,
    '/store': <IconGrid size={14} strokeWidth={2} />,
    '/categories': <IconLayout size={14} strokeWidth={2} />,
    '/premium': <IconShield size={14} strokeWidth={2} />,
    '/services': <IconBriefcase size={14} strokeWidth={2} />,
    '/about': <IconGlobe size={14} strokeWidth={2} />,
    '/roadmap': <IconTrending size={14} strokeWidth={2} />,
    '/community': <IconMessageCircle size={14} strokeWidth={2} />,
}

// Toutes les pages publiques (aucun lien admin)
const ALL_PAGES = [
    { label: 'Accueil', path: '/', desc: 'Retour à la page principale' },
    { label: 'Store', path: '/store', desc: 'Catalogue complet' },
    { label: 'Catégories', path: '/categories', desc: 'Filtres & recherche avancée' },
    { label: 'Premium', path: '/premium', desc: 'Contenus exclusifs' },
    { label: 'Services', path: '/services', desc: 'Solutions B2B' },
    { label: 'Roadmap', path: '/roadmap', desc: 'Vision 2026' },
    { label: 'Communauté', path: '/community', desc: 'Flux de nouvelles' },
    { label: 'À propos', path: '/about', desc: 'Notre vision & mission' },
]

// Mode "compact" : bouton toggle + barre scrollable horizontale
export function SiteNavBar() {
    // Par défaut ouvert pour plus de visibilité, mais on check le localStorage
    const [open, setOpen] = useState(() => {
        const saved = localStorage.getItem('ar_nav_open')
        return saved !== null ? JSON.parse(saved) : true
    })
    const { pathname } = useLocation()

    // Sauvegarde auto de la préférence
    React.useEffect(() => {
        localStorage.setItem('ar_nav_open', JSON.stringify(open))
    }, [open])

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all ${open ? 'bg-gold border-gold text-black' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
            >
                <IconSettings size={13} strokeWidth={2.5} />
                {open ? 'MASQUER' : 'SECTIONS'}
                <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {open && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 max-w-[calc(100vw-200px)]">
                    {ALL_PAGES.filter(p => p.path !== pathname).map((page) => (
                        <Link
                            key={page.path}
                            to={page.path}
                            onClick={() => setOpen(false)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-gold/40 transition-all whitespace-nowrap"
                        >
                            <span className="text-zinc-500">{PAGE_ICONS[page.path]}</span>
                            {page.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

// Mode "footer" : grille de tous les boutons de sections
export function SiteNavFooter() {
    const { pathname } = useLocation()

    return (
        <section className="border-t border-zinc-900 py-12 px-4 mt-12">
            <div className="max-w-7xl mx-auto">
                <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.25em] mb-6 text-center">
                    Toutes les sections
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {ALL_PAGES.map((page) => (
                        <Link
                            key={page.path}
                            to={page.path}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all ${pathname === page.path
                                ? 'bg-gold/10 border-gold/40 text-gold cursor-default'
                                : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900'
                                }`}
                        >
                            <span className={pathname === page.path ? 'text-gold' : 'text-zinc-500'}>{PAGE_ICONS[page.path]}</span>
                            {page.label}
                            {pathname === page.path && <span className="text-[9px] font-black uppercase tracking-wider text-gold/60 ml-1">← Ici</span>}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
