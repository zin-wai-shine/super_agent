const fs = require('fs');
const code = fs.readFileSync('/Users/zinwaishine/Desktop/super_real_estate/frontend/src/pages/Public/ListingDetailPage.js', 'utf-8');

// A very naive stack-based parser to find JSX tag mismatches
let stack = [];
let lines = code.split('\n');

for (let i = 1946; i <= 3105; i++) {
    let line = lines[i];
    if (!line) continue;
    
    // Ignore comments
    line = line.replace(/\{\/\*.*?\*\/\}/g, '');
    
    // Match <div ...>, <Modal ...>, etc.
    let openMatches = [...line.matchAll(/<([A-Za-z0-9_]+)(?![^>]*\/>)[^>]*>/g)];
    for (let m of openMatches) {
        if (!m[0].includes('/>')) {
            stack.push({tag: m[1], line: i+1});
        }
    }
    
    // Match <>
    let fragOpenMatches = [...line.matchAll(/<>/g)];
    for (let m of fragOpenMatches) {
        stack.push({tag: '<>', line: i+1});
    }
    
    // Match </div ...>, </Modal>, etc.
    let closeMatches = [...line.matchAll(/<\/([A-Za-z0-9_]+)\s*>/g)];
    for (let m of closeMatches) {
        if (stack.length > 0 && stack[stack.length-1].tag === m[1]) {
            stack.pop();
        } else {
            console.log(`Mismatch at line ${i+1}: expected ${stack.length > 0 ? stack[stack.length-1].tag : 'nothing'}, found ${m[1]}`);
        }
    }
    
    // Match </>
    let fragCloseMatches = [...line.matchAll(/<\/>/g)];
    for (let m of fragCloseMatches) {
        if (stack.length > 0 && stack[stack.length-1].tag === '<>') {
            stack.pop();
        } else {
            console.log(`Mismatch at line ${i+1}: expected ${stack.length > 0 ? stack[stack.length-1].tag : 'nothing'}, found </>`);
        }
    }
}

console.log("Remaining in stack:", stack.map(s => `${s.tag}:${s.line}`));
