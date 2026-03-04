const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Public/ListingDetailPage.js');
let content = fs.readFileSync(filePath, 'utf8');
let changed = false;

function updateClassName(pattern, originalClassStr, newClassStr) {
    if (content.includes(originalClassStr)) {
        content = content.replace(originalClassStr, newClassStr);
        changed = true;
        console.log(`Updated class string...`);
    }
}

// target the desktop back button
let str = '<button\n                        onClick={() => navigate(-1)}\n                        className="pointer-events-auto text-gray-400 hover:text-gray-900 transition-all py-2.5 px-2.5 md:py-2 md:px-2 rounded-full hover:bg-gray-100 active:scale-95 group flex items-center min-h-[44px] md:min-h-0"\n                    >';
let rep = '<button\n                        onClick={() => navigate(-1)}\n                        className="pointer-events-auto text-white hover:text-gray-100 bg-primary-600 hover:bg-primary-700 shadow-xl transition-all py-2.5 px-2.5 md:py-2 md:px-3 rounded-full active:scale-95 group flex items-center min-h-[44px] md:min-h-0"\n                    >';

updateClassName(null, str, rep);

if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated ListingDetailPage.js');
}
