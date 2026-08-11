import React, { useEffect, useState } from 'react'
import { ProductCardSkeleton } from '../../components/Skeleton'
import { getProducts } from '../../services/products'
import { deleteProduct, uploadToStorage, getPublicUrl } from '../../services/admin'
import { supabase } from '../../config/supabase'
import { useNavigate, Link } from 'react-router-dom'
import SmartSearch from '../../components/SmartSearch'
import { IconEdit, IconTrash, IconEye, IconX, IconPackage, IconBriefcase, PLACEMENT_ICONS } from '../../components/Icons'
import { useARDES } from '../../context/ARDESContext'
import { ARDES_CONFIG } from '../../config/ardes_config'
import { CATEGORIES_CONFIG, MONETIZATION_OPTIONS, PLACEMENTS, OS_LIST, FORMATION_CONFIG } from '../../config/categories'
import { calculateAutoRanking } from '../../services/admin'

export default function ManageProducts() {
  const navigate = useNavigate()
  const { addWorkspace } = useARDES()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')

  // State pour l'édition
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [editContributors, setEditContributors] = useState<{ name: string; role: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [bulkProcessing, setBulkProcessing] = useState(false)

  // États fichiers pour l'édition (optionnel si on change l'image)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newPartnerQRFile, setNewPartnerQRFile] = useState<File | null>(null)

  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [dbSubtypes, setDbSubtypes] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])

  useEffect(() => {
    loadProducts()
    loadTaxonomy()
  }, [])

  async function loadTaxonomy() {
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      const { data: subs } = await supabase.from('subtypes').select('*').order('name')
      const { data: prods } = await supabase.from('products').select('id, name').order('name')
      setDbCategories(cats || [])
      setDbSubtypes(subs || [])
      setAllProducts(prods || [])
    } catch (e) {
      console.error('Error loading taxonomy:', e)
    }
  }

  async function loadProducts() {
    setLoading(true)
    try {
      const { withRetry } = await import('../../config/supabase')
      const data = await withRetry(() => getProducts())
      setProducts(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) return
    try {
      await deleteProduct(id)
      setProducts((p) => p.filter((x) => x.id !== id))
    } catch (e: any) {
      alert('Erreur : ' + e.message)
    }
  }

  async function handleBulkDelete() {
    if (!confirm(`Supprimer définitivement les ${selectedProductIds.length} produits sélectionnés ?`)) return
    setBulkProcessing(true)
    try {
      await Promise.all(selectedProductIds.map(id => deleteProduct(id)))
      setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)))
      setSelectedProductIds([])
      alert('Produits supprimés.')
    } catch (e: any) {
      alert('Erreur lors de la suppression groupée : ' + e.message)
    } finally {
      setBulkProcessing(false)
    }
  }

  async function handleBulkToggleStatus(newStatus: 'Online' | 'Offline' | 'Soon') {
    setBulkProcessing(true)
    try {
      await Promise.all(selectedProductIds.map(id =>
        supabase.from('products').update({ status: newStatus }).eq('id', id)
      ))
      setProducts(prev => prev.map(p =>
        selectedProductIds.includes(p.id) ? { ...p, status: newStatus } : p
      ))
      setSelectedProductIds([])
    } catch (e: any) {
      alert('Erreur lors du changement de statut groupé : ' + e.message)
    } finally {
      setBulkProcessing(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) setSelectedProductIds([])
    else setSelectedProductIds(filteredProducts.map(p => p.id))
  }

  // Naviguer vers la page d'ajout en mode édition
  function openEditModal(product: any) {
    const adminPath = ARDES_CONFIG.ADMIN_PATH
    navigate(`/${adminPath}/add?edit=${product.id}`)
  }

  const handleARDESLab = (formData: any) => {
    const adminPath = ARDES_CONFIG.ADMIN_PATH
    addWorkspace({
      name: `Edit: ${formData.name || 'Produit'}`,
      data: {
        name: formData.name,
        image: newImageFile ? URL.createObjectURL(newImageFile) : editingProduct?.image,
        screenshots: editingProduct?.screenshots,
        category: formData.type,
        price: formData.price,
        os: formData.os
      },
      mode: 'mobile',
      originPath: `/${adminPath}/manage`
    })
    navigate(`/${adminPath}/ardes`)
  }

  // Gestion des changements formulaire
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setEditForm(prev => ({ ...prev, [name]: val }))
  }

  // Gestion Contributeurs (Edit Mode)
  const addContributor = () => setEditContributors(prev => [...prev, { name: '', role: '' }])
  const removeContributor = (i: number) => setEditContributors(prev => prev.filter((_, idx) => idx !== i))
  const updateContributor = (i: number, field: 'name' | 'role', val: string) => {
    setEditContributors(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }

  // Gestion Placements (Edit Mode)
  const handlePlacementChange = (id: string, checked: boolean) => {
    setEditForm(prev => ({
      ...prev,
      placements: checked
        ? [...(prev.placements || []), id]
        : (prev.placements || []).filter((p: string) => p !== id)
    }))
  }

  // Gestion Roadmap (Edit Mode)
  const addRoadmapStep = () => {
    setEditForm((prev: any) => ({
      ...prev,
      roadmap: [...(prev.roadmap || []), { date: '', label: '', desc: '' }]
    }))
  }

  const removeRoadmapStep = (index: number) => {
    setEditForm((prev: any) => ({
      ...prev,
      roadmap: prev.roadmap.filter((_: any, i: number) => i !== index)
    }))
  }

  const updateRoadmapStep = (index: number, field: string, value: string) => {
    setEditForm((prev: any) => ({
      ...prev,
      roadmap: prev.roadmap.map((step: any, i: number) => i === index ? { ...step, [field]: value } : step)
    }))
  }

  async function handleAutoRank() {
    if (!confirm('Voulez-vous recalculer automatiquement les Top 10 et Tendances basés sur les téléchargements ?')) return
    setLoading(true)
    try {
      const res = await calculateAutoRanking()
      alert(`Auto-Ranking terminé ! ${res.count} produits mis à jour.`)
      loadProducts()
    } catch (e: any) {
      alert('Erreur : ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // Sauvegarder les modifications
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = editingProduct.image
      let imagePath = editingProduct.image_path

      // Optimization: Parallelize uploads and logic
      const uploadPromises = []

      // 1. Upload Nouveau Fichier Image si présent
      if (newImageFile) {
        const newPath = `covers/${Date.now()}_${newImageFile.name}`
        uploadPromises.push((async () => {
          await uploadToStorage('images', newPath, newImageFile)
          imageUrl = getPublicUrl('images', newPath)
          imagePath = newPath
        })())
      }

      // 2. Upload des versions (Fichiers multi-plateformes)
      const finalVersions: any[] = []
      if (editForm.versions && editForm.versions.length > 0) {
        for (const v of editForm.versions) {
          if (v.file) {
            const vPath = `versions/${Date.now()}_${v.file.name}`
            uploadPromises.push((async () => {
              await uploadToStorage('files', vPath, v.file)
              finalVersions.push({ label: v.label, url: vPath, size: v.size })
            })())
          } else {
            finalVersions.push({ label: v.label, url: v.url, size: v.size })
          }
        }
      }

      // 2b. Partner QR Code
      let partnerQrUrl = editForm.partner_qr_url
      if (editForm.source === 'EXTERNAL' && newPartnerQRFile) {
        const qrPath = `partners_qr/${Date.now()}_${newPartnerQRFile.name}`
        uploadPromises.push((async () => {
          await uploadToStorage('images', qrPath, newPartnerQRFile)
          partnerQrUrl = getPublicUrl('images', qrPath)
        })())
      }

      await Promise.all(uploadPromises)

      const updates = {
        ...editForm,
        image: imageUrl,
        image_path: imagePath,
        partner_qr_url: partnerQrUrl,
        price: parseFloat(editForm.price),
        contributors: editContributors.filter(c => c.name.trim()),
        versions: finalVersions
      }

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', editingProduct.id)

      if (error) throw error

      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...updates } : p))
      setEditingProduct(null)
      alert('Produit mis à jour avec succès !')

    } catch (err: any) {
      console.error(err)
      alert('Erreur lors de la mise à jour : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Filtrage
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'All' || p.type === filterType
    return matchesSearch && matchesFilter
  })



  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gestion des Produits</h2>
          <p className="text-zinc-500 text-sm">Gérez le catalogue, modifiez les fiches et suivez les statuts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoRank}
            className="bg-zinc-900 border border-gold/30 text-gold px-6 py-3 rounded-xl font-bold hover:bg-gold hover:text-black transition-all flex items-center gap-2"
          >
            ⭐ Recalculer Tops
          </button>
          <Link to={`/${ARDES_CONFIG.ADMIN_PATH}/add`} className="bg-gold text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
            <span>+</span> Nouveau Produit
          </Link>
        </div>
      </div>

      {/* Filtres & Recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 items-start">
        <div className="flex-1 w-full">
          <SmartSearch
            onSearch={setSearchTerm}
            context="admin_products"
            placeholder="Rechercher par nom..."
            hasResults={filteredProducts.length > 0 || searchTerm === ''}
            onReset={() => setSearchTerm('')}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-gold outline-none h-[50px]"
        >
          <option value="All">Tous les types</option>
          {dbCategories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Liste Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all flex flex-col group">

              {/* Image & Badges */}
              <div className="h-40 bg-zinc-950 relative overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />

                {/* Checkbox Selection */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="w-5 h-5 accent-gold cursor-pointer shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`px-2 py-1 bg-black/80 backdrop-blur text-[10px] font-bold text-white rounded-lg border ${p.status === 'Online' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>{p.status}</span>
                  {p.is_premium && <span className="px-2 py-1 bg-gold text-[10px] font-bold text-black rounded-lg">PREMIUM</span>}
                  {p.ranking_position > 0 && <span className="px-2 py-1 bg-white text-[10px] font-bold text-black rounded-lg border border-zinc-300"># {p.ranking_position}</span>}
                </div>
              </div>

              {/* Contenu */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg line-clamp-1">{p.name}</h3>
                  <span className="text-zinc-500 text-xs bg-zinc-800 px-2 py-1 rounded">{p.version}</span>
                </div>
                <p className="text-zinc-500 text-xs line-clamp-2 mb-4 flex-1">{p.short_desc || 'Aucune description courte.'}</p>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                  <Link to={`/product/${p.id}`} target="_blank" className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors text-xs font-bold">
                    <IconEye size={13} strokeWidth={2} /> Voir
                  </Link>
                  <button onClick={() => openEditModal(p)} className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/30 transition-colors text-xs font-bold">
                    <IconEdit size={13} strokeWidth={2} /> Éditer
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 transition-colors text-xs font-bold">
                    <IconTrash size={13} strokeWidth={2} /> Suppr.
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 border border-gold/30 p-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-500">
          <div className="flex flex-col">
            <span className="text-xl font-black text-gold italic leading-none">{selectedProductIds.length}</span>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mt-1">Sélectionnés</span>
          </div>
          <div className="h-10 w-px bg-zinc-800" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBulkToggleStatus('Online')}
              disabled={bulkProcessing}
              className="px-4 py-2 bg-green-500 text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              Mettre en ligne
            </button>
            <button
              onClick={() => handleBulkToggleStatus('Offline')}
              disabled={bulkProcessing}
              className="px-4 py-2 bg-zinc-800 text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              Cacher (Offline)
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              Supprimer
            </button>
          </div>
          <button
            onClick={() => setSelectedProductIds([])}
            className="p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>
      )}


    </div>
  )
}

/**
 * Composant Modal d'Édition séparé pour optimiser les performances
 */
const EditProductModal = React.memo(({
  product, form, contributors, saving, onClose, onChange, onSave,
  onContributorAdd, onContributorRemove, onContributorUpdate,
  onPlacementChange, onRoadmapAdd, onRoadmapRemove, onRoadmapUpdate,
  onVersionAdd, onVersionRemove, onVersionUpdate,
  onRelationAdd, onRelationRemove, onRelationUpdate,
  onImageChange, newPartnerQRFile, onPartnerQRChange, onARDES,
  setEditForm, dbCategories, dbSubtypes, allProducts
}: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh]">

        {/* Header Modal */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20 rounded-t-3xl">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white">Modifier : <span className="text-gold">{product.name}</span></h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Édition Catalogue v2.1 (Optimisé)</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onARDES}
              className="bg-zinc-800 border border-gold/30 px-4 py-2 rounded-xl text-[10px] font-black text-gold uppercase tracking-widest hover:bg-gold hover:text-black transition-all"
            >
              Tester AR-DES Lab
            </button>
            <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400">
              <IconX size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto space-y-6 scrollbar-hide">
          <form id="editForm" onSubmit={onSave} className="space-y-6">

            {/* 1. Infos de base */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Nom du produit</label>
                <input name="name" value={form.name} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={(e) => {
                    const newType = e.target.value
                    const catObj = dbCategories.find(c => c.name === newType)
                    const firstSub = dbSubtypes.find(s => s.category_id === catObj?.id)?.name || ''
                    setEditForm(prev => ({
                      ...prev,
                      type: newType,
                      sub_type: firstSub
                    }))
                  }}
                  className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold"
                >
                  {dbCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Système / OS / Plateforme</label>
                <select name="os" value={form.os} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                  {form.type === 'Jeu' ? (
                    CATEGORIES_CONFIG['Jeu'].platforms?.map(p => <option key={p} value={p}>{p}</option>)
                  ) : form.type === 'Formation' ? (
                    FORMATION_CONFIG.formats.map(f => <option key={f.id} value={f.label}>{f.label}</option>)
                  ) : (
                    OS_LIST.map(o => <option key={o} value={o}>{o}</option>)
                  )}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Sous-Type / Classification</label>
                <select name="sub_type" value={form.sub_type} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                  {(() => {
                    const currentCat = dbCategories.find(c => c.name === form.type)
                    const dbMatches = dbSubtypes.filter(s => currentCat ? s.category_id === currentCat.id : false)

                    if (dbMatches.length > 0) {
                      return dbMatches.map((sub: any) => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))
                    }

                    const staticMatches = CATEGORIES_CONFIG[form.type]?.subtypes || []
                    return staticMatches.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  })()}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Source</label>
                <select name="source" value={form.source} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                  <option value="AR BUSINESS">AR BUSINESS (Interne)</option>
                  <option value="EXTERNAL">EXTERNE (Partenaire)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Statut</label>
                <div className="relative">
                  <select
                    value={['Stable', 'Beta', 'Alpha', 'Legacy', 'Online', 'Offline', 'Soon'].includes(form.status) ? form.status : 'Custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'Custom') {
                        setEditForm((prev: any) => ({ ...prev, status: e.target.value }))
                      } else {
                        setEditForm((prev: any) => ({ ...prev, status: '' }))
                      }
                    }}
                    className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold"
                  >
                    <option>Stable</option>
                    <option>Beta</option>
                    <option>Alpha</option>
                    <option>Legacy</option>
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Soon</option>
                    <option value="Custom">Autre...</option>
                  </select>
                  {!['Stable', 'Beta', 'Alpha', 'Legacy', 'Online', 'Offline', 'Soon'].includes(form.status) && (
                    <input
                      type="text"
                      name="status"
                      value={form.status}
                      onChange={onChange}
                      placeholder="Statut personnalisé..."
                      className="mt-2 w-full bg-zinc-800 border border-gold/30 rounded-lg p-2 text-xs text-gold outline-none"
                    />
                  )}
                  <div className="mt-2 space-y-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block">Position Top 10 (1-10)</label>
                    <input
                      type="number"
                      name="ranking_position"
                      value={form.ranking_position || 0}
                      onChange={onChange}
                      className="w-full p-2 bg-black border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-gold"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Partner Fields inside Modal */}
              {form.source === 'EXTERNAL' && (
                <div className="col-span-2 grid grid-cols-2 gap-4 bg-gold/5 p-4 rounded-2xl border border-gold/20">
                  <div className="col-span-2 flex items-center gap-2 mb-2">
                    <IconBriefcase size={14} className="text-gold" />
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">Détails Partenaire</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Nom Partenaire</label>
                    <input name="partner_name" value={form.partner_name} onChange={onChange} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-white text-xs outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Lien Site</label>
                    <input name="partner_link" value={form.partner_link} onChange={onChange} className="w-full p-2 bg-black border border-zinc-700 rounded-lg text-white text-xs outline-none focus:border-gold" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">QR Code Partenaire</label>
                    <div className="flex items-center gap-4">
                      {(form.partner_qr_url || newPartnerQRFile) && (
                        <img
                          src={newPartnerQRFile ? URL.createObjectURL(newPartnerQRFile) : form.partner_qr_url}
                          className="w-12 h-12 rounded-lg object-contain bg-white p-1"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => onPartnerQRChange(e.target.files?.[0] || null)}
                        className="text-[10px] text-zinc-500 file:bg-zinc-800 file:text-white file:border-0 file:px-3 file:py-1.5 file:rounded-lg file:mr-2 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Specific for Game */}
              {form.type === 'Jeu' && (
                <div className="col-span-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Genre de Jeu</label>
                  <select name="game_genre" value={form.game_genre} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                    <option value="">— Choisir —</option>
                    {CATEGORIES_CONFIG['Jeu'].gameGenres?.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}

              {/* Specific for Formation */}
              {form.type === 'Formation' && (
                <>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Domaine</label>
                    <select name="formation_domain" value={form.formation_domain} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                      <option value="">— Choisir —</option>
                      {CATEGORIES_CONFIG['Formation'].domains?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Niveau</label>
                    <select name="formation_level" value={form.formation_level} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                      {FORMATION_CONFIG.levels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Certificat</label>
                    <select name="formation_certificate" value={form.formation_certificate} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                      {FORMATION_CONFIG.certificates.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Monétisation Formation</label>
                    <select name="formation_monetization" value={form.formation_monetization} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold">
                      <option value="">— Choisir —</option>
                      {CATEGORIES_CONFIG['Formation'].monetizationTypes?.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* 2. Descriptions */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Description Courte</label>
                <input name="short_desc" value={form.short_desc} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Description Complète</label>
                <textarea name="description" rows={4} value={form.description} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none focus:border-gold" />
              </div>
            </div>

            {/* 3. Prix et Monétisation */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Modèle Éco.</label>
                <select name="monetization_type" value={form.monetization_type} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none">
                  {MONETIZATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Type d'Accès</label>
                <select name="access_type" value={form.access_type} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none">
                  <option value="direct">Accès Direct</option>
                  <option value="reward">Regarder Pub (Reward)</option>
                  <option value="payant">Paiement Requis</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Prix ($ USD)</label>
                <input type="number" name="price" value={form.price} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Prix (FCFA)</label>
                <input type="number" name="price_fcfa" value={form.price_fcfa} onChange={onChange} className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white outline-none" />
              </div>
              <label className="col-span-2 flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-zinc-800 cursor-pointer group">
                <input type="checkbox" name="is_premium" checked={form.is_premium} onChange={onChange} className="w-5 h-5 accent-gold" />
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-gold transition-colors">Marquer comme Produit Premium</span>
              </label>
            </div>

            {/* 3.5. Placements */}
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Emplacements d'affichage & Statuts</h4>
                <button
                  type="button"
                  onClick={() => {
                    // Logic for "Auto-Ranking": Select Top 10 + Trending if stats are high
                    // Mocking for now: toggle top_10
                    onPlacementChange('top_10', !form.placements?.includes('top_10'))
                  }}
                  className="text-[9px] font-black text-white/40 hover:text-gold uppercase tracking-tighter transition-colors"
                >
                  Auto-Rank (Beta)
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLACEMENTS.map(opt => (
                  <label key={opt.id} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${form.placements?.includes(opt.id)
                    ? 'bg-gold/10 border-gold/40 shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                    : 'bg-black/40 border-zinc-800 hover:border-zinc-700'
                    }`}>
                    <input
                      type="checkbox"
                      checked={form.placements?.includes(opt.id)}
                      onChange={(e) => onPlacementChange(opt.id, e.target.checked)}
                      className="w-4 h-4 accent-gold"
                    />
                    <span className={`text-[10px] whitespace-nowrap flex items-center gap-2 ${form.placements?.includes(opt.id) ? 'text-gold font-bold' : 'text-zinc-500'}`}>
                      <span className="text-sm">{opt.emoji}</span>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3.6 Mode Projet / Roadmap */}
            <div className="bg-zinc-800/80 p-6 rounded-3xl border border-gold/20 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-gold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Mode Projet / Coming Soon
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Gérer le cycle de vie du produit</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_project"
                    checked={form.is_project}
                    onChange={onChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>

              {form.is_project && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Phase Actuelle</label>
                    <select
                      name="project_phase"
                      value={form.project_phase}
                      onChange={onChange}
                      className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-gold"
                    >
                      <option value="announcement">📢 Annonce</option>
                      <option value="development">💻 Développement</option>
                      <option value="testing">🧪 Tests Finaux</option>
                      <option value="reported">🟠 Reporté</option>
                      <option value="cancelled">🔴 Annulé</option>
                      <option value="finalized">🚀 Finalisé (Prêt)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-black uppercase mb-1 block">Date Estimée</label>
                    <input
                      type="text"
                      name="estimated_date"
                      value={form.estimated_date}
                      onChange={onChange}
                      placeholder="ex: Mars 2026"
                      className="w-full p-3 bg-black border border-zinc-700 rounded-xl text-white text-xs outline-none focus:border-gold"
                    />
                  </div>

                  <div className="col-span-2 space-y-4">
                    <div className="flex items-center justify-between pt-2">
                      <label className="text-[10px] text-zinc-500 font-black uppercase">Roadmap Updates</label>
                      <button
                        type="button"
                        onClick={onRoadmapAdd}
                        className="bg-gold/10 text-gold border border-gold/30 px-3 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-gold hover:text-black transition-all"
                      >
                        + Ajouter une étape
                      </button>
                    </div>

                    {form.roadmap?.length === 0 ? (
                      <div className="p-8 border border-dashed border-zinc-800 rounded-2xl text-center">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase italic">Aucune étape définie</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                        {form.roadmap.map((step: any, idx: number) => (
                          <div key={idx} className="bg-black/40 border border-zinc-800 rounded-2xl p-4 relative group/step shadow-xl">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <input
                                placeholder="Date (ex: 20/03)"
                                className="p-2.5 bg-zinc-900/50 border border-zinc-700 rounded-xl text-xs text-white"
                                value={step.date}
                                onChange={e => onRoadmapUpdate(idx, 'date', e.target.value)}
                              />
                              <input
                                placeholder="Label (ex: Alpha test)"
                                className="p-2.5 bg-zinc-900/50 border border-zinc-700 rounded-xl text-xs text-white"
                                value={step.label}
                                onChange={e => onRoadmapUpdate(idx, 'label', e.target.value)}
                              />
                            </div>
                            <textarea
                              placeholder="Description courte des changements..."
                              className="w-full p-2.5 bg-zinc-900/50 border border-zinc-700 rounded-xl text-[10px] text-zinc-400 h-20 outline-none focus:border-gold"
                              value={step.desc}
                              onChange={e => onRoadmapUpdate(idx, 'desc', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => onRoadmapRemove(idx)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/step:opacity-100 transition-opacity shadow-lg"
                            >
                              <IconX size={10} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3.7 MULTI-VERSIONS */}
            <div className="bg-zinc-800/30 p-6 rounded-3xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Multi-Files & Versions</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">APK, EXE, ZIP additionnels</p>
                </div>
                <button
                  type="button"
                  onClick={onVersionAdd}
                  className="text-[10px] font-black text-gold hover:text-white uppercase tracking-widest"
                >
                  + Ajouter Version
                </button>
              </div>
              <div className="space-y-3">
                {form.versions?.map((v: any, i: number) => (
                  <div key={i} className="bg-black/60 p-4 rounded-2xl border border-zinc-800 space-y-3 relative group/ver">
                    <button
                      type="button"
                      onClick={() => onVersionRemove(i)}
                      className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 font-black opacity-0 group-hover/ver:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <input
                      placeholder="Label (ex: Windows .exe / Android APK)"
                      value={v.label}
                      onChange={e => onVersionUpdate(i, 'label', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-gold outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={v.os}
                        onChange={e => onVersionUpdate(i, 'os', e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px] text-zinc-400 outline-none"
                      >
                        {OS_LIST.map(os => <option key={os} value={os}>{os}</option>)}
                      </select>
                      <input
                        placeholder="Taille (ex: 45 Mo)"
                        value={v.size}
                        onChange={e => onVersionUpdate(i, 'size', e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px] text-zinc-400 outline-none"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            let sizeStr = ''
                            const bytes = file.size
                            if (bytes === 0) sizeStr = '0 Octets'
                            else {
                              const k = 1024
                              const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To']
                              const idx = Math.floor(Math.log(bytes) / Math.log(k))
                              sizeStr = parseFloat((bytes / Math.pow(k, idx)).toFixed(2)) + ' ' + sizes[idx]
                            }
                            onVersionUpdate(i, 'file', file)
                            onVersionUpdate(i, 'size', sizeStr)
                            if (!v.label) onVersionUpdate(i, 'label', file.name)
                          }
                        }}
                        className="w-full text-[8px] text-zinc-500 file:bg-zinc-800 file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1"
                      />
                      {v.url && !v.file && (
                        <p className="text-[8px] text-green-500 mt-1 font-bold uppercase">✓ Fichier existant sur le store</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3.8 Produits Liés (Relations) */}
            <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gold uppercase tracking-tighter">Produits Liés (Packs)</h4>
                <button type="button" onClick={onRelationAdd} className="text-[10px] bg-gold text-black px-2 py-1 rounded font-black uppercase tracking-widest">+ Lier</button>
              </div>
              <div className="space-y-3">
                {form.relations?.map((rel: any, i: number) => (
                  <div key={i} className="bg-black/40 p-3 rounded-xl border border-zinc-800 flex flex-col gap-2 relative group/rel">
                    <button type="button" onClick={() => onRelationRemove(i)} className="absolute top-1 right-1 text-zinc-600 hover:text-red-500 font-black">×</button>
                    <select
                      value={rel.product_id}
                      onChange={e => onRelationUpdate(i, 'product_id', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                    >
                      {allProducts.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input
                      placeholder="Type Relation (ex: Inclus)"
                      value={rel.relation_label}
                      onChange={e => onRelationUpdate(i, 'relation_label', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-[10px] text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Contributeurs */}
            <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gold">Équipe / Contributeurs</h4>
                <button type="button" onClick={onContributorAdd} className="text-xs bg-gold text-black px-2 py-1 rounded font-bold">+ Ajouter</button>
              </div>

              {contributors.length === 0 ? <p className="text-xs text-zinc-600 italic">Aucun contributeur.</p> : (
                <div className="space-y-2">
                  {contributors.map((c: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input placeholder="Nom" value={c.name} onChange={e => onContributorUpdate(i, 'name', e.target.value)} className="flex-1 p-2 bg-black rounded border border-zinc-700 text-xs text-white" />
                      <input placeholder="Rôle" value={c.role} onChange={e => onContributorUpdate(i, 'role', e.target.value)} className="flex-1 p-2 bg-black rounded border border-zinc-700 text-xs text-white" />
                      <button type="button" onClick={() => onContributorRemove(i)} className="flex items-center justify-center text-red-500 hover:bg-red-900/20 w-6 h-6 rounded">
                        <IconX size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Image (Optionnel) */}
            <div>
              <label className="text-xs text-zinc-500 font-bold uppercase mb-1 block">Remplacer l'image de couverture (Optionnel)</label>
              <input type="file" accept="image/*" onChange={(e) => onImageChange(e.target.files?.[0] || null)} className="w-full text-xs text-zinc-400 file:bg-zinc-800 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg" />
            </div>

          </form>
        </div>

        {/* Footer Modal */}
        <div className="p-6 border-t border-zinc-800 bg-black/20 rounded-b-3xl flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors">
            Annuler
          </button>
          <button type="submit" form="editForm" disabled={saving} className="px-6 py-3 rounded-xl bg-gold hover:bg-yellow-500 text-black font-bold transition-all shadow-lg shadow-gold/10">
            {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>
    </div>
  )
})
