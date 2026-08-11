import { supabase } from '../config/supabase'

export async function getSignedDownloadUrl(bucket: string, path: string, expiresIn = 60) {
  const filename = path.split('/').pop() || 'download'
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn, {
    download: filename
  })
  if (error) throw error
  return data.signedUrl
}

export async function logDownload(productId: string, userId?: string, productName?: string) {
  try {
    let uid = userId
    let userEmail = 'visitor'

    const { data } = await supabase.auth.getUser()
    if (data.user) {
      uid = uid || data.user.id
      userEmail = data.user.email || 'authenticated_user'
    }

    // 1. Insert into download_logs (for counters)
    const { error: dlError } = await supabase.from('download_logs').insert([
      { product_id: productId, user_id: uid ?? null }
    ])
    if (dlError) console.error('download_logs error', dlError)

    // 2. Insert into system_logs (for activity stream)
    const { error: sysError } = await supabase.from('system_logs').insert([
      {
        type: 'download',
        action: `download:${productId}`,
        user: userEmail,
        user_email: userEmail,
        details: { product_name: productName || 'Produit inconnu', product_id: productId },
        timestamp: new Date().toISOString()
      }
    ])
    if (sysError) console.error('system_logs error', sysError)
  } catch (err) {
    console.error('logDownload error', err)
  }
}
export async function createDownloadToken(productId: string, filePath: string, bucket = 'files') {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 10) // 10 minutes

  const { data, error } = await supabase
    .from('download_tokens')
    .insert([{
      token,
      product_id: productId,
      file_path: filePath,
      bucket,
      expires_at: expiresAt.toISOString()
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating download token:', error)
    throw new Error(`Erreur jeton: ${error.message}`)
  }
  return token
}

export async function verifyDownloadToken(token: string) {
  const { data, error } = await supabase
    .from('download_tokens')
    .select('*, products(name, image)')
    .eq('token', token)
    .single()

  if (error) return null

  // Manual check for expiration and usage
  const now = new Date()
  const expiresAt = new Date(data.expires_at)
  if (now > expiresAt || data.used_at) return null

  return data
}

export async function markTokenAsUsed(tokenId: string) {
  await supabase
    .from('download_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId)
}

/**
 * Gets unique downloader count based on user_id.
 */
export async function getUniqueDownloaders() {
  const { data, error } = await supabase
    .from('download_logs')
    .select('user_id')

  if (error) throw error
  if (!data) return 0

  const uniqueUsers = new Set(data.map(d => d.user_id).filter(Boolean))
  return uniqueUsers.size
}
