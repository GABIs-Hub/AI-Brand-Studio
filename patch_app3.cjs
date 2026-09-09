const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const updateBrandFunc = `
  const handleUpdateBrand = async (updatedBrand: BrandBible) => {
    setActiveBrand(updatedBrand);
    setSavedBrands((prev) => {
      const updated = prev.map((b) => (b.id === updatedBrand.id ? updatedBrand : b));
      writeSavedBrands(updated);
      return updated;
    });
    
    if (user && updatedBrand.userId === user.id) {
      try {
        await saveBrandToCloud(updatedBrand);
      } catch (e) {
        console.warn('Could not save updated brand to cloud:', e);
      }
    }
  };
`;

code = code.replace(
  'const handleDeleteBrand = async (id: string) => {',
  updateBrandFunc + '\n  const handleDeleteBrand = async (id: string) => {'
);

code = code.replace(
  /onSelectBrand=\{\(b\) => setActiveBrand\(b\)\}/g,
  'onSelectBrand={handleUpdateBrand}'
);

fs.writeFileSync('src/App.tsx', code);
