import React, { useState, useEffect, useRef } from 'react'
import { IconBrain, IconX, IconLock, IconTrending } from '../Icons'
import { getSystemContext, askAI, AIContext } from '../../services/ai'

interface Agent {
    id: string
    name: string
    role: string
    color: string
    icon: React.ReactNode
    gender: 'male' | 'female'
    description: string
}

const AGENTS: Agent[] = [
    {
        id: 'queeny',
        name: 'Queeny',
        role: 'Questions',
        color: '#3b82f6',
        icon: <div className="text-[14px] font-black italic select-none">Q</div>,
        gender: 'female',
        description: "Je suis Queeny. Je réponds à toutes vos questions sur le système d'un ton amical et clair."
    },
    {
        id: 'alex',
        name: 'Alex',
        role: 'Actions',
        color: '#10b981',
        icon: <div className="text-[14px] font-black italic select-none">A</div>,
        gender: 'male',
        description: "Salut, je suis Alex. Dites-moi quelle tâche accomplir (impression, commande, etc.) et je m'en occupe."
    },
    {
        id: 'sezard',
        name: 'Sézard',
        role: 'Sécurité',
        color: '#f97316',
        icon: <div className="text-[14px] font-black italic select-none">S</div>,
        gender: 'male',
        description: "Sézard à votre service. Je surveille les stocks et la sécurité pour vous éviter les mauvaises surprises."
    },
    {
        id: 'rayder',
        name: 'Rayder',
        role: 'Premium',
        color: '#94a3b8',
        icon: <div className="text-[12px] font-black italic select-none">Ray</div>,
        gender: 'male',
        description: "Rayder. Je possède toutes les capacités de mes collègues. Accessibilité maximale."
    }
]

export default function AIAgentSystem() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState(5 * 3600)
    const [opacity, setOpacity] = useState(1)
    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
    const [isDragging, setIsDragging] = useState(false)
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([])
    const [inputValue, setInputValue] = useState('')
    const [context, setContext] = useState<AIContext | null>(null)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isTyping, setIsTyping] = useState(false)

    const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
    const dragOffset = useRef({ x: 0, y: 0 })

    // Charger le contexte et l'historique au démarrage
    useEffect(() => {
        getSystemContext().then(setContext)
        const savedMessages = localStorage.getItem('ar_ai_messages')
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages))
            } catch (e) {
                console.error('Erreur chargement historique IA', e)
            }
        }
        const savedAgent = localStorage.getItem('ar_ai_active_agent')
        if (savedAgent) setActiveAgentId(savedAgent)
        const savedOpen = localStorage.getItem('ar_ai_open') === 'true'
        setIsOpen(savedOpen)
    }, [])

    // Sauvegarder l'état
    useEffect(() => {
        localStorage.setItem('ar_ai_messages', JSON.stringify(messages))
        if (activeAgentId) localStorage.setItem('ar_ai_active_agent', activeAgentId)
        localStorage.setItem('ar_ai_open', String(isOpen))
    }, [messages, activeAgentId, isOpen])

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (activeAgentId && messages.length === 0) {
            const agent = AGENTS.find(a => a.id === activeAgentId)
            setMessages([{ role: 'ai', text: agent?.description || "Bonjour !" }])
            setSuggestions([])
        }
    }, [activeAgentId, messages.length])

    useEffect(() => {
        const resetInactivity = () => {
            setOpacity(1)
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current)

            // Ne pas rendre transparent si conversation ouverte ou active
            if (!isOpen && !isDragging) {
                inactivityTimer.current = setTimeout(() => setOpacity(0.35), 4000)
            }
        }

        window.addEventListener('mousemove', resetInactivity)
        window.addEventListener('mousedown', resetInactivity)
        window.addEventListener('keydown', resetInactivity)
        resetInactivity()

        return () => {
            window.removeEventListener('mousemove', resetInactivity)
            window.removeEventListener('mousedown', resetInactivity)
            window.removeEventListener('keydown', resetInactivity)
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
        }
    }, [isOpen, isDragging])

    // Forcer l'opacité à 1 si ouvert
    useEffect(() => {
        if (isOpen) setOpacity(1)
    }, [isOpen])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h}h ${m}m ${s}s`
    }

    const handleSendMessage = async (textOverride?: string) => {
        const text = textOverride || inputValue.trim()
        if (!text || !activeAgentId || !context) return

        setMessages(prev => [...prev, { role: 'user', text }])
        setInputValue('')
        setSuggestions([])
        setIsTyping(true)

        try {
            const response = await askAI(activeAgentId, text, context)

            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'ai', text: response.text }])
                setSuggestions(response.suggestions || [])
                setIsTyping(false)
            }, 600)
        } catch (err) {
            console.error('AI Error:', err)
            setIsTyping(false)
        }
    }

    const handleDragStart = (e: React.MouseEvent) => {
        setIsDragging(true)
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        }
    }

    const handleDragMove = (e: MouseEvent) => {
        if (!isDragging) return
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y
        })
    }

    const handleDragEnd = () => setIsDragging(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const clearHistory = () => {
        if (confirm("Voulez-vous vraiment effacer l'historique de cette conversation ?")) {
            setMessages([])
            setSuggestions([])
            localStorage.removeItem('ar_ai_messages')
        }
    }

    const handleFileAttach = () => {
        alert("La fonction d'analyse de fichiers arrive bientôt. Vous pourrez importer vos APK, PDF ou images pour analyse.")
    }

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove)
            window.addEventListener('mouseup', handleDragEnd)
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove)
            window.removeEventListener('mouseup', handleDragEnd)
        }
    }, [isDragging])

    return (
        <div
            className="fixed z-[9999] transition-opacity duration-700 pointer-events-none"
            style={{
                left: position.x - (isOpen ? 400 : 0),
                top: position.y - (isOpen ? 500 : 0),
                opacity
            }}
        >
            <div className="relative pointer-events-auto">
                {/* ORBE CENTRAL */}
                {!isOpen && (
                    <div
                        onMouseDown={handleDragStart}
                        onDoubleClick={() => setIsOpen(true)}
                        onClick={() => { if (!isDragging) setIsOpen(true) }}
                        className="w-14 h-14 rounded-full cursor-move relative flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50"
                    >
                        <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite]"
                            style={{ background: 'conic-gradient(#3b82f6, #10b981, #f97316, #94a3b8, #3b82f6)' }}></div>
                        <div className="w-10 h-10 bg-white rounded-full shadow-[0_0_20px_white,inset_-2px_-2px_6px_rgba(0,0,0,0.1)] flex items-center justify-center z-10">
                            <div className="w-3 h-3 rounded-full bg-gold/40 animate-pulse blur-[1px]" />
                        </div>
                    </div>
                )}
                {isOpen && (
                    <div
                        onMouseDown={handleDragStart}
                        className="w-10 h-10 rounded-full cursor-move relative flex items-center justify-center transition-all duration-500 z-50 ml-auto mb-2 group shadow-xl hover:scale-110 active:scale-95"
                    >
                        <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite]"
                            style={{ background: 'conic-gradient(#3b82f6, #10b981, #f97316, #94a3b8, #3b82f6)' }}></div>
                        <div className="w-7 h-7 bg-white rounded-full shadow-[0_0_15px_white] flex items-center justify-center z-10">
                            <div className="w-2 h-2 rounded-full bg-gold/40 animate-pulse blur-[1px]" />
                        </div>
                    </div>
                )}

                {/* SYSTÈME DÉPLOYÉ */}
                {isOpen && (
                    <div className="absolute bottom-4 right-4 pointer-events-auto bg-zinc-950/85 backdrop-blur-3xl border border-zinc-800/60 p-6 rounded-[3rem] w-[400px] shadow-2xl animate-in zoom-in-95 duration-300">
                        <div onMouseDown={handleDragStart} className="cursor-move flex items-center justify-between mb-8 group bg-black/20 p-2 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                                    <IconBrain size={16} className="text-gold" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black text-white italic tracking-tighter uppercase">AI Intelligence Zone</h3>
                                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mt-1">{formatTime(timeLeft)} restants</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearHistory}
                                    title="Effacer la conversation"
                                    className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-all"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Réduire"
                                    className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* CHOIX DES AGENTS ... (unchanged) */}
                        <div className="flex justify-around mb-8 p-3 rounded-2xl bg-white/5 border border-white/5">
                            {AGENTS.map(agent => (
                                <button
                                    key={agent.id}
                                    onClick={() => setActiveAgentId(agent.id === activeAgentId ? null : agent.id)}
                                    className={`relative group transition-all duration-500 ${activeAgentId && activeAgentId !== agent.id ? 'opacity-20 scale-90' : 'opacity-100 scale-100'}`}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-700 ${activeAgentId === agent.id ? 'scale-125 ring-2 ring-white shadow-[0_0_30px_white]' : 'hover:scale-110'}`}
                                        style={{
                                            background: `radial-gradient(circle at 35% 35%, ${agent.id === 'rayder' && activeAgentId === 'rayder' ? '#fff' : agent.color}, rgba(0,0,0,0.4))`,
                                            boxShadow: `0 0 20px ${agent.color}80, inset 0 0 10px rgba(255,255,255,0.3)`
                                        }}
                                    >
                                        <div className="text-white drop-shadow-lg font-black">{agent.icon}</div>
                                    </div>
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{agent.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* INTERFACE CONVERSATIONNELLE */}
                        <div className="h-[350px] flex flex-col">
                            {activeAgentId ? (
                                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-3 overflow-hidden">
                                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 pr-1 scroll-smooth">
                                        {messages.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`max-w-[90%] p-4 rounded-[1.8rem] text-[11px] font-medium leading-relaxed ${msg.role === 'ai' ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-white text-black font-black shadow-xl shadow-white/5'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-full flex gap-1 items-center">
                                                    <div className="w-1 h-1 bg-gold rounded-full animate-bounce" />
                                                    <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                                                    <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* SUGGESTIONS DYNAMIQUES */}
                                    {suggestions.length > 0 && !isTyping && (
                                        <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-1 overflow-x-auto no-scrollbar pb-1">
                                            {suggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSendMessage(s)}
                                                    className="whitespace-nowrap px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full text-[9px] font-black text-gold uppercase hover:bg-gold hover:text-black transition-all"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="relative">
                                        <button
                                            onClick={handleFileAttach}
                                            title="Ajouter un fichier"
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-gold transition-colors"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
                                        </button>
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Décrivez votre besoin..."
                                            disabled={isTyping}
                                            className="w-full bg-zinc-900 border border-zinc-800 p-5 pl-12 pr-14 rounded-[2.2rem] text-[11px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-all font-bold disabled:opacity-50"
                                        />
                                        <button
                                            onClick={() => handleSendMessage()}
                                            disabled={isTyping}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                        >
                                            <IconTrending size={16} className="rotate-90" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-30">
                                    <IconBrain size={48} className="text-zinc-700 mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                                        Choisissez une identité pour débloquer l'assistance galactique
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* UPGRADES & SÉCURITÉ */}
                        <div className="mt-8 pt-6 border-t border-zinc-900/60 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <IconLock size={12} className="text-zinc-700" />
                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">Clé Premium : Activer Rayder</span>
                            </div>
                            <div className="flex gap-4">
                                <button className="text-[9px] font-black text-gold/60 uppercase tracking-widest hover:text-gold transition-colors">7H</button>
                                <button className="text-[9px] font-black text-gold/60 uppercase tracking-widest hover:text-gold transition-colors">12H</button>
                                <button className="text-[9px] font-black text-gold uppercase tracking-widest hover:underline">Infinity</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
