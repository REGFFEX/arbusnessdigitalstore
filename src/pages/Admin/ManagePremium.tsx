import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { IconCheck, IconX, IconShield, IconEdit, IconPlus } from '../../components/Icons'

// ── Types ──
interface PremiumBenefit {
    id: string
    label: string
    enabled: boolean
}

interface PremiumTier {
    id: string
    name: string
    level: number
    price_usd: number
    price_fcfa: number
    color_from: string
    color_to: string
    border_color: string
    text_color: string
    is_popular: boolean
    discount_percent: number
    no_ads: boolean
    day1_free: boolean
    day2_half: boolean
    benefits: PremiumBenefit[]
}

const DEFAULT_TIERS: PremiumTier[] = [
    {
        id: 'gold_level_1',
        name: 'PREMIUM LEVEL 1',
        level: 1,
        price_usd: 4.99,
        price_fcfa: 3000,
        color_from: 'amber-500/20',
        color_to: 'amber-600/20',
        border_color: 'border-amber-500/30',
        text_color: 'text-amber-500',
        is_popular: false,
        discount_percent: 10,
        no_ads: false,
        day1_free: false,
        day2_half: false,
        benefits: [
            { id: 'b1_badge', label: 'Badges Exclusifs sur le profil', enabled: true },
            { id: 'b1_support', label: 'Soutien à la plateforme', enabled: true },
            { id: 'b1_email', label: 'Support par email standard', enabled: true },
            { id: 'b1_discount', label: 'Réduction de -10% sur tout le store', enabled: true }
        ]
    },
    {
        id: 'gold_level_2',
        name: 'PREMIUM LEVEL 2',
        level: 2,
        price_usd: 9.99,
        price_fcfa: 6000,
        color_from: 'blue-500/20',
        color_to: 'blue-600/20',
        border_color: 'border-blue-500/30',
        text_color: 'text-blue-400',
        is_popular: true,
        discount_percent: 25,
        no_ads: true,
        day1_free: false,
        day2_half: false,
        benefits: [
            { id: 'b2_noads', label: 'Zéro Publicité (Store & Apps)', enabled: true },
            { id: 'b2_discount', label: 'Réduction de -25% sur tout le store', enabled: true },
            { id: 'b2_beta', label: 'Accès Prioritaire aux bêtas', enabled: true },
            { id: 'b2_support', label: 'Support prioritaire 24h/7j', enabled: true },
            { id: 'b2_badge', label: 'Badge "Vente Elite" débloqué', enabled: true }
        ]
    },
    {
        id: 'gold_level_3',
        name: 'ULTIMATE LEVEL 3',
        level: 3,
        price_usd: 19.99,
        price_fcfa: 12000,
        color_from: 'gold/20',
        color_to: 'yellow-600/20',
        border_color: 'border-gold/30',
        text_color: 'text-gold',
        is_popular: false,
        discount_percent: 100,
        no_ads: true,
        day1_free: true,
        day2_half: true,
        benefits: [
            { id: 'b3_day1', label: 'DAY 1 : Tout gratuit le premier jour !', enabled: true },
            { id: 'b3_day2', label: 'DAY 2 : Réduction de -50% garanti', enabled: true },
            { id: 'b3_noads', label: 'Zéro Publicité à vie', enabled: true },
            { id: 'b3_formation', label: 'Formation B2B Offerte chaque mois', enabled: true },
            { id: 'b3_discord', label: 'Accès direct aux développeurs (Discord)', enabled: true },
            { id: 'b3_ui', label: "Personnalisation UI de l'App Store", enabled: true }
        ]
    }
]

export default function ManagePremium() {
    const [tiers, setTiers] = useState<PremiumTier[]>(DEFAULT_TIERS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [editingTier, setEditingTier] = useState<PremiumTier | null>(null)
    const [newBenefitLabel, setNewBenefitLabel] = useState('')

    useEffect(() => {
        loadConfig()
    }, [])

    async function loadConfig() {
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'premium_config')
                .single()

            if (data?.value) {
                setTiers(data.value as PremiumTier[])
            }
        } catch (e) {
            console.log('No premium config found, using defaults')
        } finally {
            setLoading(false)
        }
    }

    async function saveConfig() {
        setSaving(true)
        setMessage(null)
        try {
            // Upsert into settings
            const { error } = await supabase
                .from('settings')
                .upsert({
                    key: 'premium_config',
                    value: tiers,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' })

            if (error) throw error
            setMessage({ type: 'success', text: 'Configuration Premium sauvegardée avec succès !' })
            setTimeout(() => setMessage(null), 4000)
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erreur lors de la sauvegarde.' })
        } finally {
            setSaving(false)
        }
    }

    const handleTierUpdate = (tierId: string, field: string, value: any) => {
        setTiers(prev => prev.map(t =>
            t.id === tierId ? { ...t, [field]: value } : t
        ))
    }

    const handleBenefitToggle = (tierId: string, benefitId: string) => {
        setTiers(prev => prev.map(t =>
            t.id === tierId ? {
                ...t,
                benefits: t.benefits.map(b =>
                    b.id === benefitId ? { ...b, enabled: !b.enabled } : b
                )
            } : t
        ))
    }

    const handleAddBenefit = (tierId: string) => {
        if (!newBenefitLabel.trim()) return
        const newBenefit: PremiumBenefit = {
            id: `custom_${Date.now()}`,
            label: newBenefitLabel.trim(),
            enabled: true
        }
        setTiers(prev => prev.map(t =>
            t.id === tierId ? { ...t, benefits: [...t.benefits, newBenefit] } : t
        ))
        setNewBenefitLabel('')
    }

    const handleRemoveBenefit = (tierId: string, benefitId: string) => {
        setTiers(prev => prev.map(t =>
            t.id === tierId ? {
                ...t,
                benefits: t.benefits.filter(b => b.id !== benefitId)
            } : t
        ))
    }

    if (loading) {
        return (
            <div className="p-20 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Chargement de la configuration premium...</p>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-6xl mx-auto text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gold uppercase italic tracking-tighter">Gestion <span className="text-white">Premium</span></h2>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Configurez les niveaux d'abonnement et leurs avantages</p>
                </div>
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${saving ? 'bg-zinc-800 text-zinc-600' : 'bg-gold text-black hover:scale-105 active:scale-95 shadow-gold/10'}`}
                >
                    {saving ? 'SAUVEGARDE...' : 'SAUVEGARDER TOUT'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl mb-6 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {message.type === 'success' ? <IconCheck size={14} /> : <IconX size={14} />}
                    {message.text}
                </div>
            )}

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {tiers.map(tier => (
                    <div
                        key={tier.id}
                        className={`bg-zinc-900/60 border ${tier.border_color} rounded-[32px] p-6 relative transition-all hover:shadow-2xl ${tier.is_popular ? 'ring-2 ring-gold/20 shadow-[0_10px_40px_rgba(212,175,55,0.08)]' : ''}`}
                    >
                        {tier.is_popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-black px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                                Plus Populaire
                            </div>
                        )}

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-${tier.color_from} to-${tier.color_to} flex items-center justify-center mb-3`}>
                                <IconShield size={28} className={tier.text_color} />
                            </div>
                            <h3 className={`text-lg font-black italic tracking-tighter ${tier.text_color}`}>{tier.name}</h3>
                            <div className="flex items-baseline justify-center gap-1 mt-2">
                                <span className="text-3xl font-black text-white">{tier.price_usd}</span>
                                <span className="text-zinc-500 text-xs font-bold">$ / MOIS</span>
                            </div>
                            <p className="text-[9px] text-zinc-600 font-bold mt-1">{tier.price_fcfa.toLocaleString()} FCFA</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className={`p-2 rounded-xl text-center ${tier.no_ads ? 'bg-green-500/10 border border-green-500/20' : 'bg-zinc-800/50 border border-zinc-700/30'}`}>
                                <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Sans Pub</p>
                                <p className={`text-xs font-black ${tier.no_ads ? 'text-green-400' : 'text-zinc-600'}`}>{tier.no_ads ? 'OUI' : 'NON'}</p>
                            </div>
                            <div className={`p-2 rounded-xl text-center ${tier.discount_percent > 0 ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-zinc-800/50 border border-zinc-700/30'}`}>
                                <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Réduc.</p>
                                <p className={`text-xs font-black ${tier.discount_percent > 0 ? 'text-blue-400' : 'text-zinc-600'}`}>-{tier.discount_percent}%</p>
                            </div>
                            <div className={`p-2 rounded-xl text-center ${tier.day1_free ? 'bg-gold/10 border border-gold/20' : 'bg-zinc-800/50 border border-zinc-700/30'}`}>
                                <p className="text-[7px] font-black uppercase tracking-widest text-zinc-500">Day 1</p>
                                <p className={`text-xs font-black ${tier.day1_free ? 'text-gold' : 'text-zinc-600'}`}>{tier.day1_free ? 'FREE' : '—'}</p>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-1.5 mb-4">
                            {tier.benefits.map(b => (
                                <div key={b.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-tight transition-all ${b.enabled ? 'bg-white/5 text-zinc-300' : 'bg-zinc-800/30 text-zinc-600 line-through opacity-50'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${b.enabled ? 'bg-gold' : 'bg-zinc-700'}`} />
                                    <span className="flex-1 truncate">{b.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={() => setEditingTier({ ...tier })}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <IconEdit size={12} /> MODIFIER CE TIER
                        </button>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingTier && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-white/[0.02] shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Modifier {editingTier.name}</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Level {editingTier.level}</p>
                            </div>
                            <button onClick={() => setEditingTier(null)} className="p-3 bg-zinc-800 text-zinc-500 rounded-2xl hover:text-white transition-colors">
                                <IconX size={20} />
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="p-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                            {/* Name + Pricing */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Nom du Tier</label>
                                    <input
                                        value={editingTier.name}
                                        onChange={e => setEditingTier({ ...editingTier, name: e.target.value })}
                                        className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Prix USD / mois</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingTier.price_usd}
                                        onChange={e => setEditingTier({ ...editingTier, price_usd: parseFloat(e.target.value) || 0 })}
                                        className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Prix FCFA / mois</label>
                                    <input
                                        type="number"
                                        value={editingTier.price_fcfa}
                                        onChange={e => setEditingTier({ ...editingTier, price_fcfa: parseInt(e.target.value) || 0 })}
                                        className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-sm text-white outline-none focus:border-gold transition-all"
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${editingTier.no_ads ? 'bg-green-500/10 border-green-500/20' : 'bg-zinc-800/40 border-zinc-700/30'}`}>
                                    <input type="checkbox" checked={editingTier.no_ads} onChange={e => setEditingTier({ ...editingTier, no_ads: e.target.checked })} className="w-4 h-4 accent-gold" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase">Sans Pub</span>
                                </label>
                                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${editingTier.day1_free ? 'bg-gold/10 border-gold/20' : 'bg-zinc-800/40 border-zinc-700/30'}`}>
                                    <input type="checkbox" checked={editingTier.day1_free} onChange={e => setEditingTier({ ...editingTier, day1_free: e.target.checked })} className="w-4 h-4 accent-gold" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase">DAY 1 Free</span>
                                </label>
                                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${editingTier.day2_half ? 'bg-blue-500/10 border-blue-500/20' : 'bg-zinc-800/40 border-zinc-700/30'}`}>
                                    <input type="checkbox" checked={editingTier.day2_half} onChange={e => setEditingTier({ ...editingTier, day2_half: e.target.checked })} className="w-4 h-4 accent-gold" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase">DAY 2 -50%</span>
                                </label>
                                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${editingTier.is_popular ? 'bg-gold/10 border-gold/20' : 'bg-zinc-800/40 border-zinc-700/30'}`}>
                                    <input type="checkbox" checked={editingTier.is_popular} onChange={e => setEditingTier({ ...editingTier, is_popular: e.target.checked })} className="w-4 h-4 accent-gold" />
                                    <span className="text-[9px] font-black text-zinc-400 uppercase">Populaire</span>
                                </label>
                            </div>

                            {/* Discount */}
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-1">Pourcentage de Réduction Global</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={editingTier.discount_percent}
                                        onChange={e => setEditingTier({ ...editingTier, discount_percent: parseInt(e.target.value) })}
                                        className="flex-1 accent-gold"
                                    />
                                    <span className="text-2xl font-black text-gold w-16 text-right">-{editingTier.discount_percent}%</span>
                                </div>
                            </div>

                            {/* Benefits Management */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gold uppercase tracking-[0.3em]">Avantages du Tier</h4>
                                {editingTier.benefits.map(b => (
                                    <div key={b.id} className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-zinc-800/50">
                                        <input
                                            type="checkbox"
                                            checked={b.enabled}
                                            onChange={() => {
                                                setEditingTier({
                                                    ...editingTier,
                                                    benefits: editingTier.benefits.map(bb =>
                                                        bb.id === b.id ? { ...bb, enabled: !bb.enabled } : bb
                                                    )
                                                })
                                            }}
                                            className="w-4 h-4 accent-gold"
                                        />
                                        <input
                                            value={b.label}
                                            onChange={e => {
                                                setEditingTier({
                                                    ...editingTier,
                                                    benefits: editingTier.benefits.map(bb =>
                                                        bb.id === b.id ? { ...bb, label: e.target.value } : bb
                                                    )
                                                })
                                            }}
                                            className="flex-1 bg-transparent text-xs text-white outline-none font-bold"
                                        />
                                        <button
                                            onClick={() => setEditingTier({
                                                ...editingTier,
                                                benefits: editingTier.benefits.filter(bb => bb.id !== b.id)
                                            })}
                                            className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                                        >
                                            <IconX size={12} />
                                        </button>
                                    </div>
                                ))}

                                {/* Add New */}
                                <div className="flex gap-2">
                                    <input
                                        placeholder="Nouvel avantage..."
                                        value={newBenefitLabel}
                                        onChange={e => setNewBenefitLabel(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { handleAddBenefit(editingTier.id); } }}
                                        className="flex-1 p-3 bg-black border border-zinc-800 rounded-xl text-xs outline-none focus:border-gold text-white"
                                    />
                                    <button
                                        onClick={() => handleAddBenefit(editingTier.id)}
                                        className="px-4 bg-gold text-black font-black rounded-xl text-xs hover:bg-white transition-all"
                                    >
                                        <IconPlus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setEditingTier(null)}
                                className="px-6 py-3 bg-zinc-800 text-zinc-400 font-black rounded-2xl hover:text-white transition-all text-xs uppercase tracking-widest"
                            >
                                ANNULER
                            </button>
                            <button
                                onClick={() => {
                                    // Apply the edited tier back
                                    setTiers(prev => prev.map(t => t.id === editingTier.id ? editingTier : t))
                                    setEditingTier(null)
                                }}
                                className="px-8 py-3 bg-gold text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-gold/10 text-xs uppercase tracking-widest"
                            >
                                APPLIQUER
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
