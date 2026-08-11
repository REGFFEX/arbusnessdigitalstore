import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export interface BrandingMessage {
    id: string
    title: string
    content: string
    active: boolean
    file_url?: string
}

interface BrandingContextType {
    isBrandingOpen: boolean
    setIsBrandingOpen: (open: boolean) => void
    brandingData: {
        name: string
        description: string
        location: string
        autoScroll: boolean
        messages: BrandingMessage[]
    }
    refreshBranding: () => Promise<void>
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [isBrandingOpen, setIsBrandingOpen] = useState(false)
    const [brandingData, setBrandingData] = useState({
        name: 'AR BUSINESS DIGITAL STORE',
        description: 'Pôle de AR BUSINESS spécialisé dans la distribution et la vente de produits et services digitaux.',
        location: 'Afrique, Congo-Brazzaville, Académie Militaire Marien NGOUABI',
        autoScroll: true,
        messages: [] as BrandingMessage[]
    })

    const refreshBranding = async () => {
        try {
            const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'current').single()
            const { data: messages } = await supabase.from('branding_messages').select('*').order('created_at', { ascending: true })

            if (settings) {
                setBrandingData(prev => ({
                    ...prev,
                    name: settings.branding_name || prev.name,
                    description: settings.branding_description || prev.description,
                    location: settings.branding_location || prev.location,
                    autoScroll: settings.branding_autoscroll ?? prev.autoScroll,
                    messages: messages || []
                }))
            } else {
                setBrandingData(prev => ({ ...prev, messages: messages || [] }))
            }
        } catch (err) {
            console.error('Error loading branding:', err)
        }
    }

    useEffect(() => {
        refreshBranding()
    }, [])

    return (
        <BrandingContext.Provider value={{ isBrandingOpen, setIsBrandingOpen, brandingData, refreshBranding }}>
            {children}
        </BrandingContext.Provider>
    )
}

export const useBranding = () => {
    const context = useContext(BrandingContext)
    if (!context) throw new Error('useBranding must be used within BrandingProvider')
    return context
}
