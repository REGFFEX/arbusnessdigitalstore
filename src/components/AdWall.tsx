import React, { useEffect, useState } from 'react'

interface AdWallProps {
    duration?: number // Durée en secondes (défaut 5)
    onUnlock: () => void
    onCancel: () => void
}

export default function AdWall({ duration = 5, onUnlock, onCancel }: AdWallProps) {
    const [timeLeft, setTimeLeft] = useState(duration)
    const [canSkip, setCanSkip] = useState(false)

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setCanSkip(true)
        }
    }, [timeLeft])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">

                {/* Header Pub */}
                <div className="p-4 flex items-center justify-between border-b border-zinc-800 bg-black/50">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Publicité</span>
                    <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                {/* Contenu Pub (Simulation) */}
                <div className="aspect-video bg-black flex flex-col items-center justify-center relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 animate-pulse"></div>
                    <p className="text-xl font-black text-white z-10">ESPACE PUBLICITAIRE</p>
                    <p className="text-xs text-zinc-500 z-10 mt-2">Votre téléchargement commence bientôt...</p>

                    {/* Timer Circle */}
                    {!canSkip && (
                        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white font-black text-sm backdrop-blur-sm">
                            {timeLeft}
                        </div>
                    )}
                </div>

                {/* Action Footer */}
                <div className="p-6 text-center space-y-4">
                    <p className="text-sm text-zinc-400">
                        Regardez cette courte vidéo pour soutenir les créateurs et débloquer votre contenu gratuitement.
                    </p>

                    <button
                        onClick={onUnlock}
                        disabled={!canSkip}
                        className={`w-full py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2
              ${canSkip
                                ? 'bg-gold text-black hover:scale-[1.02] cursor-pointer shadow-lg shadow-gold/20'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                    >
                        {canSkip ? (
                            <>
                                <span>DÉVERROUILLER LE TÉLÉCHARGEMENT</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                            </>
                        ) : (
                            <>
                                <span>PATIENTEZ ENCORE...</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-zinc-800 w-full">
                    <div
                        className="h-full bg-gold transition-all duration-1000 ease-linear"
                        style={{ width: `${((duration - timeLeft) / duration) * 100}%` }}
                    ></div>
                </div>

            </div>
        </div>
    )
}
