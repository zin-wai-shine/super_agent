const fs = require('fs');
const path = require('path');

const svgPath = '/Users/zinwaishine/Desktop/super_real_estate/eng_transit_map.svg';
const targetPath = '/Users/zinwaishine/Desktop/super_real_estate/frontend/src/components/TransitMap/transit_map.svg.js';

try {
    let svgContent = fs.readFileSync(svgPath, 'utf8');

    // 1. Handle style tags for JSX: <style>...</style> -> <style>{`...`}</style>
    // We assume there is only one style block or regular ones.
    svgContent = svgContent.replace(/<style>([\s\S]*?)<\/style>/g, (match, css) => {
        return `<style>{\`${css}\`}</style>`;
    });

    // 2. Wrap in Component using parentheses to avoid implicit return issues if any
    const jsContent = `export const TransitMapSVG = () => (
${svgContent}
);`;

    fs.writeFileSync(targetPath, jsContent);
    console.log('Successfully converted and wrote SVG component.');

} catch (error) {
    console.error('Error converting SVG:', error);
    process.exit(1);
}
