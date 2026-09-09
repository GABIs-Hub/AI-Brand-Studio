const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const fetchRegex = /(await fetch\([^)]+\)[\s\S]*?\n\s*\});?(\s*if \(!)/g;
  
  // Only patch if we haven't already patched this exact fetch (to avoid double patching)
  let patched = false;
  content = content.replace(fetchRegex, (match, fetchCall, ifStatement) => {
    if (match.includes('_contentType')) return match; // Already patched
    
    const resMatch = fetchCall.match(/(const|let)\s+(\w+)\s*=\s*await fetch/);
    const resVar = resMatch ? resMatch[2] : 'response';
    
    const patch = `
      const _contentType = ${resVar}.headers.get('content-type') || '';
      if (_contentType.includes('text/html')) {
        throw new Error('Server is currently unavailable or restarting. Please try again in a few seconds.');
      }`;
    
    patched = true;
    return fetchCall + patch + ifStatement;
  });
  
  if (patched) {
    fs.writeFileSync(file, content);
    console.log('Patched', file);
  }
});
