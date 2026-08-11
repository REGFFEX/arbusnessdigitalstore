import React, { useState, useEffect, useRef } from 'react'
import { useAds } from '../context/AdsContext'
import { IconX, IconPlay, IconExternalLink } from './Icons'

export default function AdVideoOverlay() {
    const { isAdVisible, currentAd, closeAd } = useAds()
    const [timeLeft, setTimeLeft] = useState(0)
    const [canSkip, setCanSkip] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (isAdVisible && currentAd) {
            setTimeLeft(currentAd.duration || 5)
            setCanSkip(false)

            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        setCanSkip(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [isAdVisible, currentAd])

    if (!isAdVisible || !currentAd) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center animate-in fade-in duration-500">

            {/* Background Media */}
            <div className="absolute inset-0 overflow-hidden">
                {currentAd.type === 'banner' ? (
                    <img src={currentAd.media_url || ''} className="w-full h-full object-cover opacity-60 blur-sm scale-110" />
                ) : (
                    <video
                        ref={videoRef}
                        src={currentAd.media_url || ''}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover opacity-40 grayscale"
                    />
                )}
            </div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center">
                <div className="bg-zinc-900/80 backdrop-blur-2xl border border-zinc-800 rounded-[40px] overflow-hidden shadow-2xl w-full flex flex-col md:flex-row">

                    {/* Ad Showcase */}
                    <div className="w-full md:w-1/2 aspect-video md:aspect-auto bg-black relative flex items-center justify-center">
                        {currentAd.type === 'video' || currentAd.type === 'reward' ? (
                            <video
                                src={currentAd.media_url || ''}
                                autoPlay
                                className="w-full h-full object-contain"
                                controls={false}
                            />
                        ) : (
                            <img src={currentAd.media_url || ''} className="w-full h-full object-contain" />
                        )}

                        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
                            <span className="w-2 h-2 bg-gold rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Sponsorisé</span>
                        </div>
                    </div>

                    {/* Ad Details & Actions */}
                    <div className="w-full md:w-1/2 p-10 flex flex-col justify-center text-center md:text-left">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic mb-4">{currentAd.title}</h2>
                        <p className="text-zinc-500 text-sm leading-relaxed mb-8">Découvrez cette offre exclusive sur AR Business Digital Store. Le pôle digital de l'excellence au Congo.</p>

                        <div className="flex flex-col gap-4">
                            {currentAd.target_url && (
                                <a
                                    href={currentAd.target_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gold text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-gold/20"
                                >
                                    <IconExternalLink size={14} strokeWidth={3} />
                                    En savoir plus
                                </a>
                            )}
                            {currentAd.linked_product && (
                                <button className="bg-white/10 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all border border-white/5">
                                    Voir le produit
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ad Controls */}
                <div className="mt-8 flex items-center gap-6">
                    {!canSkip ? (
                        <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-xl">
                            <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Skip dans {timeLeft}s</span>
                        </div>
                    ) : (
                        <button
                            onClick={closeAd}
                            className="bg-zinc-800 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/10 hover:bg-white hover:text-black transition-all flex items-center gap-3"
                        >
                            <IconX size={14} strokeWidth={3} />
                            Fermer la publicité
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {!canSkip && (
                <div className="absolute bottom-0 left-0 h-1.5 bg-gold/20 w-full overflow-hidden">
                    <div
                        className="h-full bg-gold transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(212,175,55,0.8)]"
                        style={{ width: `${((currentAd.duration - timeLeft) / currentAd.duration) * 100}%` }}
                    />
                </div>
            )}
        </div>
    )
}
