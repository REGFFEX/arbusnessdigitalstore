import React from 'react'

interface BadgeProps {
    type: 'license' | 'os' | 'status'
    value: string
    className?: string
}

export default function Badge({ type, value, className = '' }: BadgeProps) {
    const getStyles = () => {
        if (type === 'license') {
            switch (value.toLowerCase()) {
                case 'free':
                    return 'bg-zinc-700 text-gray-300'
                case 'freemium':
                    return 'bg-gold/20 text-gold border border-gold/50'
                case 'premium':
                    return 'bg-gold text-black animate-glow'
                default:
                    return 'bg-zinc-700 text-gray-300'
            }
        }

        if (type === 'os') {
            return 'bg-zinc-800 text-gray-300 border border-zinc-700'
        }

        if (type === 'status') {
            switch (value.toLowerCase()) {
                case 'new':
                    return 'bg-green-600/20 text-green-400 border border-green-600/50'
                case 'beta':
                    return 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                case 'stable':
                    return 'bg-zinc-700 text-gray-300'
                default:
                    return 'bg-zinc-700 text-gray-300'
            }
        }

        return 'bg-zinc-700 text-gray-300'
    }

    return (
        <span className={`badge ${getStyles()} ${className}`}>
            {value}
        </span>
    )
}
