import { supabase } from '../config/supabase'

export interface CenterPost {
  id?: string
  type: 'announcement' | 'important' | 'ad' | 'video' | 'audio' | 'file' | 'product_link' | 'service_link' | 'external_link' | 'gallery'
  title: string
  content?: string
  media_urls?: string[]
  thumbnail?: string
  linked_product_id?: string | null
  linked_service_id?: string | null
  external_url?: string
  priority: 'critical' | 'high' | 'normal' | 'low'
  status: 'published' | 'draft' | 'scheduled' | 'archived' | 'deleted'
  source: string
  source_detail?: string
  admin_id?: string
  card_size: 'sm' | 'md' | 'lg'
  pinned?: boolean
  share_count?: number
  scheduled_at?: string | null
  expires_at?: string | null
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
  // Grouping fields
  block_id?: string | null
  block_order?: number
  layout_config?: any
  // Joined fields (from queries)
  admin?: any
  linked_product?: any
  linked_service?: any
}

// ── CLIENT QUERIES ──────────────────────────────────────────────────────────────

export async function getPublishedPosts(limit = 30, offset = 0, typeFilter?: string) {
  let query = supabase
    .from('center_posts')
    .select('*')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('pinned', { ascending: false })
    .order('priority', { ascending: true }) // critical first
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (typeFilter && typeFilter !== 'all') {
    query = query.eq('type', typeFilter)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getPostById(id: string) {
  const { data, error } = await supabase
    .from('center_posts')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function incrementShareCount(id: string) {
  const { error } = await supabase.rpc('increment_share_count', { post_id: id })
  // Fallback si la fonction RPC n'existe pas
  if (error) {
    const { data: post } = await supabase.from('center_posts').select('share_count').eq('id', id).single()
    if (post) {
      await supabase.from('center_posts').update({ share_count: (post.share_count || 0) + 1 }).eq('id', id)
    }
  }
}

// ── ADMIN QUERIES ───────────────────────────────────────────────────────────────

export async function getAllPosts(includeDeleted = false) {
  let query = supabase
    .from('center_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (!includeDeleted) {
    query = query.is('deleted_at', null).neq('status', 'deleted')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getDeletedPosts() {
  const { data, error } = await supabase
    .from('center_posts')
    .select('*')
    .eq('status', 'deleted')
    .order('deleted_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getScheduledPosts() {
  const { data, error } = await supabase
    .from('center_posts')
    .select('*')
    .eq('status', 'scheduled')
    .is('deleted_at', null)
    .order('scheduled_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createPost(post: Partial<CenterPost>) {
  const { data, error } = await supabase
    .from('center_posts')
    .insert({ ...post, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error

  // Log
  await supabase.from('system_logs').insert({
    action: 'center_create',
    type: 'admin_action',
    details: { post_id: data.id, title: data.title, type: data.type },
    user_email: post.admin_id || 'admin',
    timestamp: new Date().toISOString()
  })

  return data
}

export async function updatePost(id: string, updates: Partial<CenterPost>) {
  const { data, error } = await supabase
    .from('center_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error

  await supabase.from('system_logs').insert({
    action: 'center_update',
    type: 'admin_action',
    details: { post_id: id, title: data.title, changes: Object.keys(updates) },
    user_email: 'admin',
    timestamp: new Date().toISOString()
  })

  return data
}

export async function softDeletePost(id: string) {
  const { error } = await supabase
    .from('center_posts')
    .update({ status: 'deleted', deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error

  await supabase.from('system_logs').insert({
    action: 'center_delete',
    type: 'admin_action',
    details: { post_id: id },
    user_email: 'admin',
    timestamp: new Date().toISOString()
  })
}

export async function restorePost(id: string) {
  const { error } = await supabase
    .from('center_posts')
    .update({ status: 'published', deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error

  await supabase.from('system_logs').insert({
    action: 'center_restore',
    type: 'admin_action',
    details: { post_id: id },
    user_email: 'admin',
    timestamp: new Date().toISOString()
  })
}

export async function hardDeletePost(id: string) {
  const { error } = await supabase
    .from('center_posts')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function bulkSoftDelete(ids: string[]) {
  const { error } = await supabase
    .from('center_posts')
    .update({ status: 'deleted', deleted_at: new Date().toISOString() })
    .in('id', ids)
  if (error) throw error
}

export async function bulkRestore(ids: string[]) {
  const { error } = await supabase
    .from('center_posts')
    .update({ status: 'published', deleted_at: null })
    .in('id', ids)
  if (error) throw error
}

export async function purgeTrash() {
  const { error } = await supabase
    .from('center_posts')
    .delete()
    .eq('status', 'deleted')
  if (error) throw error

  await supabase.from('system_logs').insert({
    action: 'center_purge',
    type: 'admin_action',
    details: { action: 'purge_all_trash' },
    user_email: 'admin',
    timestamp: new Date().toISOString()
  })
}

export async function bulkUpdatePriority(ids: string[], priority: string) {
  const { error } = await supabase
    .from('center_posts')
    .update({ priority, updated_at: new Date().toISOString() })
    .in('id', ids)
  if (error) throw error
}

export async function togglePin(id: string, pinned: boolean) {
  const { error } = await supabase
    .from('center_posts')
    .update({ pinned, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function bulkGroupPosts(ids: string[], blockId: string) {
  const { error } = await supabase
    .from('center_posts')
    .update({ block_id: blockId, updated_at: new Date().toISOString() })
    .in('id', ids)
  if (error) throw error
}

export async function reorderInBlock(id: string, order: number) {
  const { error } = await supabase
    .from('center_posts')
    .update({ block_order: order, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// Upload media to storage
export async function uploadCenterMedia(file: File, postId: string) {
  const ext = file.name.split('.').pop()
  const path = `center/${postId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('files').upload(path, file, { contentType: file.type })
  if (error) throw error
  const { data: urlData } = supabase.storage.from('files').getPublicUrl(path)
  return urlData.publicUrl
}
