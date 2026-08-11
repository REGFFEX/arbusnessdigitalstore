import React, { useState, useCallback } from 'react'

interface ARDESProps {
    mode: 'mobile' | 'tablet' | 'desktop' | 'custom'
    modelName?: string
    productData: {
        name: string
        image?: string
        screenshots?: string[]
        category?: string
        price?: string
        os?: string
    }
    customSpecs?: {
        width: number
        height: number
        radius: number
        border: number
    }
    externalRotation?: { x: number, y: number }
    // Mini-Lab exclusive props
    isMiniLab?: boolean
    onSendToLab?: () => void
}

// Full feature preview of AR-DES inside the screen
function DeviceScreen({ productData }: { productData: ARDESProps['productData'] }) {
    const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview')

    return (
        <div className="flex flex-col h-full bg-black text-white overflow-hidden">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-3 pt-2 pb-1 z-10 flex-shrink-0">
                <span className="text-[9px] font-bold text-white/60">9:41</span>
                <div className="flex items-center gap-1 opacity-60">
                    <div className="flex gap-px">
                        {[3, 4, 4, 5, 5].map((h, i) => (
                            <div key={i} className="w-[2px] bg-white rounded-sm" style={{ height: h }} />
                        ))}
                    </div>
                    <div className="w-3 h-2 border border-white/70 rounded-sm relative">
                        <div className="absolute inset-y-[1px] left-[1px] right-[2px] bg-white rounded-sm" />
                        <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-[2px] h-[5px] bg-white/60 rounded-r-sm" />
                    </div>
                </div>
            </div>

            {/* Header of the "app" */}
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/80 border-b border-zinc-800 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                    {productData.image ? (
                        <img src={productData.image} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold/30 to-yellow-700/30" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">{productData.name || 'Mon Application'}</p>
                    <p className="text-[8px] text-green-400 font-bold">AR BUSINESS</p>
                </div>
                <div className="text-[8px] text-zinc-400 bg-zinc-800 rounded px-1">
                    {productData.os || 'Android'}
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-zinc-800 flex-shrink-0">
                {[{ id: 'preview', label: 'Aperçu' }, { id: 'info', label: 'Infos' }].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase transition-all ${activeTab === tab.id ? 'text-gold border-b-2 border-gold' : 'text-zinc-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {activeTab === 'preview' ? (
                    <div className="p-2 space-y-3">
                        {/* Hero image */}
                        <div className="w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden">
                            {productData.image ? (
                                <img src={productData.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                    <p className="text-[9px] font-bold uppercase">Image du produit</p>
                                </div>
                            )}
                        </div>

                        {/* Rating row */}
                        <div className="flex items-center gap-2">
                            <div className="flex gap-px">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <svg key={i} width="8" height="8" viewBox="0 0 24 24" fill="#D4AF37"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                ))}
                            </div>
                            <span className="text-[8px] text-zinc-500 font-bold">4.8 • 2.3k avis</span>
                        </div>

                        {/* Screenshots */}
                        {productData.screenshots && productData.screenshots.length > 0 && (
                            <div>
                                <p className="text-[8px] text-zinc-500 font-black uppercase mb-1">Screenshots</p>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                    {productData.screenshots.map((s, i) => (
                                        <img key={i} src={s} className="h-24 w-14 object-cover rounded-lg flex-shrink-0 border border-zinc-800" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Install button */}
                        <button className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-full font-black text-[10px] uppercase tracking-wider transition-colors">
                            INSTALLER
                        </button>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {[
                            { label: 'Catégorie', value: productData.category || 'Application' },
                            { label: 'Prix', value: productData.price ? `${productData.price} $` : 'Gratuit' },
                            { label: 'Compatibilité', value: productData.os || 'Android' },
                            { label: 'Développeur', value: 'AR BUSINESS' },
                            { label: 'Version', value: '2.0.0' },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between items-center p-2 bg-zinc-900/60 rounded-lg border border-zinc-800">
                                <span className="text-[8px] text-zinc-500 font-black uppercase">{item.label}</span>
                                <span className="text-[9px] text-white font-bold">{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const ORIENTATION_PRESETS = [
    { id: 'front', label: 'Face', x: 0, y: 0 },
    { id: 'top', label: 'Haut', x: 25, y: 0 },
    { id: 'left', label: 'Gauche', x: 0, y: 30 },
    { id: 'right', label: 'Droite', x: 0, y: -30 },
]

export default function ARDES({ mode, modelName, productData, customSpecs, externalRotation, isMiniLab, onSendToLab }: ARDESProps) {
    const [internalRotation, setInternalRotation] = useState({ x: 10, y: -20 })
    const [isLandscape, setIsLandscape] = useState(false)
    const [activeMode, setActiveMode] = useState(mode)
    const [miniLabWidth, setMiniLabWidth] = useState(420) // px, only when isMiniLab

    const rotation = externalRotation || internalRotation
    const setRotation = useCallback((val: any) => {
        if (externalRotation) return
        setInternalRotation(val)
    }, [externalRotation])

    const devices: Record<string, any> = {
        mobile: { width: isLandscape ? 852 : 393, height: isLandscape ? 393 : 852, radius: '55px', border: '12px', notch: true },
        tablet: { width: isLandscape ? 1180 : 820, height: isLandscape ? 820 : 1180, radius: '30px', border: '20px', notch: false },
        desktop: { width: 1440, height: 900, radius: '12px', border: '30px', notch: false },
        custom: {
            width: isLandscape ? (customSpecs?.height || 800) : (customSpecs?.width || 400),
            height: isLandscape ? (customSpecs?.width || 400) : (customSpecs?.height || 800),
            radius: `${customSpecs?.radius || 40}px`,
            border: `${customSpecs?.border || 12}px`,
            notch: false
        }
    }

    const current = devices[activeMode] || devices.mobile
    const scale = isMiniLab ? Math.min((miniLabWidth - 250) / current.width, 0.55) : 0.5

    return (
        <div
            className="relative bg-zinc-950/50 rounded-[40px] border border-zinc-800 backdrop-blur-xl overflow-hidden"
            style={isMiniLab ? { width: miniLabWidth, minWidth: 320, maxWidth: '100%', transition: 'width 0.3s ease' } : {}}
        >
            {/* ── Resize Handle (only in mini lab) ── */}
            {isMiniLab && (
                <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur rounded-xl border border-zinc-700 px-2 py-1.5 shadow-xl">
                    <span className="text-[8px] text-zinc-500 font-black uppercase">Taille</span>
                    <input
                        type="range"
                        min={320}
                        max={720}
                        step={20}
                        value={miniLabWidth}
                        onChange={e => setMiniLabWidth(parseInt(e.target.value))}
                        className="w-20 h-1.5 accent-gold cursor-pointer"
                    />
                    <span className="text-[8px] text-gold font-black w-8">{miniLabWidth}px</span>
                </div>
            )}

            <div className="flex flex-col">
                {/* ── Header / Controls ── */}
                <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-zinc-800 flex-wrap gap-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Mode buttons */}
                        {(['mobile', 'tablet', 'desktop'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setActiveMode(m)}
                                className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all ${activeMode === m ? 'bg-gold border-gold text-black' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Orientation presets */}
                        {ORIENTATION_PRESETS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setRotation({ x: p.x, y: p.y })}
                                className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all border ${rotation.x === p.x && rotation.y === p.y ? 'bg-gold/10 border-gold text-gold' : 'border-zinc-800 text-zinc-600 hover:text-white'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                        {/* Landscape toggle */}
                        <button
                            onClick={() => setIsLandscape(l => !l)}
                            className={`p-1.5 rounded-lg border transition-all ${isLandscape ? 'border-gold bg-gold/10 text-gold' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
                            title="Pivoter"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c1.5 1.26 3.9 2 6.3 2 4.42 0 8-2.46 8-5.5S15.22 7.5 10.8 7.5c-2.4 0-4.8.74-6.3 2" /><polyline points="9 12 4.5 16.5 9 21" /></svg>
                        </button>
                        {/* Send to full lab (mini lab only) */}
                        {isMiniLab && onSendToLab && (
                            <button
                                onClick={onSendToLab}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-black rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-yellow-400 transition-all whitespace-nowrap"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                                Ouvrir Grand Lab
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Rotation sliders ── */}
                <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 bg-black/10">
                    <span className="text-[8px] text-zinc-600 font-black uppercase w-6">X</span>
                    <input type="range" min="-45" max="45" value={rotation.x}
                        onChange={e => setRotation((prev: any) => ({ ...prev, x: parseInt(e.target.value) }))}
                        className="flex-1 h-1 accent-gold cursor-pointer" />
                    <span className="text-[8px] text-zinc-600 font-black uppercase w-6">Y</span>
                    <input type="range" min="-45" max="45" value={rotation.y}
                        onChange={e => setRotation((prev: any) => ({ ...prev, y: parseInt(e.target.value) }))}
                        className="flex-1 h-1 accent-gold cursor-pointer" />
                    <span className="text-[8px] text-zinc-500 font-black">{rotation.x}°/{rotation.y}°</span>
                </div>

                {/* ── Device Viewport ── */}
                <div className="flex items-center justify-center p-6" style={{ minHeight: 380 }}>
                    <div
                        className="relative transition-all duration-500 ease-out preserve-3d"
                        style={{
                            transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                            width: current.width * scale,
                            height: current.height * scale,
                        }}
                    >
                        {/* Depth shadow */}
                        <div className="absolute inset-x-[-2px] inset-y-[-2px] bg-zinc-800 -z-10" style={{ borderRadius: current.radius, transform: 'translateZ(-10px)' }} />

                        {/* Main Frame */}
                        <div
                            className="w-full h-full bg-zinc-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative"
                            style={{ borderRadius: current.radius, borderWidth: current.border, borderStyle: 'solid', borderColor: '#27272a' }}
                        >
                            {/* Notch */}
                            {current.notch && !isLandscape && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-zinc-900 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                    <div className="w-6 h-1 rounded-full bg-zinc-800" />
                                </div>
                            )}

                            {/* Screen */}
                            <div className="flex-1 overflow-hidden" style={{ scale: scale < 0.5 ? 0.9 : 1 }}>
                                <DeviceScreen productData={productData} />
                            </div>
                        </div>

                        {/* Model Tag */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gold text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">
                            {modelName || `${activeMode.toUpperCase()} `} • {isLandscape ? 'Landscape' : 'Portrait'}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .preserve-3d { transform-style: preserve-3d; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
