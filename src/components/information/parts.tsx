import React from 'react'
import { IconGlobe, IconPackage, IconSettings, IconShieldCheck } from '../Icons'

export function SourceBadge({ source }: { source: 'organization' | 'product' | 'system' }) {
    const map = {
        organization: { label: 'Source AR Business', className: 'bg-gold/10 text-gold border-gold/25', Icon: IconGlobe },
        product: { label: 'Source Produit', className: 'bg-blue-500/10 text-blue-300 border-blue-500/25', Icon: IconPackage },
        system: { label: 'Source Système', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25', Icon: IconSettings },
    }[source]
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${map.className}`}>
            <map.Icon size={11} strokeWidth={2.5} />
            {map.label}
        </span>
    )
}

export function InfoCard({
    title,
    subtitle,
    source,
    children,
    icon,
}: {
    title: string
    subtitle?: string
    source?: 'organization' | 'product' | 'system'
    children: React.ReactNode
    icon?: React.ReactNode
}) {
    return (
        <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="flex items-start gap-3 min-w-0">
                    {icon && (
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-gold">
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="font-black text-white tracking-tight text-base sm:text-lg leading-tight">{title}</h3>
                        {subtitle && <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{subtitle}</p>}
                    </div>
                </div>
                {source && <SourceBadge source={source} />}
            </div>
            {children}
        </section>
    )
}

export function InfoRow({ label, value, href }: { label: string; value?: string; href?: string }) {
    const filled = !!value && value.trim().length > 0
    return (
        <div className="flex flex-col gap-1 py-2.5 border-b border-zinc-800/60 last:border-0">
            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600">{label}</span>
            {filled ? (
                href ? (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold hover:underline break-words"
                    >
                        {value}
                    </a>
                ) : (
                    <span className="text-sm text-zinc-300 whitespace-pre-line break-words leading-relaxed">{value}</span>
                )
            ) : (
                <span className="text-xs text-zinc-600 italic">Non renseigné</span>
            )}
        </div>
    )
}

export function InfoNote({ children }: { children: React.ReactNode }) {
    return (
        <p className="flex items-start gap-2 text-[11px] text-zinc-500 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-3.5 py-2.5 leading-relaxed">
            <IconShieldCheck size={13} className="text-zinc-600 mt-0.5 shrink-0" strokeWidth={2.5} />
            <span>{children}</span>
        </p>
    )
}

const inputClass =
    'w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-gold/50 transition-colors'

export function InfoInput({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
}) {
    return (
        <label className="block">
            <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600 mb-1.5">{label}</span>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={event => onChange(event.target.value)}
                className={inputClass}
            />
        </label>
    )
}

export function InfoTextarea({
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
    mono = false,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    mono?: boolean
}) {
    return (
        <label className="block">
            <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600 mb-1.5">{label}</span>
            <textarea
                value={value}
                rows={rows}
                placeholder={placeholder}
                onChange={event => onChange(event.target.value)}
                className={`${inputClass} resize-y ${mono ? 'font-mono text-[11px] leading-relaxed' : ''}`}
            />
        </label>
    )
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
    return (
        <div className="py-8 text-center border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{children}</p>
        </div>
    )
}
