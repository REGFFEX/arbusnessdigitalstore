import React from 'react'
import { useInformationStore } from '../../services/information/store'
import { getSystemInfo } from '../../services/information/system'
import OrganizationPublicationPanel from '../../components/information/OrganizationPublicationPanel'
import OrganizationImportPanel from '../../components/information/OrganizationImportPanel'
import ProductInfoEditor from '../../components/information/ProductInfoEditor'
import SystemInfoPanel from '../../components/information/SystemInfoPanel'
import PublicationHistory from '../../components/information/PublicationHistory'
import InformationView from '../../components/information/InformationView'
import { IconEye, IconGlobe, IconPackage, IconSettings } from '../../components/Icons'

type Tab = 'organization' | 'product' | 'system' | 'preview'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'organization', label: 'Organisation', icon: <IconGlobe size={14} /> },
    { id: 'product', label: 'Produit', icon: <IconPackage size={14} /> },
    { id: 'system', label: 'Système', icon: <IconSettings size={14} /> },
    { id: 'preview', label: 'Aperçu public', icon: <IconEye size={14} /> },
]

export default function ProductInformation() {
    const { organization, product, publication, operations } = useInformationStore()
    const [tab, setTab] = React.useState<Tab>('organization')
    const system = getSystemInfo(publication, operations)

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gold uppercase italic tracking-tighter">
                        Centre <span className="text-white">d'informations</span>
                    </h2>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                        Organisation · Produit · Système
                    </p>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2">
                    {publication
                        ? `Publication ${publication.publication_version} · ${publication.verified ? 'vérifiée' : 'non vérifiée'}`
                        : 'Aucune publication importée'}
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {TABS.map(entry => (
                    <button
                        key={entry.id}
                        onClick={() => setTab(entry.id)}
                        className={`inline-flex items-center gap-2 shrink-0 px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            tab === entry.id
                                ? 'bg-gold text-black border-gold'
                                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                        }`}
                    >
                        {entry.icon}
                        {entry.label}
                    </button>
                ))}
            </div>

            {tab === 'organization' && (
                <div className="space-y-4">
                    <OrganizationImportPanel />
                    <PublicationHistory />
                    <OrganizationPublicationPanel />
                </div>
            )}

            {tab === 'product' && <ProductInfoEditor />}

            {tab === 'system' && <SystemInfoPanel />}

            {tab === 'preview' && (
                <InformationView
                    organization={organization}
                    product={product}
                    system={system}
                    publication={publication}
                    compact
                />
            )}
        </div>
    )
}
