import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../hooks/useAuth'
import {
    uploadToStorage, getPublicUrl
} from '../../services/admin'
import { IconLock, IconCheck, IconSettings, IconInfoCircle, IconTrash } from '../../components/Icons'



export default function AdminSettings() {
    const { adminData, user } = useAuth()

    // Auth & Profile states
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [authLoading, setAuthLoading] = useState(false)
    const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)


    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (adminData) {
            setDisplayName(adminData.display_name || '')
            setAvatarPreview(adminData.avatar_url || null)
            setIsLoading(false)
        }
    }, [adminData])

    // --- Handlers ---

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault()
        setAuthMessage(null)
        setAuthLoading(true)

        try {
            if (password) {
                if (password !== confirmPassword) throw new Error('Les mots de passe ne correspondent pas.')
                if (password.length < 6) throw new Error('Le mot de passe doit faire au moins 6 caractères.')
                const { error } = await supabase.auth.updateUser({ password: password })
                if (error) throw error
            }

            let finalAvatarUrl = adminData?.avatar_url
            if (avatarFile) {
                // Sanitization du nom de fichier pour éviter l'erreur "Invalid key"
                const safeName = avatarFile.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
                const path = `avatars/${Date.now()}_${safeName}`
                await uploadToStorage('images', path, avatarFile)
                finalAvatarUrl = getPublicUrl('images', path)
            }

            const { error: dbError } = await supabase
                .from('admins')
                .update({
                    display_name: displayName,
                    avatar_url: finalAvatarUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user?.id)

            if (dbError) throw dbError

            await supabase.auth.updateUser({
                data: { display_name: displayName, avatar_url: finalAvatarUrl }
            })

            setAuthMessage({ type: 'success', text: 'Profil mis à jour !' })
            setPassword('')
            setConfirmPassword('')
            setAvatarFile(null)
        } catch (err: any) {
            setAuthMessage({ type: 'error', text: err.message })
        } finally {
            setAuthLoading(false)
        }
    }


    if (isLoading) return <div className="p-20 text-center text-gold font-black animate-pulse">CHARGEMENT DU PROFIL SÉCURISÉ...</div>

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-8 pb-20">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Profil <span className="text-gold">& Sécurité</span></h2>

            {/* Profile & Security Card */}
            <div className="bg-zinc-900/50 p-10 rounded-[40px] border border-zinc-800 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <IconLock size={120} />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <IconLock size={24} className="text-gold" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic">Paramètres Personnels</h3>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-zinc-800/50 pb-8">
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 rounded-[32px] bg-black border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-gold/50">
                                {avatarPreview ? (
                                    <img src={avatarPreview} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <div className="text-zinc-700 font-black text-3xl">AR</div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm cursor-pointer">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Changer</span>
                                </div>
                            </div>
                            <input type="file" onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setAvatarFile(e.target.files[0])
                                    setAvatarPreview(URL.createObjectURL(e.target.files[0]))
                                }
                            }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nom d'affichage</label>
                                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-gold outline-none text-white shadow-inner" placeholder="Votre pseudo" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-gold outline-none text-white" placeholder="•••••••• (Optionnel)" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirmation</label>
                                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-zinc-800 focus:border-gold outline-none text-white" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4">
                        <div className="flex items-center gap-4">
                            {authMessage && (
                                <div className={`px-4 py-3 rounded-xl flex items-center gap-3 ${authMessage.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    <IconInfoCircle size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{authMessage.text}</span>
                                </div>
                            )}
                        </div>
                        <button type="submit" disabled={authLoading} className="w-full md:w-auto px-10 py-4 bg-gold text-black rounded-2xl text-[10px] font-black uppercase shadow-xl shadow-gold/20 hover:bg-white hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                            {authLoading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <IconCheck size={18} />}
                            Mettre à jour le Profil
                        </button>
                    </div>
                </form>
            </div>

            <p className="text-center text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em] pb-10 italic">AR BUSINESS Digital • Sécurité Privée</p>
        </div>
    )
}
