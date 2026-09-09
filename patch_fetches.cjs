const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find places where fetch is called and followed by if (!res.ok) or similar
  const fetchRegex = /(await fetch\([^)]+\)[\s\S]*?\n\s*\});?(\n\s*if \(!)/g;
  
  if (content.match(fetchRegex)) {
    content = content.replace(fetchRegex, (match, fetchCall, ifStatement) => {
      // Find the response variable name (usually 'res' or 'response')
      const resMatch = fetchCall.match(/(const|let)\s+(\w+)\s*=\s*await fetch/);
      const resVar = resMatch ? resMatch[2] : 'response';
      
      const patch = `
      const _contentType = ${resVar}.headers.get('content-type') || '';
      if (_contentType.includes('text/html')) {
        throw new Error('Server is currently unavailable or restarting. Please try again in a few seconds.');
      }`;
      
      return fetchCall + patch + ifStatement;
    });
    fs.writeFileSync(file, content);
    console.log('Patched', file);
  }
});
