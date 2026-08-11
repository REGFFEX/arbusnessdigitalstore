import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { getProducts } from '../../services/products'
import { Link } from 'react-router-dom'
import { IconEdit, IconCheck, IconX, IconExternalLink, IconGlobe as IconActivity } from '../../components/Icons'

export default function ManageProjects() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProject, setEditingProject] = useState<any | null>(null)
    const [formData, setFormData] = useState({
        project_phase: '',
        estimated_date: '',
        roadmap: [] as any[]
    })

    useEffect(() => {
        loadProjects()
    }, [])

    async function loadProjects() {
        setLoading(true)
        try {
            const [pRes, sRes] = await Promise.all([
                supabase.from('products').select('*').eq('is_project', true),
                supabase.from('services').select('*').eq('is_project', true)
            ])

            const all = [
                ...(pRes.data || []).map(x => ({ ...x, _origin: 'products' })),
                ...(sRes.data || []).map(x => ({ ...x, _origin: 'services' }))
            ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

            setProjects(all)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const startEditing = (p: any) => {
        setEditingProject(p)
        setFormData({
            project_phase: p.project_phase || 'announcement',
            estimated_date: p.estimated_date || '',
            roadmap: p.roadmap || []
        })
    }

    const handleSave = async () => {
        try {
            const { error } = await supabase
                .from(editingProject._origin)
                .update({
                    project_phase: formData.project_phase,
                    estimated_date: formData.estimated_date,
                    roadmap: formData.roadmap,
                    updated_at: new Date()
                })
                .eq('id', editingProject.id)

            if (error) throw error
            setEditingProject(null)
            loadProjects()
        } catch (e) {
            alert('Erreur lors de la sauvegarde')
        }
    }

    const addRoadmapPoint = () => {
        setFormData(prev => ({
            ...prev,
            roadmap: [...prev.roadmap, { date: '', label: '', desc: '' }]
        }))
    }

    const updateRoadmap = (index: number, field: string, value: string) => {
        const newRoadmap = [...formData.roadmap]
        newRoadmap[index] = { ...newRoadmap[index], [field]: value }
        setFormData(prev => ({ ...prev, roadmap: newRoadmap }))
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 backdrop-blur-xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <IconActivity className="text-blue-500" size={24} />
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Gestion des Projets</h2>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Pilotage des Roadmaps et Phases de Développement</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {projects.length === 0 ? (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-600">
                                <IconActivity size={32} />
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase">Aucun projet en cours</h3>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto">Activez le "Mode Projet" lors de la création d'un produit ou service pour qu'il apparaisse ici.</p>
                        </div>
                    ) : projects.map(p => (
                        <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 rounded-[32px] overflow-hidden hover:border-zinc-700 transition-all group">
                            <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                                <img src={p.image} className="w-24 h-24 rounded-2xl object-cover border border-zinc-800" alt="" />
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                        <h3 className="text-xl font-black text-white uppercase italic">{p.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${p._origin === 'products' ? 'bg-gold/10 text-gold' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {p._origin === 'products' ? 'Produit' : 'Service'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.project_phase === 'finalized' ? 'bg-green-500/20 text-green-400' :
                                            p.project_phase === 'development' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                                            }`}>
                                            Phase: {p.project_phase}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-zinc-800/50 text-zinc-400 text-[9px] font-black uppercase tracking-widest">
                                            Sortie: {p.estimated_date || 'TBA'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => startEditing(p)}
                                        className="p-4 bg-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                                    >
                                        <IconEdit size={20} />
                                    </button>
                                    <Link
                                        to={`/product/${p.id}`}
                                        className="p-4 bg-zinc-800 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                                    >
                                        <IconExternalLink size={20} />
                                    </Link>
                                </div>
                            </div>

                            {/* Roadmap Preview */}
                            {p.roadmap && p.roadmap.length > 0 && (
                                <div className="px-6 pb-6 pt-2 border-t border-zinc-800/50 bg-black/20 flex gap-4 overflow-x-auto scrollbar-none">
                                    {p.roadmap.map((step: any, idx: number) => (
                                        <div key={idx} className="min-w-[120px] p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                            <p className="text-[10px] text-blue-400 font-black uppercase">{step.date}</p>
                                            <p className="text-[9px] text-white font-bold truncate">{step.label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingProject && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl scrollbar-none">
                        <div className="p-8 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                            <div>
                                <h3 className="text-xl font-black text-white italic uppercase">Édition de Projet : {editingProject.name}</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Mise à jour de la trajectoire</p>
                            </div>
                            <button onClick={() => setEditingProject(null)} className="bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-white transition-all">
                                <IconX size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phase Actuelle</label>
                                    <select
                                        value={formData.project_phase}
                                        onChange={(e) => setFormData(prev => ({ ...prev, project_phase: e.target.value }))}
                                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none text-white"
                                    >
                                        <option value="announcement">📢 Annonce</option>
                                        <option value="development">💻 Développement</option>
                                        <option value="testing">🧪 Tests Finaux</option>
                                        <option value="reported">🟠 Reporté</option>
                                        <option value="cancelled">🔴 Annulé</option>
                                        <option value="finalized">🚀 Finalisé</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date Estimée</label>
                                    <input
                                        type="text"
                                        value={formData.estimated_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, estimated_date: e.target.value }))}
                                        placeholder="ex: Mars 2026"
                                        className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Roadmap détaillée</label>
                                    <button onClick={addRoadmapPoint} className="text-[10px] font-black text-blue-400 hover:text-white uppercase transition-all">+ Ajouter une étape</button>
                                </div>
                                <div className="space-y-3">
                                    {formData.roadmap.map((step, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-black/40 border border-zinc-800 rounded-2xl relative group">
                                            <input
                                                type="text"
                                                placeholder="Mois/Année"
                                                value={step.date}
                                                onChange={(e) => updateRoadmap(i, 'date', e.target.value)}
                                                className="sm:w-32 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[10px] font-black uppercase text-blue-400 focus:border-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Titre de l'étape"
                                                value={step.label}
                                                onChange={(e) => updateRoadmap(i, 'label', e.target.value)}
                                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[10px] font-bold text-white focus:border-blue-500"
                                            />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, roadmap: prev.roadmap.filter((_, idx) => idx !== i) }))}
                                                className="hidden group-hover:block p-3 text-red-500 hover:text-red-400"
                                            >
                                                <IconX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleSave} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3">
                                <IconCheck size={18} strokeWidth={4} />
                                Enregistrer les modifications
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
