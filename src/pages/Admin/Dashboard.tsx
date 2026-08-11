import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  IconPlus,
  IconGrid,
  IconMegaphone,
  IconBriefcase,
  IconUsers,
  IconSettings,
  IconArrowLeft,
  IconDeviceMobile,
  IconChartBar,
  IconSparkle,
  IconUser,
  IconPackage,
  IconHistory,
  IconCheck,
  IconShield,
  IconX,
  IconCenterLogo,
  IconStats
} from '../../components/Icons'
import AIAgentSystem from '../../components/AI/AIAgentSystem'
import { ARDES_CONFIG } from '../../config/ardes_config'
import { pushStoreUpdates, getAdminHistory } from '../../services/admin'

function NavItem({
  to,
  icon,
  label,
  variant = 'default'
}: {
  to: string
  icon: React.ReactNode
  label: string
  variant?: 'default' | 'gold' | 'blue'
}) {
  const location = useLocation()
  const ADMIN_BASE = ARDES_CONFIG.ADMIN_PATH
  const isActive = location.pathname.includes(`/${ADMIN_BASE}/${to}`) || (to === 'add' && location.pathname.endsWith(`/${ADMIN_BASE}/add`))

  const base = 'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 border'

  const variants = {
    default: isActive
      ? 'bg-zinc-700 text-white border-zinc-600 shadow-sm'
      : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white hover:border-zinc-700',
    gold: isActive
      ? 'bg-gold text-black border-gold shadow-md shadow-gold/20'
      : 'bg-gold/10 text-gold border-gold/30 hover:bg-gold/20 hover:border-gold/50',
    blue: isActive
      ? 'bg-blue-700/80 text-white border-blue-600'
      : 'bg-blue-900/30 text-blue-300 border-blue-800/50 hover:bg-blue-800/40 hover:border-blue-700',
  }

  return (
    <Link to={to} className={`${base} ${variants[variant]}`}>
      {icon}
      <span>{label}</span>
    </Link>
  )
}

// ── History Modal ──────────────────────────────────────────────────────────────
function HistoryModal({ onClose }: { onClose: () => void }) {
  const [logs, setLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    getAdminHistory(30).then(data => {
      setLogs(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const formatAction = (log: any) => {
    if (log.action === 'push_updates') return 'Système Mis à Jour'
    if (log.type === 'download') return `Téléchargement: ${log.details?.product_name || 'Produit'}`
    if (log.type === 'admin_action') return `Action Admin: ${log.action}`
    if (log.action) return String(log.action).replace(/_/g, ' ').toUpperCase()
    return log.type || 'Événement Système'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Historique <span className="text-gold">Admin</span></h2>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-1">Dernières 30 actions enregistrées</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all">
            <IconX size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 scrollbar-hide">
          {loading ? (
            <div className="py-10 text-center animate-pulse text-[10px] font-black text-zinc-700 uppercase tracking-widest">Chargement...</div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Aucune action enregistrée</div>
          ) : (
            logs.map((log, i) => {
              const isExpanded = expandedId === log.id
              return (
                <div
                  key={i}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${isExpanded ? 'bg-zinc-800 border-zinc-600' : 'bg-zinc-800/40 border-zinc-700/30 hover:border-zinc-600/50'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${log.type === 'download' ? 'bg-gold/10 text-gold' : 'bg-zinc-700 text-zinc-400'}`}>
                      {log?.action === 'push_updates' ? <IconSparkle size={14} /> : log.type === 'download' ? <IconPackage size={14} /> : <IconHistory size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black text-white tracking-tight leading-tight">
                        {formatAction(log)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-zinc-500 font-bold">{log?.user_email ?? 'Utilisateur Inconnu'}</span>
                        <span className="text-[8px] text-zinc-600 font-bold px-1.5 py-0.5 rounded bg-zinc-800">
                          {log.ip || 'IP cachée'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] text-zinc-400 font-bold whitespace-nowrap shrink-0">
                      {log && (log.timestamp || log.created_at) ? new Date(log.timestamp ?? log.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-zinc-700/50 animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Détails de l'action</p>
                      <div className="bg-black/50 p-3 rounded-xl border border-white/5 overflow-x-auto">
                        <pre className="text-[9px] text-zinc-400 font-mono">
                          {JSON.stringify(log.details || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin, adminData, signOut } = useAuth()
  const [showHistory, setShowHistory] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [pushResult, setPushResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleLogout = async () => {
    try {
      await signOut()
      const ADMIN_BASE = ARDES_CONFIG.ADMIN_PATH
      navigate(`/${ADMIN_BASE}/login`) // Utiliser le bon chemin obfusqué
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  async function handlePushUpdates() {
    if (pushing) return
    setPushing(true)
    setPushResult(null)
    try {
      const results = await pushStoreUpdates(adminData?.email ?? 'admin')
      setPushResult({ ok: true, msg: results.join('\n') })
    } catch (err: any) {
      setPushResult({ ok: false, msg: err.message })
    } finally {
      setPushing(false)
      setTimeout(() => setPushResult(null), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* ── Header Admin Bar ── */}
      <div className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">

          {/* Push Result Banner */}
          {pushResult && (
            <div className={`mb-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${pushResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {pushResult.ok ? <IconCheck size={14} /> : <IconX size={14} />}
              <span className="whitespace-pre-wrap">{pushResult.msg}</span>
            </div>
          )}

          {/* Titre + Profil + Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 shadow-lg">
                {adminData?.avatar_url ? (
                  <img src={adminData.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <IconUser size={18} />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight leading-none flex items-center gap-2">
                  {adminData?.display_name || 'Admin'}
                  {adminData?.role === 'master' && <span className="text-[8px] bg-gold/10 text-gold border border-gold/20 px-1 rounded uppercase tracking-tighter">Master</span>}
                </h1>
                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">AR Business Command Center</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Historique — opens real modal */}
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all group"
                title="Consulter l'historique des actions admin"
              >
                <IconHistory size={14} className="group-hover:rotate-[-10deg] transition-transform" />
                <span className="hidden md:inline uppercase tracking-widest">Historique</span>
              </button>

              {/* Push Updates — real functionality */}
              <button
                onClick={handlePushUpdates}
                disabled={pushing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black bg-gold text-black border border-gold hover:bg-white hover:border-white transition-all group shadow-lg shadow-gold/10 disabled:opacity-60 disabled:cursor-wait"
                title="Diffuser les modifications sur le store"
              >
                {pushing ? (
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <IconSparkle size={14} className="group-hover:animate-pulse" />
                )}
                <span className="hidden md:inline uppercase tracking-widest">
                  {pushing ? 'En cours...' : 'Push Updates'}
                </span>
              </button>

              <Link
                to="/store"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-500 border border-transparent hover:border-zinc-700 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
              >
                <IconArrowLeft size={14} />
                <span className="hidden sm:inline italic">Store</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-red-500/60 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 uppercase tracking-widest"
                title="Se déconnecter et fermer le Dashboard"
              >
                <IconX size={14} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>

          {/* ── Nav Tabs (Desktop) ── */}
          <div className="hidden lg:flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <NavItem to="add" variant="gold" icon={<IconPlus size={16} strokeWidth={2.5} />} label="Ajouter" />
            <NavItem to="manage" icon={<IconGrid size={15} />} label="Produits" />
            <NavItem to="ads" icon={<IconMegaphone size={15} />} label="Publicités" />
            <NavItem to="services" icon={<IconBriefcase size={15} />} label="Services" />
            <NavItem to="manage-community" icon={<IconUsers size={15} />} label="Communauté" />
            <NavItem to="center" variant="gold" icon={<IconCenterLogo size={15} />} label="Centre AR" />
            <NavItem to="projects" variant="blue" icon={<IconBriefcase size={15} />} label="Projets" />
            {isAdmin && adminData?.role === 'master' && (
              <NavItem to="users" variant="blue" icon={<IconUsers size={15} />} label="Admins" />
            )}
            <NavItem to="ardes" variant="blue" icon={<IconDeviceMobile size={15} />} label="AR-DES" />
            <NavItem to="stats" icon={<IconStats size={15} />} label="Données & Stats" />
            <NavItem to="archives" variant="blue" icon={<IconHistory size={15} />} label="Archives" />
            <NavItem to="settings" icon={<IconUser size={15} />} label="Profil & Sécurité" />
            <NavItem to="premium" variant="gold" icon={<IconShield size={15} />} label="Premium" />
            <NavItem to="visual" variant="gold" icon={<IconPackage size={15} />} label="Gestion Visuelle" />
          </div>

          {/* ── Mobile Android-First Summary Nav ── */}
          <div className="lg:hidden flex items-center justify-between bg-zinc-800/40 p-1.5 rounded-2xl border border-zinc-800/50">
             <div className="flex gap-1 overflow-x-auto scrollbar-hide px-2">
                <NavItem to="add" variant="gold" icon={<IconPlus size={14} />} label="Ajouter" />
                <NavItem to="manage" icon={<IconGrid size={14} />} label="Flux" />
                <NavItem to="center" variant="gold" icon={<IconCenterLogo size={14} />} label="Centre" />
                <NavItem to="visual" variant="gold" icon={<IconPackage size={14} />} label="Visuel" />
             </div>
             <button onClick={() => {}} className="p-2.5 text-zinc-500"><IconGrid size={16} /></button>
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 mb-20">
        {/* Bouton Retour — Android-first (flèche seule en mobile) */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-sm font-bold text-zinc-500 border border-transparent hover:border-zinc-700/60 hover:text-white hover:bg-zinc-800/40 active:scale-95 transition-all duration-200"
        >
          <IconArrowLeft size={18} strokeWidth={2.5} />
          <span className="hidden sm:inline uppercase tracking-widest text-[10px] font-black">Retour</span>
        </button>

        <div className="bg-zinc-900 rounded-[40px] border border-zinc-800 p-1 min-h-[60vh] shadow-2xl">
          <Outlet />
        </div>
      </div>

      {/* ── History Modal ── */}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}

      {/* SYSTÈME D'ASSISTANCE IA FLOTTANT */}
      <AIAgentSystem />

      {/* ── Android-First PERSISTANT BOTTOM NAV (Mobile Only) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-6 py-4 flex items-center justify-between pb-8">
        <Link to="manage" className="flex flex-col items-center gap-1 text-zinc-500 active:text-gold transition-colors">
          <IconGrid size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Store</span>
        </Link>
        <Link to="center" className="flex flex-col items-center gap-1 text-gold active:scale-95 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20 -mt-8 border-4 border-[#050505]">
            <IconCenterLogo size={24} className="text-black" />
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest mt-1">Centre</span>
        </Link>
        <Link to="visual" className="flex flex-col items-center gap-1 text-zinc-500 active:text-gold transition-colors">
          <IconSettings size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Studio</span>
        </Link>
      </div>
    </div>
  )
}
