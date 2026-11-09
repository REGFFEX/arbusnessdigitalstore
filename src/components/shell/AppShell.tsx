import React, { useEffect, useState } from 'react'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'
import MobileTabBar from './MobileTabBar'
import Footer from '../Footer'
import AnnouncementRibbon from '../AnnouncementRibbon'

interface AppShellProps {
    settings?: any
    user?: { email?: string | null } | null
    adminData?: { display_name?: string; avatar_url?: string; role?: string } | null
    isAdmin?: boolean
    children: React.ReactNode
}

const SIDEBAR_KEY = 'ar_shell_sidebar'

// Coquille globale des pages publiques : sidebar pliable + en-tête + nav flottante.
export default function AppShell({ settings, user, adminData, isAdmin, children }: AppShellProps) {
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem(SIDEBAR_KEY) === 'reduced'
        } catch {
            return false
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_KEY, collapsed ? 'reduced' : 'open')
        } catch {
            /* stockage indisponible : on garde l'état en mémoire */
        }
    }, [collapsed])

    return (
        <div className="min-h-screen bg-black text-white">
            <AppSidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(value => !value)}
                siteName={settings?.site_name}
                siteSlogan={settings?.site_slogan}
                logoUrl={settings?.logo_url}
                logoRadius={settings?.logo_border_radius}
            />

            <div
                className={`flex min-h-screen flex-col w-full max-w-full overflow-x-clip transition-[padding-left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[268px]'}`}
            >
                <AnnouncementRibbon />
                <AppHeader
                    user={user}
                    adminData={adminData}
                    isAdmin={isAdmin}
                    searchEnabled={settings?.section_visibility?.global_search !== false}
                />
                <main className="flex-1 min-w-0">{children}</main>
                {/* Marge basse pour la barre flottante mobile */}
                <div className="pb-[104px] lg:pb-0">
                    <Footer />
                </div>
            </div>

            <MobileTabBar />
        </div>
    )
}
