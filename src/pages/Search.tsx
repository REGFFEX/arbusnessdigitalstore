import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../services/products'
import ProductGrid from '../components/ProductGrid'
import { IconSearch } from '../components/Icons'

export default function Search() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        type: '',
        os: '',
        license: '',
    })

    useEffect(() => {
        if (query) {
            setLoading(true)
            getProducts()
                .then((data) => {
                    // Recherche dans nom et description
                    let filtered = data.filter((p: any) =>
                        p.name?.toLowerCase().includes(query.toLowerCase()) ||
                        p.description?.toLowerCase().includes(query.toLowerCase()) ||
                        p.short_desc?.toLowerCase().includes(query.toLowerCase())
                    )

                    // Appliquer les filtres
                    if (filters.type) {
                        filtered = filtered.filter((p: any) => p.type?.toLowerCase() === filters.type.toLowerCase())
                    }
                    if (filters.os) {
                        filtered = filtered.filter((p: any) => p.os?.toLowerCase() === filters.os.toLowerCase())
                    }
                    if (filters.license) {
                        filtered = filtered.filter((p: any) => p.license?.toLowerCase() === filters.license.toLowerCase())
                    }

                    setProducts(filtered)
                })
                .catch((e) => console.error(e))
                .finally(() => setLoading(false))
        }
    }, [query, filters])

    const resetFilters = () => {
        setFilters({ type: '', os: '', license: '' })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    Résultats de recherche
                </h1>
                {query && (
                    <p className="text-gray-400">
                        {products.length} résultat{products.length > 1 ? 's' : ''} pour "{query}"
                    </p>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filtres */}
                <aside className="lg:w-64 flex-shrink-0">
                    <div className="card sticky top-20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Filtres</h2>
                            <button
                                onClick={resetFilters}
                                className="text-sm text-gold hover:underline"
                            >
                                Réinitialiser
                            </button>
                        </div>

                        {/* Type */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="input-field"
                            >
                                <option value="">Tous</option>
                                <option value="app">Application</option>
                                <option value="software">Logiciel</option>
                                <option value="tool">Outil</option>
                                <option value="service">Service</option>
                                <option value="system">Système</option>
                                <option value="resource">Ressource</option>
                            </select>
                        </div>

                        {/* OS */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Système d'exploitation</label>
                            <select
                                value={filters.os}
                                onChange={(e) => setFilters({ ...filters, os: e.target.value })}
                                className="input-field"
                            >
                                <option value="">Tous</option>
                                <option value="android">Android</option>
                                <option value="windows">Windows</option>
                                <option value="linux">Linux</option>
                                <option value="web">Web</option>
                                <option value="multi-os">Multi-OS</option>
                            </select>
                        </div>

                        {/* Licence */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Licence</label>
                            <select
                                value={filters.license}
                                onChange={(e) => setFilters({ ...filters, license: e.target.value })}
                                className="input-field"
                            >
                                <option value="">Toutes</option>
                                <option value="free">Free</option>
                                <option value="freemium">Freemium</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>

                        {/* Filtres actifs */}
                        {(filters.type || filters.os || filters.license) && (
                            <div className="pt-4 border-t border-zinc-800">
                                <p className="text-sm text-gray-400 mb-2">Filtres actifs:</p>
                                <div className="flex flex-wrap gap-2">
                                    {filters.type && (
                                        <span className="badge bg-gold/20 text-gold">
                                            {filters.type}
                                        </span>
                                    )}
                                    {filters.os && (
                                        <span className="badge bg-gold/20 text-gold">
                                            {filters.os}
                                        </span>
                                    )}
                                    {filters.license && (
                                        <span className="badge bg-gold/20 text-gold">
                                            {filters.license}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Résultats */}
                <main className="flex-1">
                    {!query ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-5">
                                <IconSearch size={36} className="text-zinc-600" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Recherchez un produit</h2>
                            <p className="text-gray-400">
                                Utilisez la barre de recherche pour trouver des produits
                            </p>
                        </div>
                    ) : (
                        <ProductGrid products={products} loading={loading} />
                    )}
                </main>
            </div>
        </div>
    )
}
