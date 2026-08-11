import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import {
    getSiteSettings, updateSiteSettings,
    getPaymentSettings, updatePaymentSettings,
    getBrandingMessages, createBrandingMessage, updateBrandingMessage, deleteBrandingMessage,
    uploadToStorage, getPublicUrl, purgeSystemLogs
} from '../../services/admin'
import {
    IconPackage, IconX, IconCheck, IconSettings, IconSparkle,
    IconSearch, IconEye, IconBriefcase, IconGlobe, IconLayout,
    IconMegaphone, IconEdit, IconShield, IconDeviceMobile, IconLayoutList,
    IconCreditCard, IconMessageCircle, IconPlus, IconTrash, IconBuilding, IconPalette, IconInfoCircle,
    IconCenterLogo
} from '../../components/Icons'

const DEFAULT_LOGO = "https://fxyidvshonjzkzihvmsy.supabase.co/storage/v1/object/public/images/branding/ar-business-logo-gold.png";

type TabType = 'branding' | 'ribbon' | 'content' | 'visibility' | 'payment' | 'messages' | 'system';

const AVAILABLE_PATHS = [
    { name: 'Accueil', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'Catégories', path: '/categories' },
    { name: 'Premium', path: '/premium' },
    { name: 'Services', path: '/services' },
    { name: 'À Propos', path: '/about' },
    { name: 'Communauté', path: '/community' },
    { name: 'Roadmap', path: '/roadmap' },
];

export default function VisualManagement() {
    const FALLBACK_SETTINGS = {
        site_name: 'AR Business',
        site_slogan: 'Votre partenaire digital',
        logo_url: DEFAULT_LOGO,
        logo_border_radius: '16px',
        logo_targets: { navbar: true, footer: true, ribbon: false, auth: true },
        ribbon_enabled: true,
        ribbon_targets: ['/', '/store', '/categories', '/services', '/community'],
        ribbon_text_desktop: '',
        ribbon_text_mobile: '',
        store_titles: { hero_title: '', services_title: '', community_title: '' },
        site_content: {
            home: { hero: { title: '', subtitle: '' } },
            services: { header: { title: '', subtitle: '' } },
            community: { header: { title: '', subtitle: '' } }
        },
        maintenance_mode: false,
        section_visibility: {
            home_hero: true,
            home_categories: true,
            home_sections: true,
            home_cta: true,
            footer_sitemap: true,
            global_search: true,
            global_ads: true,
            global_social: true
        }
    }

    const [settings, setSettings] = useState<any>(FALLBACK_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('branding')
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoCenterFile, setLogoCenterFile] = useState<File | null>(null)
    const [logoCenterPreview, setLogoCenterPreview] = useState<string | null>(null)

    // Identity (Site Branding)
    const [brandingName, setBrandingName] = useState('')
    const [brandingDesc, setBrandingDesc] = useState('')
    const [brandingLocation, setBrandingLocation] = useState('')
    const [autoScrollMessages, setAutoScrollMessages] = useState(true)

    // Payment Settings
    const [pSettings, setPSettings] = useState({
        mtn_number: '',
        airtel_number: '',
        orange_number: '',
        paypal_email: '',
        payment_instruction: '',
        mtn_checkout_url: '',
        airtel_checkout_url: '',
        orange_checkout_url: ''
    })

    // Branding Messages
    const [messages, setMessages] = useState<any[]>([])
    const [editingMsg, setEditingMsg] = useState<any>(null)
    const [msgForm, setMsgForm] = useState({ title: '', content: '', active: true, file_url: '' })

    useEffect(() => {
        loadVisualSettings()
    }, [])

    async function loadVisualSettings() {
        setLoading(true)
        try {
            const data = await getSiteSettings()

            // Merge with fallback to ensure no missing fields
            const merged = {
                ...FALLBACK_SETTINGS,
                ...data,
                logo_targets: { ...FALLBACK_SETTINGS.logo_targets, ...(data?.logo_targets || {}) },
                section_visibility: { ...FALLBACK_SETTINGS.section_visibility, ...(data?.section_visibility || {}) },
                store_titles: { ...FALLBACK_SETTINGS.store_titles, ...(data?.store_titles || {}) },
                site_content: { ...FALLBACK_SETTINGS.site_content, ...(data?.site_content || {}) }
            }
            setSettings(merged)
            setLogoPreview(merged.logo_url || DEFAULT_LOGO)
            setLogoCenterPreview(merged.logo_center_url || null)

            // Load extra sections
            const [pData, mData] = await Promise.all([
                getPaymentSettings(),
                getBrandingMessages()
            ])

            if (data) {
                setBrandingName(data.branding_name || 'AR BUSINESS Digital')
                setBrandingDesc(data.branding_description || '')
                setBrandingLocation(data.branding_location || 'Congo-Brazzaville')
                setAutoScrollMessages(data.branding_autoscroll !== false)
            }
            if (pData) setPSettings(pData)
            setMessages(mData)
        } catch (err) {
            console.error('VisualManagement Load Error:', err)
            // Even on error, we stay with fallback settings initialized above
            setLogoPreview(DEFAULT_LOGO)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        setMessage(null)

        try {
            let finalLogoUrl = settings.logo_url
            if (logoFile) {
                const path = `branding/custom_logo_${Date.now()}_${logoFile.name}`
                await uploadToStorage('images', path, logoFile)
                finalLogoUrl = getPublicUrl('images', path)
            }

            let finalLogoCenterUrl = settings.logo_center_url
            if (logoCenterFile) {
                const path = `branding/center_logo_${Date.now()}_${logoCenterFile.name}`
                await uploadToStorage('images', path, logoCenterFile)
                finalLogoCenterUrl = getPublicUrl('images', path)
            }

            const updates = {
                ...settings,
                logo_url: finalLogoUrl,
                logo_center_url: finalLogoCenterUrl,
                branding_name: brandingName,
                branding_description: brandingDesc,
                branding_location: brandingLocation,
                branding_autoscroll: autoScrollMessages,
                updated_at: new Date().toISOString()
            }

            await Promise.all([
                updateSiteSettings(updates),
                updatePaymentSettings(pSettings)
            ])

            setMessage({ type: 'success', text: 'Configuration globale synchronisée avec succès !' })
            setLogoFile(null)
            setLogoCenterFile(null)
            loadVisualSettings() // Reload to ensure sync
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        } finally {
            setSaving(false)
        }
    }

    // --- Message Handlers ---
    async function handleSaveMessage() {
        try {
            if (editingMsg === 'new') {
                await createBrandingMessage(msgForm)
            } else {
                await updateBrandingMessage(editingMsg, msgForm)
            }
            const mData = await getBrandingMessages()
            setMessages(mData)
            setEditingMsg(null)
            setMessage({ type: 'success', text: 'Message de branding mis à jour !' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        }
    }

    async function handleDeleteMessage(id: string) {
        if (!confirm('Supprimer ce message ?')) return
        try {
            await deleteBrandingMessage(id)
            setMessages(messages.filter(m => m.id !== id))
            setMessage({ type: 'success', text: 'Message supprimé.' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        }
    }

    // --- System Handlers ---
    async function handlePurgeLogs() {
        if (!confirm('Voulez-vous vraiment supprimer les logs de plus de 30 jours ?')) return
        try {
            const result = await purgeSystemLogs(30)
            setMessage({ type: 'success', text: `Succès : ${result.count} entrées supprimées.` })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message })
        }
    }

    async function handleClearCache() {
        if (!confirm('Voulez-vous vider le cache local ?')) return
        localStorage.clear()
        window.location.reload()
    }

    const resetLogo = () => {
        if (confirm("Réinitialiser le logo par défaut ?")) {
            setLogoPreview(DEFAULT_LOGO)
            setSettings({ ...settings, logo_url: DEFAULT_LOGO, logo_border_radius: '16px' })
            setLogoFile(null)
        }
    }

    const applyLogoToAll = (value: boolean) => {
        const newTargets = {
            navbar: value,
            footer: value,
            auth: value,
            ribbon: value
        }
        setSettings({ ...settings, logo_targets: newTargets })
    }

    const toggleRibbonTarget = (path: string) => {
        const targets = [...(settings.ribbon_targets || [])]
        if (targets.includes(path)) {
            setSettings({ ...settings, ribbon_targets: targets.filter(p => p !== path) })
        } else {
            setSettings({ ...settings, ribbon_targets: [...targets, path] })
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-40 space-y-4">
            <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            <p className="text-[10px] font-black text-gold uppercase tracking-[0.3em] animate-pulse">Initialisation du Studio...</p>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-zinc-900/90 p-10 rounded-[40px] border border-zinc-800 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gold/10 rounded-lg text-gold">
                            <IconSettings size={20} />
                        </div>
                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Studio Visuel</span>
                    </div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Visual <span className="text-gold">Management</span></h2>
                    <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[0.2em] mt-2">Personnalisation avancée de l'identité et du contenu</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="group relative px-10 py-5 bg-gold text-black font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-gold/20 flex items-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 slant" />
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                        <IconCheck size={20} strokeWidth={3} />
                    )}
                    <span className="relative uppercase tracking-widest text-xs">Synchroniser</span>
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1.5 bg-zinc-900/80 rounded-[28px] border border-zinc-800/50 backdrop-blur-md sticky top-4 z-40">
                <button
                    onClick={() => setActiveTab('branding')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'branding' ? 'bg-gold text-black shadow-lg shadow-gold/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <IconSparkle size={16} /> Identité
                </button>
                <button
                    onClick={() => setActiveTab('visibility')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visibility' ? 'bg-gold text-black shadow-lg shadow-gold/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <IconEye size={16} /> Visibilité
                </button>
                <button
                    onClick={() => setActiveTab('ribbon')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ribbon' ? 'bg-gold text-black shadow-lg shadow-gold/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <IconMegaphone size={16} /> Rubans
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-gold text-black shadow-lg shadow-gold/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <IconLayoutList size={16} /> Contenu
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payment' ? 'bg-gold text-black shadow-lg shadow-gold/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <IconCreditCard size={16} /> Paiements
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'messages' ? 'bg-gold text-black shadow-lg shadow-gold/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <IconMessageCircle size={16} /> Messages
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-gold text-black shadow-lg shadow-gold/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <IconBuilding size={16} /> Système
                </button>
            </div>

            {message && (
                <div className={`p-6 rounded-[32px] font-black uppercase tracking-widest text-[10px] flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {message.type === 'success' ? <IconCheck size={20} /> : <IconX size={20} />}
                    </div>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* BRANDING TAB */}
                {activeTab === 'branding' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 shadow-2xl space-y-8">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                                Logotype Master
                            </h3>

                            <div className="group relative w-full aspect-video bg-black rounded-[32px] border border-zinc-800/50 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer">
                                {logoPreview ? (
                                    <img
                                        src={logoPreview}
                                        alt="Logo Preview"
                                        className="max-w-[60%] max-h-[60%] object-contain transition-all duration-700 group-hover:scale-110"
                                        style={{ borderRadius: settings.logo_border_radius || '16px' }}
                                    />
                                ) : <IconPackage size={48} className="text-zinc-800" />}

                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                                    <label className="px-8 py-4 bg-white text-black font-black rounded-2xl cursor-pointer hover:bg-gold transition-colors text-xs uppercase tracking-widest shadow-xl active:scale-95">
                                        Importer Nouveau
                                        <input type="file" className="hidden" onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                setLogoFile(file)
                                                setLogoPreview(URL.createObjectURL(file))
                                            }
                                        }} />
                                    </label>
                                    <button onClick={resetLogo} className="text-[9px] font-black text-white/50 hover:text-rose-500 uppercase tracking-[0.2em] transition-colors">
                                        Réinitialiser par défaut
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Radius (PX)</label>
                                    <input
                                        type="text"
                                        value={settings.logo_border_radius || '16px'}
                                        onChange={(e) => setSettings({ ...settings, logo_border_radius: e.target.value })}
                                        className="w-full bg-transparent text-white font-mono text-xl outline-none"
                                        placeholder="16px"
                                    />
                                </div>
                                <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Nom du Store</label>
                                    <input
                                        type="text"
                                        value={settings.site_name || ''}
                                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                        className="w-full bg-transparent text-white font-black text-xl outline-none"
                                        placeholder="AR BUSINESS"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 shadow-2xl space-y-8">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                                Identité & Storytelling
                            </h3>
                            
                            <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 space-y-4">
                                <label className="text-[9px] font-black text-gold uppercase tracking-widest block ml-1">Logo AR Center (Spécial)</label>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 group relative">
                                        {logoCenterPreview ? (
                                            <img src={logoCenterPreview} className="w-full h-full object-contain" alt="" />
                                        ) : (
                                            <IconCenterLogo size={32} className="text-zinc-600" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <label className="cursor-pointer p-2 bg-white text-black rounded-lg">
                                                <IconEdit size={14} />
                                                <input type="file" className="hidden" onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        setLogoCenterFile(file)
                                                        setLogoCenterPreview(URL.createObjectURL(file))
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Personnalisez le logo du Centre AR (Airplane + AR Style).</p>
                                        {logoCenterPreview && (
                                            <button onClick={() => { setLogoCenterPreview(null); setSettings({ ...settings, logo_center_url: null }); setLogoCenterFile(null) }} className="text-[8px] text-red-400 font-black uppercase hover:underline">Réinitialiser l'icône système</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Nom AR BUSINESS</label>
                                        <input
                                            type="text"
                                            value={brandingName}
                                            onChange={(e) => setBrandingName(e.target.value)}
                                            className="w-full bg-transparent text-white font-black text-sm outline-none"
                                        />
                                    </div>
                                    <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Localisation</label>
                                        <input
                                            type="text"
                                            value={brandingLocation}
                                            onChange={(e) => setBrandingLocation(e.target.value)}
                                            className="w-full bg-transparent text-white font-black text-sm outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 space-y-2">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Description À Propos</label>
                                    <textarea
                                        rows={3}
                                        value={brandingDesc}
                                        onChange={(e) => setBrandingDesc(e.target.value)}
                                        className="w-full bg-transparent text-white font-medium text-xs outline-none resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="p-6 bg-black/40 rounded-3xl border border-zinc-800/50 space-y-3">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Accroche Marketing</label>
                                    <textarea
                                        rows={2}
                                        value={settings.site_slogan || ''}
                                        onChange={(e) => setSettings({ ...settings, site_slogan: e.target.value })}
                                        className="w-full bg-transparent text-white font-bold text-sm outline-none resize-none"
                                        placeholder="Votre partenaire digital..."
                                    />
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group ml-2">
                                    <input
                                        type="checkbox"
                                        checked={autoScrollMessages}
                                        onChange={(e) => setAutoScrollMessages(e.target.checked)}
                                        className="w-4 h-4 rounded border-zinc-800 bg-black text-gold focus:ring-gold"
                                    />
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-gold transition-colors italic">Défilement auto (Bloc Branding)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAYMENT TAB */}
                {activeTab === 'payment' && (
                    <div className="bg-zinc-900 p-10 rounded-[40px] border border-zinc-800 shadow-2xl space-y-10 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                Configuration des Paiements
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="p-8 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <IconDeviceMobile size={14} /> Mobile Money
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Numéro MTN</label>
                                            <input type="text" value={pSettings.mtn_number} onChange={e => setPSettings({ ...pSettings, mtn_number: e.target.value })} className="w-full bg-transparent text-white font-black text-sm outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Numéro Airtel</label>
                                            <input type="text" value={pSettings.airtel_number} onChange={e => setPSettings({ ...pSettings, airtel_number: e.target.value })} className="w-full bg-transparent text-white font-black text-sm outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <IconGlobe size={14} /> International
                                    </h4>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email PayPal</label>
                                        <input type="email" value={pSettings.paypal_email} onChange={e => setPSettings({ ...pSettings, paypal_email: e.target.value })} className="w-full bg-transparent text-white font-black text-sm outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-8 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <IconInfoCircle size={14} /> Flux Utilisateur
                                    </h4>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Action du Bouton (Instruction)</label>
                                        <textarea
                                            rows={2}
                                            value={pSettings.payment_instruction}
                                            onChange={e => setPSettings({ ...pSettings, payment_instruction: e.target.value })}
                                            className="w-full bg-transparent text-white font-bold text-xs outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all resize-none"
                                            placeholder="Ex: Redirection vers la plateforme sécurisée..."
                                        />
                                    </div>
                                </div>
                                <div className="bg-blue-500/5 p-8 rounded-[32px] border border-blue-500/10">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic mb-2">Note sur les Paiements</h4>
                                    <p className="text-[9px] text-zinc-500 font-medium leading-relaxed uppercase">
                                        Ces informations sont utilisées dans le modal de paiement client. Assurez-vous que les numéros sont corrects.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MESSAGES TAB */}
                {activeTab === 'messages' && (
                    <div className="bg-zinc-900 p-10 rounded-[40px] border border-zinc-800 shadow-2xl space-y-10 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                                Messages Officiels & Branding
                            </h3>
                            <button
                                onClick={() => { setEditingMsg('new'); setMsgForm({ title: '', content: '', active: true, file_url: '' }) }}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-black rounded-2xl text-[10px] font-black hover:scale-105 transition-all uppercase tracking-widest"
                            >
                                <IconPlus size={16} /> Nouveau Message
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {messages.map(msg => (
                                <div key={msg.id} className={`p-6 rounded-[32px] border transition-all flex flex-col justify-between group h-48 ${msg.active ? 'bg-black/40 border-zinc-800 hover:border-gold/30' : 'bg-black/10 border-zinc-900 opacity-50'}`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${msg.active ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                                {msg.active ? 'Actif' : 'Masqué'}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditingMsg(msg.id); setMsgForm(msg) }} className="p-2 text-zinc-500 hover:text-gold transition-colors"><IconEdit size={14} /></button>
                                                <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><IconTrash size={14} /></button>
                                            </div>
                                        </div>
                                        <p className="text-xs font-black text-white truncate uppercase italic mb-2 tracking-tighter">{msg.title}</p>
                                        <p className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed">{msg.content}</p>
                                    </div>
                                    {msg.file_url && (
                                        <div className="flex items-center gap-2 text-[8px] font-black text-gold uppercase tracking-widest mt-4">
                                            <IconCheck size={10} /> Document Attaché
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {editingMsg && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
                                <div className="bg-zinc-900 w-full max-w-2xl rounded-[40px] border border-zinc-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                                    <div className="p-10 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                                <IconMessageCircle className="text-gold" />
                                                Édition du <span className="text-gold">Message</span>
                                            </h4>
                                            <button onClick={() => setEditingMsg(null)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                                                <IconX size={24} />
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Titre du Message</label>
                                                    <input value={msgForm.title} onChange={e => setMsgForm({ ...msgForm, title: e.target.value })} className="w-full p-4 rounded-2xl bg-black border border-zinc-800 focus:border-gold outline-none text-white text-xs font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Lien Document</label>
                                                    <input value={msgForm.file_url} onChange={e => setMsgForm({ ...msgForm, file_url: e.target.value })} className="w-full p-4 rounded-2xl bg-black border border-zinc-800 focus:border-gold outline-none text-white text-xs font-bold" placeholder="https://..." />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Contenu complet</label>
                                                <textarea value={msgForm.content} onChange={e => setMsgForm({ ...msgForm, content: e.target.value })} rows={6} className="w-full p-6 bg-black border border-zinc-800 rounded-[32px] text-white outline-none focus:border-gold transition-all resize-none text-xs leading-relaxed font-medium" />
                                            </div>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input type="checkbox" checked={msgForm.active} onChange={e => setMsgForm({ ...msgForm, active: e.target.checked })} className="w-4 h-4 rounded bg-black border-zinc-800 text-gold shadow-inner" />
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic group-hover:text-white transition-colors">Visible publiquement</span>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-end gap-4 pt-4">
                                            <button onClick={() => setEditingMsg(null)} className="px-8 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">Annuler</button>
                                            <button onClick={handleSaveMessage} className="px-10 py-4 bg-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gold/20 hover:bg-white hover:scale-105 transition-all">Sauvegarder</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SYSTEM TAB */}
                {activeTab === 'system' && (
                    <div className="bg-zinc-900 p-10 rounded-[40px] border border-zinc-800 shadow-2xl space-y-10 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>
                                Maintenance & Maintenance du Système
                            </h3>
                            <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                                <IconShield size={12} className="text-rose-500" />
                                <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic tracking-tighter">Accès Root</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-10 bg-black/40 rounded-[40px] border border-zinc-800/50 hover:border-gold/30 transition-all group space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-gold group-hover:text-black transition-all">
                                    <IconTrash size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase mb-2 italic tracking-tighter">Audit des Logs</h4>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase leading-relaxed">Supprime définitivement les logs d'administration de plus de 30 jours pour libérer de l'espace.</p>
                                </div>
                                <button onClick={handlePurgeLogs} className="w-full py-5 bg-zinc-800 hover:bg-gold hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Nettoyer l'Historique</button>
                            </div>

                            <div className="p-10 bg-black/40 rounded-[40px] border border-zinc-800/50 hover:border-gold/30 transition-all group space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <IconLayout size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase mb-2 italic tracking-tighter">Nettoyage Cache</h4>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase leading-relaxed">Réinitialise toutes les données locales stockées par le store (Wishlist, Session, Préférences).</p>
                                </div>
                                <button onClick={handleClearCache} className="w-full py-5 bg-zinc-800 hover:bg-blue-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Réinitialiser LocalStorage</button>
                            </div>
                        </div>

                        <div className="bg-zinc-800/20 p-8 rounded-[40px] border border-zinc-700/30 flex items-center gap-6">
                            <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center shrink-0">
                                <IconInfoCircle size={20} className="text-zinc-600" />
                            </div>
                            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] leading-relaxed">
                                Ces actions sont irréversibles. Utilisez ces outils uniquement lors d'interventions de maintenance ou pour résoudre des problèmes de synchronisation locale.
                            </p>
                        </div>
                    </div>
                )}

                {/* VISIBILITY TAB */}
                {activeTab === 'visibility' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                        {/* Maintenance & Core */}
                        <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 shadow-2xl space-y-8">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>
                                État du Serveur
                            </h3>

                            <label className="flex items-center justify-between p-6 bg-rose-500/5 border border-rose-500/20 rounded-[32px] cursor-pointer hover:bg-rose-500/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${settings.maintenance_mode ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-600'}`}>
                                        <IconSettings size={20} className={settings.maintenance_mode ? 'animate-spin-slow' : ''} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-rose-500 uppercase tracking-widest block">Mode Maintenance</span>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Coupe l'accès public au store</span>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.maintenance_mode ? 'bg-rose-500' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${settings.maintenance_mode ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </label>

                            <div className="space-y-4 pt-4">
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Visibilité du Logo</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: 'navbar', label: 'Barre de Navigation', icon: <IconLayout size={16} /> },
                                        { id: 'footer', label: 'Pied de Page', icon: <IconLayout size={16} className="rotate-180" /> },
                                        { id: 'auth', label: 'Pages de Connexion', icon: <IconShield size={16} /> },
                                        { id: 'ribbon', label: 'Ruban d\'Annonce', icon: <IconMegaphone size={16} /> }
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="text-zinc-500">{item.icon}</div>
                                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <div
                                                onClick={() => setSettings({
                                                    ...settings,
                                                    logo_targets: { ...settings.logo_targets, [item.id]: !settings.logo_targets?.[item.id] }
                                                })}
                                                className={`w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer ${settings.logo_targets?.[item.id] ? 'bg-gold' : 'bg-zinc-800'}`}
                                            >
                                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${settings.logo_targets?.[item.id] ? 'right-0.5' : 'left-0.5'}`}></div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => applyLogoToAll(true)}
                                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Activer Partout
                                        </button>
                                        <button
                                            onClick={() => applyLogoToAll(false)}
                                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Masquer Partout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sections & Global */}
                        <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 shadow-2xl space-y-8">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                Sections de l'Interface
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Page d'Accueil</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'home_hero', label: 'Bannière Hero (Haut)' },
                                            { id: 'home_categories', label: 'Univers & Catégories' },
                                            { id: 'home_sections', label: 'Rayons du Store (Apps/Jeux)' },
                                            { id: 'home_cta', label: 'Grille de Liens Rapides' }
                                        ].map(item => (
                                            <label key={item.id} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-black/60 transition-all">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.section_visibility?.[item.id] ?? true}
                                                    onChange={() => setSettings({
                                                        ...settings,
                                                        section_visibility: { ...settings.section_visibility, [item.id]: !settings.section_visibility?.[item.id] }
                                                    })}
                                                    className="w-5 h-5 rounded-lg bg-zinc-800 border-zinc-700 text-gold focus:ring-gold"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] ml-2">Éléments Globaux</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: 'global_search', label: 'Barre de Recherche Smart' },
                                            { id: 'global_ads', label: 'Surcouche Publicitaire Video' },
                                            { id: 'global_social', label: 'Liens Réseaux Sociaux' },
                                            { id: 'footer_sitemap', label: 'Plan du site (Footer)' }
                                        ].map(item => (
                                            <label key={item.id} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-black/60 transition-all">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.section_visibility?.[item.id] ?? true}
                                                    onChange={() => setSettings({
                                                        ...settings,
                                                        section_visibility: { ...settings.section_visibility, [item.id]: !settings.section_visibility?.[item.id] }
                                                    })}
                                                    className="w-5 h-5 rounded-lg bg-zinc-800 border-zinc-700 text-gold focus:ring-gold"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* RIBBON TAB */}
                {activeTab === 'ribbon' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 shadow-2xl space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                        <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                                        Contenu du Ruban
                                    </h3>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Activer</span>
                                        <div
                                            onClick={() => setSettings({ ...settings, ribbon_enabled: !settings.ribbon_enabled })}
                                            className={`w-14 h-7 rounded-full relative transition-all duration-300 ${settings.ribbon_enabled ? 'bg-gold' : 'bg-zinc-800'}`}
                                        >
                                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${settings.ribbon_enabled ? 'right-1' : 'left-1'}`}></div>
                                        </div>
                                    </label>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                                Version Desktop
                                            </label>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase italic">Max 150 car.</span>
                                        </div>
                                        <textarea
                                            rows={2}
                                            maxLength={150}
                                            value={settings.ribbon_text_desktop || ''}
                                            onChange={(e) => setSettings({ ...settings, ribbon_text_desktop: e.target.value })}
                                            className="w-full p-6 bg-black border border-zinc-800 rounded-[32px] text-white outline-none focus:border-gold transition-all resize-none shadow-inner"
                                            placeholder="Texte pour les écrans PC..."
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                                                Version Mobile
                                            </label>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase italic">Max 60 car.</span>
                                        </div>
                                        <textarea
                                            rows={2}
                                            maxLength={60}
                                            value={settings.ribbon_text_mobile || ''}
                                            onChange={(e) => setSettings({ ...settings, ribbon_text_mobile: e.target.value })}
                                            className="w-full p-6 bg-black border border-zinc-800 rounded-[32px] text-white outline-none focus:border-gold transition-all resize-none shadow-inner"
                                            placeholder="Texte court pour mobiles..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 shadow-2xl space-y-8">
                            <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                                Pages de Diffusion
                            </h3>
                            <div className="space-y-2">
                                {AVAILABLE_PATHS.map(item => (
                                    <label key={item.path} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-800/50 rounded-2xl cursor-pointer hover:border-gold/20 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <IconGlobe size={14} className="text-zinc-700 group-hover:text-gold transition-colors" />
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.name}</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={(settings.ribbon_targets || []).includes(item.path)}
                                            onChange={() => toggleRibbonTarget(item.path)}
                                            className="w-5 h-5 rounded-lg border-zinc-800 bg-black text-gold focus:ring-gold"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-zinc-900 p-10 rounded-[40px] border border-zinc-800 shadow-2xl space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-white italic flex items-center gap-3 uppercase tracking-tighter">
                                    <span className="w-1.5 h-6 bg-gold rounded-full"></span>
                                    Gestionnaire de Titres Web
                                </h3>
                                <div className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2">
                                    <IconShield size={12} className="text-rose-500" />
                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest italic">Sync. Sécurisée</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* HOME CONTENT */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <IconGlobe size={14} /> Page Accueil
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="p-6 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Titre Hero</label>
                                                <input
                                                    type="text"
                                                    value={settings.site_content?.home?.hero?.title || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        site_content: {
                                                            ...settings.site_content,
                                                            home: {
                                                                ...settings.site_content?.home,
                                                                hero: { ...settings.site_content?.home?.hero, title: e.target.value }
                                                            }
                                                        }
                                                    })}
                                                    className="w-full bg-transparent text-white font-black text-sm outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Sous-titre Hero</label>
                                                <input
                                                    type="text"
                                                    value={settings.site_content?.home?.hero?.subtitle || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        site_content: {
                                                            ...settings.site_content,
                                                            home: {
                                                                ...settings.site_content?.home,
                                                                hero: { ...settings.site_content?.home?.hero, subtitle: e.target.value }
                                                            }
                                                        }
                                                    })}
                                                    className="w-full bg-transparent text-white font-medium text-[10px] outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-4">
                                            {['hero_title', 'services_title', 'community_title'].map(key => (
                                                <div key={key} className="space-y-2">
                                                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">{key.replace('_', ' ')}</label>
                                                    <input
                                                        type="text"
                                                        maxLength={40}
                                                        value={settings.store_titles[key] || ''}
                                                        onChange={(e) => setSettings({
                                                            ...settings,
                                                            store_titles: { ...settings.store_titles, [key]: e.target.value }
                                                        })}
                                                        className="w-full bg-transparent text-white font-black text-xs outline-none border-b border-zinc-800 pb-1 focus:border-gold transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* SERVICES CONTENT */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <IconBriefcase size={14} /> Page Services
                                    </h4>
                                    <div className="p-6 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Titre Principal</label>
                                            <input
                                                type="text"
                                                value={settings.site_content?.services?.header?.title || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    site_content: {
                                                        ...settings.site_content,
                                                        services: {
                                                            ...settings.site_content?.services,
                                                            header: { ...settings.site_content?.services?.header, title: e.target.value }
                                                        }
                                                    }
                                                })}
                                                className="w-full bg-transparent text-white font-black text-sm outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Accroche / Slogan</label>
                                            <input
                                                type="text"
                                                value={settings.site_content?.services?.header?.subtitle || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    site_content: {
                                                        ...settings.site_content,
                                                        services: {
                                                            ...settings.site_content?.services,
                                                            header: { ...settings.site_content?.services?.header, subtitle: e.target.value }
                                                        }
                                                    }
                                                })}
                                                className="w-full bg-transparent text-white font-medium text-[10px] outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* COMMUNITY CONTENT */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <IconGlobe size={14} /> Page Communauté
                                    </h4>
                                    <div className="p-6 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Titre Communauté</label>
                                            <input
                                                type="text"
                                                value={settings.site_content?.community?.header?.title || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    site_content: {
                                                        ...settings.site_content,
                                                        community: {
                                                            ...settings.site_content?.community,
                                                            header: { ...settings.site_content?.community?.header, title: e.target.value }
                                                        }
                                                    }
                                                })}
                                                className="w-full bg-transparent text-white font-black text-sm outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Bienvenue</label>
                                            <input
                                                type="text"
                                                value={settings.site_content?.community?.header?.subtitle || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    site_content: {
                                                        ...settings.site_content,
                                                        community: {
                                                            ...settings.site_content?.community,
                                                            header: { ...settings.site_content?.community?.header, subtitle: e.target.value }
                                                        }
                                                    }
                                                })}
                                                className="w-full bg-transparent text-white font-medium text-[10px] outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER & GLOBAL CONTENT */}
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-2">
                                        <IconLayout size={14} /> Global & Footer
                                    </h4>
                                    <div className="p-6 bg-black/60 rounded-[32px] border border-zinc-800/50 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Copyright Footer</label>
                                            <input
                                                type="text"
                                                value={settings.footer_copyright || ''}
                                                onChange={(e) => setSettings({ ...settings, footer_copyright: e.target.value })}
                                                className="w-full bg-transparent text-white font-black text-sm outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all"
                                                placeholder="© 2026 AR BUSINESS. Tous droits réservés."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message de Connexion</label>
                                            <textarea
                                                rows={2}
                                                value={settings.auth_welcome_text || ''}
                                                onChange={(e) => setSettings({ ...settings, auth_welcome_text: e.target.value })}
                                                className="w-full bg-transparent text-white font-medium text-[10px] outline-none border-b border-zinc-800 pb-2 focus:border-gold transition-all resize-none"
                                                placeholder="Bienvenue sur votre espace sécurisé..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gold/5 p-8 rounded-[40px] border border-gold/10">
                            <h4 className="text-xs font-black text-gold uppercase tracking-widest italic mb-2">Conseil de Design</h4>
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed uppercase">
                                Privilégiez des titres courts et percutants pour maintenir l'élégance de l'interface AR Business.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
