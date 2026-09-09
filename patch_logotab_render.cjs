const fs = require('fs');
let code = fs.readFileSync('src/components/LogoTab.tsx', 'utf8');

const oldRenderBlock = `            {/* Logo Rendering Stage */}
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
              <div
                className={\`w-full max-w-[360px] h-32 flex items-center justify-center transition-transform hover:scale-105 duration-300 \${
                  bgMode === 'dark' ? 'drop-shadow-[0_4px_20px_rgba(255,255,255,0.05)]' : ''
                }\`}
                dangerouslySetInnerHTML={{ __html: sanitizeSvg(logo.primaryLogoSvg) }}
              />
            </div>`;

const newRenderBlock = `            {/* Logo Rendering Stage */}
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
            </div>`;

if (code.includes(oldRenderBlock)) {
  code = code.replace(oldRenderBlock, newRenderBlock);
  fs.writeFileSync('src/components/LogoTab.tsx', code);
  console.log("Patched render block successfully");
} else {
  console.log("Could not find render block");
}
