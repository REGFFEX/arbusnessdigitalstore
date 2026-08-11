import React, { useEffect, useState } from 'react'
import { getProducts } from '../services/products'
import ProductGrid from '../components/ProductGrid'
import SmartSearch from '../components/SmartSearch'
import StoreBanner from '../components/StoreBanner'
import { SiteNavFooter } from '../components/SiteNav'
import {
  IconGrid,
  IconBox,
  IconHeart,
  IconArrowLeft,
  CATEGORY_ICONS,
  PLACEMENT_ICONS
} from '../components/Icons'
import { PLACEMENTS, CATEGORIES_CONFIG } from '../config/categories'
import HorizontalShelf from '../components/HorizontalShelf'
import { getWishlist } from '../utils/wishlist'

// All top-level category labels (order matters)
const TOP_CATEGORIES = ['Application', 'Logiciel', 'Jeu', 'Formation', 'Outil', 'Ressource', 'Service']

export default function Store() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterSubtype, setFilterSubtype] = useState('Tous')
  const [showWishlist, setShowWishlist] = useState(false)

  useEffect(() => {
    loadProducts()
    const handleWishlistUpdate = () => {
      // Refresh filtered list if showing wishlist
      if (showWishlist) {
        setProducts(prev => [...prev])
      }
    }
    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate)
  }, [showWishlist])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await getProducts({ limit: 200 })
      if (data) setProducts(data)
    } catch (e) {
      console.error('Error fetching products:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (cat: string) => {
    setFilterCategory(cat)
    setShowWishlist(false)
    setFilterSubtype('Tous')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleWishlistFilter = () => {
    setShowWishlist(!showWishlist)
    setFilterCategory('All')
    setFilterSubtype('Tous')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Config for current category's subtypes
  const activeConfig = filterCategory !== 'All' ? (CATEGORIES_CONFIG as any)[filterCategory] : null
  const subtypeOptions: string[] = activeConfig?.subtypes || []

  // Main filter
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())

    if (showWishlist) {
      const wishlist = getWishlist()
      return matchesSearch && wishlist.some(item => item.id === p.id)
    }

    const matchesCategory = filterCategory === 'All' || p.type === filterCategory
    const matchesSubtype = filterSubtype === 'Tous' || p.subtype === filterSubtype
    return matchesSearch && matchesCategory && matchesSubtype
  })

  // Group products by category for the home view
  const productsByCategory = TOP_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.type === cat)
    return acc
  }, {} as Record<string, any[]>)

  const isHome = !searchTerm && filterCategory === 'All' && !showWishlist

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

        {/* Header Banner */}
        {isHome && <StoreBanner />}

        {/* Recherche Smart */}
        <div className={`max-w-2xl mx-auto mb-8 relative z-20 ${isHome ? '-mt-10' : 'mt-4'}`}>
          <SmartSearch
            onSearch={setSearchTerm}
            context="store"
            placeholder="Rechercher une application, un logiciel, une formation..."
            defaultSuggestions={['Programmation', 'E-Commerce', 'Action', 'Design', 'Marketing']}
          />
        </div>

        {/* ── FILTRES CATÉGORIES PRINCIPALES ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3 sticky top-0 z-30 bg-black/80 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => handleCategoryChange('All')}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold border transition-all flex-shrink-0 ${filterCategory === 'All' && !showWishlist
              ? 'bg-gold text-black border-gold shadow-lg shadow-gold/20'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
          >
            <IconGrid size={16} /> Tout voir
          </button>

          <button
            onClick={toggleWishlistFilter}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold border transition-all flex-shrink-0 ${showWishlist
              ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
          >
            <IconHeart size={16} fill={showWishlist ? 'currentColor' : 'none'} className={showWishlist ? 'animate-pulse' : ''} /> Favoris
          </button>

          {TOP_CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat] || IconBox
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold border transition-all flex-shrink-0 ${filterCategory === cat
                  ? 'bg-gold text-black border-gold shadow-lg shadow-gold/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} /> {cat}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── FILTRES SOUS-TYPES (conditionnels) ── */}
        {filterCategory !== 'All' && subtypeOptions.length > 0 && !searchTerm && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
            <button
              onClick={() => setFilterSubtype('Tous')}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold border transition-all flex-shrink-0 ${filterSubtype === 'Tous'
                ? 'bg-white/10 text-white border-white/30'
                : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                }`}
            >
              Tous les modèles
            </button>
            {subtypeOptions.map(sub => (
              <button
                key={sub}
                onClick={() => setFilterSubtype(sub)}
                className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold border transition-all flex-shrink-0 ${filterSubtype === sub
                  ? 'bg-white/10 text-white border-white/30'
                  : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* ── SECTIONS PAR CATÉGORIE (Home View) ── */}
        {isHome && (
          <div className="space-y-12 mb-16">
            {/* ── SECTIONS PAR PLACEMENTS (Collections) ── */}
            {PLACEMENTS.map((pl) => {
              const shelfProducts = products.filter(p => p.placements?.includes(pl.id))
              if (shelfProducts.length === 0) return null

              const Icon = PLACEMENT_ICONS[pl.id] || IconBox

              return (
                <HorizontalShelf
                  key={pl.id}
                  title={pl.label}
                  products={shelfProducts}
                  icon={<Icon size={18} className="text-gold" />}
                />
              )
            })}

            {/* Main Categories Rows */}
            {TOP_CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat] || IconBox
              return (
                <HorizontalShelf
                  key={cat}
                  title={cat}
                  products={productsByCategory[cat]?.slice(0, 10) || []}
                  icon={<Icon size={18} />}
                  onSeeAll={() => handleCategoryChange(cat)}
                />
              )
            })}
          </div>
        )}

        {/* ── CATALOGUE COMPLET / SEARCH RESULTS ── */}
        <section className={`${isHome ? 'mt-20 border-t border-zinc-900 pt-16' : ''}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="bg-gold w-2 h-6 rounded-full" />
              <h2 className="text-xl font-black text-white">
                {searchTerm
                  ? 'Résultats de recherche'
                  : showWishlist
                    ? 'Mes Favoris'
                    : filterCategory !== 'All'
                      ? `${filterCategory}${filterSubtype !== 'Tous' ? ` · ${filterSubtype}` : ''}`
                      : 'Tout le catalogue'}
              </h2>
              {!loading && (
                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest bg-zinc-900/50 px-2 py-1 rounded-lg">
                  {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {(filterCategory !== 'All' || showWishlist) && !searchTerm && (
              <button
                onClick={() => { handleCategoryChange('All'); setShowWishlist(false) }}
                className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors"
              >
                <IconArrowLeft size={12} /> Retour
              </button>
            )}
          </div>

          <ProductGrid products={filteredProducts} loading={loading} />

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
              <p className="text-zinc-500 text-lg">
                {showWishlist ? 'Votre liste de favoris est vide.' : 'Aucun produit ne correspond à vos critères.'}
              </p>
              <button
                onClick={() => { setSearchTerm(''); handleCategoryChange('All'); setShowWishlist(false) }}
                className="mt-4 text-gold hover:underline font-bold text-sm"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>

      </div>
      <SiteNavFooter />
    </div>
  )
}
