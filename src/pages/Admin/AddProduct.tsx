import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { uploadToStorage, getPublicUrl } from '../../services/admin'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'
import { useARDES } from '../../context/ARDESContext'
import { useFormPersistence } from '../../hooks/useFormPersistence'
import { IconEye, PLACEMENT_ICONS, MONETIZATION_ICONS, IconBriefcase } from '../../components/Icons'
import ARDES from '../../components/ARDES'
import { CATEGORIES_CONFIG, MONETIZATION_OPTIONS, PLACEMENTS, OS_LIST, FORMATION_CONFIG } from '../../config/categories'
import { ARDES_CONFIG } from '../../config/ardes_config'
import { syncCurrencies, calculateAdsToPrice } from '../../utils/currency_converter'
import FormNavigator from '../../components/FormNavigator'
import { IconCreditCard, IconGrid, IconSettings, IconDeviceMobile, IconPackage, IconGlobe, IconLock, IconMonitor, IconPlus } from '../../components/Icons'

interface Module {
  id_temp: string
  name: string
  type: 'video' | 'pdf' | 'zip'
  file: File | null
  file_url?: string
}

export default function AddProduct() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { settings, loading: settingsLoading } = useSettings()
  const { addWorkspace } = useARDES()
  // Persistent States
  const [formData, setFormData] = useFormPersistence('add_product_form', {
    name: '', short_desc: '', description: '', version: '1.0.0', type: 'Application',
    sub_type: 'Productivité & Bureautique',
    os: 'Android', status: 'Stable', size: '',
    // Unified Financial System
    price: '0',
    price_fcfa: 0,
    price_eur: 0,
    ads_video_count: 0,
    ads_video_price: 0,
    display_config: { show_usd: true, show_fcfa: true, show_eur: true },
    // Taxonomy and source
    monetization_type: 'free',
    source: 'AR BUSINESS',
    access_type: 'direct' as 'direct' | 'reward' | 'payant',
    multi_types: [] as string[],
    is_premium: false, requires_license: false, placements: ['new'] as string[],
    ranking_position: 0,
    is_project: false, project_phase: 'announcement', estimated_date: '',
    roadmap: [] as { date: string; label: string; desc: string }[],
    relations: [] as { product_id: string; product_name: string; relation_label: string }[],
    // New taxonomy fields
    formation_domain: '',
    formation_level: 'debutant',
    formation_certificate: 'none',
    formation_monetization: '',
    game_genre: '',
    // Partner fields
    partner_name: '',
    partner_link: '',
    partner_qr_url: '',
    edition: '',
    // File naming override
    file_name_override: '',
    custom_source_suffix: '', // Special suffix for external sources
    // Data fields for Edit mode
    image: '',
    file_url: '',
    file_path: '',
    image_path: '',
    screenshots: [] as string[]
  })

  // Versions state moved out of persistent formData to avoid File object serialization crash
  const [versions, setVersions] = useState<{ label: string; url: string; size: string; os: string; file?: File }[]>([])

  const [allProducts, setAllProducts] = useState<any[]>([])

  const [modules, setModules] = useState<Module[]>([])
  // Non-persistent contributors to avoid File object serialization crash
  const [contributors, setContributors] = useState<{ name: string; role: string; photo_url?: string; file?: File | null }[]>([])

  // Local States (Files/UI)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [partnerQRFile, setPartnerQRFile] = useState<File | null>(null)
  const [partnerQRPreview, setPartnerQRPreview] = useState<string>('')
  const [fileFile, setFileFile] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<FileList | null>(null)
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([])
  const [showMiniLab, setShowMiniLab] = useState(false)
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [dbSubtypes, setDbSubtypes] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: cats } = await supabase.from('categories').select('*').order('name')
        const { data: subs } = await supabase.from('subtypes').select('*').order('name')
        const { data: prods } = await supabase.from('products').select('id, name, version').order('name')
        setDbCategories(cats || [])
        setDbSubtypes(subs || [])
        setAllProducts(prods || [])

        if (editId) {
          const { data: p, error } = await supabase.from('products').select('*').eq('id', editId).single()
          if (error) throw error
          if (p) {
            setFormData({
              ...p,
              price: p.price?.toString() || '0',
              sub_type: p.sub_type || p.subtype || ''
            })
            if (p.image) setImagePreview(p.image)
            if (p.partner_qr_url) setPartnerQRPreview(p.partner_qr_url)
            if (p.screenshots) setScreenshotPreviews(p.screenshots)
            if (p.contributors) setContributors(p.contributors)
            if (p.versions) setVersions(p.versions)
            if (p.type === 'Formation') {
              const { data: mods } = await supabase.from('training_modules').select('*').eq('product_id', editId).order('order_index')
              if (mods) setModules(mods.map(m => ({ ...m, id_temp: m.id })))
            }
          }
        } else {
          // Si on repasse en mode "Ajout pur", on peut vouloir vider si on vient d'un Edit
          // Mais attention useFormPersistence peut déjà avoir des données locales.
          // Pour l'instant on laisse tel quel ou on clear si c'est explicitement demandé.
        }
      } catch (e) {
        console.error('Error loading data:', e)
      }
    }
    loadData()
  }, [editId])

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile)
      setImagePreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [imageFile])

  useEffect(() => {
    if (screenshots) {
      const previews = Array.from(screenshots).map(file => ({
        url: URL.createObjectURL(file),
        type: file.type
      }))
      setScreenshotPreviews(previews as any) // Type hack or we could change the state type, but any works for preview
      return () => previews.forEach(p => URL.revokeObjectURL(p.url))
    }
  }, [screenshots])

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Octets'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFileFile(file)
    if (file) {
      setFormData(prev => {
        // Automatically extract base name without extension
        const parts = file.name.split('.')
        if (parts.length > 1) parts.pop()
        const baseName = parts.join('.')

        return {
          ...prev,
          size: formatBytes(file.size),
          file_name_override: baseName // Auto-populate override with base name
        }
      })
    }
  }

  const handleARDESLab = () => {
    const adminPath = ARDES_CONFIG.ADMIN_PATH
    addWorkspace({
      name: `Design: ${formData.name || 'Nouveau Produit'}`,
      data: {
        name: formData.name,
        image: imagePreview,
        screenshots: screenshotPreviews,
        category: formData.type,
        price: formData.price,
        os: formData.os
      },
      mode: 'mobile',
      originPath: `/${adminPath}/add`
    })
    navigate(`/${adminPath}/ardes`)
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value

    if (name === 'price' || name === 'price_fcfa' || name === 'price_eur') {
      const fieldMapping = { price: 'usd', price_fcfa: 'fcfa', price_eur: 'eur' } as const
      const numericVal = parseFloat(val || '0')
      const synced = syncCurrencies(numericVal, fieldMapping[name as keyof typeof fieldMapping])

      setFormData(prev => ({
        ...prev,
        price: synced.usd.toString(),
        price_fcfa: synced.fcfa,
        price_eur: synced.eur
      }))
    } else if (name === 'ads_video_count' || name === 'ads_video_price') {
      setFormData(prev => {
        const next = { ...prev, [name]: parseFloat(val || '0') }
        const synced = calculateAdsToPrice(next.ads_video_count, next.ads_video_price)
        return {
          ...next,
          price: synced.usd.toString(),
          price_fcfa: synced.fcfa,
          price_eur: synced.eur
        }
      })
    } else if (name === 'show_usd' || name === 'show_fcfa' || name === 'show_eur') {
      setFormData(prev => ({
        ...prev,
        display_config: {
          ...(prev.display_config || { show_usd: true, show_fcfa: true, show_eur: true }),
          [name]: checked
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: val }))
    }
  }

  const addRoadmapEntry = () => setFormData(prev => ({ ...prev, roadmap: [...prev.roadmap, { date: '', label: '', desc: '' }] }))
  const removeRoadmapEntry = (index: number) => setFormData(prev => ({ ...prev, roadmap: prev.roadmap.filter((_, i) => i !== index) }))
  const updateRoadmapEntry = (index: number, field: string, value: string) => setFormData(prev => ({ ...prev, roadmap: prev.roadmap.map((it, i) => i === index ? { ...it, [field]: value } : it) }))

  const addModule = () => setModules([...modules, { id_temp: Math.random().toString(36), name: '', type: 'video', file: null }])
  const removeModule = (id: string) => setModules(modules.filter(m => m.id_temp !== id))
  const handleModuleChange = (id: string, field: keyof Module, value: any) => setModules(modules.map(m => m.id_temp === id ? { ...m, [field]: value } : m))

  const addContributor = () => setContributors(prev => [...prev, { name: '', role: '', photo_url: '', file: null }])
  const removeContributor = (i: number) => setContributors(prev => prev.filter((_, idx) => idx !== i))
  const updateContributor = (i: number, field: string, val: any) => setContributors(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))

  const addVersion = () => setVersions(prev => [...prev, { label: '', url: '', size: '', os: OS_LIST[0], version: '' }])
  const removeVersion = (i: number) => setVersions(prev => prev.filter((_, idx) => idx !== i))
  const updateVersion = (i: number, field: string, val: any) => setVersions(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: val } : v))

  const addRelation = () => {
    if (allProducts.length > 0) {
      setFormData(prev => ({
        ...prev,
        relations: [...prev.relations, { product_id: allProducts[0].id, product_name: allProducts[0].name, relation_label: 'Inclus dans le pack', version: allProducts[0].version || '1.0' }]
      }))
    }
  }
  const removeRelation = (i: number) => setFormData(prev => ({ ...prev, relations: prev.relations.filter((_, idx) => idx !== i) }))
  const updateRelation = (i: number, field: string, val: string) => {
    if (field === 'product_id') {
      const p = allProducts.find(prod => prod.id === val)
      setFormData(prev => ({
        ...prev,
        relations: prev.relations.map((rel, idx) => idx === i ? { ...rel, product_id: val, product_name: p?.name || '' } : rel)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        relations: prev.relations.map((rel, idx) => idx === i ? { ...rel, [field]: val } : rel)
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId && !imageFile) return setMessage({ type: 'error', text: 'Image de couverture requise' })
    setLoading(true)
    try {
      const getFileSuffix = () => {
        if (formData.source === 'EXTERNAL') {
          const sourceName = (formData.custom_source_suffix || formData.partner_name || 'EXT').split(' ')[0].toUpperCase();
          return `_FROM_ARB-DS_EXT_FROM_${sourceName}`;
        }
        return '_FROM_ARB-DS';
      }

      // rename() uses the admin-provided override name if set, otherwise uses the real filename.
      // NEVER uses Date.now() — clean names only.
      // Strictly inserts suffix before last dot (extension).
      const rename = (originalName: string) => {
        // 1. Toujours extraire la VRAIE extension du fichier original
        const origParts = originalName.split('.');
        const trueExt = origParts.length > 1 ? `.${origParts.pop()}` : '';

        // 2. Déterminer le nom de base désiré (override ou original sans son extension)
        let basePart = formData.file_name_override.trim();
        if (!basePart) {
          basePart = origParts.join('.');
        } else {
          // Si l'utilisateur a inclus l'extension dans l'override, on la retire pour éviter le doublement
          if (trueExt && basePart.toLowerCase().endsWith(trueExt.toLowerCase())) {
            basePart = basePart.substring(0, basePart.length - trueExt.length);
          }
        }

        return `${basePart}${getFileSuffix()}${trueExt}`;
      }

      const uploadPromises = []

      // 1. Image de couverture
      let imageUrl = formData.image || ''
      let imagePath = formData.image_path || ''
      if (imageFile) {
        imagePath = `covers/${rename(imageFile.name)}`
        uploadPromises.push((async () => {
          await uploadToStorage('images', imagePath, imageFile)
          imageUrl = getPublicUrl('images', imagePath)
        })())
      }

      // 2. Fichier principal
      let fileUrl = ''
      let filePath = ''
      if (fileFile) {
        filePath = `${formData.type.toLowerCase()}s/${rename(fileFile.name)}`
        uploadPromises.push((async () => {
          await uploadToStorage('files', filePath, fileFile)
          fileUrl = getPublicUrl('files', filePath)
        })())
      }

      // 3. Screenshots (Gallery)
      let screenshotUrls: string[] = formData.screenshots || []
      if (screenshots && screenshots.length > 0) {
        screenshotUrls = [] // Reset if new ones provided
        for (let i = 0; i < screenshots.length; i++) {
          const s = screenshots[i]
          const sPath = `screenshots/${rename(s.name)}`
          uploadPromises.push((async () => {
            const bucketType = s.type.startsWith('video/') ? 'files' : 'images'
            await uploadToStorage(bucketType as 'files' | 'images', sPath, s)
            screenshotUrls[i] = getPublicUrl(bucketType as 'files' | 'images', sPath)
          })())
        }
      }

      // 3b. Partner QR Code
      let partnerQrUrl = formData.partner_qr_url || ''
      if (formData.source === 'EXTERNAL' && partnerQRFile) {
        const qrPath = `partners_qr/${rename(partnerQRFile.name)}`
        uploadPromises.push((async () => {
          await uploadToStorage('images', qrPath, partnerQRFile)
          partnerQrUrl = getPublicUrl('images', qrPath)
        })())
      }

      // 4. Versions multi-plateformes
      let finalVersions: any[] = []
      if (versions && versions.length > 0) {
        versions.forEach(async (v: any, idx: number) => {
          if (v.file) {
            const vPath = `versions/${rename(v.file.name)}`
            uploadPromises.push((async () => {
              await uploadToStorage('files', vPath, v.file)
              finalVersions[idx] = { label: v.label, url: vPath, size: v.size, os: v.os }
            })())
          } else if (v.url) {
            finalVersions[idx] = { label: v.label, url: v.url, size: v.size, os: v.os }
          }
        })
      }

      // 5. Modules de formation (Fichiers uniquement)
      const moduleUploadResults: { name: string, type: any, file_url: string, file_path: string }[] = []
      if (formData.type === 'Formation' && modules.length > 0) {
        modules.forEach((mod, idx) => {
          if (mod.file) {
            const mPath = `modules/${rename(mod.file.name)}`
            uploadPromises.push((async () => {
              await uploadToStorage('files', mPath, mod.file as File)
              moduleUploadResults[idx] = {
                name: mod.name,
                type: mod.type,
                file_url: getPublicUrl('files', mPath),
                file_path: mPath
              }
            })())
          }
        })
      }

      // 5b. Photos des contributeurs
      const finalContributors = [...contributors]
      contributors.forEach((c, idx) => {
        if (c.file) {
          const cPath = `contributors/${rename(c.file.name)}`
          uploadPromises.push((async () => {
            await uploadToStorage('images', cPath, c.file as File)
            finalContributors[idx] = { ...finalContributors[idx], photo_url: getPublicUrl('images', cPath) }
            delete finalContributors[idx].file // Ne pas stocker le File object en DB
          })())
        }
      })

      // Attendre tous les uploads
      await Promise.all(uploadPromises)

      // 6. Insertion / Mise à jour Produit
      const productPayload = {
        ...formData,
        price: parseFloat(formData.price || '0'),
        image: imageUrl,
        file_url: fileUrl || formData.file_url,
        file_path: filePath || formData.file_path,
        image_path: imagePath,
        screenshots: screenshotUrls.filter(Boolean),
        contributors: finalContributors.filter(c => c.name.trim()).map(({ file, ...rest }) => rest),
        roadmap: formData.roadmap,
        is_project: formData.is_project,
        ranking_position: parseInt(formData.ranking_position?.toString() || '0') || 0,
        multi_types: formData.multi_types,
        access_type: formData.access_type,
        price_fcfa: parseInt((formData.price_fcfa || 0).toString()) || 0,
        price_eur: parseFloat((formData.price_eur || 0).toString()) || 0,
        ads_video_count: parseInt((formData.ads_video_count || 0).toString()) || 0,
        ads_video_price: parseFloat((formData.ads_video_price || 0).toString()) || 0,
        display_config: formData.display_config,
        versions: finalVersions.length > 0 ? finalVersions.filter(Boolean) : versions,
        relations: formData.relations,
        partner_qr_url: partnerQrUrl
      }

      let resultProduct: any = null

      if (editId) {
        const { data, error: pError } = await supabase.from('products').update(productPayload).eq('id', editId).select().single()
        if (pError) throw pError
        resultProduct = data
      } else {
        const { data, error: pError } = await supabase.from('products').insert([productPayload]).select().single()
        if (pError) throw pError
        resultProduct = data
      }

      // 7. Insertion Modules (si Formation)
      if (formData.type === 'Formation' && moduleUploadResults.length > 0) {
        if (editId) {
          // On nettoie les anciens modules avant de ré-insérer (Plus simple que l'update complexe)
          await supabase.from('training_modules').delete().eq('product_id', editId)
        }

        const modulesToInsert = moduleUploadResults.filter(Boolean).map((res, i) => ({
          product_id: resultProduct.id,
          name: res.name,
          type: res.type,
          file_url: res.file_url,
          file_path: res.file_path,
          order_index: i
        }))

        const { error: mError } = await supabase.from('training_modules').insert(modulesToInsert)
        if (mError) throw mError
      }

      setMessage({ type: 'success', text: 'Produit lancé avec succès !' })

      // Clear persistence on success
      sessionStorage.removeItem('add_product_form')
      sessionStorage.removeItem('add_product_modules')
      sessionStorage.removeItem('add_product_contributors')

      setTimeout(() => navigate(`/${ARDES_CONFIG.ADMIN_PATH}/manage`), 2000)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message })
    } finally { setLoading(false) }
  }

  if (settingsLoading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Synchronisation des protocoles...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <FormNavigator sections={[
        { id: 'id-identity', label: 'Identité', icon: <IconPackage size={16} /> },
        { id: 'id-media', label: 'Médias', icon: <IconDeviceMobile size={16} /> },
        { id: 'id-pricing', label: 'Payement & Ads', icon: <IconCreditCard size={16} /> },
        { id: 'id-visibility', label: 'Visibilité', icon: <IconGlobe size={16} /> },
        { id: 'id-development', label: 'Projet', icon: <IconSettings size={16} /> },
        { id: 'id-links', label: 'Ressources', icon: <IconGrid size={16} /> },
      ]} />

      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl transition-all hover:bg-zinc-800 text-gray-400">←</button>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Lancement Produit</h2>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Store Inventory Management</p>
          </div>
        </div>

        {/* Barre d'actions adaptée au mobile (Bouton text hidden xs:inline — plus agressif que sm) */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mb-2 scrollbar-hide snap-x no-scrollbar">
          <button
            type="button"
            onClick={() => setShowMiniLab(!showMiniLab)}
            className={`flex items-center gap-3 border px-4 sm:px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap snap-center ${showMiniLab ? 'bg-gold text-black border-gold' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            <IconEye size={16} />
            <span className="hidden leading-none sm:inline">{showMiniLab ? 'Masquer Mini-Lab' : 'Aperçu Rapide'}</span>
          </button>

          <button
            type="button"
            onClick={handleARDESLab}
            className="flex items-center gap-3 bg-zinc-900 border border-gold/30 px-4 sm:px-6 py-3 rounded-2xl text-[10px] font-black text-gold uppercase tracking-[0.2em] hover:bg-gold hover:text-black transition-all shadow-xl shadow-gold/5 whitespace-nowrap snap-center"
          >
            <div className="p-1 bg-gold/10 rounded-lg shrink-0">
              <IconDeviceMobile size={14} strokeWidth={3} />
            </div>
            <span className="hidden leading-none sm:inline">Ouvrir AR-DES Lab</span>
          </button>
        </div>
      </div>

      {/* Mini-Lab Section (Conditionnelle) */}
      {showMiniLab && (
        <div className="mb-8 animate-in slide-in-from-top-8 duration-500">
          <ARDES
            mode="mobile"
            modelName="Mini-Lab Express"
            isMiniLab={true}
            onSendToLab={handleARDESLab}
            productData={{
              name: formData.name || 'Produit Sans Nom',
              image: imagePreview || 'https://via.placeholder.com/300x450?text=AUCUNE+IMAGE',
              screenshots: screenshotPreviews.length > 0 ? screenshotPreviews : ['https://via.placeholder.com/600x400?text=SANS+SCREENSHOT'],
              category: formData.type || 'Application',
              price: formData.price || '0',
              os: formData.os || 'Android'
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12 pb-32">
        {/* SECTION 1: INFOS GENERALES */}
        <div id="id-identity" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-1.5 h-6 bg-gold rounded-full" />
            <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Informations Fondamentales</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nom de l'app / Logiciel</label>
              <input name="name" required value={formData.name} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold transition-all outline-none" placeholder="Ex: AR Business App" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Catégorie (Type)</label>
              <select
                name="type"
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value
                  const catObj = dbCategories.find(c => c.name === newType)
                  const firstSub = (dbSubtypes || []).find(s => s.category_id === catObj?.id)?.name || ''
                  setFormData(prev => ({
                    ...prev,
                    type: newType,
                    sub_type: firstSub
                  }))
                }}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none"
              >
                {dbCategories.length > 0 ? (
                  dbCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Application">Application</option>
                    <option value="Logiciel">Logiciel</option>
                    <option value="Jeu">Jeu</option>
                    <option value="Formation">Formation</option>
                    <option value="Outil">Outil</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Source du Produit</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none"
              >
                <option value="AR BUSINESS">AR BUSINESS (Interne)</option>
                <option value="EXTERNAL">EXTERNE (Partenaire)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Sous-Type / Classification</label>
              <select
                name="sub_type"
                value={formData.sub_type}
                onChange={handleChange}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none"
              >
                {/* Fallback to Categories Config if DB list is empty */}
                {(() => {
                  const currentCat = dbCategories.find(c => c.name === formData.type)
                  const dbMatches = dbSubtypes.filter(s => currentCat ? s.category_id === currentCat.id : false)

                  if (dbMatches.length > 0) {
                    return dbMatches.map(sub => (
                      <option key={sub.id} value={sub.name}>{sub.name}</option>
                    ))
                  }

                  // Static Fallback
                  const staticMatches = CATEGORIES_CONFIG[formData.type]?.subtypes || []
                  return staticMatches.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))
                })()}
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 md:col-span-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                  {formData.type === 'Jeu' ? 'Plateforme' : formData.type === 'Formation' ? 'Format de Formation' : 'OS / Plateforme'}
                </label>
                <select name="os" value={formData.os} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                  {formData.type === 'Jeu' ? (
                    (CATEGORIES_CONFIG['Jeu']?.platforms || []).map(p => <option key={p} value={p}>{p}</option>)
                  ) : formData.type === 'Formation' ? (
                    FORMATION_CONFIG.formats.map(f => <option key={f.id} value={f.label}>{f.label}</option>)
                  ) : (
                    OS_LIST.map(o => <option key={o} value={o}>{o}</option>)
                  )}
                </select>
              </div>

              {/* Formation: Niveau */}
              {formData.type === 'Formation' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Niveau</label>
                  <select name="formation_level" value={(formData as any).formation_level || 'debutant'} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                    {FORMATION_CONFIG.levels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
              )}

              {/* Jeu: Genre */}
              {formData.type === 'Jeu' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Genre de Jeu</label>
                  <select name="game_genre" value={(formData as any).game_genre || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                    <option value="">— Choisir un genre —</option>
                    {(CATEGORIES_CONFIG['Jeu']?.gameGenres || []).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Version (Pack/Générale)</label>
                <input name="version" value={formData.version} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" placeholder="1.0.0" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Édition (ex: Edition 2026, Office Pack)</label>
                <input name="edition" value={formData.edition} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" placeholder="Edition Gold..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Position Top 10 (1-10, 0=Auto)</label>
                <input type="number" name="ranking_position" value={formData.ranking_position} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" min="0" max="100" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Statut</label>
                <div className="relative">
                  <select
                    name="status"
                    value={['Stable', 'Beta', 'Alpha', 'Legacy', 'Online', 'Offline', 'Soon'].includes(formData.status) ? formData.status : 'Custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'Custom') {
                        setFormData(prev => ({ ...prev, status: e.target.value }))
                      } else {
                        setFormData(prev => ({ ...prev, status: '' }))
                      }
                    }}
                    className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none"
                  >
                    <option>Stable</option>
                    <option>Beta</option>
                    <option>Alpha</option>
                    <option>Legacy</option>
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Soon</option>
                    <option value="Custom">Autre (Saisie libre...)</option>
                  </select>
                  {!['Stable', 'Beta', 'Alpha', 'Legacy', 'Online', 'Offline', 'Soon'].includes(formData.status) && (
                    <input
                      type="text"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      placeholder="Entrez un statut personnalisé..."
                      className="mt-2 w-full bg-zinc-900 border border-gold/30 rounded-xl p-3 text-xs text-gold outline-none animate-in fade-in slide-in-from-top-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Formation: Certificat */}
            {formData.type === 'Formation' && (
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4 bg-black/30 p-5 rounded-3xl border border-zinc-800">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Domaine de Formation</label>
                  <select name="formation_domain" value={(formData as any).formation_domain || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                    <option value="">— Choisir un domaine —</option>
                    {(CATEGORIES_CONFIG['Formation']?.domains || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Certificat</label>
                  <select name="formation_certificate" value={(formData as any).formation_certificate || 'none'} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                    {FORMATION_CONFIG.certificates.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Modèle Monétisation Formation</label>
                  <select name="formation_monetization" value={(formData as any).formation_monetization || ''} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                    <option value="">— Choisir —</option>
                    {(CATEGORIES_CONFIG['Formation']?.monetizationTypes || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="md:col-span-3 space-y-4 bg-black/30 p-6 rounded-3xl border border-zinc-800">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block">Classifications Multi-Types (Ads Pro compatible)</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORIES_CONFIG) || []).map(cat => (
                  <label key={cat} className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer ${(formData.multi_types || []).includes(cat) ? 'bg-gold/10 border-gold text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={(formData.multi_types || []).includes(cat)}
                      onChange={e => {
                        const checked = e.target.checked
                        setFormData(prev => ({
                          ...prev,
                          multi_types: checked ? [...(prev.multi_types || []), cat] : (prev.multi_types || []).filter(c => c !== cat)
                        }))
                      }}
                    />
                    <span className="text-[10px] font-bold uppercase">{cat}</span>
                  </label>
                ))}
              </div>
              <p className="text-[9px] text-zinc-600 italic">Sélectionnez tous les types qui s'appliquent (ex: Un jeu qui est aussi un outil de formation).</p>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description Courte (Max 100 char)</label>
              <input name="short_desc" maxLength={100} value={formData.short_desc} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none" placeholder="Résumé accrocheur pour la carte..." />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description Détaillée</label>
              <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold transition-all outline-none resize-none" placeholder="Expliquez les fonctionnalités, le mode d'emploi..." />
            </div>

            {/* SECTION PARTENAIRE (CONDITIONNELLE) */}
            {formData.source === 'EXTERNAL' && (
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gold/5 p-8 rounded-[32px] border border-gold/20 animate-in zoom-in-95 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center">
                      <IconBriefcase size={16} className="text-gold" strokeWidth={2.5} />
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Informations Partenaire</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nom de l'Entité / Partenaire</label>
                      <input name="partner_name" value={formData.partner_name} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xs focus:border-gold outline-none" placeholder="Ex: Microsoft, Congo Web..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Lien vers le site partenaire</label>
                      <input name="partner_link" value={formData.partner_link} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xs focus:border-gold outline-none" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">QR Code du Partenaire (Photo/Img)</label>
                  <div className="relative group aspect-square max-w-[200px] mx-auto bg-black rounded-3xl border-2 border-dashed border-gold/30 flex items-center justify-center overflow-hidden transition-all hover:border-gold">
                    {partnerQRPreview ? (
                      <img src={partnerQRPreview} className="w-full h-full object-contain p-4" alt="QR Preview" />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-2 group-hover:border-gold transition-colors">
                          <IconPackage size={24} className="text-zinc-600 group-hover:text-gold" />
                        </div>
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Uploader QR</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setPartnerQRFile(file)
                          setPartnerQRPreview(URL.createObjectURL(file))
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[9px] text-zinc-600 text-center italic font-medium px-4">Le QR code sera affiché dans les détails du produit sur le Store.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: MEDIAS & FICHIERS */}
        <div id="id-media" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-1.5 h-6 bg-gold rounded-full" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Contenu Média</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Image de Couverture * (16:9)</label>
                <div className="relative group aspect-video bg-black rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden transition-all hover:border-gold/50">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center"><p className="text-xs text-zinc-600 font-bold uppercase tracking-widest">Cliquer pour uploader</p></div>
                  )}
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Screenshots Galerie (Images & Vidéos courtes)</label>
                <input type="file" multiple accept="image/*,video/mp4,video/webm" onChange={e => setScreenshots(e.target.files)} className="w-full text-[10px] text-zinc-600 file:bg-zinc-800 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-black file:uppercase file:cursor-pointer" />
                <div className="flex gap-2 overflow-x-auto py-2">
                  {screenshotPreviews.map((preview: any, i) => (
                    preview.type?.startsWith('video/') ? (
                      <video key={i} src={preview.url} className="h-16 w-12 object-cover rounded-lg border border-zinc-800" muted />
                    ) : (
                      <img key={i} src={preview.url || preview} className="h-16 w-12 object-cover rounded-lg border border-zinc-800" />
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-1.5 h-6 bg-gold rounded-full" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Fichiers & Taille</h3>
            </div>

            <div className="space-y-6">
              {formData.type !== 'Formation' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Fichier du Produit (APK, ZIP, EXE...)</label>
                    <input type="file" onChange={handleFileChange} className="w-full text-[10px] text-zinc-600 file:bg-zinc-800 file:text-gold file:border-0 file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-black file:uppercase file:cursor-pointer" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Taille du Produit (Mo, Go...)</label>
                    <input name="size" value={formData.size} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xs focus:border-gold outline-none" placeholder="Ex: 45 Mo (Auto-détecté)" />
                  </div>

                  {/* Champ nom de fichier personnalisé */}
                  <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1 flex items-center gap-2">
                        <IconPackage size={12} />
                        Nom du fichier (Base)
                      </label>
                      <input
                        name="file_name_override"
                        value={(formData as any).file_name_override || ''}
                        onChange={handleChange}
                        className="w-full bg-black border border-gold/30 rounded-xl p-3 text-sm focus:border-gold outline-none text-gold mt-1"
                        placeholder="Ex: Casier_d_Or_V2.1"
                      />
                    </div>

                    {formData.source === 'EXTERNAL' && (
                      <div className="animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Source pour Suffixe Externe</label>
                        <input
                          name="custom_source_suffix"
                          value={(formData as any).custom_source_suffix || ''}
                          onChange={handleChange}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-gold outline-none text-white mt-1"
                          placeholder="Ex: PlayStore, GitHub, etc."
                        />
                      </div>
                    )}

                    <div className="pt-2 border-t border-gold/10">
                      <p className="text-[9px] text-zinc-500 italic">Aperçu final du fichier :</p>
                      <p className="text-[11px] text-white font-black break-all">
                        {((formData as any).file_name_override || 'fichier').replace(/ /g, '_')}
                        <span className="text-gold">
                          {formData.source === 'EXTERNAL'
                            ? `_FROM_ARB-DS_EXT_FROM_${((formData as any).custom_source_suffix || (formData.partner_name || 'EXT')).split(' ')[0].toUpperCase()}`
                            : '_FROM_ARB-DS'}
                        </span>
                        .apk
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SECTION: PAYEMENT & ADS (CENTRALIZED) */}
            <div id="id-pricing" className="pt-8 border-t border-zinc-800 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                  <IconCreditCard size={18} className="text-gold" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Barrière de Payement & Ads</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Modèle Boutique</label>
                  <select name="monetization_type" value={formData.monetization_type} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                    {MONETIZATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 block mt-2">Accès Technique</label>
                  <select name="access_type" value={formData.access_type} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none">
                    <option value="direct">Téléchargement Direct</option>
                    <option value="reward">Accès Récompensé (Watch Ad)</option>
                    <option value="payant">Paiement Requis (Redirection)</option>
                  </select>
                </div>

                {/* Ads Linkage Config */}
                <div className="md:col-span-2 bg-black/40 p-6 rounded-3xl border border-zinc-800 space-y-6">
                  <div className="flex items-center gap-3 opacity-60">
                    <IconMonitor size={14} className="text-gold" />
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">Configuration Ads-to-Price</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nombre de Vidéos</label>
                      <input type="number" name="ads_video_count" value={formData.ads_video_count} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-gold outline-none" placeholder="10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Prix / Vidéo (USD)</label>
                      <input type="number" step="0.01" name="ads_video_price" value={formData.ads_video_price} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-gold outline-none" placeholder="0.20" />
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-600 italic">Le prix final sera calculé automatiquement : {formData.ads_video_count} × {formData.ads_video_price}$ = {formData.price}$</p>
                </div>
              </div>

              {/* Unified Price Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gold/5 p-6 rounded-3xl border border-gold/10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prix (USD)</label>
                    <input type="checkbox" name="show_usd" checked={formData.display_config?.show_usd} onChange={handleChange} className="accent-gold" />
                  </div>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prix (FCFA)</label>
                    <input type="checkbox" name="show_fcfa" checked={formData.display_config?.show_fcfa} onChange={handleChange} className="accent-gold" />
                  </div>
                  <input type="number" name="price_fcfa" value={formData.price_fcfa} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Prix (EUR)</label>
                    <input type="checkbox" name="show_eur" checked={formData.display_config?.show_eur} onChange={handleChange} className="accent-gold" />
                  </div>
                  <input type="number" step="0.01" name="price_eur" value={formData.price_eur} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-gold outline-none font-bold text-blue-400" />
                </div>
              </div>

              <label className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-zinc-800 cursor-pointer group">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="is_premium" checked={formData.is_premium} onChange={handleChange} className="sr-only peer" />
                  <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                </div>
                <div className="flex items-center gap-2">
                  <IconLock size={14} className="text-zinc-500 group-hover:text-gold transition-colors" />
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-gold transition-colors">Marquer comme Produit Premium</span>
                </div>
              </label>

              {/* License Checkbox */}
              <label className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-zinc-800 cursor-pointer group">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="requires_license" checked={formData.requires_license} onChange={handleChange} className="sr-only peer" />
                  <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 group-hover:text-gold transition-colors font-mono font-black border border-current rounded-md px-1 text-[10px]">KEY</span>
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-gold transition-colors">Nécessite une clé d'activation interne</span>
                </div>
              </label>
            </div>

            {/* MULTI-VERSIONS UI */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Multi-Versions (APK, EXE...)</label>
                <button type="button" onClick={addVersion} className="text-[10px] font-black text-gold hover:text-white uppercase tracking-widest">+ Ajouter Version</button>
              </div>
              <div className="space-y-3">
                {(versions || []).map((v: any, i: number) => (
                  <div key={i} className="bg-black/60 p-4 rounded-2xl border border-zinc-800 space-y-3 relative">
                    <button type="button" onClick={() => removeVersion(i)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 font-black">×</button>
                    <input placeholder="Label (ex: Windows .exe)" value={v.label} onChange={e => updateVersion(i, 'label', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs focus:border-gold outline-none" />
                    <div className="grid grid-cols-3 gap-2">
                      <select value={v.os} onChange={e => updateVersion(i, 'os', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px] outline-none">
                        {(OS_LIST || []).map(os => <option key={os} value={os}>{os}</option>)}
                      </select>
                      <input placeholder="Version" value={v.version || ''} onChange={e => updateVersion(i, 'version', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px] outline-none" />
                      <input placeholder="Taille" value={v.size} onChange={e => updateVersion(i, 'size', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px] outline-none" />
                    </div>
                    <input type="file" onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        updateVersion(i, 'file', file)
                        updateVersion(i, 'size', formatBytes(file.size))
                        if (!v.label) updateVersion(i, 'label', file.name)
                      }
                    }} className="text-[8px] text-zinc-500" />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SECTION 1.5: RELATIONS & CONTRIBUTORS */}
          <div id="id-links" className="space-y-8">
            {/* LINKED PRODUCTS (PACKS) */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Produits Liés (Packs / Offres)</label>
                  <span className="text-[8px] text-zinc-600 uppercase tracking-tighter">Lier des produits existants à ce pack</span>
                </div>
                <button type="button" onClick={addRelation} className="text-[10px] font-black text-blue-400 hover:text-white uppercase tracking-widest">+ Lier un Produit</button>
              </div>
              <div className="space-y-3">
                {formData.relations.map((rel: any, i: number) => (
                  <div key={i} className="bg-black/60 p-4 rounded-2xl border border-zinc-800 space-y-3 relative">
                    <button type="button" onClick={() => removeRelation(i)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 font-black">×</button>
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={rel.product_id}
                        onChange={e => updateRelation(i, 'product_id', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs focus:border-gold outline-none"
                      >
                        {(allProducts || []).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        placeholder="Version (ex: 1.0)"
                        value={rel.version || ''}
                        onChange={e => updateRelation(i, 'version', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs focus:border-gold outline-none"
                      />
                      <input
                        placeholder="Relation (ex: Inclus...)"
                        value={rel.relation_label}
                        onChange={e => updateRelation(i, 'relation_label', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-xs focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                ))}
                {formData.relations.length === 0 && (
                  <div className="text-center py-4 border-2 border-dashed border-zinc-800 rounded-2xl opacity-40">
                    <span className="text-[9px] font-bold uppercase text-zinc-600">Aucun produit lié</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: VISIBILITE & RANKING */}
        <div id="id-visibility" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-1.5 h-6 bg-gold rounded-full" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Placements Boutique</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(PLACEMENTS || []).map(p => (
                <label key={p.id} className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-zinc-800 cursor-pointer hover:border-gold/30 transition-all">
                  <input type="checkbox" checked={(formData.placements || []).includes(p.id)} onChange={e => {
                    const checked = e.target.checked
                    setFormData(prev => ({ ...prev, placements: checked ? [...(prev.placements || []), p.id] : (prev.placements || []).filter(pl => pl !== p.id) }))
                  }} className="w-4 h-4 accent-gold" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    {(() => {
                      const Icon = PLACEMENT_ICONS[p.id] || PLACEMENT_ICONS.new
                      return <Icon size={14} className="text-zinc-500" />
                    })()}
                    {p.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-6 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gold rounded-full" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Équipe & Crédits</h3>
              </div>
              <button type="button" onClick={addContributor} className="text-[10px] font-black text-gold hover:text-white uppercase tracking-widest transition-all">+ Ajouter</button>
            </div>
            <div className="space-y-4">
              {(contributors || []).map((c, i) => (
                <div key={i} className="bg-black/40 p-4 rounded-2xl border border-zinc-800 space-y-3 relative group">
                  <button type="button" onClick={() => removeContributor(i)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 transition-all">×</button>
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center group-hover:border-gold/30 transition-all shrink-0">
                      {c.photo_url || (c.file instanceof Blob) ? (
                        <img src={c.photo_url || (c.file instanceof Blob ? URL.createObjectURL(c.file) : '')} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <span className="text-[10px] font-black text-zinc-700">IMG</span>
                      )}
                      <input type="file" accept="image/*" onChange={e => updateContributor(i, 'file', e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input placeholder="Nom du membre" value={c.name} onChange={e => updateContributor(i, 'name', e.target.value)} className="w-full bg-transparent border-b border-zinc-800 p-1 text-xs focus:border-gold outline-none" />
                      <input placeholder="Rôle (ex: Lead Dev)" value={c.role} onChange={e => updateContributor(i, 'role', e.target.value)} className="w-full bg-transparent border-b border-zinc-800 p-1 text-[10px] text-zinc-500 focus:border-gold outline-none" />
                    </div>
                  </div>
                </div>
              ))}
              {contributors.length === 0 && <p className="text-[10px] text-zinc-600 uppercase text-center py-4 font-bold italic tracking-widest">Aucun contributeur renseigné</p>}
            </div>
          </div>
        </div>

        {/* SECTION 4: FORMATION MODULES (CONDITIONAL) */}
        {
          formData.type === 'Formation' && (
            <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-gold/20 space-y-8 backdrop-blur-xl animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Programme de Formation</h3>
                </div>
                <button type="button" onClick={addModule} className="bg-gold text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">+ Ajouter un module</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(modules || []).map((mod, i) => (
                  <div key={mod.id_temp} className="bg-black/60 p-6 rounded-[32px] border border-zinc-800 space-y-4 relative">
                    <button type="button" onClick={() => removeModule(mod.id_temp)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-all">×</button>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gold">#{i + 1}</span>
                      <input placeholder="Titre du module" value={mod.name} onChange={e => handleModuleChange(mod.id_temp, 'name', e.target.value)} className="flex-1 bg-transparent border-b border-zinc-800 p-2 text-xs focus:border-gold outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select value={mod.type} onChange={e => handleModuleChange(mod.id_temp, 'type', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs">
                        <option value="video">Vidéo</option><option value="pdf">Document</option><option value="zip">Archive</option>
                      </select>
                      <input type="file" onChange={e => handleModuleChange(mod.id_temp, 'file', e.target.files?.[0] || null)} className="text-[9px] text-zinc-600 self-center" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }

        {/* SECTION 5: MODE PROJET / ROADMAP */}
        <div id="id-development" className="bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-800 space-y-8 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic text-blue-400">Mode Projet / Roadmap</h3>
            </div>
            <label className="flex items-center gap-4 cursor-pointer group">
              <span className="text-[10px] font-black text-zinc-500 group-hover:text-blue-400 uppercase tracking-widest transition-all">Activer le statut projet</span>
              <div className="relative inline-flex items-center">
                <input type="checkbox" name="is_project" checked={formData.is_project} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>

          {formData.is_project && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phase Actuelle</label>
                  <select name="project_phase" value={formData.project_phase} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all">
                    <option value="announcement">📢 Annonce</option>
                    <option value="development">🔧 En Développement Actif</option>
                    <option value="testing">🧪 Bêta-Test Public</option>
                    <option value="reported">🟠 Reporté</option>
                    <option value="cancelled">🔴 Annulé</option>
                    <option value="finalized">🚀 Finalisé</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Date Estimée</label>
                  <input name="estimated_date" value={formData.estimated_date} onChange={handleChange} className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none" placeholder="Ex: Mars 2026" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Jalons & Roadmap</label>
                  <button type="button" onClick={addRoadmapEntry} className="text-[10px] font-black text-blue-400 hover:text-white uppercase transition-all">+ Ajouter une étape</button>
                </div>
                <div className="space-y-3">
                  {(formData.roadmap || []).map((step, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-black/40 border border-zinc-800 rounded-2xl relative group">
                      <button type="button" onClick={() => removeRoadmapEntry(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                      <input placeholder="Date" value={step.date} onChange={e => updateRoadmapEntry(i, 'date', e.target.value)} className="w-full sm:w-32 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px]" />
                      <input placeholder="Titre de l'étape" value={step.label} onChange={e => updateRoadmapEntry(i, 'label', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px]" />
                      <input placeholder="Description" value={step.desc} onChange={e => updateRoadmapEntry(i, 'desc', e.target.value)} className="flex-[2] bg-zinc-900 border border-zinc-800 rounded-xl p-2 text-[10px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="pt-8">
          <button type="submit" disabled={loading} className="w-full bg-gold py-6 rounded-3xl font-black text-black uppercase tracking-[0.3em] hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(212,175,55,0.2)] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl">
            {loading ? (
              <>
                <div className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Traitement en cours...</span>
              </>
            ) : (
              'Lancer sur le Store'
            )}
          </button>
          {message && <p className={`mt-6 text-center font-black uppercase tracking-widest text-xs italic ${message.type === 'success' ? 'text-green-500' : 'text-red-500 animate-pulse'}`}>{message.text}</p>}
        </div>
      </form >
    </div >
  )
}
