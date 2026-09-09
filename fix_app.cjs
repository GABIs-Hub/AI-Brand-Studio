const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/const _contentType = response\.headers\.get\('content-type'\) \|\| '';\n\s*if \(_contentType\.includes\('text\/html'\)\) \{\n\s*throw new Error\('Server is currently unavailable or restarting\. Please try again in a few seconds\.'\);\n\s*\}/g, '');
fs.writeFileSync('src/App.tsx', code);
