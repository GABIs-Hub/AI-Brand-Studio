import { ToneGuideline, ImageryStyle } from '../types';
import { MessageSquare, CheckCircle, XCircle, Camera, Sparkles } from 'lucide-react';

interface ToneTabProps {
  toneOfVoice: ToneGuideline[];
  imageryStyle: ImageryStyle;
}

export function ToneTab({ toneOfVoice, imageryStyle }: ToneTabProps) {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] pb-4">
        <h2 className="text-[11px] uppercase tracking-[0.3em] font-black text-[#1A1A1A]">Tone of Voice & Messaging Rules</h2>
        <p className="font-serif italic text-lg opacity-80 mt-2">
          Editorial voice guidelines, copy comparisons, and art direction rules for marketing communications.
        </p>
      </div>

      {/* Voice Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toneOfVoice.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-[#1A1A1A] p-6 space-y-6 rounded-none flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-dashed border-[#1A1A1A]/30 pb-3">
              <h3 className="font-serif italic text-2xl font-light tracking-tighter">{item.trait}</h3>
              <span className="text-[10px] font-mono font-bold opacity-30">0{index + 1}</span>
            </div>

            <p className="font-sans font-light text-sm leading-relaxed opacity-90">{item.description}</p>

            {/* Do vs Don't Examples */}
            <div className="grid grid-cols-1 gap-4 mt-auto pt-4">
              <div className="border border-[#1A1A1A] p-4 flex flex-col gap-2 relative bg-[#F9F7F2]">
                <div className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold opacity-30">Do</div>
                <p className="font-serif italic text-sm text-[#1A1A1A]">"{item.doExample}"</p>
              </div>

              <div className="border border-dashed border-[#1A1A1A]/40 p-4 flex flex-col gap-2 relative opacity-60 bg-white">
                <div className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold opacity-40">Don't</div>
                <p className="font-serif italic text-sm text-[#1A1A1A] line-through decoration-[#1A1A1A]/30">"{item.dontExample}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Art Direction & Photography Style Guide */}
      <div className="bg-[#1A1A1A] text-white border border-[#1A1A1A] p-8 sm:p-12 space-y-10 rounded-none mt-10">
        <div className="flex items-center gap-4 border-b border-white/20 pb-6">
          <Camera className="w-6 h-6 opacity-80" />
          <h3 className="text-[11px] uppercase tracking-[0.3em] font-black">Art Direction & Photography Guidelines</h3>
        </div>

        {/* Moodboard Keywords */}
        <div>
          <span className="text-[9px] uppercase tracking-widest font-bold opacity-50 block mb-4">
            Imagery Aesthetics & Moodboard Keywords
          </span>
          <div className="flex flex-wrap gap-3">
            {imageryStyle.moodboardKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-4 py-2 border border-white/30 text-[10px] uppercase tracking-widest font-bold"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Guidance Paragraph */}
        <div className="font-serif italic text-xl font-light leading-relaxed opacity-90 border-l border-white/40 pl-6">
          {imageryStyle.photographyGuidance}
        </div>

        {/* Photography Dos & Donts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm pt-6 border-t border-dashed border-white/20">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 block flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Photography Best Practices</span>
            </span>
            <ul className="space-y-3 font-sans font-light opacity-90 list-none p-0">
              {imageryStyle.dos.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="opacity-50 mt-1">—</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 block flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>Photography Pitfalls to Avoid</span>
            </span>
            <ul className="space-y-3 font-sans font-light opacity-60 list-none p-0">
              {imageryStyle.donts.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="opacity-30 mt-1">×</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
