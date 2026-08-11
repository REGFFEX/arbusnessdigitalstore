import React from 'react'

interface SkeletonProps {
    className?: string
    circle?: boolean
}

export const Skeleton = ({ className = '', circle = false }: SkeletonProps) => {
    return (
        <div
            className={`animate-pulse bg-zinc-800/50 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
            style={{
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear'
            }}
        />
    )
}

export const ProductCardSkeleton = () => {
    return (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] p-4 flex flex-col gap-4">
            <Skeleton className="aspect-square w-full rounded-[24px]" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex justify-between items-center mt-auto pt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
        </div>
    )
}
