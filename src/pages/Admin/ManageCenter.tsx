import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../hooks/useAuth'
import {
  IconPlus, IconX, IconCheck, IconPackage, IconBriefcase,
  IconDownload, IconGlobe, IconHistory, IconShield, IconSparkle,
  IconMegaphone, IconSettings, IconLoader2, IconArrowRight, IconGrid, IconBox,
  IconChevronUp, IconChevronDown, IconTrash, IconEye, IconCloudUpload, IconLayout,
  IconClock, IconAlert, IconPin, IconChartBar,
  CENTER_TYPE_ICONS, IconFolder, IconCenterLogo, IconStats
} from '../../components/Icons'
import {
  CenterPost, getAllPosts, getDeletedPosts, getScheduledPosts,
  createPost, updatePost, softDeletePost, restorePost, hardDeletePost,
  bulkSoftDelete, bulkRestore, purgeTrash, togglePin, uploadCenterMedia,
  bulkGroupPosts, reorderInBlock
} from '../../services/center'
import { useARDES } from '../../context/ARDESContext'
import { ARDES_CONFIG } from '../../config/ardes_config'
import { useNavigate } from 'react-router-dom'

const POST_TYPES = Object.keys(CENTER_TYPE_ICONS).map(key => ({
  value: key,
  label: CENTER_TYPE_ICONS[key].label,
  icon: CENTER_TYPE_ICONS[key].icon,
  color: CENTER_TYPE_ICONS[key].color
}))

const PRIORITIES = [
  { value: 'critical', label: 'Urgent', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
  { value: 'high', label: 'Important', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  { value: 'normal', label: 'Standard', color: 'bg-zinc-700/30 text-zinc-300 border-zinc-600' },
  { value: 'low', label: 'Discret', color: 'bg-zinc-800/50 text-zinc-500 border-zinc-700' },
]

const emptyForm: Partial<CenterPost> = {
  type: 'announcement',
  title: '',
  content: '',
  media_urls: [],
  thumbnail: '',
  linked_product_id: null,
  linked_service_id: null,
  external_url: '',
  priority: 'normal',
  status: 'published',
  source: 'AR_BUSINESS',
  source_detail: '',
  card_size: 'md',
  pinned: false,
  scheduled_at: null,
  expires_at: null,
  layout_config: {
    width: '100%',
    aspectRatio: 'auto',
    objectFit: 'cover'
  }
}

export default function ManageCenter() {
  const { adminData } = useAuth()
  const { addWorkspace } = useARDES()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'posts' | 'trash' | 'scheduled' | 'stats'>('posts')
  const [posts, setPosts] = useState<CenterPost[]>([])
  const [trashPosts, setTrashPosts] = useState<CenterPost[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<CenterPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CenterPost>>({...emptyForm})
  const [mediaFiles, setMediaFiles] = useState<FileList | null>(null)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [confirmPurge, setConfirmPurge] = useState(false)
  const [purgePassword, setPurgePassword] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [p, t, s] = await Promise.all([getAllPosts(), getDeletedPosts(), getScheduledPosts()])
      setPosts(p as CenterPost[])
      setTrashPosts(t as CenterPost[])
      setScheduledPosts(s as CenterPost[])
      // Load products and services for linking
      const { data: prods } = await supabase.from('products').select('id, name, image').order('name')
      const { data: servs } = await supabase.from('services').select('id, name, image').order('name')
      setProducts(prods || [])
      setServices(servs || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async () => {
    if (!formData.title?.trim()) return alert('Le titre est obligatoire.')
    setSaving(true)
    try {
      let mediaUrls = formData.media_urls || []
      if (mediaFiles && mediaFiles.length > 0) {
        const tempId = editingId || 'new_' + Date.now()
        for (let i = 0; i < mediaFiles.length; i++) {
          const url = await uploadCenterMedia(mediaFiles[i], tempId)
          mediaUrls.push(url)
        }
      }

      const payload = { ...formData, media_urls: mediaUrls, admin_id: adminData?.id }

      if (editingId) {
        await updatePost(editingId, payload)
      } else {
        await createPost(payload)
      }

      setShowForm(false)
      setEditingId(null)
      setFormData(emptyForm)
      setMediaFiles(null)
      await loadData()
    } catch (e: any) {
      alert('Erreur: ' + (e.message || 'Inconnue'))
      console.error(e)
    } finally { setSaving(false) }
  }

  const handleEdit = (post: CenterPost) => {
    setEditingId(post.id!)
    setFormData({ ...emptyForm, ...post })
    setShowForm(true)
  }

  const handleDuplicate = (post: CenterPost) => {
    setEditingId(null)
    const { id, created_at, updated_at, deleted_at, ...rest } = post
    setFormData({ ...emptyForm, ...rest, title: post.title + ' (Copie)', status: 'published' })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément ? (Il sera déplacé dans la corbeille)')) return
    await softDeletePost(id)
    await loadData()
  }

  const handleRestore = async (id: string) => {
    await restorePost(id)
    await loadData()
  }

  const handleHardDelete = async (id: string) => {
    if (!confirm('⚠️ SUPPRESSION DÉFINITIVE. Cette action est irréversible. Continuer ?')) return
    if (!confirm('Êtes-vous absolument sûr ? Dernier avertissement.')) return
    await hardDeletePost(id)
    await loadData()
  }

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return
    await bulkSoftDelete(selectedIds)
    setSelectedIds([])
    await loadData()
  }

  const handleBulkRestore = async () => {
    if (!confirm('Restaurer tous les éléments sélectionnés ?')) return
    await bulkRestore(selectedIds)
    setSelectedIds([])
    await loadData()
  }

  const handleBulkPublish = async () => {
    if (!confirm('Publier tous les éléments sélectionnés ?')) return
    setSaving(true)
    try {
      await supabase.from('center_posts').update({ status: 'published', updated_at: new Date().toISOString() }).in('id', selectedIds)
      setSelectedIds([])
      await loadData()
    } finally {
      setSaving(false)
    }
  }

  const toggleOrder = async (id: string, current: number, dir: 'up' | 'down') => {
    const newOrder = dir === 'up' ? Math.max(0, current - 1) : current + 1
    await reorderInBlock(id, newOrder)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, block_order: newOrder } : p))
  }

  const handleGroupSelected = async () => {
    if (selectedIds.length < 2) return alert('Sélectionnez au moins 2 éléments pour grouper.')
    const blockId = crypto.randomUUID()
    setSaving(true)
    try {
      await bulkGroupPosts(selectedIds, blockId)
      setPosts(prev => prev.map(p => selectedIds.includes(p.id!) ? { ...p, block_id: blockId } : p))
      setSelectedIds([])
      alert('Éléments groupés en bloc.')
    } catch (e) {
      alert('Erreur de groupement.')
    } finally {
      setSaving(false)
    }
  }

  const openInLab = (post: CenterPost) => {
    addWorkspace({
      name: `Lab: ${post.title}`,
      data: {
        name: post.title,
        image: post.thumbnail || (post.media_urls?.[0] as string),
        screenshots: post.media_urls as string[],
        category: post.type,
        price: post.priority,
        os: post.source
      },
      mode: 'mobile',
      originPath: `/${ARDES_CONFIG.ADMIN_PATH}/center`
    })
    navigate(`/${ARDES_CONFIG.ADMIN_PATH}/ardes`)
  }

  const handleBulkLab = () => {
    selectedIds.forEach(id => {
      const post = posts.find(p => p.id === id)
      if (post) {
        addWorkspace({
          name: `Lab: ${post.title}`,
          data: {
            name: post.title,
            image: post.thumbnail || (post.media_urls?.[0] as string),
            screenshots: post.media_urls as string[],
            category: post.type,
            price: post.priority,
            os: post.source
          },
          mode: 'mobile',
          originPath: `/${ARDES_CONFIG.ADMIN_PATH}/center`
        })
      }
    })
    navigate(`/${ARDES_CONFIG.ADMIN_PATH}/ardes`)
  }

  const handlePurgeTrash = async () => {
    if (purgePassword.length < 3) return alert('Entrez votre mot de passe admin.')
    await purgeTrash()
    setConfirmPurge(false)
    setPurgePassword('')
    await loadData()
  }

  const handleTogglePin = async (id: string, current: boolean) => {
    await togglePin(id, !current)
    await loadData()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const getTypeInfo = (type: string) => POST_TYPES.find(t => t.value === type) || POST_TYPES[0]
  const getPriorityInfo = (p: string) => PRIORITIES.find(x => x.value === p) || PRIORITIES[2]

  const currentList = tab === 'trash' ? trashPosts : tab === 'scheduled' ? scheduledPosts : posts

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
              <IconCenterLogo size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter leading-none mb-1">
                Centre <span className="text-gold">AR</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 flex-wrap">
                <span className="text-zinc-400">Gestionnaire Multimédia Sécurisé</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="flex items-center gap-1"><IconGrid size={10} /> {posts.length}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="flex items-center gap-1 text-red-400/60"><IconTrash size={10} /> {trashPosts.length}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="flex items-center gap-1 text-blue-400/60"><IconClock size={10} /> {scheduledPosts.length}</span>
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ ...emptyForm }); setMediaFiles(null) }}
          className="px-6 py-3 bg-gold text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-gold/20"
        >
          <IconPlus size={16} strokeWidth={3} /> Nouvelle Publication
        </button>
      </div>

      {/* Tabs */}
        {[
          { key: 'posts', label: 'Publications', count: posts.length, icon: IconHistory },
          { key: 'trash', label: 'Corbeille', count: trashPosts.length, icon: IconTrash },
          { key: 'scheduled', label: 'Programmés', count: scheduledPosts.length, icon: IconClock },
          { key: 'stats', label: 'Statistiques', count: 0, icon: IconStats },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key as any); setSelectedIds([]) }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${tab === t.key ? 'bg-gold text-black border-gold shadow-lg shadow-gold/10' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span> 
            {t.count > 0 && <span className="ml-1 text-[8px] opacity-70">({t.count})</span>}
          </button>
        ))}

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-gold/5 border border-gold/20 rounded-2xl animate-in slide-in-from-top-2">
          <span className="text-[10px] font-black text-gold uppercase tracking-widest">{selectedIds.length} sélectionné(s)</span>
          <div className="flex-1" />
          {tab === 'trash' ? (
            <button onClick={handleBulkRestore} className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-black uppercase">Restaurer</button>
          ) : (
            <>
              <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-black uppercase">Supprimer</button>
              <button onClick={handleBulkPublish} className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                <IconCheck size={12} /> Publier
              </button>
              <button onClick={handleGroupSelected} className="px-4 py-2 bg-gold/10 text-gold border border-gold/30 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                <IconGrid size={12} /> Grouper en bloc
              </button>
              <button onClick={handleBulkLab} className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                <IconBox size={12} /> Transport Lab (Multi)
              </button>
            </>
          )}
          <button onClick={() => setSelectedIds([])} className="p-2 text-zinc-500 hover:text-white"><IconX size={14} /></button>
        </div>
      )}

      {/* Purge Trash button */}
      {tab === 'trash' && trashPosts.length > 0 && (
        <div className="flex justify-end">
          {!confirmPurge ? (
            <button onClick={() => setConfirmPurge(true)} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-red-500/20 transition-colors flex items-center gap-2">
              <IconTrash size={12} /> Vider la corbeille ({trashPosts.length})
            </button>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-2xl animate-in slide-in-from-right-4">
              <input type="password" value={purgePassword} onChange={e => setPurgePassword(e.target.value)} placeholder="Mot de passe admin..." className="bg-black border border-red-500/30 px-3 py-2 rounded-lg text-xs text-white font-mono w-40 focus:outline-none focus:border-red-500" />
              <button onClick={handlePurgeTrash} className="px-3 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black uppercase">Confirmer</button>
              <button onClick={() => { setConfirmPurge(false); setPurgePassword('') }} className="p-2 text-zinc-500 hover:text-white"><IconX size={14} /></button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-zinc-600">
          <IconLoader2 size={32} className="animate-spin text-gold" />
          <p className="text-[10px] font-black uppercase tracking-widest">Chargement du Centre AR...</p>
        </div>
      ) : tab === 'stats' ? (
        /* Stats Tab */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {POST_TYPES.map(pt => {
            const count = posts.filter(p => p.type === pt.value).length
            const Icon = pt.icon
            return (
              <div key={pt.value} className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-4 text-center hover:border-zinc-600 transition-colors flex flex-col items-center justify-center">
                <div className={`${pt.color} mb-2`}>
                   <Icon size={24} />
                </div>
                <p className="text-2xl font-black text-white leading-none">{count}</p>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mt-2">{pt.label}</p>
              </div>
            )
          })}
          <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <div className="text-gold mb-2"><IconPin size={24} /></div>
            <p className="text-2xl font-black text-gold">{posts.filter(p => p.pinned).length}</p>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Épinglés</p>
          </div>
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-4 text-center flex flex-col items-center justify-center">
            <div className="text-gold mb-2"><IconChartBar size={24} /></div>
            <p className="text-2xl font-black text-white">{posts.reduce((acc, p) => acc + (p.share_count || 0), 0)}</p>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Partages totaux</p>
          </div>
        </div>
      ) : currentList.length === 0 ? (
        <div className="py-20 text-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
          {tab === 'trash' ? 'La corbeille est vide' : tab === 'scheduled' ? 'Aucune publication programmée' : 'Aucune publication. Créez la première !'}
        </div>
      ) : (
        /* List */
        <div className="space-y-2">
          {currentList.map(post => {
            const typeInfo = getTypeInfo(post.type)
            const prioInfo = getPriorityInfo(post.priority)
            const isSelected = selectedIds.includes(post.id!)
            return (
                <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-2xl border transition-all group ${post.block_id ? 'border-l-4 border-l-gold shadow-gold/5 shadow-lg' : ''} ${isSelected ? 'bg-gold/5 border-gold/30' : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'}`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(post.id!)} className="w-4 h-4 accent-gold shrink-0" />

                {/* Thumbnail */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {post.thumbnail ? (
                    <img src={post.thumbnail} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className={typeInfo.color}>
                       <typeInfo.icon size={20} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.pinned && <IconPin size={12} className="text-gold" />}
                    <p className="text-sm font-black text-white truncate">{post.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${prioInfo.color}`}>{prioInfo.label}</span>
                    <span className={`text-[8px] font-bold ${typeInfo.color}`}>{typeInfo.label}</span>
                    <span className="text-[8px] text-zinc-600">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}
                    </span>
                    {post.expires_at && (
                      <span className="text-[8px] text-orange-400 font-bold">⏰ Expire {new Date(post.expires_at).toLocaleDateString('fr-FR')}</span>
                    )}
                    {post.block_id && (
                      <span className="text-[8px] bg-zinc-700 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded font-bold">
                        BLOC: {post.block_id.slice(0, 4)} (Ordre: {post.block_order || 0})
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {tab === 'trash' ? (
                    <>
                      <button onClick={() => handleRestore(post.id!)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg" title="Restaurer"><IconCheck size={14} /></button>
                      <button onClick={() => handleHardDelete(post.id!)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" title="Supprimer définitivement"><IconX size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleTogglePin(post.id!, post.pinned || false)} className={`p-2 rounded-lg ${post.pinned ? 'text-gold' : 'text-zinc-500 hover:text-gold'}`} title="Épingler">
                        <IconPin size={14} />
                      </button>
                      <button onClick={() => openInLab(post)} className="p-2 text-gold hover:bg-gold/10 rounded-lg" title="Ouvrir dans le LAB (ARDES)"><IconBox size={14} /></button>
                      {post.block_id && (
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => toggleOrder(post.id!, post.block_order || 0, 'up')} className="p-1 text-zinc-500 hover:text-white"><IconChevronUp size={12} /></button>
                          <button onClick={() => toggleOrder(post.id!, post.block_order || 0, 'down')} className="p-1 text-zinc-500 hover:text-white"><IconChevronDown size={12} /></button>
                        </div>
                      )}
                      <button onClick={() => handleEdit(post)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg" title="Modifier"><IconSettings size={14} /></button>
                      <button onClick={() => handleDuplicate(post)} className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg" title="Dupliquer"><IconPlus size={14} /></button>
                      <button onClick={() => handleDelete(post.id!)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg" title="Supprimer"><IconX size={14} /></button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CREATE / EDIT FORM MODAL ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm overflow-y-auto p-4 pt-10 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl p-8 relative animate-in slide-in-from-bottom-4 my-8">
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ ...emptyForm }); setMediaFiles(null) }} className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all">
              <IconX size={16} />
            </button>

            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-8">
              {editingId ? 'Modifier la' : 'Nouvelle'} <span className="text-gold">Publication</span>
            </h2>

            <div className="space-y-6">
              {/* Type */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Type de contenu</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {POST_TYPES.map(pt => {
                    const Icon = pt.icon
                    return (
                      <button key={pt.value} onClick={() => setFormData({ ...formData, type: pt.value as any })}
                        className={`p-2 rounded-xl border text-center transition-all text-xs font-bold flex flex-col items-center justify-center gap-1 ${formData.type === pt.value ? 'bg-gold/10 border-gold/50 text-gold' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                        <Icon size={20} />
                        <span className="text-[8px] uppercase tracking-widest leading-none mt-1">{pt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Titre *</label>
                <input value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white font-bold focus:border-gold outline-none" placeholder="Titre de la publication..." />
              </div>

              {/* Content */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Contenu</label>
                <textarea value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} rows={4}
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-white focus:border-gold outline-none resize-none" placeholder="Corps du message..." />
              </div>

              {/* Media Upload */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Médias (images, vidéos, audios)</label>
                <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.apk"
                  onChange={e => setMediaFiles(e.target.files)}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-2xl text-zinc-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gold/10 file:text-gold file:font-black file:text-xs file:uppercase" />
                {formData.media_urls && formData.media_urls.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {formData.media_urls.map((url, i) => (
                      <div key={i} className="relative shrink-0">
                        <img src={url} className="h-16 w-16 object-cover rounded-lg border border-zinc-700" alt="" />
                        <button onClick={() => setFormData({ ...formData, media_urls: formData.media_urls!.filter((_, j) => j !== i) })}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90">
                          <IconX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Links row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product Link */}
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconPackage size={12} /> Lien Produit
                  </label>
                  <select value={formData.linked_product_id || ''} onChange={e => setFormData({ ...formData, linked_product_id: e.target.value || null })}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-2xl text-white text-sm focus:border-gold outline-none">
                    <option value="">Aucun</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {/* Service Link */}
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <IconBriefcase size={12} /> Lien Service
                  </label>
                  <select value={formData.linked_service_id || ''} onChange={e => setFormData({ ...formData, linked_service_id: e.target.value || null })}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-2xl text-white text-sm focus:border-gold outline-none">
                    <option value="">Aucun</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* External URL */}
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <IconGlobe size={12} /> URL Externe
                </label>
                <input value={formData.external_url || ''} onChange={e => setFormData({ ...formData, external_url: e.target.value })}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-2xl text-white text-sm focus:border-gold outline-none" placeholder="https://..." />
              </div>

              {/* Priority + Size + Source row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Priorité</label>
                  <div className="flex gap-1">
                    {PRIORITIES.map(p => (
                      <button key={p.value} onClick={() => setFormData({ ...formData, priority: p.value as any })}
                        className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase border transition-all ${formData.priority === p.value ? p.color : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Taille Card</label>
                  <div className="flex gap-1">
                    {['sm', 'md', 'lg'].map(s => (
                      <button key={s} onClick={() => setFormData({ ...formData, card_size: s as any })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${formData.card_size === s ? 'bg-gold/10 border-gold/50 text-gold' : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}>
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Source</label>
                  <select value={formData.source || 'AR_BUSINESS'} onChange={e => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-sm focus:border-gold outline-none">
                    <option value="AR_BUSINESS">AR BUSINESS</option>
                    <option value="EXTERNE">EXTERNE</option>
                  </select>
                </div>
              </div>

              {formData.source === 'EXTERNE' && (
                <input value={formData.source_detail || ''} onChange={e => setFormData({ ...formData, source_detail: e.target.value })}
                  className="w-full bg-black border border-zinc-800 p-3 rounded-2xl text-white text-sm focus:border-gold outline-none" placeholder="Nom de la source externe..." />
              )}

              {/* Status + Scheduling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Statut</label>
                  <select value={formData.status || 'draft'} onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-sm focus:border-gold outline-none">
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="scheduled">Programmé</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Publication programmée</label>
                  <input type="datetime-local" value={formData.scheduled_at?.slice(0, 16) || ''} onChange={e => setFormData({ ...formData, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-sm focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Expiration automatique</label>
                  <input type="datetime-local" value={formData.expires_at?.slice(0, 16) || ''} onChange={e => setFormData({ ...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-white text-sm focus:border-gold outline-none" />
                </div>
              </div>

              {/* Layout Configuration (Resizing/Lab) */}
              <div className="bg-zinc-800/30 p-4 rounded-3xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <IconLayout size={14} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Configuration du Rendu (ARDES LAB)</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1 block">Object Fit</label>
                    <select 
                      value={formData.layout_config?.objectFit || 'cover'} 
                      onChange={e => setFormData({ ...formData, layout_config: { ...formData.layout_config, objectFit: e.target.value } })}
                      className="w-full bg-black border border-zinc-800 p-2 rounded-xl text-white text-[10px] focus:border-gold outline-none"
                    >
                      <option value="cover">Remplir (Cover)</option>
                      <option value="contain">Contenir (Contain)</option>
                      <option value="fill">Étirer (Fill)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1 block">Ratio Aspect</label>
                    <select 
                      value={formData.layout_config?.aspectRatio || 'auto'} 
                      onChange={e => setFormData({ ...formData, layout_config: { ...formData.layout_config, aspectRatio: e.target.value } })}
                      className="w-full bg-black border border-zinc-800 p-2 rounded-xl text-white text-[10px] focus:border-gold outline-none"
                    >
                      <option value="auto">Auto</option>
                      <option value="1/1">1:1 (Carré)</option>
                      <option value="16/9">16:9 (Vidéo)</option>
                      <option value="9/16">9:16 (Story)</option>
                      <option value="4/3">4:3 (Photo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1 block">Largeur Max</label>
                    <input 
                      type="text" 
                      value={formData.layout_config?.width || '100%'} 
                      onChange={e => setFormData({ ...formData, layout_config: { ...formData.layout_config, width: e.target.value } })}
                      className="w-full bg-black border border-zinc-800 p-2 rounded-xl text-white text-[10px] focus:border-gold outline-none"
                      placeholder="100% ou 300px"
                    />
                  </div>
                </div>
              </div>

              {/* Pinned + Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.pinned || false} onChange={e => setFormData({ ...formData, pinned: e.target.checked })} className="w-5 h-5 accent-gold" />
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <IconPin size={12} /> Épingler en haut
                  </span>
                </label>
                <div className="flex-1" />
                <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ ...emptyForm }); setMediaFiles(null) }}
                  className="px-6 py-3 bg-zinc-800 text-zinc-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="px-8 py-3 bg-gold text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-gold/20">
                  {saving ? <IconLoader2 size={14} className="animate-spin" /> : <IconCheck size={14} />}
                  {editingId ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
