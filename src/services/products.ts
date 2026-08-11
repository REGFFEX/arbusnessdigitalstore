import { supabase } from '../config/supabase'

/**
 * Service API pour gérer les produits
 */

// Récupérer tous les produits avec options
export async function getProducts(options?: {
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
}) {
  const { limit = 100, offset = 0, orderBy = 'created_at', ascending = false } = options || {}

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

// Récupérer produits avec filtres avancés
export async function getProductsFiltered(filters: {
  type?: string
  os?: string
  license?: string
  category_id?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const { limit = 100, offset = 0, search, ...restFilters } = filters

  let query = supabase
    .from('products')
    .select('*')

  // Appliquer les filtres
  Object.entries(restFilters).forEach(([key, value]) => {
    if (value) {
      query = query.eq(key, value)
    }
  })

  // Recherche textuelle
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_desc.ilike.%${search}%`)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return data
}

// Récupérer un produit par ID
export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Récupérer produits par catégorie
export async function getProductsByCategory(categoryId: string, limit = 20) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Récupérer produits populaires (basé sur download_logs)
export async function getPopularProducts(limit = 10) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      download_logs (count)
    `)
    .order('download_logs.count', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Récupérer produits récents
export async function getRecentProducts(limit = 10) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Récupérer produits par statut
export async function getProductsByStatus(status: string, limit = 20) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Récupérer les ads (Ads Pro compatible)
export async function getAds(position = 'billboard') {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('position', position)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Récupérer les produits par placement (ex: new, featured, top_rated)
export async function getProductsByPlacement(placement: string, limit = 10) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .contains('placements', [placement])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Calculates storage metrics for the store.
 */
export async function getStoreStorageMetrics() {
  const { data: products, error } = await supabase
    .from('products')
    .select('size, type')

  if (error) throw error

  let totalSizeMb = 0
  const counts: Record<string, number> = {}

  products?.forEach(p => {
    // Size calculation
    const sizeStr = p.size || '0 Mo'
    const size = parseFloat(sizeStr)
    totalSizeMb += sizeStr.toLowerCase().includes('go') ? size * 1024 : size

    // Category distribution
    const type = p.type || 'Autre'
    counts[type] = (counts[type] || 0) + 1
  })

  return {
    totalSizeMb,
    categoryCounts: counts
  }
}
