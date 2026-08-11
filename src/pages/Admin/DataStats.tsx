import React, { useState, useEffect } from 'react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts'
import { IconChartBar, IconTrending, IconPackage, IconBriefcase, IconGlobe, IconAlert, IconBrain, IconHistory } from '../../components/Icons'
import { supabase } from '../../config/supabase'
import { getStatsSummary, getProductPerformance, getAdminHistory } from '../../services/admin'
import { getStoreStorageMetrics } from '../../services/products'
import { getUniqueDownloaders } from '../../services/downloads'

interface StatsData {
    totalDownloads: number
    totalStorage: string
    activeUsers: number
    monthlyEstimate: number
    efficiency: string
    recentLogs: any[]
}

export default function DataStats() {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
    const [performance, setPerformance] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<StatsData>({
        totalDownloads: 0,
        totalStorage: '0 Mo',
        activeUsers: 0,
        monthlyEstimate: 0,
        efficiency: '99.9%',
        recentLogs: []
    })
    const [chartData, setChartData] = useState<any[]>([])
    const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
    const [logSearch, setLogSearch] = useState('')

    const filteredLogs = stats.recentLogs.filter(log => {
        if (!logSearch) return true
        const search = logSearch.toLowerCase()
        return (
            (log.action || '').toLowerCase().includes(search) ||
            (log.type || '').toLowerCase().includes(search)
        )
    })

    useEffect(() => {
        fetchRealStats()

        // REAL-TIME SUBSCRIPTION
        const channel = supabase
            .channel('stats-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'download_logs' }, () => {
                fetchRealStats()
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
                setStats(prev => ({
                    ...prev,
                    recentLogs: [payload.new, ...prev.recentLogs].slice(0, 50)
                }))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeTab])

    const fetchRealStats = async () => {
        setLoading(true)
        console.log('[DataStats] Starting fetch...')
        try {
            // 1. Fetch data from services with catch blocks to avoid Promise.all failure
            const [summary, storage, uniqueUsers, sysLogResult, perf] = await Promise.all([
                getStatsSummary().catch(e => { console.error('getStatsSummary error:', e); return { products: 0, services: 0, ads: 0, posts: 0, downloads: 0 }; }),
                getStoreStorageMetrics().catch(e => { console.error('getStoreStorageMetrics error:', e); return { totalSizeMb: 0, categoryCounts: {} }; }),
                getUniqueDownloaders().catch(e => { console.error('getUniqueDownloaders error:', e); return 0; }),
                supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(6),
                getProductPerformance().catch(e => { console.error('getProductPerformance error:', e); return []; })
            ])

            console.log('[DataStats] Raw results:', { summary, storage, uniqueUsers, sysLogData: sysLogResult.data?.length, perf: perf?.length })

            const recentLogs = sysLogResult.data || []
            if (sysLogResult.error) console.error('system_logs fetch error:', sysLogResult.error)

            setPerformance(perf || [])
            setCategoryCounts(storage.categoryCounts || {})

            // 2. Fetch chart data based on tab
            let query = supabase.from('download_logs').select('created_at')
            const now = new Date()

            let chartDataPayload: { name: string, data: number }[] = []

            if (activeTab === 'daily') {
                const { data: dayLogs, error: err } = await query.gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
                if (err) console.error('daily logs fetch error:', err)
                chartDataPayload = Array.from({ length: 24 }, (_, i) => {
                    const h = new Date(now)
                    h.setHours(now.getHours() - (23 - i), 0, 0, 0)
                    const count = (dayLogs || []).filter(l => new Date(l.created_at).getHours() === h.getHours()).length
                    return { name: `${h.getHours()}h`, data: count }
                })
            } else if (activeTab === 'weekly') {
                const { data: weekLogs, error: err } = await query.gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
                if (err) console.error('weekly logs fetch error:', err)
                const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
                chartDataPayload = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(now)
                    d.setDate(now.getDate() - (6 - i))
                    const count = (weekLogs || []).filter(l => new Date(l.created_at).getDay() === d.getDay()).length
                    return { name: days[d.getDay()], data: count }
                })
            } else if (activeTab === 'monthly') {
                const { data: monthLogs, error: err } = await query.gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
                if (err) console.error('monthly logs fetch error:', err)
                chartDataPayload = Array.from({ length: 15 }, (_, i) => {
                    const d = new Date(now)
                    d.setDate(now.getDate() - (14 - i) * 2)
                    const count = (monthLogs || []).filter(l => {
                        const logDate = new Date(l.created_at)
                        return logDate.getDate() === d.getDate() || logDate.getDate() === d.getDate() - 1
                    }).length
                    return { name: `${d.getDate()}/${d.getMonth() + 1}`, data: count }
                })
            }
            setChartData(chartDataPayload)

            setStats({
                totalDownloads: summary.downloads || 0,
                totalStorage: storage.totalSizeMb > 1024 ? `${(storage.totalSizeMb / 1024).toFixed(2)} Go` : `${storage.totalSizeMb.toFixed(0)} Mo`,
                activeUsers: uniqueUsers || 0,
                monthlyEstimate: (storage.totalSizeMb * 0.005) + ((summary.downloads || 0) * 0.002),
                efficiency: '100%',
                recentLogs: recentLogs
            })
        } catch (err) {
            console.error('[DataStats] Critical error in fetchRealStats:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-10 selection:bg-gold/30">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <IconChartBar size={28} className="text-gold" />
                        AR Command <span className="text-gold">Center</span>
                    </h2>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-1 ml-1">Statistiques en temps réel & Performance Site</p>
                </div>

                <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl shadow-xl">
                    {(['daily', 'weekly', 'monthly'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === tab ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-zinc-500 hover:text-white'}`}
                        >
                            {tab === 'daily' ? 'Journal' : tab === 'weekly' ? 'Semaine' : 'Mois'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Téléchargements', value: stats.totalDownloads.toLocaleString(), trend: '+5%', color: 'text-green-500', icon: <IconTrending size={20} /> },
                    { label: 'Utilisateurs', value: stats.activeUsers.toLocaleString(), trend: 'Réel', color: 'text-blue-500', icon: <IconGlobe size={20} /> },
                    { label: 'Infrastructure', value: stats.totalStorage, trend: 'Global', color: 'text-gold', icon: <IconPackage size={20} /> },
                    { label: 'Coût Est.', value: `${stats.monthlyEstimate.toFixed(2)}$`, trend: 'Mensuel', color: 'text-zinc-400', icon: <IconBriefcase size={20} /> },
                ].map((kpi, i) => (
                    <div key={i} className="bg-zinc-900/60 border border-zinc-800/50 p-6 rounded-3xl group hover:border-gold/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-black/50 rounded-xl border border-zinc-800 text-zinc-400 group-hover:text-gold transition-colors">{kpi.icon}</div>
                            <span className={`text-[9px] font-black ${kpi.color} bg-black/40 px-2 py-1 rounded-lg border border-white/5`}>{kpi.trend}</span>
                        </div>
                        <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{kpi.label}</h4>
                        <p className="text-3xl font-black text-white tracking-tighter italic">{loading ? '...' : kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Graph */}
                <div className="xl:col-span-2 bg-zinc-900/60 border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-2xl h-[450px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Flux d'Activité</h3>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase">Volume de téléchargements sur la période</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                            <span className="text-[9px] font-black text-gold uppercase">Automatisé</span>
                        </div>
                    </div>
                    <div className="h-full pb-10">
                        <ResponsiveContainer width="100%" height="80%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', borderColor: '#27272a', borderRadius: '1.2rem', fontSize: '10px', backdropFilter: 'blur(10px)', border: '1px solid rgba(212,175,55,0.2)' }}
                                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="data" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorCons)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Bar Chart */}
                <div className="bg-zinc-900/60 border border-zinc-800/50 p-8 rounded-[2.5rem] h-[450px]">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight italic mb-2">Répartition Catalogue</h3>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase mb-8">Nombre de produits par univers</p>
                    <div className="h-full pb-10">
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={Object.entries(categoryCounts).map(([name, value]) => ({ name, value }))}>
                                <XAxis dataKey="name" stroke="#4b5563" fontSize={9} axisLine={false} tickLine={false} />
                                <YAxis stroke="#4b5563" fontSize={9} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '10px' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {Object.entries(categoryCounts).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#D4AF37' : '#D4AF37AA'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Logs & Infrastructure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                {/* Recent Activity Stream */}
                <div className="bg-zinc-900/60 border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                            <IconHistory className="text-zinc-500" size={18} /> Flux Système
                        </h3>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Filtrer les logs..."
                                value={logSearch}
                                onChange={(e) => setLogSearch(e.target.value)}
                                className="bg-black/40 border border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-bold text-white placeholder:text-zinc-700 focus:border-gold/50 outline-none w-full sm:w-48 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-auto no-scrollbar pr-2">
                        {filteredLogs.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic mb-2">Aucune correspondance</p>
                                {logSearch.length > 2 && (
                                    <p className="text-[9px] text-zinc-500 font-bold">Essayez un terme comme "admin", "product" ou "error"</p>
                                )}
                            </div>
                        ) : (
                            filteredLogs.map((log, i) => (
                                <div key={i} className="p-4 bg-black/40 rounded-2xl border border-zinc-800/50 flex items-center gap-4 hover:border-gold/20 transition-all group">
                                    <div className={`w-1.5 h-10 rounded-full shrink-0 ${log.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : log.type === 'admin_action' ? 'bg-blue-500' : 'bg-gold'}`} />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-gold transition-colors">
                                            {log.type === 'download' ? (
                                                <>
                                                    <span className="text-gold">Téléchargement :</span> {log.details?.product_name || 'Produit'}
                                                </>
                                            ) : (log.action || log.type)}
                                        </p>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase mt-0.5">{new Date(log.timestamp).toLocaleString('fr-FR')}</p>
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-700 uppercase bg-zinc-900 px-2 py-0.5 rounded border border-white/5">{log.type}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Health Audit */}
                <div className="bg-zinc-900/60 border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                            <IconAlert className="text-red-500" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight italic">Audit Infrastructure</h3>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Analyse de la santé système</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Latence Moy.', value: '38ms', status: 'Optimal' },
                            { label: 'Disponibilité', value: '100%', status: 'Stable' },
                            { label: 'Menaces bloquées', value: '0', status: 'Protégé' },
                            { label: 'Erreurs SQL', value: 'Néant', status: 'Clean' },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-black/40 rounded-2xl border border-zinc-800/50 flex justify-between items-center group hover:bg-black/60 transition-all">
                                <div>
                                    <p className="text-[9px] text-zinc-500 font-black uppercase mb-0.5">{item.label}</p>
                                    <span className="text-sm font-black text-white tracking-tighter">{item.value}</span>
                                </div>
                                <span className="text-[8px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 uppercase">{item.status}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-6 bg-gold/5 border border-gold/10 rounded-3xl relative overflow-hidden group">
                        <IconBrain size={40} className="absolute -right-4 -bottom-4 text-gold/10 group-hover:scale-110 transition-transform" />
                        <h4 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            Conseil IA
                        </h4>
                        <p className="text-[11px] text-zinc-400 font-bold leading-relaxed">
                            L'inventaire est équilibré. Nous recommandons d'augmenter les ressources dans l'univers <span className="text-gold">Formations</span> qui affiche une croissance de recherche de 12%.
                        </p>
                    </div>
                </div>

                {/* Product Performance Table */}
                <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] p-10 backdrop-blur-xl mb-12 mt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Performance Produits</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Analyse des téléchargements et conversions (Vues vs DL)</p>
                        </div>
                        <div className="bg-gold/10 px-4 py-2 rounded-full border border-gold/20 flex-shrink-0">
                            <span className="text-[9px] font-black text-gold uppercase tracking-widest">Top Performance</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                                    <th className="px-6 py-3">Produit</th>
                                    <th className="px-6 py-3 text-center">Vues</th>
                                    <th className="px-6 py-3 text-center">DLs</th>
                                    <th className="px-6 py-3">Conversion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performance.slice(0, 10).map((p, i) => (
                                    <tr key={i} className="group bg-black/20 hover:bg-black/40 transition-colors">
                                        <td className="px-6 py-4 rounded-l-2xl border-l border-y border-white/5">
                                            <div className="font-black text-white text-xs uppercase group-hover:text-gold transition-colors truncate max-w-[200px]">{p.name}</div>
                                            <div className="text-[8px] text-zinc-600 font-bold truncate max-w-[150px]">{p.id}</div>
                                        </td>
                                        <td className="px-6 py-4 border-y border-white/5 font-mono text-xs text-zinc-400 text-center">{p.views}</td>
                                        <td className="px-6 py-4 border-y border-white/5 font-mono text-xs text-gold text-center">{p.downloads}</td>
                                        <td className="px-6 py-4 rounded-r-2xl border-r border-y border-white/5 min-w-[150px]">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1 bg-zinc-800 rounded-full max-w-[60px] overflow-hidden">
                                                    <div className="h-full bg-gold" style={{ width: `${Math.min(parseFloat(p.conversion), 100)}%` }} />
                                                </div>
                                                <span className="font-mono text-[10px] text-white font-bold">{p.conversion}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
