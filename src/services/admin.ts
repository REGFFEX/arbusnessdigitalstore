import { supabase } from '../config/supabase'

// ─── Storage Transfer ─────────────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage.
 * Uses upsert:true so re-uploading the same path never throws a duplicate error.
 */
export async function uploadToStorage(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true   // FIX: was false → caused "already exists" errors on retry
  })
  if (error) throw new Error(`Échec du transfert : ${error.message}`)
  return data
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(product: any) {
  const { data, error } = await supabase.from('products').insert([product]).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: any) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const { data, error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  return data
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'current')
    .maybeSingle() // the row may not exist yet — UI falls back to defaults
  if (error) throw error
  return data
}

// ─── Premium Configuration (stored in site_settings.site_content) ─────────────

export async function getPremiumConfig() {
  const data = await getSiteSettings()
  const tiers = data?.site_content?.premium_config
  return Array.isArray(tiers) ? tiers : []
}

export async function savePremiumConfig(tiers: any[]) {
  const data = await getSiteSettings()
  return updateSiteSettings({
    site_content: { ...(data?.site_content || {}), premium_config: tiers }
  })
}

export async function updateSiteSettings(settings: any) {
  // Attempt update first; if the row doesn't exist, insert it
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ ...settings, id: 'current', updated_at: new Date().toISOString() })
    .eq('id', 'current')
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Payment Settings ─────────────────────────────────────────────────────────

export async function getPaymentSettings() {
  const { data, error } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('id', 'current')
    .single()
  if (error) return { mtn_number: '', airtel_number: '', orange_number: '', paypal_email: '' }
  return data
}

export async function updatePaymentSettings(settings: any) {
  const { data, error } = await supabase
    .from('payment_settings')
    .upsert({ ...settings, id: 'current' })
    .eq('id', 'current')
  if (error) throw error
  return data
}

// ─── Admin Action Logging ─────────────────────────────────────────────────────

export async function logAdminAction(action: string, details: Record<string, any> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('system_logs').insert([{
      type: 'admin_action',
      action,
      user: user?.email ?? 'unknown',   // legacy column in existing table
      user_email: user?.email ?? 'unknown', // new column added by migration
      details,
      timestamp: new Date().toISOString() // existing column
    }])
  } catch {
    console.warn('[logAdminAction] failed silently')
  }
}

/**
 * Purge system logs older than X days.
 */
export async function purgeSystemLogs(days = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const { data, error } = await supabase
    .from('system_logs')
    .delete()
    .lt('timestamp', cutoff.toISOString())
    .select()

  if (error) throw error
  return { success: true, count: data?.length || 0 }
}

export async function getAdminHistory(limit = 20) {
  const { data, error } = await supabase
    .from('system_logs')
    .select('*')
    .order('timestamp', { ascending: false }) // use 'timestamp' — existing column name
    .limit(limit)
  if (error) throw error
  return data ?? []
}

// ─── Push Updates (Auto-Ranking + Timestamp) ──────────────────────────────────

/**
 * "Push Updates" button handler.
 * 1. Recalculates top/trending rankings based on download counts.
 * 2. Sets last_pushed_at on site_settings.
 * 3. Logs the action.
 */
export async function pushStoreUpdates(adminEmail: string) {
  const results: string[] = []

  // 1. Auto-ranking
  try {
    const ranking = await calculateAutoRanking()
    results.push(`✓ Classement : ${ranking.count} produit(s) mis à jour`)
  } catch (err: any) {
    results.push(`⚠ Classement : ${err.message}`)
  }

  // 2. Stamp last_pushed_at
  try {
    await supabase
      .from('site_settings')
      .upsert({ id: 'current', last_pushed_at: new Date().toISOString() })
  } catch (err: any) {
    results.push(`⚠ Timestamp : ${err.message}`)
  }

  // 3. Log history
  await logAdminAction('push_updates', { results, by: adminEmail })

  return results
}

// ─── Auto-Ranking ─────────────────────────────────────────────────────────────

export async function calculateAutoRanking() {
  const categories = ['Application', 'Logiciel', 'Jeu', 'Formation', 'Outil']
  let totalUpdated = 0

  for (const cat of categories) {
    const { data: allProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, placements, ranking_position, download_logs(count)')
      .eq('type', cat)

    if (fetchError || !allProducts) continue

    // Tri : 
    // 1. Position manuelle (1, 2, 3...) -> plus petit en premier
    // 2. Nombre de téléchargements -> plus grand en premier
    const sorted = allProducts.sort((a: any, b: any) => {
      const posA = a.ranking_position || 999
      const posB = b.ranking_position || 999

      if (posA !== posB) return posA - posB

      const aCount = a.download_logs?.[0]?.count ?? 0
      const bCount = b.download_logs?.[0]?.count ?? 0
      return bCount - aCount
    })

    const top10Ids = sorted.slice(0, 10).map(p => p.id)

    // Update top_10 + trending for the top 10
    for (const [index, p] of sorted.entries()) {
      const inTop10 = top10Ids.includes(p.id)
      let placements: string[] = p.placements || []

      if (inTop10) {
        if (!placements.includes('top_10')) placements.push('top_10')
        if (!placements.includes('trending')) placements.push('trending')
      } else {
        placements = placements.filter(pl => pl !== 'top_10')
      }

      await supabase.from('products').update({ placements }).eq('id', p.id)
    }

    totalUpdated += allProducts.length
  }

  return { success: true, count: totalUpdated }
}

// ─── Branding Messages ────────────────────────────────────────────────────────

export async function getBrandingMessages() {
  const { data, error } = await supabase
    .from('branding_messages')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createBrandingMessage(msg: any) {
  const { data, error } = await supabase.from('branding_messages').insert([msg]).select().single()
  if (error) throw error
  return data
}

export async function updateBrandingMessage(id: string, updates: any) {
  const { data, error } = await supabase.from('branding_messages').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteBrandingMessage(id: string) {
  const { error } = await supabase.from('branding_messages').delete().eq('id', id)
  if (error) throw error
}

// ─── Statistics & Metrics ─────────────────────────────────────────────────────

/**
 * Fetches a summary of key metrics for the dashboard.
 * Uses count: 'exact' to avoid fetching all rows.
 */
export async function getStatsSummary() {
  const [
    { count: products },
    { count: services },
    { count: ads },
    { count: posts },
    { count: downloads }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('ads').select('*', { count: 'exact', head: true }),
    supabase.from('community_posts').select('*', { count: 'exact', head: true }),
    supabase.from('download_logs').select('*', { count: 'exact', head: true })
  ])

  return {
    products: products || 0,
    services: services || 0,
    ads: ads || 0,
    posts: posts || 0,
    downloads: downloads || 0
  }
}

/**
 * Get performance metrics for products (downloads, views, conversion rate).
 */
export async function getProductPerformance() {
  // La table products ne stocke pas de compteur de vues : on s'appuie sur les téléchargements
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, name, status')

  if (pError) throw pError

  const { data: downloads, error: dError } = await supabase
    .from('download_logs')
    .select('product_id')

  if (dError) throw dError

  // Count downloads per product
  const dlCountMap: Record<string, number> = {}
  downloads.forEach(dl => {
    dlCountMap[dl.product_id] = (dlCountMap[dl.product_id] || 0) + 1
  })

  // Merge (pas de compteur de vues en base : la conversion vaut 100 % dès un téléchargement)
  const performance = products.map(p => {
    const dls = dlCountMap[p.id] || 0
    return {
      id: p.id,
      name: p.name,
      status: p.status,
      views: 0,
      downloads: dls,
      conversion: dls > 0 ? '100.0' : '0.0'
    }
  })

  return performance.sort((a, b) => b.downloads - a.downloads)
}
