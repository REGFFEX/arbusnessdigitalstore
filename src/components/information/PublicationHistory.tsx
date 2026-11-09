import { useInformationStore } from '../../services/information/store'
import { IconHistory, IconShieldCheck, IconX } from '../Icons'
import { EmptyHint, InfoCard, InfoNote } from './parts'

function formatDate(value?: string) {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function PublicationHistory() {
    const { history, publication, restorePublication } = useInformationStore()

    return (
        <InfoCard
            title="Historique des publications"
            subtitle="Chaque import conservé permet de revenir à une publication précédente"
            source="organization"
            icon={<IconHistory size={17} />}
        >
            {history.length === 0 ? (
                <EmptyHint>Aucune publication importée</EmptyHint>
            ) : (
                <ul className="space-y-2">
                    {history.map(record => {
                        const isCurrent = publication?.id === record.id
                        return (
                            <li
                                key={record.id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                                    isCurrent ? 'border-gold/30 bg-gold/5' : 'border-zinc-800 bg-black/30'
                                }`}
                            >
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-black text-white tracking-tight">Publication {record.publication_version}</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                                            record.verified
                                                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                                                : 'text-red-300 bg-red-500/10 border-red-500/25'
                                        }`}>
                                            {record.verified ? <IconShieldCheck size={10} /> : <IconX size={10} />}
                                            {record.verified ? 'Vérifiée' : 'Non vérifiée'}
                                        </span>
                                        {isCurrent && (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gold">Active</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-zinc-500 mt-1">
                                        Publiée le {record.published_at || '—'} · importée le {formatDate(record.imported_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => restorePublication(record.id)}
                                    disabled={isCurrent}
                                    className="shrink-0 px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-200 hover:border-gold/40 disabled:opacity-40"
                                >
                                    Restaurer
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
            <InfoNote>
                Restaurer une publication réapplique uniquement la source Organisation ; les informations Produit
                et Système restent inchangées.
            </InfoNote>
        </InfoCard>
    )
}
