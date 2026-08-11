import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconX, IconCopy, IconSelectAll, IconBrain, IconCheck } from './Icons'

interface SmartSearchProps {
    onSearch: (term: string) => void
    hasResults?: boolean
    onReset?: () => void
    placeholder?: string
    context?: string // Clé pour séparer les historiques (ex: 'products', 'services', 'global')
    defaultSuggestions?: string[]
    onFocusChange?: (focused: boolean) => void
}

export default function SmartSearch({
    onSearch,
    hasResults = true,
    onReset,
    placeholder = "Rechercher...",
    context = 'global',
    defaultSuggestions = [],
    onFocusChange
}: SmartSearchProps) {
    const [term, setTerm] = useState('')
    const [history, setHistory] = useState<string[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [isSmartMode, setIsSmartMode] = useState<boolean>(() => {
        return localStorage.getItem('ar_search_smart_mode') === 'true'
    })
    const [copied, setCopied] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const HISTORY_KEY = `ar_smart_search_${context}`

    // Charger historique
    useEffect(() => {
        const saved = localStorage.getItem(HISTORY_KEY)
        if (saved) {
            try {
                setHistory(JSON.parse(saved))
            } catch (e) {
                console.error('Erreur lecture historique', e)
            }
        }
    }, [HISTORY_KEY])

    // Sauvegarder
    const saveToHistory = (newTerm: string) => {
        const cleanTerm = newTerm.trim()
        if (!cleanTerm) return

        let newHistory = [cleanTerm, ...history.filter(h => h !== cleanTerm)]
        newHistory = newHistory.slice(0, 8)
        setHistory(newHistory)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (term.trim()) {
            saveToHistory(term)
            onSearch(term)
            setShowHistory(false)
            inputRef.current?.blur()
        }
    }

    const handleHistoryClick = (val: string) => {
        setTerm(val)
        onSearch(val)
        saveToHistory(val)
        setShowHistory(false)
    }

    const removeHistoryItem = (e: React.MouseEvent, val: string) => {
        e.stopPropagation()
        const newHistory = history.filter(h => h !== val)
        setHistory(newHistory)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    }

    const clearHistory = () => {
        setHistory([])
        localStorage.removeItem(HISTORY_KEY)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(term)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSelectAll = () => {
        inputRef.current?.select()
    }

    const toggleSmartMode = () => {
        const next = !isSmartMode
        setIsSmartMode(next)
        localStorage.setItem('ar_search_smart_mode', String(next))
    }

    // Fonction pour mettre en surbrillance les caractères
    const highlightMatch = (text: string, query: string) => {
        if (!query || !isSmartMode) return text
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="text-gold font-black drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">{part}</span>
                : part
        )
    }

    // --- FUZZY MATCH LOGIC ("Did you mean?") ---
    const getLevenshteinDistance = (a: string, b: string) => {
        const matrix = []
        for (let i = 0; i <= b.length; i++) matrix[i] = [i]
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
                else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1))
            }
        }
        return matrix[b.length][a.length]
    }

    const getSuggestion = (input: string) => {
        if (!input || input.length < 3) return null
        const dictionary = [
            'Application', 'Logiciel', 'Jeu', 'Formation', 'Outil', 'Ressource', 'Service',
            'Template', 'Admin', 'Dashboard', 'Mobile', 'Python', 'React', 'Javascript',
            'Ecommerce', 'Marketing', 'Design', 'Gestion', 'Stock', 'Premium'
        ]

        let bestMatch = null
        let minDistance = 3 // Threshold for fuzzy match

        for (const word of dictionary) {
            const distance = getLevenshteinDistance(input.toLowerCase(), word.toLowerCase())
            if (distance > 0 && distance < minDistance) {
                minDistance = distance
                bestMatch = word
            }
        }
        return bestMatch
    }

    const suggestion = !hasResults ? getSuggestion(term) : null

    return (
        <div className="relative w-full z-30">
            <form onSubmit={handleSubmit} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-xl blur-md transition-opacity ${showHistory ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                <input
                    ref={inputRef}
                    type="text"
                    value={term}
                    onChange={(e) => {
                        setTerm(e.target.value)
                        if (!e.target.value) onSearch('')
                    }}
                    onFocus={() => { setShowHistory(true); onFocusChange?.(true); }}
                    onBlur={() => {
                        setTimeout(() => {
                            setShowHistory(false);
                            onFocusChange?.(false);
                        }, 200);
                    }}
                    placeholder={isSmartMode ? "Recherche Intelligente..." : placeholder}
                    className={`w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-white px-5 py-3 rounded-xl outline-none focus:bg-black transition-all pl-10 pr-12 sm:pr-32 text-sm font-medium relative z-10 ${isSmartMode ? 'focus:border-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'focus:border-zinc-700'}`}
                />

                {/* Icône Search / Brain */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 z-20 transition-all duration-500">
                    {isSmartMode ? (
                        <IconBrain size={18} className="text-gold animate-pulse" />
                    ) : (
                        <IconSearch size={16} className="text-zinc-500" />
                    )}
                </span>

                {/* Boutons d'action contextuels */}
                {term && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-20 animate-in fade-in zoom-in duration-300">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            title="Tout sélectionner"
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                        >
                            <IconSelectAll size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={handleCopy}
                            title="Copier"
                            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                        >
                            {copied ? <IconCheck size={14} className="text-green-500" /> : <IconCopy size={14} />}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setTerm(''); onSearch(''); }}
                            title="Effacer"
                            className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-red-900/30 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                            <IconX size={14} strokeWidth={2.5} />
                        </button>
                        <div className="w-px h-4 bg-zinc-800 mx-1" />
                    </div>
                )}

                {/* Bouton Toggle Smart Mode */}
                <button
                    type="button"
                    onClick={toggleSmartMode}
                    className={`absolute ${term ? 'right-2' : 'right-3'} top-1/2 -translate-y-1/2 z-20 p-2 rounded-xl transition-all ${isSmartMode ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-zinc-800 text-zinc-500 border border-transparent hover:text-white'}`}
                    title={isSmartMode ? "Mode Intelligent Actif" : "Passer en Recherche Intelligente"}
                >
                    <IconBrain size={14} />
                </button>
            </form>

            {!hasResults && term && (
                <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col gap-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-bold uppercase">Aucun résultat trouvé pour "{term}"</span>
                        <button
                            onClick={() => { setTerm(''); onSearch(''); onReset?.(); }}
                            className="text-[10px] font-black text-gold border border-gold/30 px-3 py-1.5 rounded-lg uppercase hover:bg-gold hover:text-black transition-all"
                        >
                            Reset
                        </button>
                    </div>
                    {suggestion && (
                        <p className="text-xs text-zinc-400">
                            Vouliez-vous dire : <button
                                type="button"
                                onClick={() => { setTerm(suggestion); onSearch(suggestion); saveToHistory(suggestion); }}
                                className="text-gold font-black hover:underline underline-offset-4"
                            >
                                {suggestion}
                            </button> ?
                        </p>
                    )}
                </div>
            )}

            {/* Dropdown Historique / Suggestions */}
            {showHistory && (history.length > 0 || defaultSuggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">

                    {history.length > 0 && (
                        <>
                            <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-zinc-800">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Récent</span>
                                <button onMouseDown={clearHistory} className="text-[10px] text-zinc-600 hover:text-red-400 font-bold uppercase tracking-wider cursor-pointer">
                                    Effacer
                                </button>
                            </div>
                            <ul className="py-1">
                                {history.map((item, i) => (
                                    <li key={i}>
                                        <button
                                            onMouseDown={() => handleHistoryClick(item)}
                                            className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                <span className="text-zinc-300 group-hover:text-white text-sm">
                                                    {highlightMatch(item, term)}
                                                </span>
                                            </div>
                                            <div
                                                onMouseDown={(e) => removeHistoryItem(e, item)}
                                                className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                            >
                                                <IconX size={12} strokeWidth={3} />
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {/* Suggestions par défaut si historique vide ou court */}
                    {history.length < 3 && defaultSuggestions.length > 0 && (
                        <div className="p-2 border-t border-zinc-800 bg-black/20">
                            <p className="px-2 text-[10px] font-bold text-zinc-600 uppercase mb-2">Suggestions</p>
                            <div className="flex flex-wrap gap-2 px-2 pb-2">
                                {defaultSuggestions.map(tag => (
                                    <button
                                        key={tag}
                                        onMouseDown={() => handleHistoryClick(tag)}
                                        className="px-3 py-1 bg-zinc-800 hover:bg-gold/10 border border-zinc-700 hover:border-gold/30 rounded-lg text-xs text-zinc-400 hover:text-gold transition-all"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
