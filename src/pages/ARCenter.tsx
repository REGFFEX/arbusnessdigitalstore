import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { getPublishedPosts, CenterPost } from '../services/center'
import CenterCard from '../components/Center/CenterCard'
import CenterFilters from '../components/Center/CenterFilters'
import CenterMediaViewer from '../components/Center/CenterMediaViewer'
import HorizontalShelf from '../components/Center/HorizontalShelf'
import { IconSparkle, IconClock, IconAlert, CENTER_TYPE_ICONS, IconCenterLogo } from '../components/Icons'

const PAGE_SIZE = 40

export default function ARCenter() {
  const [posts, setPosts] = useState<CenterPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [mediaViewer, setMediaViewer] = useState<{ url: string; type: 'image' | 'video' | 'audio' } | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadPosts = useCallback(async (reset = false) => {
    const newOffset = reset ? 0 : offset
    if (reset) setLoading(true)
    else setLoadingMore(true)

    try {
      // On charge un peu plus pour alimenter les étagères si filter === 'all'
      const loadSize = filter === 'all' ? 50 : PAGE_SIZE
      const data = await getPublishedPosts(loadSize, newOffset, filter === 'all' ? undefined : filter)
      
      if (reset) {
        setPosts(data as CenterPost[])
        setOffset(loadSize)
      } else {
        setPosts(prev => [...prev, ...(data as CenterPost[])])
        setOffset(prev => prev + loadSize)
      }
      setHasMore(data.length >= loadSize)
    } catch (e) {
      console.error('Erreur chargement Centre AR:', e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [offset, filter])

  useEffect(() => {
    loadPosts(true)
  }, [filter])

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || filter !== 'all') return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) loadPosts(false) },
      { rootMargin: '400px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadPosts, filter])

  // Grouping logic for "All" view
  const sections = useMemo(() => {
    if (filter !== 'all') return null
    
    return {
      pinned: posts.filter(p => p.pinned),
      critical: posts.filter(p => p.priority === 'critical' && !p.pinned),
      recent: posts.filter(p => p.priority !== 'critical' && !p.pinned).slice(0, 10),
      archives: posts.filter(p => p.priority !== 'critical' && !p.pinned).slice(10)
    }
  }, [posts, filter])

  // Detect blocks (grouped posts)
  const renderList = (postList: CenterPost[]) => {
    const renderedBlocks = new Set<string>()
    const result: React.ReactNode[] = []

    postList.forEach(post => {
      if (post.block_id && !renderedBlocks.has(post.block_id)) {
        const blockPosts = postList.filter(p => p.block_id === post.block_id).sort((a,b) => (a.block_order || 0) - (b.block_order || 0))
        renderedBlocks.add(post.block_id)
        result.push(
          <div key={`block-${post.block_id}`} className="space-y-1 mb-4 bg-zinc-900/20 p-1 rounded-[36px] border border-gold/10">
            {blockPosts.map(p => (
              <CenterCard key={p.id} post={p} onMediaClick={setMediaViewer} isGrouped />
            ))}
          </div>
        )
      } else if (!post.block_id) {
        result.push(<CenterCard key={post.id} post={post} onMediaClick={setMediaViewer} />)
      }
    })

    return result
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black pb-20">
      
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-gold/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[50%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Modern Hero */}
      <div className="relative pt-12 pb-8 sm:pt-20 sm:pb-12 border-b border-zinc-900 mx-4 sm:mx-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
                  <IconCenterLogo size={28} className="text-black" />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none mb-1">
                    Centre <span className="text-gold">AR</span>
                  </h1>
                  <p className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Hub Multimédia & Flux Social</p>
                </div>
              </div>
            </div>
            
            {/* View Stats & Actions */}
            <div className="flex items-center gap-3 sm:mb-2">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl px-4 py-2 flex flex-col items-center min-w-[80px]">
                <span className="text-lg font-black text-white leading-none">{posts.length}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase mt-1">Éléments</span>
              </div>
              <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 p-1.5 rounded-2xl">
                 <button onClick={() => setViewMode('list')} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gold text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                   <span className="text-xs font-black uppercase">Liste</span>
                 </button>
                 <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gold text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                   <span className="text-xs font-black uppercase">Grille</span>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-900/50">
        <div className="max-w-[1400px] mx-auto">
          <CenterFilters active={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Main Feed */}
      <div className="max-w-[1400px] mx-auto mt-8 sm:mt-12 px-4 sm:px-8">
        
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-gold/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin shadow-lg shadow-gold/10" />
            </div>
            <p className="text-xs font-black text-gold/40 uppercase tracking-widest animate-pulse">Initialisation du flux...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center max-w-sm mx-auto">
            <div className={`w-24 h-24 rounded-[40px] bg-zinc-900/50 flex items-center justify-center text-5xl mb-8 border border-zinc-800 shadow-2xl`}>
               <IconCenterLogo size={48} className="text-zinc-700" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Flux vide ou hors ligne</h3>
            <p className="text-sm text-zinc-500 font-bold mb-8">Les publications programmées ou importantes s'afficheront ici très bientôt. Revenez plus tard !</p>
            <button onClick={() => loadPosts(true)} className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform">Actualiser</button>
          </div>
        ) : filter === 'all' && sections ? (
          <>
            {/* 1. Shelves Layout (YouTube/PlayStore style) */}
            {sections.pinned.length > 0 && (
              <HorizontalShelf 
                title="À la une / Épinglés" 
                subtitle="Sélection critique de l'équipe AR"
                icon={<IconSparkle size={18} />}
              >
                {sections.pinned.map(p => <CenterCard key={p.id} post={p} onMediaClick={setMediaViewer} />)}
              </HorizontalShelf>
            )}

            {sections.critical.length > 0 && (
              <HorizontalShelf 
                title="Alertes & Urgents" 
                subtitle="Informations nécessitant votre attention"
                icon={<IconAlert size={18} />}
              >
                {sections.critical.map(p => <CenterCard key={p.id} post={p} onMediaClick={setMediaViewer} />)}
              </HorizontalShelf>
            )}

            {/* 2. Main Vertical Feed for Recent + Archives */}
            <div className="mt-16 sm:mt-24">
               <div className="flex items-center gap-3 mb-8 px-4 sm:px-0">
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white shadow-lg"><IconClock size={18} /></div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">Flux des Actualités</h2>
               </div>
               
               <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8' : 'max-w-4xl mx-auto space-y-6 sm:space-y-8'}>
                  {renderList([...sections.recent, ...sections.archives])}
               </div>
            </div>
          </>
        ) : (
          /* Filtered or Simple View */
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8' : 'max-w-4xl mx-auto space-y-6 sm:space-y-8'}>
             {renderList(posts)}
          </div>
        )}

        {/* Sentinel for Infinite Scroll */}
        <div ref={sentinelRef} className="py-20 flex justify-center">
          {loadingMore && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
              <span className="text-[10px] font-black text-gold/30 uppercase tracking-widest">Récupération des données...</span>
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <div className="bg-zinc-900/30 border border-zinc-800/50 px-6 py-3 rounded-full">
              <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Fin de la transmission</span>
            </div>
          )}
        </div>
      </div>

      {/* Media Viewer Lightbox */}
      {mediaViewer && (
        <CenterMediaViewer media={mediaViewer} onClose={() => setMediaViewer(null)} />
      )}
    </div>
  )
}
