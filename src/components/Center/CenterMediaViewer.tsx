import { IconX, IconCenterAudio } from '../Icons'

interface Props {
  media: { url: string; type: 'image' | 'video' | 'audio' }
  onClose: () => void
}

export default function CenterMediaViewer({ media, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-zinc-800/80 text-white flex items-center justify-center hover:bg-red-500 transition-all text-xl active:scale-90">
        <IconX size={24} />
      </button>
      
      <div className="max-w-5xl max-h-[90vh] w-full px-4" onClick={e => e.stopPropagation()}>
        {media.type === 'video' ? (
          <video src={media.url} controls autoPlay className="w-full max-h-[85vh] rounded-3xl shadow-2xl" />
        ) : media.type === 'audio' ? (
          <div className="bg-zinc-900 p-10 rounded-3xl border border-zinc-800 flex flex-col items-center gap-6 max-w-md mx-auto">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold/20 to-zinc-800 flex items-center justify-center animate-pulse">
              <IconCenterAudio size={64} />
            </div>
            <audio src={media.url} controls autoPlay className="w-full" />
          </div>
        ) : (
          <img src={media.url} alt="" className="w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl" />
        )}
      </div>
    </div>
  )
}
