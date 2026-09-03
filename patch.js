const fs = require('fs');
const file = 'src/components/PopularBrandResearchStudio.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
function ImageWithFallback({ src, alt, fallbackText }: { src: string; alt: string; fallbackText: string }) {
  const [error, setError] = React.useState(false);
  if (error) {
    return <div className="font-serif italic text-2xl font-bold">{fallbackText}</div>;
  }
  return <img src={src} alt={alt} className="max-w-full max-h-full object-contain" onError={() => setError(true)} />;
}

export default function PopularBrandResearchStudio() {`;

code = code.replace("export default function PopularBrandResearchStudio() {", replacement);

code = code.replace(/<img src=\{logo\.imageUrl\}.*?\/>/, '<ImageWithFallback src={logo.imageUrl} alt={`${selectedBrand.brandName} - ${logo.title}`} fallbackText={selectedBrand.brandName} />');

fs.writeFileSync(file, code);
