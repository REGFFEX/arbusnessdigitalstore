import React from 'react'
import { Link } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { IconDownload, IconArrowRight, IconStar, IconAndroid, IconWindows, IconGlobe, IconLinux, IconApple, IconHeart } from './Icons'
import { formatPriceFCFA, formatPriceUSD, formatPriceEUR } from '../utils/currency'
import { isInWishlist, toggleWishlist } from '../utils/wishlist'

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings } = useSettings()
  const [inWishlist, setInWishlist] = React.useState(isInWishlist(product.id))

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      type: product.type
    })
    setInWishlist(added)
  }

  // Simulation de rating pour le style Play Store
  const rating = (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1)

  // --- CALCUL DES PRIX DYNAMIQUES (PREMIUM ECOSYSTEM) ---
  const calculateEffectivePrice = () => {
    if (!product) return 0
    if (product.monetization_type === 'free') return 0

    const userPremiumLevel = parseInt(localStorage.getItem('ar_user_premium_level') || '0')
    const basePrice = product.price || 0

    if (userPremiumLevel === 0) return basePrice

    const tier = settings.premium_config?.find(t => t.level === userPremiumLevel)
    if (!tier) {
      if (userPremiumLevel === 1) return basePrice * 0.9
      if (userPremiumLevel === 2) return basePrice * 0.75
      if (userPremiumLevel >= 3) return basePrice * 0.5
      return basePrice
    }

    const createdDate = new Date(product.created_at)
    const diffDays = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24))

    if (tier.day1_free && diffDays <= 1) return 0
    if (tier.day2_half && diffDays <= 2) return basePrice * 0.5

    const discount = tier.discount_percent || 0
    return basePrice * (1 - discount / 100)
  }

  const effectivePrice = calculateEffectivePrice()
  const hasDiscount = effectivePrice < (product.price || 0)

  // Premium benefits calculation
  const userPremiumLevel = parseInt(localStorage.getItem('ar_user_premium_level') || '0')
  const tier = settings.premium_config?.find(t => t.level === userPremiumLevel)
  const createdDate = new Date(product.created_at)
  const diffDays = Math.floor((new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24))

  // Check for special premium benefits
  const isDay1Free = tier?.day1_free && diffDays <= 1
  const isDay2Half = tier?.day2_half && diffDays <= 2
  const hasNoAds = tier?.no_ads && product.monetization_type === 'ads'

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col bg-zinc-900/40 rounded-xl sm:rounded-[28px] p-2 sm:p-4 border border-zinc-800/50 hover:bg-zinc-800/60 transition-all duration-300 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5"
    >
      {/* Icon Section */}
      <div className="relative mb-2 sm:mb-4">
        <div className="aspect-square w-full rounded-2xl sm:rounded-[22%] bg-zinc-800 overflow-hidden shadow-inner border border-white/5 relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.is_project ? 'opacity-80' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-20">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          )}

          {/* Wishlist Heart */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 left-2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${inWishlist ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-white/20' : 'bg-black/50 text-white/70 hover:bg-black/80 hover:scale-110 active:scale-95'}`}
          >
            <IconHeart size={16} fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={inWishlist ? 0 : 2.5} />
          </button>

          {/* WhatsApp Style Notification Dot for Projects */}
          {product.is_project && product.roadmap && Array.isArray(product.roadmap) && product.roadmap.length > 0 && (
            <div className="absolute top-2 left-2 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse z-10" />
          )}

          {/* PLUS D'INFOS Overlay Branding (Mobile Carrousel Vibe) */}
          {!product.is_project && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[1px] pointer-events-none">
              <span className="text-[8px] sm:text-[10px] font-black text-white border border-white/20 px-3 py-1 rounded-full tracking-[0.15em] uppercase bg-black/50">
                Plus d'infos
              </span>
            </div>
          )}
        </div>

        <div className="absolute -top-1 -right-1 flex flex-col gap-1 pointer-events-none">
          {product.is_project && (
            <div className="bg-blue-600 text-white text-[7px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg pulse">
              PROJECT
            </div>
          )}
          {product.placements?.includes('top_10') && (
            <div className="bg-red-600 text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg border border-white/10">
              TOP 10
            </div>
          )}
          {product.placements?.includes('trending') && (
            <div className="bg-orange-500 text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg border border-white/10">
              TRENDING
            </div>
          )}
          {product.is_premium && !product.is_project && (
            <div className="bg-gold text-black text-[7px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg">
              PREM
            </div>
          )}
          {product.monetization_type === 'ads' && !product.is_project && (
            <div className={`text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg ${hasNoAds ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'}`}>
              {hasNoAds ? 'NO ADS' : 'ADS'}
            </div>
          )}
          {/* Premium Benefits Badges */}
          {isDay1Free && (
            <div className="bg-gradient-to-r from-gold to-yellow-500 text-black text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg animate-pulse">
              DAY 1 FREE
            </div>
          )}
          {isDay2Half && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg">
              DAY 2 -50%
            </div>
          )}
          {hasDiscount && userPremiumLevel > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 text-black text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg">
              -{tier?.discount_percent || 0}%
            </div>
          )}
          <div className={`text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2 rounded-full shadow-lg border border-white/10 ${product.source === 'EXTERNAL' ? 'bg-zinc-800 text-zinc-400' : 'bg-gold text-black'}`}>
            {product.source === 'EXTERNAL' ? 'EXTERNE' : 'AR BUSINESS'}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col flex-grow px-1">
        <h3 className="text-xs sm:text-base font-black text-white leading-tight mb-0.5 group-hover:text-gold transition-colors line-clamp-1 uppercase italic tracking-tighter">
          {product.name}
        </h3>

        <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-green-500 mb-1 sm:mb-2 truncate italic">
          {settings.site_name || 'AR Business'}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-zinc-400 mb-1 sm:mb-3 font-bold uppercase tracking-tight">
          <div className="flex items-center gap-1 bg-zinc-800/80 px-1.5 py-0.5 rounded-lg border border-white/5 shadow-inner">
            <span className="text-white font-black">{rating}</span>
            <IconStar size={9} className="text-gold" />
          </div>
          <span className="hidden sm:block w-1 h-1 bg-zinc-700 rounded-full"></span>
          <span className="hidden sm:block">{product.size || '15 MB'}</span>

          {/* Modern Multi-Platform Hub */}
          <div className="flex items-center gap-1.5 ml-auto">
            {(() => {
              // Collect unique platforms
              const platforms = new Set<string>();
              if (product.os) platforms.add(product.os.toLowerCase());

              if (product.versions && Array.isArray(product.versions)) {
                product.versions.forEach((v: any) => {
                  const label = (v.label || v.os || '').toLowerCase();
                  if (label.includes('android')) platforms.add('android');
                  else if (label.includes('windows') || label.includes('exe')) platforms.add('windows');
                  else if (label.includes('ios') || label.includes('macos') || label.includes('apple') || label.includes('ipa') || label.includes('dmg')) platforms.add('apple');
                  else if (label.includes('linux') || label.includes('deb') || label.includes('rpm') || label.includes('appimage')) platforms.add('linux');
                  else if (label) platforms.add(label);
                });
              }

              const platformList = Array.from(platforms).slice(0, 4);

              if (platformList.length > 0) {
                return (
                  <div className="flex -space-x-1.5 hover:space-x-1 transition-all">
                    {platformList.map((p, idx) => {
                      const isAndroid = p.includes('android');
                      const isWindows = p.includes('windows');
                      const isApple = p.includes('apple') || p.includes('ios') || p.includes('macos');
                      const isLinux = p.includes('linux');

                      return (
                        <div
                          key={idx}
                          title={p}
                          className={`w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center transition-transform hover:-translate-y-1 hover:z-30 cursor-help shadow-lg
                            ${isAndroid ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                              isWindows ? 'bg-blue-400/20 text-blue-400 border-blue-400/30' :
                                isApple ? 'bg-white/20 text-white border-white/30' :
                                  isLinux ? 'bg-orange-400/20 text-orange-400 border-orange-400/30' : 'bg-gold/20 text-gold border-gold/30'}`}
                        >
                          {isAndroid ? <IconAndroid size={10} strokeWidth={2.5} /> :
                            isWindows ? <IconWindows size={10} strokeWidth={2.5} /> :
                              isApple ? <IconApple size={10} strokeWidth={2.5} /> :
                                isLinux ? <IconLinux size={10} strokeWidth={2.5} /> :
                                  <IconGlobe size={10} strokeWidth={2.5} />}
                        </div>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div className="w-6 h-6 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-500">
                  <IconGlobe size={10} />
                </div>
              );
            })()}
          </div>
        </div>

        {/* Description — Desktop Only */}
        <p className="hidden sm:block text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
          {product.short_desc || 'Découvrez cette application incroyable sur AR Business Digital Store.'}
        </p>

        {/* Footer actions */}
        <div className="mt-auto space-y-2">
          {!product.is_project ? (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = `/product/${product.id}?autoUnlock=true`
              }}
              className="w-full bg-gold hover:bg-yellow-400 text-black font-black py-2 rounded-xl text-[10px] sm:text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group/btn"
            >
              <IconDownload size={14} strokeWidth={3} className="group-hover/btn:translate-y-0.5 transition-transform" />
              {product.monetization_type === 'premium' || product.monetization_type === 'freemium' ? 'Acheter' :
                product.monetization_type === 'ads' ? 'Débloquer' : 'Télécharger'}
            </button>
          ) : (
            <div className="w-full bg-zinc-800 text-zinc-500 font-black py-2 rounded-xl text-[10px] sm:text-xs uppercase text-center border border-zinc-700 opacity-50">
              En développement
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[8px] text-zinc-500 line-through">
                  {(() => {
                    const config = product.display_config || { show_usd: true, show_fcfa: true, show_eur: false };
                    const oldPrices = [];
                    if (config.show_usd) oldPrices.push(formatPriceUSD(product.price));
                    if (config.show_fcfa) oldPrices.push(formatPriceFCFA(product.price_fcfa || (product.price * 650)));
                    if (config.show_eur) oldPrices.push(formatPriceEUR(product.price_eur));
                    return oldPrices.join(' • ');
                  })()}
                </span>
              )}
              <span className={`text-[9px] sm:text-[10px] font-black ${product.is_project ? 'text-gold' : 'text-zinc-500'} uppercase`}>
                {product.is_project ? (product.estimated_date || 'Bientôt') : (
                  product.monetization_type === 'free' ? 'Gratuit' : (
                    product.monetization_type === 'ads' ? (product.ads_video_count > 0 ? `${product.ads_video_count} Vidéos` : 'Regarder Pubs') : (
                      (() => {
                        const config = product.display_config || { show_usd: true, show_fcfa: true, show_eur: true };
                        const discountRatio = (product.price > 0) ? effectivePrice / product.price : 1;
                        const currentPrices = [];

                        if (config.show_fcfa) {
                          const fcfa = product.price_fcfa || (product.price * 650);
                          currentPrices.push(formatPriceFCFA(fcfa * discountRatio));
                        }
                        if (config.show_usd) {
                          currentPrices.push(formatPriceUSD(effectivePrice));
                        }
                        if (config.show_eur) {
                          const eur = product.price_eur || (product.price * 0.92);
                          currentPrices.push(formatPriceEUR(eur * discountRatio));
                        }

                        return currentPrices.join(' • ');
                      })()
                    )
                  )
                )}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-gold hover:text-white transition-colors uppercase flex items-center gap-1 group/more">
              En savoir plus
              <IconArrowRight size={10} strokeWidth={3} className="group-hover/more:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
