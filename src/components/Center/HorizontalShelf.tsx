import React, { useRef } from 'react'
import { IconChevronLeft, IconChevronRight } from '../Icons'

interface HorizontalShelfProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  onSeeMore?: () => void
}

export default function HorizontalShelf({ title, subtitle, icon, children, onSeeMore }: HorizontalShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollAmount = clientWidth * 0.8
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="mb-10 group/shelf">
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-4 sm:px-0">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-gold shadow-lg">{icon}</div>}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter leading-tight">{title}</h2>
            {subtitle && <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onSeeMore && (
            <button 
              onClick={onSeeMore}
              className="text-[10px] font-black text-gold/60 hover:text-gold uppercase tracking-tighter transition-colors mr-2 h-10 px-4 bg-zinc-900/50 rounded-2xl border border-zinc-800"
            >
              Voir tout
            </button>
          )}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 flex items-center justify-center bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:text-white transition-all text-zinc-500 shadow-xl"
            >
              <IconChevronLeft size={18} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 flex items-center justify-center bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:text-white transition-all text-zinc-500 shadow-xl"
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Scroll */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 px-4 sm:px-0 pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {React.Children.map(children, (child) => (
            <div className="shrink-0 w-[85vw] sm:w-[450px] snap-start transition-transform duration-500 group-hover/shelf:scale-[0.99] hover:!scale-100">
              {child}
            </div>
          ))}
          {/* Shadow fades */}
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-black to-transparent pointer-events-none opacity-0 group-hover/shelf:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  )
}
