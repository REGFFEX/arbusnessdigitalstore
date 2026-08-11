import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';
import CryptoJS from 'crypto-js';
import type { ArchivableItem, ArchiveFolder } from '../utils/archiveUtils';

const SYSTEM_BACKUP_KEY = 'AR_BUSINESS_CORE_SECURE_KEY_2026';

export const exportService = {
    // Export en Texte simple
    exportAsText(data: ArchivableItem[], filename: string) {
        const content = data.map(item => JSON.stringify(item, null, 2)).join('\n\n--- ÉLÉMENT SUIVANT ---\n\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `${filename}.txt`);
    },

    // Export en Excel
    exportAsExcel(data: ArchivableItem[], filename: string) {
        if (!data.length) return;

        // Flatten attributes for Excel
        const flatData = data.map(item => {
            const flat: any = { ...item };
            if (item.details) {
                Object.entries(item.details).forEach(([k, v]) => {
                    flat[`detail_${k}`] = typeof v === 'object' ? JSON.stringify(v) : v;
                });
                delete flat.details;
            }
            return flat;
        });

        const worksheet = XLSX.utils.json_to_sheet(flatData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Archivage');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `${filename}.xlsx`);
    },

    // Export en PDF
    exportAsPDF(data: ArchivableItem[], filename: string) {
        const doc = new jsPDF();
        doc.text(`Rapport d'Archivage - ${filename}`, 14, 15);

        if (data.length === 0) {
            doc.text("Aucune donnée disponible dans ce dossier.", 14, 25);
            doc.save(`${filename}.pdf`);
            return;
        }

        // Récupérer les clés principales (sans les objets profonds comme details)
        const keys = ['id', 'action', 'type', 'timestamp', 'user_email'];
        const body = data.map(item => keys.map(k => String(item[k] || '')));

        autoTable(doc, {
            startY: 20,
            head: [['ID', 'Action', 'Type', 'Date', 'Utilisateur']],
            body: body,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [212, 175, 55] } // Code couleur Gold d'AR Business
        });

        doc.save(`${filename}.pdf`);
    },

    // Export en Word (Docx)
    async exportAsWord(data: ArchivableItem[], filename: string) {
        const children = [
            new Paragraph({
                children: [
                    new TextRun({ text: `Rapport : ${filename}`, bold: true, size: 32 })
                ],
                spacing: { after: 400 }
            })
        ];

        data.forEach(item => {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: `Élément: ${item.action || item.type || item.id}`, bold: true, size: 24 })],
                    spacing: { before: 200, after: 100 }
                })
            );
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: JSON.stringify(item, null, 2), size: 16 })],
                    spacing: { after: 200 }
                })
            );
        });

        const doc = new Document({
            sections: [{ properties: {}, children }]
        });

        const buffer = await Packer.toBlob(doc);
        saveAs(buffer, `${filename}.docx`);
    },

    // ZIP de Dossier Entier avec structure récursive
    async exportFolderAsZip(folder: ArchiveFolder, password?: string, isBackup = false) {
        const zip = new JSZip();

        // Fonction récursive pour répliquer la hiérarchie J/S/M/A
        const addFolderToZip = (f: ArchiveFolder, currentZip: JSZip) => {
            const subZip = currentZip.folder(f.name.replace(/\//g, '-')); // Pas de slash dans le nom
            if (!subZip) return;

            if (f.items.length > 0) {
                let contentStr = JSON.stringify(f.items, null, 2);
                let ext = 'json';

                // Système de cryptage demandé par le client
                if (isBackup || password) {
                    const secretKey = isBackup ? SYSTEM_BACKUP_KEY : password!;
                    contentStr = CryptoJS.AES.encrypt(contentStr, secretKey).toString();
                    ext = 'arb_enc'; // Extension propriétaire sécurisée ("AR Business Encrypted")
                }

                subZip.file(`data_${f.fullPath.replace(/[\/\\]/g, '-')}.${ext}`, contentStr);
            }

            // Descendre dans les sous-dossiers (J -> S -> M -> A)
            Object.values(f.subFolders).forEach(sub => addFolderToZip(sub, subZip));
        };

        addFolderToZip(folder, zip);

        const blob = await zip.generateAsync({ type: 'blob' });
        const suffix = isBackup ? '_BACKUP_SECURE' : (password ? '_ENCRYPTED' : '');
        saveAs(blob, `${folder.fullPath}${suffix}.zip`);
    }
};
