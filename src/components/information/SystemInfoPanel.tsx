import { useInformationStore } from '../../services/information/store'
import { getSystemInfo } from '../../services/information/system'
import { InfoCard, InfoNote, InfoRow } from './parts'
import { IconSettings } from '../Icons'

function formatDate(value?: string) {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SystemInfoPanel() {
    const { publication, operations } = useInformationStore()
    const system = getSystemInfo(publication, operations)

    return (
        <div className="space-y-4">
            <InfoCard
                title="Informations techniques"
                subtitle="Détectées par l'application · non modifiables à la main"
                source="system"
                icon={<IconSettings size={17} />}
            >
                <div className="grid gap-x-6 sm:grid-cols-2">
                    <InfoRow label="Version installée" value={system.version} />
                    <InfoRow label="Build" value={system.build} />
                    <InfoRow label="Date de compilation" value={formatDate(system.build_date)} />
                    <InfoRow label="Environnement" value={system.environment} />
                    <InfoRow label="Exécution" value={system.runtime} />
                    <InfoRow label="Langue" value={system.language} />
                    <InfoRow label="Réseau" value={system.network} />
                    <InfoRow label="Compatibilité" value={system.compatibility} />
                    <InfoRow label="Synchronisation" value={system.sync_state} />
                    {system.diagnostics.map(item => (
                        <InfoRow key={item.label} label={item.label} value={item.value} />
                    ))}
                </div>
                <InfoNote>
                    La version installée est détectée par le système : elle ne peut pas être saisie comme un champ libre.
                </InfoNote>
            </InfoCard>

            <InfoCard
                title="Historique des opérations"
                subtitle="Imports, publications et restaurations de cette application"
                source="system"
                icon={<IconSettings size={17} />}
            >
                {operations.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">Aucune opération enregistrée.</p>
                ) : (
                    <ul className="space-y-2">
                        {operations.map(operation => (
                            <li key={operation.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-zinc-800/60 pb-2 last:border-0">
                                <div>
                                    <p className="text-sm text-zinc-200">{operation.action}</p>
                                    <p className="text-[11px] text-zinc-500">{operation.detail}</p>
                                </div>
                                <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider whitespace-nowrap">
                                    {formatDate(operation.at)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </InfoCard>
        </div>
    )
}
