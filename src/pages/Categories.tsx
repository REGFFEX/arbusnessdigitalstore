import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../services/products'
import ProductCard from '../components/ProductCard'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import { IconSearch, IconX, IconGlobe, IconGrid, CATEGORY_ICONS, PLACEMENT_ICONS, MONETIZATION_ICONS } from '../components/Icons'
import { CATEGORIES_CONFIG, PLACEMENTS, OS_LIST, MONETIZATION_OPTIONS } from '../config/categories'



const OS_FILTERS = ['Tous', ...OS_LIST]
const PRICE_FILTERS = [
    { label: 'Tous les modèles', value: 'all' },
    ...MONETIZATION_OPTIONS.map(opt => ({
        label: opt.label,
        value: opt.value,
        icon: MONETIZATION_ICONS[opt.value]
    }))
]
const SORT_OPTIONS = [
    { label: 'Plus récents', value: 'recent' },
    { label: 'A-Z', value: 'az' },
    { label: 'Prix croissant', value: 'price_asc' },
    { label: 'Prix décroissant', value: 'price_desc' },
]


export default function Categories() {
    const [searchParams, setSearchParams] = useSearchParams()
    const selectedCategory = searchParams.get('category') || ''

    const [allProducts, setAllProducts] = useState<any[]>([])
    const [filtered, setFiltered] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filtres
    const [search, setSearch] = useState('')
    const [selectedOS, setSelectedOS] = useState('Tous')
    const [selectedPrice, setSelectedPrice] = useState('all')
    const [sortBy, setSortBy] = useState('recent')
    const [showPremiumOnly, setShowPremiumOnly] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
    const [selectedPlacement, setSelectedPlacement] = useState<string[]>([])
    const [selectedSubType, setSelectedSubType] = useState('Tous')

    // Charger TOUS les produits et services une seule fois
    useEffect(() => {
        setLoading(true)
        Promise.all([
            getProducts({ limit: 500 }),
            import('../services/servicesApi').then(m => m.getServices())
        ])
            .then(([products, services]) => {
                const combined = [
                    ...(products || []).map((p: any) => ({ ...p, item_type: 'product' })),
                    ...(services || []).map((s: any) => ({ ...s, item_type: 'service' }))
                ]
                setAllProducts(combined)

                // Calcul des comptes par catégorie
                const counts: Record<string, number> = {}
                combined.forEach((p: any) => {
                    const typeValue = p.type || 'Inconnu'
                    const catKey = Object.keys(CATEGORIES_CONFIG).find(k => k.toLowerCase() === typeValue.toLowerCase()) || typeValue
                    counts[catKey] = (counts[catKey] || 0) + 1
                })
                setCategoryCounts(counts)
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false))
    }, [])

    // Trouver la config de la catégorie sélectionnée (case-insensitive)
    const activeCategoryKey = Object.keys(CATEGORIES_CONFIG).find(k => k.toLowerCase() === selectedCategory.toLowerCase())
    const config = activeCategoryKey ? (CATEGORIES_CONFIG as any)[activeCategoryKey] : null

    // Appliquer les filtres à chaque changement
    const applyFilters = useCallback(() => {
        let result = [...allProducts]

        // Filtre par catégorie (type)
        if (selectedCategory) {
            result = result.filter((p) =>
                p.type?.toLowerCase() === selectedCategory.toLowerCase()
            )
        }

        // Recherche textuelle
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter((p) =>
                p.name?.toLowerCase().includes(q) ||
                p.short_desc?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            )
        }

        // Filtre OS / Plateforme / Format
        if (selectedOS !== 'Tous') {
            result = result.filter((p) =>
                p.os?.toLowerCase().includes(selectedOS.toLowerCase())
            )
        }

        // Filtre Prix/Monétisation
        if (selectedPrice !== 'all') {
            result = result.filter((p) => {
                if (selectedPrice === 'free') return p.monetization_type === 'free' || p.price === 0
                if (selectedPrice === 'premium') return p.is_premium === true
                if (selectedPrice === 'ads') return p.monetization_type === 'ads'
                if (selectedPrice === 'paid') return p.price > 0 && p.monetization_type !== 'ads'
                return true
            })
        }

        // Filtre Placements
        if (selectedPlacement.length > 0) {
            result = result.filter(p =>
                selectedPlacement.every(pl => p.placements?.includes(pl))
            )
        }

        // Filtre Sous-Type (matches both 'subtype' and 'sub_type' field names)
        if (selectedSubType !== 'Tous') {
            result = result.filter(p => p.subtype === selectedSubType || p.sub_type === selectedSubType)
        }

        // Filtre Premium seulement toggle
        if (showPremiumOnly) {
            result = result.filter(p => p.is_premium === true)
        }

        // Tri
        result.sort((a, b) => {
            if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '')
            if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0)
            if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0)
            if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            return 0
        })

        setFiltered(result)
    }, [allProducts, selectedCategory, search, selectedOS, selectedPrice, sortBy, showPremiumOnly, selectedPlacement, selectedSubType])

    useEffect(() => {
        applyFilters()
    }, [applyFilters])

    const handleCategoryClick = (cat: string) => {
        setSearchParams(cat ? { category: cat.toLowerCase() } : {})
        setSelectedSubType('Tous') // Reset sub-type on category change
    }

    const resetFilters = () => {
        setSearch('')
        setSelectedOS('Tous')
        setSelectedPrice('all')
        setSortBy('recent')
        setShowPremiumOnly(false)
        setSelectedPlacement([])
        setSelectedSubType('Tous')
        setSearchParams({})
    }

    const activeFiltersCount = [
        selectedCategory,
        selectedOS !== 'Tous' ? selectedOS : '',
        selectedPrice !== 'all' ? selectedPrice : '',
        showPremiumOnly ? 'premium' : '',
        selectedPlacement.length > 0 ? 'placements' : '',
        selectedSubType !== 'Tous' ? 'subtype' : ''
    ].filter(Boolean).length

    return (
        <div className="min-h-screen bg-black">
            {/* Header Hero */}
            <div className="relative bg-black pt-4 pb-8 px-4 border-b border-zinc-900">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-1">AR Business Digital Store</p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                EXPLORER PAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-500">UNIVERS</span>
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">
                                {filtered.length} produit{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <SiteNavBar />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-[280px,1fr] gap-8">

                    {/* === SIDEBAR FILTRES === */}
                    <aside className="space-y-6">
                        {/* Mobile: Toggle filtres */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden w-full flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-zinc-800"
                        >
                            <span className="font-bold text-white flex items-center gap-2">
                                Filtres
                                {activeFiltersCount > 0 && (
                                    <span className="w-5 h-5 bg-gold text-black text-[10px] font-black rounded-full flex items-center justify-center">{activeFiltersCount}</span>
                                )}
                            </span>
                            <span className="text-zinc-500">{showFilters ? '▲' : '▼'}</span>
                        </button>

                        <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                            {/* Recherche */}
                            <div>
                                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Recherche</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Nom, description..."
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3 px-4 pl-10 text-sm text-white focus:outline-none focus:border-gold/50 transition-all placeholder:text-zinc-600"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                        <IconSearch size={15} strokeWidth={2} />
                                    </span>
                                </div>
                            </div>

                            {/* Catégories */}
                            <div>
                                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Univers</h3>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => handleCategoryClick('')}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${!selectedCategory ? 'bg-gold text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <IconGlobe size={15} strokeWidth={2} />
                                            Tous les produits
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${!selectedCategory ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                            {allProducts.length}
                                        </span>
                                    </button>
                                    {Object.keys(CATEGORIES_CONFIG).map((catName) => (
                                        <button
                                            key={catName}
                                            onClick={() => handleCategoryClick(catName)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-sm font-bold text-left ${selectedCategory?.toLowerCase() === catName.toLowerCase() ? 'bg-gold text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="shrink-0">
                                                    {(() => {
                                                        const Icon = CATEGORY_ICONS[catName] || CATEGORY_ICONS.Default
                                                        return <Icon size={15} strokeWidth={2} />
                                                    })()}
                                                </span>
                                                {catName}s
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCategory?.toLowerCase() === catName.toLowerCase() ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                                {categoryCounts[catName] || 0}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* OS Standard */}
                            <div>
                                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Système / OS</h3>
                                <div className="flex flex-wrap gap-2">
                                    {OS_FILTERS.map((os) => (
                                        <button
                                            key={os}
                                            onClick={() => setSelectedOS(os)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedOS === os ? 'bg-gold text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'}`}
                                        >
                                            {os}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filtres Spécifiques à l'Univers */}
                            {selectedCategory && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2">
                                        <IconGrid size={14} className="text-zinc-600" />
                                        <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                                            {activeCategoryKey === 'Jeu' ? 'Genres & Styles' :
                                                activeCategoryKey === 'Formation' ? 'Domaines de Formation' :
                                                    activeCategoryKey === 'Application' ? 'Genres d\'Applications' : 'Spécialités'}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedSubType('Tous')}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedSubType === 'Tous' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-black text-zinc-600 border-zinc-900 hover:border-zinc-800'}`}
                                        >
                                            Tous
                                        </button>
                                        {config?.subtypes?.map((sub: string) => (
                                            <button
                                                key={sub}
                                                onClick={() => setSelectedSubType(sub)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedSubType === sub ? 'bg-gold/10 text-gold border-gold/20' : 'bg-black text-zinc-600 border-zinc-900 hover:border-zinc-800'}`}
                                            >
                                                {sub}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Plateformes (Jeux) */}
                                    {activeCategoryKey === 'Jeu' && (
                                        <div className="pt-4 border-t border-zinc-900 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <IconGlobe size={14} className="text-zinc-600" />
                                                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Plateformes de Jeu</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {CATEGORIES_CONFIG['Jeu'].platforms.map(p => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setSelectedOS(p)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedOS === p ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-black text-zinc-600 border-zinc-900 hover:border-zinc-800'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Formats (Formations) */}
                                    {activeCategoryKey === 'Formation' && (
                                        <div className="pt-4 border-t border-zinc-900 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <IconGlobe size={14} className="text-zinc-600" />
                                                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Mode d'Apprentissage (Format)</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {CATEGORIES_CONFIG['Formation'].formats.map(f => (
                                                    <button
                                                        key={f}
                                                        onClick={() => setSelectedOS(f)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedOS === f ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-black text-zinc-600 border-zinc-900 hover:border-zinc-800'}`}
                                                    >
                                                        {f}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Placements / Collections */}
                            <div>
                                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Collections</h3>
                                <div className="space-y-2">
                                    {PLACEMENTS.map((pl) => {
                                        const Icon = PLACEMENT_ICONS[pl.id] || IconGrid
                                        return (
                                            <label key={pl.id} className="flex items-center justify-between group cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    <Icon size={14} className={selectedPlacement.includes(pl.id) ? 'text-gold' : 'text-zinc-600 group-hover:text-zinc-400'} />
                                                    <span className={`text-xs font-bold transition-all ${selectedPlacement.includes(pl.id) ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                                        {pl.label}
                                                    </span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPlacement.includes(pl.id)}
                                                    onChange={() => {
                                                        const exists = selectedPlacement.includes(pl.id)
                                                        setSelectedPlacement(exists ? selectedPlacement.filter(x => x !== pl.id) : [...selectedPlacement, pl.id])
                                                    }}
                                                    className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-gold focus:ring-gold/20"
                                                />
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Prix / Monétisation */}
                            <div>
                                <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-3">Prix</h3>
                                <div className="space-y-1">
                                    {PRICE_FILTERS.map((pf: any) => {
                                        const Icon = pf.icon || IconGrid
                                        return (
                                            <button
                                                key={pf.value}
                                                onClick={() => setSelectedPrice(pf.value)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedPrice === pf.value ? 'bg-gold text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                                            >
                                                <Icon size={14} className={selectedPrice === pf.value ? 'text-black' : 'text-zinc-500'} />
                                                {pf.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Toggle Premium */}
                            <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                                <span className="text-sm font-bold text-zinc-300">Premium seulement</span>
                                <button
                                    onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                                    className={`w-12 h-6 rounded-full transition-all relative ${showPremiumOnly ? 'bg-gold' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${showPremiumOnly ? 'left-6' : 'left-0.5'}`}></div>
                                </button>
                            </div>

                            {/* Reset Button */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={resetFilters}
                                    className="w-full py-3 rounded-2xl border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900 transition-all text-sm font-bold"
                                >
                                    Réinitialiser ({activeFiltersCount})
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* === CONTENU PRINCIPAL === */}
                    <main className="space-y-6">
                        {/* Barre de tri e filtres actifs */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap">
                                {selectedCategory && (
                                    <span className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-sm border border-zinc-800 text-white">
                                        <span className="text-zinc-400">
                                            {(() => {
                                                const Icon = CATEGORY_ICONS[activeCategoryKey || 'Default'] || CATEGORY_ICONS.Default
                                                return <Icon size={14} strokeWidth={2} />
                                            })()}
                                        </span>
                                        {activeCategoryKey}
                                        <button onClick={() => handleCategoryClick('')} className="p-0.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded transition-all ml-1">
                                            <IconX size={12} strokeWidth={2.5} />
                                        </button>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider hidden sm:block">Trier par</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-gold/50"
                                >
                                    {SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Grille de produits */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-square bg-zinc-900/40 rounded-[28px] animate-pulse border border-zinc-800"></div>
                                ))}
                            </div>
                        ) : filtered.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filtered.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <IconSearch size={36} className="text-zinc-600" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">Aucun résultat</h3>
                                <p className="text-zinc-600 mb-8">Essayez de modifier vos filtres ou votre recherche.</p>
                                <button onClick={resetFilters} className="px-8 py-4 bg-gold text-black rounded-2xl font-black hover:scale-105 transition-transform">
                                    Tout réafficher
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <SiteNavFooter />
        </div>
    )
}
