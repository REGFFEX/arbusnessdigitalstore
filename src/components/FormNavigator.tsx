import React, { useState, useRef, useEffect } from 'react'
import { IconPackage, IconSettings, IconGlobe, IconDeviceMobile, IconCreditCard, IconGrid, IconMonitor, IconX } from './Icons'

interface Section {
    id: string
    label: string
    icon: React.ReactNode
}

interface FormNavigatorProps {
    sections: Section[]
}

export default function FormNavigator({ sections }: FormNavigatorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 }) // Offset from bottom-right (8, 8)
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef({ x: 0, y: 0 })
    const ballRef = useRef<HTMLDivElement>(null)

    const scrollTo = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const el = document.getElementById(id)
        if (el) {
            const offset = 100 // Navbar offset
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = el.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
            setIsOpen(false)
        }
    }

    // Draggable Logic
    const handlePointerDown = (e: React.PointerEvent) => {
        if (isOpen) return; // Disable drag when menu is open
        setIsDragging(true)
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
        if (ballRef.current) ballRef.current.setPointerCapture(e.pointerId)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return
        const newX = e.clientX - dragStart.current.x
        const newY = e.clientY - dragStart.current.y
        setPosition({ x: newX, y: newY })
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false)
        if (ballRef.current) ballRef.current.releasePointerCapture(e.pointerId)
    }

    return (
        <div
            ref={ballRef}
            className="fixed z-[1000] flex flex-col items-end gap-3 touch-none transition-[transform] duration-75"
            style={{
                bottom: '32px',
                right: '32px',
                transform: `translate(${position.x}px, ${position.y}px)`
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Expanded Menu */}
            {isOpen && (
                <div
                    className="bg-zinc-950/95 backdrop-blur-2xl border border-gold/40 rounded-[40px] p-3 shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in fade-in zoom-in-95 duration-300 min-w-[240px] mb-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-1.5">
                        <div className="px-5 py-4 border-b border-zinc-800/50 mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] italic">AI Navigator</p>
                            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        </div>
                        <div className="max-h-[350px] overflow-y-auto scrollbar-none space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={(e) => scrollTo(section.id, e)}
                                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gold/10 rounded-[24px] transition-all group text-left border border-transparent hover:border-gold/20"
                                >
                                    <div className="text-zinc-600 group-hover:text-gold transition-colors shrink-0">
                                        {section.icon}
                                    </div>
                                    <span className="text-[11px] font-black text-zinc-400 group-hover:text-white uppercase tracking-tighter transition-colors">
                                        {section.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Ball (Toggle) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isDragging) setIsOpen(!isOpen)
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.5)] transition-all duration-500 group relative border-2 ${isOpen ? 'bg-zinc-950 border-gold rotate-90 scale-110 shadow-gold/20' : 'bg-gold border-white/20 hover:scale-105 active:scale-95'}`}
            >
                <div className={`absolute inset-0 rounded-full bg-gold/30 animate-ping pointer-events-none ${isOpen ? 'hidden' : 'block'}`} />
                <div className={`transition-all duration-500 ${isOpen ? 'text-gold' : 'text-black'}`}>
                    {isOpen ? (
                        <IconX size={24} strokeWidth={3} />
                    ) : (
                        <div className="relative">
                            <IconGrid size={28} strokeWidth={2.5} />
                            {/* Decorative Orbit Rings */}
                            <div className="absolute -inset-2 border border-black/10 rounded-full animate-[spin_4s_linear_infinite]" />
                            <div className="absolute -inset-1 border border-black/5 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                        </div>
                    )}
                </div>

                {/* Tooltip */}
                {!isOpen && !isDragging && (
                    <div className="absolute right-full mr-6 bg-zinc-950 text-gold text-[9px] font-black uppercase px-4 py-2 rounded-full border border-gold/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl tracking-widest italic">
                        Glisser pour déplacer
                    </div>
                )}
            </button>
        </div>
    )
}
