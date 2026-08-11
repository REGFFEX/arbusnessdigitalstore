import React, { useEffect, useState } from 'react'
import { supabase } from '../../config/supabase'
import { IconTrash, IconEdit, IconX, IconPlus, IconGrid, IconBox, IconSettings, CATEGORY_ICONS } from '../../components/Icons'

export default function ManageCategories() {
    const [categories, setCategories] = useState<any[]>([])
    const [subtypes, setSubtypes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Modals state
    const [isCatModalOpen, setIsCatModalOpen] = useState(false)
    const [isSubModalOpen, setIsSubModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [form, setForm] = useState({ name: '', slug: '', icon: '', category_id: '' })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const { data: cats } = await supabase.from('categories').select('*').order('name')
            const { data: subs } = await supabase.from('subtypes').select('*, categories(name)').order('name')
            setCategories(cats || [])
            setSubtypes(subs || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCat = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingItem) {
                await supabase.from('categories').update({ name: form.name, slug: form.slug, icon: form.icon }).eq('id', editingItem.id)
            } else {
                await supabase.from('categories').insert([{ name: form.name, slug: form.slug, icon: form.icon }])
            }
            setIsCatModalOpen(false)
            loadData()
        } catch (e) {
            alert('Erreur lors de la sauvegarde')
        }
    }

    const handleSaveSub = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingItem) {
                await supabase.from('subtypes').update({ name: form.name, slug: form.slug, category_id: form.category_id }).eq('id', editingItem.id)
            } else {
                await supabase.from('subtypes').insert([{ name: form.name, slug: form.slug, category_id: form.category_id }])
            }
            setIsSubModalOpen(false)
            loadData()
        } catch (e) {
            alert('Erreur lors de la sauvegarde')
        }
    }

    const handleDelete = async (table: string, id: string) => {
        if (!confirm('Supprimer cet élément ?')) return
        await supabase.from(table).delete().eq('id', id)
        loadData()
    }

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white">Gestion des Types & Sous-types</h2>
                    <p className="text-zinc-500 text-sm">Organisez la structure de votre catalogue digital.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setForm({ name: '', slug: '', icon: '', category_id: '' }); setEditingItem(null); setIsCatModalOpen(true) }}
                        className="bg-gold text-black px-4 py-2 rounded-xl font-bold text-xs"
                    >
                        + Nouveau Type
                    </button>
                    <button
                        onClick={() => { setForm({ name: '', slug: '', icon: '', category_id: categories[0]?.id || '' }); setEditingItem(null); setIsSubModalOpen(true) }}
                        className="bg-zinc-800 text-white px-4 py-2 rounded-xl font-bold text-xs border border-zinc-700"
                    >
                        + Nouveau Sous-type
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Liste des Catégories (Types) */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <IconGrid className="text-gold" size={20} /> Types Principaux
                    </h3>
                    <div className="space-y-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 group">
                                <div className="flex items-center gap-3">
                                    {(() => {
                                        const Icon = CATEGORY_ICONS[cat.name] || IconGrid
                                        return <Icon size={24} className="text-gold" />
                                    })()}
                                    <div>
                                        <p className="text-white font-bold">{cat.name}</p>
                                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{cat.slug}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingItem(cat); setForm({ ...cat }); setIsCatModalOpen(true) }}
                                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                                    >
                                        <IconEdit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete('categories', cat.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Liste des Sous-types */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <IconBox className="text-gold" size={20} /> Sous-types Classés
                    </h3>
                    <div className="space-y-3">
                        {subtypes.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 group">
                                <div>
                                    <p className="text-white font-bold">{sub.name}</p>
                                    <p className="text-[10px] text-gold/60 font-black uppercase tracking-widest">
                                        {(sub as any).categories?.name || 'Inconnu'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setEditingItem(sub); setForm({ ...sub }); setIsSubModalOpen(true) }}
                                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                                    >
                                        <IconEdit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete('subtypes', sub.id)}
                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div >

            {/* Modal Category */}
            {
                isCatModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] w-full max-w-md animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white">{editingItem ? 'Modifier' : 'Nouveau'} Type</h3>
                                <button onClick={() => setIsCatModalOpen(false)} className="text-zinc-500"><IconX /></button>
                            </div>
                            <form onSubmit={handleSaveCat} className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Nom</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-white"
                                        placeholder="Ex: Application"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Slug</label>
                                    <input value={form.slug} readOnly className="w-full p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Emoji/Icon</label>
                                    <input
                                        value={form.icon}
                                        onChange={e => setForm({ ...form, icon: e.target.value })}
                                        className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-white"
                                        placeholder="Ex: 📱"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-gold text-black rounded-2xl font-black mt-4 hover:scale-105 transition-transform">
                                    ENREGISTRER
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal Subtype */}
            {
                isSubModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[32px] w-full max-w-md animate-slide-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white">{editingItem ? 'Modifier' : 'Nouveau'} Sous-type</h3>
                                <button onClick={() => setIsSubModalOpen(false)} className="text-zinc-500"><IconX /></button>
                            </div>
                            <form onSubmit={handleSaveSub} className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Type Parent</label>
                                    <select
                                        value={form.category_id}
                                        onChange={e => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-white"
                                    >
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Nom</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-white"
                                        placeholder="Ex: Productivité"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Slug</label>
                                    <input value={form.slug} readOnly className="w-full p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed" />
                                </div>
                                <button type="submit" className="w-full py-4 bg-gold text-black rounded-2xl font-black mt-4 hover:scale-105 transition-transform">
                                    ENREGISTRER
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
