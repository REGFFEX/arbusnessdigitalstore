import React, { useEffect, useState } from 'react'
import { supabase } from '../../config/supabase'
import { uploadToStorage, getPublicUrl } from '../../services/admin'
import { IconEdit, IconTrash, IconX, IconBriefcase, IconExternalLink, IconPlay } from '../../components/Icons'

export default function ManageAds() {
  const [ads, setAds] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<any | null>(null)
  const [formData, setFormData] = useState<any>({
    title: '',
    type: 'video',
    media_url: '',
    duration: 5,
    skippable: true,
    linked_product: '',
    target_url: '',
    revenue_type: 'internal',
    active: true,
    position: 'billboard',
    priority: 0
  })
  const [mediaFile, setMediaFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [adsRes, prodRes] = await Promise.all([
        supabase.from('ads').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name').order('name')
      ])
      setAds(adsRes.data || [])
      setProducts(prodRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const openForm = (ad: any = null) => {
    if (ad) {
      setEditingAd(ad)
      setFormData({
        ...ad,
        linked_product: ad.linked_product || ''
      })
    } else {
      setEditingAd(null)
      setFormData({
        title: '',
        type: 'video',
        media_url: '',
        duration: 5,
        skippable: true,
        linked_product: '',
        target_url: '',
        revenue_type: 'internal',
        active: true,
        position: 'billboard',
        priority: 0
      })
    }
    setMediaFile(null)
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setMediaFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let finalMediaUrl = formData.media_url

      if (mediaFile) {
        const path = `ads/${Date.now()}_${mediaFile.name}`
        await uploadToStorage(formData.type === 'video' ? 'files' : 'images', path, mediaFile)
        finalMediaUrl = getPublicUrl(formData.type === 'video' ? 'files' : 'images', path)
      }

      const payload = {
        ...formData,
        media_url: finalMediaUrl,
        linked_product: formData.linked_product === '' ? null : formData.linked_product,
        updated_at: new Date().toISOString()
      }

      let error
      if (editingAd) {
        const { error: err } = await supabase.from('ads').update(payload).eq('id', editingAd.id)
        error = err
      } else {
        const { error: err } = await supabase.from('ads').insert([payload])
        error = err
      }

      if (error) throw error

      setIsModalOpen(false)
      fetchData()
      alert('Publicité enregistrée avec succès !')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette publicité ?')) return
    try {
      const { error } = await supabase.from('ads').delete().eq('id', id)
      if (error) throw error
      setAds(prev => prev.filter(a => a.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const toggleStatus = async (ad: any) => {
    try {
      const { error } = await supabase.from('ads').update({ active: !ad.active }).eq('id', ad.id)
      if (error) throw error
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, active: !ad.active } : a))
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic">ADS <span className="text-gold">PRO</span></h2>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Monétisation & Campaign Manager</p>
        </div>
        <button onClick={() => openForm()} className="bg-gold text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/10">
          + Nouvelle Campagne
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-900/50 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map(ad => (
            <div key={ad.id} className={`bg-zinc-900/40 border transition-all rounded-[32px] overflow-hidden group flex flex-col ${ad.active ? 'border-zinc-800' : 'border-red-900/20 opacity-60'}`}>
              <div className="relative h-40 bg-black flex items-center justify-center">
                {ad.type === 'video' ? (
                  <div className="flex flex-col items-center gap-2">
                    <IconPlay className="text-gold" size={32} />
                    <span className="text-[10px] font-black text-zinc-500 uppercase">Vidéo Ad</span>
                  </div>
                ) : (
                  ad.media_url ? <img src={ad.media_url} className="w-full h-full object-cover" /> : <div className="text-zinc-700 font-black">BANNER</div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${ad.revenue_type === 'internal' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'}`}>
                    {ad.revenue_type}
                  </span>
                </div>

                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${ad.active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-white group-hover:text-gold transition-colors">{ad.title}</h3>
                <div className="mt-4 space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-bold text-zinc-400 capitalize">{ad.type}</span>
                    <span className="opacity-30">•</span>
                    <span>{ad.position}</span>
                  </div>
                  {ad.linked_product && (
                    <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold bg-blue-500/5 p-2 rounded-xl border border-blue-500/10">
                      <IconBriefcase size={12} />
                      Lié à: {products.find(p => p.id === ad.linked_product)?.name || 'Produit inconnu'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6">
                  <button onClick={() => toggleStatus(ad)} className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 text-[10px] font-black uppercase text-zinc-400 transition-all">
                    {ad.active ? 'Stop' : 'Run'}
                  </button>
                  <button onClick={() => openForm(ad)} className="p-3 bg-blue-900/10 text-blue-400 rounded-xl hover:bg-blue-900/20 text-[10px] font-black uppercase transition-all">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(ad.id)} className="p-3 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-900/20 text-[10px] font-black uppercase transition-all">
                    Del
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDIT/ADD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-[40px] shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white uppercase italic">{editingAd ? 'Modifier' : 'Créer'} Campagne</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-zinc-800 p-2 rounded-full text-zinc-500 hover:text-white transition-all"><IconX /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <form id="adForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Titre de la campagne</label>
                  <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" placeholder="Ex: Promo Nouvel An" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Type d'Ad</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                      <option value="video">Vidéo Cinématique</option>
                      <option value="banner">Bannière Statique</option>
                      <option value="reward">Vidéo Récompense</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Position</label>
                    <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                      <option value="billboard">Hero Billboard (Home)</option>
                      <option value="store-top">Top Store</option>
                      <option value="interstitial">Interstitiel (Démarrage)</option>
                      <option value="reward-center">Centre de Récompense</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Origine du Revenu</label>
                    <select value={formData.revenue_type} onChange={e => setFormData({ ...formData, revenue_type: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                      <option value="internal">Interne (AR Business)</option>
                      <option value="external">Externe (Google / Partenaire)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Priorité (0-100)</label>
                    <input type="number" value={formData.priority} onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Média ({formData.type === 'video' ? 'MP4' : 'Image'})</label>
                  <input type="file" onChange={handleFileChange} className="w-full text-xs text-zinc-500 file:bg-zinc-800 file:text-gold file:border-0 file:px-4 file:py-2 file:rounded-xl" />
                  {formData.media_url && <p className="text-[9px] text-zinc-600 truncate mt-1">Actuel: {formData.media_url}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Durée (Secondes)</label>
                    <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" />
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <input type="checkbox" checked={formData.skippable} onChange={e => setFormData({ ...formData, skippable: e.target.checked })} className="w-5 h-5 accent-gold" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Skippable</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-3">
                    <IconBriefcase className="text-zinc-500" size={14} />
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ciblage & Conversion</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Lier à un produit Store</label>
                      <select value={formData.linked_product} onChange={e => setFormData({ ...formData, linked_product: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                        <option value="">-- Aucun --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Lien Externe (Optionnel)</label>
                      <input value={formData.target_url} onChange={e => setFormData({ ...formData, target_url: e.target.value })} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-zinc-800 bg-black/20 rounded-b-[40px] flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Annuler</button>
              <button type="submit" form="adForm" disabled={saving} className="flex-1 py-4 bg-gold text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-gold/20 active:scale-95 transition-all">
                {saving ? 'Traitement...' : 'Déployer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
