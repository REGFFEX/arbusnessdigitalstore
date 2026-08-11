import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconArrowLeft, IconClock, IconSparkle } from '../components/Icons'

export default function ComingSoon() {
    const navigate = useNavigate()
    const location = useLocation()

    // On récupère la page précédente (ou /store par défaut)
    const goBack = () => {
        if (window.history.length > 2) {
            navigate(-1)
        } else {
            navigate('/store')
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">

            {/* Halo décoratif */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-zinc-700/10 rounded-full blur-2xl" />
            </div>

            {/* Icône Horloge SVG */}
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                    <IconClock size={40} className="text-gold" strokeWidth={1.5} />
                </div>
                {/* Badge sparkle */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold rounded-xl flex items-center justify-center shadow-lg">
                    <IconSparkle size={14} className="text-black" strokeWidth={2} />
                </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
                Bientôt Disponible
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg max-w-sm mb-10 leading-relaxed">
                Ce contenu n'est pas encore disponible. Revenez bientôt — on prépare quelque chose d'exceptionnel pour vous.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={goBack}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm border border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-600 hover:text-white transition-all duration-200 backdrop-blur-sm"
                >
                    <IconArrowLeft size={16} strokeWidth={2.5} />
                    Retourner en arrière
                </button>

                <button
                    onClick={() => navigate('/store')}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-gold text-black hover:scale-105 transition-transform shadow-lg shadow-gold/20"
                >
                    Explorer le Store
                    <IconArrowLeft size={16} strokeWidth={2.5} className="rotate-180" />
                </button>
            </div>
        </div>
    )
}
