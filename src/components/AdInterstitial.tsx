import React, { useState, useEffect } from 'react'

interface AdInterstitialProps {
    project: any
    onClose: () => void
}

export default function AdInterstitial({ project, onClose }: AdInterstitialProps) {
    const [timeLeft, setTimeLeft] = useState(5)

    useEffect(() => {
        if (timeLeft <= 0) {
            // Auto close after 5s or maybe just enable a close button
            // For now, let's just let the user see it and then they can skip or it auto closes
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]" />

            <div className="max-w-md w-full px-6 relative z-10">
                {/* Ad Video / Image Placeholder */}
                <div className="aspect-[9/16] w-full bg-zinc-900 rounded-[40px] border border-zinc-800 overflow-hidden shadow-2xl relative group">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20 animate-pulse">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="gold" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic text-gold uppercase tracking-tighter">Soutenez le Projet</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Visionnez cette courte annonce pour aider au développement de <span className="text-white font-bold">{project.name}</span>.
                            </p>
                        </div>

                        <div className="pt-8 w-full">
                            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gold transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 5) * 100}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Ad Controls */}
                    <div className="absolute top-8 right-8">
                        <button
                            onClick={timeLeft === 0 ? onClose : undefined}
                            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${timeLeft === 0 ? 'bg-white text-black border-white hover:scale-110 active:scale-95' : 'bg-black/50 text-white border-white/20 cursor-not-allowed opacity-50'}`}
                        >
                            {timeLeft > 0 ? (
                                <span className="text-xs font-bold">{timeLeft}</span>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="absolute bottom-8 inset-x-8">
                        <button className="w-full py-4 bg-zinc-800/80 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-700 transition-all">
                            Visiter l'annonceur
                        </button>
                    </div>
                </div>

                <p className="text-center mt-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest select-none">
                    Annonce AR BUSINESS • Merci de votre patience
                </p>
            </div>
        </div>
    )
}
