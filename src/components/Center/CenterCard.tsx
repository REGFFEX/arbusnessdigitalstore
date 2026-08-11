import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CenterPost, incrementShareCount } from '../../services/center'
import {
  IconShare, IconCopy, IconCheck, IconChevronDown, IconChevronUp,
  CENTER_TYPE_ICONS, IconPin
} from '../Icons'
import ShareMenu from './ShareMenu'

interface Props {
  post: CenterPost
  onMediaClick: (media: { url: string; type: 'image' | 'video' | 'audio' }) => void
  isGrouped?: boolean
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function getMediaType(url: string): 'video' | 'audio' | 'image' {
  const lower = url.toLowerCase()
  if (lower.match(/\.(mp4|webm|mov)$/)) return 'video'
  if (lower.match(/\.(mp3|wav|ogg|aac)$/)) return 'audio'
  return 'image'
}

export default function CenterCard({ post, onMediaClick, isGrouped = false }: Props) {
  const [expanded, setExpanded] = useState(post.card_size === 'lg' || post.priority === 'critical')
  const [showShare, setShowShare] = useState(false)
  const typeMeta = CENTER_TYPE_ICONS[post.type] || CENTER_TYPE_ICONS.announcement
  const Icon = typeMeta.icon
  const mediaUrls = (post.media_urls || []) as string[]

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  }

  const handleShare = async () => {
    setShowShare(!showShare)
    if (!showShare && post.id) await incrementShareCount(post.id)
  }

  const mainImage = post.thumbnail || (mediaUrls.length > 0 ? mediaUrls[0] : null)

  const iconInfo = CENTER_TYPE_ICONS[post.type] || CENTER_TYPE_ICONS.announcement
  const CardIcon = iconInfo.icon

  // Layout Config extraction
  const lcfg = post.layout_config || {}
  const cardStyle = {
    aspectRatio: lcfg.aspectRatio || 'auto',
    width: lcfg.width || '100%',
    objectFit: lcfg.objectFit || 'cover'
  } as React.CSSProperties

  const card_size = post.card_size || 'md'

  return (
    <div 
      className={`relative bg-zinc-900/40 rounded-[32px] border border-zinc-800/50 overflow-hidden group transition-all duration-500 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 ${isGrouped ? 'border-l-4 border-l-gold' : ''}`}
      style={{ minHeight: card_size === 'sm' ? '120px' : 'auto' }}
    >
      <div className={`flex ${card_size === 'sm' ? 'flex-row h-full' : 'flex-col'}`}>
        
        {/* Modern Image Container - Top Left on small, Top on others */}
        {(post.thumbnail || (post.media_urls && post.media_urls.length > 0)) ? (
          <div className={`relative overflow-hidden shrink-0 ${card_size === 'sm' ? 'w-1/3 aspect-square' : 'w-full aspect-video'}`}>
            <img 
              src={post.thumbnail || post.media_urls![0]} 
              alt={post.title}
              className="w-full h-full transition-transform duration-700 group-hover:scale-110"
              style={{ objectFit: cardStyle.objectFit }}
              onClick={() => onMediaClick({ url: post.thumbnail || post.media_urls![0], type: getMediaType(post.thumbnail || post.media_urls![0]) })}
            />
            {/* Stuck Icon Overlay - Premium Glassmorphism */}
            <div className={`absolute top-2 left-2 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-xl ${iconInfo.bg} ${iconInfo.color}`}>
              <CardIcon size={18} />
            </div>
            
            {/* Priority Badge */}
            {post.priority === 'critical' && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-lg animate-pulse shadow-lg">
                Urgent
              </div>
            )}
          </div>
        ) : (
          <div className={`shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center border border-zinc-800/50 ${typeMeta.bg} ${typeMeta.color}`}>
            <Icon size={32} strokeWidth={2} />
          </div>
        )}

        <div className={`flex-1 min-w-0 pt-1 ${card_size === 'sm' ? 'p-3' : sizeClasses[card_size]}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/5 ${typeMeta.bg} ${typeMeta.color}`}>
               {typeMeta.label}
            </span>
            {post.pinned && (
              <span className="flex items-center gap-1 text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-black border border-gold/20 animate-pulse">
                <IconPin size={10} /> ÉPINGLÉ
              </span>
            )}
            {post.priority === 'critical' && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />}
          </div>
          
          <h3 className={`font-black text-white leading-tight italic uppercase tracking-tighter ${post.card_size === 'sm' ? 'text-xs' : 'text-sm sm:text-lg'}`}>
            {post.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 opacity-40">
            <span className="text-[10px] font-bold text-zinc-400">{post.source || 'AR BUSINESS'}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-[10px] font-bold text-zinc-400">{post.created_at ? timeAgo(post.created_at) : '--'}</span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      {post.content && (
        <div className={`mt-4 ${post.card_size === 'sm' ? 'text-xs' : 'text-sm'} text-zinc-300 leading-relaxed`}>
          {expanded || post.content.length <= 150 ? (
            <p className="whitespace-pre-wrap">{post.content}</p>
          ) : (
            <>
              <p>{post.content.slice(0, 150)}...</p>
              <button 
                onClick={() => setExpanded(true)} 
                className="flex items-center gap-1 mt-2 text-[10px] font-black uppercase text-gold hover:text-white transition-colors"
              >
                Voir plus <IconChevronDown size={12} />
              </button>
            </>
          )}
          {expanded && post.content.length > 150 && (
            <button 
              onClick={() => setExpanded(false)} 
              className="flex items-center gap-1 mt-2 text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Réduire <IconChevronUp size={12} />
            </button>
          )}
        </div>
      )}

      {/* Media Gallery (if more than 1 image) */}
      {mediaUrls.length > 1 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {mediaUrls.slice(1).map((url, i) => (
            <div
              key={i}
              onClick={() => onMediaClick({ url, type: getMediaType(url) })}
              className="relative rounded-xl overflow-hidden cursor-pointer group/media border border-zinc-800/50 hover:border-zinc-700 aspect-square"
            >
              <img src={url} alt="" className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      {(post.linked_product_id || post.linked_service_id || post.external_url) && (
        <div className="mt-5 pt-4 border-t border-zinc-800/30 flex flex-wrap gap-2">
          {post.external_url && (
            <a href={post.external_url} target="_blank" rel="noopener noreferrer"
               className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-white/10">
              Ouvrir le lien
            </a>
          )}
          {post.linked_product_id && (
            <Link to={`/product/${post.linked_product_id}`} className="px-4 py-2 bg-gold/10 border border-gold/30 text-gold text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-gold hover:text-black transition-all">
              Voir l'offre
            </Link>
          )}
          {post.linked_service_id && (
            <Link to={`/services/${post.linked_service_id}`} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-cyan-500 hover:text-black transition-all">
              Détails service
            </Link>
          )}
        </div>
      )}

      {/* Actions Footer */}
      <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-4">
          <button onClick={handleShare} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5">
            <IconShare size={16} />
            <span className="text-[10px] font-black">{post.share_count || 0}</span>
          </button>
          <button className="text-zinc-500 hover:text-white transition-colors">
            <IconCopy size={16} />
          </button>
        </div>
        <div className="h-px flex-1 mx-4 bg-zinc-800/30" />
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          ID: {post.id?.slice(0, 4)}
        </span>
      </div>

      {/* Share Overlay */}
      {showShare && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl z-20 flex items-center justify-center p-6 rounded-[32px] animate-in fade-in zoom-in duration-300">
          <button onClick={() => setShowShare(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white">
            <IconCheck size={20} />
          </button>
          <div className="w-full max-w-[240px]">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 text-center">Partager ce post</h4>
            <ShareMenu url={`${window.location.origin}/ar-center#post-${post.id}`} title={post.title} onShare={() => setShowShare(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
