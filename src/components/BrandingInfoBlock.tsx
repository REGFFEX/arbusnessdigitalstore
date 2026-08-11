import React, { useState, useEffect, useRef } from 'react'
import { useBranding, BrandingMessage } from '../context/BrandingContext'
import { IconX, IconArrowRight, IconChevronDown, IconChevronUp, IconDownload, IconMapPin, IconInfoCircle, IconMessageCircle } from './Icons'

export default function BrandingInfoBlock() {
    const { isBrandingOpen, setIsBrandingOpen, brandingData } = useBranding()
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isBrandingOpen && brandingData.autoScroll && brandingData.messages.length > 1) {
            const interval = setInterval(() => {
                if (scrollRef.current) {
                    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
                    if (scrollTop + clientHeight >= scrollHeight - 5) {
                        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
                    } else {
                        scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' })
                    }
                }
            }, 3000)
            return () => clearInterval(interval)
        }
    }, [isBrandingOpen, brandingData.autoScroll, brandingData.messages])

    if (!isBrandingOpen) return null

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold">
                            <IconInfoCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight">
                                {brandingData.name}
                            </h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Official Information Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsBrandingOpen(false)}
                        className="bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-white transition-all hover:rotate-90"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800">

                    {/* Main Info Card */}
                    <div className="bg-black/40 rounded-[32px] border border-zinc-800 p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">À PROPOS DU PÔLE</label>
                            <p className="text-sm font-medium text-zinc-300 leading-relaxed italic">
                                {brandingData.description}
                            </p>
                        </div>

                        <div className="flex items-start gap-4 pt-4 border-t border-zinc-800/50">
                            <div className="p-2 bg-zinc-800/50 rounded-xl text-zinc-400">
                                <IconMapPin size={18} />
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">SITUATION GÉOGRAPHIQUE</label>
                                <p className="text-xs font-bold text-white mt-1">
                                    {brandingData.location}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconMessageCircle size={14} className="text-gold" />
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Messages Officiels & Documentation</h4>
                            </div>
                            <span className="text-[9px] bg-gold/10 text-gold px-2 py-1 rounded-md font-black">
                                {brandingData.messages.filter(m => m.active).length} ACTIFS
                            </span>
                        </div>

                        <div
                            ref={scrollRef}
                            className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-none"
                        >
                            {brandingData.messages.length > 0 ? (
                                brandingData.messages.filter(m => m.active).map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="bg-zinc-800/30 border border-zinc-800 rounded-2xl overflow-hidden transition-all"
                                    >
                                        <button
                                            onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                                            className="w-full p-5 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-all"
                                        >
                                            <span className="text-xs font-black text-white uppercase italic">{msg.title}</span>
                                            {expandedId === msg.id ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                        </button>

                                        {expandedId === msg.id && (
                                            <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-300">
                                                <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                                    {msg.content}
                                                </p>
                                                {msg.file_url && (
                                                    <a
                                                        href={msg.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-4 flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-widest hover:underline"
                                                    >
                                                        <IconDownload size={14} />
                                                        Télécharger le document associé
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">Aucun message officiel pour le moment</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-800 bg-black/40 flex items-center justify-between">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">AR BUSINESS DIGITAL STORE © 2026</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsBrandingOpen(false)}
                            className="px-6 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all"
                        >
                            Fermer le portail
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
