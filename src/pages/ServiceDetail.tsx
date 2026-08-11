import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import { getServiceById, getServices } from '../services/servicesApi'
import { Service } from '../types/database'
import { IconCheck, IconGlobe, IconArrowRight, IconUser, IconMessageCircle, IconExternalLink, IconArrowLeft } from '../components/Icons'
import ServiceCard from '../components/ServiceCard'
import { formatPriceFCFA, formatPriceUSD, formatPriceEUR } from '../utils/currency'

export default function ServiceDetail() {
    const { id } = useParams<{ id: string }>()
    const [service, setService] = useState<Service | null>(null)
    const [similarServices, setSimilarServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            setLoading(true)
            getServiceById(id)
                .then(data => {
                    setService(data as Service)
                    return getServices()
                })
                .then(allServices => {
                    if (allServices && id) {
                        const all = allServices as Service[]
                        const filtered = all.filter(s => s.id !== id)
                        const scored = filtered.map(s => {
                            let score = 0
                            if (s.type === (service?.type || '')) score += 10
                            return { ...s, score }
                        }).sort((a, b) => b.score - a.score)
                        setSimilarServices(scored.slice(0, 8))
                    }
                })
                .catch(err => {
                    console.error(err)
                })
                .finally(() => setLoading(false))
        }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="animate-pulse">Chargement du service...</div>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <h1 className="text-2xl font-black mb-4">Service introuvable</h1>
                <Link to="/services" className="px-6 py-2 bg-gold text-black rounded-xl font-bold">Retour aux services</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header Flottant / Glassmorphism */}
            <div className="sticky top-0 z-[100] bg-black/60 backdrop-blur-xl border-b border-zinc-900/50 px-4 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/services" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-gold transition-all">
                            <IconArrowRight size={16} className="rotate-180 text-zinc-500 group-hover:text-gold" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Retour</p>
                            <p className="text-xs font-black text-white uppercase tracking-tighter line-clamp-1">{service.name}</p>
                        </div>
                    </Link>
                    <SiteNavBar />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 lg:py-20 grid grid-cols-1 lg:grid-cols-[1fr,450px] gap-16 items-start">

                {/* Colonne Gauche : Storytelling & Features */}
                <div className="space-y-16">
                    {/* Hero Section */}
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-[8px] font-black uppercase tracking-[0.2em] rounded-full">
                                    {service.type || 'Service Digital'}
                                </span>
                                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AR BUSINESS LAB</span>
                            </div>
                            <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                                {service.name}
                            </h1>
                            <div className="flex flex-col gap-1 mt-6 border-l-2 border-gold/30 pl-6">
                                {(() => {
                                    const config = (service as any).display_config || { show_usd: true, show_fcfa: true, show_eur: true };
                                    const display = [];
                                    if (config.show_fcfa) display.push(formatPriceFCFA(service.price_fcfa || (service.price * 650)));
                                    if (config.show_usd) display.push(formatPriceUSD(service.price));
                                    if (config.show_eur) display.push(formatPriceEUR((service as any).price_eur || (service.price * 0.92)));

                                    return display.map((p, i) => (
                                        <p key={i} className={`font-black text-gold ${i === 0 ? 'text-2xl sm:text-3xl' : 'text-xs sm:text-sm opacity-60 uppercase tracking-widest'}`}>{p}</p>
                                    ));
                                })()}
                            </div>
                        </div>

                        {service.image && (
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gold/5 blur-2xl rounded-[40px] opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative w-full aspect-[21/9] rounded-[40px] overflow-hidden border border-zinc-800/50 shadow-2xl">
                                    <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-10 bg-gold rounded-full" />
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Vision & Solution</h2>
                        </div>
                        <div className="text-zinc-400 text-lg sm:text-xl leading-relaxed font-medium whitespace-pre-wrap selection:bg-gold selection:text-black">
                            {service.long_description || service.description}
                        </div>
                    </div>

                    {/* Features Grid */}
                    {service.features && service.features.length > 0 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-10 bg-zinc-700 rounded-full" />
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Détails Techniques</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {service.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl hover:bg-zinc-900/60 hover:border-gold/20 transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <IconCheck className="text-gold" size={18} strokeWidth={3} />
                                        </div>
                                        <span className="text-zinc-200 font-black uppercase tracking-tight text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Colonne Droite : Le LAB & Contact (Sticky) */}
                <div className="lg:sticky lg:top-32 space-y-8">
                    {/* Le Lab responsible */}
                    <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[40px] p-8 sm:p-10 space-y-10 relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <IconUser size={120} />
                        </div>

                        <div className="space-y-6 relative">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <IconUser className="text-gold" size={20} />
                                Responsable du Lab
                            </h3>

                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold/20 to-zinc-900 border-2 border-gold/30 flex items-center justify-center text-4xl font-black text-gold shadow-2xl">
                                    {service.contact_manager?.charAt(0) || 'AR'}
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white leading-none mb-2">{service.contact_manager || 'Équipe AR Business'}</p>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full inline-block">Manager de Projet</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-zinc-800/50 relative">
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Canaux de commande</p>

                            {service.whatsapp_link && (
                                <a href={service.whatsapp_link} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-[#25D366] hover:bg-[#128C7E] text-white font-black rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-green-500/10 hover:scale-[1.02] active:scale-95">
                                    <IconMessageCircle size={20} strokeWidth={3} />
                                    COMMANDER SUR WHATSAPP
                                </a>
                            )}

                            {service.telegram_link && (
                                <a href={service.telegram_link} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-[#0088cc] hover:bg-[#0077b3] text-white font-black rounded-3xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0C5.353 0 0 5.35 0 11.944c0 6.591 5.353 11.944 11.944 11.944 6.591 0 11.944-5.353 11.944-11.944C23.888 5.35 18.535 0 11.944 0zM17.13 8.35c-.17 1.83-1.01 6.84-1.44 9.17-.18.98-.55 1.31-.91 1.34-1.22.11-2.15-.81-3.33-1.58-1.85-1.21-2.9-1.96-4.69-3.14-2.07-1.37-.73-2.12.45-3.35.31-.32 5.67-5.2 5.77-5.63.01-.05.02-.25-.13-.38-.15-.13-.37-.09-.53-.06-.23.05-3.87 2.46-10.93 7.22-.44.3-.84.45-1.19.44-.39-.01-1.13-.22-1.69-.4-0.68-.22-1.23-.34-1.18-.72.03-.2.3-.4.81-.61 3.16-1.37 5.27-2.28 6.33-2.73 6.03-2.54 7.28-2.98 8.1-2.99.18 0 .59.04.85.25.17.14.22.33.24.47.03.14.04.4.02.62z" /></svg>
                                    CONTACTER VIA TELEGRAM
                                </a>
                            )}

                            {service.external_link && (
                                <a href={service.external_link} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-3xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95">
                                    <IconExternalLink size={20} strokeWidth={3} />
                                    SITE OFFICIEL
                                </a>
                            )}

                            <Link to="/about" className="w-full py-5 border border-zinc-800 text-zinc-500 hover:border-gold hover:text-gold font-black rounded-3xl flex items-center justify-center gap-4 transition-all">
                                BESOIN D'INFOS ?
                            </Link>
                        </div>
                    </div>

                    {/* Trust Card */}
                    <div className="p-8 bg-gold/5 border border-gold/10 rounded-[40px] text-center space-y-4">
                        <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Qualité Garantie</p>
                        <p className="text-zinc-400 text-xs italic">Chaque service du LAB est supervisé directement par la direction de AR Business pour assurer une livraison premium.</p>
                    </div>
                </div>
            </div>

            {/* Section Services Similaires — Style Play Store 2026 */}
            {similarServices.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 py-20 border-t border-zinc-900">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter">
                                SERVICES <span className="text-gold">COMPLÉMENTAIRES</span>
                            </h2>
                            <p className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mt-2">D'autres solutions pour votre business</p>
                        </div>
                        <Link to="/services" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-gold transition-all">
                            VOIR TOUT →
                        </Link>
                    </div>

                    <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 scrollbar-none snap-x">
                        {similarServices.map(s => (
                            <div key={s.id} className="min-w-[200px] sm:min-w-[350px] flex-shrink-0 snap-start">
                                <ServiceCard service={s} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <SiteNavFooter />
        </div>
    )
}
