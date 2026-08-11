import React, { useRef } from 'react'
import ProductCard from './ProductCard'
import { IconArrowLeft, IconArrowRight } from './Icons'
import { Link } from 'react-router-dom'

interface HorizontalShelfProps {
    title: string
    products: any[]
    icon?: React.ReactNode
    onSeeAll?: () => void
    viewAllLink?: string
}

export default function HorizontalShelf({
    title,
    products,
    icon,
    onSeeAll,
    viewAllLink
}: HorizontalShelfProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeftArrow, setShowLeftArrow] = React.useState(false)
    const [showRightArrow, setShowRightArrow] = React.useState(false)

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeftArrow(scrollLeft > 10)
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
        }
    }

    React.useEffect(() => {
        const el = scrollRef.current
        if (el) {
            checkScroll()
            el.addEventListener('scroll', checkScroll)
            window.addEventListener('resize', checkScroll)
            // Initial check after content might have loaded
            const timer = setTimeout(checkScroll, 500)
            return () => {
                el.removeEventListener('scroll', checkScroll)
                window.removeEventListener('resize', checkScroll)
                clearTimeout(timer)
            }
        }
    }, [products])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth * 0.8
                : scrollLeft + clientWidth * 0.8

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
        }
    }

    if (products.length === 0) return null

    return (
        <section className="mb-10 relative group">
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {icon && <span className="text-gold">{icon}</span>}
                    {title}
                </h2>

                {viewAllLink ? (
                    <Link
                        to={viewAllLink}
                        className="text-[10px] font-black text-zinc-500 hover:text-gold uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                        Tout voir <IconArrowRight size={10} strokeWidth={3} />
                    </Link>
                ) : onSeeAll && (
                    <button
                        onClick={onSeeAll}
                        className="text-[10px] font-black text-zinc-500 hover:text-gold uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                        Tout voir <IconArrowRight size={10} strokeWidth={3} />
                    </button>
                )}
            </div>

            <div className="relative">
                {/* Navigation Arrows (Universal with touch support logic) */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/80 backdrop-blur border border-zinc-700 rounded-full text-white shadow-xl transition-all hover:bg-gold hover:text-black hover:border-gold active:scale-95 flex items-center justify-center group/btn animate-in fade-in zoom-in duration-300"
                    >
                        <IconArrowLeft size={18} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory"
                >
                    {products.map(p => (
                        <div key={p.id} className="min-w-[150px] w-[150px] sm:min-w-[200px] sm:w-[200px] flex-shrink-0 snap-start">
                            <ProductCard product={p} />
                        </div>
                    ))}

                    {/* Final "See More" Card */}
                    <div className="min-w-[150px] w-[150px] sm:min-w-[200px] sm:w-[200px] flex-shrink-0 snap-start">
                        <button
                            onClick={onSeeAll}
                            className="w-full aspect-[4/5] bg-zinc-900/60 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-gold/50 group/more transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center group-hover/more:bg-gold group-hover/more:text-black transition-colors">
                                <IconArrowRight size={20} />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/more:text-white">Explorer Tout</span>
                        </button>
                    </div>
                </div>

                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/80 backdrop-blur border border-zinc-700 rounded-full text-white shadow-xl transition-all hover:bg-gold hover:text-black hover:border-gold active:scale-95 flex items-center justify-center group/btn animate-in fade-in zoom-in duration-300"
                    >
                        <IconArrowRight size={18} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                )}
            </div>
        </section>
    )
}
