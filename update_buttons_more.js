const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Public/ListingDetailPage.js');
let content = fs.readFileSync(filePath, 'utf8');
let changed = false;

function updateClassName(pattern, originalClassStr, newClassStr) {
    if (content.includes(originalClassStr)) {
        content = content.replace(originalClassStr, newClassStr);
        changed = true;
        console.log(`Updated class string: ${originalClassStr.substring(0, 30)}...`);
    } else {
        console.log(`Could not find class string: ${originalClassStr.substring(0, 30)}...`);
    }
}

// Ensure the unsaved heart icon is white
let str5 = '<HeartIcon className="w-6 h-6 md:w-5 md:h-5 text-gray-900" />';
let replace5 = '<HeartIcon className="w-6 h-6 md:w-5 md:h-5 text-white" />';
updateClassName(null, str5, replace5);

if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated ListingDetailPage.js');
} else {
    console.log('No changes needed or could not find targets.');
}
