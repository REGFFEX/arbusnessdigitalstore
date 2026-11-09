import { useState, useEffect } from 'react'
import { getSiteSettings } from '../services/admin'

export interface SiteSettings {
    site_name: string
    site_slogan: string
    logo_url: string
    logo_border_radius: string
    logo_targets: Record<string, boolean>
    ribbon_enabled: boolean
    ribbon_targets: string[]
    ribbon_text_desktop: string
    ribbon_text_mobile: string
    store_titles: Record<string, string>
    site_content: any
    maintenance_mode: boolean
    section_visibility: {
        home_hero: boolean
        home_categories: boolean
        home_sections: boolean
        home_cta: boolean
        footer_sitemap: boolean
        global_search: boolean
        global_ads: boolean
        global_social: boolean
    }
    premium_config: any[]
}

export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings>({
        site_name: 'AR Business',
        site_slogan: 'Votre partenaire digital',
        logo_url: '',
        logo_border_radius: '16px',
        logo_targets: { navbar: true, footer: true, ribbon: false, auth: true },
        ribbon_enabled: true,
        ribbon_targets: ['/', '/store', '/categories', '/services', '/community'],
        ribbon_text_desktop: 'BIENVENUE SUR AR BUSINESS DIGITAL STORE — VOTRE PARTENAIRE EN AFRIQUE',
        ribbon_text_mobile: 'AR BUSINESS STORE — PARTENAIRE DIGITAL',
        store_titles: {
            hero_title: "Découvrez le futur du digital",
            services_title: "Nos Services AR",
            community_title: "Communauté AR Business Digital Store"
        },
        site_content: {},
        maintenance_mode: false,
        section_visibility: {
            home_hero: true,
            home_categories: true,
            home_sections: true,
            home_cta: true,
            footer_sitemap: true,
            global_search: true,
            global_ads: true,
            global_social: true
        },
        premium_config: []
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await getSiteSettings()
                // La config premium vit dans site_settings.site_content
                const premiumData = data?.site_content?.premium_config

                if (data) {
                    setSettings({
                        site_name: data.site_name || 'AR Business',
                        site_slogan: data.site_slogan || 'Votre partenaire digital',
                        logo_url: data.logo_url || '',
                        logo_border_radius: data.logo_border_radius || '16px',
                        logo_targets: data.logo_targets || { navbar: true, footer: true, ribbon: false, auth: true },
                        ribbon_enabled: data.ribbon_enabled ?? true,
                        ribbon_targets: data.ribbon_targets || ['/', '/store', '/categories', '/services', '/community'],
                        ribbon_text_desktop: data.ribbon_text_desktop || 'BIENVENUE SUR AR BUSINESS DIGITAL STORE — VOTRE PARTENAIRE EN AFRIQUE',
                        ribbon_text_mobile: data.ribbon_text_mobile || 'AR BUSINESS STORE — PARTENAIRE DIGITAL',
                        store_titles: data.store_titles || {
                            hero_title: "Découvrez le futur du digital",
                            services_title: "Nos Services AR",
                            community_title: "Communauté AR Business"
                        },
                        site_content: data.site_content || {},
                        maintenance_mode: data.maintenance_mode ?? false,
                        section_visibility: data.section_visibility || {
                            home_hero: true,
                            home_categories: true,
                            home_sections: true,
                            home_cta: true,
                            footer_sitemap: true,
                            global_search: true,
                            global_ads: true,
                            global_social: true
                        },
                        premium_config: Array.isArray(premiumData) ? premiumData : []
                    })
                }
            } catch (err) {
                console.error('Failed to load settings:', err)
            }
        }

        loadSettings()
    }, [])

    return { settings, loading }
}
