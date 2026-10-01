const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Extract and combine all <style> blocks
let cssContent = '';
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (match, p1) => {
    cssContent += p1 + '\n\n';
    return ''; // Remove from HTML
});

// Inject Kamal Solar specific CSS variables into the top of cssContent
const kamalSolarCSS = `
/* KAMALSOLAR.PK 1:1 CLONE STYLES */
:root {
    --color-background-layout-boxed: #220971;
    --color-text: #232323;
    --color-text2: #969696;
    --color-global: #232323;
    --color-white: #FFFFFF;
    --color-grey: #868686;
    --color-black: #202020;
    --color-background: #ffffff;
    --color-link: #232323;
    --color-link-hover: #ff8b21;
    --color-error: #D93333;
    --color-error-bg: #FCEEEE;
    --color-success: #5A5A5A;
    --color-success-bg: #DFF0D8;
    --color-info: #202020;
    --color-info-bg: #FFF2DD;
    --color-breadcrumb: #999999;
    --color-warning: #fff;
    --color-title: #ffffff;
    --color-label: #ffffff;
    --color-border: #e6e6e6;
    
    --primary-blue: #ff8b21; /* Overriding with Kamalsolar's orange accent */
    --dark-blue: #232323;    /* Overriding with Kamalsolar's dark text */
    --light-blue: #f9f9f9;   /* Overriding with Kamalsolar's light bg */
}

body {
    font-family: 'Prompt', 'Arimo', sans-serif !important;
    color: var(--color-text);
    background: var(--color-background);
}
h1, h2, h3, h4, h5, h6 {
    font-family: 'Prompt', sans-serif !important;
    color: var(--color-black);
}
.header-top { background-color: var(--color-black) !important; color: white !important; }
.product-card button.primary { background-color: var(--color-black) !important; color: white !important; }
.product-card button.primary:hover { background-color: var(--color-link-hover) !important; }
.price { color: var(--color-link-hover) !important; }
`;
cssContent = kamalSolarCSS + '\n' + cssContent;


// 2. Extract and combine all <script> blocks (excluding JSON-LD and src="" tags)
let jsContent = '';
html = html.replace(/<script>([\s\S]*?)<\/script>/g, (match, p1) => {
    jsContent += p1 + '\n\n';
    return ''; // Remove from HTML
});

// 3. Update HTML head to link the new files
const linkTags = `
    <!-- Kamalsolar Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&family=Prompt:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="style.css">
`;
html = html.replace(/<\/head>/i, `${linkTags}\n</head>`);

const scriptTags = `
    <script src="app.js"></script>
`;
html = html.replace(/<\/body>/i, `${scriptTags}\n</body>`);

// 4. Write separated files
fs.writeFileSync('style.css', cssContent.trim());
fs.writeFileSync('app.js', jsContent.trim());
fs.writeFileSync('index.html', html);

console.log('Successfully separated index.html into index.html, style.css, and app.js');
