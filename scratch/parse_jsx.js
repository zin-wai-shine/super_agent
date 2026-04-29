const fs = require('fs');
const parser = require('@babel/parser');

const code = fs.readFileSync('/Users/zinwaishine/Desktop/super_real_estate/frontend/src/pages/Public/ListingDetailPage.js', 'utf-8');

try {
    parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx']
    });
    console.log("No syntax errors found!");
} catch (e) {
    console.error("Syntax Error:", e.message);
}
