import React, { createContext, useContext, useState, useEffect } from 'react'
import { getAds } from '../services/products'
import { Ad } from '../types/database'

interface AdsContextType {
    ads: Ad[]
    loading: boolean
    showAd: (type: 'video' | 'banner' | 'reward', callback?: () => void) => void
    currentAd: Ad | null
    closeAd: () => void
    isAdVisible: boolean
    isItemUnlocked: (id: string) => boolean
    unlockItem: (id: string) => void
}

const AdsContext = createContext<AdsContextType | undefined>(undefined)

export function AdsProvider({ children }: { children: React.ReactNode }) {
    const [ads, setAds] = useState<Ad[]>([])
    const [loading, setLoading] = useState(true)
    const [currentAd, setCurrentAd] = useState<Ad | null>(null)
    const [isAdVisible, setIsAdVisible] = useState(false)
    const [onAdComplete, setOnAdComplete] = useState<(() => void) | null>(null)
    const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
        const saved = localStorage.getItem('ar_unlocked_items')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        getAds('billboard')
            .then(data => setAds(data as Ad[]))
            .finally(() => setLoading(false))
    }, [])

    const showAd = (type: 'video' | 'banner' | 'reward', callback?: () => void) => {
        // VÉRIFICATION PREMIUM : Les niveaux 2 (Elite) et 3 (Ultimate) n'ont pas de pubs
        const userLevel = parseInt(localStorage.getItem('ar_user_premium_level') || '0')
        if (userLevel >= 2) {
            console.log("Premium User Detected (Level " + userLevel + "). Bypassing Ad.")
            if (callback) callback()
            return
        }

        const availableAds = ads.filter(a => a.active && (type === 'reward' ? a.type === 'reward' : a.type === type || a.type === 'video'))

        if (availableAds.length > 0) {
            // Smart Rotation logic...
            const sortedAds = [...availableAds].sort((a, b) => {
                const pA = a.priority || 0
                const pB = b.priority || 0
                if (pB !== pA) return pB - pA
                if (a.revenue_type === 'internal' && b.revenue_type !== 'internal') return -1
                if (a.revenue_type !== 'internal' && b.revenue_type === 'internal') return 1
                return 0
            })

            const topN = sortedAds.slice(0, 3)
            const randomAd = topN[Math.floor(Math.random() * topN.length)]

            setCurrentAd(randomAd)
            setIsAdVisible(true)
            if (callback) setOnAdComplete(() => callback)
        } else {
            // SÉCURITÉ : Ne pas appeler le callback immédiatement si c'est une récompense
            if (type !== 'reward' && callback) {
                callback()
            } else {
                console.warn("No ads available for reward. Fallback needed.")
            }
        }
    }

    const closeAd = () => {
        setIsAdVisible(false)
        setCurrentAd(null)
        if (onAdComplete) {
            onAdComplete()
            setOnAdComplete(null)
        }
    }

    const isItemUnlocked = (id: string) => unlockedItems.includes(id)

    const unlockItem = (id: string) => {
        if (!unlockedItems.includes(id)) {
            const newUnlocked = [...unlockedItems, id]
            setUnlockedItems(newUnlocked)
            localStorage.setItem('ar_unlocked_items', JSON.stringify(newUnlocked))
        }
    }

    return (
        <AdsContext.Provider value={{ ads, loading, showAd, currentAd, closeAd, isAdVisible, isItemUnlocked, unlockItem }}>
            {children}
        </AdsContext.Provider>
    )
}

export const useAds = () => {
    const context = useContext(AdsContext)
    if (!context) throw new Error('useAds must be used within an AdsProvider')
    return context
}
