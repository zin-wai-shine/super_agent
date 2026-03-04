const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/pages/Public/ListingDetailPage.js');
let content = fs.readFileSync(复, 'utf2');
let changed = false;

// Function to replace a component's className
function updateClassName(pattern, originalClassStr, newClassStr) {
    if (content.includes(originalClassStr)) {
        content = content.replace(originalClassStr, newClassStr);
        changed = true;
        console.log(`Updated class string: ${originalClassStr.substring(0, 30)}...`);
    } else {
        console.log(`Could not find class string: ${originalClassStr.substring(0, 30)}...`);
    }
}

// 1. Back Button
// className="w-12 h-12 md:w-10 md:h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all pointer-events-auto ring-1 ring-black/5"
let str1 = 'className="w-12 h-12 md:w-10 md:h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all pointer-events-auto ring-1 ring-black/5"';
let replace1 = 'className="w-12 h-12 md:w-10 md:h-10 bg-primary-600 hover:bg-primary-700 shadow-xl rounded-full flex items-center justify-center text-white active:scale-90 transition-all pointer-events-auto ring-1 ring-primary-700/50"';
updateClassName(null, str1, replace1);

// 2. PropertyShare (This uses className prop on PropertyShare directly)
// className="w-12 h-12 md:w-10 md:h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 hover:text-gray-600 active:scale-90 transition-all ring-1 ring-black/5"
// iconClassName="w-6 h-6 md:w-5 md:h-5 text-gray-900"
let str2 = 'className="w-12 h-12 md:w-10 md:h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 hover:text-gray-600 active:scale-90 transition-all ring-1 ring-black/5"';
let replace2 = 'className="w-12 h-12 md:w-10 md:h-10 bg-primary-600 hover:bg-primary-700 shadow-xl rounded-full flex items-center justify-center text-white active:scale-90 transition-all ring-1 ring-primary-700/50"';
let str3 = 'iconClassName="w-6 h-6 md:w-5 md:h-5 text-gray-900"';
let replace3 = 'iconClassName="w-6 h-6 md:w-5 md:h-5 text-white"';
updateClassName(null, str2, replace2);
updateClassName(null, str3, replace3);

// 3. Save Button
// className="w-12 h-12 md:w-10 md:h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all ring-1 ring-black/5"
let str4 = 'className="w-12 h-12 md:w-10 md:h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900 active:scale-90 transition-all ring-1 ring-black/5"';
let replace4 = 'className="w-12 h-12 md:w-10 md:h-10 bg-primary-600 hover:bg-primary-700 shadow-xl rounded-full flex items-center justify-center text-white active:scale-90 transition-all ring-1 ring-primary-700/50"';
updateClassName(null, str4, replace4);

// Inside the save button icon check: HeartIcon text-gray-900
let str5 = 'HeartIcon className="w-6 h-6 md:w-5 md:h-5 text-gray-900"';
let replace5 = 'HeartIcon className="w-6 h-6 md:w-5 md:h-5 text-white"';
updateClassName(null, str5, replace5);

if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated ListingDetailPage.js');
} else {
    console.log('No changes needed or could not find targets.');
}
