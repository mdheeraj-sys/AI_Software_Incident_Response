/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface CircledDevilAvatarProps {
  mouthState: number; // 0: smirk, 1: speaking/parted, 2: open laugh, 3: manic roaring laugh
  isLaughing: boolean;
  isSpeaking: boolean;
  audioAmplitude: number;
  size?: number; // diameter in pixels (e.g. 200)
  onClick?: () => void;
}

export const CircledDevilAvatar: React.FC<CircledDevilAvatarProps> = ({
  mouthState,
  isLaughing,
  isSpeaking,
  audioAmplitude,
  size = 220,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse pupil tracking
  const [pupilOffset, setPupilOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [headTilt, setHeadTilt] = useState<number>(0);
  const [headBob, setHeadBob] = useState<number>(0);

  // Track cursor
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (window.innerWidth / 2);
    const dy = (e.clientY - centerY) / (window.innerHeight / 2);

    // Clamp pupil offset between -6 and +6 pixels
    setPupilOffset({
      x: Math.max(-6, Math.min(6, dx * 7)),
      y: Math.max(-4, Math.min(5, dy * 6)),
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Natural blinking
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, 3000 + Math.random() * 2500);
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Laughing head bounce & tilt animation
  useEffect(() => {
    if (!isLaughing) {
      setHeadTilt(0);
      setHeadBob(0);
      return;
    }

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const bob = Math.sin(frame * 0.9) * (mouthState === 3 ? 6 : 4);
      const tilt = Math.cos(frame * 0.7) * (mouthState === 3 ? 3.5 : 2);
      setHeadBob(bob);
      setHeadTilt(tilt);
    }, 50);

    return () => clearInterval(interval);
  }, [isLaughing, mouthState]);

  // Speaking mouth phoneme
  let effectiveMouth = mouthState;
  if (isSpeaking && audioAmplitude > 0.15) {
    effectiveMouth = audioAmplitude > 0.45 ? 2 : 1;
  }

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative flex items-center justify-center select-none group cursor-pointer"
      style={{ width: `${size}px`, height: `${size}px` }}
      title="Click to unleash an evil laugh"
    >
      {/* Outer Pulse Rings when laughing */}
      {isLaughing && (
        <>
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping pointer-events-none scale-125" />
          <div className="absolute -inset-4 rounded-full border border-white/10 animate-pulse pointer-events-none" />
        </>
      )}

      {/* Main Circular Glass & Glow Border */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isLaughing
            ? 'ring-4 ring-white/60 shadow-[0_0_50px_rgba(255,255,255,0.35)]'
            : isSpeaking
            ? 'ring-2 ring-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
            : 'ring-1 ring-zinc-800 group-hover:ring-zinc-600 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
        }`}
      />

      {/* Circular Content Container (Clips the devil art neatly inside circle) */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        {/* Subtle background ambient glow inside circle */}
        <div className="absolute inset-0 bg-radial from-zinc-800/40 via-transparent to-transparent pointer-events-none" />

        {/* SVG Smooth Vector Devil Face */}
        <svg
          viewBox="0 0 240 240"
          className="w-full h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translateY(${headBob}px) rotate(${headTilt}deg)`,
            transformOrigin: '50% 70%',
          }}
        >
          <defs>
            {/* Smooth linear gradients for horns & fangs */}
            <linearGradient id="hornGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#888888" />
            </linearGradient>
            <linearGradient id="hornGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#888888" />
            </linearGradient>
            <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1C1C1F" />
              <stop offset="100%" stopColor="#0B0B0D" />
            </linearGradient>
            <linearGradient id="throatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7F1D1D" />
              <stop offset="100%" stopColor="#180404" />
            </linearGradient>
          </defs>

          {/* ======================================================== */}
          {/* 1. CURVED DEMON HORNS (Smooth, powerful vector arcs)      */}
          {/* ======================================================== */}
          {/* Left Horn */}
          <path
            d="M 82 82 C 65 52, 45 35, 42 16 C 52 24, 68 45, 96 66 Z"
            fill="url(#hornGradLeft)"
          />
          {/* Left Horn inner accent line */}
          <path
            d="M 80 80 C 65 55, 48 38, 44 20"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Horn */}
          <path
            d="M 158 82 C 175 52, 195 35, 198 16 C 188 24, 172 45, 144 66 Z"
            fill="url(#hornGradRight)"
          />
          {/* Right Horn inner accent line */}
          <path
            d="M 160 80 C 175 55, 192 38, 196 20"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* ======================================================== */}
          {/* 2. DEMON HEAD / SKULL / CHEEKS (Clean sleek silhouette)  */}
          {/* ======================================================== */}
          {/* Head Base Silhouette */}
          <path
            d="M 76 78 
               C 92 68, 148 68, 164 78 
               C 184 88, 198 108, 194 132 
               C 190 148, 178 162, 172 176 
               C 164 194, 138 214, 120 220 
               C 102 214, 76 194, 68 176 
               C 62 162, 50 148, 46 132 
               C 42 108, 56 88, 76 78 Z"
            fill="url(#faceGrad)"
            stroke="#3F3F46"
            strokeWidth="2"
          />

          {/* Pointed Demon Ears / Cheek Spurs */}
          <path
            d="M 47 122 C 30 114, 24 104, 20 92 C 32 104, 40 114, 48 132 Z"
            fill="#27272A"
            stroke="#3F3F46"
            strokeWidth="1.5"
          />
          <path
            d="M 193 122 C 210 114, 216 104, 220 92 C 208 104, 200 114, 192 132 Z"
            fill="#27272A"
            stroke="#3F3F46"
            strokeWidth="1.5"
          />

          {/* Angular Forehead & Brow Ridges */}
          <path
            d="M 80 102 Q 102 110, 116 116 Q 120 117, 124 116 Q 138 110, 160 102"
            stroke="#71717A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* ======================================================== */}
          {/* 3. EXPRESSIVE EYES (Pupil tracking, laughing crescents)   */}
          {/* ======================================================== */}
          {isLaughing || effectiveMouth >= 2 ? (
            // Laughing Eyes: Sinister, joyful crescent arcs ^  ^
            <g>
              <path
                d="M 76 126 Q 94 112, 110 126"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 130 126 Q 146 112, 164 126"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : isBlinking ? (
            // Closed Eye Blinks
            <g>
              <path
                d="M 76 128 L 110 128"
                stroke="#71717A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 130 128 L 164 128"
                stroke="#71717A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ) : (
            // Open Menacing Eyes with Pupil Tracking Cursor
            <g>
              {/* Left Eye White Sclera */}
              <path
                d="M 76 122 C 86 114, 102 114, 112 124 C 104 134, 88 136, 76 122 Z"
                fill="#FFFFFF"
              />
              {/* Left Pupil (Tracks Mouse) */}
              <circle
                cx={94 + pupilOffset.x}
                cy={124 + pupilOffset.y}
                r="4.5"
                fill="#000000"
              />
              {/* Left Eye Catchlight Gleam */}
              <circle
                cx={96 + pupilOffset.x}
                cy={122 + pupilOffset.y}
                r="1.5"
                fill="#FFFFFF"
              />

              {/* Right Eye White Sclera */}
              <path
                d="M 164 122 C 154 114, 138 114, 128 124 C 136 134, 152 136, 164 122 Z"
                fill="#FFFFFF"
              />
              {/* Right Pupil (Tracks Mouse) */}
              <circle
                cx={146 + pupilOffset.x}
                cy={124 + pupilOffset.y}
                r="4.5"
                fill="#000000"
              />
              {/* Right Eye Catchlight Gleam */}
              <circle
                cx={148 + pupilOffset.x}
                cy={122 + pupilOffset.y}
                r="1.5"
                fill="#FFFFFF"
              />
            </g>
          )}

          {/* Demonic Nostrils */}
          <path
            d="M 116 142 L 118 145 M 124 142 L 122 145"
            stroke="#71717A"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* ======================================================== */}
          {/* 4. ANIMATED LAUGHING MOUTH & RAZOR FANGS                 */}
          {/* ======================================================== */}
          {effectiveMouth === 0 && (
            // === STATE 0: CONFIDENT SINISTER SMIRK ===
            <g>
              {/* Smirk Line */}
              <path
                d="M 82 165 C 98 175, 142 175, 158 165"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left Upper Fang */}
              <polygon points="98,168 103,178 107,169" fill="#FFFFFF" />
              {/* Right Upper Fang */}
              <polygon points="133,169 137,178 142,168" fill="#FFFFFF" />
            </g>
          )}

          {effectiveMouth === 1 && (
            // === STATE 1: SPEAKING / PARTED CHUCKLE ===
            <g>
              {/* Open Cavity */}
              <path
                d="M 84 163 C 98 178, 142 178, 156 163 C 146 182, 94 182, 84 163 Z"
                fill="url(#throatGrad)"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              {/* Fangs */}
              <polygon points="96,164 100,174 104,166" fill="#FFFFFF" />
              <polygon points="136,166 140,174 144,164" fill="#FFFFFF" />
              <polygon points="116,180 120,172 124,180" fill="#FFFFFF" />
            </g>
          )}

          {effectiveMouth === 2 && (
            // === STATE 2: WIDE GAPING LAUGH ===
            <g>
              {/* Big Gaping Mouth */}
              <path
                d="M 76 160 C 96 172, 144 172, 164 160 C 158 196, 82 196, 76 160 Z"
                fill="url(#throatGrad)"
                stroke="#FFFFFF"
                strokeWidth="3.5"
              />
              {/* Deep Throat Tongue */}
              <ellipse cx="120" cy="184" rx="14" ry="7" fill="#DC2626" />
              {/* Sharp Upper Fangs */}
              <polygon points="90,161 95,176 100,163" fill="#FFFFFF" />
              <polygon points="140,163 145,176 150,161" fill="#FFFFFF" />
              {/* Lower Fangs */}
              <polygon points="106,191 110,181 114,191" fill="#FFFFFF" />
              <polygon points="126,191 130,181 134,191" fill="#FFFFFF" />
            </g>
          )}

          {effectiveMouth === 3 && (
            // === STATE 3: MANIACAL ROARING CACKLE (MWAHAHAHA!) ===
            <g>
              {/* Cavernous Roaring Maw */}
              <path
                d="M 68 156 C 96 168, 144 168, 172 156 C 166 206, 74 206, 68 156 Z"
                fill="url(#throatGrad)"
                stroke="#FFFFFF"
                strokeWidth="4"
              />
              {/* Fiery Deep Throat */}
              <ellipse cx="120" cy="188" rx="20" ry="10" fill="#EF4444" />
              <ellipse cx="120" cy="192" rx="12" ry="5" fill="#FBBF24" />

              {/* Jagged Upper Fangs */}
              <polygon points="80,158 86,177 92,160" fill="#FFFFFF" />
              <polygon points="94,160 100,175 106,162" fill="#FFFFFF" />
              <polygon points="134,162 140,175 146,160" fill="#FFFFFF" />
              <polygon points="148,160 154,177 160,158" fill="#FFFFFF" />

              {/* Jagged Lower Fangs */}
              <polygon points="96,200 101,186 106,200" fill="#FFFFFF" />
              <polygon points="112,203 117,188 122,203" fill="#FFFFFF" />
              <polygon points="128,203 133,188 138,203" fill="#FFFFFF" />
              <polygon points="144,200 149,186 154,200" fill="#FFFFFF" />
            </g>
          )}

          {/* Chin Accent */}
          <path
            d="M 114 212 Q 120 215, 126 212"
            stroke="#52525B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
