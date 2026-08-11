import React, { useState } from 'react'
import { 
  IconWhatsApp, IconTelegram, IconLinkedIn, IconFacebook, 
  IconLink, IconSmartphone, IconCheck, IconShare 
} from '../Icons'

interface ShareMenuProps {
  title: string
  url: string
  description?: string
  onShare?: () => void
}

export default function ShareMenu({ title, url, description, onShare }: ShareMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const fullUrl = window.location.origin + url
  const text = `${title}${description ? ' — ' + description : ''}`

  const shareLinks = [
    { name: 'WhatsApp', icon: <IconWhatsApp size={14} />, color: 'hover:bg-green-500/10 hover:text-green-400', url: `https://wa.me/?text=${encodeURIComponent(text + '\n' + fullUrl)}` },
    { name: 'Telegram', icon: <IconTelegram size={14} />, color: 'hover:bg-blue-400/10 hover:text-blue-400', url: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}` },
    { name: 'LinkedIn', icon: <IconLinkedIn size={14} />, color: 'hover:bg-blue-600/10 hover:text-blue-500', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}` },
    { name: 'Facebook', icon: <IconFacebook size={14} />, color: 'hover:bg-blue-500/10 hover:text-blue-400', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}` },
  ]

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description || title, url: fullUrl })
        onShare?.()
      } catch {}
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onShare?.()
  }

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-zinc-500 hover:text-gold hover:bg-gold/5 rounded-xl transition-all active:scale-90"
        title="Partager"
      >
        <IconShare size={16} />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-30 animate-in zoom-in-95 origin-bottom-right">
          {/* Native Web Share (Android) */}
          {'share' in navigator && (
            <button onClick={handleNativeShare} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-gold/10 hover:text-gold transition-colors border-b border-zinc-800">
              <IconSmartphone size={14} /> Partage Natif
            </button>
          )}

          {shareLinks.map(link => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => { onShare?.(); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-colors ${link.color}`}>
              <span>{link.icon}</span> {link.name}
            </a>
          ))}

          <button onClick={handleCopy} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors border-t border-zinc-800">
            {copied ? <IconCheck size={14} className="text-green-400" /> : <IconLink size={14} />} 
            {copied ? 'Copié !' : 'Copier le lien'}
          </button>
        </div>
      )}
    </div>
  )
}
