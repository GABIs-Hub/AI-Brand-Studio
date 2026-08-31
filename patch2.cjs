const fs = require('fs');
const file = 'src/components/PopularBrandResearchStudio.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
function ImageWithFallback({ src, alt, fallbackText }: { src: string; alt: string; fallbackText: string }) {
  const [error, setError] = React.useState(false);
  if (error || !src) {
    return <div className="font-serif italic text-2xl font-bold text-center">{fallbackText}</div>;
  }
  return <img src={src} alt={alt} className="max-w-full max-h-full object-contain" onError={() => setError(true)} />;
}

export function PopularBrandResearchStudio({`;

code = code.replace("export function PopularBrandResearchStudio({", replacement);
fs.writeFileSync(file, code);
