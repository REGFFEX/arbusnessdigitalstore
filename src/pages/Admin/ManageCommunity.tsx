import React, { useState, useEffect } from 'react'
import { getCommunityPosts, createCommunityPost, updateCommunityPost, deleteCommunityPost, CommunityPost } from '../../services/community'
import { supabase } from '../../config/supabase'
import { uploadToStorage, getPublicUrl } from '../../services/admin'
import { IconX, IconTrending, IconCheck, IconMusic, IconFile, IconDownload } from '../../components/Icons'
import SmartSearch from '../../components/SmartSearch'

export default function ManageCommunity() {
    const [posts, setPosts] = useState<CommunityPost[]>([])
    const [loading, setLoading] = useState(true)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<CommunityPost>({
        title: '',
        content: '',
        media_type: 'image',
        external_links: [{ label: '', url: '' }],
        theme: 'glass',
        metadata: { image_width: '100', link_color: '#ffffff' }
    })
    const [selectedAdminId, setSelectedAdminId] = useState('')
    const [postLoading, setPostLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Identity Extension
    const [identityMode, setIdentityMode] = useState<'real' | 'pseudo' | 'photo' | 'anonymous'>('real')
    const [selectedPseudo, setSelectedPseudo] = useState('')
    const [pseudos, setPseudos] = useState<string[]>([])
    const [newPseudo, setNewPseudo] = useState('')

    // Multi-File Extension
    const [files, setFiles] = useState<{ file: File, progress: number, preview: string, id: string }[]>([])
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        loadPosts()
        loadAdmins()
        // Load pseudos from localStorage
        const saved = localStorage.getItem('ar_community_pseudos')
        if (saved) setPseudos(JSON.parse(saved))
    }, [])

    const savePseudo = () => {
        if (!newPseudo.trim() || pseudos.includes(newPseudo)) return
        const updated = [...pseudos, newPseudo]
        setPseudos(updated)
        localStorage.setItem('ar_community_pseudos', JSON.stringify(updated))
        setNewPseudo('')
        setSelectedPseudo(newPseudo)
    }

    const handleFileSelect = (newFiles: FileList | null) => {
        if (!newFiles) return
        const arr = Array.from(newFiles).map(f => ({
            file: f,
            progress: 0,
            preview: URL.createObjectURL(f),
            id: Math.random().toString(36).substr(2, 9)
        }))
        setFiles(prev => [...prev, ...arr])

        // Simuler upload progress
        arr.forEach(f => {
            let p = 0
            const interval = setInterval(() => {
                p += Math.random() * 30
                if (p >= 100) {
                    p = 100
                    clearInterval(interval)
                }
                setFiles(prev => prev.map(item => item.id === f.id ? { ...item, progress: p } : item))
            }, 300)
        })
    }

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    async function loadAdmins() {
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('id, name, role, avatar_url')
                .eq('status', 'active')
            if (data) setAdmins(data)
        } catch (err) {
            console.error("Error loading admins:", err)
        } finally {
            setLoadingAdmins(false)
        }
    }

    async function loadPosts() {
        try {
            const data = await getCommunityPosts()
            setPosts(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddLink = () => {
        setFormData(prev => ({
            ...prev,
            external_links: [...prev.external_links, { label: '', url: '' }]
        }))
    }

    const handleLinkChange = (index: number, field: 'label' | 'url', val: string) => {
        const next = [...formData.external_links]
        next[index][field] = val
        setFormData(prev => ({ ...prev, external_links: next }))
    }

    const [admins, setAdmins] = useState<any[]>([])
    const [loadingAdmins, setLoadingAdmins] = useState(true)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setPostLoading(true)
        setError(null)
        try {
            // 1. Upload multi-files (if new ones added)
            const media_urls: string[] = []
            if (files.length > 0) {
                for (const f of files) {
                    const path = `community/${Date.now()}_${f.file.name.replace(/\s+/g, '_')}`
                    await uploadToStorage('images', path, f.file)
                    media_urls.push(getPublicUrl('images', path))
                }
            }

            // 2. Prepare identity metadata
            const identity_metadata: any = {
                identity_mode: identityMode,
                ...(identityMode === 'pseudo' ? { pseudo: selectedPseudo } : {}),
                ...(identityMode === 'real' ? { admin_name: admins?.find(a => a.id === selectedAdminId)?.name } : {})
            }

            // 3. Prepare styling metadata
            const styling_metadata: any = {
                image_width: formData.metadata?.image_width || '100',
                link_color: formData.metadata?.link_color || '#ffffff'
            }

            // 4. Construct payload
            const payload: any = {
                title: formData.title,
                content: formData.content,
                theme: formData.theme || 'glass',
                external_links: formData.external_links.filter(l => l.url.trim()),
                metadata: {
                    ...(formData.metadata || {}),
                    ...identity_metadata,
                    ...styling_metadata,
                    files_count: files.length || formData.metadata?.files_count || 0,
                    all_media: media_urls.length > 0 ? media_urls : (formData.metadata?.all_media || [])
                }
            }

            if (media_urls.length > 0) {
                payload.media_url = media_urls[0]
                const type = files[0].file.type
                if (type.startsWith('image/')) payload.media_type = 'image'
                else if (type.startsWith('video/')) payload.media_type = 'video'
                else if (type.startsWith('audio/')) payload.media_type = 'audio'
                else payload.media_type = 'file'
            }

            if (isEditing && editingId) {
                payload.updated_at = new Date().toISOString()
                await updateCommunityPost(editingId, payload)
                setSuccessMsg('Publication mise à jour !')
            } else {
                await createCommunityPost(payload)
                setSuccessMsg('Publication diffusée avec succès !')
            }

            resetForm()
            setTimeout(() => setSuccessMsg(null), 4000)
            loadPosts()
        } catch (err: any) {
            console.error(err)
            setError(err.message ?? 'Erreur lors de la diffusion.')
        } finally {
            setPostLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({ title: '', content: '', media_type: 'image', external_links: [{ label: '', url: '' }], theme: 'glass', metadata: { image_width: '100', link_color: '#ffffff' } })
        setSelectedAdminId('')
        setFiles([])
        setIsEditing(false)
        setEditingId(null)
    }

    const handleEdit = (post: CommunityPost) => {
        setFormData({
            title: post.title,
            content: post.content,
            media_type: post.media_type,
            external_links: post.external_links.length > 0 ? post.external_links : [{ label: '', url: '' }],
            theme: post.theme || 'glass',
            metadata: post.metadata || { image_width: '100', link_color: '#ffffff' }
        })
        setIdentityMode(post.metadata?.identity_mode || 'anonymous')
        if (post.metadata?.pseudo) setSelectedPseudo(post.metadata.pseudo)
        if (post.admin_id) setSelectedAdminId(post.admin_id)
        setIsEditing(true)
        setEditingId(post.id!)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleDelete(id: string) {
        if (!confirm('Supprimer cette publication ?')) return
        try {
            // Soft delete: update status and set deleted_at
            await updateCommunityPost(id, {
                status: 'deleted',
                deleted_at: new Date().toISOString()
            })
            setSuccessMsg('Message marqué comme supprimé (Style WhatsApp)')
            setTimeout(() => setSuccessMsg(null), 4000)
            loadPosts()
        } catch (err) {
            console.error(err)
        }
    }

    // --- UI COMPONENTS FOR EMULATOR ---
    const CommunityBubble = ({ post, isPreview = false }: { post: CommunityPost, isPreview?: boolean }) => {
        const themeStyles = {
            glass: "bg-white/5 backdrop-blur-xl border-white/10 text-white",
            gold: "bg-gold/10 border-gold/30 text-gold",
            minimal: "bg-zinc-800 border-zinc-700 text-zinc-300",
            modern: "bg-blue-600/10 border-blue-500/20 text-white",
            dark: "bg-black/80 border-white/5 text-zinc-400"
        }

        const currentTheme = post.theme || 'glass'
        const style = themeStyles[currentTheme] || themeStyles.glass

        return (
            <div className={`max-w-[85%] rounded-[24px] rounded-tl-none border p-4 shadow-2xl transition-all duration-500 ${style} relative group`}>
                {!isPreview && (
                    <button
                        onClick={() => handleDelete(post.id!)}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg scale-0 group-hover:scale-100"
                    >
                        <IconX size={14} strokeWidth={3} />
                    </button>
                )}

                {post.media_url && (
                    <div
                        className="rounded-2xl overflow-hidden mb-3 border border-white/5 bg-black/20 mx-auto"
                        style={{ width: `${post.metadata?.image_width || 100}%` }}
                    >
                        {post.media_type === 'image' || !post.media_type ? (
                            <img src={post.media_url} className="w-full object-contain" alt="" />
                        ) : post.media_type === 'video' ? (
                            <video src={post.media_url} controls className="w-full aspect-video bg-black" />
                        ) : post.media_type === 'audio' ? (
                            <div className="p-4 bg-zinc-900/50 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                        <IconMusic size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black uppercase text-white truncate">Audio Clip</div>
                                        <div className="text-[8px] text-zinc-500 font-bold uppercase">Lecteur intégré</div>
                                    </div>
                                </div>
                                <audio src={post.media_url} controls className="w-full h-8" />
                            </div>
                        ) : (
                            <a href={post.media_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-zinc-800 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                                    <IconFile size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black uppercase text-white truncate">Télécharger le fichier</div>
                                    <div className="text-[8px] text-zinc-500 font-bold uppercase">Format {post.media_url.split('.').pop()?.toUpperCase() || 'Inconnu'}</div>
                                </div>
                                <IconDownload size={16} className="text-zinc-500" />
                            </a>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Diffusion Officielle</span>
                    </div>

                    <h4 className="text-sm font-black uppercase italic tracking-tighter leading-tight">{post.title}</h4>
                    <p className="text-[12px] leading-relaxed opacity-80 whitespace-pre-wrap">{post.content}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {post.external_links.map((link, idx) => (
                            link.url && (
                                <div
                                    key={idx}
                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border shadow-lg"
                                    style={{
                                        backgroundColor: `${post.metadata?.link_color || '#ffffff'}15`,
                                        borderColor: `${post.metadata?.link_color || '#ffffff'}30`,
                                        color: post.metadata?.link_color || '#ffffff'
                                    }}
                                >
                                    <IconTrending size={10} />
                                    {link.label || 'Explorer'}
                                </div>
                            )
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-1.5 mt-2">
                        {(post as any).admin_id && (
                            <div className="flex items-center gap-1 opacity-60">
                                <div className="w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center text-[8px] text-gold font-black">@</div>
                                <span className="text-[8px] font-black text-zinc-400 uppercase">
                                    {admins.find(a => a.id === (post as any).admin_id)?.name || 'PRO PROFILE LINKED'}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 opacity-40 ml-auto">
                            <span className="text-[9px] font-bold">
                                {post.created_at ? new Date(post.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Maintenant'}
                            </span>
                            <div className="flex items-center scale-75">
                                <IconCheck size={12} className="text-blue-400" />
                                <IconCheck size={12} className="text-blue-400 -ml-1.5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-[1400px] mx-auto">
            {/* Error / Success banners */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <IconX size={14} />{error}
                    <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400"><IconX size={12} /></button>
                </div>
            )}
            {successMsg && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <IconCheck size={14} />{successMsg}
                </div>
            )}
            <div className="flex flex-col lg:flex-row gap-10">

                {/* --- Left Column: Form & List --- */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Community <span className="text-gold">Pro</span></h2>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                Centre de diffusion temps réel
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={loadPosts}
                                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-gold transition-all"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
                            </button>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[40px] shadow-2xl backdrop-blur-md">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Titre de l'annonce</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none transition-all"
                                        placeholder="Ex: Mise à jour v2.0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Style de Bulle (Template)</label>
                                    <select
                                        value={formData.theme}
                                        onChange={e => setFormData(prev => ({ ...prev, theme: e.target.value as any }))}
                                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none transition-all appearance-none text-white font-bold"
                                    >
                                        <option value="glass">Glassmorphism (Default)</option>
                                        <option value="gold">Empire Gold</option>
                                        <option value="modern">Electric Blue</option>
                                        <option value="dark">Black Knight</option>
                                        <option value="minimal">Minimal Quartz</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Administrateur Diffusion</label>
                                    <select
                                        value={selectedAdminId}
                                        onChange={e => setSelectedAdminId(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none transition-all appearance-none text-white font-bold"
                                    >
                                        <option value="">Anonyme (AR BUSINESS)</option>
                                        {admins.map(admin => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.name} ({admin.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Custom Styling Controls */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Taille Image (%)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="100"
                                        value={formData.metadata?.image_width || 100}
                                        onChange={e => setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, image_width: e.target.value } }))}
                                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Couleur des liens</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.metadata?.link_color || '#ffffff'}
                                            onChange={e => setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, link_color: e.target.value } }))}
                                            className="w-14 h-14 bg-black border border-zinc-800 rounded-xl p-1 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.metadata?.link_color || '#ffffff'}
                                            onChange={e => setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, link_color: e.target.value } }))}
                                            className="flex-1 bg-black border border-zinc-800 rounded-2xl px-4 text-sm focus:border-gold outline-none transition-all"
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Identity Selector */}
                            <div className="space-y-4 bg-zinc-800/20 p-6 rounded-3xl border border-zinc-800">
                                <label className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 block">Identité de Publication</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { id: 'real', label: 'Nom Réel', sub: 'Admin Visible' },
                                        { id: 'pseudo', label: 'Pseudonyme', sub: 'Nom Choisi' },
                                        { id: 'photo', label: 'Anonyme+', sub: 'Photo Uniq.' },
                                        { id: 'anonymous', label: 'Anonyme', sub: 'AR Business' }
                                    ].map(mode => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setIdentityMode(mode.id as any)}
                                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${identityMode === mode.id ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{mode.label}</span>
                                            <span className={`text-[8px] font-bold opacity-60`}>{mode.sub}</span>
                                        </button>
                                    ))}
                                </div>

                                {identityMode === 'pseudo' && (
                                    <div className="pt-4 animate-in slide-in-from-top-2 duration-300 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nouveau pseudo..."
                                                value={newPseudo}
                                                onChange={e => setNewPseudo(e.target.value)}
                                                className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-xs outline-none focus:border-gold"
                                            />
                                            <button type="button" onClick={savePseudo} className="bg-zinc-800 px-4 rounded-xl text-[10px] font-black uppercase text-gold">Ajouter</button>
                                        </div>
                                        {pseudos.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {pseudos.map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setSelectedPseudo(p)}
                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedPseudo === p ? 'bg-gold/20 text-gold border border-gold/50' : 'bg-black text-zinc-600 border border-zinc-900'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Système de Fichiers (Style WhatsApp)</label>
                                <div
                                    className={`relative group transition-all rounded-3xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-4 ${isDragging ? 'border-gold bg-gold/5' : 'border-zinc-800 bg-black/40 hover:border-gold/30'}`}
                                    onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files) }}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        onChange={e => handleFileSelect(e.target.files)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        id="multi-upload"
                                    />
                                    <div className="w-16 h-16 rounded-[24px] bg-zinc-900 flex items-center justify-center text-zinc-600 group-hover:text-gold transition-all group-hover:scale-110 group-hover:rotate-12">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Glissez-déposez vos fichiers</p>
                                        <p className="text-[8px] text-zinc-600 font-bold uppercase mt-1">Multi-upload • Images, Vidéos, Docs, ZIP</p>
                                    </div>
                                </div>

                                {/* List of files */}
                                {files.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                                        {files.map(f => (
                                            <div key={f.id} className="bg-black/40 border border-zinc-800 rounded-2xl p-3 relative group/file">
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(f.id)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-all z-10"
                                                >
                                                    <IconX size={10} strokeWidth={3} />
                                                </button>
                                                <div className="aspect-square rounded-xl bg-zinc-900 overflow-hidden mb-2 border border-zinc-800">
                                                    {f.file.type.startsWith('image/') ? (
                                                        <img src={f.preview} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-zinc-700 uppercase p-2 text-center">
                                                            {f.file.name.split('.').pop()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gold transition-all duration-300" style={{ width: `${f.progress}%` }}></div>
                                                </div>
                                                <p className="text-[8px] text-zinc-500 font-bold truncate mt-2">{f.file.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message de diffusion</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.content}
                                    onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none resize-none transition-all"
                                    placeholder="Partagez l'actualité avec la communauté..."
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Actions Interactives (Liens)</label>
                                    <button type="button" onClick={handleAddLink} className="text-[10px] font-black text-gold uppercase underline decoration-gold/30">+ Ajouter Lien</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.external_links.map((link, i) => (
                                        <div key={i} className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
                                            <input
                                                placeholder="Label (ex: Rejoindre)"
                                                value={link.label}
                                                onChange={e => handleLinkChange(i, 'label', e.target.value)}
                                                className="flex-1 bg-black border border-zinc-800 rounded-xl p-3 text-[11px] outline-none focus:border-gold font-bold"
                                            />
                                            <input
                                                placeholder="URL sécurisée"
                                                value={link.url}
                                                onChange={e => handleLinkChange(i, 'url', e.target.value)}
                                                className="flex-[2] bg-black border border-zinc-800 rounded-xl p-3 text-[11px] outline-none focus:border-gold opacity-60 focus:opacity-100"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-700 transition-all border border-zinc-700"
                                    >
                                        ANNULER
                                    </button>
                                )}
                                <button
                                    disabled={postLoading}
                                    className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 ${isEditing ? 'bg-blue-600 text-white shadow-blue-500/10' : 'bg-gold text-black shadow-gold/10 hover:bg-white'}`}
                                >
                                    {postLoading ? (isEditing ? 'MISE À JOUR...' : 'DIFFUSION...') : (isEditing ? 'ENREGISTRER LES MODIFS' : 'LANCER LA DIFFUSION')}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Historical List */}
                    <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Historique des diffusions</h3>
                        {loading ? (
                            <div className="py-10 text-center animate-pulse text-[10px] font-black text-zinc-700">SYNCHRONISATION...</div>
                        ) : posts.length === 0 ? (
                            <div className="py-10 text-center text-[10px] font-black text-zinc-800 italic">AUCUNE DIFFUSION DANS LE STORE</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {posts.map(post => {
                                    const isSoftDeleted = post.status === 'deleted'
                                    return (
                                        <div key={post.id} className={`p-5 rounded-3xl border flex items-center justify-between group transition-all ${isSoftDeleted ? 'bg-red-500/5 border-red-500/20 opacity-60' : 'bg-zinc-900/40 border-zinc-800 hover:border-gold/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center shrink-0 border border-zinc-700/50 overflow-hidden">
                                                    {post.media_url ? <img src={post.media_url} className="w-full h-full object-cover" /> : '📢'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-black text-white italic truncate max-w-[200px]">{post.title}</h4>
                                                        {isSoftDeleted && <span className="text-[7px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full uppercase">Supprimé</span>}
                                                    </div>
                                                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                                                        {post.created_at ? new Date(post.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'} • {post.theme || 'Default'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isSoftDeleted && (
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="p-3 bg-blue-500/5 text-blue-500/40 hover:bg-blue-600 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(post.id!)}
                                                    className={`p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${isSoftDeleted ? 'bg-red-500 text-white' : 'bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white'}`}
                                                >
                                                    <IconX size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Emulator --- */}
                <div className="lg:w-[450px] shrink-0">
                    <div className="sticky top-28 space-y-6">
                        <div className="text-right">
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Community <span className="text-gold">Emulator</span></h3>
                            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Simulation en temps réel (App Preview)</p>
                        </div>

                        {/* iPhone Frame */}
                        <div className="relative w-full aspect-[9/18] bg-zinc-900 rounded-[50px] border-[6px] border-zinc-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden">
                            {/* Status Bar */}
                            <div className="absolute top-0 left-0 right-0 h-10 px-8 flex justify-between items-end pb-1 text-[9px] font-bold text-white/40 z-20">
                                <span>9:41</span>
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-3 h-3 border border-current rounded-[2px]"></div>
                                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                                </div>
                            </div>

                            {/* App Content */}
                            <div className="absolute inset-0 bg-[#0a0a0b] flex flex-col pt-12">
                                {/* Community Header */}
                                <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                                            <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                                                <span className="text-[10px] font-black text-black">AR</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-white">Communauté AR</p>
                                            <p className="text-[9px] text-zinc-500 font-bold">Bot de diffusion • En ligne</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Scroll Area */}
                                <div className="flex-1 p-4 flex flex-col justify-end space-y-6 overflow-hidden">
                                    <div className="text-center">
                                        <span className="bg-white/5 px-3 py-1 rounded-full text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Aujourd'hui</span>
                                    </div>

                                    {/* Mock previous message */}
                                    <div className="max-w-[80%] bg-zinc-900 border border-white/5 rounded-[20px] rounded-tl-none p-3 text-[10px] text-zinc-500 italic opacity-40">
                                        Bienvenue dans le salon officiel...
                                    </div>

                                    {/* Live Preview Bubble */}
                                    <CommunityBubble post={formData} isPreview={true} />
                                </div>

                                {/* Mock Input Bar */}
                                <div className="p-4 pt-2 pb-8 bg-zinc-950/80 backdrop-blur-md">
                                    <div className="bg-zinc-900 h-10 rounded-full flex items-center px-4 gap-3">
                                        <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                                        <span className="text-[10px] text-zinc-600 font-bold italic">Lecture seule...</span>
                                    </div>
                                </div>
                            </div>

                            {/* Side Buttons Mock */}
                            <div className="absolute right-[-2px] top-32 w-0.5 h-16 bg-zinc-700 rounded-l-md"></div>
                            <div className="absolute left-[-2px] top-24 w-0.5 h-10 bg-zinc-700 rounded-r-md"></div>
                        </div>

                        <div className="bg-gold/5 p-4 rounded-3xl border border-gold/10 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                                <IconCheck size={16} className="text-gold" />
                            </div>
                            <p className="text-[9px] text-zinc-500 leading-relaxed italic font-bold">
                                Note : L'émulateur affiche exactement le rendu final sur le Store Mobile des utilisateurs. Assurez-vous que le texte n'est pas trop long pour une lecture optimale.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
