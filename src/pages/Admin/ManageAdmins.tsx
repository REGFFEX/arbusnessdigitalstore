import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth, AdminData, AdminRole, AdminStatus } from '../../hooks/useAuth'
import { IconEdit, IconTrash, IconX, IconLock, IconCheck, IconCircleCheck, IconUser, IconShield } from '../../components/Icons'

export default function ManageAdmins() {
    const { adminData, loading: authLoading } = useAuth()
    const [admins, setAdmins] = useState<AdminData[]>([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Create/Edit state
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [newDisplayName, setNewDisplayName] = useState('')
    const [newRole, setNewRole] = useState<AdminRole>('admin')
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [permissions, setPermissions] = useState<Record<string, boolean>>({
        can_manage_products: true,
        can_manage_services: true,
        can_manage_ads: false,
        can_manage_community: false,
        can_manage_visual: false,
        can_manage_admins: false,
        can_manage_projects: false,
        can_manage_categories: false,
        can_manage_ardes: false,
        can_push_updates: false,
        can_view_stats: true,
        can_edit_settings: false,
        can_view_history: false
    })

    // Social & Info states
    const [newPhone, setNewPhone] = useState('')
    const [newWhatsapp, setNewWhatsapp] = useState('')
    const [newGithub, setNewGithub] = useState('')
    const [newFacebook, setNewFacebook] = useState('')
    const [newTiktok, setNewTiktok] = useState('')
    const [qrFile, setQrFile] = useState<File | null>(null)
    const [qrPreview, setQrPreview] = useState<string | null>(null)

    const [editingAdmin, setEditingAdmin] = useState<AdminData | null>(null)
    const [creating, setCreating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [resetPasswordEmail, setResetPasswordEmail] = useState('')

    useEffect(() => {
        loadAdmins()
    }, [])

    async function loadAdmins() {
        setLoading(true)
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            console.error(error)
            setMessage({ type: 'error', text: `Erreur SQL: ${error.message}` })
        } else {
            setAdmins(data as AdminData[])
        }
        setLoading(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'qr' = 'avatar') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (type === 'avatar') {
                setAvatarFile(file)
                setAvatarPreview(URL.createObjectURL(file))
            } else {
                setQrFile(file)
                setQrPreview(URL.createObjectURL(file))
            }
        }
    }

    async function handleCreateAdmin(e: React.FormEvent) {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' })
            return
        }

        setCreating(true)
        setMessage(null)

        try {
            // 1. Upload Avatar if present
            let avatarUrl = ''
            if (avatarFile) {
                const path = `avatars/${Date.now()}_${avatarFile.name}`
                const { error: uploadError } = await supabase.storage.from('images').upload(path, avatarFile)
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
                avatarUrl = publicUrl
            }

            let qrUrl = ''
            if (qrFile) {
                const path = `qrcodes/${Date.now()}_${qrFile.name}`
                const { error: uploadError } = await supabase.storage.from('images').upload(path, qrFile)
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
                qrUrl = publicUrl
            }

            // 2. Créer le compte dans Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newEmail,
                password: newPassword,
                options: {
                    data: {
                        display_name: newDisplayName,
                        avatar_url: avatarUrl
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("Erreur lors de la création de l'utilisateur.")

            // 3. Créer l'entrée dans la table admins
            const { error: dbError } = await supabase.from('admins').insert([{
                id: authData.user.id,
                email: newEmail,
                role: newRole,
                status: 'active',
                display_name: newDisplayName,
                avatar_url: avatarUrl,
                qr_code_url: qrUrl,
                phone: newPhone,
                whatsapp: newWhatsapp,
                github: newGithub,
                facebook: newFacebook,
                tiktok: newTiktok,
                permissions: permissions,
                external_id: `AR-BD-STORE-${(admins.length + 1).toString().padStart(4, '0')}` // Suggest automated ID
            }])

            if (dbError) throw dbError

            setMessage({
                type: 'success',
                text: `Compte créé pour ${newDisplayName || newEmail} ! IMPORTANT: L'adjoint doit confirmer son email via le lien reçu pour pouvoir se connecter.`
            })
            setNewEmail('')
            setNewPassword('')
            setNewDisplayName('')
            setNewPhone('')
            setNewWhatsapp('')
            setNewGithub('')
            setNewFacebook('')
            setNewTiktok('')
            setAvatarFile(null)
            setAvatarPreview(null)
            setQrFile(null)
            setQrPreview(null)
            loadAdmins()
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.message || 'Erreur lors de la création.' })
        } finally {
            setCreating(false)
        }
    }

    async function handleUpdateAdmin(e: React.FormEvent) {
        e.preventDefault()
        if (!editingAdmin) return
        setSaving(true)

        try {
            const updates: any = {
                role: editingAdmin.role,
                status: editingAdmin.status,
                display_name: editingAdmin.display_name,
                phone: editingAdmin.phone,
                whatsapp: editingAdmin.whatsapp,
                github: editingAdmin.github,
                facebook: editingAdmin.facebook,
                tiktok: editingAdmin.tiktok,
                qr_code_url: editingAdmin.qr_code_url,
                permissions: editingAdmin.permissions
            }

            const { error } = await supabase.from('admins').update(updates).eq('id', editingAdmin.id)
            if (error) throw error

            setMessage({ type: 'success', text: 'Admin mis à jour avec succès.' })
            setEditingAdmin(null)
            loadAdmins()
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setSaving(false)
        }
    }

    async function handleResetPassword(admin: AdminData) {
        if (!confirm(`Envoyer un email de réinitialisation de mot de passe à ${admin.email} ?`)) return
        const { error } = await supabase.auth.resetPasswordForEmail(admin.email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) {
            alert(error.message)
        } else {
            alert('Email de réinitialisation envoyé !')
        }
    }

    async function updateStatus(id: string, newStatus: string) {
        setMessage(null)
        const { error } = await supabase
            .from('admins')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: `Statut mis à jour : ${newStatus}` })
            loadAdmins()
        }
    }

    async function deleteAdmin(id: string) {
        if (!confirm('Supprimer définitivement cet accès admin ?')) return
        const { error } = await supabase.from('admins').delete().eq('id', id)
        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Admin supprimé.' })
            loadAdmins()
        }
    }

    if (authLoading) {
        return (
            <div className="p-20 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Vérification des accréditations...</p>
            </div>
        )
    }

    if (adminData?.role !== 'master') {
        return (
            <div className="p-20 text-center bg-zinc-950 min-h-[60vh] flex flex-col items-center justify-center rounded-[40px] border border-zinc-900 shadow-2xl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <IconShield size={40} className="text-red-500/50" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Accès Non Autorisé</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest max-w-sm">
                    Cette zone est strictement réservée au Master Admin.<br />
                    Votre identifiant actuel ({adminData?.email || 'Inconnu'}) n'a pas les privilèges requis.
                </p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-5xl mx-auto text-white">
            <h2 className="text-3xl font-bold mb-2 text-gold">Gestion des Admins</h2>
            <p className="text-gray-400 mb-8 font-medium italic">Seulement vous (Master) pouvez créer ou révoquer des accès.</p>

            {/* Formulaire Création Complexe */}
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 mb-10 shadow-xl backdrop-blur-sm">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"></span>
                    NOUVEL ADJOINT
                </h3>

                <form onSubmit={handleCreateAdmin} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Section Identité */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-6 p-4 bg-black/40 rounded-2xl border border-zinc-800/50">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        )}
                                    </div>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'avatar')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="absolute -bottom-1 -right-1 bg-gold text-black p-1 rounded-lg text-[8px] font-black uppercase shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">Photo</div>
                                </div>

                                {/* QR Code Upload Area */}
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden">
                                        {qrPreview ? (
                                            <img src={qrPreview} className="w-full h-full object-contain p-1" alt="QR Preview" />
                                        ) : (
                                            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 8h2m12 0h2M4 6h16M4 18h16" /></svg>
                                        )}
                                    </div>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'qr')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-lg text-[8px] font-black uppercase shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">QR CODE</div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Nom Complet (ex: Jean Dupont)"
                                        value={newDisplayName}
                                        onChange={(e) => setNewDisplayName(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 outline-none focus:border-gold transition-all text-sm"
                                    />
                                    <input
                                        required
                                        type="email"
                                        placeholder="Email professionnel"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 outline-none focus:border-gold transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Téléphone (ex: +243...)"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    className="p-3 rounded-xl bg-black border border-zinc-800 outline-none focus:border-gold transition-all text-xs"
                                />
                                <input
                                    type="text"
                                    placeholder="WhatsApp (ex: +243...)"
                                    value={newWhatsapp}
                                    onChange={(e) => setNewWhatsapp(e.target.value)}
                                    className="p-3 rounded-xl bg-black border border-zinc-800 outline-none focus:border-green-500 transition-all text-xs"
                                />
                                <input
                                    type="text"
                                    placeholder="GitHub Username"
                                    value={newGithub}
                                    onChange={(e) => setNewGithub(e.target.value)}
                                    className="p-3 rounded-xl bg-black border border-zinc-800 outline-none focus:border-white transition-all text-xs"
                                />
                                <input
                                    type="text"
                                    placeholder="Facebook URL"
                                    value={newFacebook}
                                    onChange={(e) => setNewFacebook(e.target.value)}
                                    className="p-3 rounded-xl bg-black border border-zinc-800 outline-none focus:border-blue-500 transition-all text-xs"
                                />
                                <input
                                    type="text"
                                    placeholder="TikTok URL"
                                    value={newTiktok}
                                    onChange={(e) => setNewTiktok(e.target.value)}
                                    className="p-3 rounded-xl bg-black border border-zinc-800 outline-none focus:border-pink-500 transition-all text-xs"
                                />
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Mot de passe</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Mot de passe"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-black border border-zinc-800 outline-none focus:border-gold transition-all text-xs pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                                        >
                                            {showPassword ? (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirmation</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Confirmer"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full p-3 rounded-xl bg-black border ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : 'border-zinc-800'} outline-none focus:border-gold transition-all text-xs pr-10`}
                                        />
                                        {confirmPassword && newPassword === confirmPassword && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                                <IconCircleCheck size={14} />
                                            </div>
                                        )}
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-[8px] text-red-500 font-bold uppercase mt-1">Non identique</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as AdminRole)}
                                    className="p-3 rounded-xl bg-black border border-zinc-800 outline-none focus:border-gold transition-all text-sm text-gray-400"
                                >
                                    <option value="admin">Administrateur Standard</option>
                                    <option value="master">Master Admin (God Mode)</option>
                                </select>
                            </div>
                        </div>

                        {/* Section Permissions */}
                        <div className="bg-black/20 p-6 rounded-2xl border border-zinc-800/50">
                            <h4 className="text-xs font-black text-zinc-600 uppercase tracking-widest mb-4">Permissions Granulaires</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(permissions).map(key => (
                                    <label key={key} className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 cursor-pointer hover:border-gold/30 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={permissions[key]}
                                            onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                                            className="w-4 h-4 accent-gold"
                                        />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {key.replace('can_manage_', '').replace('_', ' ')}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            disabled={creating}
                            className={`px-10 py-4 font-black rounded-2xl transition-all shadow-xl ${creating ? 'bg-zinc-800 text-zinc-600' : 'bg-gold text-black hover:scale-105 active:scale-95 shadow-gold/10'}`}
                        >
                            {creating ? 'CRÉATION EN COURS...' : 'VALIDER ET CRÉER LE COMPTE'}
                        </button>
                    </div>
                </form>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 text-center shadow-lg ${message.type === 'success' ? 'bg-green-900/40 text-green-300 border border-green-500/30' : 'bg-red-900/40 text-red-300 border border-red-500/30'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-800 shadow-2xl backdrop-blur-md">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Administrateur</th>
                            <th className="p-6">Identifiant Unique</th>
                            <th className="p-6">Rôle & Droits</th>
                            <th className="p-6">Statut</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-20 text-center animate-pulse text-gold font-black uppercase tracking-widest text-xs">Synchronisation avec le noyau...</td></tr>
                        ) : admins.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-zinc-600 font-bold uppercase text-xs tracking-widest">Aucun adjoint détecté</td></tr>
                        ) : admins.map(admin => (
                            <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 shadow-lg">
                                            {admin.avatar_url ? (
                                                <img src={admin.avatar_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-gradient-to-br from-zinc-800 to-zinc-900">
                                                    <IconUser size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-black text-white group-hover:text-gold transition-colors tracking-tight text-sm">
                                                {admin.display_name || 'Sans Nom'}
                                            </div>
                                            <div className="text-[10px] text-zinc-500 font-bold">{admin.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-lg inline-flex flex-col">
                                        <span className="text-[10px] font-black text-gold tracking-widest leading-none mb-1">{admin.external_id || '---'}</span>
                                        <span className="text-[8px] text-zinc-600 font-mono uppercase leading-none">{admin.id.substring(0, 18)}...</span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest w-fit ${admin.role === 'master' ? 'bg-gold/10 text-gold border border-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'bg-blue-900/10 text-blue-400 border border-blue-500/20'}`}>
                                            {admin.role === 'master' && <IconShield size={10} />}
                                            {admin.role.toUpperCase()}
                                        </span>
                                        {admin.role !== 'master' && admin.permissions && (
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(admin.permissions || {})
                                                    .filter(([_, val]) => val)
                                                    .map(([key]) => {
                                                        const label = key.replace('can_', '').replace('manage_', '').replace('view_', '').replace('edit_', '').replace('_', ' ');
                                                        return (
                                                            <span key={key} className="text-[7px] font-black text-zinc-600 uppercase border border-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                <div className="w-1 h-1 bg-gold rounded-full" />
                                                                {label}
                                                            </span>
                                                        );
                                                    })
                                                }
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${admin.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${admin.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                            {admin.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    {admin.email !== 'ahrafalnazar@gmail.com' ? (
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingAdmin(admin)}
                                                className="p-2.5 bg-zinc-800 hover:bg-gold hover:text-black text-zinc-400 rounded-xl transition-all"
                                                title="Modifier"
                                            >
                                                <IconEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(admin)}
                                                className="p-2.5 bg-zinc-800 hover:bg-blue-600 hover:text-white text-zinc-400 rounded-xl transition-all"
                                                title="Reset Password"
                                            >
                                                <IconLock size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(admin.id, admin.status === 'active' ? 'blocked' : 'active')}
                                                className={`p-2.5 rounded-xl border transition-all ${admin.status === 'active' ? 'border-red-500/20 text-red-500/50 hover:bg-red-500 hover:text-white' : 'border-green-500/20 text-green-500/50 hover:bg-green-500 hover:text-white'}`}
                                                title={admin.status === 'active' ? 'Bloquer' : 'Débloquer'}
                                            >
                                                {admin.status === 'active' ? <IconX size={16} /> : <IconCheck size={16} />}
                                            </button>
                                            <button
                                                onClick={() => deleteAdmin(admin.id)}
                                                className="p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-red-600 hover:text-white text-zinc-600 rounded-xl transition-all"
                                                title="Supprimer"
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gold/5 px-4 py-2 rounded-xl border border-gold/10 inline-flex items-center gap-2">
                                            <IconCheck size={14} className="text-gold" />
                                            <span className="text-[10px] font-black text-gold/60 uppercase italic tracking-tighter">Immortel</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Édition */}
            {editingAdmin && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-white/[0.02] flex-shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Modifier l'adjoint</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{editingAdmin.email}</p>
                            </div>
                            <button onClick={() => setEditingAdmin(null)} className="p-3 bg-zinc-800 text-zinc-500 rounded-2xl hover:text-white transition-colors">
                                <IconX size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleUpdateAdmin} className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nom d'affichage</label>
                                        <input
                                            type="text"
                                            value={editingAdmin.display_name || ''}
                                            onChange={(e) => setEditingAdmin({ ...editingAdmin, display_name: e.target.value })}
                                            className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white outline-none focus:border-gold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Rôle Système</label>
                                        <select
                                            value={editingAdmin.role}
                                            onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value as AdminRole })}
                                            className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white outline-none focus:border-gold transition-all"
                                        >
                                            <option value="admin">Administrateur Standard</option>
                                            <option value="master">Master Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Téléphone</label>
                                        <input
                                            type="text"
                                            value={editingAdmin.phone || ''}
                                            onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value })}
                                            className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-gold transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">WhatsApp</label>
                                        <input
                                            type="text"
                                            value={editingAdmin.whatsapp || ''}
                                            onChange={(e) => setEditingAdmin({ ...editingAdmin, whatsapp: e.target.value })}
                                            className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-green-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">GitHub</label>
                                        <input
                                            type="text"
                                            value={editingAdmin.github || ''}
                                            onChange={(e) => setEditingAdmin({ ...editingAdmin, github: e.target.value })}
                                            className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Facebook</label>
                                        <input
                                            type="text"
                                            value={editingAdmin.facebook || ''}
                                            onChange={(e) => setEditingAdmin({ ...editingAdmin, facebook: e.target.value })}
                                            className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">TikTok</label>
                                        <input
                                            type="text"
                                            value={editingAdmin.tiktok || ''}
                                            onChange={(e) => setEditingAdmin({ ...editingAdmin, tiktok: e.target.value })}
                                            className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-pink-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">QR Code Identity</label>
                                        <div className="relative group">
                                            <div className="w-full h-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center overflow-hidden">
                                                {editingAdmin.qr_code_url ? <IconCheck className="text-gold" /> : <span className="text-[10px] text-zinc-600 font-bold">Aucun QR</span>}
                                            </div>
                                            <input
                                                type="file"
                                                onChange={async (e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0]
                                                        const path = `qrcodes/${Date.now()}_${file.name}`
                                                        await supabase.storage.from('images').upload(path, file)
                                                        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
                                                        setEditingAdmin({ ...editingAdmin, qr_code_url: publicUrl })
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gold uppercase tracking-[0.3em] mb-4">Privilèges Accès</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {Object.keys(permissions).map(key => (
                                            <label key={key} className="flex items-center gap-3 p-4 bg-black border border-zinc-800/50 rounded-2xl cursor-pointer hover:border-gold/40 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={editingAdmin.permissions?.[key] || false}
                                                    onChange={(e) => setEditingAdmin({
                                                        ...editingAdmin,
                                                        permissions: { ...editingAdmin.permissions, [key]: e.target.checked }
                                                    })}
                                                    className="w-4 h-4 accent-gold"
                                                />
                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                                                    {key.replace('can_manage_', '').replace('_', ' ')}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingAdmin(null)}
                                        className="px-8 py-4 bg-zinc-800 text-zinc-400 font-black rounded-2xl hover:text-white transition-all"
                                    >
                                        ANNULER
                                    </button>
                                    <button
                                        disabled={saving}
                                        className="px-10 py-4 bg-gold text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-gold/10"
                                    >
                                        {saving ? 'ENREGISTREMENT...' : 'SAUVEGARDER'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
