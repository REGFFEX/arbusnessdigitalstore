import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import ARDES from '../../components/ARDES'
import { IconDeviceMobile, IconTrash, IconSettings, IconArrowLeft } from '../../components/Icons'
import { useNavigate } from 'react-router-dom'
import { useARDES } from '../../context/ARDESContext'


const IconCopy = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
)


interface CustomDevice {
    id: string
    name: string
    width: number
    height: number
    radius: number
    border: number
}

export default function ArdesLab() {
    const navigate = useNavigate()
    const { workspaces, addWorkspace, updateWorkspace, removeWorkspace, toggleFolding, toggleAllFolding } = useARDES()
    const [recentItems, setRecentItems] = useState<any[]>([])
    const [customDevices, setCustomDevices] = useState<CustomDevice[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newDevice, setNewDevice] = useState<Omit<CustomDevice, 'id'>>({
        name: 'My Custom Device',
        width: 393,
        height: 852,
        radius: 55,
        border: 12
    })

    useEffect(() => {
        fetchRecentItems()
    }, [])

    async function fetchRecentItems() {
        const { data: products } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5)
        const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: false }).limit(5)
        const combined = [...(products || []), ...(services || [])].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5)
        setRecentItems(combined)
    }

    const handleCreateDevice = () => {
        if (editingId) {
            setCustomDevices(customDevices.map(d => d.id === editingId ? { ...newDevice, id: editingId } : d))
            setEditingId(null)
        } else {
            setCustomDevices([...customDevices, { ...newDevice, id: Math.random().toString(36).substr(2, 9) }])
        }
        setNewDevice({ name: 'My Custom Device', width: 393, height: 852, radius: 55, border: 12 })
    }

    const handleNewWorkspace = (item?: any) => {
        addWorkspace({
            name: item ? `Workspace: ${item.name}` : `Espace Vierge #${workspaces.length + 1}`,
            data: item ? {
                name: item.name,
                image: item.image,
                screenshots: item.screenshots,
                category: item.type,
                price: item.price,
                os: item.os
            } : { name: 'Nouveau Produit' },
            mode: 'mobile'
        })
    }

    const handleEditDevice = (device: CustomDevice) => {
        setNewDevice({
            name: device.name,
            width: device.width,
            height: device.height,
            radius: device.radius,
            border: device.border
        })
        setEditingId(device.id)
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Lab */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50 bg-black/80 backdrop-blur-xl p-4 -mx-4 border-b border-zinc-800">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">AR-DES <span className="text-gold">LAB WORKSPACES</span></h2>
                    <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Multi-Instance Device Emulator System</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => toggleAllFolding(false)} className="text-[10px] text-zinc-400 hover:text-white font-black uppercase">Déplier Tout</button>
                    <button onClick={() => toggleAllFolding(true)} className="text-[10px] text-zinc-400 hover:text-white font-black uppercase">Plier Tout</button>
                    <button
                        onClick={() => handleNewWorkspace()}
                        className="bg-gold text-black px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/20"
                    >
                        + Ajouter Instance
                    </button>
                </div>
            </div>

            {/* Workspaces List */}
            <div className="space-y-12">
                {workspaces.map((ws) => (
                    <div key={ws.id} className={`group transition-all duration-500 bg-zinc-900/30 border ${ws.isFolded ? 'border-zinc-800/50 rounded-2xl' : 'border-gold/20 rounded-[40px] shadow-2xl shadow-gold/5'}`}>
                        {/* Workspace Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
                            <div className="flex items-center gap-4">
                                <button onClick={() => toggleFolding(ws.id)} className={`p-2 rounded-lg bg-zinc-800 text-zinc-400 transition-transform ${!ws.isFolded ? 'rotate-180' : ''}`}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
                                </button>
                                <div className="flex flex-col">
                                    <input
                                        value={ws.name}
                                        onChange={(e) => updateWorkspace(ws.id, { name: e.target.value })}
                                        className="bg-transparent text-lg font-black text-white uppercase italic outline-none focus:text-gold"
                                    />
                                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Workspace ID: {ws.id}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {ws.originPath && (
                                    <button
                                        onClick={() => navigate(ws.originPath!)}
                                        className="text-[10px] font-black text-zinc-400 hover:text-gold flex items-center gap-2 uppercase transition-all"
                                    >
                                        <IconArrowLeft size={14} /> Retour au Formulaire
                                    </button>
                                )}
                                <button onClick={() => removeWorkspace(ws.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-all">
                                    <IconTrash size={16} />
                                </button>
                            </div>
                        </div>

                        {!ws.isFolded && (
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 animate-in slide-in-from-top-4">
                                {/* Zone Emulateur - now self-contained with controls */}
                                <div>
                                    <ARDES
                                        mode={ws.mode}
                                        customSpecs={ws.customSpecs}
                                        productData={ws.data}
                                    />
                                </div>

                                {/* Zone Contrôles - content loading + device library */}
                                <div className="space-y-4">
                                    {/* Item Select (Charger un contenu) */}
                                    <div className="bg-black/20 border border-zinc-800 p-5 rounded-3xl space-y-3">
                                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Charger Contenu</h3>
                                        <div className="grid grid-cols-5 gap-2">
                                            {recentItems.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => updateWorkspace(ws.id, {
                                                        data: {
                                                            name: item.name,
                                                            image: item.image,
                                                            screenshots: item.screenshots,
                                                            category: item.type,
                                                            price: item.price,
                                                            os: item.os
                                                        }
                                                    })}
                                                    className="aspect-square rounded-lg border border-zinc-800 bg-black/40 overflow-hidden hover:border-gold transition-all"
                                                    title={item.name}
                                                >
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                        {recentItems.length === 0 && (
                                            <p className="text-[9px] text-zinc-700 text-center italic font-bold">Aucun contenu récent.</p>
                                        )}
                                    </div>

                                    {/* Device Specs Library */}
                                    <div className="bg-black/20 border border-zinc-800 p-5 rounded-3xl space-y-3">
                                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Bibliothèque Device</h3>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                                            {customDevices.length === 0 && (
                                                <p className="text-[9px] text-zinc-700 text-center italic font-bold py-4">Pas de devices créés.</p>
                                            )}
                                            {customDevices.map(d => (
                                                <button
                                                    key={d.id}
                                                    onClick={() => updateWorkspace(ws.id, { customSpecs: d, mode: 'custom' })}
                                                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${ws.customSpecs?.id === d.id ? 'bg-gold/10 border-gold/40' : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <IconDeviceMobile size={14} className="text-gold" />
                                                        <span className="text-[10px] font-bold uppercase">{d.name}</span>
                                                    </div>
                                                    <span className="text-[9px] font-medium text-zinc-600">{d.width}x{d.height}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {workspaces.length === 0 && (
                    <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-[60px] space-y-6">
                        <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                            <IconDeviceMobile size={40} className="text-zinc-700 opacity-30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-zinc-700 uppercase italic">Aucun Workspace Actif</h3>
                            <p className="text-zinc-800 text-xs font-bold uppercase tracking-widest">Lancez une analyse AR-DES depuis un produit ou créez un espace vierge.</p>
                        </div>
                        <button
                            onClick={() => handleNewWorkspace()}
                            className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold hover:text-black hover:border-gold transition-all"
                        >
                            Initier Laboratoire
                        </button>
                    </div>
                )}
            </div>

            {/* Global Creator (Footer Side) - Always visible for global library update */}
            <div className="border-t border-zinc-800 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[40px] space-y-6">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Device Factory (Global)</h3>
                    <div className="space-y-4">
                        <input value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm outline-none focus:border-gold" placeholder="Device Label" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-zinc-600 uppercase">Width</label>
                                <input type="number" value={newDevice.width} onChange={e => setNewDevice({ ...newDevice, width: parseInt(e.target.value) })} className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-zinc-600 uppercase">Height</label>
                                <input type="number" value={newDevice.height} onChange={e => setNewDevice({ ...newDevice, height: parseInt(e.target.value) })} className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs outline-none" />
                            </div>
                        </div>
                        <button onClick={handleCreateDevice} className="w-full bg-zinc-800 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all">Enregistrer dans la bibliothèque</button>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[40px] space-y-4">
                    <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em]">Bibliothèque Partagée</h3>
                    <div className="space-y-2 overflow-y-auto scrollbar-hide">
                        {customDevices.map(d => (
                            <div key={d.id} className="p-4 bg-black/40 border border-zinc-800 rounded-2xl flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-zinc-300">{d.name} <span className="text-zinc-600 font-bold ml-2">({d.width}x{d.height})</span></span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditDevice(d)} className="p-2 text-zinc-600 hover:text-white"><IconSettings size={14} /></button>
                                    <button onClick={() => setCustomDevices(customDevices.filter(x => x.id !== d.id))} className="p-2 text-zinc-600 hover:text-red-500"><IconTrash size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    )
}
