import React, { useState, useEffect } from 'react';
import { Sparkles, Box, Shield, Layers, Compass, Zap } from 'lucide-react';

interface LogoRenderSkeletonProps {
  mode?: '3d_stage' | 'archetype_grid' | 'single_mark';
  presetName?: string;
  brandName?: string;
  resolution?: string;
}

const RENDERING_STEPS = [
  { label: 'Deconstructing brand geometry & vector paths', icon: Compass },
  { label: 'Generating multi-surface normal maps & depth meshes', icon: Layers },
  { label: 'Computing specular raytracing & volumetric shadows', icon: Box },
  { label: 'Finalizing high-fidelity 8-bit texture passes', icon: Sparkles },
];

export function LogoRenderSkeleton({
  mode = '3d_stage',
  presetName = '3D Photorealistic Studio',
  brandName = 'Brand',
  resolution = '2K Ultra-HD',
}: LogoRenderSkeletonProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < RENDERING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  if (mode === 'archetype_grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between space-y-4"
          >
            {/* Top Bar Skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-gray-200 dark:bg-zinc-800 rounded-xs" />
              <div className="h-3 w-12 bg-gray-200 dark:bg-zinc-800 rounded-xs" />
            </div>

            {/* Center Canvas Wireframe */}
            <div className="h-36 bg-gray-100 dark:bg-zinc-900/60 flex items-center justify-center relative overflow-hidden">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800" />
              </div>
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
            </div>

            {/* Bottom Details Skeleton */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-xs" />
              <div className="h-3 w-full bg-gray-100 dark:bg-zinc-800/60 rounded-xs" />
              <div className="h-3 w-2/3 bg-gray-100 dark:bg-zinc-800/60 rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="w-full flex flex-col items-center justify-center min-h-[380px] p-8 text-center relative overflow-hidden select-none"
      id="logo-render-skeleton"
    >
      {/* Dynamic Background Studio Grid Floor */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Center 3D Isometric Viewport Wireframe Stage */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full space-y-6">
        {/* Animated Wireframe Bounding Box */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Outer rotating guide ring */}
          <div className="absolute inset-0 border border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-2 border border-dashed border-amber-400/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

          {/* Center Pulsing Geometric Prism Box */}
          <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <div className="relative z-10 flex flex-col items-center gap-1.5 text-amber-400">
              <Box className="w-8 h-8 animate-pulse text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" />
              <span className="text-[8px] font-mono uppercase tracking-widest text-gray-300">
                {resolution}
              </span>
            </div>
          </div>

          {/* Corner CAD Crosshair Indicators */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/40" />
        </div>

        {/* Status Stepper & Messaging */}
        <div className="space-y-3 w-full">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-amber-400 block animate-pulse">
              Synthesizing &bull; {presetName}
            </span>
            <h4 className="text-base font-serif italic text-white">
              Rendering Photorealistic Emblem for {brandName}
            </h4>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStepIndex + 1) / RENDERING_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Dynamic Active Phase Sub-Label */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-300 font-mono pt-1">
            {React.createElement(RENDERING_STEPS[currentStepIndex].icon, {
              className: 'w-3.5 h-3.5 text-amber-400 animate-spin',
            })}
            <span>{RENDERING_STEPS[currentStepIndex].label}</span>
          </div>

          {/* Step Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {RENDERING_STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx <= currentStepIndex ? 'bg-amber-400 scale-110' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
