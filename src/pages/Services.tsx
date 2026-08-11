import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import { IconCheck, IconGlobe, IconArrowRight } from '../components/Icons'
import { getServices } from '../services/servicesApi'
import { Service } from '../types/database'

import ServiceCard from '../components/ServiceCard'

import { useSettings } from '../hooks/useSettings'

// ── Page Services ─────────────────────────────────────────────────────────────
export default function Services() {
    const { settings } = useSettings()
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        getServices()
            .then(data => {
                setServices(data as Service[])
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    // Mobile : afficher 3 services par défaut, "Voir plus" pour le reste
    const displayedServices = showAll ? services : services.slice(0, 3)
    const hasMore = services.length > 3

    return (
        <div className="min-h-screen bg-black pt-20">
            {/* Header */}
            <div className="border-b border-zinc-900 pt-4 pb-6 sm:pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-1">AR Business Digital Store</p>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter">
                                {settings.site_content?.services?.header?.title || settings.store_titles?.services_title ? (
                                    <>
                                        {(settings.site_content?.services?.header?.title || settings.store_titles.services_title).split(' ').map((word: string, i: number, arr: string[]) => (
                                            <span key={i} className={i === arr.length - 1 ? 'text-gold' : ''}>
                                                {word}{' '}
                                            </span>
                                        ))}
                                    </>
                                ) : (
                                    <>NOS <span className="text-gold">SERVICES</span></>
                                )}
                            </h1>
                            <p className="text-zinc-500 text-xs sm:text-sm mt-1">{settings.site_content?.services?.header?.subtitle || "Solutions B2B personnalisées"}</p>
                        </div>
                        <SiteNavBar />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-zinc-900/50 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : services.length > 0 ? (
                    <>
                        {/* Header Section for Controls */}
                        <div className="flex items-center justify-between mb-8 sm:hidden">
                            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                                SERVICES <span className="text-gold">DISPONIBLES</span>
                            </h2>
                            {hasMore && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-gold"
                                >
                                    {showAll ? 'Réduire ↑' : 'Voir Tout →'}
                                </button>
                            )}
                        </div>

                        {/* Responsive Layout: Carrousel on mobile (default) / Grid on desktop or when expanded */}
                        <div className={`
                            ${showAll ? 'grid grid-cols-2' : 'flex sm:grid overflow-x-auto sm:overflow-visible'} 
                            sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 scrollbar-none snap-x px-0
                        `}>
                            {displayedServices.map((service) => (
                                <div key={service.id} className={`${showAll ? '' : 'min-w-[160px] sm:min-w-0'} flex-shrink-0 snap-start`}>
                                    <ServiceCard service={service} />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-zinc-500">Aucun service disponible pour le moment.</p>
                    </div>
                )}

                {/* CTA */}
                <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">Besoin d'un service personnalisé ?</h2>
                    <p className="text-zinc-500 mb-6 sm:mb-8 text-xs sm:text-sm max-w-xl mx-auto">Contactez-nous pour discuter de votre projet. Notre équipe est disponible pour vous accompagner.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link to="/about" className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gold text-black rounded-xl font-black text-sm hover:bg-yellow-400 transition-all">
                            <IconGlobe size={14} strokeWidth={2} />
                            Nous contacter
                        </Link>
                        <Link to="/store" className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl font-black text-sm hover:border-zinc-600 transition-all">
                            Voir nos produits
                        </Link>
                        <Link to="/guide" className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl font-black text-sm hover:border-zinc-600 transition-all">
                            Guide d'utilisation
                        </Link>
                    </div>
                </section>
            </div>

            <SiteNavFooter />
        </div>
    )
}
