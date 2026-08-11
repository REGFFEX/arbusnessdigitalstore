import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../services/products'
import { IconArrowRight } from './Icons'

import logo from '../assets/logos/digital_store.png'

interface Slide {
    id: string | null
    image: string
    title: string
    subtitle: string
    productId?: string
    color: string
}

interface BannerProps {
    size?: 'large' | 'medium' | 'small' | 'adaptive' | 'gros' | 'moyen'
}

export default function StoreBanner({ size = 'large' }: BannerProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [slides, setSlides] = useState<Slide[]>([])
    const navigate = useNavigate()

    // Configuration des styles selon la taille
    const getContainerStyles = () => {
        switch (size) {
            case 'moyen':
            case 'medium':
                return 'aspect-[3/1] sm:aspect-[4/1] md:aspect-[5/1] lg:h-[180px]' // Réduit à ~50% du Gros
            case 'small':
                return 'aspect-[4/1] sm:aspect-[5/1] md:aspect-[6/1] lg:h-[150px]'
            case 'adaptive':
                return 'w-full h-auto min-h-[120px] max-h-[220px]'
            case 'gros':
            case 'large':
            default:
                return 'aspect-[2.2/1] sm:aspect-[3.2/1] md:aspect-[4.2/1] lg:h-[350px]'
        }
    }

    const getContentStyles = () => {
        switch (size) {
            case 'small':
            case 'adaptive':
                return 'p-4 sm:p-6 md:p-8 max-w-xl'
            default:
                return 'p-6 sm:p-10 md:p-14 max-w-2xl'
        }
    }

    const getTitleStyles = () => {
        switch (size) {
            case 'small':
            case 'adaptive':
                return 'text-lg sm:text-2xl md:text-3xl mb-1'
            case 'medium':
                return 'text-xl sm:text-3xl md:text-4xl mb-1.5'
            default:
                return 'text-2xl sm:text-4xl md:text-5xl mb-2'
        }
    }

    useEffect(() => {
        loadFeaturedSlides()
    }, [])

    async function loadFeaturedSlides() {
        try {
            const products = await getProducts()
            if (products && products.length > 0) {
                const featured = products.slice(0, 3)
                setSlides(
                    featured.map((p: any) => ({
                        id: p.id,
                        image: p.image || logo,
                        title: p.name,
                        subtitle: p.short_desc || 'Découvrez ce produit exclusif sur AR Business Digital Store.',
                        productId: p.id,
                        color: 'from-zinc-900'
                    }))
                )
            } else {
                setSlides([
                    {
                        id: null,
                        image: logo,
                        title: 'AR Business Store',
                        subtitle: 'Le catalogue digital de référence au Congo.',
                        color: 'from-zinc-900'
                    },
                    {
                        id: null,
                        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
                        title: 'Votre Pôle Digital',
                        subtitle: 'Des outils puissants pour booster votre business.',
                        color: 'from-blue-900'
                    }
                ])
            }
        } catch {
            setSlides([
                {
                    id: null,
                    image: logo,
                    title: 'AR Business Store',
                    subtitle: 'Le catalogue digital de référence.',
                    color: 'from-zinc-900'
                }
            ])
        }
    }


    useEffect(() => {
        if (slides.length <= 1) return
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [slides])

    const handleSlideClick = (slide: Slide) => {
        if (slide.productId) {
            navigate(`/product/${slide.productId}`)
        } else {
            navigate('/coming-soon')
        }
    }

    if (slides.length === 0) return null

    return (
        <div className={`relative w-full overflow-hidden rounded-3xl mb-8 group ${getContainerStyles()}`}>

            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    onClick={() => handleSlideClick(slide)}
                >
                    <img
                        src={slide.image}
                        className="w-full h-full object-cover"
                        alt={slide.title}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80'
                        }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent opacity-80`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                    {/* Content */}
                    <div className={`absolute bottom-0 left-0 ${getContentStyles()}`}>
                        <div className="flex flex-col items-start gap-4">
                            {/* Optionnel: Bouton Voir Tout uniquement pour Gros */}
                            {(size === 'large' || size === 'gros') && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate('/store') }}
                                    className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white hover:text-black transition-all shadow-lg hover:shadow-white/10"
                                >
                                    Voir Tout
                                </button>
                            )}

                            <div>
                                <span className={`inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg font-bold text-white uppercase mb-2 ${size === 'small' ? 'text-[8px]' : 'text-[10px]'}`}>
                                    {slide.productId ? 'À la une' : 'Bientôt'}
                                </span>
                                <h2 className={`${getTitleStyles()} font-black text-white leading-tight tracking-tight drop-shadow-xl`}>
                                    {slide.title}
                                </h2>
                                {size !== 'small' && size !== 'adaptive' && (
                                    <p className="text-zinc-200 text-xs sm:text-sm md:text-base font-medium mb-4 sm:mb-6 line-clamp-2 max-w-lg drop-shadow-md">
                                        {slide.subtitle}
                                    </p>
                                )}

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSlideClick(slide) }}
                                    className={`inline-flex items-center gap-2 bg-white text-black rounded-xl font-bold transition-transform shadow-lg hover:scale-105 ${size === 'small' ? 'px-3 py-1.5 text-[10px]' : 'px-5 py-2.5 sm:px-6 sm:py-3 text-sm'}`}
                                >
                                    {slide.productId ? 'Découvrir' : 'Détails'}
                                    <IconArrowRight size={size === 'small' ? 12 : 16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Indicators */}
            {slides.length > 1 && (
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex gap-2 pointer-events-auto">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(index) }}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6 sm:w-8' : 'bg-white/30 w-2 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
