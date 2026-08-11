const fs = require('fs');
const path = require('path');

const sqlDir = path.join(__dirname, 'sql');
const historyFile = path.join(sqlDir, 'DATABASE_LEGACY_HISTORY.sql');

const files = fs.readdirSync(sqlDir);
let combinedContent = '';

files.forEach(file => {
    if (file.endsWith('.sql') && !file.includes('audit_') && !file.includes('repair') && !file.includes('check_data') && file !== 'DATABASE_LEGACY_HISTORY.sql') {
        const filePath = path.join(sqlDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        combinedContent += `-- FILE: ${file}\n${content}\n-- END OF FILE\n\n`;
        fs.unlinkSync(filePath);
        console.log(`Archived and removed: ${file}`);
    }
});

fs.writeFileSync(historyFile, combinedContent, 'utf8');
console.log('Successfully created DATABASE_LEGACY_HISTORY.sql');
