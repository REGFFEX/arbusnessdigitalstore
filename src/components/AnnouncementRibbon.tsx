import React from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { IconSparkle } from './Icons'

export default function AnnouncementRibbon() {
    const { settings, loading } = useSettings()
    const location = useLocation()

    if (loading) return null
    if (!settings.ribbon_enabled) return null

    // Path-specific check
    const isTargetPage = (settings.ribbon_targets || []).includes(location.pathname)
    if (!isTargetPage) return null

    return (
        <div className="relative bg-gold overflow-hidden py-2 select-none border-b border-black/10">
            {/* Desktop Marquee */}
            <div className="hidden lg:flex whitespace-nowrap animate-marquee items-center gap-8">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <span className="text-black font-black text-xs uppercase tracking-[0.2em]">
                            {settings.ribbon_text_desktop}
                        </span>
                        <IconSparkle size={14} className="text-black/40 rotate-12" />
                    </div>
                ))}
            </div>

            {/* Mobile Marquee (different text, usually shorter) */}
            <div className="lg:hidden flex whitespace-nowrap animate-marquee-fast items-center gap-6">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-black font-black text-[10px] uppercase tracking-widest">
                            {settings.ribbon_text_mobile}
                        </span>
                        <IconSparkle size={12} className="text-black/30" />
                    </div>
                ))}
            </div>
        </div>
    )
}
