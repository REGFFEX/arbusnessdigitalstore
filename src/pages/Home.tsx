import React from 'react'
import Hero from '../components/Hero'
import StoreSections from '../components/StoreSections'
import { Link } from 'react-router-dom'
import { SiteNavBar, SiteNavFooter } from '../components/SiteNav'
import {
  IconGrid,
  IconBriefcase,
  IconArrowRight,
  IconShield,
  IconGlobe,
  IconPackage,
  IconSettings,
  IconSparkle,
  CATEGORY_ICONS
} from '../components/Icons'
import { useSettings } from '../hooks/useSettings'



const CAT_COLORS: Record<string, string> = {
  Application: 'from-blue-500/20 text-blue-400',
  Logiciel: 'from-purple-500/20 text-purple-400',
  Outil: 'from-orange-500/20 text-orange-400',
  Service: 'from-yellow-500/20 text-gold',
  Système: 'from-green-500/20 text-green-400',
  Ressource: 'from-pink-500/20 text-pink-400',
  Formation: 'from-cyan-500/20 text-cyan-400',
  Apps: 'from-blue-500/20 text-blue-400',
  Logiciels: 'from-purple-500/20 text-purple-400',
  Outils: 'from-orange-500/20 text-orange-400',
  Services: 'from-yellow-500/20 text-gold',
  Systèmes: 'from-green-500/20 text-green-400',
  Ressources: 'from-pink-500/20 text-pink-400',
}

const ALL_LINKS = [
  {
    group: 'Catalogue',
    icon: <IconGrid size={14} className="text-gold" />,
    links: [
      { label: 'Store Digital', path: '/store', desc: 'Tous les produits' },
      { label: 'Catégories', path: '/categories', desc: 'Filtres avancés' },
      { label: 'Premium', path: '/premium', desc: 'Contenus exclusifs' },
    ]
  },
  {
    group: 'Solutions',
    icon: <IconBriefcase size={14} className="text-zinc-400" />,
    links: [
      { label: 'Services B2B', path: '/services', desc: 'Nos services' },
      { label: 'Formations', path: '/categories?category=formation', desc: 'Cours en ligne' },
    ]
  },
  {
    group: 'À propos',
    icon: <IconGlobe size={14} className="text-zinc-400" />,
    links: [
      { label: 'Vision 2026', path: '/about', desc: 'Qui sommes-nous ?' },
      { label: 'Roadmap', path: '/roadmap', desc: 'Projets futurs' },
      { label: 'Communauté', path: '/community', desc: 'Flux de nouvelles' },
      { label: 'Guide & Aide', path: '/guide', desc: 'Tuto d\'utilisation' },
      { label: 'Contact', path: '/about#contact', desc: 'Nous écrire' },
    ]
  },
]

export default function Home() {
  const { settings } = useSettings()
  return (
    <div>
      {settings?.section_visibility?.home_hero !== false && <Hero />}

      {/* Section Catégories Premium */}
      {settings?.section_visibility?.home_categories !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 sm:mb-14">
            <div className="min-w-0">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                PARCOURIR PAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-600">UNIVERS</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full mt-3"></div>
            </div>
            <SiteNavBar />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {Object.keys(CATEGORY_ICONS).filter(k => k !== 'Default').map((catName) => {
              const colorClass = CAT_COLORS[catName] || 'from-zinc-500/20 text-zinc-400'
              const [fromClass, textClass] = colorClass.split(' ')
              return (
                <Link
                  key={catName}
                  to={`/categories?category=${catName.toLowerCase()}`}
                  className="group relative overflow-hidden bg-white/[0.035] p-3 sm:p-4 rounded-[24px] border border-white/[0.07] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/35 hover:bg-white/[0.06] text-center flex flex-col items-center gap-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${fromClass} to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                  <div className={`relative w-11 h-11 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${textClass} transition-transform duration-300 group-hover:scale-105`}>
                    {(() => {
                      const Icon = CATEGORY_ICONS[catName] || CATEGORY_ICONS.Default
                      return <Icon size={20} strokeWidth={1.8} />
                    })()}
                  </div>
                  <h3 className="relative font-bold text-[10px] uppercase tracking-[0.14em] text-zinc-400 group-hover:text-white transition-colors duration-300 truncate w-full">
                    {catName}
                  </h3>
                </Link>
              )
            })}
          </div>

          <div className="flex justify-center mt-10">
            <Link to="/categories" className="flex items-center gap-2 text-zinc-600 hover:text-gold transition-colors font-bold text-sm group">
              Filtres avancés &amp; recherche précise
              <IconArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      )}

      {/* Sections Store (Top Apps, Récents, Nouveautés) */}
      {settings?.section_visibility?.home_sections !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
          <StoreSections />
        </section>
      )}

      {/* CTA — Toutes les sections */}
      {settings?.section_visibility?.home_cta !== false && (
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-black text-white tracking-tight mb-3">
            AR BUSINESS DIGITAL STORE
          </h2>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs mb-2">— HOME —</p>
          <p className="text-zinc-500 text-lg mb-14">
            Toutes nos sections, accessible en un clic.
          </p>

          {/* Grille de liens par groupe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-left">
            {ALL_LINKS.map((group) => (
              <div key={group.group} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  {group.icon}
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{group.group}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-zinc-800/80 group transition-all"
                    >
                      <span className="font-bold text-zinc-300 group-hover:text-white text-sm transition-colors">{link.label}</span>
                      <IconArrowRight size={12} strokeWidth={2.5} className="text-zinc-700 group-hover:text-gold transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Boutons principaux */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/store" className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black hover:bg-gold hover:scale-105 transition-all shadow-2xl text-sm">
              <IconGrid size={16} strokeWidth={2.5} /> TOUT LE STORE
            </Link>
            <Link to="/categories" className="flex items-center gap-2 px-8 py-4 bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl font-black hover:border-gold/50 hover:bg-zinc-900 transition-all text-sm">
              <IconSparkle size={15} strokeWidth={2} className="text-zinc-400" /> RECHERCHE AVANCÉE
            </Link>
            <Link to="/premium" className="flex items-center gap-2 px-8 py-4 bg-gold/10 border border-gold/30 text-gold rounded-2xl font-black hover:bg-gold/20 transition-all text-sm">
              <IconShield size={15} strokeWidth={2} /> PREMIUM
            </Link>
            <Link to="/services" className="flex items-center gap-2 px-8 py-4 bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl font-black hover:border-zinc-700 hover:bg-zinc-900 transition-all text-sm">
              <IconSettings size={15} strokeWidth={2} className="text-zinc-400" /> SERVICES
            </Link>
            <Link to="/roadmap" className="flex items-center gap-2 px-8 py-4 bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl font-black hover:border-zinc-700 hover:bg-zinc-900 transition-all text-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> ROADMAP
            </Link>
            <Link to="/community" className="flex items-center gap-2 px-8 py-4 bg-zinc-900/50 border border-gold/30 text-white rounded-2xl font-black hover:bg-zinc-900 transition-all text-sm group">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
              COMMUNAUTÉ
            </Link>
            <Link to="/about" className="flex items-center gap-2 px-8 py-4 bg-zinc-900/50 border border-zinc-800 text-white rounded-2xl font-black hover:border-zinc-700 hover:bg-zinc-900 transition-all text-sm">
              <IconGlobe size={15} strokeWidth={2} className="text-zinc-400" /> À PROPOS
            </Link>
          </div>
        </section>
      )}

      <SiteNavFooter />
    </div>
  )
}
