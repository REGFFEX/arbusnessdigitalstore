import { Link } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useBranding } from '../context/BrandingContext'

export default function Footer() {
    const { settings } = useSettings()
    const { setIsBrandingOpen } = useBranding()

    const LogoIcon = () => (
        <div
            className="w-12 h-12 bg-zinc-900 flex items-center justify-center overflow-hidden transition-all border border-zinc-800 shadow-lg group-hover:border-gold/30"
            style={{ borderRadius: settings.logo_border_radius || '16px' }}
        >
            {settings.logo_url ? (
                <img src={settings.logo_url} className="w-full h-full object-contain" alt="" />
            ) : (
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gold via-yellow-600 to-gold bg-clip-text">
                    <span className="text-xl font-black text-transparent leading-none">AR</span>
                    <div className="w-4 h-0.5 bg-gold/50 rounded-full mt-0.5"></div>
                </div>
            )}
        </div>
    )

    return (
        <footer className="bg-black border-t border-zinc-900 mt-16 pb-20 lg:pb-0">
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                    {/* Brand */}
                    <div className="space-y-5">
                        <button
                            onClick={() => setIsBrandingOpen(true)}
                            className={`flex items-center gap-4 group transition-all ${!settings.logo_targets?.footer ? 'hidden' : ''}`}
                        >
                            <LogoIcon />
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tight group-hover:text-gold transition-colors">{settings.site_name}</span>
                                <span className="text-[10px] text-gold font-bold uppercase tracking-widest">Digital Excellence</span>
                            </div>
                        </button>
                        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
                            La plateforme de référence pour les solutions digitales premium, applications innovantes et formations d'excellence au Congo.
                        </p>
                    </div>

                    {/* Navigation — Synchronisée avec Navbar */}
                    <div>
                        <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Navigation</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> Accueil</Link></li>
                            <li><Link to="/store" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> Store Digital</Link></li>
                            <li><Link to="/categories" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> Catégories</Link></li>
                            <li><Link to="/premium" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> Accès Premium</Link></li>
                            <li><Link to="/roadmap" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                Roadmap 2026
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1"></span>
                            </Link></li>
                            <li><Link to="/community" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                Communauté
                            </Link></li>
                            <li><Link to="/ar-center" className="text-zinc-500 hover:text-gold transition-colors text-sm font-bold flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                Centre AR
                            </Link></li>
                            <li><Link to="/services" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> Services B2B</Link></li>
                            <li><Link to="/about" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> À propos</Link></li>
                        </ul>
                    </div>

                    {/* Informations — liens réels uniquement */}
                    {settings?.section_visibility?.footer_sitemap !== false && (
                        <div>
                            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6">Informations</h3>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> Notre Vision</Link></li>
                                <li><Link to="/about#contact" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> Contact</Link></li>
                                <li><Link to="/categories?category=formation" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> Formations AR</Link></li>
                                <li><Link to="/categories?category=solution" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> Solutions Business</Link></li>
                                <li><Link to="/guide" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> Guide & Aide</Link></li>
                                <li><Link to="/roadmap" className="text-zinc-500 hover:text-gold transition-colors text-sm font-medium flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> Suivre la Roadmap</Link></li>
                            </ul>
                        </div>
                    )}

                    {/* Contact & Social */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-4">Contact</h3>
                            <a href="mailto:arbusinessdigitalstore@gmail.com" className="text-sm font-bold text-zinc-400 hover:text-gold transition-colors block">
                                arbusinessdigitalstore@gmail.com
                            </a>
                        </div>
                        {settings?.section_visibility?.global_social !== false && (
                            <div className="flex gap-3">
                                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-zinc-700 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                                <a href="https://wa.me/243000000000" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-zinc-700 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-gold hover:border-zinc-700 transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-700 text-xs font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} {settings.site_name} CORP. — Tous droits réservés
                    </p>
                    <div className="flex gap-6">
                        <span className="text-[10px] text-zinc-800 font-bold uppercase tracking-widest">Made with Excellence</span>
                        <span className="text-[10px] text-zinc-800 font-bold uppercase tracking-widest">Version 2.0</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
