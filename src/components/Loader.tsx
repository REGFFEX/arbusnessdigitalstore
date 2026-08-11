import React from 'react'

interface LoaderProps {
    type?: 'card' | 'grid' | 'text'
    count?: number
}

export default function Loader({ type = 'card', count = 1 }: LoaderProps) {
    if (type === 'card') {
        return (
            <>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-zinc-900 rounded-xl p-4 animate-pulse">
                        <div className="bg-zinc-800 h-40 rounded-lg mb-3"></div>
                        <div className="bg-zinc-800 h-4 rounded w-3/4 mb-2"></div>
                        <div className="bg-zinc-800 h-3 rounded w-1/2 mb-3"></div>
                        <div className="flex gap-2 mb-3">
                            <div className="bg-zinc-800 h-6 rounded-full w-16"></div>
                            <div className="bg-zinc-800 h-6 rounded-full w-16"></div>
                        </div>
                        <div className="bg-zinc-800 h-10 rounded"></div>
                    </div>
                ))}
            </>
        )
    }

    if (type === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Loader type="card" count={count} />
            </div>
        )
    }

    if (type === 'text') {
        return (
            <div className="animate-pulse space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-zinc-800 h-4 rounded w-full"></div>
                ))}
            </div>
        )
    }

    return null
}
