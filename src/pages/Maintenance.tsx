import React from 'react'
import { IconSettings, IconShield, IconGlobe, IconMessageCircle } from '../components/Icons'

export default function Maintenance() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
            </div>

            <div className="relative z-10 max-w-2xl w-full space-y-12 animate-in fade-in zoom-in duration-1000">
                {/* Logo Area */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[32px] flex items-center justify-center shadow-2xl shadow-gold/10 group">
                        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gold via-yellow-600 to-gold bg-clip-text">
                            <span className="text-4xl font-black text-transparent leading-none">AR</span>
                            <div className="w-8 h-1 bg-gold/50 rounded-full mt-1"></div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">AR Business</h1>
                        <p className="text-gold font-bold text-[10px] uppercase tracking-[0.4em] mt-1 italic">Digital Excellence</p>
                    </div>
                </div>

                {/* Main Message */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/20 rounded-full">
                        <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-gold uppercase tracking-widest">Maintenance en cours</span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                        OPTIMISATION <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-500">DU SYSTÈME</span>
                    </h2>

                    <p className="text-zinc-500 text-sm md:text-lg max-w-lg mx-auto leading-relaxed font-medium">
                        Nous mettons à jour nos serveurs pour vous offrir une expérience digitale encore plus fluide et sécurisée. Le store sera de retour dans quelques instants.
                    </p>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl backdrop-blur-xl">
                        <IconShield size={24} className="text-green-500 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sécurité</p>
                        <p className="text-white font-bold text-xs mt-1">Vérifiée</p>
                    </div>
                    <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl backdrop-blur-xl">
                        <IconGlobe size={24} className="text-blue-400 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Base de données</p>
                        <p className="text-white font-bold text-xs mt-1">Optimisation</p>
                    </div>
                    <div className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl backdrop-blur-xl">
                        <IconSettings size={24} className="text-gold mx-auto mb-3 animate-spin-slow" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Core Engine</p>
                        <p className="text-white font-bold text-xs mt-1">Sync v2.5</p>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="pt-8">
                    <a
                        href="mailto:arbusinessdigitalstore@gmail.com"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold hover:scale-105 transition-all shadow-2xl shadow-white/5"
                    >
                        <IconMessageCircle size={16} strokeWidth={3} />
                        Contacter le Support
                    </a>
                    <p className="mt-8 text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
                        © 2026 AR BUSINESS CORP. — EXCELLENCE DIGITALE AU CONGO
                    </p>
                    <div className="mt-4">
                        <a href="/admin/login" className="px-4 py-1.5 opacity-0 hover:opacity-100 transition-opacity text-[8px] text-zinc-800 uppercase tracking-widest font-black rounded-lg">
                            Portal Admin
                        </a>
                    </div>
                </div>
            </div>

            {/* Progress Bar (Fake) */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-zinc-900">
                <div className="h-full bg-gold w-[65%] shadow-[0_0_20px_rgba(212,175,55,0.5)] animate-pulse" />
            </div>
        </div>
    )
}
