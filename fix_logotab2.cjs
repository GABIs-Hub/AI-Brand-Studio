const fs = require('fs');
let code = fs.readFileSync('src/components/LogoTab.tsx', 'utf8');

const replacement = `            </div>

            {/* Concept & Symbolism Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#1A1A1A] dark:border-[#F9F7F2]/20 bg-white dark:bg-[#1C1C1A]">
              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">
                <span className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-500 block">
                  Core Concept
                </span>
                <p className="font-serif italic text-sm text-[#1A1A1A] dark:text-[#F9F7F2] leading-relaxed">
                  {logo.concept}
                </p>
              </div>

              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">`;

code = code.replace(
  '            </div>\n\n              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-200 dark:border-zinc-800 space-y-2">',
  replacement
);

fs.writeFileSync('src/components/LogoTab.tsx', code);
