import { supabase } from '../config/supabase'

/**
 * Service API pour gérer les services digitaux
 */

export async function getServices(showInactive = false) {
    let query = supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

    if (!showInactive) {
        query = query.eq('active', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data
}

export async function getServiceById(id: string) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

// Admin functions
export async function createService(service: {
    name: string
    description?: string
    type?: string
    image?: string
}) {
    const { data, error } = await supabase
        .from('services')
        .insert([service])
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateService(id: string, updates: any) {
    const { data, error } = await supabase
        .from('services')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteService(id: string) {
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function toggleServiceActive(id: string, active: boolean) {
    const { data, error } = await supabase
        .from('services')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getServicesByPlacement(placement: string, limit = 10) {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .contains('placements', [placement])
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}
