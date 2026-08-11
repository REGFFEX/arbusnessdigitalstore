import React, { useState, useEffect } from 'react'
import { IconX, IconCheck, IconExternalLink, IconLock, IconPlay } from './Icons'
import { PaymentService } from '../services/PaymentService'
import { getPaymentSettings } from '../services/admin'

// Import 3D Logos
import mtnLogo3D from '../assets/outils/image/logos/MTN_logo_3D.png'
import airtelLogo3D from '../assets/outils/image/logos/Airtel_logo_3D.png'

interface PaymentModalProps {
    product: any
    onClose: () => void
    onSuccess: () => void
}

// Custom 3D-styled Logos (Images + SVG fallback for Orange)
const Logos = {
    mtn: (
        <img src={mtnLogo3D} alt="MTN" className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
    ),
    airtel: (
        <img src={airtelLogo3D} alt="Airtel" className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />
    ),
    orange: (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            <defs>
                <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF9500', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FF7900', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <rect width="90" height="90" x="5" y="5" rx="12" fill="url(#orangeGrad)" stroke="#C2410C" strokeWidth="2" />
            <text x="50" y="68" fontFamily="Arial Black" fontSize="48" fontWeight="900" textAnchor="middle" fill="white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>O</text>
        </svg>
    )
}

export default function PaymentModal({ product, onClose, onSuccess }: PaymentModalProps) {
    const [method, setMethod] = useState<'momo' | 'paypal' | 'rewarded'>('momo')
    const [step, setStep] = useState<'choice' | 'processing' | 'success' | 'ad_wall'>('choice')
    const [momoOperator, setMomoOperator] = useState<'mtn' | 'airtel' | 'orange'>('mtn')
    const [adProgress, setAdProgress] = useState(0)
    const [pSettings, setPSettings] = useState<any>(null)
    const requiredAds = product.ads_video_count || 5

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const s = await getPaymentSettings()
                setPSettings(s)
            } catch (error) {
                console.error("Failed to fetch payment settings", error)
            }
        }
        fetchSettings()
    }, [])

    const handlePay = async () => {
        if (method === 'rewarded') {
            setStep('ad_wall')
            return
        }

        setStep('processing')

        try {
            const response = await PaymentService.initiatePayment(
                method,
                method === 'paypal' ? 'paypal' : momoOperator,
                product
            )

            if (response.success && response.checkoutUrl) {
                // Rediriger vers la page de paiement Yabetoo ou PayPal
                window.open(response.checkoutUrl, '_blank')

                // On simule une réussite après un certain temps ou on pourrait attendre un webhook
                // Pour l'UX immédiate, on passe en succès après le clic
                setTimeout(() => {
                    setStep('success')
                    setTimeout(() => onSuccess(), 1500)
                }, 2000)
            } else {
                alert(response.error || 'Erreur lors de l\'initialisation du paiement')
                setStep('choice')
            }
        } catch (error) {
            setStep('choice')
            alert('Erreur technique lors du paiement')
        }
    }

    const handleAdComplete = () => {
        if (adProgress + 1 >= requiredAds) {
            setStep('success')
            setTimeout(() => onSuccess(), 1500)
        } else {
            setAdProgress(prev => prev + 1)
            setStep('choice')
        }
    }

    return (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative">

                {/* Header */}
                <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                            {step === 'ad_wall' ? 'Contenu Sponsorisé' : 'Paiement Sécurisé'}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">AR Business Digital Store</p>
                    </div>
                    <button onClick={onClose} className="bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-white transition-all">
                        <IconX size={20} />
                    </button>
                </div>

                {step === 'choice' && (
                    <>
                        {/* Scrollable Content Area */}
                        <div className="relative">
                            <div className="max-h-[60vh] overflow-y-auto p-8 space-y-8 scrollbar-none">
                                {/* Product Resume */}
                                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-zinc-800">
                                    <img src={product.image} className="w-16 h-16 rounded-2xl object-cover border border-zinc-700" alt="" />
                                    <div className="flex-1">
                                        <h4 className="font-black text-white">{product.name}</h4>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{product.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500 font-bold">Prix</p>
                                        <p className="text-xl font-black text-gold">
                                            {method === 'rewarded' ? 'GRATUIT' : (
                                                method === 'momo' ? `${product.price_fcfa || (product.price * 650)} FCFA` : (
                                                    (product.price_eur && product.price_eur > 0) ? `${product.price_eur} €` : `${product.price} $`
                                                )
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex bg-black rounded-2xl p-1 border border-zinc-800 overflow-x-auto scrollbar-none">
                                    <button
                                        onClick={() => setMethod('momo')}
                                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${method === 'momo' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
                                    >
                                        Mobile Money
                                    </button>
                                    <button
                                        onClick={() => setMethod('paypal')}
                                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${method === 'paypal' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
                                    >
                                        PayPal / Card
                                    </button>
                                    <button
                                        onClick={() => setMethod('rewarded')}
                                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap italic ${method === 'rewarded' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-gold/50'}`}
                                    >
                                        Ultime (Pubs)
                                    </button>
                                </div>

                                {/* Method Details */}
                                <div className="animate-in slide-in-from-bottom-2 duration-500">
                                    {method === 'momo' && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'mtn', color: '#FFCC00', label: 'MTN MoMo', logo: Logos.mtn },
                                                    { id: 'airtel', color: '#E4002B', label: 'Airtel Money', logo: Logos.airtel },
                                                    { id: 'orange', color: '#FF7900', label: 'Orange Money', logo: Logos.orange }
                                                ].map(op => (
                                                    <button
                                                        key={op.id}
                                                        onClick={() => setMomoOperator(op.id as any)}
                                                        className={`relative p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${momoOperator === op.id ? 'border-white scale-105 shadow-2xl' : 'border-zinc-800 opacity-40 hover:opacity-100'}`}
                                                        style={{ backgroundColor: momoOperator === op.id ? op.color : '#18181b' }}
                                                    >
                                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center p-1 bg-white shadow-lg">
                                                            {op.logo}
                                                        </div>
                                                        <span className={`text-[9px] font-black uppercase italic ${momoOperator === op.id ? (op.id === 'mtn' ? 'text-black' : 'text-white') : 'text-zinc-500'}`}>
                                                            {op.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="p-6 bg-black/40 rounded-[24px] border border-zinc-800 space-y-3">
                                                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Numéro Mobile Money</label>
                                                <div className="relative">
                                                    <input type="tel" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm focus:border-gold outline-none text-white tracking-[0.2em] font-black" placeholder="VOTRE NUMÉRO" />
                                                    <IconLock size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {method === 'paypal' && (
                                        <div className="p-8 bg-gradient-to-br from-[#003087]/10 to-[#009cde]/10 border border-[#009cde]/20 rounded-[32px] flex flex-col items-center gap-6 text-center">
                                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-4 shadow-xl">
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="w-full h-full" />
                                            </div>
                                            <div>
                                                <h5 className="text-white font-black uppercase tracking-widest text-xs mb-2">Paiement International</h5>
                                                <p className="text-[10px] text-blue-300/80 font-bold max-w-[240px]">
                                                    {pSettings?.payment_instruction || 'Redirection vers la plateforme sécurisée PayPal.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {method === 'rewarded' && (
                                        <div className="p-8 bg-gold/5 border border-gold/20 rounded-[32px] flex flex-col items-center gap-6 text-center">
                                            <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center text-gold shadow-xl">
                                                <IconPlay size={40} fill="currentColor" />
                                            </div>
                                            <div>
                                                <h5 className="text-gold font-black uppercase tracking-widest text-xs mb-2">Mode Ultime (Gratuit)</h5>
                                                <p className="text-[10px] text-zinc-400 font-bold max-w-[240px] leading-relaxed">
                                                    Visionnez <span className="text-gold font-black">{requiredAds} publicités</span> pour débloquer ce produit sans dépenser d'argent.
                                                </p>
                                            </div>
                                            <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-zinc-800">
                                                <div
                                                    className="h-full bg-gold transition-all duration-1000"
                                                    style={{ width: `${(adProgress / requiredAds) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] font-black text-gold/60">PROGRESSION : {adProgress} / {requiredAds}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-8 bg-black/20 border-t border-zinc-800">
                            <button
                                onClick={handlePay}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-[1.02] active:scale-95
                                    ${method === 'rewarded' ? 'bg-gold text-black shadow-gold/20' : 'bg-white text-black'}`}
                            >
                                {method === 'rewarded' ? `Lancer la pub ${adProgress + 1}` : 'Confirmer le paiement'}
                            </button>
                        </div>
                    </>
                )}

                {step === 'processing' && (
                    <div className="p-20 flex flex-col items-center justify-center gap-8 text-center">
                        <div className="w-20 h-20 border-4 border-gold/10 border-t-gold rounded-full animate-spin" />
                        <h3 className="text-xl font-black text-white italic uppercase tracking-[0.1em]">Traitement Sécurisé...</h3>
                    </div>
                )}

                {step === 'success' && (
                    <div className="p-20 flex flex-col items-center justify-center gap-8 text-center">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 animate-bounce">
                            <IconCheck size={48} className="text-black" strokeWidth={4} />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Produit Débloqué !</h3>
                    </div>
                )}

                {step === 'ad_wall' && (
                    <div className="p-10 flex flex-col items-center justify-center gap-6 text-center animate-in zoom-in duration-300">
                        <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden relative group border border-zinc-800">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 animate-pulse" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xl font-black text-white italic">ESPACE PUBLICITAIRE</p>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">{adProgress + 1} SUR {requiredAds}</p>
                            </div>

                            {/* Intelligent Protection Circle */}
                            <AdTimer onComplete={handleAdComplete} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function AdTimer({ onComplete }: { onComplete: () => void }) {
    const [timeLeft, setTimeLeft] = useState(7)
    const [needClick, setNeedClick] = useState(false)

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                // Random interruption to prevent AFK
                if (timeLeft === 4 && Math.random() > 0.5) {
                    setNeedClick(true)
                } else {
                    setTimeLeft(timeLeft - 1)
                }
            }, 1000)
            return () => clearTimeout(timer)
        } else {
            onComplete()
        }
    }, [timeLeft, onComplete])

    if (needClick) {
        return (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20 p-6">
                <button
                    onClick={() => { setNeedClick(false); setTimeLeft(timeLeft - 1) }}
                    className="px-6 py-3 bg-gold text-black font-black rounded-xl text-xs uppercase tracking-widest animate-bounce"
                >
                    Cliquez pour continuer la pub
                </button>
            </div>
        )
    }

    return (
        <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-black/80 flex items-center justify-center text-white font-black text-lg border-2 border-gold shadow-2xl z-10">
            {timeLeft}
        </div>
    )
}
