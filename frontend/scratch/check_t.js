const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '../src'));
files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if the file calls t(...) but does not define t (e.g. const { t } or function(t) or import t)
    // A simple heuristic: check for regex match of \bt\([^\)]
    // and see if the file lacks \bt\s*=\text or similar declarations.
    if (/\bt\s*\(/.test(content)) {
        const hasDestructuredT = /const\s+\{\s*t[,\s}]/.test(content) || /let\s+\{\s*t[,\s}]/.test(content);
        const hasParamT = /function\s+\w*\s*\([^)]*\bt\b[^)]*\)/.test(content) || /\([^)]*\bt\b[^)]*\)\s*=>/.test(content) || /\bt\s*=>/.test(content);
        const hasImportT = /import\s+t\b/.test(content) || /import\s+\{\s*t\s*\}\s+from/.test(content);
        const hasDefinedT = /\bconst\s+t\b/.test(content) || /\blet\s+t\b/.test(content) || /\bvar\s+t\b/.test(content);
        const hasI18nT = /\bi18n\.t\b/.test(content);

        if (!hasDestructuredT && !hasParamT && !hasImportT && !hasDefinedT) {
            // Check if all occurrences are actually i18n.t
            const cleanContent = content.replace(/\bi18n\.t\b/g, '');
            if (/\bt\s*\(/.test(cleanContent)) {
                console.log(`Potential issue in ${file}`);
            }
        }
    }
});
