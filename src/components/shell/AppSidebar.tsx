import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MODULE_GROUPS, isModuleActive } from './navModules'
import { useBranding } from '../../context/BrandingContext'
import { IconChevronLeft, IconChevronRight } from '../Icons'

interface AppSidebarProps {
    collapsed: boolean
    onToggle: () => void
    siteName?: string
    siteSlogan?: string
    logoUrl?: string
    logoRadius?: string
}

export default function AppSidebar({
    collapsed,
    onToggle,
    siteName = 'AR Business',
    siteSlogan = 'Digital Store',
    logoUrl,
    logoRadius = '16px',
}: AppSidebarProps) {
    const { pathname } = useLocation()
    const { setIsBrandingOpen } = useBranding()
    const [hovered, setHovered] = useState(false)

    // Réduite = rail d'icônes ; le survol la déploie en surimpression.
    const expanded = !collapsed || hovered

    return (
        <aside
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-[90] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                bg-[#08080a]/85 backdrop-blur-2xl border-r border-white/[0.06]
                ${expanded ? 'w-[268px] shadow-[24px_0_60px_-30px_rgba(0,0,0,0.9)]' : 'w-[84px]'}`}
        >
            {/* Marque */}
            <div className={`flex items-center gap-3 px-4 h-[76px] shrink-0 ${expanded ? '' : 'justify-center px-0'}`}>
                <button
                    onClick={() => setIsBrandingOpen(true)}
                    className="relative shrink-0 w-11 h-11 flex items-center justify-center bg-zinc-950 border border-white/10 shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
                    style={{ borderRadius: logoRadius }}
                    title={siteName}
                >
                    {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                        <span className="text-sm font-black bg-gradient-to-br from-gold to-yellow-700 bg-clip-text text-transparent">AR</span>
                    )}
                </button>
                <div className={`min-w-0 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <p className="text-[13px] font-black text-white leading-tight truncate">{siteName}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold/70 truncate">{siteSlogan}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 pb-4 scrollbar-hide">
                {MODULE_GROUPS.map(group => (
                    <div key={group.label} className="mb-4">
                        <p className={`px-3 pt-2 pb-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-600 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                            {group.label}
                        </p>
                        <div className="space-y-1">
                            {group.modules.map(mod => {
                                const active = isModuleActive(pathname, mod.path)
                                const Icon = mod.icon
                                return (
                                    <Link
                                        key={mod.path}
                                        to={mod.path}
                                        title={mod.label}
                                        aria-current={active ? 'page' : undefined}
                                        className={`relative flex items-center gap-3 rounded-2xl py-2.5 text-[13px] font-semibold transition-all duration-200
                                            ${expanded ? 'px-3' : 'px-0 justify-center'}
                                            ${active
                                                ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                                                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`}
                                    >
                                        {active && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-gold shadow-[0_0_12px_rgba(212,175,55,0.7)]" />
                                        )}
                                        <Icon size={19} strokeWidth={active ? 2.4 : 2} className={`shrink-0 ${active ? 'text-gold' : ''}`} />
                                        <span className={`truncate transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                            {mod.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Pied : état du service */}
            <div className="shrink-0 p-2.5 border-t border-white/[0.05]">
                <div className={`flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] ${expanded ? 'px-3 py-2.5' : 'justify-center py-3'}`}>
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <div className={`min-w-0 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        <p className="text-[11px] font-bold text-white leading-tight whitespace-nowrap">Système en ligne</p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600 whitespace-nowrap">AR Business · 2026</p>
                    </div>
                </div>
            </div>

            {/* Poignée plier / déplier */}
            <button
                onClick={onToggle}
                aria-label={collapsed ? 'Déployer le menu' : 'Réduire le menu'}
                aria-expanded={!collapsed}
                className="absolute -right-3 top-[30px] w-6 h-6 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-gold hover:border-gold/40 flex items-center justify-center transition-all duration-200 shadow-lg"
            >
                {collapsed ? <IconChevronRight size={13} strokeWidth={2.6} /> : <IconChevronLeft size={13} strokeWidth={2.6} />}
            </button>
        </aside>
    )
}
