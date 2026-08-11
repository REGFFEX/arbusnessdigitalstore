import React from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useBranding } from '../context/BrandingContext'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import { IconGlobe, IconSettings, IconGrid, IconShield, IconBriefcase, IconLock, IconDownload, IconChevronUp, IconChevronDown, IconMessageCircle, IconMapPin, IconInfoCircle, IconMail, IconHandshake, IconHome } from '../components/Icons'

// Images
import paulPhoto from '../assets/outils/image/userimages/Paul LeDev.png'

// Icônes inline pour les pôles (non dans Icons.tsx)
const IconMonitor = ({ size = 20, className = '', strokeWidth = 2 }: { size?: number; className?: string; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
)
const IconTarget = ({ size = 20, className = '', strokeWidth = 2 }: { size?: number; className?: string; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
)
const IconBook = ({ size = 20, className = '', strokeWidth = 2 }: { size?: number; className?: string; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
)
const IconFlask = ({ size = 20, className = '', strokeWidth = 2 }: { size?: number; className?: string; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 3h6l1 9H8L9 3z" /><path d="M6.73 19H17.27a2 2 0 0 0 1.73-3L16 9H8L4.99 16A2 2 0 0 0 6.73 19z" /></svg>
)
const IconSparkleS = ({ size = 20, className = '', strokeWidth = 2 }: { size?: number; className?: string; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2l2.4 7.6H22l-6.4 4.6 2.4 7.6L12 17.2l-6 4.6 2.4-7.6L2 9.6h7.6z" /></svg>
)
const IconLightning2 = ({ size = 20, className = '', strokeWidth = 2 }: { size?: number; className?: string; strokeWidth?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
)

// ─── Données équipe — à mettre à jour quand l'équipe s'agrandit ───────────────
const TEAM = [
    {
        photo: paulPhoto,
        initials: 'PL',
        name: 'Paul LeDev',
        title: 'Fondateur & Architecte Système',
        pole: 'AR BUSINESS Digital',
        tags: ['Développement', 'Architecture', 'Stratégie'],
        color: 'from-gold/20 to-yellow-900/10',
        border: 'border-gold/30',
        contact: {
            email: 'paul.ledev@arbusiness.cg',
            whatsapp: '+242067496033'
        }
    },
    {
        initials: '?',
        name: 'Poste en cours',
        title: 'Chef de Pôle Digital',
        pole: 'AR BUSINESS Digital',
        tags: ['Management', 'Coordination'],
        color: 'from-zinc-800/40 to-zinc-900/20',
        border: 'border-zinc-800',
        placeholder: true,
    },
    {
        initials: '?',
        name: 'Poste en cours',
        title: 'Responsable Contenu & Produits',
        pole: 'AR BUSINESS Digital',
        tags: ['Contenu', 'Produits'],
        color: 'from-zinc-800/40 to-zinc-900/20',
        border: 'border-zinc-800',
        placeholder: true,
    },
]

// ─── Les pôles AR BUSINESS (public only) ──────────────────────────────────────
const POLES = [
    { icon: <IconMonitor size={20} className="text-blue-400" />, name: 'AR BUSINESS Digital', desc: 'Apps, logiciels, outils & solutions numériques', active: true },
    { icon: <IconSettings size={20} className="text-zinc-400" strokeWidth={1.5} />, name: 'AR BUSINESS Tech', desc: 'Développement & solutions techniques avancées', active: false },
    { icon: <IconTarget size={20} className="text-orange-400" />, name: 'AR BUSINESS Services', desc: 'Prestations professionnelles sur mesure', active: false },
    { icon: <IconBook size={20} className="text-purple-400" />, name: 'AR BUSINESS BNG Education', desc: 'Formation, accompagnement & certification', active: false },
    { icon: <IconSparkleS size={20} className="text-pink-400" />, name: 'AR BUSINESS Annabelle', desc: 'Services & solutions Annabelle', active: false },
    { icon: <IconFlask size={20} className="text-cyan-400" />, name: 'AR BUSINESS Labs', desc: 'Recherche, expérimentation & prototypes', active: false },
]

export default function About() {
    const { settings } = useSettings()
    const { brandingData } = useBranding()
    const [expandedId, setExpandedId] = React.useState<string | null>(null)
    return (
        <div className="min-h-screen bg-black">

            {/* ─── HEADER ──────────────────────────────────────────── */}
            <div className="border-b border-zinc-900 pt-4 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] mb-1">AR Business Digital Store</p>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                                À <span className="text-gold">PROPOS</span>
                            </h1>
                            <p className="text-zinc-500 text-sm mt-1">Notre vision, notre organisation, notre équipe</p>
                        </div>
                        <SiteNavBar />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10 space-y-20">

                {/* ─── BLOC 1 : ORGANISATION & PÔLE (Cartes Identité) ───── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-8 bg-gold rounded-full"></div>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em]">Structure</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Carte AR BUSINESS (Organisation) */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-800 via-gold/50 to-zinc-800 opacity-20"></div>
                            <div className="w-24 h-24 mb-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-2xl relative z-10">
                                {/* Placeholder Logo AR Business Organisation - Stylisé */}
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gold to-yellow-600 tracking-tighter">
                                    AR
                                </div>
                                <div className="absolute -bottom-3 px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                                    CORP
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">AR BUSINESS</h2>
                            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-4">Organisation Mère</p>
                            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                                L'écosystème central qui pilote l'innovation, la technologie et les services à travers plusieurs domaines.
                            </p>
                        </div>

                        {/* Carte DIGITAL STORE (Pôle) */}
                        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-gold/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <span className="flex w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                            </div>
                            <div className="w-24 h-24 mb-6 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center shadow-2xl overflow-hidden relative z-10 group-hover:scale-105 transition-transform duration-500">
                                <img src={settings.logo_url || "/src/assets/logos/digital_store.png"} alt="Logo Digital Store" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">DIGITAL STORE</h2>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Pôle Digital</p>
                            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                                La division dédiée à la distribution et la vente de solutions numériques, applications et logiciels certifiés par AR Business.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {[
                            { value: '500+', label: 'Produits' },
                            { value: '50K+', label: 'Téléchargements' },
                            { value: '10K+', label: 'Utilisateurs' },
                            { value: '24/7', label: 'Support' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 text-center hover:bg-zinc-900/50 transition-colors">
                                <div className="text-2xl font-black text-gold mb-1">{stat.value}</div>
                                <div className="text-zinc-600 text-xs font-bold uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── BLOC 2 : AR BUSINESS (l'organisation) ───────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gold/10 p-2 rounded-xl text-gold">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /><path d="M12 2a14.5 14.5 0 0 1 0 20 14.5 14.5 0 0 1 0-20" /></svg>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em]">L'organisation</p>
                    </div>

                    <div className="bg-zinc-900/20 border border-zinc-800 rounded-3xl p-8 md:p-12 mb-6">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full mb-6">
                                <IconGlobe size={12} className="text-gold" strokeWidth={2.5} />
                                <span className="text-gold font-black text-xs uppercase tracking-widest">AR BUSINESS</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-5 tracking-tight">
                                Un écosystème,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-500">pas un simple site.</span>
                            </h2>
                            <p className="text-zinc-400 leading-relaxed text-base mb-4">
                                AR BUSINESS est une organisation multi-domaines qui opère dans la technologie,
                                le digital, les services, le commerce, l'éducation et l'innovation.
                            </p>
                            <p className="text-zinc-600 text-sm leading-relaxed">
                                Chaque pôle est autonome avec ses propres produits, services et
                                administration, mais tous partagent la même philosophie :
                                <strong className="text-zinc-400"> clarté, fiabilité, croissance.</strong>
                            </p>
                        </div>
                    </div>

                    {/* Pôles de l'organisation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {POLES.map((pole) => (
                            <div
                                key={pole.name}
                                className={`bg - zinc - 900 / 40 border rounded - 2xl p - 5 transition - all
                                    ${pole.active
                                        ? 'border-gold/30 bg-gold/5'
                                        : 'border-zinc-800 opacity-60'
                                    } `}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                        {pole.icon}
                                    </div>
                                    <div>
                                        <h3 className={`font - black text - sm ${pole.active ? 'text-gold' : 'text-zinc-400'} `}>
                                            {pole.name}
                                            {pole.active && <span className="ml-2 text-[9px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-black uppercase tracking-wider">CE SITE</span>}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-zinc-600 text-xs leading-relaxed">{pole.desc}</p>
                                {!pole.active && (
                                    <p className="text-zinc-800 text-[9px] mt-2 font-bold uppercase tracking-wider">Pôle en développement</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── BLOC 3 : ÉQUIPE ──────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-500/10 p-2 rounded-xl text-blue-400">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em]">L'équipe du pôle Digital</p>
                    </div>

                    <p className="text-zinc-600 text-sm mb-8 max-w-xl">
                        AR BUSINESS Digital Store est porté par son fondateur et une équipe en cours de constitution.
                        Les rôles existent, les personnes s'adaptent au système.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {TEAM.map((member) => (
                            <div
                                key={member.name + member.title}
                                className={`bg-gradient-to-br ${member.color} border ${member.border} rounded-3xl p-6 transition-all
                                    ${member.placeholder ? 'opacity-50' : 'hover:border-gold/50 hover:opacity-100'}`}
                            >
                                {/* Avatar - Priorité Image, sinon Initiales */}
                                <div className={`w-16 h-16 rounded-2xl mb-4 overflow-hidden shadow-lg
                                    ${member.placeholder ? 'bg-zinc-800 border border-zinc-700 flex items-center justify-center' : 'bg-black border border-gold/30'}`}>
                                    {member.photo ? (
                                        <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center font-black text-xl 
                                            ${member.placeholder ? 'text-zinc-600' : 'text-gold'}`}>
                                            {member.initials}
                                        </div>
                                    )}
                                </div>

                                <h3 className={`font-black text-base mb-1 ${member.placeholder ? 'text-zinc-700' : 'text-white'}`}>
                                    {member.name}
                                </h3>
                                <p className={`text-xs font-bold mb-1 ${member.placeholder ? 'text-zinc-700' : 'text-gold'}`}>
                                    {member.title}
                                </p>
                                <p className="text-zinc-700 text-[10px] mb-4">{member.pole}</p>

                                <div className="flex flex-wrap gap-1.5">
                                    {(member.tags || []).map((tag) => (
                                        <span key={tag}
                                            className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider
                                                ${member.placeholder ? 'bg-zinc-800/50 text-zinc-700' : 'bg-zinc-900/60 text-zinc-500'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {member.placeholder && (
                                    <p className="text-zinc-800 text-[9px] mt-3 font-black uppercase tracking-widest">Poste à pourvoir</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── VALEURS ──────────────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gold/10 p-2 rounded-xl text-gold">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em]">Nos valeurs</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: <IconLock size={26} className="text-gold" strokeWidth={1.5} />, bg: 'bg-gold/10 border-gold/20', title: 'Sécurité', desc: 'Produits vérifiés et sécurisés' },
                            { icon: <IconLightning2 size={26} className="text-yellow-400" strokeWidth={1.5} />, bg: 'bg-yellow-500/10 border-yellow-500/20', title: 'Performance', desc: 'Expérience rapide et fluide' },
                            { icon: <IconShield size={26} className="text-blue-400" strokeWidth={1.5} />, bg: 'bg-blue-500/10 border-blue-500/20', title: 'Qualité', desc: 'Sélection rigoureuse' },
                            { icon: <IconHandshake size={26} className="text-green-400" strokeWidth={1.5} />, bg: 'bg-green-500/10 border-green-500/20', title: 'Confiance', desc: 'Support client réactif' },
                        ].map((v) => (
                            <div key={v.title} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 text-center hover:border-gold/30 transition-all group">
                                <div className={`w - 14 h - 14 rounded - 2xl border ${v.bg} flex items - center justify - center mx - auto mb - 3 group - hover: scale - 110 transition - transform`}>{v.icon}</div>
                                <h3 className="font-black text-white text-sm mb-1 group-hover:text-gold transition-colors">{v.title}</h3>
                                <p className="text-xs text-zinc-600">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── MESSAGES OFFICIELS ─── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gold/10 p-2 rounded-xl text-gold">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em]">Communications & Messages</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className="text-xl font-black text-white tracking-tight uppercase italic">Portail d'Informations</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Retrouvez ici les messages officiels, les annonces importantes et la documentation directe du pôle Digital Store.
                            </p>
                            <div className="p-4 bg-zinc-900 shadow-xl rounded-2xl border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <IconGlobe size={18} className="text-gold" />
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Localisation</div>
                                </div>
                                <p className="mt-2 text-xs font-bold text-white uppercase tracking-tighter italic">
                                    {brandingData?.location || 'Congo-Brazzaville'}
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-3">
                            {brandingData?.messages && brandingData.messages.length > 0 ? (
                                brandingData.messages.filter(m => m.active).map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all hover:border-gold/30"
                                    >
                                        <button
                                            onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                                            className="w-full p-6 flex items-center justify-between text-left group"
                                        >
                                            <span className="font-black text-white uppercase italic tracking-tight group-hover:text-gold transition-colors">{msg.title}</span>
                                            {expandedId === msg.id ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                                        </button>

                                        {expandedId === msg.id && (
                                            <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                                                <div className="h-px bg-zinc-800 mb-6"></div>
                                                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap italic">
                                                    {msg.content}
                                                </p>
                                                {msg.file_url && (
                                                    <a
                                                        href={msg.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 bg-zinc-800 rounded-xl text-xs font-black text-gold uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all"
                                                    >
                                                        <IconDownload size={14} strokeWidth={2.5} />
                                                        Télécharger le document
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[40px]">
                                    <p className="text-zinc-700 font-black uppercase tracking-[0.3em] italic">Aucune communication active</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ─── CONTACT ──────────────────────────────────────────── */}
                <section id="contact" className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-10 text-center">
                    <h2 className="text-3xl font-black text-white mb-3">
                        Contactez-<span className="text-gold">nous</span>
                    </h2>
                    <p className="text-zinc-500 text-sm mb-8">Une question ? Un projet ? Notre équipe est à votre écoute.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                        <div className="bg-zinc-800/50 rounded-2xl p-4">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-2">
                                <IconMail size={18} className="text-gold" />
                            </div>
                            <h3 className="font-black text-white text-sm mb-1">Email</h3>
                            <a href="mailto:arbusinessdigitalstore@gmail.com" className="text-gold text-xs hover:underline">
                                arbusinessdigitalstore@gmail.com
                            </a>
                        </div>
                        <div className="bg-zinc-800/50 rounded-2xl p-4">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-2">
                                <IconMessageCircle size={18} className="text-green-400" />
                            </div>
                            <h3 className="font-black text-white text-sm mb-1">WhatsApp</h3>
                            <a href="https://wa.me/243000000000" className="text-gold text-xs hover:underline" target="_blank" rel="noopener noreferrer">
                                Nous contacter
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link to="/services" className="flex items-center gap-2 px-6 py-3 bg-gold text-black rounded-xl font-black text-sm hover:bg-yellow-400 transition-all">
                            <IconBriefcase size={15} strokeWidth={2.5} /> Nos Services
                        </Link>
                        <Link to="/store" className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl font-black text-sm hover:border-zinc-600 transition-all">
                            <IconGrid size={15} strokeWidth={2.5} /> Voir le Store
                        </Link>
                        <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 text-white rounded-xl font-black text-sm hover:border-zinc-600 transition-all">
                            <IconHome size={15} /> Accueil
                        </Link>
                    </div>
                </section>
            </div >

            <SiteNavFooter />
        </div >
    )
}
