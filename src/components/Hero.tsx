import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import logo from '../assets/logos/digital_store.png'

// ── Slides du Billboard Hero ──────────────────────────────────────────────────
interface HeroSlide {
    id: number
    image: string | null
    label: string
    title: string
    subtitle: string
    ctaLabel: string
    ctaHref: string
    color: string
}

export default function Hero() {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentSlide, setCurrentSlide] = useState(0)
    const navigate = useNavigate()
    const { settings } = useSettings()

    const HERO_SLIDES: HeroSlide[] = [
        {
            id: 1,
            image: logo,
            label: 'Bienvenue',
            title: settings?.site_name || 'AR Business Digital Store',
            subtitle: settings?.site_slogan || 'Votre partenaire digital au Congo.',
            ctaLabel: 'Découvrir le Store',
            ctaHref: '/store',
            color: 'from-zinc-900',
        },
        {
            id: 2,
            image: null,
            label: 'Le Store',
            title: 'Applications & Logiciels',
            subtitle: 'Un catalogue premium trié sur le volet.',
            ctaLabel: 'Explorer le Store',
            ctaHref: '/store',
            color: 'from-blue-950',
        },
        {
            id: 3,
            image: null,
            label: 'Services B2B',
            title: 'Développement & Conseil',
            subtitle: 'Des services sur mesure pour votre entreprise.',
            ctaLabel: 'Voir les Services',
            ctaHref: '/services',
            color: 'from-purple-950',
        },
        {
            id: 4,
            image: null,
            label: 'Formations',
            title: 'Montez en Compétences',
            subtitle: 'Des formations pointues et certifiantes.',
            ctaLabel: 'Voir les Formations',
            ctaHref: '/categories',
            color: 'from-emerald-950',
        },
        {
            id: 5,
            image: null,
            label: 'Notre Équipe',
            title: 'L\'Excellence à votre Service',
            subtitle: 'Dédiée à vous offrir les meilleures solutions.',
            ctaLabel: 'À Propos',
            ctaHref: '/about',
            color: 'from-gold/20',
        },
        {
            id: 6,
            image: null,
            label: 'Communauté',
            title: 'Rejoignez le Mouvement',
            subtitle: 'Restez informé des dernières actualités.',
            ctaLabel: 'Rejoindre',
            ctaHref: '/community',
            color: 'from-orange-950',
        },
    ]

    // ... useEffect remains same ...

    // Auto-défilement toutes les 5 secondes
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const slide = HERO_SLIDES[currentSlide]

    return (
        <section className="relative bg-black pt-24 sm:pt-32 pb-12 px-4 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold/10 rounded-full blur-[120px] opacity-40" />
                <div className="absolute -top-[10%] left-[10%] w-64 h-64 bg-zinc-800/30 rounded-full blur-[80px]" />
            </div>

            <div className="relative max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center space-y-6 sm:space-y-10">

                    {/* ── HERO HEADER : 3 colonnes (Logo | Titre 3D | Globe) ─── */}
                    <div className="flex flex-row items-center justify-between gap-3 sm:gap-6 w-full max-w-6xl mx-auto">

                        {/* ── GAUCHE : Logo avec effet avant/noir/argent/lumière ── */}
                        <div className="flex-shrink-0 group cursor-pointer" title="AR Business Digital Store">
                            <div className="relative w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] md:w-[130px] md:h-[130px]">
                                {/* Halo derrière */}
                                <div className="absolute inset-[-8px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700
                                    bg-[radial-gradient(circle,rgba(212,175,55,0.35)_0%,rgba(180,180,200,0.15)_60%,transparent_100%)]
                                    blur-xl" />
                                {/* Fond noir base */}
                                <div className="absolute inset-0 bg-zinc-950" style={{ borderRadius: settings.logo_border_radius || '24px' }} />
                                {/* Bordure argent fine — brille au hover */}
                                <div className="absolute inset-0 border border-zinc-600/40 group-hover:border-[rgba(212,175,55,0.8)] transition-all duration-500
                                    shadow-[inset_0_0_0_1px_rgba(150,150,170,0.15)] group-hover:shadow-[0_0_24px_rgba(212,175,55,0.5),inset_0_0_0_1px_rgba(212,175,55,0.4)]"
                                    style={{ borderRadius: settings.logo_border_radius || '24px' }}
                                />
                                {/* Image logo devant le noir */}
                                <img
                                    src={settings.logo_url || logo}
                                    alt="AR Business Digital Store Logo"
                                    className="absolute inset-0 w-full h-full object-contain p-2 sm:p-3 z-10 group-hover:scale-108 transition-transform duration-500 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                                    style={{ filter: 'drop-shadow(0 2px 6px rgba(212,175,55,0.2))' }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const el = e.currentTarget.parentElement;
                                        if (el) {
                                            const fb = document.createElement('div');
                                            fb.className = 'absolute inset-0 flex items-center justify-center z-10';
                                            fb.innerHTML = '<span style="font-size:3rem;font-weight:900;background:linear-gradient(135deg,#d4af37,#b8860b,#d4af37);-webkit-background-clip:text;-webkit-text-fill-color:transparent">AR</span>';
                                            el.appendChild(fb);
                                        }
                                    }}
                                />
                                {/* Reflet brillant coin haut-gauche */}
                                <div className="absolute top-1 left-2 w-1/3 h-[35%] rounded-full bg-white/5 blur-[4px] pointer-events-none z-20
                                    group-hover:bg-white/15 transition-all duration-500" />
                            </div>
                        </div>

                        {/* ── CENTRE : Titre 3D ────────────────────────────────── */}
                        <div className="flex-1 text-center min-w-0 flex flex-col items-center">
                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 sm:mb-2"
                                style={{ color: 'rgba(212,175,55,0.65)', textShadow: '0 0 12px rgba(212,175,55,0.3)' }}>
                                Pôle Digital · Congo 2026
                            </p>

                            <h1 className="leading-[1.05] tracking-tight select-none">
                                {/* AR — Or véritable avec effet 3D/ombre */}
                                <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black"
                                    style={{
                                        background: 'linear-gradient(135deg, #f5d060 0%, #d4af37 30%, #b8860b 55%, #d4af37 80%, #f5d060 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        textShadow: 'none',
                                        filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                                    }}>
                                    AR
                                </span>
                                {/* BUSINESS — Argent nacré brillant */}
                                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #d0d8e8 35%, #a0b0c8 60%, #dce4f0 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 3px 10px rgba(180,200,240,0.4)) drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                                    }}>
                                    BUSINESS
                                </span>
                                {/* Digital Store — Blanc bleuté nacré */}
                                <span className="block text-xl sm:text-2xl md:text-3xl lg:text-5xl xl:text-6xl font-black"
                                    style={{
                                        background: 'linear-gradient(135deg, #e8f0ff 0%, #b0c4ff 40%, #7090e0 70%, #c8d8ff 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 3px 14px rgba(100,150,255,0.45)) drop-shadow(0 2px 4px rgba(0,0,0,0.9))',
                                    }}>
                                    {settings.site_content?.home?.hero?.title || settings.store_titles?.hero_title || 'Digital Store'}
                                </span>
                            </h1>

                            <p className="text-[9px] sm:text-[11px] lg:text-lg xl:text-xl text-zinc-500 italic mt-2 font-bold tracking-wide hidden sm:block">
                                {settings.site_content?.home?.hero?.subtitle || "L'Excellence Digitale — Congo Brazzaville"}
                            </p>
                        </div>

                        {/* ── DROITE : Globe courbes réalistes + drapeaux ─── */}
                        <div className="flex-shrink-0 flex items-center justify-center">
                            <div className="relative w-[80px] h-[80px] sm:w-[110px] sm:h-[110px] md:w-[148px] md:h-[148px]">
                                <div className="absolute inset-0 rounded-full bg-blue-900/20 blur-xl" />
                                <svg viewBox="0 0 240 240" className="w-full h-full"
                                    style={{ filter: 'drop-shadow(0 0 18px rgba(100,150,255,0.3))' }}>
                                    <defs>
                                        <radialGradient id="gG" cx="35%" cy="30%" r="65%" fx="30%" fy="25%">
                                            <stop offset="0%" stopColor="#254070" />
                                            <stop offset="40%" stopColor="#122545" />
                                            <stop offset="85%" stopColor="#081020" />
                                            <stop offset="100%" stopColor="#040812" />
                                        </radialGradient>
                                        <radialGradient id="gS" cx="28%" cy="22%" r="52%">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                        </radialGradient>
                                        <radialGradient id="gGloss" cx="50%" cy="50%" r="50%">
                                            <stop offset="85%" stopColor="rgba(0,0,0,0)" />
                                            <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
                                        </radialGradient>
                                        <clipPath id="gC"><circle cx="120" cy="120" r="110" /></clipPath>
                                    </defs>

                                    {/* Ocean — Base Sphérique Profonde */}
                                    <circle cx="120" cy="120" r="111" fill="url(#gG)" stroke="rgba(80,130,255,0.4)" strokeWidth="1.5" />

                                    {/* Ombre portée interne pour l'effet de sphère (occlusion) */}
                                    <circle cx="120" cy="120" r="110" fill="url(#gGloss)" pointerEvents="none" />

                                    {/* Grille lat/lon subtile — Plus courbée pour la sphéricité */}
                                    <g clipPath="url(#gC)" stroke="rgba(120,160,220,0.12)" strokeWidth="0.4" fill="none" pointerEvents="none">
                                        {[30, 60, 90, 120, 150, 180, 210].map(x => (
                                            <path key={x} d={`M ${x} 10 Q 120 120 ${x} 230`} opacity="0.5" />
                                        ))}
                                        {[35, 60, 85, 120, 155, 185, 210].map(y => {
                                            const rx = Math.sqrt(Math.max(0, 110 * 110 - Math.pow(y - 120, 2)))
                                            return <ellipse key={y} cx="120" cy={y} rx={rx} ry={Math.min(6, rx * 0.1)} />
                                        })}
                                    </g>

                                    {/* ══════════════════════════════════════════════
                                        CONTINENTS — courbes Bézier réalistes
                                        (Q = quadratique, C = cubique, S = smooth)
                                    ══════════════════════════════════════════════ */}
                                    <g clipPath="url(#gC)" stroke="rgba(40,45,55,0.9)" strokeWidth="0.8" style={{ transition: 'all 0.5s ease' }}>

                                        {/* ═══ AFRIQUE (Gris sombre + Interactivité) ═══ */}
                                        <g className="cursor-pointer transition-all duration-500 hover:scale-[1.12]" style={{ transformOrigin: '116px 114px', transformBox: 'fill-box' }}>
                                            <path d={`
                                                M 88 62
                                                Q 96 56 110 54
                                                Q 126 53 138 57
                                                Q 144 62 142 70
                                                Q 140 78 132 84
                                                Q 145 82 152 88
                                                Q 160 86 165 92
                                                Q 164 100 158 104
                                                Q 164 108 162 116
                                                Q 158 122 153 128
                                                Q 152 134 148 140
                                                Q 148 150 144 156
                                                Q 140 164 136 170
                                                Q 128 180 120 185
                                                Q 110 188 104 182
                                                Q 96 174 94 164
                                                Q 88 152 86 140
                                                Q 78 132 76 120
                                                Q 74 110 78 102
                                                Q 80 94 82 86
                                                Q 82 76 86 68
                                                Q 87 64 88 62 Z
                                            `} fill="rgba(75,100,85,0.75)" />

                                            {/* Congo Brazzaville HIGHLIGHT — courbes douces */}
                                            <path d={`
                                                M 108 100
                                                Q 118 96 128 101
                                                Q 134 106 132 115
                                                Q 130 124 122 128
                                                Q 114 130 107 125
                                                Q 101 120 102 110
                                                Q 103 104 108 100 Z
                                            `}
                                                fill="rgba(212,175,55,0.25)"
                                                stroke="rgba(212,175,55,0.95)"
                                                strokeWidth="1.2" />

                                            {/* Corne de l'Afrique (Somalie — pointe) */}
                                            <path d={`
                                                M 152 88
                                                Q 162 84 168 90
                                                Q 170 98 162 106
                                                Q 156 108 150 104
                                                Q 148 96 152 88 Z
                                            `} fill="rgba(75,100,85,0.70)" />

                                            {/* Madagascar */}
                                            <path d={`
                                                M 150 128
                                                Q 156 124 160 132
                                                Q 162 142 158 152
                                                Q 154 160 148 158
                                                Q 144 150 144 140
                                                Q 144 132 150 128 Z
                                            `} fill="rgba(75,100,85,0.60)" />

                                            {/* Congo Brazzaville 🇨🇬 — ÉTOILE DORÉE animée + drapeau */}
                                            <circle cx="116" cy="114" r="18" fill="rgba(212,175,55,0.12)">
                                                <animate attributeName="r" values="14;24;14" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                            <circle cx="116" cy="114" r="6" fill="#d4af37" style={{ filter: 'drop-shadow(0 0 10px #d4af37)' }}>
                                                <animate attributeName="r" values="4;7;4" dur="1.8s" repeatCount="indefinite" />
                                            </circle>
                                            <g transform="translate(120,104) scale(1.3)">
                                                <rect x="0" y="0" width="12" height="8" rx="0.8" fill="black" opacity="0.45" />
                                                <polygon points="0,0 7,0 0,8" fill="#009543" />
                                                <polygon points="7,0 12,0 12,3.5 0,8 0,4.5" fill="#FBDE4A" />
                                                <polygon points="12,3.5 12,8 0,8" fill="#D90000" />
                                            </g>

                                            {/* Autres drapeaux Afrique */}
                                            <g transform="translate(84,98) scale(0.9)">{/* Nigeria */}
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <rect x="0" y="0" width="3" height="6" fill="#008751" rx="0.4" />
                                                <rect x="6" y="0" width="3" height="6" fill="#008751" rx="0.4" />
                                            </g>
                                            <g transform="translate(86,62) scale(0.9)">{/* Maroc */}
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="#C1272D" />
                                                <polygon points="4.5,1.2 5.1,2.8 6.8,2.8 5.5,3.8 6,5.4 4.5,4.4 3,5.4 3.5,3.8 2.2,2.8 3.9,2.8" fill="#006233" />
                                            </g>
                                            <g transform="translate(138,64) scale(0.9)">{/* Égypte */}
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <rect x="0" y="0" width="9" height="2" fill="#CE1126" rx="0.4" />
                                                <rect x="0" y="4" width="9" height="2" fill="black" rx="0.4" />
                                            </g>
                                            {/* Kenya */}
                                            <g transform="translate(150,104) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <rect x="0" y="0" width="9" height="2" fill="#006600" rx="0.4" />
                                                <rect x="0" y="2" width="9" height="2" fill="black" />
                                                <rect x="0" y="4" width="9" height="2" fill="#BB0000" rx="0.4" />
                                            </g>
                                            {/* Afrique du Sud */}
                                            <g transform="translate(108,168) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <rect x="0" y="0" width="9" height="2" fill="#007A4D" rx="0.4" />
                                                <rect x="0" y="4" width="9" height="2" fill="#FFB612" rx="0.4" />
                                                <polygon points="0,0 4,3 0,6" fill="#000" />
                                            </g>
                                        </g>

                                        {/* ═══ EUROPE (Gris sombre + Interactivité) ═══ */}
                                        <g className="cursor-pointer transition-all duration-500 hover:scale-[1.15]" style={{ transformOrigin: '112px 48px', transformBox: 'fill-box' }}>
                                            <path d={`
                                    M 88 52
                                    Q 92 42 86 36
                                    Q 88 30 96 28
                                    Q 104 26 114 27
                                    Q 126 28 134 32
                                    Q 140 37 138 44
                                    Q 136 50 128 52
                                    Q 118 54 108 53
                                    Q 100 52 95 50
                                    Q 90 52 88 52 Z
                                `} fill="rgba(80,105,95,0.70)" />

                                            {/* Péninsule Ibérique */}
                                            <path d={`
                                    M 86 48
                                    Q 90 44 96 44
                                    Q 100 46 100 52
                                    Q 98 58 92 58
                                    Q 84 56 84 50
                                    Q 84 48 86 48 Z
                                `} fill="rgba(80,105,95,0.65)" />

                                            {/* Péninsule Italienne */}
                                            <path d={`
                                    M 112 48
                                    Q 118 46 120 52
                                    Q 120 60 116 66
                                    Q 112 68 110 62
                                    Q 108 56 110 50
                                    Q 111 48 112 48 Z
                                `} fill="rgba(80,105,95,0.60)" />

                                            {/* Scandinavie */}
                                            <path d={`
                                    M 116 28
                                    Q 122 20 128 22
                                    Q 132 26 130 34
                                    Q 128 40 122 42
                                    Q 116 40 114 34
                                    Q 113 30 116 28 Z
                                `} fill="rgba(80,105,95,0.55)" />

                                            {/* Îles Britanniques */}
                                            <path d={`
                                    M 82 30
                                    Q 88 26 92 30
                                    Q 94 36 90 40
                                    Q 85 42 82 38
                                    Q 80 34 82 30 Z
                                `} fill="rgba(80,105,95,0.60)" />

                                            {/* 🇫🇷 France */}
                                            <g transform="translate(94,38) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.5" fill="black" opacity="0.35" />
                                                <rect x="0" y="0" width="3" height="6" fill="#003189" rx="0.4" />
                                                <rect x="3" y="0" width="3" height="6" fill="white" />
                                                <rect x="6" y="0" width="3" height="6" fill="#ED2939" rx="0.4" />
                                            </g>

                                            {/* 🇬🇧 Royaume-Uni */}
                                            <g transform="translate(83,27) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.5" fill="#012169" />
                                                <line x1="0" y1="0" x2="9" y2="6" stroke="white" strokeWidth="2" />
                                                <line x1="9" y1="0" x2="0" y2="6" stroke="white" strokeWidth="2" />
                                                <line x1="4.5" y1="0" x2="4.5" y2="6" stroke="white" strokeWidth="2.2" />
                                                <line x1="0" y1="3" x2="9" y2="3" stroke="white" strokeWidth="2.2" />
                                                <line x1="0" y1="0" x2="9" y2="6" stroke="#CC0000" strokeWidth="1.1" />
                                                <line x1="9" y1="0" x2="0" y2="6" stroke="#CC0000" strokeWidth="1.1" />
                                                <line x1="4.5" y1="0" x2="4.5" y2="6" stroke="#CC0000" strokeWidth="1.3" />
                                                <line x1="0" y1="3" x2="9" y2="3" stroke="#CC0000" strokeWidth="1.3" />
                                            </g>

                                            {/* 🇩🇪 Allemagne */}
                                            <g transform="translate(108,28) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="#FFCE00" />
                                                <rect x="0" y="0" width="9" height="2" fill="#000" rx="0.4" />
                                                <rect x="0" y="2" width="9" height="2" fill="#DD0000" />
                                            </g>
                                        </g>

                                        {/* Grèce + Balkans */}
                                        <path d={`
                                            M 124 44
                                            Q 130 44 132 50
                                            Q 130 56 124 56
                                            Q 120 54 120 48
                                            Q 121 44 124 44 Z
                                        `} fill="rgba(85,115,92,0.55)" />

                                        {/* ═══ ASIE (Gris sombre + Interactivité) ═══ */}
                                        <g className="cursor-pointer transition-all duration-500 hover:scale-[1.10]" style={{ transformOrigin: '160px 44px', transformBox: 'fill-box' }}>
                                            <path d={`
                                    M 134 32
                                    Q 150 22 172 18
                                    Q 192 14 210 18
                                    Q 224 22 228 32
                                    Q 230 42 224 50
                                    Q 212 58 196 60
                                    Q 180 62 165 62
                                    Q 152 60 142 56
                                    Q 136 50 134 44
                                    Q 133 38 134 32 Z
                                `} fill="rgba(80,105,95,0.72)" />

                                            {/* Moyen-Orient */}
                                            <path d={`
                                    M 134 50
                                    Q 146 46 158 50
                                    Q 166 56 162 66
                                    M 148 64
                                    Q 160 62 168 70
                                    Q 172 80 168 92
                                    Q 162 100 154 98
                                    Q 148 94 146 84
                                `} fill="none" />
                                            <path d={`
                                    M 134 50
                                    L 158 50 L 162 66 L 168 92 L 154 98 L 140 76 Z
                                `} fill="rgba(80,105,95,0.65)" />

                                            {/* Sous-continent Indien */}
                                            <path d={`
                                    M 168 56
                                    Q 180 52 186 60
                                    Q 188 72 184 84
                                    Q 178 96 170 102
                                    Q 162 100 158 90
                                    Q 156 78 160 66
                                    Q 164 60 168 56 Z
                                `} fill="rgba(80,105,95,0.58)" />

                                            {/* Asie du Sud-Est */}
                                            <path d={`
                                    M 196 60
                                    Q 206 64 214 74
                                    Q 218 86 212 98
                                    Q 204 106 198 102
                                    Q 192 94 196 82
                                    Q 194 70 196 60 Z
                                `} fill="rgba(80,105,95,0.62)" />

                                            {/* Chine + Mongollie + Corée */}
                                            <path d={`
                                            M 170 34
                                            Q 188 30 205 36
                                            Q 216 42 218 54
                                            Q 216 64 206 70
                                            Q 194 74 180 70
                                            Q 166 66 162 56
                                            Q 163 44 170 34 Z
                                        `} fill="rgba(85,115,92,0.65)" />

                                            {/* Asie du Sud-Est (Thaïlande/Vietnam/Malaisie) */}
                                            <path d={`
                                            M 196 64
                                            Q 210 64 216 72
                                            Q 218 82 210 90
                                            Q 202 96 194 90
                                            Q 188 82 190 72
                                            Q 192 65 196 64 Z
                                        `} fill="rgba(85,115,92,0.58)" />

                                            {/* Japon — deux îles */}
                                            <path d={`
                                            M 216 36
                                            Q 222 34 225 40
                                            Q 224 48 218 50
                                            Q 213 46 214 40
                                            Q 215 36 216 36 Z
                                        `} fill="rgba(85,115,92,0.60)" />

                                            {/* 🇨🇳 Chine */}
                                            <g transform="translate(192,42) scale(0.9)">
                                                <rect x="0" y="0" width="10" height="7" rx="0.4" fill="#DE2910" />
                                                <polygon points="2,1 2.7,3 4.2,3 3,3.8 3.5,5.5 2,4.4 0.5,5.5 1,3.8 0,3 1.3,3" fill="#FFDE00" />
                                            </g>

                                            {/* 🇰🇷 Corée du Sud */}
                                            <g transform="translate(205,52) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <circle cx="4.5" cy="3" r="1.5" fill="#CD2E3A" />
                                                <path d="M 4.5 3 A 1.5 1.5 0 0 1 4.5 4.5" fill="#0047A0" />
                                            </g>

                                            {/* 🇯🇵 Japon — Fix Position */}
                                            <g transform="translate(210,48) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <circle cx="4.5" cy="3" r="1.8" fill="#BC002D" />
                                            </g>

                                            {/* 🇮🇳 Inde */}
                                            <g transform="translate(170,72) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <rect x="0" y="0" width="9" height="2" fill="#FF9933" rx="0.4" />
                                                <rect x="0" y="4" width="9" height="2" fill="#138808" rx="0.4" />
                                                <circle cx="4.5" cy="3" r="1.2" fill="none" stroke="#000080" strokeWidth="0.5" />
                                            </g>
                                        </g>

                                        {/* ═══ AMÉRIQUES ═══ */}
                                        {/* Canada — vaste territoire au nord */}
                                        <path d={`
                                            M 14 38
                                            Q 30 28 50 26
                                            Q 68 26 80 30
                                            Q 86 36 82 46
                                            Q 78 54 66 58
                                            Q 54 62 38 62
                                            Q 22 60 14 50
                                            Q 12 44 14 38 Z
                                        `} fill="rgba(85,115,92,0.65)" />

                                        {/* Alaska */}
                                        <path d={`
                                            M 8 38
                                            Q 16 30 24 34
                                            Q 26 42 20 48
                                            Q 12 50 8 44
                                            Q 7 40 8 38 Z
                                        `} fill="rgba(85,115,92,0.55)" />

                                        {/* Groenland */}
                                        <path d={`
                                            M 80 14
                                            Q 94 8 108 12
                                            Q 116 18 114 28
                                            Q 106 34 94 32
                                            Q 80 26 80 14 Z
                                        `} fill="rgba(85,115,92,0.45)" />

                                        {/* États-Unis — forme rectangulaire arrondie */}
                                        <path d={`
                                            M 14 62
                                            Q 36 56 60 56
                                            Q 76 58 80 66
                                            Q 82 76 78 86
                                            Q 72 92 58 94
                                            Q 38 94 22 90
                                            Q 12 84 12 74
                                            Q 12 66 14 62 Z
                                        `} fill="rgba(85,115,92,0.65)" />

                                        {/* Floride (péninsule) */}
                                        <path d={`
                                            M 62 88
                                            Q 68 88 70 94
                                            Q 70 102 64 106
                                            Q 58 104 58 96
                                            Q 58 90 62 88 Z
                                        `} fill="rgba(85,115,92,0.55)" />

                                        {/* Mexique — forme effilée vers le sud */}
                                        <path d={`
                                            M 16 92
                                            Q 38 90 58 94
                                            Q 66 100 62 110
                                            Q 58 118 52 122
                                            Q 44 126 36 120
                                            Q 26 112 18 102
                                            Q 14 96 16 92 Z
                                        `} fill="rgba(85,115,92,0.62)" />

                                        {/* Amérique Centrale + Colombie/Venezuela */}
                                        <path d={`
                                            M 40 122
                                            Q 54 118 68 120
                                            Q 78 124 80 134
                                            Q 78 144 68 148
                                            Q 56 150 46 144
                                            Q 36 136 38 126
                                            Q 39 123 40 122 Z
                                        `} fill="rgba(85,115,92,0.62)" />

                                        {/* Brésil — grand bloc triangulaire arrondi */}
                                        <path d={`
                                            M 60 144
                                            Q 80 138 90 144
                                            Q 98 150 96 164
                                            Q 92 178 82 186
                                            Q 70 192 58 188
                                            Q 46 180 44 166
                                            Q 42 152 52 146
                                            Q 56 144 60 144 Z
                                        `} fill="rgba(85,115,92,0.65)" />

                                        {/* Pérou + Bolivie (côte pacifique) */}
                                        <path d={`
                                            M 34 148
                                            Q 46 142 56 148
                                            Q 58 158 52 168
                                            Q 44 176 36 170
                                            Q 28 162 30 154
                                            Q 31 150 34 148 Z
                                        `} fill="rgba(85,115,92,0.60)" />

                                        {/* Argentine + Chili — fuseau long */}
                                        <path d={`
                                            M 44 178
                                            Q 54 172 62 178
                                            Q 64 190 60 206
                                            Q 54 218 46 214
                                            Q 40 202 40 188
                                            Q 41 182 44 178 Z
                                        `} fill="rgba(85,115,92,0.60)" />

                                        {/* ═══ AMÉRIQUE DU NORD (Interactivité) ═══ */}
                                        <g className="cursor-pointer transition-all duration-500 hover:scale-[1.15]" style={{ transformOrigin: '40px 60px', transformBox: 'fill-box' }}>
                                            <path d={`
                                    M 12 40
                                    Q 20 30 36 28
                                    Q 50 26 62 30
                                    Q 68 40 60 52
                                    Q 54 62 42 68
                                    Q 32 72 24 64
                                    Q 15 55 12 40 Z
                                `} fill="rgba(80,105,95,0.72)" />
                                            {/* Groenland */}
                                            <path d={`
                                    M 65 14
                                    Q 80 10 92 14
                                    Q 100 20 95 32
                                    Q 88 40 76 36
                                    Q 64 28 65 14 Z
                                `} fill="rgba(180,200,220,0.3)" />

                                            {/* 🇺🇸 USA */}
                                            <g transform="translate(26,70) scale(0.9)">
                                                <rect x="0" y="0" width="10" height="7" rx="0.4" fill="#B22234" />
                                                {[0, 1, 2, 3].map(i => <rect key={i} x="0" y={i * 1.75} width="10" height="0.8" fill="white" />)}
                                                <rect x="0" y="0" width="4" height="3.5" fill="#3C3B6E" />
                                            </g>

                                            {/* 🇨🇦 Canada */}
                                            <g transform="translate(42,38) scale(0.9)">
                                                <rect x="0" y="0" width="9" height="6" rx="0.4" fill="white" />
                                                <rect x="0" y="0" width="2.5" height="6" fill="#FF0000" rx="0.4" />
                                                <rect x="6.5" y="0" width="2.5" height="6" fill="#FF0000" rx="0.4" />
                                                <path d="M 4 2.5 L 4.5 1.5 L 5 2.5 L 6 3 L 5 3.5 L 4.5 4.5 L 4 3.5 L 3 3 Z" fill="#FF0000" />
                                            </g>
                                        </g>

                                        {/* ═══ AMÉRIQUE DU SUD (Interactivité) ═══ */}
                                        <g className="cursor-pointer transition-all duration-500 hover:scale-[1.12]" style={{ transformOrigin: '64px 158px', transformBox: 'fill-box' }}>
                                            <path d={`
                                    M 46 112
                                    L 60 110 L 72 118 L 84 135 L 75 165 L 58 195 L 48 180 L 40 145 Z
                                `} fill="rgba(80,105,95,0.70)" stroke="rgba(40,45,55,0.9)" strokeWidth="0.8" />

                                            {/* 🇧🇷 Brésil */}
                                            <g transform="translate(64,158) scale(0.9)">
                                                <rect x="0" y="0" width="10" height="7" rx="0.4" fill="#009C3B" />
                                                <polygon points="5,1 9,3.5 5,6 1,3.5" fill="#FFDF00" />
                                                <circle cx="5" cy="3.5" r="1.5" fill="#002776" />
                                            </g>
                                        </g>

                                        {/* ═══ AUSTRALIE (Interactivité) ═══ */}
                                        <g className="cursor-pointer transition-all duration-500 hover:scale-[1.20]" style={{ transformOrigin: '210px 165px', transformBox: 'fill-box' }}>
                                            <path d={`
                                    M 194 152
                                    Q 208 148 222 154
                                    Q 232 165 224 180
                                    Q 212 190 198 184
                                    Q 185 174 194 152 Z
                                `} fill="rgba(80,105,95,0.65)" stroke="rgba(40,45,55,0.9)" strokeWidth="0.8" />

                                            {/* 🇦🇺 Australie */}
                                            <g transform="translate(194,152) scale(0.9)">
                                                <rect x="0" y="0" width="10" height="7" rx="0.4" fill="#00008B" />
                                                <rect x="0" y="0" width="5" height="3.5" fill="#00008B" />
                                                <line x1="0" y1="0" x2="5" y2="3.5" stroke="white" strokeWidth="1.5" />
                                                <line x1="5" y1="0" x2="0" y2="3.5" stroke="white" strokeWidth="1.5" />
                                                <line x1="2.5" y1="0" x2="2.5" y2="3.5" stroke="white" strokeWidth="1.2" />
                                                <line x1="0" y1="1.75" x2="5" y2="1.75" stroke="white" strokeWidth="1.2" />
                                            </g>
                                        </g>

                                        {/* ═══ ANTARCTIQUE ═══ */}
                                        <path d={`
                                M 16 214
                                Q 60 208 120 206
                                Q 180 206 224 212
                                Q 234 220 226 228
                                Q 180 234 120 235
                                Q 60 234 14 228
                                Q 6 220 16 214 Z
                            `} fill="rgba(200,220,255,0.18)" stroke="rgba(200,220,255,0.12)" />
                                    </g>

                                    {/* ── LIGNES DE RÉSEAU DENSES PRO (Interface Connexions 3D) ─── */}
                                    <g clipPath="url(#gC)" fill="none" stroke="rgba(100,200,255,0.25)" strokeWidth="0.5">
                                        {/* Maillage principal */}
                                        <path d="M 40 70 Q 70 30 100 40" strokeDasharray="2,2" />
                                        <path d="M 100 40 Q 110 70 116 114" stroke="rgba(100,200,255,0.4)" strokeWidth="0.8" />
                                        <path d="M 116 114 Q 150 80 180 60" />
                                        <path d="M 180 60 Q 200 100 194 152" />
                                        <path d="M 116 114 Q 160 160 194 170" opacity="0.6" />
                                        <path d="M 40 150 Q 80 130 116 114" stroke="rgba(212,175,55,0.15)" strokeWidth="1" />

                                        {/* Maillage secondaire - Densité accrue */}
                                        <path d="M 30 50 Q 120 20 200 40" opacity="0.2" />
                                        <path d="M 20 100 Q 50 40 100 40" opacity="0.15" />
                                        <path d="M 60 180 Q 120 190 180 150" opacity="0.2" />
                                        <path d="M 80 30 Q 116 114 150 160" opacity="0.3" strokeDasharray="3,1" />
                                        <path d="M 220 120 Q 180 130 116 114" opacity="0.4" />
                                        <path d="M 10 120 Q 60 115 116 114" stroke="rgba(100,200,255,0.3)" />

                                        {/* Points de connexion intelligents (Pulse) */}
                                        {[
                                            { x: 40, y: 70 }, { x: 100, y: 40 }, { x: 116, y: 114 },
                                            { x: 180, y: 60 }, { x: 194, y: 152 }, { x: 216, y: 48 },
                                            { x: 64, y: 158 }, { x: 150, y: 128 }, { x: 60, y: 30 },
                                            { x: 160, y: 170 }, { x: 30, y: 110 }
                                        ].map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.y} r="1" fill="white" className="animate-pulse">
                                                <animate attributeName="r" values="0.8;1.5;0.8" dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                                            </circle>
                                        ))}
                                    </g>

                                    {/* Reflet de verre supérieur accentué */}
                                    <circle cx="120" cy="120" r="110" fill="url(#gS)" pointerEvents="none" />

                                    {/* Bordure finale */}
                                    <circle cx="120" cy="120" r="111" fill="none" stroke="rgba(100,140,255,0.25)" strokeWidth="1.2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Badge statut */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800 backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Store Officiel · RC 🇨🇬</span>
                    </div>



                    {/* ── BILLBOARD SLIDER ──────────────────────────────────────────── */}
                    <div className="w-full max-w-5xl mx-auto">
                        <div className="relative w-full aspect-[2/1] sm:aspect-[3/1] md:aspect-[4/1] lg:h-[360px] overflow-hidden rounded-2xl sm:rounded-3xl group">

                            {/* Slides */}
                            {HERO_SLIDES.map((s, index) => (
                                <div
                                    key={s.id}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                    onClick={() => navigate(s.ctaHref)}
                                >
                                    {/* Image ou fond dégradé */}
                                    {s.image ? (
                                        <img
                                            src={s.image}
                                            className="w-full h-full object-cover"
                                            alt={s.title}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                            }}
                                        />
                                    ) : (
                                        /* Placeholder sombre stylisé — remplacer par vraie image plus tard */
                                        <div className={`w-full h-full bg-gradient-to-br ${s.color} via-zinc-900 to-black`} />
                                    )}

                                    {/* Overlay gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${s.color} to-transparent opacity-85`} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                    {/* Contenu */}
                                    <div className="absolute bottom-0 left-0 p-4 sm:p-8 md:p-12 max-w-xl">
                                        <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-lg text-[9px] sm:text-[11px] font-black text-white uppercase tracking-widest mb-2 sm:mb-3">
                                            {s.label}
                                        </span>
                                        <h2 className="text-lg sm:text-2xl md:text-4xl font-black text-white mb-1 sm:mb-2 leading-tight tracking-tight drop-shadow-xl">
                                            {s.title}
                                        </h2>
                                        <p className="hidden sm:block text-zinc-200 text-xs sm:text-sm font-medium mb-4 line-clamp-2 max-w-md drop-shadow-md">
                                            {s.subtitle}
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(s.ctaHref) }}
                                            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-black text-xs sm:text-sm hover:bg-gold hover:scale-105 transition-all shadow-lg"
                                        >
                                            {s.ctaLabel}
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Indicateurs de pagination */}
                            <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 flex gap-1.5 sm:gap-2 pointer-events-auto">
                                {HERO_SLIDES.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => { e.stopPropagation(); setCurrentSlide(index) }}
                                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-5 sm:w-8' : 'bg-white/30 w-1.5 sm:w-2 hover:bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── BARRE DE RECHERCHE ──────────────────────────────────────── */}
                    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto group -mt-2 sm:mt-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une solution..."
                                className="w-full px-5 sm:px-8 py-4 sm:py-5 pr-16 sm:pr-20 rounded-2xl sm:rounded-[28px] bg-zinc-900/60 border border-zinc-800 text-white placeholder-zinc-600 focus:border-gold/50 focus:bg-zinc-900 focus:outline-none transition-all text-sm sm:text-lg backdrop-blur-md group-hover:border-zinc-700"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-gold text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gold/20"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* ── CTAs ─────────────────────────────────────────────────────── */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center">
                        <Link
                            to="/store"
                            className="px-6 sm:px-10 py-3 sm:py-5 bg-white text-black rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all hover:bg-gold hover:scale-105 active:scale-95 shadow-2xl"
                        >
                            DÉCOUVRIR LE STORE
                        </Link>
                        <Link
                            to="/premium"
                            className="px-6 sm:px-10 py-3 sm:py-5 bg-zinc-900/60 border border-zinc-800 text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-all hover:border-gold/50 hover:bg-zinc-900 active:scale-95 backdrop-blur-md"
                        >
                            ACCÈS PREMIUM
                        </Link>
                        <Link
                            to="/guide"
                            className="px-6 sm:px-8 py-3 sm:py-4 text-zinc-500 border border-zinc-800/50 rounded-xl font-bold text-sm transition-all hover:text-white hover:border-zinc-700"
                        >
                            Guide d'utilisation →
                        </Link>
                    </div>

                    {/* ── STATS ─────────────────────────────────────────────────────── */}
                    <div className="pt-8 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-12 w-full max-w-4xl border-t border-zinc-900">
                        {[
                            { value: '500+', label: 'Contenus' },
                            { value: '24/7', label: 'Support' },
                            { value: '100%', label: 'Sécurisé' },
                            { value: 'RC', label: 'Basé au Congo' },
                        ].map(stat => (
                            <div key={stat.label} className="space-y-1 text-center">
                                <p className="text-xl sm:text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-[9px] sm:text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div >
            </div >
        </section >
    )
}
