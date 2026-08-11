import React from 'react'
import { Link } from 'react-router-dom'
import { IconCheck, IconArrowRight } from './Icons'
import { Service } from '../types/database'
import { formatPriceFCFA, formatPriceUSD, formatPriceEUR } from '../utils/currency'

const ServiceIcons: Record<string, React.ReactNode> = {
    dev: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
    ),
    consulting: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    support: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
    ),
    cloud: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
    ),
    security: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    formation: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
}

const SERVICE_COLORS: Record<string, string> = {
    dev: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
    consulting: 'text-gold bg-gold/15 border-gold/30',
    support: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
    cloud: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    security: 'text-green-400 bg-green-500/15 border-green-500/30',
    formation: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
}

const SERVICE_GRADIENT: Record<string, string> = {
    dev: 'from-blue-900/40',
    consulting: 'from-yellow-900/40',
    support: 'from-orange-900/40',
    cloud: 'from-cyan-900/40',
    security: 'from-green-900/40',
    formation: 'from-purple-900/40',
}

export default function ServiceCard({ service }: { service: Service }) {
    const colorClass = SERVICE_COLORS[service.type || ''] || 'text-zinc-400 bg-zinc-800/30 border-zinc-700/30'
    const gradient = SERVICE_GRADIENT[service.type || ''] || 'from-zinc-900/40'
    const icon = ServiceIcons[service.type || '']

    return (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden group hover:border-gold/30 hover:bg-zinc-900/70 transition-all duration-300 flex flex-col h-full relative min-w-[160px] sm:min-w-0">

            {/* Top Badge for Service Type */}
            <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 z-20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border text-[7px] sm:text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${colorClass}`}>
                {service.type || 'Service'}
            </div>

            <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border text-[7px] sm:text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${service.source === 'EXTERNAL' ? 'border-white/10 bg-zinc-800/80 text-zinc-300' : 'border-gold/30 bg-gold/10 text-gold'}`}>
                {service.source === 'EXTERNAL' ? 'EXTERNE' : 'AR BUSINESS'}
            </div>

            <div className="relative aspect-square sm:aspect-[16/10] overflow-hidden">
                {service.image ? (
                    <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} via-zinc-900 to-zinc-950 flex items-center justify-center opacity-40`}>
                        <div className="scale-[1.5] sm:scale-[2] translate-y-2 opacity-20">
                            {icon}
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                {/* Floating Action Icon - Hidden on very small mobile for parity with product cards */}
                <div className={`absolute bottom-3 right-3 w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border flex items-center justify-center shadow-2xl z-20 ${colorClass} group-hover:rotate-12 transition-all duration-500 backdrop-blur-md`}>
                    <div className="scale-75 sm:scale-100">{icon}</div>
                </div>

                {/* PLUS D'INFOS Overlay Branding */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                    <span className="text-[10px] font-black text-white border border-white/30 px-3 py-1.5 rounded-full tracking-[0.2em] uppercase bg-black/50">
                        Plus d'infos
                    </span>
                </div>
            </div>

            <div className="p-3 sm:p-6 flex flex-col flex-1">
                <Link to={`/services/${service.id}`} className="group-hover:text-gold transition-colors inline-block mb-1 sm:mb-2 line-clamp-1">
                    <h3 className="text-xs sm:text-xl font-black text-white leading-tight uppercase italic tracking-tighter line-clamp-1">
                        {service.name}
                    </h3>
                </Link>

                <p className="text-zinc-500 text-[9px] sm:text-sm mb-3 shadow-zinc-950/20 leading-relaxed line-clamp-2 italic font-medium">
                    {service.description || 'Service professionnel AR Business.'}
                </p>

                {/* Unified Price Grid for Services */}
                <div className="mb-4 sm:mb-6">
                    <span className="text-[10px] sm:text-xs font-black text-gold uppercase tracking-tighter">
                        {service.monetization_type === 'free' ? 'Gratuit' : (
                            (service as any).monetization_type === 'ads' ? (((service as any).ads_video_count > 0) ? `${(service as any).ads_video_count} Vidéos` : 'Watch Ads') : (
                                (() => {
                                    const config = (service as any).display_config || { show_usd: true, show_fcfa: true, show_eur: true };
                                    const currentPrices = [];
                                    if (config.show_fcfa) currentPrices.push(formatPriceFCFA(service.price_fcfa || (service.price * 650)));
                                    if (config.show_usd) currentPrices.push(formatPriceUSD(service.price));
                                    if (config.show_eur) currentPrices.push(formatPriceEUR((service as any).price_eur || (service.price * 0.92)));
                                    return currentPrices.join(' • ');
                                })()
                            )
                        )}
                    </span>
                </div>

                {/* Features list - Desktop only for card parity */}
                {service.features && service.features.length > 0 && (
                    <div className="hidden sm:block space-y-2 mb-8 flex-1">
                        {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-xs text-zinc-400 gap-3 bg-zinc-800/20 p-2 rounded-xl border border-zinc-800/50">
                                <IconCheck size={14} className="text-gold shrink-0" strokeWidth={3} />
                                <span className="truncate font-black uppercase tracking-tight">{feature}</span>
                            </div>
                        ))}
                    </div>
                )}

                <Link
                    to={`/services/${service.id}`}
                    className="w-full py-2.5 sm:py-4 bg-zinc-800/50 hover:bg-gold hover:text-black border border-zinc-700 hover:border-gold text-white font-black rounded-xl sm:rounded-2xl transition-all text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 group/btn mt-auto"
                >
                    <span className="sm:inline hidden">VOIR PLUS</span>
                    <span className="sm:hidden inline">INFOS +</span>
                    <IconArrowRight size={10} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
