/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TribalDevilEmblemProps {
  size?: number; // width & height in px (e.g. 280 for hero intro, 64 for sidebar)
  isLaughing?: boolean;
  isSpeaking?: boolean;
  glow?: 'subtle' | 'dramatic' | 'sidebar';
  onClick?: () => void;
}

export const TribalDevilEmblem: React.FC<TribalDevilEmblemProps> = ({
  size = 280,
  isLaughing = false,
  isSpeaking = false,
  glow = 'dramatic',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${
        isLaughing ? 'scale-105' : 'hover:scale-[1.02]'
      }`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title="Click devil to trigger evil cackle"
    >
      {/* 2D Blend Glow Layers */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-500 ${
          isLaughing
            ? 'bg-red-600/30 blur-3xl scale-125 animate-pulse'
            : isSpeaking
            ? 'bg-white/20 blur-2xl scale-110'
            : glow === 'dramatic'
            ? 'bg-white/10 blur-2xl'
            : 'bg-white/5 blur-lg'
        }`}
      />

      {/* SVG Reproduction of the 2D White Tribal Devil with Trident */}
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full mix-blend-screen transition-all duration-200"
        style={{
          filter: isLaughing
            ? 'drop-shadow(0 0 25px rgba(255,255,255,0.9)) drop-shadow(0 0 50px rgba(239,68,68,0.7))'
            : isSpeaking
            ? 'drop-shadow(0 0 20px rgba(255,255,255,0.8)) drop-shadow(0 0 40px rgba(255,255,255,0.3))'
            : glow === 'sidebar'
            ? 'drop-shadow(0 0 8px rgba(255,255,255,0.6))'
            : 'drop-shadow(0 0 15px rgba(255,255,255,0.5)) drop-shadow(0 0 35px rgba(220,38,38,0.25))',
        }}
      >
        <g fill="#FFFFFF">
          {/* ======================================================== */}
          {/* 1. HORNED HALO AT TOP                                     */}
          {/* ======================================================== */}
          {/* Oval Halo Ring */}
          <path
            d="M 250 88 
               C 200 88, 170 102, 170 112 
               C 170 122, 200 136, 250 136 
               C 300 136, 330 122, 330 112 
               C 330 102, 300 88, 250 88 Z 
               M 250 98 
               C 285 98, 308 106, 308 112 
               C 308 118, 285 126, 250 126 
               C 215 126, 192 118, 192 112 
               C 192 106, 215 98, 250 98 Z"
            fillRule="evenodd"
          />

          {/* Curved Horns on Halo */}
          {/* Left Halo Horn */}
          <path d="M 185 106 C 160 85, 170 56, 178 56 C 172 70, 186 85, 204 96 Z" />
          {/* Right Halo Horn */}
          <path d="M 315 106 C 340 85, 330 56, 322 56 C 328 70, 314 85, 296 96 Z" />

          {/* ======================================================== */}
          {/* 2. SWEEPING CURVED WINGS / HORNS                          */}
          {/* ======================================================== */}
          {/* Left Upper Spike */}
          <path
            d="M 198 126 
               C 150 110, 80 92, 24 84 
               C 70 104, 102 126, 116 160 
               C 120 144, 150 135, 198 126 Z"
          />
          {/* Left Lower Wing Spike */}
          <path
            d="M 116 160 
               C 90 162, 50 178, 18 190 
               C 60 196, 108 196, 136 212 
               C 134 195, 130 178, 116 160 Z"
          />

          {/* Right Upper Spike */}
          <path
            d="M 302 126 
               C 350 110, 420 92, 476 84 
               C 430 104, 398 126, 384 160 
               C 380 144, 350 135, 302 126 Z"
          />
          {/* Right Lower Wing Spike */}
          <path
            d="M 384 160 
               C 410 162, 450 178, 482 190 
               C 440 196, 392 196, 364 212 
               C 366 195, 370 178, 384 160 Z"
          />

          {/* ======================================================== */}
          {/* 3. CENTRAL DEVIL SKULL / CRESCENT BOWL                    */}
          {/* ======================================================== */}
          <path
            d="M 136 212 
               C 170 236, 210 248, 240 248 
               C 220 240, 195 220, 184 175 
               C 220 190, 280 190, 316 175 
               C 305 220, 280 240, 260 248 
               C 290 248, 330 236, 364 212 
               C 330 245, 290 258, 250 258 
               C 210 258, 170 245, 136 212 Z"
          />

          {/* ======================================================== */}
          {/* 4. LOWER FLANKS / LEGS                                    */}
          {/* ======================================================== */}
          {/* Left Flank & Spur */}
          <path
            d="M 194 246 
               C 185 260, 172 278, 172 296 
               C 188 290, 198 298, 204 316 
               C 210 300, 205 282, 195 272 
               C 202 265, 206 255, 206 247 Z"
          />
          <path
            d="M 172 296 
               C 160 320, 155 350, 172 380 
               C 180 355, 196 335, 194 318 
               C 186 312, 178 305, 172 296 Z"
          />

          {/* Right Flank & Spur */}
          <path
            d="M 306 246 
               C 315 260, 328 278, 328 296 
               C 312 290, 302 298, 296 316 
               C 290 300, 295 282, 305 272 
               C 298 265, 294 255, 294 247 Z"
          />
          <path
            d="M 328 296 
               C 340 320, 345 350, 328 380 
               C 320 355, 304 335, 306 318 
               C 314 312, 322 305, 328 296 Z"
          />

          {/* ======================================================== */}
          {/* 5. SINUOUS DEVIL TAIL WITH ARROW POINT                    */}
          {/* ======================================================== */}
          {/* Long curved tail sweeping down and right */}
          <path
            d="M 235 320 
               C 270 360, 275 410, 250 445 
               C 230 470, 205 450, 240 435 
               C 285 415, 340 370, 360 330 
               C 375 295, 395 305, 465 285 
               L 455 275 
               C 390 295, 365 285, 350 320 
               C 335 355, 275 405, 235 425 
               C 190 445, 215 480, 245 455 
               C 290 415, 275 350, 225 315 Z"
          />

          {/* Tail Arrow Tip */}
          <polygon points="460,265 498,285 460,305 468,285" />

          {/* ======================================================== */}
          {/* 6. TRIDENT / PITCHFORK PIERCING THE TAIL                  */}
          {/* ======================================================== */}
          {/* Central Trident Shaft */}
          <rect x="408" y="240" width="6" height="180" rx="3" />
          <polygon points="405,420 411,438 417,420" />

          {/* Trident Head Bar */}
          <rect x="390" y="234" width="42" height="6" rx="2" />

          {/* Trident Center Spear Point */}
          <polygon points="405,234 411,185 417,234" />
          <polygon points="402,195 411,180 420,195" />

          {/* Trident Left Prong */}
          <path d="M 390 234 L 390 200 L 382 208 L 388 190 L 398 205 L 396 234 Z" />

          {/* Trident Right Prong */}
          <path d="M 432 234 L 432 200 L 440 208 L 434 190 L 424 205 L 426 234 Z" />

          {/* Trident Loop Ring wrapping tail */}
          <path
            d="M 394 290 
               C 394 284, 428 284, 428 290 
               C 428 296, 394 296, 394 290 Z 
               M 398 290 
               C 398 287, 424 287, 424 290 
               C 424 293, 398 293, 398 290 Z"
            fillRule="evenodd"
          />
        </g>
      </svg>
    </div>
  );
};
