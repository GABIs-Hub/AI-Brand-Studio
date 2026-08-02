import { useState } from 'react';
import { BrandBible } from '../types';
import { X, Download, Copy, Check, FileJson, FileCode, FileText } from 'lucide-react';

interface ExportModalProps {
  brand: BrandBible | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ brand, isOpen, onClose }: ExportModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen || !brand) return null;

  const jsonString = JSON.stringify(brand, null, 2);

  const cssString = `:root {\n` +
    `  /* Brand Bible: ${brand.brandName} Palette */\n` +
    brand.palette
      .map((c) => `  --color-${c.role.toLowerCase().replace(/\s+/g, '-')}: ${c.hex}; /* ${c.name} */`)
      .join('\n') +
    `\n\n  /* Typography Pairings */\n` +
    `  --font-heading: '${brand.typography.headingFont}', serif;\n` +
    `  --font-body: '${brand.typography.bodyFont}', sans-serif;\n` +
    `}`;

  const markdownString = `# Brand Bible: ${brand.brandName}\n\n` +
    `**Tagline:** "${brand.tagline}"  \n` +
    `**Industry:** ${brand.industry}  \n\n` +
    `## Mission Statement\n${brand.mission}\n\n` +
    `## Long-Term Vision\n${brand.vision}\n\n` +
    `## Positioning Statement\n${brand.positioningStatement}\n\n` +
    `## 5-Color Brand Palette\n` +
    brand.palette.map((c) => `- **${c.role} (${c.name}):** \`${c.hex}\` — ${c.usage}`).join('\n') +
    `\n\n## Typography\n` +
    `- **Heading Font:** ${brand.typography.headingFont} (${brand.typography.headingFontCategory})\n` +
    `- **Body Font:** ${brand.typography.bodyFont} (${brand.typography.bodyFontCategory})\n` +
    `- **Google Fonts Link:** ${brand.typography.googleFontsUrl}\n\n` +
    `## Core Values\n` +
    brand.values.map((v) => `- **${v.title}:** ${v.description}`).join('\n');

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export Brand Bible</h2>
          <p className="text-xs text-gray-500 mt-1">
            Download or copy complete design system specifications for {brand.brandName}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* JSON Export */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                <FileJson className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Full JSON Kit</h3>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">
                Complete structured Brand Bible data schema.
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => handleCopy(jsonString, 'json')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center justify-center gap-1"
              >
                {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => handleDownload(jsonString, `${brand.brandName.toLowerCase()}-brand-bible.json`, 'application/json')}
                className="py-1.5 px-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
                title="Download JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CSS Variables Export */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">CSS Stylesheet</h3>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">
                CSS custom properties for colors & typography.
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => handleCopy(cssString, 'css')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center justify-center gap-1"
              >
                {copiedType === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => handleDownload(cssString, `${brand.brandName.toLowerCase()}-brand-tokens.css`, 'text/css')}
                className="py-1.5 px-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
                title="Download CSS"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Markdown Summary Export */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Markdown Guide</h3>
              <p className="text-[11px] text-gray-500 leading-normal mt-0.5">
                Formatted documentation markdown file.
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <button
                onClick={() => handleCopy(markdownString, 'md')}
                className="flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center justify-center gap-1"
              >
                {copiedType === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => handleDownload(markdownString, `${brand.brandName.toLowerCase()}-brand-bible.md`, 'text/markdown')}
                className="py-1.5 px-2.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
                title="Download MD"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
