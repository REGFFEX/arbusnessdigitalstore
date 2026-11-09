import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SmartSearch from '../SmartSearch'
import { moduleTitleFor } from './navModules'
import { useTheme } from '../../context/ThemeContext'
import { ARDES_CONFIG } from '../../config/ardes_config'
import {
    IconArrowLeft,
    IconSearch,
    IconSun,
    IconMoon,
    IconX,
    IconChevronDown,
    IconCenterLogo,
    IconTrending,
    IconMessageCircle,
    IconShield,
    IconHelpCircle,
} from '../Icons'

interface AppHeaderProps {
    user?: { email?: string | null } | null
    adminData?: { display_name?: string; avatar_url?: string; role?: string } | null
    isAdmin?: boolean
    searchEnabled?: boolean
}

const NOTIFICATIONS = [
    { title: 'Roadmap Vision 2026', desc: 'Nouvelles étapes publiées', path: '/roadmap', icon: IconTrending },
    { title: 'Communauté AR', desc: 'Derniers partages du réseau', path: '/community', icon: IconMessageCircle },
    { title: 'Centre AR', desc: 'Ressources et annonces officielles', path: '/ar-center', icon: IconCenterLogo },
]

function useMenusClose(
    refs: React.RefObject<HTMLElement>[],
    isOpen: boolean,
    close: () => void,
) {
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            const target = e.target as Node
            if (!refs.some(ref => ref.current?.contains(target))) close()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])
}

function BellIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    )
}

export default function AppHeader({ user, adminData, isAdmin, searchEnabled = true }: AppHeaderProps) {
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()

    const [bellOpen, setBellOpen] = useState(false)
    const [accountOpen, setAccountOpen] = useState(false)
    const [mobileSearch, setMobileSearch] = useState(false)

    const bellDesktopRef = useRef<HTMLDivElement>(null)
    const bellMobileRef = useRef<HTMLDivElement>(null)
    const accountDesktopRef = useRef<HTMLDivElement>(null)
    const accountMobileRef = useRef<HTMLDivElement>(null)

    useMenusClose([bellDesktopRef, bellMobileRef], bellOpen, () => setBellOpen(false))
    useMenusClose([accountDesktopRef, accountMobileRef], accountOpen, () => setAccountOpen(false))

    const title = moduleTitleFor(pathname)
    const canGoBack = pathname !== '/'
    const goBack = () => {
        if (window.history.length > 1) navigate(-1)
        else navigate('/')
    }

    const displayName = adminData?.display_name || user?.email?.split('@')[0] || 'Invité'
    const initials = (adminData?.display_name || user?.email || 'AR')
        .replace(/[^a-zA-ZÀ-ÿ ]/g, ' ')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part.charAt(0).toUpperCase())
        .join('') || 'AR'

    const search = (term: string) => {
        if (term.trim()) {
            navigate(`/search?q=${encodeURIComponent(term)}`)
            setMobileSearch(false)
        }
    }

    const notificationsMenu = bellOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[min(340px,calc(100vw-24px))] rounded-[24px] border border-white/10 bg-[#0b0b0e]/95 backdrop-blur-2xl shadow-2xl p-2 animate-fade-in">
            <div className="flex items-center justify-between px-3 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Notifications</p>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gold/70">3 nouvelles</span>
            </div>
            {NOTIFICATIONS.map(item => {
                const Icon = item.icon
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setBellOpen(false)}
                        className="flex items-start gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/[0.05] transition-colors"
                    >
                        <span className="mt-0.5 w-8 h-8 shrink-0 rounded-xl bg-gold/10 border border-gold/20 text-gold flex items-center justify-center">
                            <Icon size={15} />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-[12px] font-bold text-white truncate">{item.title}</span>
                            <span className="block text-[11px] text-zinc-500 truncate">{item.desc}</span>
                        </span>
                    </Link>
                )
            })}
        </div>
    )

    const accountMenu = accountOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-[min(280px,calc(100vw-24px))] rounded-[24px] border border-white/10 bg-[#0b0b0e]/95 backdrop-blur-2xl shadow-2xl p-2 animate-fade-in">
            <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                <p className="text-[12px] font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'Session visiteur'}</p>
            </div>
            <Link to="/ar-center" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors">
                <IconCenterLogo size={16} className="text-gold" /> Centre AR
            </Link>
            <Link to="/guide" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors">
                <IconHelpCircle size={16} className="text-zinc-500" /> Guide &amp; aide
            </Link>
            <button onClick={toggleTheme} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors">
                {theme === 'dark' ? <IconSun size={16} className="text-zinc-500" /> : <IconMoon size={16} className="text-zinc-500" />}
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </button>
            {isAdmin && (
                <Link to={`/${ARDES_CONFIG.ADMIN_PATH}`} onClick={() => setAccountOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-gold hover:bg-gold/10 transition-colors">
                    <IconShield size={16} /> Espace administration
                </Link>
            )}
        </div>
    )

    const avatarButton = (
        <button
            onClick={() => setAccountOpen(v => !v)}
            className="relative w-9 h-9 rounded-full bg-gradient-to-br from-gold/80 to-yellow-800 p-[1.5px] transition-transform duration-200 hover:scale-105"
            aria-label="Mon compte"
        >
            <span className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center overflow-hidden">
                {adminData?.avatar_url ? (
                    <img src={adminData.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-[11px] font-black text-gold">{initials}</span>
                )}
            </span>
        </button>
    )

    return (
        <header className="sticky top-0 z-[80] border-b border-white/[0.06] bg-black/50 backdrop-blur-2xl">
            {/* ── Desktop ─────────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-4 h-[72px] px-6">
                <div className="flex items-center gap-2 min-w-0">
                    {canGoBack && (
                        <button
                            onClick={goBack}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                            aria-label="Retour"
                            title="Retour"
                        >
                            <IconArrowLeft size={17} strokeWidth={2.4} />
                        </button>
                    )}
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-zinc-600">AR Business</p>
                        <h1 className="text-[15px] font-black text-white leading-tight truncate">{title}</h1>
                    </div>
                </div>

                {searchEnabled && (
                    <div className="flex-1 max-w-[420px] ml-auto">
                        <SmartSearch onSearch={search} placeholder="Rechercher un produit, un service…" context="shell" />
                    </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
                    <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-400">En ligne</span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-gold hover:bg-white/[0.06] transition-colors"
                        aria-label="Changer de thème"
                    >
                        {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
                    </button>

                    <div className="relative" ref={bellDesktopRef}>
                        <button
                            onClick={() => setBellOpen(v => !v)}
                            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${bellOpen ? 'bg-white/10 text-gold' : 'text-zinc-400 hover:text-gold hover:bg-white/[0.06]'}`}
                            aria-label="Notifications"
                            aria-expanded={bellOpen}
                        >
                            <BellIcon size={17} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(212,175,55,0.9)]" />
                        </button>
                        {notificationsMenu}
                    </div>

                    <div className="relative ml-1" ref={accountDesktopRef}>
                        {avatarButton}
                        {accountMenu}
                    </div>
                </div>
            </div>

            {/* ── Mobile ──────────────────────────────────────────────── */}
            <div className="lg:hidden flex items-center gap-2 h-[62px] px-3">
                {canGoBack ? (
                    <button
                        onClick={goBack}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-300 active:scale-95 bg-white/[0.05] border border-white/[0.06] transition-transform"
                        aria-label="Retour"
                    >
                        <IconArrowLeft size={18} strokeWidth={2.4} />
                    </button>
                ) : (
                    <div className="w-9 h-9 rounded-[13px] bg-gradient-to-br from-gold/25 to-transparent border border-white/10 flex items-center justify-center">
                        <span className="text-[11px] font-black text-gold">AR</span>
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.24em] text-zinc-600 leading-none mb-0.5">AR Business</p>
                    <h1 className="text-[14px] font-black text-white leading-tight truncate">{title}</h1>
                </div>

                {searchEnabled && (
                    <button
                        onClick={() => setMobileSearch(v => !v)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${mobileSearch ? 'bg-gold/15 text-gold' : 'text-zinc-300 hover:bg-white/[0.05]'}`}
                        aria-label="Rechercher"
                        aria-expanded={mobileSearch}
                    >
                        {mobileSearch ? <IconX size={18} /> : <IconSearch size={18} />}
                    </button>
                )}

                <div className="relative" ref={bellMobileRef}>
                    <button
                        onClick={() => setBellOpen(v => !v)}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${bellOpen ? 'bg-white/10 text-gold' : 'text-zinc-300'}`}
                        aria-label="Notifications"
                        aria-expanded={bellOpen}
                    >
                        <BellIcon size={18} />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(212,175,55,0.9)]" />
                    </button>
                    {notificationsMenu}
                </div>

                <div className="relative" ref={accountMobileRef}>
                    {avatarButton}
                    {accountMenu}
                </div>
            </div>

            {/* Recherche mobile dépliée */}
            {searchEnabled && mobileSearch && (
                <div className="lg:hidden px-3 pb-3 animate-fade-in">
                    <SmartSearch onSearch={search} placeholder="Rechercher…" context="shell-mobile" />
                </div>
            )}
        </header>
    )
}
