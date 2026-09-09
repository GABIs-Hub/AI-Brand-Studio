const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'onUpdateBrand={handleUpdateBrand}',
  ''
);

code = code.replace(
  'onSelectBrand={(b) => setActiveBrand(b)}',
  'onSelectBrand={handleUpdateBrand}'
);

fs.writeFileSync('src/App.tsx', code);
