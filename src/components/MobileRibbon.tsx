import React, { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    IconGrid,
    IconPlus,
    IconPackage,
    IconBriefcase,
    IconClock,
    IconArrowLeft,
    IconArrowRight,
    IconUsers,
    IconSparkle
} from './Icons'

export default function MobileRibbon() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const location = useLocation()

    const navItems = [
        { label: 'ACCUEIL', path: '/', icon: <IconGrid size={24} /> },
        { label: 'CENTRE', path: '/ar-center', icon: <IconSparkle size={24} className="text-gold" /> },
        { label: 'STORE', path: '/store', icon: <IconPackage size={24} /> },
        { label: 'SERVICES', path: '/services', icon: <IconBriefcase size={24} /> },
        { label: 'COMMUNAUTÉ', path: '/community', icon: <IconUsers size={24} /> },
        { label: 'BOUTIQUE', path: '/categories', icon: <IconGrid size={24} /> },
        { label: 'HISTORIQUE', path: '/roadmap', icon: <IconClock size={24} /> },
    ]

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 150
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden bg-zinc-900/80 backdrop-blur-2xl border-t border-zinc-800 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="relative flex items-center px-2">

                {/* Scroll Left */}
                <button
                    onClick={() => scroll('left')}
                    className="flex-shrink-0 w-8 h-12 flex items-center justify-center text-zinc-500 hover:text-white"
                >
                    <IconArrowLeft size={16} />
                </button>

                {/* Scrollable Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 flex overflow-x-auto scrollbar-none py-2 gap-4 scroll-smooth"
                >
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 min-w-[70px] transition-all ${isActive ? 'text-gold' : 'text-zinc-500'}`}
                            >
                                <div className={`p-2 rounded-xl ${isActive ? 'bg-gold/10' : ''}`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>

                {/* Scroll Right */}
                <button
                    onClick={() => scroll('right')}
                    className="flex-shrink-0 w-8 h-12 flex items-center justify-center text-zinc-500 hover:text-white"
                >
                    <IconArrowRight size={16} />
                </button>

            </div>
        </div>
    )
}
