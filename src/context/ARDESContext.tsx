import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface ARDESWorkspace {
    id: string
    name: string
    data: {
        name: string
        image?: string
        screenshots?: string[]
        category?: string
        price?: string
        os?: string
    }
    mode: 'mobile' | 'tablet' | 'desktop' | 'custom'
    customSpecs?: {
        id?: string
        width: number
        height: number
        radius: number
        border: number
    }
    rotation: { x: number, y: number }
    isFolded: boolean
    originPath?: string // Pour le bouton "Retour au formulaire"
}

interface ARDESContextType {
    workspaces: ARDESWorkspace[]
    addWorkspace: (workspace: Omit<ARDESWorkspace, 'id' | 'isFolded' | 'rotation'>) => void
    updateWorkspace: (id: string, updates: Partial<ARDESWorkspace>) => void
    removeWorkspace: (id: string) => void
    toggleFolding: (id: string) => void
    toggleAllFolding: (folded: boolean) => void
}

const ARDESContext = createContext<ARDESContextType | undefined>(undefined)

export function ARDESProvider({ children }: { children: ReactNode }) {
    const [workspaces, setWorkspaces] = useState<ARDESWorkspace[]>([])

    const addWorkspace = (ws: Omit<ARDESWorkspace, 'id' | 'isFolded' | 'rotation'>) => {
        const newWs: ARDESWorkspace = {
            ...ws,
            id: Math.random().toString(36).substr(2, 9),
            isFolded: false,
            rotation: { x: 10, y: -20 }
        }
        setWorkspaces(prev => [...prev, newWs])
    }

    const updateWorkspace = (id: string, updates: Partial<ARDESWorkspace>) => {
        setWorkspaces(prev => prev.map(ws => ws.id === id ? { ...ws, ...updates } : ws))
    }

    const removeWorkspace = (id: string) => {
        setWorkspaces(prev => prev.filter(ws => ws.id !== id))
    }

    const toggleFolding = (id: string) => {
        setWorkspaces(prev => prev.map(ws => ws.id === id ? { ...ws, isFolded: !ws.isFolded } : ws))
    }

    const toggleAllFolding = (folded: boolean) => {
        setWorkspaces(prev => prev.map(ws => ({ ...ws, isFolded: folded })))
    }

    return (
        <ARDESContext.Provider value={{ workspaces, addWorkspace, updateWorkspace, removeWorkspace, toggleFolding, toggleAllFolding }}>
            {children}
        </ARDESContext.Provider>
    )
}

export function useARDES() {
    const context = useContext(ARDESContext)
    if (!context) throw new Error('useARDES must be used within an ARDESProvider')
    return context
}
