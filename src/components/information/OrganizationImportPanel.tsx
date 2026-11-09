import React from 'react'
import { IconAlertCircle, IconCheck, IconCloudUpload, IconLock, IconShieldCheck, IconX } from '../Icons'
import { useInformationStore } from '../../services/information/store'
import type { PacketValidation } from '../../services/information/packet'
import { InfoCard, InfoNote, InfoTextarea } from './parts'

export default function OrganizationImportPanel() {
    const { validateImport, importPacket } = useInformationStore()
    const [raw, setRaw] = React.useState('')
    const [validation, setValidation] = React.useState<PacketValidation | null>(null)
    const [approveKey, setApproveKey] = React.useState(false)
    const [busy, setBusy] = React.useState(false)
    const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null)

    const reset = () => {
        setValidation(null)
        setApproveKey(false)
    }

    const handleFile = async (file?: File | null) => {
        if (!file) return
        const text = await file.text()
        setRaw(text)
        reset()
        setMessage(null)
    }

    const handleCheck = async () => {
        setBusy(true)
        setMessage(null)
        try {
            const result = await validateImport(raw)
            setValidation(result)
        } catch (error) {
            setMessage({ ok: false, text: error instanceof Error ? error.message : 'Contrôle impossible.' })
        } finally {
            setBusy(false)
        }
    }

    const handleImport = async () => {
        setBusy(true)
        setMessage(null)
        try {
            const result = await importPacket(raw, approveKey)
            setValidation(result)
            if (result.imported) {
                setMessage({ ok: true, text: 'Publication institutionnelle appliquée. Les informations produit et système sont intactes.' })
                setRaw('')
                setValidation(null)
                setApproveKey(false)
            } else if (result.errors.length > 0) {
                setMessage({ ok: false, text: result.errors[0] })
            } else if (result.fingerprint && !result.keyTrusted) {
                setMessage({ ok: false, text: 'Approuvez la clé de signature pour appliquer cette publication.' })
            }
        } catch (error) {
            setMessage({ ok: false, text: error instanceof Error ? error.message : 'Import impossible.' })
        } finally {
            setBusy(false)
        }
    }

    const canImport = !!validation && validation.errors.length === 0 && validation.signatureValid &&
        (validation.keyTrusted || approveKey)

    return (
        <InfoCard
            title="Importer les informations AR Business"
            subtitle="Collez le paquet institutionnel reçu, ou importez le fichier JSON. Aucune connexion directe n'est établie."
            source="organization"
            icon={<IconCloudUpload size={17} />}
        >
            <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-pointer">
                    <span className="px-3 py-2 rounded-xl bg-zinc-800/70 border border-zinc-700 hover:border-gold/40 transition-colors">
                        Choisir un fichier .json
                    </span>
                    <input
                        type="file"
                        accept="application/json,.json"
                        className="hidden"
                        onChange={event => handleFile(event.target.files?.[0])}
                    />
                </label>

                <InfoTextarea
                    label="Paquet de données"
                    value={raw}
                    onChange={value => { setRaw(value); reset(); setMessage(null) }}
                    rows={7}
                    mono
                    placeholder={'{\n  "package_type": "organization_profile",\n  ...\n}'}
                />

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleCheck}
                        disabled={busy || !raw.trim()}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-[10px] font-black uppercase tracking-widest hover:border-zinc-600 disabled:opacity-40"
                    >
                        Contrôler le paquet
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={busy || !canImport}
                        className="px-4 py-2.5 rounded-xl bg-gold text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 disabled:opacity-40"
                    >
                        Importer la publication
                    </button>
                </div>

                {message && (
                    <div className={`flex items-start gap-2 rounded-2xl px-3.5 py-3 text-xs leading-relaxed border ${
                        message.ok
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                            : 'bg-red-500/10 border-red-500/25 text-red-200'
                    }`}>
                        {message.ok ? <IconCheck size={14} className="mt-0.5 shrink-0" /> : <IconAlertCircle size={14} className="mt-0.5 shrink-0" />}
                        <span>{message.text}</span>
                    </div>
                )}

                {validation && (
                    <div className="space-y-3 rounded-2xl border border-zinc-800 bg-black/40 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                validation.signatureValid
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                                    : 'bg-red-500/10 text-red-300 border-red-500/25'
                            }`}>
                                {validation.signatureValid ? <IconShieldCheck size={11} /> : <IconX size={11} />}
                                {validation.signatureValid ? 'Signature valide' : 'Signature invalide'}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                validation.keyTrusted
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                                    : 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                            }`}>
                                <IconLock size={11} />
                                {validation.keyTrusted ? 'Clé approuvée' : 'Clé non approuvée'}
                            </span>
                            {validation.packet && (
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {validation.packet.publication_version} · {validation.packet.published_at}
                                </span>
                            )}
                        </div>

                        {validation.fingerprint && (
                            <p className="text-[10px] text-zinc-500 font-mono break-all">
                                Empreinte de la clé : {validation.fingerprint}
                            </p>
                        )}

                        {validation.errors.length > 0 && (
                            <ul className="space-y-1">
                                {validation.errors.map(error => (
                                    <li key={error} className="text-xs text-red-300 flex items-start gap-2">
                                        <IconX size={12} className="mt-0.5 shrink-0" /> {error}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {validation.warnings.length > 0 && (
                            <ul className="space-y-1">
                                {validation.warnings.map(warning => (
                                    <li key={warning} className="text-xs text-amber-200 flex items-start gap-2">
                                        <IconAlertCircle size={12} className="mt-0.5 shrink-0" /> {warning}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {!validation.keyTrusted && validation.signatureValid && (
                            <label className="flex items-start gap-2 text-xs text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={approveKey}
                                    onChange={event => setApproveKey(event.target.checked)}
                                    className="mt-0.5 accent-[#d4af37]"
                                />
                                J'approuve cette clé de signature comme source officielle AR Business sur cette application.
                            </label>
                        )}

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600 mb-2">
                                Aperçu des modifications ({validation.changes.length})
                            </p>
                            {validation.changes.length === 0 ? (
                                <p className="text-xs text-zinc-500 italic">Aucun changement par rapport à la publication actuelle.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {validation.changes.map(change => (
                                        <li key={change.field} className="rounded-xl bg-zinc-900/70 border border-zinc-800 px-3 py-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gold">{change.field}</p>
                                            <p className="text-[11px] text-zinc-500 line-through break-words">{change.from || 'Non renseigné'}</p>
                                            <p className="text-[11px] text-zinc-200 break-words">{change.to || 'Non renseigné'}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                <InfoNote>
                    Un import ne touche que la source Organisation. Les informations Produit et Système sont préservées,
                    et une publication sans signature valide est refusée.
                </InfoNote>
            </div>
        </InfoCard>
    )
}
