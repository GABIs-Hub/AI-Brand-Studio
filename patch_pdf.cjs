const fs = require('fs');
let code = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');

const convertSvgToPng = `
const convertSvgToPngDataUrl = async (svgString: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const encodedSvg = encodeURIComponent(svgString);
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 800, 600);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = \`data:image/svg+xml;charset=utf-8,\${encodedSvg}\`;
  });
};
`;

code = code.replace(
  'const hexToRgb = (hex: string) => {',
  convertSvgToPng + '\nconst hexToRgb = (hex: string) => {'
);

const addLogoToPdf = `
      // Add Logo Image if available
      if (brand.logo?.primaryLogoSvg) {
        try {
          const pngDataUrl = await convertSvgToPngDataUrl(brand.logo.primaryLogoSvg);
          // Center the image (Image is 800x600 aspect ratio)
          doc.addImage(pngDataUrl, 'PNG', 197.64, 250, 200, 150);
        } catch (e) {
          console.error("Could not add logo to PDF:", e);
        }
      }
`;

code = code.replace(
  "doc.text(`GENERATED ON: ${new Date().toLocaleDateString()}`, 297.64, 210, { align: 'center' });",
  "doc.text(`GENERATED ON: ${new Date().toLocaleDateString()}`, 297.64, 210, { align: 'center' });\n" + addLogoToPdf
);

fs.writeFileSync('src/components/ExportModal.tsx', code);
