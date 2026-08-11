import { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import type { Session, User } from '@supabase/supabase-js'

export type AdminRole = 'master' | 'admin'
export type AdminStatus = 'active' | 'pending' | 'blocked'

export interface AdminData {
  id: string
  external_id?: string
  role: AdminRole
  status: AdminStatus
  display_name?: string
  avatar_url?: string
  email: string
  permissions?: Record<string, boolean>
  phone?: string
  whatsapp?: string
  github?: string
  facebook?: string
  tiktok?: string
  qr_code_url?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminData, setAdminData] = useState<AdminData | null>(null)

  useEffect(() => {
    let mounted = true

    async function checkUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // --- GOD MODE BYPASS POUR AHRAF ---
          const MASTER_EMAIL = 'ahrafalnazar@gmail.com';

          if (session.user.email === MASTER_EMAIL) {
            console.log('👑 AHRAF DETECTED (God Mode Bypass enabled, but fetching DB profile)');
            // On continue pour récupérer le display_name, avatar_url, etc.
          }

          // Vérification Admin standard pour les autres
          console.log('Checking permissions for:', session.user.email)
          // On tente de récupérer les infos. Si une colonne manque, l'erreur 
          // nous dira laquelle, mais on ne veut pas crash ici.
          const { data: admins, error } = await supabase
            .from('admins')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.warn('Admin check failed (table might be missing columns):', error.message)
            // Si la table existe mais pas les colonnes, on refuse par sécurité sauf pour Ahraf (géré au dessus)
            setAdminData(null)
            setIsAdmin(false)
          } else if (admins) {
            console.log('Données admin récupérées:', admins)
            setAdminData(admins as AdminData)
            const activeStatus = admins.status === 'active' || admins.role === 'master'
            setIsAdmin(activeStatus)
            console.log('Statut admin (active?):', activeStatus)
          } else {
            console.warn('Aucun admin trouvé dans la table admins pour cet ID.')
            setAdminData(null)
            setIsAdmin(false)
          }
        } else {
          setAdminData(null)
          setIsAdmin(false)
        }
      } catch (e) {
        console.error('Auth Error:', e)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        setLoading(true)
        checkUser()
      } else {
        setIsAdmin(false)
        setAdminData(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn(email: string, password: string) {
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) throw res.error
    return res
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setIsAdmin(false)
    setAdminData(null)
  }

  return { user, session, loading, isAdmin, adminData, signIn, signOut }
}
