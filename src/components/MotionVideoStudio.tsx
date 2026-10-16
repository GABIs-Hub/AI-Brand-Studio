import React, { useState, useEffect, useRef } from 'react';
import { BrandBible } from '../types';
import { sanitizeSvg } from '../utils/sanitizeSvg';
import { AnimatedDottedBorder } from './AnimatedDottedBorder';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Check,
  Film,
  Camera,
  Layers,
  Sliders,
  Clock,
  Radio,
  Share2,
  Tv,
  CheckCircle2,
  Info,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MotionVideoStudioProps {
  brand: BrandBible;
}

type MotionArchetype = 'kinetic_reveal' | 'ambient_horizon' | 'typography_beat' | 'parallax_reel';
type CameraMovement = 'dolly_in' | 'orbit_180' | 'isometric_drift' | 'push_pull';
type AspectRatio = '9:16' | '16:9' | '1:1';

const MOTION_ARCHETYPES = [
  {
    id: 'kinetic_reveal' as MotionArchetype,
    label: 'Kinetic Logomark Reveal',
    duration: '4.0s',
    desc: 'Geometric deconstruction, stroke draw-in, and lockup with spring physics.',
  },
  {
    id: 'ambient_horizon' as MotionArchetype,
    label: 'Ambient Horizon Loop',
    duration: '6.0s',
    desc: 'Subtle breathing pulse, organic lighting wave, and refined atmospheric depth.',
  },
  {
    id: 'typography_beat' as MotionArchetype,
    label: 'Staccato Typography Beat',
    duration: '3.0s',
    desc: 'Rhythmic editorial cuts, uppercase kinetic typography, and bold contrast punch.',
  },
  {
    id: 'parallax_reel' as MotionArchetype,
    label: 'Cinematic Parallax Reel',
    duration: '6.0s',
    desc: 'Multi-plane spatial depth, smooth camera drift, and 3D lighting falloff.',
  },
];

const CAMERA_MOVEMENTS = [
  { id: 'dolly_in' as CameraMovement, label: 'Slow Cinematic Dolly In', desc: 'Continuous forward camera track towards logomark' },
  { id: 'orbit_180' as CameraMovement, label: 'Smooth 180° Orbit', desc: 'Curved rotation revealing 3D dimensional surfaces' },
  { id: 'isometric_drift' as CameraMovement, label: 'Isometric Drift', desc: 'Subtle diagonal slide maintaining parallel lines' },
  { id: 'push_pull' as CameraMovement, label: 'Dynamic Push-Pull', desc: 'Snappy zoom punch into macro tactile textures' },
];

export function MotionVideoStudio({ brand }: MotionVideoStudioProps) {
  const primaryColor = brand.palette.find((c) => c.role === 'Primary')?.hex || '#1A1A1A';
  const secondaryColor = brand.palette.find((c) => c.role === 'Secondary')?.hex || '#2563EB';
  const accentColor = brand.palette.find((c) => c.role === 'Accent')?.hex || '#F59E0B';
  const lightColor = brand.palette.find((c) => c.role === 'Neutral Light')?.hex || '#F8F9FA';
  const darkColor = brand.palette.find((c) => c.role === 'Neutral Dark')?.hex || '#0F172A';

  // State
  const [motionStyle, setMotionStyle] = useState<MotionArchetype>('kinetic_reveal');
  const [camera, setCamera] = useState<CameraMovement>('dolly_in');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<number>(1);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSpecs, setCopiedSpecs] = useState(false);

  // Playback timer for the live interactive motion canvas
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setProgress((prev) => {
          const next = prev + (delta * speed * 25);
          return next >= 100 ? 0 : next;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speed]);

  // Video generation prompt formulation for Runway / Sora / Kling
  const aiVideoPrompt = [
    `Cinematic motion brand identity reveal for "${brand.brandName}".`,
    `Motion style: ${MOTION_ARCHETYPES.find((m) => m.id === motionStyle)?.label}.`,
    `Camera movement: ${CAMERA_MOVEMENTS.find((c) => c.id === camera)?.label}.`,
    `Visual aesthetics: 35mm film grain, 60fps, clean architectural minimalist studio.`,
    `Lighting physics: ${brand.photographyDirection?.lighting || 'Directional natural daylight with soft fill'}.`,
    `Color grading: Rich brand palette (${primaryColor}, ${secondaryColor}, ${accentColor}).`,
    `Crisp dimensional logomark vector lockup, zero blur, professional broadcast motion design standard.`,
  ].join(' ');

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiVideoPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const motionSpecsText = `/* GABI Motion System Specification: ${brand.brandName} */
Primary Curve: cubic-bezier(0.16, 1, 0.3, 1) // Sharp entry, soft dampening
Target Frame Rate: 60 FPS
Transition Cadence:
- Micro-interactions: 150ms - 220ms
- Modal/Drawers: 300ms
- Full-Scene Brand Reveal: 4000ms
Optical Camera: ${camera}
Aspect Ratio: ${aspectRatio}
Color Accents: ${primaryColor}, ${accentColor}`;

  const handleCopySpecs = () => {
    navigator.clipboard.writeText(motionSpecsText);
    setCopiedSpecs(true);
    setTimeout(() => setCopiedSpecs(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Studio Header Banner */}
      <div className="border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] px-2 py-0.5">
                Motion &amp; Video Studio
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono text-gray-500 dark:text-zinc-400">
                Kinetic Brand Architecture
              </span>
            </div>
            <h2 className="text-2xl font-light font-display tracking-tight text-[#1A1A1A] dark:text-[#F9F7F2] mt-1">
              Dynamic Brand Motion &amp; Social Video Direction
            </h2>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 max-w-3xl font-display">
              Clearly separated from static assets: craft kinetic logo sequences, broadcast motion guidelines, and video generation prompts tailored for Sora, Runway Gen-3, and Kling.
            </p>
          </div>

          {/* Engine Capability Transparency Badge */}
          <div className="p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[10px] space-y-1 rounded-sm shrink-0">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[#1A1A1A] dark:text-[#F9F7F2]">
              <Film className="w-3.5 h-3.5 text-blue-500" />
              <span>Motion Engine Mode</span>
            </div>
            <p className="text-gray-500 dark:text-zinc-400 text-[9px] font-mono">
              Live Interactive Canvas + Storyboard Spec
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid (Left Controls 5 cols, Right Live Motion Canvas 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Motion Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 space-y-5">
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2] flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Motion Parameters</span>
              </h3>
            </div>

            {/* 1. Kinetic Style Archetype */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                1. Kinetic Style Archetype
              </label>
              <div className="space-y-2">
                {MOTION_ARCHETYPES.map((m) => {
                  const isSelected = motionStyle === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMotionStyle(m.id)}
                      className={`w-full p-3 text-left border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                          : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400 text-gray-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">{m.label}</span>
                        <span className="text-[10px] opacity-75 font-display block">{m.desc}</span>
                      </div>
                      <span className="text-[9px] font-mono uppercase tracking-widest opacity-60 ml-2">
                        {m.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Camera Movement Dynamics */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                2. Camera Movement Dynamics
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CAMERA_MOVEMENTS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCamera(c.id)}
                    className={`p-2.5 text-left border transition-all cursor-pointer ${
                      camera === c.id
                        ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400 text-gray-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold block truncate">{c.label}</span>
                    <span className="text-[8px] opacity-70 block truncate">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Aspect Ratio Selection */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400 block">
                3. Aspect Ratio &amp; Target Platform
              </label>
              <div className="flex gap-2">
                {[
                  { id: '9:16' as AspectRatio, label: '9:16 Story / Reel' },
                  { id: '16:9' as AspectRatio, label: '16:9 Cinema / Web' },
                  { id: '1:1' as AspectRatio, label: '1:1 Square Feed' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id)}
                    className={`flex-1 py-2 text-[9px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${
                      aspectRatio === r.id
                        ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-400'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. AI Video Generation Prompt (Ready for Sora / Runway) */}
            <div className="space-y-2 pt-2 border-t border-dashed border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[9px] uppercase tracking-widest font-bold text-gray-500 dark:text-zinc-400">
                  Synthesized Video Prompt (Runway / Sora / Kling)
                </label>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="text-[9px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              </div>
              <p className="p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] font-mono text-gray-700 dark:text-zinc-300 leading-relaxed break-words">
                {aiVideoPrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 60fps Live Motion Canvas */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.25em] font-black text-[#1A1A1A] dark:text-[#F9F7F2]">
                  Live Kinetic Motion Viewport (60 FPS)
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">
                {aspectRatio} • {Math.round(progress)}%
              </span>
            </div>

            {/* Video Player Container */}
            <div className="relative overflow-hidden bg-black flex items-center justify-center min-h-[400px] max-h-[520px] border border-gray-900 shadow-2xl">
              {/* Dynamic Animated Motion Canvas driven by progress */}
              <div
                className="w-full h-full flex flex-col items-center justify-center p-8 transition-transform duration-100"
                style={{
                  transform:
                    camera === 'dolly_in'
                      ? `scale(${1 + (progress / 100) * 0.15})`
                      : camera === 'orbit_180'
                      ? `rotate(${((progress - 50) / 50) * 8}deg) scale(${1 + Math.sin(progress / 15) * 0.05})`
                      : camera === 'isometric_drift'
                      ? `translate(${((progress - 50) / 50) * 16}px, ${-((progress - 50) / 50) * 8}px)`
                      : `scale(${1 + Math.sin(progress / 10) * 0.08})`,
                }}
              >
                {/* Background ambient lighting pulse */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${accentColor} 0%, transparent 70%)`,
                    transform: `scale(${1 + Math.sin(progress / 10) * 0.2})`,
                  }}
                />

                {/* Main Animated Brand Mark */}
                <div
                  className="w-32 h-32 flex items-center justify-center relative z-10 transition-all duration-300"
                  style={{
                    opacity: progress > 10 ? 1 : progress / 10,
                    transform: `scale(${0.85 + (progress / 100) * 0.25})`,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeSvg(brand.logo?.primaryLogoSvg || ''),
                  }}
                />

                {/* Kinetic Typography Lockup */}
                <div
                  className="mt-6 text-center space-y-1 relative z-10"
                  style={{
                    opacity: progress > 25 ? 1 : progress / 25,
                    transform: `translateY(${(1 - progress / 100) * 10}px)`,
                  }}
                >
                  <h3
                    className="text-2xl font-light uppercase tracking-[0.3em] text-white"
                    style={{ fontFamily: brand.typography.headingFont }}
                  >
                    {brand.brandName}
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-zinc-400">
                    "{brand.tagline}"
                  </p>
                </div>

                {/* Subline Metric / Perspective */}
                <div
                  className="mt-8 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/20 text-[9px] uppercase tracking-widest font-mono text-white/80"
                  style={{ opacity: progress > 50 ? 1 : 0 }}
                >
                  {brand.industry} • EST. {new Date(brand.createdAt).getFullYear()}
                </div>
              </div>

              {/* Viewport Scrub / Status Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Playback Controls Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A] hover:opacity-80 transition-all cursor-pointer rounded-xs"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setProgress(0)}
                  className="p-2 border border-gray-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all cursor-pointer text-gray-700 dark:text-zinc-300 rounded-xs"
                  title="Restart Sequence"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-400 ml-2">
                  Speed:
                </span>
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 text-[9px] font-mono border transition-all cursor-pointer ${
                      speed === s
                        ? 'border-[#1A1A1A] dark:border-[#F9F7F2] bg-[#1A1A1A] text-white dark:bg-[#F9F7F2] dark:text-[#1A1A1A]'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Copy Motion Specs Button */}
              <button
                type="button"
                onClick={handleCopySpecs}
                className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border border-gray-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all flex items-center gap-1.5 cursor-pointer text-gray-700 dark:text-zinc-300"
              >
                {copiedSpecs ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSpecs ? 'Copied Specs' : 'Export Specs'}</span>
              </button>
            </div>
          </div>

          {/* 4-Beat Cinematic Motion Storyboard */}
          <div className="bg-white dark:bg-[#1C1C1A] border border-[#1A1A1A] dark:border-current/20 p-6 space-y-4">
            <div>
              <span className="text-[8px] uppercase tracking-[0.25em] font-black text-amber-600 dark:text-amber-400 block">
                Deliverable Blueprint
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F9F7F2]">
                Cinematic Motion Storyboard Sequence
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {[
                { beat: '01: Tension', time: '0.0s - 1.0s', desc: 'Minimal dark canvas, atmospheric light leak introduces brand mood.' },
                { beat: '02: Geometry', time: '1.0s - 2.5s', desc: 'Vector strokes of logomark deconstruct and draw in with spring physics.' },
                { beat: '03: Lockup', time: '2.5s - 4.0s', desc: 'Full high-contrast logo and brand name lock into crisp 8k alignment.' },
                { beat: '04: Resolve', time: '4.0s - 6.0s', desc: 'Subline and mission statement emerge as camera settles into ambient loop.' },
              ].map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 space-y-1 text-[10px]"
                >
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400">
                    <span>{b.beat}</span>
                    <span>{b.time}</span>
                  </div>
                  <p className="text-gray-600 dark:text-zinc-400 font-display text-[11px] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
