import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyDownloadToken, getSignedDownloadUrl, logDownload, markTokenAsUsed } from '../services/downloads'
import { IconDownload, IconShieldCheck, IconAlertCircle, IconLoader2, IconCircleCheck, IconArrowLeft } from '../components/Icons'

export default function SecureDownload() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token')

    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [downloadData, setDownloadData] = useState<any>(null)
    const [status, setStatus] = useState<'idle' | 'preparing' | 'ready'>('idle')

    useEffect(() => {
        async function init() {
            if (!token) {
                setError('Jeton de téléchargement manquant.')
                setLoading(false)
                return
            }

            try {
                const data = await verifyDownloadToken(token)
                if (!data) {
                    setError('Ce lien a expiré ou est invalide. Veuillez recommencer depuis le store.')
                } else {
                    setDownloadData(data)
                }
            } catch (err) {
                setError('Erreur lors de la vérification du lien.')
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [token])

    const handleStartDownload = async () => {
        if (!downloadData || status !== 'idle') return

        setVerifying(true)
        setStatus('preparing')

        try {
            // 1. Log the download
            await logDownload(downloadData.product_id, undefined, downloadData.products?.name)

            // 2. Mark token as used
            await markTokenAsUsed(downloadData.id)

            // 3. Get signed URL
            const signedUrl = await getSignedDownloadUrl(downloadData.bucket, downloadData.file_path, 300) // 5 min for actual file access

            // 4. Trigger download
            const link = document.createElement('a')
            link.href = signedUrl
            link.setAttribute('download', '')
            document.body.appendChild(link)
            link.click()
            link.remove()

            setStatus('ready')
        } catch (err) {
            setError('Erreur lors de la préparation du fichier.')
            setStatus('idle')
        } finally {
            setVerifying(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <IconLoader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                <p className="text-zinc-400">Sécurisation de votre accès en cours...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
                    <IconAlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Accès Non Autorisé</h1>
                <p className="text-zinc-500 max-w-md mb-8">{error}</p>
                <button
                    onClick={() => navigate('/categories')}
                    className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
                >
                    Retour au Store
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Back Button Arrow */}
                <button
                    onClick={() => navigate('/categories')}
                    className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all z-20"
                    title="Retour au store"
                >
                    <IconArrowLeft size={18} />
                </button>

                {/* Brand/Security Backdrop */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <IconShieldCheck size={120} />
                </div>

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                        <IconShieldCheck className="w-10 h-10 text-green-500" />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Accès Sécurisé Validé</h1>
                    <p className="text-sm text-zinc-500 mb-10 leading-relaxed">
                        Votre jeton d'accès unique a été vérifié. Le fichier de <span className="text-gold font-bold">{downloadData.products?.name}</span> est prêt à être délivré via notre passerelle cryptée.
                    </p>

                    {status === 'ready' ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl flex flex-col items-center gap-2">
                                <IconCircleCheck className="w-8 h-8 text-green-500" />
                                <p className="text-green-500 font-bold uppercase tracking-widest text-xs">Téléchargement Lancé</p>
                            </div>
                            <button
                                onClick={() => navigate('/categories')}
                                className="text-zinc-500 text-xs hover:text-white transition-colors underline"
                            >
                                Revenir au catalogue
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleStartDownload}
                            disabled={verifying}
                            className="group relative w-full overflow-hidden rounded-2xl bg-gold p-6 transition-all hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(255,184,0,0.3)]"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-3 font-black text-black text-lg">
                                {verifying ? (
                                    <>
                                        <IconLoader2 className="w-6 h-6 animate-spin" />
                                        PRÉPARATION...
                                    </>
                                ) : (
                                    <>
                                        <IconDownload className="w-6 h-6 group-hover:bounce" />
                                        LANCER LE TÉLÉCHARGEMENT
                                    </>
                                )}
                            </div>
                        </button>
                    )}

                    <div className="mt-12 flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Serveur Pôle AR-DSS
                        </div>
                        <div>SSL 256-BIT</div>
                        <div>ANTI-FRAUDE ACTIVE</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
