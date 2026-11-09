import React from 'react'
import { IconBuilding, IconCheck, IconCopy, IconDownload, IconLock, IconShieldCheck, IconSparkle } from '../Icons'
import { useInformationStore } from '../../services/information/store'
import { InfoCard, InfoInput, InfoNote, InfoTextarea } from './parts'

function today() {
    return new Date().toISOString().slice(0, 10)
}

function currentVersion() {
    const now = new Date()
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function OrganizationPublicationPanel() {
    const { organization, updateOrganization, signingKey, ensureSigningKey, regenerateSigningKey, publishOrganization } =
        useInformationStore()
    const [draft, setDraft] = React.useState({
        publication_version: currentVersion(),
        published_at: today(),
        locale: 'fr',
        publisher: 'AR Business Digital Solutions',
    })
    const [packetJson, setPacketJson] = React.useState('')
    const [busy, setBusy] = React.useState(false)
    const [copied, setCopied] = React.useState(false)
    const [error, setError] = React.useState('')

    const handlePublish = async () => {
        setBusy(true)
        setError('')
        try {
            const json = await publishOrganization(draft)
            setPacketJson(json)
            setCopied(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signature impossible.')
        } finally {
            setBusy(false)
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(packetJson)
        setCopied(true)
    }

    const handleDownload = () => {
        const blob = new Blob([packetJson], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `arbusiness-organization-${draft.publication_version}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-4">
            <InfoCard
                title="Informations officielles à publier"
                subtitle="Source AR Business · ces informations ne modifient jamais les données produit ou système"
                source="organization"
                icon={<IconBuilding />}
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <InfoInput label="Nom de l'organisation" value={organization.name} onChange={value => updateOrganization({ name: value })} />
                    <InfoInput label="Site officiel" value={organization.website} onChange={value => updateOrganization({ website: value })} placeholder="https://" />
                    <InfoInput label="Email officiel" value={organization.email} onChange={value => updateOrganization({ email: value })} />
                    <InfoInput label="Téléphone officiel" value={organization.phone} onChange={value => updateOrganization({ phone: value })} />
                    <InfoInput label="Adresse" value={organization.address} onChange={value => updateOrganization({ address: value })} />
                    <InfoInput label="Équipe centrale" value={organization.team} onChange={value => updateOrganization({ team: value })} />
                </div>
                <div className="mt-3 space-y-3">
                    <InfoTextarea label="Présentation de l'organisation" value={organization.description} onChange={value => updateOrganization({ description: value })} rows={3} />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <InfoInput label="Email d'assistance" value={organization.support.email} onChange={value => updateOrganization({ support: { email: value, phone: organization.support.phone } })} />
                        <InfoInput label="Téléphone d'assistance" value={organization.support.phone} onChange={value => updateOrganization({ support: { email: organization.support.email, phone: value } })} />
                    </div>
                    <InfoTextarea label="Mentions légales" value={organization.legal.information} onChange={value => updateOrganization({ legal: { information: value, privacy_policy: organization.legal.privacy_policy } })} rows={4} />
                    <InfoTextarea label="Politique de confidentialité" value={organization.legal.privacy_policy} onChange={value => updateOrganization({ legal: { information: organization.legal.information, privacy_policy: value } })} rows={4} />
                </div>
                <InfoNote>
                    Laissez vide ce qui n'est pas officiellement établi : l'application affichera « Non renseigné »
                    plutôt qu'une information inventée.
                </InfoNote>
            </InfoCard>

            <InfoCard
                title="Préparer une publication"
                subtitle="Le paquet signé est la seule chose que les autres applications reçoivent"
                source="organization"
                icon={<IconSparkle size={17} />}
            >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-3">
                    <InfoInput label="Version de publication" value={draft.publication_version} onChange={value => setDraft(d => ({ ...d, publication_version: value }))} />
                    <InfoInput type="date" label="Date de publication" value={draft.published_at} onChange={value => setDraft(d => ({ ...d, published_at: value }))} />
                    <InfoInput label="Langue" value={draft.locale} onChange={value => setDraft(d => ({ ...d, locale: value }))} />
                    <InfoInput label="Éditeur" value={draft.publisher} onChange={value => setDraft(d => ({ ...d, publisher: value }))} />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handlePublish}
                        disabled={busy}
                        className="px-4 py-2.5 rounded-xl bg-gold text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 disabled:opacity-40"
                    >
                        {busy ? 'Signature…' : 'Préparer & signer la publication'}
                    </button>
                    {packetJson && (
                        <>
                            <button onClick={handleCopy} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-200 hover:border-zinc-600">
                                {copied ? <IconCheck size={13} /> : <IconCopy size={13} />} {copied ? 'Copié' : 'Copier'}
                            </button>
                            <button onClick={handleDownload} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-200 hover:border-zinc-600">
                                <IconDownload size={13} /> Télécharger
                            </button>
                        </>
                    )}
                </div>

                {error && <p className="mt-3 text-xs text-red-300">{error}</p>}

                {packetJson && (
                    <InfoTextarea
                        label="Paquet institutionnel signé"
                        value={packetJson}
                        onChange={setPacketJson}
                        rows={10}
                        mono
                    />
                )}
            </InfoCard>

            <InfoCard
                title="Clé de signature"
                subtitle="La clé privée reste dans ce navigateur ; les applications importantes n'utilisent que la clé publique."
                source="organization"
                icon={<IconLock size={17} />}
            >
                {signingKey ? (
                    <div className="space-y-3">
                        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-2.5 py-1">
                            <IconShieldCheck size={12} /> Empreinte {signingKey.fingerprint}
                        </p>
                        <details className="rounded-xl border border-zinc-800 bg-black/40 p-3">
                            <summary className="text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-pointer">
                                Clé publique à distribuer
                            </summary>
                            <pre className="mt-2 text-[10px] text-zinc-400 font-mono whitespace-pre-wrap break-all">
                                {JSON.stringify(signingKey.publicKeyJwk, null, 2)}
                            </pre>
                        </details>
                        <button
                            onClick={() => regenerateSigningKey()}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:border-red-500/40"
                        >
                            Renouveler la clé
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-zinc-500">Aucune clé de signature sur ce navigateur.</p>
                        <button
                            onClick={() => ensureSigningKey()}
                            className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-white hover:border-gold/40"
                        >
                            Générer une clé de signature
                        </button>
                    </div>
                )}
            </InfoCard>
        </div>
    )
}


