import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MODULE_GROUPS, isModuleActive } from './navModules'
import { IconSearch, IconX } from '../Icons'

const FAB_SIZE = 56
const STORAGE_POS = 'ar_shell_palette_pos'

interface PalettePosition {
    left: number
    top: number
}

function clampPosition(left: number, top: number): PalettePosition {
    const maxLeft = Math.max(8, window.innerWidth - FAB_SIZE - 8)
    const maxTop = Math.max(8, window.innerHeight - FAB_SIZE - 8)
    return {
        left: Math.min(Math.max(8, left), maxLeft),
        top: Math.min(Math.max(8, top), maxTop),
    }
}

function defaultPosition(): PalettePosition {
    const isMobile = window.innerWidth < 1024
    return clampPosition(
        window.innerWidth - FAB_SIZE - (isMobile ? 16 : 24),
        window.innerHeight - FAB_SIZE - (isMobile ? 104 : 32),
    )
}

// Palette flottante déplaçable — raccourci permanent vers tous les modules.
export default function QuickPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [position, setPosition] = useState<PalettePosition | null>(null)
    const [dragging, setDragging] = useState(false)

    const positionRef = useRef<PalettePosition | null>(null)
    const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, originLeft: 0, originTop: 0 })

    const { pathname } = useLocation()
    const navigate = useNavigate()

    // Position initiale (mémorisée) une fois la fenêtre connue.
    useEffect(() => {
        let next: PalettePosition | null = null
        try {
            const saved = localStorage.getItem(STORAGE_POS)
            if (saved) next = clampPosition(JSON.parse(saved).left, JSON.parse(saved).top)
        } catch {
            next = null
        }
        positionRef.current = next || defaultPosition()
        setPosition(positionRef.current)
    }, [])

    useEffect(() => {
        positionRef.current = position
    }, [position])

    useEffect(() => {
        const onResize = () => {
            if (!positionRef.current) return
            const next = clampPosition(positionRef.current.left, positionRef.current.top)
            positionRef.current = next
            setPosition(next)
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // La barre mobile et la sidebar peuvent ouvrir la palette.
    useEffect(() => {
        const openPalette = () => setOpen(true)
        window.addEventListener('ar:palette', openPalette)
        return () => window.removeEventListener('ar:palette', openPalette)
    }, [])

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open])

    const startDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
        if (!position) return
        e.preventDefault()
        dragRef.current = {
            active: true,
            moved: false,
            startX: e.clientX,
            startY: e.clientY,
            originLeft: position.left,
            originTop: position.top,
        }
        setDragging(true)

        const onMove = (event: PointerEvent) => {
            if (!dragRef.current.active) return
            const dx = event.clientX - dragRef.current.startX
            const dy = event.clientY - dragRef.current.startY
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true
            const next = clampPosition(dragRef.current.originLeft + dx, dragRef.current.originTop + dy)
            positionRef.current = next
            setPosition(next)
        }

        const onUp = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onUp)
            dragRef.current.active = false
            setDragging(false)
            if (dragRef.current.moved && positionRef.current) {
                localStorage.setItem(STORAGE_POS, JSON.stringify(positionRef.current))
            }
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
    }

    const groups = useMemo(() => {
        const term = query.trim().toLowerCase()
        if (!term) return MODULE_GROUPS
        return MODULE_GROUPS
            .map(group => ({
                ...group,
                modules: group.modules.filter(mod =>
                    mod.label.toLowerCase().includes(term) || (mod.hint || '').toLowerCase().includes(term)),
            }))
            .filter(group => group.modules.length > 0)
    }, [query])

    return (
        <>
            {position && (
                <button
                    onPointerDown={startDrag}
                    onClick={() => {
                        // Un glissement ne doit pas ouvrir la palette.
                        if (dragRef.current.moved) {
                            dragRef.current.moved = false
                            return
                        }
                        setOpen(value => !value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setOpen(value => !value)
                        }
                    }}
                    style={{ left: position.left, top: position.top, width: FAB_SIZE, height: FAB_SIZE, touchAction: 'none' }}
                    className={`fixed z-[125] rounded-full border border-gold/30 bg-[#0b0b0e]/80 backdrop-blur-2xl
                        flex items-center justify-center text-gold select-none
                        shadow-[0_16px_40px_-12px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.08)]
                        transition-[transform,box-shadow] duration-200
                        ${dragging ? 'scale-110 cursor-grabbing' : 'cursor-grab hover:scale-105 hover:border-gold/60 hover:shadow-[0_0_24px_rgba(212,175,55,0.25)]'}
                        ${open ? 'ring-2 ring-gold/40' : ''}`}
                    aria-label="Palette des modules"
                    aria-expanded={open}
                >
                    <span className="absolute inset-[3px] rounded-full bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="2" />
                        <rect x="14" y="3" width="7" height="7" rx="2" />
                        <rect x="3" y="14" width="7" height="7" rx="2" />
                        <rect x="14" y="14" width="7" height="7" rx="2" />
                    </svg>
                </button>
            )}

            {open && (
                <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Palette des modules">
                    <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={() => setOpen(false)} />

                    <div className="relative w-full max-w-2xl max-h-[82vh] overflow-y-auto rounded-[30px] border border-white/[0.09] bg-[#0b0b0e]/92 backdrop-blur-2xl p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] animate-slide-up scrollbar-hide">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-gold/70">Raccourci global</p>
                                <h2 className="text-lg font-black text-white leading-tight">Palette des modules</h2>
                                <p className="text-[11px] text-zinc-500">Glissez le bouton doré pour le déplacer.</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                                aria-label="Fermer la palette"
                            >
                                <IconX size={16} />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Filtrer les modules…"
                                className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-4 py-2.5 text-[13px] text-white placeholder-zinc-600 focus:border-gold/50 focus:bg-white/[0.06] outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-4">
                            {groups.map(group => (
                                <div key={group.label}>
                                    <p className="px-1 pb-2 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-600">{group.label}</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {group.modules.map(mod => {
                                            const Icon = mod.icon
                                            const active = isModuleActive(pathname, mod.path)
                                            return (
                                                <button
                                                    key={mod.path}
                                                    onClick={() => {
                                                        navigate(mod.path)
                                                        setOpen(false)
                                                    }}
                                                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition-all duration-200 active:scale-95
                                                        ${active
                                                            ? 'border-gold/50 bg-gold/10 text-gold'
                                                            : 'border-white/[0.07] bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'}`}
                                                >
                                                    <Icon size={20} strokeWidth={active ? 2.4 : 2} className={active ? 'text-gold' : 'text-zinc-400'} />
                                                    <span className="text-[10px] font-bold leading-none text-center">{mod.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}

                            {groups.length === 0 && (
                                <p className="py-8 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-600">
                                    Aucun module trouvé
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
