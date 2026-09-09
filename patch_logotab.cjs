const fs = require('fs');
let code = fs.readFileSync('src/components/LogoTab.tsx', 'utf8');

const importReplacement = `import { useState, useRef } from 'react';
import { BrandBible, LogoSpec, SecondaryMark } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';`;

code = code.replace(
  `import { useState } from 'react';\nimport { BrandBible, LogoSpec, SecondaryMark } from '../types';\nimport { sanitizeSvg } from '../utils/sanitizeSvg';`,
  importReplacement
);

const stateReplacements = `
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgContent = event.target?.result as string;
        if (onUpdatePrimaryLogo) {
          onUpdatePrimaryLogo(svgContent, logo.concept, logo.symbolism, logo.geometryDetails);
        }
      };
      reader.readAsText(file);
    }
  };

  const [isEditingSvg, setIsEditingSvg] = useState(false);
  const [svgDraft, setSvgDraft] = useState(logo.primaryLogoSvg);
`;

code = code.replace(
  'const [copiedSvg, setCopiedSvg] = useState<string | null>(null);',
  'const [copiedSvg, setCopiedSvg] = useState<string | null>(null);' + stateReplacements
);

const editButtons = `
              {/* Edit Logo */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept=".svg" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingSvg) {
                      if (onUpdatePrimaryLogo) {
                         onUpdatePrimaryLogo(svgDraft, logo.concept, logo.symbolism, logo.geometryDetails);
                      }
                      setIsEditingSvg(false);
                    } else {
                      setSvgDraft(logo.primaryLogoSvg);
                      setIsEditingSvg(true);
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{isEditingSvg ? 'Save Code' : 'Edit Code'}</span>
                </button>
              </div>
`;

code = code.replace(
  '{/* 1-Click Export Actions */}',
  editButtons + '\n              {/* 1-Click Export Actions */}'
);

const renderStageReplacement = `
            {/* Logo Rendering Stage */}
            <div
              className={\`w-full min-h-[300px] flex items-center justify-center p-12 transition-colors duration-500 \${
                bgMode === 'light'
                  ? 'bg-white'
                  : bgMode === 'dark'
                  ? 'bg-[#121212]'
                  : ''
              }\`}
              style={bgMode === 'brand' ? { backgroundColor: primaryColorHex } : {}}
            >
              {isEditingSvg ? (
                <textarea
                  className="w-full h-[300px] bg-zinc-900 text-green-400 p-4 font-mono text-xs outline-none border border-zinc-700 rounded-sm"
                  value={svgDraft}
                  onChange={(e) => setSvgDraft(e.target.value)}
                  placeholder="Paste SVG Code here..."
                  spellCheck={false}
                />
              ) : (
                <div
                  className={\`w-full max-w-[360px] h-32 flex items-center justify-center transition-transform hover:scale-105 duration-300 \${
                    bgMode === 'dark' ? 'drop-shadow-[0_4px_20px_rgba(255,255,255,0.05)]' : ''
                  }\`}
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(logo.primaryLogoSvg) }}
                />
              )}
            </div>
`;

code = code.replace(
  /[\s\S]*\{\/\* Logo Rendering Stage \*\/\}[\s\S]*dangerouslySetInnerHTML=\{\{ __html: sanitizeSvg\(logo\.primaryLogoSvg\) \}\}[\s\S]*\/\>[\s\S]*<\/div>[\s\S]*<\/div>/m,
  (match) => {
    // This regex might be tricky, let's just replace the exact block
    return match; // We'll do a safer replace in a second step
  }
);

fs.writeFileSync('src/components/LogoTab.tsx', code);
