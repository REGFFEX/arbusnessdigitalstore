import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PRIMARY_TABS, isModuleActive } from './navModules'

// Barre flottante mobile en verre dépoli — toujours fixe, jamais de débordement.
export default function MobileTabBar() {
    const { pathname } = useLocation()

    const openModules = () => {
        window.dispatchEvent(new CustomEvent('ar:palette'))
    }

    return (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-[100] px-3 pb-[max(12px,env(safe-area-inset-bottom))] pointer-events-none">
            <nav
                aria-label="Navigation principale"
                className="pointer-events-auto mx-auto w-full max-w-[460px] rounded-[26px] border border-white/[0.09]
                    bg-[#0b0b0e]/70 backdrop-blur-2xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.95)]
                    grid grid-cols-5 items-end px-1.5 pt-1.5 pb-2"
            >
                {PRIMARY_TABS.map(tab => {
                    const Icon = tab.icon
                    const active = tab.path ? isModuleActive(pathname, tab.path) : false

                    if (tab.primary) {
                        return (
                            <Link
                                key={tab.label}
                                to={tab.path || '/'}
                                aria-current={active ? 'page' : undefined}
                                className="flex flex-col items-center -mt-6"
                            >
                                <span className={`w-[52px] h-[52px] rounded-[18px] flex items-center justify-center border transition-all duration-300 active:scale-95
                                    ${active
                                        ? 'bg-gold border-gold text-black shadow-[0_10px_28px_-6px_rgba(212,175,55,0.75)]'
                                        : 'bg-[#121216] border-gold/40 text-gold shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)]'}`}
                                >
                                    <Icon size={22} strokeWidth={2.2} />
                                </span>
                                <span className={`mt-1 text-[8px] font-black uppercase tracking-[0.12em] ${active ? 'text-gold' : 'text-zinc-500'}`}>
                                    {tab.label}
                                </span>
                            </Link>
                        )
                    }

                    if (!tab.path) {
                        return (
                            <button
                                key={tab.label}
                                onClick={openModules}
                                className="flex flex-col items-center justify-end gap-1 py-1 text-zinc-500 active:text-gold transition-colors"
                            >
                                <Icon size={20} strokeWidth={2} />
                                <span className="text-[8px] font-black uppercase tracking-[0.12em]">{tab.label}</span>
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={tab.label}
                            to={tab.path}
                            aria-current={active ? 'page' : undefined}
                            className={`flex flex-col items-center justify-end gap-1 py-1 transition-colors ${active ? 'text-gold' : 'text-zinc-500 active:text-white'}`}
                        >
                            <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                            <span className="text-[8px] font-black uppercase tracking-[0.12em]">{tab.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
