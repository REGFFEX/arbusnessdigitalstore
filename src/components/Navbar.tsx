import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBranding } from '../context/BrandingContext'
import { useSettings } from '../hooks/useSettings'
import {
    IconX,
    IconGlobe,
    IconShield,
    IconBriefcase,
    IconGrid,
    IconSettings,
    IconHelpCircle,
    IconSchool,
    IconMegaphone,
    IconSparkle,
    IconPackage,
    IconHome,
    IconFolder,
    IconZap,
    IconCenterLogo
} from './Icons'
import SmartSearch from './SmartSearch'

export default function Navbar() {
    const { settings } = useSettings()
    const { setIsBrandingOpen } = useBranding()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    const LogoIcon = () => (
        <div
            className="w-12 h-12 bg-zinc-900 flex items-center justify-center overflow-hidden transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-zinc-800 group-hover:border-gold/50 shadow-lg"
            style={{ borderRadius: settings.logo_border_radius || '16px' }}
        >
            {settings.logo_url ? (
                <img src={settings.logo_url} className="w-full h-full object-contain" alt="" />
            ) : (
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gold via-yellow-600 to-gold bg-clip-text">
                    <span className="text-xl font-black text-transparent leading-none">AR</span>
                    <div className="w-4 h-0.5 bg-gold/50 rounded-full mt-0.5"></div>
                </div>
            )}
        </div>
    )

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <nav className="bg-black/80 backdrop-blur-xl border-b border-zinc-800/50 sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo interactif */}
                    <div className={`flex items-center gap-4 transition-all duration-500 ${isMobileSearchOpen ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100'} ${isSearchFocused ? 'md:opacity-0 md:-translate-x-10 md:pointer-events-none' : ''}`}>
                        <button
                            onClick={() => setIsBrandingOpen(true)}
                            className={`flex items-center space-x-3 group relative transition-all ${!settings.logo_targets?.navbar ? 'hidden' : ''}`}
                        >
                            <LogoIcon />
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-lg font-black text-white leading-none tracking-tight group-hover:text-gold transition-colors">
                                    {settings.site_name}
                                </span>
                                <span className="text-[10px] text-gold font-bold uppercase tracking-widest mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {settings.site_slogan || 'Digital Store'}
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Mobile Search Overlay Trigger & Container */}
                    <div className={`md:hidden absolute left-0 right-0 px-4 transition-all duration-300 ${isMobileSearchOpen ? 'top-1/2 -translate-y-1/2 opacity-100 z-[110]' : 'opacity-0 pointer-events-none translate-y-10'}`}>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <SmartSearch
                                    onSearch={(term) => {
                                        setSearchQuery(term)
                                        if (term.trim()) {
                                            navigate(`/search?q=${encodeURIComponent(term)}`)
                                            setIsMobileSearchOpen(false)
                                        }
                                    }}
                                    placeholder="Rechercher..."
                                    context="global"
                                />
                            </div>
                            <button onClick={() => setIsMobileSearchOpen(false)} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                                <IconX size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Barre de recherche - Premium SmartSearch Overlay */}
                    {settings?.section_visibility?.global_search !== false && (
                        <div className={`transition-all duration-700 ease-in-out px-4 flex-1 flex justify-center ${isSearchFocused ? 'md:max-w-none md:flex-[2]' : ''} hidden md:block`}>
                            <div className={`transition-all duration-700 ease-in-out w-full ${isSearchFocused ? 'max-w-6xl' : (searchQuery ? 'max-w-xl' : 'max-w-xs')}`}>
                                <SmartSearch
                                    onSearch={(term) => {
                                        setSearchQuery(term)
                                        if (term.trim()) {
                                            navigate(`/search?q=${encodeURIComponent(term)}`)
                                            setIsSearchFocused(false)
                                        }
                                    }}
                                    onFocusChange={setIsSearchFocused}
                                    placeholder="Recherche galactique..."
                                    context="global"
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Desktop */}
                    <div className={`${isSearchFocused ? 'hidden' : 'hidden lg:flex'} items-center space-x-6 transition-all duration-500`}>
                        <Link to="/" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Accueil</Link>
                        <Link to="/store" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Store</Link>
                        <Link to="/categories" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Catégories</Link>
                        <Link to="/roadmap" className="text-sm font-bold text-zinc-400 hover:text-gold transition-colors flex items-center gap-1">
                            Roadmap
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse border border-zinc-900 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                        </Link>
                        <Link to="/premium" className="relative group">
                            <span className="text-sm font-black text-gold hover:text-white transition-colors">PREMIUM</span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all group-hover:w-full"></span>
                        </Link>
                        <Link to="/services" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Services</Link>
                        <Link to="/guide" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
                            <IconHelpCircle size={14} className="text-gold" />
                            Guide
                        </Link>
                        <Link to="/community" className="text-sm font-bold text-zinc-400 hover:text-gold transition-colors flex items-center gap-2">
                            Communauté
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                            </span>
                        </Link>
                        <Link to="/about" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">À propos</Link>
                        <Link to="/ar-center" className="text-sm font-black text-gold hover:text-white transition-colors flex items-center gap-2">
                            <IconCenterLogo size={18} className="text-gold group-hover:text-white" />
                            Centre AR
                        </Link>
                        {/* Lien Admin masqué — accès direct uniquement via URL sécurisée */}
                    </div>

                    {/* Hamburger & Search Mobile Toggle */}
                    <div className={`md:hidden flex items-center gap-2 transition-all duration-300 ${isMobileSearchOpen ? 'opacity-0 translate-x-10' : 'opacity-100'}`}>
                        {settings?.section_visibility?.global_search !== false && (
                            <button
                                onClick={() => setIsMobileSearchOpen(true)}
                                className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl text-zinc-400"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>



            {/* Menu Mobile */}
            {isMenuOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-zinc-800 p-6 space-y-4 animate-fade-in">
                    <div className="mb-6 relative z-50">
                        <SmartSearch
                            onSearch={(term) => {
                                setSearchQuery(term)
                                if (term.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(term)}`)
                                    setIsMenuOpen(false)
                                }
                            }}
                            placeholder="Rechercher..."
                            context="global"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center font-bold text-zinc-300 text-sm justify-center" onClick={() => setIsMenuOpen(false)}><IconHome size={14} /> Accueil</Link>
                        <Link to="/store" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center font-bold text-zinc-300 text-sm justify-center" onClick={() => setIsMenuOpen(false)}><IconGrid size={14} strokeWidth={2} /> Store</Link>
                        <Link to="/categories" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center font-bold text-zinc-300 text-sm justify-center" onClick={() => setIsMenuOpen(false)}><IconFolder size={14} /> Catégories</Link>
                        <Link to="/premium" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-gold/20 text-center font-bold text-gold text-sm justify-center" onClick={() => setIsMenuOpen(false)}><IconShield size={14} strokeWidth={2} /> Premium</Link>
                        <Link to="/services" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center font-bold text-zinc-300 text-sm justify-center" onClick={() => setIsMenuOpen(false)}><IconBriefcase size={14} strokeWidth={2} /> Services</Link>
                        <Link to="/community" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-gold/20 text-center font-bold text-gold text-sm justify-center" onClick={() => setIsMenuOpen(false)}>
                            <IconMegaphone size={14} /> Communauté
                        </Link>
                        <Link to="/about" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center font-bold text-zinc-300 text-sm justify-center" onClick={() => setIsMenuOpen(false)}><IconGlobe size={14} strokeWidth={2} /> À propos</Link>
                        <Link to="/guide" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-gold/20 text-center font-bold text-gold text-sm justify-center" onClick={() => setIsMenuOpen(false)}><IconHelpCircle size={14} /> Guide & Aide</Link>
                        <Link to="/ar-center" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-gold/20 text-center font-bold text-gold text-sm justify-center col-span-2" onClick={() => setIsMenuOpen(false)}>
                            <IconCenterLogo size={16} /> Centre AR
                        </Link>
                        <Link to="/roadmap" className="flex items-center gap-2 bg-zinc-900 p-3 rounded-2xl border border-zinc-800 text-center font-bold text-gold text-sm justify-center col-span-2" onClick={() => setIsMenuOpen(false)}>
                            <IconSparkle size={14} className="text-gold" /> Roadmap Vision 2026
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse border border-zinc-900 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
