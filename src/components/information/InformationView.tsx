import React from 'react'
import { IconBuilding, IconGlobe, IconInfoCircle, IconPackage, IconSettings, IconShieldCheck, IconUsers, IconHistory } from '../Icons'
import type { OrganizationInfo, ProductInfo, PublicationRecord } from '../../services/information/types'
import type { SystemInfo } from '../../services/information/system'
import { EmptyHint, InfoCard, InfoNote, InfoRow } from './parts'

type Tab = 'about' | 'support' | 'legal' | 'versions'

const TABS: { id: Tab; label: string }[] = [
    { id: 'about', label: 'À propos' },
    { id: 'support', label: 'Support' },
    { id: 'legal', label: 'Informations légales' },
    { id: 'versions', label: 'Versions' },
]

function formatDate(value?: string) {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function lines(value?: string) {
    return (value || '').split('\n').map(line => line.trim()).filter(Boolean)
}

export default function InformationView({
    organization,
    product,
    system,
    publication,
    compact = false,
}: {
    organization: OrganizationInfo
    product: ProductInfo
    system: SystemInfo
    publication: PublicationRecord | null
    compact?: boolean
}) {
    const [tab, setTab] = React.useState<Tab>('about')
    const features = lines(product.features)

    return (
        <div className="space-y-5">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {TABS.map(entry => (
                    <button
                        key={entry.id}
                        onClick={() => setTab(entry.id)}
                        className={`shrink-0 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            tab === entry.id
                                ? 'bg-gold text-black border-gold'
                                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                        }`}
                    >
                        {entry.label}
                    </button>
                ))}
            </div>

            {tab === 'about' && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <InfoCard
                        title={organization.name || "Organisation éditrice"}
                        subtitle="Identité institutionnelle importée depuis AR Business"
                        source="organization"
                        icon={<IconBuilding size={17} />}
                    >
                        <InfoRow label="Présentation" value={organization.description} />
                        <InfoRow label="Site officiel" value={organization.website} href={organization.website} />
                        <InfoRow label="Équipe centrale" value={organization.team} />
                        {publication ? (
                            <InfoNote>
                                Publication {publication.publication_version} du {formatDate(publication.published_at)} ·
                                {' '}{publication.verified ? 'signature vérifiée' : 'origine non vérifiée'}.
                            </InfoNote>
                        ) : (
                            <InfoNote>
                                Aucune publication institutionnelle importée : les informations non renseignées restent
                                signalées comme telles.
                            </InfoNote>
                        )}
                    </InfoCard>

                    <InfoCard
                        title={product.name || 'Produit'}
                        subtitle="Identité propre à cette application"
                        source="product"
                        icon={<IconPackage size={17} />}
                    >
                        <InfoRow label="Présentation" value={product.description} />
                        <InfoRow label="Responsable du produit" value={product.owner} />
                        <InfoRow label="Équipe produit" value={product.team} />
                        <InfoRow label="Plateformes" value={product.platforms} />
                        <InfoRow label="Langues" value={product.languages} />
                        {features.length > 0 && (
                            <div className="pt-3">
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600 mb-2">
                                    Fonctionnalités principales
                                </p>
                                <ul className="space-y-1.5">
                                    {features.map(feature => (
                                        <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-gold shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </InfoCard>
                </div>
            )}

            {tab === 'support' && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <InfoCard
                        title="Assistance de l'éditeur"
                        subtitle="Coordonnées officielles AR Business"
                        source="organization"
                        icon={<IconGlobe size={17} />}
                    >
                        <InfoRow label="Email d'assistance" value={organization.support.email} href={organization.support.email ? `mailto:${organization.support.email}` : undefined} />
                        <InfoRow label="Téléphone d'assistance" value={organization.support.phone} />
                        <InfoRow label="Contact général" value={organization.email} href={organization.email ? `mailto:${organization.email}` : undefined} />
                        <InfoRow label="Téléphone" value={organization.phone} />
                    </InfoCard>

                    <InfoCard
                        title="Support du produit"
                        subtitle="Contacts propres à cette application"
                        source="product"
                        icon={<IconInfoCircle size={17} />}
                    >
                        <InfoRow label="Contacts" value={product.contacts} />
                        <InfoRow label="Assistance" value={product.support} />
                        <InfoRow label="Documentation" value={product.documentation} href={product.documentation} />
                        <InfoRow label="Site du produit" value={product.website} href={product.website} />
                    </InfoCard>
                </div>
            )}

            {tab === 'legal' && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <InfoCard
                        title="Mentions légales & confidentialité"
                        subtitle="Publiées par l'organisation éditrice"
                        source="organization"
                        icon={<IconShieldCheck size={17} />}
                    >
                        <InfoRow label="Éditeur" value={organization.name} />
                        <InfoRow label="Adresse" value={organization.address} />
                        <InfoRow label="Mentions légales" value={organization.legal.information} />
                        <InfoRow label="Politique de confidentialité" value={organization.legal.privacy_policy} />
                    </InfoCard>

                    <InfoCard
                        title="Conditions d'utilisation du produit"
                        subtitle="Propres à cette application"
                        source="product"
                        icon={<IconUsers size={17} />}
                    >
                        <InfoRow label="Conditions d'utilisation" value={product.terms} />
                        {!compact && (
                            <InfoNote>
                                Les conditions du produit ne sont jamais remplacées par un import institutionnel.
                            </InfoNote>
                        )}
                    </InfoCard>
                </div>
            )}

            {tab === 'versions' && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <InfoCard
                        title="Version installée"
                        subtitle="Détectée par l'application, non modifiable à la main"
                        source="system"
                        icon={<IconSettings size={17} />}
                    >
                        <InfoRow label="Version" value={system.version} />
                        <InfoRow label="Build" value={system.build} />
                        <InfoRow label="Date de compilation" value={formatDate(system.build_date)} />
                        <InfoRow label="Environnement" value={system.environment} />
                        <InfoRow label="Exécution" value={system.runtime} />
                    </InfoCard>

                    <InfoCard
                        title="Synchronisation & compatibilité"
                        subtitle="État technique local"
                        source="system"
                        icon={<IconHistory size={17} />}
                    >
                        <InfoRow label="Publication institutionnelle" value={system.sync_state} />
                        <InfoRow label="Compatibilité" value={system.compatibility} />
                        <InfoRow label="Réseau" value={system.network} />
                        {system.diagnostics.map(item => (
                            <InfoRow key={item.label} label={item.label} value={item.value} />
                        ))}
                    </InfoCard>

                    <div className="lg:col-span-2">
                        <InfoCard title="Historique des opérations" source="system" icon={<IconHistory size={17} />}>
                            {system.operations.length > 0 ? (
                                <ul className="space-y-2">
                                    {system.operations.map(operation => (
                                        <li key={operation.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-zinc-800/60 pb-2 last:border-0">
                                            <span className="text-sm text-zinc-300">{operation.action}</span>
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                                                {new Date(operation.at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyHint>Aucune opération enregistrée</EmptyHint>
                            )}
                        </InfoCard>
                    </div>
                </div>
            )}
        </div>
    )
}
