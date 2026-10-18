import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface AnimatedDottedBorderProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  label?: string;
  interactive?: boolean;
  accentColor?: string;
  id?: string;
}

/**
 * Animated Dotted Section Border Component
 *
 * Implements a subtle pixelated/square-particle snake that continuously travels
 * around the perimeter of a section or card until selected/interacted with.
 *
 * When clicked or active:
 * - Snake travel halts smoothly
 * - Border transitions into an active, high-contrast state
 * - Selection badge communicates the chosen state
 * - Lightweight SVG strokeDashoffset animation (zero CPU/GPU reflow overhead)
 * - Fully accessible and respects prefers-reduced-motion
 */
export function AnimatedDottedBorder({
  children,
  isActive = false,
  onClick,
  className = '',
  label,
  interactive = true,
  accentColor,
  id,
}: AnimatedDottedBorderProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={interactive && onClick ? 'button' : undefined}
      tabIndex={interactive && onClick ? 0 : undefined}
      className={`relative transition-all duration-200 ${
        interactive && onClick ? 'cursor-pointer' : ''
      } ${
        isActive
          ? 'bg-black/[0.02] dark:bg-white/[0.02]'
          : isHovered && interactive
          ? 'bg-black/[0.01] dark:bg-white/[0.01]'
          : ''
      } ${className}`}
    >
      {/* Background/Perimeter SVG Animated Border Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
        aria-hidden="true"
      >
        <rect
          x="0.75"
          y="0.75"
          width="calc(100% - 1.5px)"
          height="calc(100% - 1.5px)"
          fill="none"
          strokeLinecap="square"
          strokeDasharray={isActive ? 'none' : '6 8'}
          strokeWidth="1.5"
          className={`transition-all duration-300 ${
            isActive
              ? 'stroke-black dark:stroke-white'
              : `stroke-black/35 dark:stroke-white/35 animate-snake-border ${
                  isHovered ? 'stroke-black/60 dark:stroke-white/60' : ''
                }`
          }`}
          style={{
            stroke: isActive && accentColor ? accentColor : undefined,
          }}
        />
      </svg>

      {/* Active State Header Chip (Optional) */}
      {(label || isActive) && (
        <div className="absolute -top-2.5 right-4 z-20 flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest font-black transition-all duration-200 pointer-events-none">
          {isActive ? (
            <span
              className="flex items-center gap-1 bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 shadow-xs"
              style={{
                backgroundColor: accentColor || undefined,
                color: accentColor ? '#FFFFFF' : undefined,
              }}
            >
              <Check className="w-2.5 h-2.5" />
              <span>{label || 'Selected'}</span>
            </span>
          ) : label ? (
            <span className="bg-[#FAF9F6] dark:bg-[#181816] text-black/60 dark:text-white/60 px-1.5 border border-black/20 dark:border-white/20">
              {label}
            </span>
          ) : null}
        </div>
      )}

      {/* Section Content */}
      <div className="relative z-0 h-full w-full">{children}</div>
    </div>
  );
}
