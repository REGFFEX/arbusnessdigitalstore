import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/products'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import StoreBanner from '../components/StoreBanner'
import { IconArrowRight, IconArrowLeft } from '../components/Icons'
import { useSettings } from '../hooks/useSettings'

export default function StoreSections() {
    const { settings } = useSettings()
    const [topApps, setTopApps] = useState<any[]>([])
    const [recentProducts, setRecentProducts] = useState<any[]>([])
    const [newProducts, setNewProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

    // Refs for carousels navigation
    const topAppsRef = useRef<HTMLDivElement>(null)
    const recentRef = useRef<HTMLDivElement>(null)
    const newRef = useRef<HTMLDivElement>(null)

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
    }

    const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = ref.current.clientWidth * 0.8
            ref.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    useEffect(() => {
        setLoading(true)
        getProducts()
            .then((allProducts) => {
                setTopApps((allProducts || []).filter((p: any) => p.placements?.includes('top_rated')))
                setRecentProducts((allProducts || []).filter((p: any) => p.placements?.includes('new')))
                setNewProducts((allProducts || []).filter((p: any) => p.placements?.includes('new')))
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false))
    }, [])

    const NavButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`
                hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10
                w-12 h-12 items-center justify-center
                bg-gold text-black rounded-full shadow-xl shadow-gold/20
                hover:scale-110 active:scale-95 transition-all duration-300
                border-2 border-black/20 group/btn
                ${direction === 'left' ? '-left-6' : '-right-6'}
            `}
        >
            <IconArrowRight
                size={20}
                strokeWidth={3}
                className={`transition-transform duration-300 ${direction === 'left' ? 'rotate-180 group-hover/btn:-translate-x-0.5' : 'group-hover/btn:translate-x-0.5'}`}
            />
        </button>
    )

    return (
        <div className="space-y-16">
            {/* Les mieux notés */}
            <section className="relative group/section">
                <div className="flex items-center justify-between mb-6 px-1">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gold rounded-full" />
                            LES MIEUX <span className="text-gold">NOTÉS</span>
                        </h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5 ml-3">Approuvés par la communauté</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Scroll Buttons for All Devices */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scroll(topAppsRef, 'left')}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold/50 transition-all hover:scale-110 active:scale-95 shadow-lg group"
                                title="Précédent"
                            >
                                <IconArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <button
                                onClick={() => scroll(topAppsRef, 'right')}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold/50 transition-all hover:scale-110 active:scale-95 shadow-lg group"
                                title="Suivant"
                            >
                                <IconArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                        <button
                            onClick={() => toggleSection('top_rated')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-gold transition-all"
                        >
                            {expandedSections['top_rated'] ? 'Réduire ↑' : 'Voir Tout →'}
                        </button>
                    </div>
                </div>

                {!expandedSections['top_rated'] && (
                    <>
                        <NavButton direction="left" onClick={() => scroll(topAppsRef, 'left')} />
                        <NavButton direction="right" onClick={() => scroll(topAppsRef, 'right')} />
                    </>
                )}

                {loading ? (
                    <div className="flex sm:grid overflow-x-auto sm:overflow-visible gap-4 pb-4 sm:pb-0 scrollbar-none snap-x px-4 sm:px-0 sm:grid-cols-4">
                        <Loader type="card" count={4} />
                    </div>
                ) : (
                    <div
                        ref={topAppsRef}
                        className={`
                            ${expandedSections['top_rated']
                                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500'
                                : 'flex overflow-x-auto pb-4 sm:pb-2'} 
                            gap-4 lg:gap-6 scrollbar-none snap-x px-4 sm:px-0 transition-all duration-700 ease-in-out
                        `}
                    >
                        {topApps.slice(0, expandedSections['top_rated'] ? 40 : 12).map((product) => (
                            <div key={product.id} className={`${expandedSections['top_rated'] ? 'w-full' : 'min-w-[170px] sm:min-w-[280px]'} flex-shrink-0 snap-start transition-all`}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* AD BANNER 1 */}
            <div className="px-4 sm:px-0">
                <StoreBanner />
            </div>

            {/* Plus récents - Style Hub Carrousel */}
            <section className="relative group/section">
                {/* Header avec bouton "Voir Tout" dynamique */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gold rounded-full" />
                            {settings.store_titles?.hero_title ? (
                                <>
                                    {settings.store_titles.hero_title.split(' ').map((word: string, i: number, arr: string[]) => (
                                        <span key={i} className={i === arr.length - 1 ? 'text-gold' : ''}>
                                            {word}{' '}
                                        </span>
                                    ))}
                                </>
                            ) : (
                                <>TOP <span className="text-gold">RATED</span></>
                            )}
                        </h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5 ml-3">Derniers ajouts</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Scroll Buttons for All Devices */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scroll(recentRef, 'left')}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold/50 transition-all hover:scale-110 active:scale-95 shadow-lg group"
                                title="Précédent"
                            >
                                <IconArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>
                            <button
                                onClick={() => scroll(recentRef, 'right')}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold/50 transition-all hover:scale-110 active:scale-95 shadow-lg group"
                                title="Suivant"
                            >
                                <IconArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                        <button
                            onClick={() => toggleSection('recent')}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-gold transition-all"
                        >
                            {expandedSections['recent'] ? 'Réduire ↑' : 'Voir Tout →'}
                        </button>
                    </div>
                </div>

                {!expandedSections['recent'] && (
                    <>
                        <NavButton direction="left" onClick={() => scroll(recentRef, 'left')} />
                        <NavButton direction="right" onClick={() => scroll(recentRef, 'right')} />
                    </>
                )}

                {loading ? (
                    <div className="flex sm:grid overflow-x-auto sm:overflow-visible gap-4 pb-4 sm:pb-0 scrollbar-none snap-x px-4 sm:px-0 sm:grid-cols-4">
                        <Loader type="card" count={4} />
                    </div>
                ) : (
                    <div
                        ref={recentRef}
                        className={`
                            ${expandedSections['recent']
                                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500'
                                : 'flex overflow-x-auto pb-4 sm:pb-2'} 
                            gap-4 lg:gap-6 scrollbar-none snap-x px-4 sm:px-0 transition-all duration-700 ease-in-out
                        `}
                    >
                        {recentProducts.slice(0, expandedSections['recent'] ? 40 : 12).map((product) => (
                            <div key={product.id} className={`${expandedSections['recent'] ? 'w-full' : 'min-w-[170px] sm:min-w-[280px]'} flex-shrink-0 snap-start transition-all`}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* AD BANNER 2 */}
            <div className="px-4 sm:px-0 opacity-80 hover:opacity-100 transition-opacity">
                <StoreBanner />
            </div>

            {/* Nouveautés - Style Hub Carrousel */}
            {newProducts.length > 0 && (
                <section className="relative group/section">
                    <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">
                                <span className="text-gold">Nouveautés</span>
                            </h2>
                            <p className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 italic">Récemment lancés</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Scroll Buttons for All Devices */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => scroll(newRef, 'left')}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold/50 transition-all hover:scale-110 active:scale-95 shadow-lg group"
                                    title="Précédent"
                                >
                                    <IconArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={() => scroll(newRef, 'right')}
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-gold/50 transition-all hover:scale-110 active:scale-95 shadow-lg group"
                                    title="Suivant"
                                >
                                    <IconArrowRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                            <button
                                onClick={() => toggleSection('new')}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-gold transition-all"
                            >
                                {expandedSections['new'] ? 'Réduire ↑' : 'Voir Tout →'}
                            </button>
                        </div>
                    </div>

                    {!expandedSections['new'] && (
                        <>
                            <NavButton direction="left" onClick={() => scroll(newRef, 'left')} />
                            <NavButton direction="right" onClick={() => scroll(newRef, 'right')} />
                        </>
                    )}

                    <div
                        ref={newRef}
                        className={`
                            ${expandedSections['new']
                                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500'
                                : 'flex overflow-x-auto pb-4 sm:pb-2'} 
                            gap-4 lg:gap-6 scrollbar-none snap-x px-4 sm:px-0 transition-all duration-700 ease-in-out
                        `}
                    >
                        {newProducts.slice(0, expandedSections['new'] ? 40 : 12).map((product) => (
                            <div key={product.id} className={`${expandedSections['new'] ? 'w-full' : 'min-w-[170px] sm:min-w-[280px]'} flex-shrink-0 snap-start transition-all`}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
