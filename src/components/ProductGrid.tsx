import React from 'react'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: any[]
  loading?: boolean
}

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
        {/* Skeleton loaders */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-2 sm:p-4 animate-pulse h-full flex flex-col">
            <div className="bg-zinc-800 aspect-square rounded-2xl mb-2 sm:mb-3"></div>
            <div className="bg-zinc-800 h-3 sm:h-4 rounded w-3/4 mb-1 sm:mb-2"></div>
            <div className="bg-zinc-800 h-2 sm:h-3 rounded w-1/2 mb-auto"></div>
            <div className="hidden sm:flex gap-2 mt-3">
              <div className="bg-zinc-800 h-6 rounded-full w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Aucun produit trouvé</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
