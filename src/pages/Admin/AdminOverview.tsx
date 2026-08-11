import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    IconGrid, IconBriefcase, IconMegaphone, IconDeviceMobile,
    IconChartBar, IconUsers, IconArrowRight, IconPackage, IconHistory
} from '../../components/Icons'
import { getStatsSummary, getAdminHistory, getProductPerformance } from '../../services/admin'
import { supabase } from '../../config/supabase'
import { Skeleton } from '../../components/Skeleton'

export default function AdminOverview() {
    const [stats, setStats] = useState({
        products: 0,
        services: 0,
        community: 0,
        workspaces: 0,
        downloads: 0
    })
    const [loading, setLoading] = useState(true)

    const [recentLogs, setRecentLogs] = useState<any[]>([])
    const [performance, setPerformance] = useState<any[]>([])
    const [isPulsing, setIsPulsing] = useState(false)

    useEffect(() => {
        fetchOverview()
        getAdminHistory(5).then(setRecentLogs).catch(e => console.error('Overview history error:', e))
        getProductPerformance().then(setPerformance).catch(e => console.error('Overview performance error:', e))

        // REAL-TIME SUBSCRIPTION
        const channel = supabase
            .channel('overview-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'download_logs' }, () => {
                fetchOverview()
                getProductPerformance().then(setPerformance)
                setIsPulsing(true)
                setTimeout(() => setIsPulsing(false), 2000)
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
                setRecentLogs(prev => [payload.new, ...prev].slice(0, 5))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function fetchOverview() {
        try {
            const summary = await getStatsSummary()

            // Mock workspaces count as it's in localStorage usually, but we could sync with DB if needed
            const ardesData = localStorage.getItem('ardes_workspaces')
            const wCount = ardesData ? JSON.parse(ardesData).length : 0

            setStats({
                products: summary.products,
                services: summary.services,
                community: summary.posts,
                workspaces: wCount,
                downloads: summary.downloads
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const cards = [
        { label: 'Produits', value: stats.products, icon: <IconGrid className="text-gold" />, path: 'manage', color: 'bg-gold/10' },
        { label: 'Services', value: stats.services, icon: <IconBriefcase className="text-blue-400" />, path: 'services', color: 'bg-blue-400/10' },
        { label: 'Communauté', value: stats.community, icon: <IconMegaphone className="text-pink-400" />, path: 'manage-community', color: 'bg-pink-400/10' },
        { label: 'AR-DES Lab', value: stats.workspaces, icon: <IconDeviceMobile className="text-green-400" />, path: 'ardes', color: 'bg-green-400/10' },
        { label: 'Téléchargements', value: stats.downloads, icon: <IconPackage className="text-zinc-400" />, path: 'stats', color: 'bg-zinc-400/10' },
    ]

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Master <span className="text-gold">Overview</span>
                    </h2>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em] mt-2 ml-1">Pilotage Intégral du Digital Store</p>
                </div>
                <div className="flex gap-2">
                    <Link to="stats" className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border border-gold/20 rounded-2xl text-[10px] font-black uppercase text-gold hover:bg-gold hover:text-black transition-all shadow-xl shadow-gold/5">
                        <IconChartBar size={16} /> Analyser tout
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cards.map((card, i) => (
                    <Link
                        key={i}
                        to={card.path}
                        className="group bg-zinc-900/40 border border-zinc-800/50 p-8 rounded-[40px] hover:border-gold/40 hover:bg-zinc-900/60 transition-all relative overflow-hidden"
                    >
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5`}>
                            {card.icon}
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{card.label}</p>
                        {loading ? (
                            <Skeleton className="h-10 w-20 bg-zinc-800" />
                        ) : (
                            <p className={`text-4xl font-black text-white tracking-tighter italic transition-all duration-300 ${card.label === 'Téléchargements' && isPulsing ? 'text-gold scale-110' : ''}`}>
                                {card.value}
                            </p>
                        )}
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Actions Rapides */}
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-10 rounded-[50px] backdrop-blur-xl relative">
                    <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 italic flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-gold rounded-full" />
                        Actions Prioritaires
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="add" className="flex items-center justify-between p-5 bg-black/40 border border-zinc-800/50 rounded-2xl hover:border-gold/30 hover:bg-black transition-all group shadow-sm">
                            <span className="text-[10px] font-black text-zinc-500 group-hover:text-gold tracking-widest uppercase">Nouveau Produit</span>
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-gold/10 transition-colors">
                                <IconArrowRight size={14} className="text-zinc-600 group-hover:text-gold" />
                            </div>
                        </Link>
                        <Link to="manage-community" className="flex items-center justify-between p-5 bg-black/40 border border-zinc-800/50 rounded-2xl hover:border-gold/30 hover:bg-black transition-all group shadow-sm">
                            <span className="text-[10px] font-black text-zinc-500 group-hover:text-gold tracking-widest uppercase">Publier Annonce</span>
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-gold/10 transition-colors">
                                <IconArrowRight size={14} className="text-zinc-600 group-hover:text-gold" />
                            </div>
                        </Link>
                        <Link to="add-service" className="flex items-center justify-between p-5 bg-black/40 border border-zinc-800/50 rounded-2xl hover:border-gold/30 hover:bg-black transition-all group shadow-sm">
                            <span className="text-[10px] font-black text-zinc-500 group-hover:text-gold tracking-widest uppercase">Nouveau Service</span>
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-gold/10 transition-colors">
                                <IconArrowRight size={14} className="text-zinc-600 group-hover:text-gold" />
                            </div>
                        </Link>
                        <Link to="ardes" className="flex items-center justify-between p-5 bg-black/40 border border-zinc-800/50 rounded-2xl hover:border-gold/30 hover:bg-black transition-all group shadow-sm">
                            <span className="text-[10px] font-black text-zinc-500 group-hover:text-gold tracking-widest uppercase">Lancer le Lab</span>
                            <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-gold/10 transition-colors">
                                <IconArrowRight size={14} className="text-zinc-600 group-hover:text-gold" />
                            </div>
                        </Link>
                    </div>
                </div>
                {/* État du Système IA */}
                <div className="bg-zinc-900/40 border border-zinc-800/50 p-10 rounded-[50px] relative overflow-hidden group backdrop-blur-xl">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold/10 blur-[120px] rounded-full group-hover:bg-gold/15 transition-all duration-1000" />
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gold rounded-full" />
                            Assistance IA
                        </h3>
                        <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full border border-gold/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            <span className="text-[9px] font-black text-gold uppercase tracking-widest">Connecté</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-gold via-yellow-500 to-yellow-600 rounded-[30px] flex items-center justify-center shadow-2xl shadow-gold/30 flex-shrink-0 animate-in zoom-in-50 duration-700">
                            <IconChartBar size={36} className="text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Status Cerveau</p>
                            <p className="text-2xl font-black text-white leading-tight italic uppercase tracking-tighter">
                                Prêt à <span className="text-gold">Propulser</span> vos données
                            </p>
                        </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed uppercase font-bold tracking-tight mb-8">
                        Vos agents <span className="text-white">(Queeny, Alex, Sézard)</span> ont accès aux dernières statistiques : <span className="text-gold">{stats.products}</span> produits et <span className="text-gold">{stats.community}</span> publications.
                    </p>

                    {/* LIVE FEED MINI */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                <IconHistory size={10} /> Flux en direct
                            </p>
                            <div className="w-1 h-1 rounded-full bg-gold animate-ping" />
                        </div>
                        {recentLogs.length === 0 ? (
                            <p className="text-[9px] text-zinc-700 italic font-bold uppercase">En attente d'activité...</p>
                        ) : (
                            recentLogs.map((log, i) => (
                                <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-500">
                                    <div className={`w-1 h-3 rounded-full shrink-0 ${log.type === 'download' ? 'bg-gold' : 'bg-blue-500'}`} />
                                    <p className="text-[10px] text-zinc-400 font-bold truncate flex-1">
                                        {log.type === 'download' ? (
                                            <><span className="text-gold/80">DL:</span> {log.details?.product_name || 'Produit'}</>
                                        ) : (log.action && log.action.length > 30 ? log.action.substring(0, 30) + '...' : log.action)}
                                    </p>
                                    <span className="text-[8px] text-zinc-700 font-black">
                                        {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Trending Products Table */}
            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[50px] p-10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Top <span className="text-gold">Performance</span></h3>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-1 ml-1">Produits les plus téléchargés</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                <th className="px-6 py-2">Nom du Produit</th>
                                <th className="px-6 py-2 text-center">DLs</th>
                                <th className="px-6 py-2 text-center">Vues</th>
                                <th className="px-6 py-2 text-right">Conversion</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performance.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-zinc-700 text-[10px] font-black uppercase italic">Analyse des tendances en cours...</td>
                                </tr>
                            ) : (
                                performance.slice(0, 5).map((p, i) => (
                                    <tr key={i} className="group bg-black/30 hover:bg-black/50 transition-all">
                                        <td className="px-6 py-4 rounded-l-3xl border-l border-y border-white/5">
                                            <div className="text-xs font-black text-white uppercase group-hover:text-gold transition-colors">{p.name}</div>
                                            <div className="text-[8px] text-zinc-600 font-bold mt-1">{p.id.substring(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4 border-y border-white/5 text-center">
                                            <span className="text-sm font-black text-gold tracking-tighter">{p.downloads}</span>
                                        </td>
                                        <td className="px-6 py-4 border-y border-white/5 text-center">
                                            <span className="text-xs font-bold text-zinc-400 font-mono italic">{p.views}</span>
                                        </td>
                                        <td className="px-6 py-4 rounded-r-3xl border-r border-y border-white/5 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-black text-white font-mono">{p.conversion}%</span>
                                                <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${Math.min(parseFloat(p.conversion), 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
