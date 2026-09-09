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
  'const handleLogoGenerated = async (imageUrl: string) => {',
  updateBrandFunc + '\n  const handleLogoGenerated = async (imageUrl: string) => {'
);

code = code.replace(
  '<BrandDashboard\n              brand={activeBrand}',
  '<BrandDashboard\n              brand={activeBrand}\n              onUpdateBrand={handleUpdateBrand}'
);

fs.writeFileSync('src/App.tsx', code);
