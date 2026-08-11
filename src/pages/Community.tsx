import React, { useState, useEffect } from 'react'
import { getCommunityPosts, CommunityPost } from '../services/community'
import { useSettings } from '../hooks/useSettings'
import { supabase } from '../config/supabase'
import { IconUser, IconExternalLink, IconCircleCheck, IconMusic, IconFile, IconDownload } from '../components/Icons'

export default function Community() {
    const { settings } = useSettings()
    const [posts, setPosts] = useState<CommunityPost[]>([])
    const [loading, setLoading] = useState(true)
    const [admins, setAdmins] = useState<any[]>([])

    useEffect(() => {
        loadPosts()
        loadAdmins()

        // Timer for real-time post filtering (WhatsApp style deletion delay)
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 10000)
        return () => clearInterval(timer)
    }, [])

    const [currentTime, setCurrentTime] = useState(new Date())

    async function loadPosts() {
        try {
            const data = await getCommunityPosts()
            setPosts(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function loadAdmins() {
        try {
            const { data } = await supabase.from('admins').select('*')
            setAdmins(data || [])
        } catch (error) {
            console.error(error)
        }
    }

    const getAdminById = (adminId: string) => {
        return admins.find(admin => admin.id === adminId)
    }

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter">
                        {settings.site_content?.community?.header?.title || settings.store_titles?.community_title ? (
                            <>
                                {(settings.site_content?.community?.header?.title || settings.store_titles?.community_title || '').split(' ').map((word: string, i: number, arr: string[]) => (
                                    <span key={i} className={i === arr.length - 1 ? 'text-gold' : ''}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </>
                        ) : (
                            <>AR Business <span className="text-gold">Community</span></>
                        )}
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">{settings.site_content?.community?.header?.subtitle || "Rejoignez le mouvement Digital Store"}</p>

                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <a href="#" className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">WhatsApp Group</a>
                        <a href="#" className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">GitHub Repo</a>
                        <a href="#" className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">Telegram Channel</a>
                    </div>
                </div>

                <div className="space-y-8">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Connexion au Hub...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-[40px]">
                            <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">Aucune annonce pour le moment</p>
                        </div>
                    ) : (
                        posts
                            .filter(post => {
                                // If soft deleted, hide after 5 minutes
                                if (post.status === 'deleted' && post.deleted_at) {
                                    const deletedTime = new Date(post.deleted_at).getTime()
                                    const fiveMinutes = 5 * 60 * 1000
                                    return (currentTime.getTime() - deletedTime) < fiveMinutes
                                }
                                return post.status !== 'deleted' // Regular posts OR recently deleted
                            })
                            .map(post => {
                                const admin = post.admin_id ? getAdminById(post.admin_id) : null
                                const isDeleted = post.status === 'deleted'
                                const isModified = post.updated_at && post.updated_at !== post.created_at && !isDeleted

                                if (isDeleted) {
                                    return (
                                        <div key={post.id} className="bg-zinc-900/20 border border-zinc-800/50 rounded-[30px] p-6 opacity-40 italic flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                </div>
                                                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Ce message a été supprimé</p>
                                            </div>
                                            <span className="text-[8px] font-black opacity-30">
                                                {post.deleted_at ? new Date(post.deleted_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'récemment'}
                                            </span>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={post.id} className="group bg-zinc-900/40 border border-zinc-800 rounded-[40px] p-8 hover:border-gold/30 transition-all duration-500 backdrop-blur-md relative overflow-hidden">
                                        {isModified && (
                                            <div className="absolute top-0 right-0 bg-gold/10 px-4 py-1.5 rounded-bl-2xl border-l border-b border-gold/20 flex items-center gap-2">
                                                <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em] animate-pulse">Modifié</span>
                                                <span className="text-[7px] font-bold text-zinc-500">
                                                    {post.updated_at ? new Date(post.updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex flex-col md:flex-row gap-8">
                                            {post.media_url && (
                                                <div
                                                    className="rounded-3xl overflow-hidden shadow-2xl shrink-0 mx-auto md:mx-0 bg-black/20"
                                                    style={{ width: `${post.metadata?.image_width || 100}%`, maxWidth: '100%' }}
                                                >
                                                    {post.media_type === 'image' || !post.media_type ? (
                                                        <img src={post.media_url} className="w-full object-contain group-hover:scale-105 transition-transform duration-700" alt="" />
                                                    ) : post.media_type === 'video' ? (
                                                        <video src={post.media_url} controls className="w-full aspect-video bg-black" />
                                                    ) : post.media_type === 'audio' ? (
                                                        <div className="p-6 bg-zinc-800/50 flex flex-col gap-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                                                    <IconMusic size={24} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-black uppercase text-white">Audio Diffusion</div>
                                                                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Contenu Officiel</div>
                                                                </div>
                                                            </div>
                                                            <audio src={post.media_url} controls className="w-full h-10" />
                                                        </div>
                                                    ) : (
                                                        <a href={post.media_url} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-6 bg-zinc-800/80 hover:bg-zinc-700 transition-all border border-zinc-700/50 hover:border-gold/30 group/file">
                                                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold group-hover/file:scale-110 transition-transform">
                                                                <IconFile size={24} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-black uppercase text-white truncate">Télécharger le fichier</div>
                                                                <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Type: {post.media_url.split('.').pop()?.toUpperCase() || 'DATA'}</div>
                                                            </div>
                                                            <div className="p-3 bg-zinc-900 rounded-xl text-zinc-400 group-hover/file:text-gold transition-colors">
                                                                <IconDownload size={20} />
                                                            </div>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-4">
                                                {/* Admin Profile Section */}
                                                {admin && (
                                                    <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-2xl border border-zinc-700/50">
                                                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                                                            {admin?.avatar_url ? (
                                                                <img src={admin.avatar_url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                                    <IconCircleCheck size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-black text-white text-sm">{admin?.display_name || admin?.name || 'Diffusion Officielle'}</div>
                                                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                                                {admin?.role === 'master' ? 'Master Admin' : (admin?.role ? 'Community Manager' : 'Staff AR Business')}
                                                            </div>
                                                        </div>
                                                        {/* QR Code */}
                                                        {admin?.qr_code_url && (
                                                            <div className="relative group">
                                                                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer hover:border-gold/50 transition-all">
                                                                    <img src={admin.qr_code_url} className="w-full h-full object-contain p-1" alt="QR Code" />
                                                                </div>
                                                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-lg text-[6px] font-black uppercase shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    QR
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Social Links */}
                                                        <div className="flex gap-2">
                                                            {admin?.whatsapp && (
                                                                <a href={`https://wa.me/${admin.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-all">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                                </a>
                                                            )}
                                                            {admin?.github && (
                                                                <a href={`https://github.com/${admin.github}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-700/50 transition-all">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                                                </a>
                                                            )}
                                                            {admin?.facebook && (
                                                                <a href={admin.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-600/30 flex items-center justify-center hover:bg-blue-600/30 transition-all">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                                </a>
                                                            )}
                                                            {admin?.tiktok && (
                                                                <a href={admin.tiktok} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center hover:bg-pink-500/30 transition-all">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.84.01 5.68-.02 8.52-.03 1.4-.33 2.79-1.01 3.98-.68 1.18-1.72 2.13-2.96 2.66-1.24.53-2.64.71-3.98.55-1.34-.16-2.63-.68-3.66-1.55-1.03-.87-1.78-2.03-2.13-3.32-.35-1.29-.3-2.66.15-3.92.45-1.26 1.29-2.37 2.4-3.07 1.11-.7 2.44-1.04 3.75-.89.31.04.62.11.92.19v4.03c-.29-.09-.58-.18-.88-.22-1.14-.2-2.33.27-2.99 1.22-.66.95-.78 2.26-.31 3.32.47 1.06 1.5 1.79 2.66 1.86.81.05 1.65-.23 2.26-.81.61-.58.93-1.41.89-2.24-.01-2.81 0-5.63 0-8.44.01-1.69 0-3.38 0-5.07.01-1.36-.01-2.72 0-4.08z" /></svg>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4">
                                                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                                        {isModified ? 'Modifié' : 'Diffusé'} le {post.updated_at ? new Date(isModified ? post.updated_at : post.created_at!).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                                    </span>
                                                </div>
                                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight group-hover:text-gold transition-colors">{post.title}</h2>
                                                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                                <div className="flex flex-wrap gap-3 pt-4">
                                                    {post.external_links?.map((link, i) => (
                                                        <a
                                                            key={i}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border"
                                                            style={{
                                                                backgroundColor: `${post.metadata?.link_color || '#ffffff'}`,
                                                                color: (post.metadata?.link_color === '#ffffff' || !post.metadata?.link_color) ? '#000000' : '#ffffff',
                                                                borderColor: `${post.metadata?.link_color || '#ffffff'}50`,
                                                                boxShadow: `0 10px 20px -5px ${post.metadata?.link_color || '#ffffff'}20`
                                                            }}
                                                        >
                                                            {link.label}
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17l10-10M7 7h10v10" /></svg>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                    )}
                </div>
            </div>
        </div>
    )
}
