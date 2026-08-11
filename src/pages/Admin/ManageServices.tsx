import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, withRetry } from '../../config/supabase'
import { getServices, deleteService, toggleServiceActive } from '../../services/servicesApi'
import { uploadToStorage, getPublicUrl } from '../../services/admin'
import SmartSearch from '../../components/SmartSearch'
import { IconEdit, IconTrash, IconBriefcase, IconX, IconEye, PLACEMENT_ICONS } from '../../components/Icons'
import { useARDES } from '../../context/ARDESContext'
import { ARDES_CONFIG } from '../../config/ardes_config'
import { CATEGORIES_CONFIG, OS_LIST, FORMATION_CONFIG, PLACEMENTS } from '../../config/categories'
import { Skeleton, ProductCardSkeleton } from '../../components/Skeleton'

export default function ManageServices() {
    const navigate = useNavigate()
    const { addWorkspace } = useARDES()
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // State Édition
    const [editingService, setEditingService] = useState<any | null>(null)
    const [editForm, setEditForm] = useState<any>({})
    const [newImageFile, setNewImageFile] = useState<File | null>(null)
    const [saving, setSaving] = useState(false)
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
    const [bulkProcessing, setBulkProcessing] = useState(false)

    useEffect(() => {
        loadServices()
    }, [])

    const loadServices = async () => {
        setLoading(true)
        try {
            const data = await withRetry(() => getServices(true))
            setServices(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Supprimer les ${selectedServiceIds.length} services sélectionnés ?`)) return
        setBulkProcessing(true)
        try {
            await Promise.all(selectedServiceIds.map(id => deleteService(id)))
            setServices(prev => prev.filter(s => !selectedServiceIds.includes(s.id)))
            setSelectedServiceIds([])
        } catch (e: any) {
            alert(e.message)
        } finally {
            setBulkProcessing(false)
        }
    }

    const handleBulkToggleActive = async (newActive: boolean) => {
        setBulkProcessing(true)
        try {
            await Promise.all(selectedServiceIds.map(id => toggleServiceActive(id, newActive)))
            setServices(prev => prev.map(s => selectedServiceIds.includes(s.id) ? { ...s, active: newActive } : s))
            setSelectedServiceIds([])
        } catch (e: any) {
            alert(e.message)
        } finally {
            setBulkProcessing(false)
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Supprimer définitivement le service "${name}" ?`)) return
        try {
            await deleteService(id)
            setServices(prev => prev.filter(s => s.id !== id))
        } catch (e: any) {
            alert(e.message || 'Erreur suppression')
        }
    }

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        try {
            await toggleServiceActive(id, !currentActive)
            setServices(prev => prev.map(s => s.id === id ? { ...s, active: !currentActive } : s))
        } catch (e: any) {
            alert(e.message)
        }
    }

    // Naviguer vers la page d'ajout en mode édition
    function openEditModal(service: any) {
        const adminPath = ARDES_CONFIG.ADMIN_PATH
        navigate(`/${adminPath}/add-service?edit=${service.id}`)
    }

    const handleARDESLab = (formData: any) => {
        const adminPath = ARDES_CONFIG.ADMIN_PATH
        addWorkspace({
            name: `Edit Service: ${formData.name || 'Service'}`,
            data: {
                name: formData.name,
                image: newImageFile ? URL.createObjectURL(newImageFile) : editingService?.image,
                category: formData.type,
                os: 'Web System'
            },
            mode: 'mobile',
            originPath: `/${adminPath}/services`
        })
        navigate(`/${adminPath}/ardes`)
    }

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.type.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Gestion des Services</h2>
                    <p className="text-zinc-500 text-sm">Administrez les offres B2B et solutions digitales.</p>
                </div>
                <Link to={`/${ARDES_CONFIG.ADMIN_PATH}/add-service`} className="bg-gold text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
                    <span>+</span> Nouveau Service
                </Link>
            </div>

            {/* Recherche */}
            <div className="mb-8">
                <SmartSearch
                    onSearch={setSearchTerm}
                    context="admin_services"
                    placeholder="Rechercher un service..."
                    hasResults={filteredServices.length > 0 || searchTerm === ''}
                    onReset={() => setSearchTerm('')}
                />
            </div>

            {/* Liste */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredServices.map(s => (
                        <div key={s.id} className={`bg-zinc-900/40 border rounded-2xl overflow-hidden transition-all flex flex-col group ${s.active ? 'border-zinc-800 hover:border-zinc-600' : 'border-red-900/30 opacity-70'}`}>

                            {/* Image */}
                            <div className="h-40 bg-black relative flex items-center justify-center p-4">

                                {/* Checkbox Selection */}
                                <div className="absolute top-2 left-2 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedServiceIds.includes(s.id)}
                                        onChange={() => toggleSelect(s.id)}
                                        className="w-5 h-5 accent-gold cursor-pointer"
                                    />
                                </div>

                                {s.image ? (
                                    <img src={s.image} className="h-full object-contain" alt={s.name} />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                        <IconBriefcase size={22} className="text-zinc-600" strokeWidth={1.5} />
                                    </div>
                                )}
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-bold ${s.active ? 'bg-green-900/50 text-green-400 border border-green-500/20' : 'bg-red-900/50 text-red-400 border border-red-500/20'}`}>
                                    {s.active ? 'ACTIF' : 'INACTIF'}
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-white text-lg line-clamp-1">{s.name}</h3>
                                <p className="text-gold text-xs font-bold uppercase mb-2">{s.type}</p>
                                <p className="text-zinc-500 text-xs line-clamp-2 mb-4 flex-1">{s.description || 'Aucune description.'}</p>

                                {/* Actions */}
                                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                                    <button onClick={() => handleToggleActive(s.id, s.active)} className={`flex items-center justify-center p-2 rounded-lg transition-colors text-xs font-bold border ${s.active ? 'bg-zinc-800 text-zinc-400 border-transparent hover:text-white' : 'bg-green-900/20 text-green-400 border-green-900/30'}`}>
                                        {s.active ? 'Désactiver' : 'Activer'}
                                    </button>
                                    <button onClick={() => openEditModal(s)} className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/30 transition-colors text-xs font-bold">
                                        <IconEdit size={13} strokeWidth={2} /> Éditer
                                    </button>
                                    <button onClick={() => handleDelete(s.id, s.name)} className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 transition-colors text-xs font-bold">
                                        <IconTrash size={13} strokeWidth={2} /> Suppr.
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Bulk Actions Bar */}
            {selectedServiceIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 border border-gold/30 p-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-500">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-gold italic leading-none">{selectedServiceIds.length}</span>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mt-1">Sélectionnés</span>
                    </div>
                    <div className="h-10 w-px bg-zinc-800" />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleBulkToggleActive(true)}
                            disabled={bulkProcessing}
                            className="px-4 py-2 bg-green-500 text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all"
                        >
                            Activer
                        </button>
                        <button
                            onClick={() => handleBulkToggleActive(false)}
                            disabled={bulkProcessing}
                            className="px-4 py-2 bg-zinc-800 text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all"
                        >
                            Désactiver
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkProcessing}
                            className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all"
                        >
                            Supprimer
                        </button>
                    </div>
                    <button onClick={() => setSelectedServiceIds([])} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <IconX size={18} />
                    </button>
                </div>
            )}
        </div>
    )
}
