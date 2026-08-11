// src/utils/archiveUtils.ts
export interface ArchivableItem {
    id: string;
    created_at?: string;
    timestamp?: string;
    [key: string]: any;
}

export interface ArchiveFolder {
    id: string;
    name: string; // Affichage UI
    fullPath: string; // Ex: M-2_S-1_J-1_01/02/2026_00:00:00
    type: 'A' | 'M' | 'S' | 'J';
    dateStr: string;
    items: ArchivableItem[];
    subFolders: Record<string, ArchiveFolder>;
}

export interface ArchiveTree {
    todayFolder: ArchiveFolder;
    archives: Record<string, ArchiveFolder>;
}

export function buildArchiveTree(items: ArchivableItem[]): ArchiveTree {
    const now = new Date();

    const todayDow = now.getDay() === 0 ? 7 : now.getDay();
    const todayDateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}_00:00:00`;
    const todayLabel = `J-${todayDow}_${todayDateStr}`;

    const tree: ArchiveTree = {
        todayFolder: {
            id: 'today',
            name: `Aujourd'hui (${todayLabel})`,
            fullPath: todayLabel,
            type: 'J',
            dateStr: todayDateStr,
            items: [],
            subFolders: {}
        },
        archives: {}
    };

    items.forEach(item => {
        const dStr = item.timestamp || item.created_at;
        if (!dStr) return;
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return;

        // Is it strict today?
        const isToday = d.toDateString() === now.toDateString();

        const dow = d.getDay() === 0 ? 7 : d.getDay();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const week = Math.ceil(d.getDate() / 7);

        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(month).padStart(2, '0');
        const yyyy = year;
        const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        const dateStr = `${dd}/${mm}/${yyyy}_${timeStr}`;

        if (isToday) {
            tree.todayFolder.items.push(item);
            return;
        }

        const mBase = `01/${mm}/${yyyy}_00:00:00`;
        const yBase = `01/01/${yyyy}_00:00:00`;

        // Chemins complets selon la spec du client
        const jFullPath = `J-${dow}_${dateStr}`;
        const sFullPath = `S-${week}_${jFullPath}`;
        const mFullPath = `M-${month}_${sFullPath}`;
        const aFullPath = `A-${year}_${mFullPath}`;

        // IDs unifiés pour faciliter la structure de l'arbre
        const aId = `A-${year}`;
        const mId = `${aId}_M-${month}`;
        const sId = `${mId}_S-${week}`;
        const jId = `${sId}_J-${dow}_${dd}`;

        if (!tree.archives[aId]) {
            tree.archives[aId] = {
                id: aId, name: `Année ${year}`, fullPath: `A-${year}_${yBase}`,
                type: 'A', dateStr: yBase, items: [], subFolders: {}
            };
        }
        const yFolder = tree.archives[aId];

        if (!yFolder.subFolders[mId]) {
            yFolder.subFolders[mId] = {
                id: mId, name: `Mois ${month}`, fullPath: `M-${month}_${mBase}`,
                type: 'M', dateStr: mBase, items: [], subFolders: {}
            };
        }
        const mFolder = yFolder.subFolders[mId];

        if (!mFolder.subFolders[sId]) {
            mFolder.subFolders[sId] = {
                id: sId, name: `Semaine ${week}`, fullPath: `S-${week}_${mBase}`,
                type: 'S', dateStr: mBase, items: [], subFolders: {}
            };
        }
        const sFolder = mFolder.subFolders[sId];

        if (!sFolder.subFolders[jId]) {
            sFolder.subFolders[jId] = {
                id: jId, name: `Jour ${dow} (${dd}/${mm})`, fullPath: jFullPath,
                type: 'J', dateStr: `${dd}/${mm}/${yyyy}_00:00:00`, items: [], subFolders: {}
            };
        }
        const jFolder = sFolder.subFolders[jId];

        jFolder.items.push(item);
    });

    return tree;
}
