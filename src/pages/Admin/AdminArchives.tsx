import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { buildArchiveTree, ArchiveTree, ArchiveFolder, ArchivableItem } from '../../utils/archiveUtils';
import { exportService } from '../../services/exportService';
import { IconDownload, IconLock, IconLoader2, IconSettings, IconShield } from '../../components/Icons';

// Custom lightweight icons for Folders
const FolderIcon = ({ open }: { open?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={open ? "#D4AF37" : "currentColor"} className={open ? "text-gold" : "text-zinc-500"} xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H10L12 6H20C21.1 6 22 6.9 22 8V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" fill="currentColor" />
    </svg>
);

const FileIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
);

const Chevron = ({ open }: { open: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform ${open ? 'rotate-90 text-white' : 'text-zinc-600'}`}>
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);


const FolderNode = ({ folder, level = 0, onExport }: { folder: ArchiveFolder, level?: number, onExport: (f: ArchiveFolder, format: string) => void }) => {
    const [isOpen, setIsOpen] = useState(level === 0);
    const [showExportOptions, setShowExportOptions] = useState(false);

    const hasChildren = Object.keys(folder.subFolders).length > 0 || folder.items.length > 0;

    return (
        <div className="select-none animate-in fade-in duration-300">
            <div
                className={`flex items-center justify-between group py-2 px-3 rounded-xl cursor-pointer hover:bg-zinc-800/80 transition-colors ${isOpen ? 'bg-zinc-800/40' : ''}`}
                style={{ paddingLeft: `${Math.max(0.75, level * 1.5)}rem` }}
            >
                <div className="flex items-center gap-3" onClick={() => hasChildren && setIsOpen(!isOpen)}>
                    <div className="w-4 flex justify-center">
                        {hasChildren && <Chevron open={isOpen} />}
                    </div>
                    <FolderIcon open={isOpen} />
                    <span className={`font-black tracking-widest uppercase text-xs ${isOpen ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                        {folder.name}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-bold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                        {folder.items.length + Object.keys(folder.subFolders).length} items
                    </span>
                </div>

                {/* Export Actions Component */}
                <div className="relative" onMouseLeave={() => setShowExportOptions(false)}>
                    <button
                        onClick={() => setShowExportOptions(!showExportOptions)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-all"
                    >
                        <IconDownload size={14} />
                    </button>

                    {showExportOptions && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-20 animate-in zoom-in-95 origin-top-right">
                            <button onClick={() => { onExport(folder, 'zip'); setShowExportOptions(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-white hover:bg-gold hover:text-black flex items-center justify-between">Exporter en ZIP <IconLock size={12} /></button>
                            <button onClick={() => { onExport(folder, 'pdf'); setShowExportOptions(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-zinc-300 hover:bg-zinc-700">Générer PDF</button>
                            <button onClick={() => { onExport(folder, 'excel'); setShowExportOptions(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-zinc-300 hover:bg-zinc-700">Générer Excel</button>
                            <button onClick={() => { onExport(folder, 'word'); setShowExportOptions(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-zinc-300 hover:bg-zinc-700">Générer Word</button>
                            <button onClick={() => { onExport(folder, 'txt'); setShowExportOptions(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-zinc-300 hover:bg-zinc-700 border-t border-zinc-700">Générer Texte</button>
                        </div>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="mt-1 border-l-2 border-zinc-800 ml-5">
                    {Object.values(folder.subFolders).map(sub => (
                        <FolderNode key={sub.id} folder={sub} level={level + 1} onExport={onExport} />
                    ))}

                    <div className="mt-2 space-y-1">
                        {folder.items.map((item, i) => (
                            <div key={item.id || i} className="flex items-center gap-3 py-1.5 hover:bg-zinc-900 rounded-lg group" style={{ paddingLeft: `${(level + 1.2) * 1.5}rem` }}>
                                <FileIcon />
                                <span className="text-[10px] text-zinc-500 font-mono tracking-tighter truncate max-w-[200px]">
                                    {item.action || item.type || 'Log Entry'}
                                </span>
                                <span className="text-[9px] text-zinc-700">
                                    {new Date(item.timestamp || item.created_at || '').toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}


export default function AdminArchives() {
    const [loading, setLoading] = useState(true);
    const [tree, setTree] = useState<ArchiveTree | null>(null);
    const [exportPassword, setExportPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState<{ active: boolean, folder?: ArchiveFolder, isBackup?: boolean }>({ active: false });

    const loadData = async () => {
        setLoading(true);
        try {
            // Pour l'archivage, on récupère un large spectre de logs système et téléchargements
            const { data: systemLogs } = await supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(2000);
            const { data: dlLogs } = await supabase.from('download_logs').select('*').order('created_at', { ascending: false }).limit(1000);

            const combined = [
                ...(systemLogs || []),
                ...(dlLogs || []).map(d => ({ ...d, type: 'download', timestamp: d.created_at }))
            ];

            // Trier par date globalement
            combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            const builtTree = buildArchiveTree(combined);
            setTree(builtTree);

        } catch (e) {
            console.error("Erreur chargement archives:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleExport = async (folder: ArchiveFolder, format: string) => {
        // Collect all items recursively for flat exports (PDF, Excel...)
        const collectItems = (f: ArchiveFolder): ArchivableItem[] => {
            let items = [...f.items];
            Object.values(f.subFolders).forEach(sub => {
                items = [...items, ...collectItems(sub)];
            });
            return items;
        };

        const allItems = collectItems(folder);
        const filename = `AR_Archive_${folder.id.replace(/\//g, '-')}`;

        if (format === 'zip') {
            setShowPasswordModal({ active: true, folder, isBackup: false });
            return;
        }

        try {
            switch (format) {
                case 'pdf': exportService.exportAsPDF(allItems, filename); break;
                case 'excel': exportService.exportAsExcel(allItems, filename); break;
                case 'word': await exportService.exportAsWord(allItems, filename); break;
                case 'txt': exportService.exportAsText(allItems, filename); break;
            }
        } catch (e) {
            alert("Erreur lors de l'exportation. Vérifiez la console.");
            console.error(e);
        }
    };

    const executeZipExport = async () => {
        if (!showPasswordModal.folder) return;
        try {
            await exportService.exportFolderAsZip(showPasswordModal.folder, exportPassword, showPasswordModal.isBackup);
            setShowPasswordModal({ active: false });
            setExportPassword('');
        } catch (e) {
            alert("Erreur ZIP.");
            console.error(e);
        }
    };

    const handleFullBackup = () => {
        if (!tree) return;
        // Crée un dossier virtuel "Root" contenant tout
        const rootFolder: ArchiveFolder = {
            id: 'root_backup', name: 'SYSTEM_BACKUP_COMPLETE', fullPath: 'ROOT', type: 'A', dateStr: new Date().toISOString(),
            items: tree.todayFolder.items,
            subFolders: {
                ...tree.archives,
                'today_raw': tree.todayFolder
            }
        };
        setShowPasswordModal({ active: true, folder: rootFolder, isBackup: true });
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-zinc-900/40 p-10 rounded-[40px] border border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1.5 h-8 bg-gold rounded-full" />
                            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Command <span className="text-gold">Archives</span></h1>
                        </div>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed max-w-xl">
                            Sauvegarde, archivage et organisation automatique des données.
                            Cycle de consolidation continu : <span className="text-gold">Jour → Semaine → Mois → Année</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <button onClick={loadData} className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all border border-zinc-700">
                            <IconLoader2 size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={handleFullBackup} className="px-6 py-3 rounded-2xl bg-gold text-black font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-gold/20">
                            <IconShield size={16} /> Export Total (Backup)
                        </button>
                    </div>
                </div>

                {/* Arborescence */}
                <div className="bg-black/40 border border-zinc-800 rounded-[40px] p-8">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-600 gap-4">
                            <IconLoader2 size={32} className="animate-spin text-gold" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Analyse temporelle en cours...</p>
                        </div>
                    ) : !tree ? (
                        <div className="py-20 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">Aucune archive générée.</div>
                    ) : (
                        <div className="space-y-6">

                            {/* Today Folder - Affiché en priorité */}
                            <div className="bg-zinc-900/80 p-6 rounded-3xl border border-gold/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                    <h2 className="text-xs font-black text-gold uppercase tracking-[0.2em]">Priorité : Éléments du Jour</h2>
                                </div>
                                <FolderNode folder={tree.todayFolder} onExport={handleExport} />
                            </div>

                            {/* Historique Profond */}
                            <div>
                                <div className="flex items-center gap-3 mb-6 px-2">
                                    <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
                                    <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Archives Sécurisées</h2>
                                    <div className="h-px flex-1 bg-gradient-to-l from-zinc-800 to-transparent" />
                                </div>

                                <div className="space-y-2">
                                    {Object.values(tree.archives).length > 0 ? (
                                        Object.values(tree.archives).map(yearFolder => (
                                            <FolderNode key={yearFolder.id} folder={yearFolder} onExport={handleExport} />
                                        ))
                                    ) : (
                                        <p className="text-center text-zinc-600 text-[10px] uppercase font-black tracking-widest py-10">Aucun historique ancien à regrouper.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* Password Modal for ZIP */}
            {showPasswordModal.active && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[40px] max-w-sm w-full shadow-2xl relative animate-in slide-in-from-bottom-8">
                        <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-6 border border-gold/20">
                            <IconLock size={24} />
                        </div>

                        <h3 className="text-xl font-black text-white text-center mb-2 uppercase italic tracking-tighter">
                            {showPasswordModal.isBackup ? 'Chiffrement Système' : 'Sécuriser l\'Archive'}
                        </h3>

                        <p className="text-[10px] text-zinc-500 text-center font-bold uppercase tracking-widest mb-8 leading-relaxed">
                            {showPasswordModal.isBackup
                                ? "Ce backup système sera chiffré avec la clé maître interne. Il ne pourra être restauré que via cette application."
                                : "Entrez un mot de passe pour chiffrer l'historique exporté. (Requis)"
                            }
                        </p>

                        {!showPasswordModal.isBackup && (
                            <input
                                type="password"
                                value={exportPassword}
                                onChange={e => setExportPassword(e.target.value)}
                                placeholder="Mot de passe secret..."
                                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-center text-white font-mono tracking-widest focus:border-gold outline-none mb-6"
                            />
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowPasswordModal({ active: false }); setExportPassword(''); }}
                                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={executeZipExport}
                                disabled={!showPasswordModal.isBackup && exportPassword.length < 3}
                                className="flex-1 py-3 bg-gold hover:bg-yellow-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {showPasswordModal.isBackup ? 'Générer' : 'Verrouiller'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
