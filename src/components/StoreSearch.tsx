import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface StoreSearchProps {
    onSearch: (term: string) => void
    placeholder?: string
}

export default function StoreSearch({ onSearch, placeholder = "Rechercher une application, un logiciel..." }: StoreSearchProps) {
    const [term, setTerm] = useState('')
    const [history, setHistory] = useState<string[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    // Charger historique au montage
    useEffect(() => {
        const saved = localStorage.getItem('ar_store_search_history')
        if (saved) {
            try {
                setHistory(JSON.parse(saved))
            } catch (e) {
                console.error('Erreur lecture historique', e)
            }
        }
    }, [])

    // Sauvegarder nouvelle recherche
    const saveToHistory = (newTerm: string) => {
        const cleanTerm = newTerm.trim()
        if (!cleanTerm) return

        let newHistory = [cleanTerm, ...history.filter(h => h !== cleanTerm)]
        newHistory = newHistory.slice(0, 8) // Garder les 8 derniers
        setHistory(newHistory)
        localStorage.setItem('ar_store_search_history', JSON.stringify(newHistory))
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
        localStorage.setItem('ar_store_search_history', JSON.stringify(newHistory))
    }

    const clearHistory = () => {
        setHistory([])
        localStorage.removeItem('ar_store_search_history')
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-8 z-30">
            <form onSubmit={handleSubmit} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-gold/20 to-transparent rounded-2xl blur-md transition-opacity ${showHistory ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
                <input
                    ref={inputRef}
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                    // On blur, on attend un peu pour permettre le clic sur l'historique
                    onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-white px-6 py-4 rounded-2xl outline-none focus:border-gold/50 focus:bg-black transition-all shadow-xl pl-12 relative z-10"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-zinc-500">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </span>

                {term && (
                    <button
                        type="button"
                        onClick={() => { setTerm(''); onSearch(''); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white z-20 p-1"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                )}
            </form>

            {/* Dropdown Historique */}
            {showHistory && history.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Recherches récentes</span>
                        <button onMouseDown={clearHistory} className="text-[10px] text-zinc-600 hover:text-red-400 font-bold uppercase tracking-wider cursor-pointer">
                            Effacer tout
                        </button>
                    </div>
                    <ul className="py-1">
                        {history.map((item, i) => (
                            <li key={i}>
                                <button
                                    onMouseDown={() => handleHistoryClick(item)} // onMouseDown fires before onBlur
                                    className="w-full text-left px-4 py-3 hover:bg-zinc-800 flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span className="text-zinc-300 group-hover:text-white text-sm font-medium">{item}</span>
                                    </div>
                                    <div
                                        onMouseDown={(e) => removeHistoryItem(e, item)}
                                        className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Suggestions Rapides (seulement si pas historique ouvert ou vide) */}
            {!showHistory && !term && (
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {['Montage', 'Gestion', '3D', 'Education', 'Jeux'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => { setTerm(tag); onSearch(tag); }}
                            className="px-3 py-1 bg-zinc-900/50 hover:bg-gold/10 border border-zinc-800 hover:border-gold/30 rounded-full text-[10px] text-zinc-400 hover:text-gold transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
