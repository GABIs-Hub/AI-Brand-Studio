const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let patched = false;
  content = content.replace(/(const (res|response) = await fetch[\s\S]*?\n\s*\});?(\s*if \(!\2\.ok\))/g, (match, fetchCall, resVar, ifStatement) => {
    if (match.includes('_contentType')) return match;
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
}

['src/components/SocialTemplatesTab.tsx', 'src/components/AiBrandAssistant.tsx', 'src/components/BrandAuditTab.tsx'].forEach(patchFile);
