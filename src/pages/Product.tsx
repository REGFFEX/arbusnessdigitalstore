import React, { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { SiteNavFooter } from '../components/SiteNav'
import { getProductById, getProducts } from '../services/products'
import { createDownloadToken } from '../services/downloads'
import Badge from '../components/Badge'
import ProductCard from '../components/ProductCard'
import { supabase } from '../config/supabase'
import { IconArrowLeft, IconArrowRight, IconDownload, IconSettings, IconPackage, IconX, IconLock, IconGlobe, IconBriefcase, IconAndroid, IconWindows, IconLinux, IconApple, IconShare, IconHeart } from '../components/Icons'
import AdWall from '../components/AdWall'
import { useAds } from '../context/AdsContext'
import PaymentModal from '../components/PaymentModal'
import { useSettings } from '../hooks/useSettings'
import { isInWishlist, toggleWishlist } from '../utils/wishlist'
import { formatPriceFCFA, formatPriceUSD, formatPriceEUR } from '../utils/currency'
import HorizontalShelf from '../components/HorizontalShelf'

const getOSIcon = (os: string, size = 16) => {
  const label = os?.toLowerCase() || ''
  if (label.includes('android')) return <IconAndroid size={size} className="text-green-500" />
  if (label.includes('windows')) return <IconWindows size={size} className="text-blue-400" />
  if (label.includes('linux')) return <IconLinux size={size} className="text-orange-500" />
  if (label.includes('apple') || label.includes('ios') || label.includes('mac')) return <IconApple size={size} className="text-zinc-300" />
  return <IconGlobe size={size} className="text-zinc-400" />
}

export default function ProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [product, setProduct] = useState<any | null>(null)
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<any | null>(null)

  // États Téléchargement & Monétisation
  const [showAdWall, setShowAdWall] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [downloadMode, setDownloadMode] = useState<'private' | 'public' | null>(null)
  const [rememberChoice, setRememberChoice] = useState(false)

  const { showAd, isItemUnlocked, unlockItem } = useAds()
  const { settings } = useSettings()
  const [inWishlist, setInWishlist] = useState(false)

  const [selectedMedia, setSelectedMedia] = useState<{ url: string, type: 'video' | 'image' } | null>(null)

  useEffect(() => {
    if (product) setInWishlist(isInWishlist(product.id))
  }, [product])

  const handleShare = async () => {
    if (!product) return
    const shareData = {
      title: product.name,
      text: product.short_desc || `Découvrez ${product.name} sur AR Business Store !`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Lien copié dans le presse-papier !')
      }
    } catch (e) {
      console.error('Error sharing:', e)
    }
  }

  const handleToggleWishlist = () => {
    if (!product) return
    const added = toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      type: product.type
    })
    setInWishlist(added)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    loadProduct()
  }, [id])

  // Gestion Auto-Unlock (venant de la Card Mobile — passe par le flux sécurisé)
  useEffect(() => {
    if (product && searchParams.get('autoUnlock') === 'true') {
      // SÉCURITÉ : On passe par processUnlockFlow qui vérifie paiement/pub
      const effectivePrice = calculateEffectivePrice()
      const alreadyUnlocked = isItemUnlocked(product.id)
      const needsPayment = effectivePrice > 0 && !alreadyUnlocked
      const needsAds = product.monetization_type === 'ads' && !alreadyUnlocked

      if (needsPayment || needsAds) {
        // Forcer l'affichage du modal de paiement ou de la pub
        processUnlockFlow()
      } else {
        // Produit gratuit ou déjà débloqué → téléchargement direct
        handleTechnicalDownload()
      }
    }
  }, [product, searchParams])

  useEffect(() => {
    // Charger la préférence utilisateur au montage
    const savedMode = localStorage.getItem('ar_download_mode')
    if (savedMode === 'private' || savedMode === 'public') {
      setDownloadMode(savedMode as 'private' | 'public')
    }
  }, [])



  async function loadProduct() {
    setLoading(true)
    try {
      if (!id) return
      const data = await getProductById(id)
      if (data) {
        setProduct(data)
        if (data.type === 'Formation') {
          // Charger modules (simulé ou réel via table séparée)
          // Pour l'instant placeholder
          setModules([
            { id: 1, name: 'Introduction au Module', type: 'video', file_url: '#' },
            { id: 2, name: 'Support PDF', type: 'pdf', file_url: '#' }
          ])
        }

        // Charger similaires : Même type en priorité, puis tags communs
        const all = await getProducts() || []
        const filtered = all.filter(p => p.id !== id)

        // Score simple : +10 points si même type, +2 points par tag commun
        const scored = filtered.map(p => {
          let score = 0
          if (p.type === data.type) score += 10
          if (data.tags && p.tags) {
            const common = data.tags.filter((t: string) => p.tags.includes(t))
            score += common.length * 2
          }
          return { ...p, score }
        }).sort((a, b) => b.score - a.score)

        setSimilarProducts(scored.slice(0, 8))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // --- CALCUL DES PRIX DYNAMIQUES (PREMIUM ECOSYSTEM) ---
  const calculateEffectivePrice = () => {
    if (!product) return 0
    if (product.monetization_type === 'free') return 0

    // On récupère le niveau premium via localStorage
    const userPremiumLevel = parseInt(localStorage.getItem('ar_user_premium_level') || '0')
    const basePrice = product.price || 0

    if (userPremiumLevel === 0) return basePrice

    // Trouver la config du tier correspondant via les settings globaux
    const tier = settings.premium_config?.find((t: any) => t.level === userPremiumLevel)
    if (!tier) {
      // Fallback si la config n'est pas encore chargée ou absente
      if (userPremiumLevel === 1) return basePrice * 0.9
      if (userPremiumLevel === 2) return basePrice * 0.75
      if (userPremiumLevel >= 3) return basePrice * 0.5
      return basePrice
    }

    // Calcul de l'ancienneté du produit (en jours)
    const createdDate = new Date(product.created_at)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24))

    // Règle DAY 1 (Généralement Ultimate Level 3)
    if (tier.day1_free && diffDays <= 1) return 0

    // Règle DAY 2 (Généralement Ultimate Level 3)
    if (tier.day2_half && diffDays <= 2) return basePrice * 0.5

    // Réduction standard du tier
    const discount = tier.discount_percent || 0
    return basePrice * (1 - discount / 100)
  }

  // 1. Clic sur le bouton Principal (Intelligent Action)
  const handleDownloadClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!product) return

    // On s'assure qu'on vise la version principale
    setSelectedVersion(null)

    const effectivePrice = calculateEffectivePrice()
    const isActuallyUnlocked = isItemUnlocked(product.id)

    // SÉCURITÉ : On bloque si le prix effectif > 0 et non débloqué
    const needsPayment = effectivePrice > 0 && !isActuallyUnlocked
    const needsAds = product.monetization_type === 'ads' && !isActuallyUnlocked

    // Si besoin de payer ou voir une pub, on ne va pas plus loin sans débloquer
    if (needsPayment || needsAds) {
      processUnlockFlow()
      return
    }

    // Si on arrive ici, c'est gratuit ou déjà débloqué
    handleTechnicalDownload()
  }

  const handleTechnicalDownload = () => {
    // SÉCURITÉ CRITIQUE : Re-vérifier l'accès avant d'afficher les modals de téléchargement
    const effectivePrice = calculateEffectivePrice()
    const isActuallyUnlocked = isItemUnlocked(product.id)
    if ((effectivePrice > 0 || product.monetization_type === 'ads') && !isActuallyUnlocked) {
      console.error("Security Bypass Attempt Detected in handleTechnicalDownload")
      processUnlockFlow()
      return
    }
    // Choix du mode si non mémorisé
    if (downloadMode) {
      startDownload()
    } else {
      setShowDownloadModal(true)
    }
  }

  const processUnlockFlow = async () => {
    if (!product) return
    const effectivePrice = calculateEffectivePrice()

    // 1. Priorité Paiement si prix > 0
    if (effectivePrice > 0) {
      console.log("Triggering Payment Modal")
      setShowPaymentModal(true)
      return
    }

    // 2. Priorité Pubs si configuré
    if (product.monetization_type === 'ads') {
      console.log("Triggering Ads Flow")
      // On essaie les pubs globales (AdVideoOverlay) — Type 'reward' pour éviter le bypass immédiat si pas de pub
      showAd('reward', () => {
        unlockItem(product.id)
        handleTechnicalDownload()
      })

      // SÉCURITÉ : Si aucune pub n'est chargée ou si les pubs sont désactivées,
      // on affiche le mur de pub interne (AdWall) qui est GARANTI d'être rendu.
      // On attend 500ms pour voir si AdsContext a activé isAdVisible
      setTimeout(() => {
        const adIsVisible = document.querySelector('.fixed.inset-0.z-\\[9999\\]')
        if (!adIsVisible && !isItemUnlocked(product.id)) {
          console.warn("Global Ads failed to show, triggering local AdWall as fallback.")
          setShowAdWall(true)
        }
      }, 500)

      return
    }
  }

  // 2. Traitement du choix utilisateur (Mode technique)
  const confirmDownloadMode = (mode: 'private' | 'public') => {
    setDownloadMode(mode)
    if (rememberChoice) {
      localStorage.setItem('ar_download_mode', mode)
    }
    setShowDownloadModal(false)
    startDownload()
  }

  const startDownload = async () => {
    try {
      // Utiliser le fichier de la version sélectionnée s'il y en a une, sinon le fichier par défaut
      const path = selectedVersion ? (selectedVersion.url || selectedVersion.file_path) : (product.file_path ?? product.file_url)

      if (!path) {
        alert('Fichier non disponible pour ce produit.')
        return
      }

      // GÉNÉRATION DU JETON SÉCURISÉ
      const token = await createDownloadToken(product.id, path, 'files')

      // REDIRECTION VERS LA PASSERELLE DE TÉLÉCHARGEMENT
      navigate(`/secure-download?token=${token}`)

      setShowAdWall(false)
      setSelectedVersion(null) // Reset pour le prochain clic
    } catch (e: any) {
      console.error(e)
      alert(`Échec de la sécurisation du lien : ${e.message || 'Erreur inconnue'}. Veuillez réessayer.`)
    }
  }

  const resetDownloadSettings = (e: React.MouseEvent) => {
    e.stopPropagation()
    localStorage.removeItem('ar_download_mode')
    setDownloadMode(null)
    setRememberChoice(false)
    alert('Préférences de téléchargement réinitialisées.')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="bg-zinc-900 aspect-video rounded-3xl"></div>
          <div className="h-12 bg-zinc-900 rounded-xl w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <IconPackage size={36} className="text-zinc-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-black mb-2">Produit introuvable</h1>
        <p className="text-zinc-500 mb-8">Ce produit n'existe pas ou a été retiré du catalogue.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
            <IconArrowLeft size={16} /> Retour
          </button>
          <Link to="/store" className="flex items-center gap-2 bg-gold text-black px-8 py-3 rounded-2xl font-black hover:scale-105 transition-transform">
            Explorer le Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-zinc-500 border border-transparent hover:border-zinc-700/60 hover:text-white hover:bg-zinc-800/40 transition-all duration-200"
        >
          <IconArrowLeft size={16} strokeWidth={2.5} />
          Retour
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${inWishlist ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
          >
            <IconHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          >
            <IconShare size={18} />
          </button>
        </div>
      </div>

      {/* SECTION HAUTE : Preview & Achat */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-12 items-start mb-20">

        {/* Média principal */}
        <div className="space-y-6">
          <div className="aspect-video bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-800 shadow-2xl relative group">
            {product.type === 'Formation' && activeModule?.type === 'video' ? (
              <video
                src={activeModule.file_url}
                className="w-full h-full object-cover"
                controls
                poster={product.image}
              />
            ) : product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <IconPackage size={80} className="text-white" strokeWidth={1} />
              </div>
            )}

            {product.is_premium && (
              <div className="absolute top-6 left-6 bg-gold text-black px-4 py-1.5 rounded-full font-black text-xs shadow-xl animate-pulse">
                PREMIUM CONTENT
              </div>
            )}
          </div>

          {/* Screenshots */}
          {product.screenshots && product.screenshots.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {product.screenshots.map((s: string, i: number) => {
                const isVideo = s.toLowerCase().endsWith('.mp4') || s.toLowerCase().endsWith('.webm');
                return isVideo ? (
                  <div key={i} className="relative h-48 w-32 shrink-0 cursor-pointer group snap-center" onClick={() => setSelectedMedia({ url: s, type: 'video' })}>
                    <video src={s} className="w-full h-full object-cover rounded-2xl border border-zinc-800 group-hover:border-gold/50 transition-colors" muted />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl group-hover:bg-black/20 transition-all">
                      <div className="w-8 h-8 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center pl-1 text-gold">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <img key={i} src={s} onClick={() => setSelectedMedia({ url: s, type: 'image' })} className="h-48 w-auto min-w-[120px] object-cover rounded-2xl border border-zinc-800 shrink-0 hover:border-gold/50 cursor-pointer transition-colors snap-center" alt="Capture screen" />
                )
              })}
            </div>
          )}
        </div>

        {/* Détails & Action */}
        <div className="space-y-8 lg:sticky lg:top-24">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl p-1 border border-zinc-800 shrink-0">
                <img src={product.image || '/placeholder.png'} className="w-full h-full object-cover rounded-xl" alt="Icon" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white leading-tight">
                  {product.name}
                  {product.edition && <span className="text-zinc-500 text-lg ml-3 font-medium italic">[{product.edition}]</span>}
                </h1>
                <p className="text-gold font-bold text-sm uppercase tracking-widest">{product.type}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge type="status" value={product.status || 'Stable'} />
              {product.license && <Badge type="license" value={product.license} />}
              {product.os && <Badge type="os" value={product.os} />}
              {product.source && (
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${product.source === 'EXTERNAL' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' : 'bg-gold/10 border-gold/50 text-gold'}`}>
                  {product.source}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
            <div className="text-center sm:border-r border-zinc-800 pb-4 sm:pb-0">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Prix & Monnaie</p>
              <div className="flex flex-col items-center gap-1">
                {(() => {
                  const usd = calculateEffectivePrice();
                  const config = product.display_config || { show_usd: true, show_fcfa: true, show_eur: true };
                  const discountRatio = (product.price > 0) ? usd / product.price : 1;
                  const display = [];
                  if (config.show_fcfa) display.push(formatPriceFCFA((product.price_fcfa || (product.price * 650)) * discountRatio));
                  if (config.show_usd) display.push(formatPriceUSD(usd));
                  if (config.show_eur) display.push(formatPriceEUR((product.price_eur || (product.price * 0.92)) * discountRatio));

                  return display.map((p, i) => (
                    <p key={i} className={`font-black text-white ${i === 0 ? 'text-2xl' : 'text-sm opacity-60'}`}>{p}</p>
                  ));
                })()}
                {calculateEffectivePrice() < (product.price || 0) && (
                  <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full mt-1">
                    OFFRE PREMIUM ACTIVE
                  </span>
                )}
                {product.requires_license && (
                  <span className="text-[9px] font-black text-zinc-300 border border-zinc-600 bg-zinc-800/80 px-2 py-1 rounded-md mt-2 flex items-center gap-1.5">
                    <IconLock size={10} className="text-gold" />
                    CLÉ D'ACTIVATION REQUISE
                  </span>
                )}
              </div>
            </div>
            <div className="text-center pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Moyen d'accès</p>
              <p className="text-sm font-black text-gold uppercase flex flex-col gap-1">
                <span>{product.monetization_type === 'ads' ? 'Récompensé (Ads)' : product.monetization_type}</span>
                {product.monetization_type === 'ads' && product.ads_video_count > 0 && (
                  <span className="text-[10px] opacity-60 italic">{product.ads_video_count} Vidéos à regarder</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4 relative">
            {/* Version Preview if exists */}
            {product.versions && Array.isArray(product.versions) && product.versions.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.versions.map((v, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 rounded-xl border border-zinc-700 text-[10px] font-bold text-zinc-300">
                    {getOSIcon(v.os || v.label, 12)}
                    {v.label} {v.version && <span className="opacity-40 text-[9px] ml-1">v{v.version}</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleDownloadClick}
                className="flex-1 py-5 bg-gold text-black rounded-2xl font-black text-lg shadow-xl shadow-gold/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span>
                  {isItemUnlocked(product.id)
                    ? (product.type === 'Formation' ? 'COMMENCER' : 'OBTENIR MAINTENANT')
                    : (product.access_type === 'reward' ? 'DÉBLOQUER (PUB)' :
                      product.access_type === 'payant' ? 'DÉBLOQUER (ACHAT)' :
                        'DÉBLOQUER')}
                </span>
              </button>

              {/* Settings Button (Foldable option simulation) */}
              <button
                onClick={resetDownloadSettings}
                className="w-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                title="Réinitialiser les préférences de téléchargement"
              >
                <IconSettings size={18} strokeWidth={2} />
              </button>
            </div>

            <p className="text-[10px] text-center text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
              Mode actuel : {downloadMode ? (downloadMode === 'private' ? 'Privé (Sécurisé)' : 'Public (Rapide)') : 'Non défini'}
            </p>
          </div>
        </div>
      </div>


      {/* MODAL CHOIX TÉLÉCHARGEMENT */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowDownloadModal(false)} className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-all">
              <IconX size={16} strokeWidth={2.5} />
            </button>

            <h3 className="text-2xl font-black text-white mb-2 text-center">Choisissez votre mode</h3>
            <p className="text-zinc-500 text-center mb-8 text-sm">Comment souhaitez-vous télécharger ce fichier ?</p>

            <div className="space-y-4">
              <button
                onClick={() => confirmDownloadMode('private')}
                className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-gold/50 rounded-xl flex items-center gap-4 group transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IconLock size={20} className="text-gold" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white group-hover:text-gold transition-colors">Privé & Sécurisé</p>
                  <p className="text-xs text-zinc-500">Lien crypté via nos serveurs sécurisés.</p>
                </div>
              </button>

              <button
                onClick={() => confirmDownloadMode('public')}
                className="w-full p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-blue-500/50 rounded-xl flex items-center gap-4 group transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IconGlobe size={20} className="text-blue-400" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white group-hover:text-blue-400 transition-colors">Public & Rapide</p>
                  <p className="text-xs text-zinc-500">Téléchargement direct standard.</p>
                </div>
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberChoice}
                onChange={(e) => setRememberChoice(e.target.checked)}
                className="w-5 h-5 accent-gold"
              />
              <label htmlFor="remember" className="text-sm text-zinc-400 cursor-pointer select-none">Mémoriser mon choix pour toujours</label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PUBLICITÉ (AD WALL) */}
      {showAdWall && (
        <AdWall
          duration={10}
          onUnlock={startDownload}
          onCancel={() => setShowAdWall(false)}
        />
      )}

      {/* SECTION BASSE : Description & Modules */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* ... (Reste du code inchangé) ... */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-gold rounded-full"></span>
              À propos de ce produit
            </h2>
            <div className="bg-zinc-900/30 p-8 rounded-3xl border border-zinc-800 leading-relaxed text-zinc-300 whitespace-pre-line">
              {product.description || "Aucune description détaillée n'est disponible pour le moment."}
            </div>
          </section>

          {/* SECTION PARTENAIRE (Si Externe) */}
          {product.source === 'EXTERNAL' && (
            <section className="bg-gold/5 border border-gold/20 rounded-[40px] p-8 md:p-12 animate-in fade-in slide-in-from-bottom-5">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gold/20 flex items-center justify-center">
                      <IconBriefcase size={20} className="text-gold" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Offre <span className="text-gold">Partenaire</span></h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-1">Entité Partenaire</p>
                      <p className="text-xl font-black text-white">{product.partner_name || "Partenaire Officiel"}</p>
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Ce produit est proposé en collaboration avec notre partenaire. Scannez le QR code pour obtenir plus de détails ou visiter leur plateforme officielle.
                    </p>

                    {product.partner_link && (
                      <a
                        href={product.partner_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-black text-gold hover:text-white transition-colors uppercase tracking-widest"
                      >
                        Visiter le Site Web <IconArrowRight size={14} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-4 bg-gold/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-white p-6 rounded-[32px] shadow-2xl shadow-gold/20 transform group-hover:rotate-2 transition-transform duration-500">
                    {product.partner_qr_url ? (
                      <img
                        src={product.partner_qr_url}
                        alt="Partner QR Code"
                        className="w-full h-auto aspect-square object-contain"
                      />
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400">
                        <IconPackage size={48} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase mt-4">QR Code non disponible</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black border border-gold/30 px-4 py-2 rounded-full shadow-xl">
                    <p className="text-[8px] font-black text-gold uppercase tracking-widest whitespace-nowrap">Scan pour plus d'infos</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-zinc-900 rounded-full text-xs font-bold text-zinc-400 border border-zinc-800 hover:border-gold/30 cursor-default transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Équipe du projet */}
          {product.contributors && product.contributors.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-gold rounded-full"></span>
                Équipe du projet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.contributors.map((c: { name: string; role: string; photo_url?: string }, i: number) => {
                  const initials = c.name
                    .split(' ')
                    .map((w: string) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-gold/30 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center overflow-hidden font-black text-sm text-gold shrink-0 group-hover:bg-gold/20 transition-all">
                        {c.photo_url ? (
                          <img src={c.photo_url} className="w-full h-full object-cover" alt={c.name} />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">{c.name}</p>
                        <p className="text-zinc-500 text-xs">{c.role}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest mt-4">
                © AR BUSINESS — Tous droits réservés
              </p>
            </section>
          )}

          {/* Liste des Versions Alternatives */}
          {product.versions && Array.isArray(product.versions) && product.versions.length > 0 && (
            <section className="pt-8 border-t border-zinc-800">
              <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 uppercase italic tracking-tighter">
                <span className="w-1.5 h-8 bg-gold rounded-full"></span>
                Versions Alternatives
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {product.versions.map((v: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-3xl hover:border-gold/30 hover:bg-zinc-800/60 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:scale-110 group-hover:bg-gold/10 group-hover:text-gold transition-all">
                        {getOSIcon(v.os || v.label, 24)}
                      </div>
                      <div>
                        <p className="font-black text-white group-hover:text-gold transition-colors">
                          {v.label} {v.version && <span className="text-[10px] opacity-40 ml-1">v{v.version}</span>}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          {v.size || 'Taille inconnue'} • Platforme : {v.os || 'Multi'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedVersion(v)
                        handleTechnicalDownload()
                      }}
                      className="px-6 py-2.5 bg-zinc-800 hover:bg-gold text-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                    >
                      <IconDownload size={14} />
                      Obtenir
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {product.relations && product.relations.length > 0 && (
            <div className="pt-8 border-t border-zinc-800">
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                <IconPackage size={18} className="text-gold" />
                Contenu du Pack
              </h3>
              <div className="space-y-3">
                {product.relations.map((rel: any, i: number) => (
                  <Link
                    key={i}
                    to={`/product/${rel.product_id}`}
                    className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:border-gold/30 hover:bg-zinc-800/60 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:text-gold transition-colors">
                        <IconPackage size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-gold transition-colors">
                          {rel.product_name || 'Produit lié'}
                          {rel.version && <span className="text-[9px] text-zinc-500 ml-2 font-medium">v{rel.version}</span>}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium">{rel.relation_label || 'Inclus'}</p>
                      </div>
                    </div>
                    <div className="text-zinc-600 group-hover:translate-x-1 transition-transform">
                      <IconArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {product.type === 'Formation' && (
            <section>
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Programme</h3>
              <div className="space-y-3">
                {modules.map((mod, i) => (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModule(mod)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left ${activeModule?.id === mod.id ? 'bg-gold border-gold text-black shadow-lg shadow-gold/10' : 'bg-zinc-900/50 border-zinc-800 text-white hover:border-zinc-700'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${activeModule?.id === mod.id ? 'bg-black text-gold' : 'bg-zinc-800 text-zinc-500'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{mod.name}</p>
                      <p className={`text-[10px] font-bold uppercase ${activeModule?.id === mod.id ? 'text-black/60' : 'text-zinc-500'}`}>{mod.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* SECTION SIMILAIRES : Carrousel style Play Store 2026 */}
      {similarProducts.length > 0 && (
        <div className="mb-20">
          <HorizontalShelf
            title="DANS LE MÊME MINDSET"
            products={similarProducts}
            viewAllLink="/store"
          />
        </div>
      )}

      <SiteNavFooter />

      {/* MODAL PAIEMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <PaymentModal
            product={product}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => {
              unlockItem(product.id)
              setShowPaymentModal(false)
              handleTechnicalDownload()
            }}
          />
        </div>
      )}

      {/* LIGHTBOX MEDIA GALLERY */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 animate-in zoom-in-95 duration-200" onClick={() => setSelectedMedia(null)}>
          <button onClick={() => setSelectedMedia(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all z-10 shadow-2xl shadow-black">
            <IconX size={20} strokeWidth={2.5} />
          </button>
          <div className="max-w-6xl w-full h-[85vh] flex items-center justify-center relative" onClick={e => e.stopPropagation()}>
            {selectedMedia.type === 'video' ? (
              <video src={selectedMedia.url} className="max-w-full max-h-full rounded-2xl shadow-2xl border border-zinc-800" controls autoPlay playsInline />
            ) : (
              <img src={selectedMedia.url} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-zinc-800" alt="Aperçu HD" />
            )}
          </div>
        </div>
      )}

    </div>
  )
}
