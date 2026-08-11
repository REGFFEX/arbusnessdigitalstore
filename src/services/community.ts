import { supabase } from '../config/supabase'

export interface CommunityPost {
    id?: string
    title: string
    content: string
    media_url?: string
    media_type?: 'image' | 'video' | 'audio' | 'file'
    external_links: { label: string; url: string }[]
    created_at?: string
    is_pinned?: boolean
    view_count?: number
    theme?: 'glass' | 'gold' | 'minimal' | 'modern' | 'dark'
    admin_id?: string
    status?: 'active' | 'deleted'
    deleted_at?: string
    updated_at?: string
    metadata?: any
}

export async function getCommunityPosts() {
    const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as CommunityPost[]
}

export async function createCommunityPost(post: CommunityPost) {
    const { data, error } = await supabase
        .from('community_posts')
        .insert([post])
        .select()
        .single()

    if (error) throw error
    return data as CommunityPost
}

export async function updateCommunityPost(id: string, post: Partial<CommunityPost>) {
    const { data, error } = await supabase
        .from('community_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as CommunityPost
}

export async function deleteCommunityPost(id: string) {
    const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
