import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { uploadToStorage, getPublicUrl } from '../../services/admin'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'
import { useARDES } from '../../context/ARDESContext'
import { useFormPersistence } from '../../hooks/useFormPersistence'
import { IconEye, IconDeviceMobile, MONETIZATION_ICONS, PLACEMENT_ICONS } from '../../components/Icons'
import ARDES from '../../components/ARDES'
import { CATEGORIES_CONFIG, MONETIZATION_OPTIONS, PLACEMENTS, OS_LIST, FORMATION_CONFIG } from '../../config/categories'
import { ARDES_CONFIG } from '../../config/ardes_config'
import { syncCurrencies, calculateAdsToPrice } from '../../utils/currency_converter'
import FormNavigator from '../../components/FormNavigator'
import { IconCreditCard, IconGrid, IconSettings, IconPackage, IconGlobe, IconLock, IconMonitor, IconPlus } from '../../components/Icons'

export default function AddService() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const editId = searchParams.get('edit')
    const { settings } = useSettings()
    const { addWorkspace } = useARDES()
    // Persistent State
    const [formData, setFormData] = useFormPersistence('add_service_form', {
        name: '',
        description: '',
        type: 'Service',
        sub_type: 'Développement Web & Application',
        price: '0',
        price_fcfa: 0,
        monetization_type: 'free',
        access_type: 'direct' as 'direct' | 'reward' | 'payant',
        active: true,
        placements: ['new'] as string[],
        is_project: false,
        project_phase: 'announcement',
        estimated_date: '',
        roadmap: [] as { date: string; label: string; desc: string }[],
        long_description: '',
        features: [] as string[],
        contact_manager: '',
        whatsapp_link: '',
        telegram_link: '',
        external_link: '',
        // New taxonomy fields
        formation_domain: '',
        formation_level: 'debutant',
        formation_certificate: 'none',
        formation_monetization: '',
        game_genre: '',
        // Unified Financial System
        price_eur: 0,
        ads_video_count: 0,
        ads_video_price: 0,
        display_config: { show_usd: true, show_fcfa: true, show_eur: true },
        // Data fields for Edit mode
        image: ''
    })

    // Local States (Files/UI)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')
    const [showMiniLab, setShowMiniLab] = useState(true)

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile)
            setImagePreview(url)
            return () => URL.revokeObjectURL(url)
        }
    }, [imageFile])

    useEffect(() => {
        async function loadData() {
            if (editId) {
                try {
                    const { data: s, error } = await supabase.from('services').select('*').eq('id', editId).single()
                    if (error) throw error
                    if (s) {
                        setFormData({
                            ...s,
                            price: s.price?.toString() || '0',
                            sub_type: s.sub_type || s.type || ''
                        })
                        if (s.image) setImagePreview(s.image)
                    }
                } catch (e) {
                    console.error('Error loading service:', e)
                }
            }
        }
        loadData()
    }, [editId])

    const handleARDESLab = () => {
        const adminPath = ARDES_CONFIG.ADMIN_PATH
        addWorkspace({
            name: `Service: ${formData.name || 'Nouveau Service'}`,
            data: {
                name: formData.name,
                image: imagePreview,
                category: formData.type,
                os: 'Web System'
            },
            mode: 'mobile',
            originPath: `/${adminPath}/add-service`
        })
        navigate(`/${adminPath}/ardes`)
    }

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : value

        if (name === 'price' || name === 'price_fcfa' || name === 'price_eur') {
            const fieldMapping = { price: 'usd', price_fcfa: 'fcfa', price_eur: 'eur' } as const
            const numericVal = parseFloat(val || '0')
            const synced = syncCurrencies(numericVal, fieldMapping[name as keyof typeof fieldMapping])

            setFormData(prev => ({
                ...prev,
                price: synced.usd.toString(),
                price_fcfa: synced.fcfa,
                price_eur: synced.eur
            }))
        } else if (name === 'ads_video_count' || name === 'ads_video_price') {
            setFormData(prev => {
                const next = { ...prev, [name]: parseFloat(val || '0') }
                const synced = calculateAdsToPrice(next.ads_video_count, next.ads_video_price)
                return {
                    ...next,
                    price: synced.usd.toString(),
                    price_fcfa: synced.fcfa,
                    price_eur: synced.eur
                }
            })
        } else if (name === 'show_usd' || name === 'show_fcfa' || name === 'show_eur') {
            setFormData(prev => ({
                ...prev,
                display_config: {
                    ...(prev.display_config || { show_usd: true, show_fcfa: true, show_eur: true }),
                    [name]: checked
                }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: val }))
        }
    }

    const handlePlacementChange = (id: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            placements: checked ? [...prev.placements, id] : prev.placements.filter(p => p !== id)
        }))
    }

    const addRoadmapEntry = () => setFormData(prev => ({ ...prev, roadmap: [...prev.roadmap, { date: '', label: '', desc: '' }] }))
    const updateRoadmapEntry = (index: number, field: string, value: string) => setFormData(prev => ({ ...prev, roadmap: prev.roadmap.map((it, i) => i === index ? { ...it, [field]: value } : it) }))
    const removeRoadmapEntry = (index: number) => setFormData(prev => ({ ...prev, roadmap: prev.roadmap.filter((_, i) => i !== index) }))

    const addFeature = () => setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
    const updateFeature = (index: number, value: string) => setFormData(prev => ({ ...prev, features: prev.features.map((f, i) => i === index ? value : f) }))
    const removeFeature = (index: number) => setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setMessage(null)
        setLoading(true)
        try {
            let imageUrl = null
            if (imageFile) {
                const imagePath = `services/${Date.now()}_${imageFile.name}`
                await uploadToStorage('images', imagePath, imageFile)
                imageUrl = getPublicUrl('images', imagePath)
            }
            // Preparation des donnees pour insertion safe
            const serviceData = {
                name: formData.name,
                description: formData.description,
                long_description: formData.long_description,
                type: formData.type,
                sub_type: formData.sub_type,
                image: imageUrl || formData.image,
                active: formData.active,
                features: formData.features,
                contact_manager: formData.contact_manager,
                whatsapp_link: formData.whatsapp_link,
                telegram_link: formData.telegram_link,
                external_link: formData.external_link,
                placements: formData.placements,
                is_project: formData.is_project,
                project_phase: formData.project_phase,
                estimated_date: formData.estimated_date,
                roadmap: formData.roadmap,
                // Taxonomy & Prices
                price: parseFloat(formData.price || '0'),
                price_fcfa: parseInt((formData.price_fcfa || 0).toString()) || 0,
                monetization_type: formData.monetization_type,
                access_type: formData.access_type,
                formation_domain: formData.formation_domain,
                formation_level: formData.formation_level,
                formation_certificate: formData.formation_certificate,
                formation_monetization: formData.formation_monetization,
                game_genre: formData.game_genre,
                price_eur: parseFloat((formData.price_eur || 0).toString()) || 0,
                ads_video_count: parseInt((formData.ads_video_count || 0).toString()) || 0,
                ads_video_price: parseFloat((formData.ads_video_price || 0).toString()) || 0,
                display_config: formData.display_config
            }

            if (editId) {
                const { error } = await supabase.from('services').update(serviceData).eq('id', editId)
                if (error) throw error
                setMessage({ type: 'success', text: 'Service mis à jour avec succès !' })
            } else {
                const { error } = await supabase.from('services').insert([serviceData])
                if (error) throw error
                setMessage({ type: 'success', text: 'Service ajouté avec succès !' })
            }

            // Clear persistence on success
            sessionStorage.removeItem('add_service_form')

            setTimeout(() => navigate(`/${ARDES_CONFIG.ADMIN_PATH}/services`), 2000)
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erreur lors de la création.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
            <FormNavigator sections={[
                { id: 'id-identity', label: 'Identité', icon: <IconPackage size={16} /> },
                { id: 'id-features', label: 'Services', icon: <IconMonitor size={16} /> },
                { id: 'id-pricing', label: 'Payement & Ads', icon: <IconCreditCard size={16} /> },
                { id: 'id-visibility', label: 'Visibilité', icon: <IconGlobe size={16} /> },
                { id: 'id-development', label: 'Projet', icon: <IconSettings size={16} /> },
                { id: 'id-contact', label: 'Contact', icon: <IconGrid size={16} /> },
            ]} />
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl transition-all hover:bg-zinc-800 text-gray-400">←</button>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Lancement Service</h2>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Inventory Management</p>
                    </div>
                </div>

                {/* Barre d'actions adaptée au mobile (Bouton text hidden xs:inline — plus agressif que sm) */}
                <div className="flex gap-4 overflow-x-auto pb-2 -mb-2 scrollbar-hide snap-x no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setShowMiniLab(!showMiniLab)}
                        className={`flex items-center gap-3 border px-4 sm:px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap snap-center ${showMiniLab ? 'bg-gold text-black border-gold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
                    >
                        <IconEye size={16} />
                        <span className="hidden leading-none sm:inline">{showMiniLab ? 'Masquer Mini-Lab' : 'Aperçu Rapide'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleARDESLab}
                        className="flex items-center gap-3 bg-zinc-900 border border-gold/30 px-4 sm:px-6 py-3 rounded-2xl text-[10px] font-black text-gold uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all shadow-xl shadow-gold/5 whitespace-nowrap snap-center font-black"
                    >
                        <div className="p-1 bg-gold/10 rounded-lg shrink-0">
                            <IconDeviceMobile size={14} strokeWidth={3} />
                        </div>
                        <span className="hidden leading-none sm:inline">Ouvrir AR-DES Lab</span>
                    </button>
                </div>
            </div>

            {/* Mini-Lab Section (Conditionnelle) */}
            {showMiniLab && (
                <div className="mb-8 animate-in slide-in-from-top-8 duration-500">
                    <ARDES
                        mode="mobile"
                        modelName="Mini-Lab Express"
                        isMiniLab={true}
                        onSendToLab={handleARDESLab}
                        productData={{
                            name: formData.name,
                            image: imagePreview,
                            category: formData.type,
                            os: 'Système Digital'
                        }}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12 pb-32">
                {/* CONFIGURATION */}
                <div id="id-identity" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Configuration de base</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Titre du Service</label>
                            <input name="name" required value={formData.name} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none transition-all" placeholder="Ex: Transformation Digitale" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Univers / Catégorie</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, sub_type: (CATEGORIES_CONFIG as any)[e.target.value]?.subtypes?.[0] || '' }))}
                                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none"
                            >
                                {Object.keys(CATEGORIES_CONFIG).map(cat => (
                                    <option key={cat} value={cat}>{cat}s</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                {formData.type === 'Formation' ? 'Domaine de Formation' :
                                    formData.type === 'Jeu' ? 'Genre de Jeu' : 'Spécialisation / Sous-Type'}
                            </label>
                            <select
                                name="sub_type"
                                value={formData.sub_type}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none"
                            >
                                {(CATEGORIES_CONFIG as any)[formData.type]?.subtypes?.map((sub: string) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>

                        {/* Formation Specific Fields */}
                        {formData.type === 'Formation' && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gold/5 p-6 rounded-3xl border border-gold/10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Domaine de Formation</label>
                                    <select name="formation_domain" value={formData.formation_domain} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                                        <option value="">— Choisir —</option>
                                        {(CATEGORIES_CONFIG['Formation'] as any).domains?.map((d: string) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Niveau</label>
                                    <select name="formation_level" value={formData.formation_level} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                                        {FORMATION_CONFIG.levels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Certificat</label>
                                    <select name="formation_certificate" value={formData.formation_certificate} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                                        {FORMATION_CONFIG.certificates.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Modèle Monétisation Formation</label>
                                    <select name="formation_monetization" value={formData.formation_monetization} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                                        <option value="">— Choisir —</option>
                                        {(CATEGORIES_CONFIG['Formation'] as any).monetizationTypes?.map((m: string) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Jeu Specific Fields */}
                        {formData.type === 'Jeu' && (
                            <div className="md:col-span-2 space-y-2 bg-gold/5 p-6 rounded-3xl border border-gold/10">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Genre de Jeu</label>
                                <select name="game_genre" value={formData.game_genre} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                                    <option value="">— Choisir —</option>
                                    {(CATEGORIES_CONFIG['Jeu'] as any).gameGenres?.map((g: string) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description Courte</label>
                            <textarea name="description" rows={2} value={formData.description} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none transition-all resize-none" placeholder="Une ligne accrocheuse..." />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description Détaillée (Page d'infos)</label>
                            <textarea name="long_description" rows={6} value={formData.long_description} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none transition-all resize-none" placeholder="Présentez le service en profondeur..." />
                        </div>
                    </div>
                </div>

                {/* FEATURES TECHNIQUES */}
                <div id="id-features" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Points Forts / Features</h3>
                        </div>
                        <button type="button" onClick={addFeature} className="text-[10px] font-black text-gold uppercase">+ Ajouter</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.features.map((feature, i) => (
                            <div key={i} className="flex gap-2 bg-black/40 p-2 rounded-xl border border-zinc-800 group">
                                <input value={feature} onChange={e => updateFeature(i, e.target.value)} className="flex-1 bg-transparent outline-none text-xs p-1" placeholder="Ex: Support 24/7" />
                                <button type="button" onClick={() => removeFeature(i)} className="text-red-500 px-2 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTACT & RESPONSABLE */}
                <div id="id-contact" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic text-green-400">Canaux de Contact</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nom du Responsable</label>
                            <input name="contact_manager" value={formData.contact_manager} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-green-500 outline-none" placeholder="Ex: Jean Dupont" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Lien WhatsApp</label>
                            <input name="whatsapp_link" value={formData.whatsapp_link} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-green-500 outline-none" placeholder="https://wa.me/..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Lien Telegram</label>
                            <input name="telegram_link" value={formData.telegram_link} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-green-500 outline-none" placeholder="https://t.me/..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Lien Site Externe</label>
                            <input name="external_link" value={formData.external_link} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-green-500 outline-none" placeholder="https://..." />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ILLUSTRATION */}
                    <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Illustration</h3>
                        </div>
                        <div className="relative group aspect-square w-full max-w-[200px] mx-auto bg-black rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden transition-all hover:border-gold/50">
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center font-black text-[10px] text-zinc-600 uppercase tracking-widest">Upload</div>
                            )}
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* MONÉTISATION & PRIX */}
                    <div id="id-pricing" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
                        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Modèle Économique & Ads</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Monétisation & Ads Config */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Type de Monétisation</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {MONETIZATION_OPTIONS.map(opt => {
                                            const Icon = MONETIZATION_ICONS[opt.value] || MONETIZATION_ICONS.free;
                                            return (
                                                <label key={opt.value} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${formData.monetization_type === opt.value ? 'bg-gold/10 border-gold text-gold' : 'bg-black border-zinc-800 text-zinc-500'}`}>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
                                                            <Icon size={16} className={formData.monetization_type === opt.value ? 'text-gold' : 'text-zinc-500'} />
                                                            {opt.label}
                                                        </span>
                                                    </div>
                                                    <input type="radio" name="monetization_type" value={opt.value} checked={formData.monetization_type === opt.value} onChange={handleChange} className="sr-only" />
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.monetization_type === opt.value ? 'border-gold bg-gold' : 'border-zinc-800'}`} />
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Ads to Price Linkage */}
                                <div className="bg-black/60 p-6 rounded-3xl border border-zinc-800 space-y-4">
                                    <div className="flex items-center gap-3 opacity-60">
                                        <IconMonitor size={14} className="text-gold" />
                                        <span className="text-[10px] font-black text-gold uppercase tracking-widest">Ads-to-Price</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Vidéo Count</label>
                                            <input type="number" name="ads_video_count" value={formData.ads_video_count} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs focus:border-gold outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Price / Ad</label>
                                            <input type="number" step="0.01" name="ads_video_price" value={formData.ads_video_price} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs focus:border-gold outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Prix Unified Grid */}
                            <div className="space-y-6">
                                <div className="space-y-2 bg-gold/5 p-4 rounded-2xl border border-gold/10">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prix (USD)</label>
                                        <input type="checkbox" name="show_usd" checked={formData.display_config.show_usd} onChange={handleChange} className="accent-gold scale-75" />
                                    </div>
                                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none font-bold" />
                                </div>
                                <div className="space-y-2 bg-gold/5 p-4 rounded-2xl border border-gold/10">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prix (FCFA)</label>
                                        <input type="checkbox" name="show_fcfa" checked={formData.display_config.show_fcfa} onChange={handleChange} className="accent-gold scale-75" />
                                    </div>
                                    <input type="number" name="price_fcfa" value={formData.price_fcfa} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none font-bold" />
                                </div>
                                <div className="space-y-2 bg-gold/5 p-4 rounded-2xl border border-gold/10">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prix (EUR)</label>
                                        <input type="checkbox" name="show_eur" checked={formData.display_config.show_eur} onChange={handleChange} className="accent-gold scale-75" />
                                    </div>
                                    <input type="number" step="0.01" name="price_eur" value={formData.price_eur} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none font-bold text-blue-400" />
                                </div>
                                <div className="pt-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Accès Technique</label>
                                    <select name="access_type" value={formData.access_type} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none mt-1">
                                        <option value="direct">Accès Direct</option>
                                        <option value="reward">Accès Récompensé (Ads)</option>
                                        <option value="payant">Facturation Requise</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VISIBILITÉ */}
                    <div id="id-visibility" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
                        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Visibilité</h3>
                        </div>
                        <div className="space-y-6">
                            <label className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-zinc-800 cursor-pointer group">
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-10 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                                </div>
                                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-gold transition-colors">Service Actif</span>
                            </label>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Emplacements</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {PLACEMENTS.map(opt => {
                                        const Icon = PLACEMENT_ICONS[opt.id] || PLACEMENT_ICONS.new;
                                        const isSelected = formData.placements.includes(opt.id);
                                        return (
                                            <label key={opt.id} className={`flex items-center gap-2 p-3 bg-black/20 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-gold/50 bg-gold/5' : 'border-zinc-800 hover:border-zinc-700'}`}>
                                                <input type="checkbox" checked={isSelected} onChange={e => handlePlacementChange(opt.id, e.target.checked)} className="w-3 h-3 accent-gold" />
                                                <span className={`text-[9px] font-black uppercase flex items-center gap-2 ${isSelected ? 'text-gold' : 'text-zinc-500'}`}>
                                                    <Icon size={12} className={isSelected ? 'text-gold' : 'text-zinc-600'} />
                                                    {opt.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODE PROJET / ROADMAP */}
                <div id="id-development" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
                    <label className="flex items-center gap-4 cursor-pointer group">
                        <span className="text-[10px] font-black text-zinc-500 group-hover:text-blue-400 uppercase tracking-widest transition-all">Activer le statut projet</span>
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" name="is_project" checked={formData.is_project} onChange={handleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                    </label>

                    {formData.is_project && (
                        <div className="space-y-8 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phase actuelle</label>
                                    <select name="project_phase" value={formData.project_phase} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all">
                                        <option value="announcement">📢 Annonce</option>
                                        <option value="development">🔧 Développement Actif</option>
                                        <option value="testing">🧪 Bêta-Test Public</option>
                                        <option value="reported">🟠 Reporté</option>
                                        <option value="cancelled">🔴 Annulé</option>
                                        <option value="finalized">🚀 Finalisé (Live)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date Estimée</label>
                                    <input name="estimated_date" value={formData.estimated_date} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none" placeholder="Ex: Fin 2026" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Jalons Roadmap</label>
                                    <button type="button" onClick={addRoadmapEntry} className="text-[10px] font-black text-blue-400 hover:text-white uppercase transition-all">+ Étape</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.roadmap.map((step, i) => (
                                        <div key={i} className="flex gap-3 p-4 bg-black/40 border border-zinc-800 rounded-2xl relative group">
                                            <button type="button" onClick={() => removeRoadmapEntry(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                            <input placeholder="Date" value={step.date} onChange={e => updateRoadmapEntry(i, 'date', e.target.value)} className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px]" />
                                            <input placeholder="Libellé" value={step.label} onChange={e => updateRoadmapEntry(i, 'label', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px]" />
                                            <input placeholder="Détails" value={step.desc} onChange={e => updateRoadmapEntry(i, 'desc', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px]" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-8">
                    <button type="submit" disabled={loading} className="w-full bg-gold py-6 rounded-3xl font-black text-black uppercase tracking-[0.3em] hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl">
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                                <span>Lancement...</span>
                            </>
                        ) : (
                            'Lancer le Service'
                        )}
                    </button>
                    {message && <p className={`mt-6 text-center font-black uppercase tracking-widest text-xs italic ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>}
                </div>
            </form>
        </div>
    )
}
