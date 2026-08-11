import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/products'
import ProductCard from '../components/ProductCard'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import { IconShield, IconArrowRight, IconCheck, IconX } from '../components/Icons'
import { supabase } from '../config/supabase'
import PaymentModal from '../components/PaymentModal'

// Icônes SVG inline pour les avantages Premium (rôle-spécifique)
const PremiumBenefits = [
    {
        title: 'Qualité Supérieure',
        desc: 'Produits testés et vérifiés pour une expérience optimale',
        colorClass: 'text-gold bg-gold/10 border-gold/20',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
            </svg>
        )
    },
    {
        title: 'Mises à jour Exclusives',
        desc: 'Accédez aux nouvelles fonctionnalités en avant-première',
        colorClass: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        )
    },
    {
        title: 'Support Prioritaire',
        desc: 'Assistance dédiée et réponses rapides à vos questions',
        colorClass: 'text-green-400 bg-green-500/10 border-green-500/20',
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
        )
    },
]

const DEFAULT_TIERS = [
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
        benefits: [
            { id: 'b1', label: 'Badges Exclusifs sur le profil', enabled: true },
            { id: 'b2', label: 'Soutien à la plateforme', enabled: true },
            { id: 'b3', label: 'Support par email standard', enabled: true },
            { id: 'b4', label: 'Réduction de -10% sur tout le store', enabled: true }
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
        benefits: [
            { id: 'b5', label: 'Zéro Publicité (Store & Apps)', enabled: true },
            { id: 'b6', label: 'Réduction de -25% sur tout le store', enabled: true },
            { id: 'b7', label: 'Accès Prioritaire aux bêtas', enabled: true },
            { id: 'b8', label: 'Support prioritaire 24h/7j', enabled: true },
            { id: 'b9', label: 'Badge "Vente Elite" débloqué', enabled: true }
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
        benefits: [
            { id: 'b10', label: 'DAY 1 : Tout gratuit le premier jour !', enabled: true },
            { id: 'b11', label: 'DAY 2 : Réduction de -50% garanti', enabled: true },
            { id: 'b12', label: 'Zéro Publicité à vie', enabled: true },
            { id: 'b13', label: 'Formation B2B Offerte chaque mois', enabled: true },
            { id: 'b14', label: 'Accès direct aux développeurs (Discord)', enabled: true },
            { id: 'b15', label: "Personnalisation UI de l'App Store", enabled: true }
        ]
    }
]

export default function Premium() {
    const [premiumProducts, setPremiumProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [tiers, setTiers] = useState<any[]>(DEFAULT_TIERS)
    const [tierToPay, setTierToPay] = useState<any | null>(null)

    useEffect(() => {
        // Load products
        getProducts()
            .then((data) => {
                const premium = data.filter((p: any) =>
                    p.license?.toLowerCase() === 'premium' ||
                    p.license?.toLowerCase() === 'freemium' ||
                    p.is_premium === true
                )
                setPremiumProducts(premium)
            })
            .catch((e) => console.error(e))
            .finally(() => setLoading(false))

        // Load tiers config
        supabase.from('settings').select('value').eq('key', 'premium_config').single()
            .then(({ data }) => {
                if (data?.value) setTiers(data.value as any[])
            })
    }, [])

    const handleSubscribe = (tier: any) => {
        // Create virtual product for PaymentModal
        const virtualProduct = {
            id: tier.id,
            name: tier.name,
            price: tier.price_usd,
            price_fcfa: tier.price_fcfa,
            type: 'ABONNEMENT PREMIUM',
            image: '/premium_badge.png', // Placeholder if needed
        }
        setTierToPay(virtualProduct)
    }

    const onPaymentSuccess = () => {
        // Store premium level in localStorage for immediate effect
        const tier = tiers.find(t => t.id === tierToPay.id)
        if (tier) {
            localStorage.setItem('ar_user_premium_level', tier.level.toString())
            alert(`Félicitations ! Vous êtes maintenant ${tier.name} !`)
        }
        setTierToPay(null)
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Premium */}
            <section className="relative bg-gradient-to-br from-black via-zinc-950 to-black py-20 px-4 overflow-hidden border-b border-zinc-900">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <div className="w-96 h-96 bg-gold rounded-full blur-3xl animate-glow"></div>
                </div>

                <div className="relative max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-black uppercase tracking-wider mb-8">
                        <IconShield size={14} strokeWidth={2.5} />
                        ÉCOSYSTÈME PRIVILÈGE
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
                        Dominez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-500">Store</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
                        Choisissez votre niveau d'accréditation et débloquez une expérience sans limites, des réductions massives et des exclusivités Day 1.
                    </p>
                    <div className="flex justify-center gap-4">
                        <SiteNavBar />
                    </div>
                </div>
            </section>

            {/* Pricing Tiers */}
            <section className="max-w-7xl mx-auto px-4 py-20 -mt-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`relative bg-zinc-900 border ${tier.border_color} rounded-[40px] p-8 flex flex-col items-center text-center transition-all duration-500 hover:scale-[1.02] ${tier.is_popular ? 'shadow-[0_20px_50px_rgba(212,175,55,0.1)] ring-2 ring-gold/20' : ''}`}
                        >
                            {tier.is_popular && (
                                <div className="absolute -top-4 bg-gold text-black px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    Plus Populaire
                                </div>
                            )}

                            <div className={`p-4 rounded-3xl bg-gradient-to-br from-${tier.color_from} to-${tier.color_to} mb-6`}>
                                <IconShield size={32} className={tier.text_color} />
                            </div>

                            <h3 className={`text-xl font-black italic tracking-tighter mb-1 ${tier.text_color}`}>{tier.name}</h3>
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black text-white">{tier.price_usd}</span>
                                <span className="text-zinc-500 text-sm font-bold">$ / MOIS</span>
                            </div>

                            <div className="w-full space-y-4 mb-10 text-left">
                                {tier.benefits.filter((b: any) => b.enabled).map((benefit: any, i: number) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-1 flex-shrink-0 ${tier.text_color}`}>
                                            <IconCheck size={14} strokeWidth={3} />
                                        </div>
                                        <p className="text-xs font-bold text-zinc-400 leading-relaxed uppercase tracking-tight">{benefit.label}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(tier)}
                                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${tier.level === 3 ? 'bg-gold text-black hover:bg-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                            >
                                S'ACTIVER MAINTENANT
                            </button>
                        </div>
                    ))}
                </div>

                {/* Tableau de Comparaison (Play Store Premium Style) */}
                <div className="mb-24 overflow-x-auto pb-4 scrollbar-none">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 text-center">
                        COMPAREZ LES <span className="text-gold">NIVEAUX</span>
                    </h2>
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="py-6 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fonctionnalités</th>
                                {tiers.map(t => (
                                    <th key={t.id} className="py-6 px-4 text-center">
                                        <span className={`text-xs font-black italic ${t.text_color}`}>{t.name}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Réduction Store', key: 'discount_percent', type: 'percent' },
                                { label: 'Zéro Publicité', key: 'no_ads', type: 'check' },
                                { label: 'Day 1 Gratuit', key: 'day1_free', type: 'check' },
                                { label: 'Day 2 à -50%', key: 'day2_half', type: 'check' },
                                { label: 'Support Prioritaire', key: 'has_priority_support', type: 'check', custom: (t: any) => t.level >= 2 },
                                { label: 'Accès Bêtas', key: 'has_beta_access', type: 'check', custom: (t: any) => t.level >= 2 },
                                { label: 'Contact Dev Direct', key: 'has_dev_contact', type: 'check', custom: (t: any) => t.level >= 3 }
                            ].map((feature, idx) => (
                                <tr key={idx} className="border-b border-zinc-900/50 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-5 px-4 text-xs font-bold text-zinc-400 capitalize">{feature.label}</td>
                                    {tiers.map(t => (
                                        <td key={t.id} className="py-5 px-4 text-center">
                                            {feature.type === 'percent' ? (
                                                <span className="text-white font-black">-{t.discount_percent}%</span>
                                            ) : feature.type === 'check' ? (
                                                <div className="flex justify-center">
                                                    {(feature.custom ? feature.custom(t) : t[feature.key as keyof typeof t]) ? (
                                                        <IconCheck size={16} className="text-gold" strokeWidth={3} />
                                                    ) : (
                                                        <IconX size={14} className="text-zinc-800 " />
                                                    )}
                                                </div>
                                            ) : null}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {PremiumBenefits.map((item) => (
                        <div key={item.title} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 text-center hover:border-gold/30 transition-all group">
                            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-5 ${item.colorClass} group-hover:scale-110 transition-transform`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 group-hover:text-gold transition-colors">{item.title}</h3>
                            <p className="text-zinc-500 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Produits Premium */}
                <div className="flex items-center justify-between mb-8 pt-10 border-t border-zinc-900">
                    <h2 className="text-3xl font-black text-white italic">
                        PRODUITS <span className="text-gold">PRIVILÈGES</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-zinc-900/40 rounded-[28px] aspect-square animate-pulse border border-zinc-800"></div>
                        ))}
                    </div>
                ) : premiumProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {premiumProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-zinc-900/20 rounded-3xl border border-zinc-800">
                        <div className="w-16 h-16 bg-gold/10 border border-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <IconShield size={30} className="text-gold" strokeWidth={1.5} />
                        </div>
                        <p className="text-zinc-400 font-bold">Aucun produit premium disponible</p>
                    </div>
                )}
            </section>

            <SiteNavFooter />

            {tierToPay && (
                <PaymentModal
                    product={tierToPay}
                    onClose={() => setTierToPay(null)}
                    onSuccess={onPaymentSuccess}
                />
            )}
        </div>
    )
}
