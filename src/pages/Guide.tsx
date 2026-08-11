import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import {
    IconChevronDown,
    IconSearch,
    IconGlobe,
    IconDownload,
    IconLock,
    IconHelpCircle,
    IconShield,
    IconTrending,
    IconMegaphone,
    IconBriefcase,
    IconUsers,
    IconPackage
} from '../components/Icons'

// ── Types & Sections ─────────────────────────────────────────────────────────

interface GuideItem {
    icon: React.ReactNode;
    title: string;
    text: string;
}

interface GuideSection {
    id: string;
    icon: React.ReactNode;
    title: string;
    color: string;
    borderColor: string;
    bgColor: string;
    description: string;
    locationDesc?: string;
    items: GuideItem[];
}

const GUIDE_DATA: GuideSection[] = [
    {
        id: 'navigation',
        icon: <IconGlobe size={24} />,
        title: 'Navigation & Accès',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/20',
        bgColor: 'bg-blue-500/5',
        description: 'Comment se retrouver dans l\'univers AR Business Digital Store.',
        locationDesc: '📍 Emplacement : Barre supérieure (Navbar) → Guide & Aide',
        items: [
            { icon: <IconGlobe size={18} />, title: 'Le Menu Principal', text: 'Situé en haut de chaque page, il permet d\'accéder aux sections majeures : Store, Services, Communauté.' },
            { icon: <IconTrending size={18} />, title: 'Le Ruban SiteNav', text: 'Plié sous le menu principal, il affiche les raccourcis vers les sous-sections et catégories populaires.' },
            { icon: <IconChevronDown size={18} />, title: 'Menu Mobile', text: 'Dnas les angles supérieurs, l\'icône ☰ (hamburger) ouvre la navigation sur smartphone.' }
        ]
    },
    {
        id: 'search',
        icon: <IconSearch size={24} />,
        title: 'Recherche Intelligente',
        color: 'text-purple-400',
        borderColor: 'border-purple-500/20',
        bgColor: 'bg-purple-500/5',
        description: 'Trouvez exactement ce que vous cherchez, même sans le nom précis.',
        locationDesc: '📍 Emplacement : Loupe 🔍 dans le Navbar.',
        items: [
            { icon: <IconSearch size={18} />, title: 'Saisie Prédictive', text: 'Les résultats s\'affichent en temps réel pendant que vous tapez.' },
            { icon: <IconGlobe size={18} />, title: 'Mode Cerveau 🧠', text: 'Activé par défaut, il utilise l\'IA pour comprendre vos intentions (ex: tapez "montage" pour trouver des éditeurs vidéo).' }
        ]
    },
    {
        id: 'store',
        icon: <IconDownload size={24} />,
        title: 'Store & Téléchargements',
        color: 'text-gold',
        borderColor: 'border-gold/20',
        bgColor: 'bg-gold/5',
        description: 'Gérer vos acquisitions de logiciels et applications.',
        locationDesc: '📍 Emplacement : Section Store / Page Produit.',
        items: [
            { icon: <IconDownload size={18} />, title: 'Fichiers multiples', text: 'Certains produits comme "Casier-d\'Or" proposent plusieurs versions (Windows EXE et Android APK).' },
            { icon: <IconLock size={18} />, title: 'Types d\'accès', text: 'DIRECT (libre), ADS (gratuit après pub), PREM (accès réservé aux abonnés).' }
        ]
    },
    {
        id: 'services',
        icon: <IconBriefcase size={24} />,
        title: 'Services B2B Lab',
        color: 'text-orange-400',
        borderColor: 'border-orange-500/20',
        bgColor: 'bg-orange-500/5',
        description: 'Solutions sur-mesure pour votre entreprise.',
        locationDesc: '📍 Emplacement : Onglet Services / Section Lab.',
        items: [
            { icon: <IconUsers size={18} />, title: 'Contact Manager', text: 'Chaque service affiche un responsable direct avec ses liens WhatsApp et Telegram.' },
            { icon: <IconMegaphone size={18} />, title: 'Audit technique', text: 'Utilisez le bouton "En savoir plus" pour voir les détails techniques et garanties du Lab.' }
        ]
    },
    {
        id: 'security',
        icon: <IconShield size={24} />,
        title: 'Sécurité & Confidentialité',
        color: 'text-cyan-400',
        borderColor: 'border-cyan-500/20',
        bgColor: 'bg-cyan-500/5',
        description: 'Votre protection est notre priorité absolue.',
        locationDesc: '📍 Emplacement : Barre supérieure (Navbar) → Guide & Aide',
        items: [
            { icon: <IconShield size={18} />, title: 'Data Lockdown', text: 'Aucun compte requis. Vos téléchargements sont anonymisés et sécurisés via Row Level Security (RLS).' },
            { icon: <IconLock size={18} />, title: 'Transactions AR', text: 'Les paiements Mobile Money sont traités par des passerelles sécurisées locales certifiées.' }
        ]
    }
]

export default function Guide() {
    const [openSection, setOpenSection] = useState<string | null>('navigation')

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="border-b border-zinc-900 pt-6 pb-8 px-4 sm:px-8 bg-zinc-900/10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="animate-in slide-in-from-left duration-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
                                    <IconHelpCircle size={28} className="text-gold" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Support Center</p>
                                    <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter italic">
                                        GUIDE <span className="text-gold">PRO</span>
                                    </h1>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-sm sm:text-lg max-w-xl font-medium">
                                Apprenez à maîtriser chaque recoin de <span className="text-zinc-300">AR Business Digital Store</span>.
                                Précision, sécurité et excellence.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <SiteNavBar />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20">

                {/* Intro Card */}
                <div className="mb-12 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gold/20 to-zinc-800/20 rounded-[40px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="shrink-0 w-24 h-24 bg-gradient-to-br from-zinc-800 to-black rounded-3xl border border-zinc-700 flex items-center justify-center shadow-2xl">
                            <IconPackage size={48} className="text-gold" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white mb-3">Besoin d'aide pour vos premiers pas ?</h2>
                            <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                                Nous avons conçu ce guide pour vous orienter précisément. Si vous cherchez un produit spécifique ou
                                si vous voulez comprendre comment télécharger plusieurs versions d'une même application,
                                vous êtes au bon endroit. Explorez les sections ci-dessous.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Accordions */}
                <div className="space-y-4">
                    {GUIDE_DATA.map((section) => {
                        const isOpen = openSection === section.id
                        return (
                            <div
                                key={section.id}
                                className={`group transition-all duration-500 ${isOpen ? 'scale-[1.01]' : 'hover:scale-[1.005]'}`}
                            >
                                <button
                                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                                    className={`w-full text-left p-6 sm:p-8 rounded-[32px] border transition-all duration-300 flex items-center justify-between
                                        ${isOpen
                                            ? `${section.borderColor} ${section.bgColor} shadow-2xl shadow-black/50`
                                            : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
                                        }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-3 rounded-2xl ${isOpen ? 'bg-white/10' : 'bg-zinc-800'} transition-colors`}>
                                            <div className={isOpen ? section.color : 'text-zinc-500'}>
                                                {section.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className={`text-lg sm:text-xl font-black ${isOpen ? 'text-white' : 'text-zinc-400'}`}>
                                                {section.title}
                                            </h3>
                                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                                                {section.description}
                                            </p>
                                        </div>
                                    </div>
                                    <IconChevronDown
                                        size={24}
                                        className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-gold' : 'text-zinc-700'}`}
                                    />
                                </button>

                                {/* Content Body */}
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-8 bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] space-y-8">
                                        {section.locationDesc && (
                                            <div className="flex items-center gap-3 py-3 px-5 bg-black/40 rounded-2xl border border-zinc-800/50">
                                                <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                                                <p className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-widest leading-none">
                                                    {section.locationDesc}
                                                </p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-6">
                                            {section.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-5 group/item">
                                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center text-gold group-hover/item:scale-110 transition-transform">
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-zinc-200 font-black text-sm mb-1">{item.title}</h4>
                                                        <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">{item.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer CTA */}
                <div className="mt-20 pt-20 border-t border-zinc-900 text-center">
                    <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Prêt à dominer le digital ?</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link to="/store" className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm hover:bg-gold transition-all shadow-xl">
                            EXPLORER LE STORE
                        </Link>
                        <Link to="/services" className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all">
                            NOS SERVICES B2B
                        </Link>
                    </div>
                </div>
            </div>

            <SiteNavFooter />
        </div>
    )
}
