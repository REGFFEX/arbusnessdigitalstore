import React from 'react'
import { CENTER_TYPE_ICONS, IconSparkle } from '../Icons'

const FILTERS = [
  { key: 'all', label: 'Tout', icon: <IconSparkle size={14} /> },
  ...Object.keys(CENTER_TYPE_ICONS).map(key => ({
    key,
    label: CENTER_TYPE_ICONS[key].label,
    icon: React.createElement(CENTER_TYPE_ICONS[key].icon, { size: 14 })
  }))
]

interface Props {
  active: string
  onChange: (key: string) => void
}

export default function CenterFilters({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 py-3 px-1 sticky top-16 z-30 bg-black/80 backdrop-blur-xl border-b border-zinc-800/50">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
            active === f.key
              ? 'bg-gold/10 text-gold border-gold/40 shadow-lg shadow-gold/5'
              : 'bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
          }`}
        >
          <span className="shrink-0">{f.icon}</span>
          <span className="sm:inline">{f.label}</span>
        </button>
      ))}
    </div>
  )
}
