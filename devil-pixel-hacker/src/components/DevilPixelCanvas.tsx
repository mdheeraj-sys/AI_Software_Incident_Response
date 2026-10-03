/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export type PaletteName = 'blood' | 'toxic' | 'amethyst' | 'amber' | 'glitch';

export interface PaletteColors {
  name: string;
  bgFace: string;
  faceShade: string;
  faceBase: string;
  faceHighlight: string;
  hornBase: string;
  hornMid: string;
  hornTip: string;
  eyeSclera: string;
  eyeIris: string;
  eyePupil: string;
  mouthCavity: string;
  mouthFire: string;
  teeth: string;
  ember: string[];
  terminalAccent: string;
  terminalBorder: string;
}

export const PALETTES: Record<PaletteName, PaletteColors> = {
  blood: {
    name: 'Blood Nether',
    bgFace: '#140303',
    faceShade: '#3f0708',
    faceBase: '#991b1b',
    faceHighlight: '#dc2626',
    hornBase: '#450a0a',
    hornMid: '#b91c1c',
    hornTip: '#f97316',
    eyeSclera: '#fef08a',
    eyeIris: '#ef4444',
    eyePupil: '#000000',
    mouthCavity: '#180202',
    mouthFire: '#f59e0b',
    teeth: '#ffffff',
    ember: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'],
    terminalAccent: '#ef4444',
    terminalBorder: 'rgba(239, 68, 68, 0.4)',
  },
  toxic: {
    name: 'Matrix Cyber',
    bgFace: '#02180e',
    faceShade: '#064e3b',
    faceBase: '#059669',
    faceHighlight: '#10b981',
    hornBase: '#022c22',
    hornMid: '#047857',
    hornTip: '#84cc16',
    eyeSclera: '#d9f99d',
    eyeIris: '#22c55e',
    eyePupil: '#000000',
    mouthCavity: '#02140a',
    mouthFire: '#a3e635',
    teeth: '#f0fdf4',
    ember: ['#10b981', '#22c55e', '#84cc16', '#ffffff'],
    terminalAccent: '#10b981',
    terminalBorder: 'rgba(16, 185, 129, 0.4)',
  },
  amethyst: {
    name: 'Void Demon',
    bgFace: '#12051e',
    faceShade: '#3b0764',
    faceBase: '#6b21a8',
    faceHighlight: '#9333ea',
    hornBase: '#2e1065',
    hornMid: '#7e22ce',
    hornTip: '#ec4899',
    eyeSclera: '#fbcfe8',
    eyeIris: '#c084fc',
    eyePupil: '#000000',
    mouthCavity: '#0e0217',
    mouthFire: '#f43f5e',
    teeth: '#ffffff',
    ember: ['#a855f7', '#c084fc', '#f43f5e', '#ffffff'],
    terminalAccent: '#a855f7',
    terminalBorder: 'rgba(168, 85, 247, 0.4)',
  },
  amber: {
    name: 'Amber 1984',
    bgFace: '#1a1002',
    faceShade: '#451a03',
    faceBase: '#92400e',
    faceHighlight: '#d97706',
    hornBase: '#291403',
    hornMid: '#b45309',
    hornTip: '#fde047',
    eyeSclera: '#fef3c7',
    eyeIris: '#f59e0b',
    eyePupil: '#000000',
    mouthCavity: '#180a01',
    mouthFire: '#fde047',
    teeth: '#fffbeb',
    ember: ['#d97706', '#f59e0b', '#fde047', '#ffffff'],
    terminalAccent: '#f59e0b',
    terminalBorder: 'rgba(245, 158, 11, 0.4)',
  },
  glitch: {
    name: 'Phantom Monolith',
    bgFace: '#08080c',
    faceShade: '#1e293b',
    faceBase: '#475569',
    faceHighlight: '#94a3b8',
    hornBase: '#0f172a',
    hornMid: '#334155',
    hornTip: '#f8fafc',
    eyeSclera: '#fee2e2',
    eyeIris: '#f43f5e',
    eyePupil: '#000000',
    mouthCavity: '#050508',
    mouthFire: '#e2e8f0',
    teeth: '#ffffff',
    ember: ['#94a3b8', '#e2e8f0', '#f43f5e', '#ffffff'],
    terminalAccent: '#e2e8f0',
    terminalBorder: 'rgba(226, 232, 240, 0.4)',
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface DevilPixelCanvasProps {
  palette: PaletteName;
  mouthState: number; // 0: grin, 1: chuckling/open slight, 2: wide laugh, 3: extreme manic laugh, 4: phoneme 'O'
  isLaughing: boolean;
  isSpeaking: boolean;
  audioAmplitude: number; // 0 to 1
  blockSize: number; // pixel width per block (e.g. 10 to 18)
  showGridGaps: boolean; // LED matrix style with gaps
  showEmbers: boolean;
  onDevilClick?: () => void;
}

export const DevilPixelCanvas: React.FC<DevilPixelCanvasProps> = ({
  palette,
  mouthState,
  isLaughing,
  isSpeaking,
  audioAmplitude,
  blockSize = 14,
  showGridGaps = true,
  showEmbers = true,
  onDevilClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse tracking for eyes
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const particlesRef = useRef<Particle[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const blinkTimerRef = useRef<number>(0);
  const isBlinkingRef = useRef<boolean>(false);
  const laughShakeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 32x32 Grid resolution
  const GRID_SIZE = 32;

  // Track mouse coordinates relative to container
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    mousePosRef.current = {
      x: Math.max(0, Math.min(1, nx)),
      y: Math.max(0, Math.min(1, ny)),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = GRID_SIZE * blockSize;
    const height = GRID_SIZE * blockSize;
    canvas.width = width;
    canvas.height = height;

    const pal = PALETTES[palette] || PALETTES.blood;

    let tick = 0;

    const render = () => {
      tick++;

      // Handle random blinking
      blinkTimerRef.current++;
      if (blinkTimerRef.current > 200 + Math.random() * 150) {
        isBlinkingRef.current = true;
        if (blinkTimerRef.current > 215 + Math.random() * 150) {
          isBlinkingRef.current = false;
          blinkTimerRef.current = 0;
        }
      }

      // Laugh tremor jitter
      if (isLaughing) {
        const jitterIntensity = mouthState === 3 ? 3 : 1.5;
        laughShakeRef.current = {
          x: (Math.random() - 0.5) * jitterIntensity,
          y: (Math.random() - 0.5) * jitterIntensity,
        };
      } else {
        laughShakeRef.current = { x: 0, y: 0 };
      }

      // Clear Canvas to pure black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Save context for laugh shake
      ctx.save();
      ctx.translate(laughShakeRef.current.x, laughShakeRef.current.y);

      // Pixel matrix buffer for 32x32: 0 = transparent, other numbers = color IDs
      // 1: hornBase, 2: hornMid, 3: hornTip
      // 4: faceShade, 5: faceBase, 6: faceHighlight, 7: bgFace
      // 8: eyeSclera, 9: eyeIris, 10: eyePupil
      // 11: mouthCavity, 12: mouthFire, 13: teeth
      const grid: (number | null)[][] = Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill(null));

      // Helper to set symmetric pixel
      const setPixel = (x: number, y: number, colorId: number) => {
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          grid[y][x] = colorId;
        }
      };

      const setSym = (x: number, y: number, colorId: number) => {
        setPixel(x, y, colorId);
        setPixel(GRID_SIZE - 1 - x, y, colorId);
      };

      // ----------------------------------------------------
      // 1. CURVED DEMONIC HORNS
      // ----------------------------------------------------
      // Horn Tips (Sharp curved inward hooks at top)
      setSym(5, 1, 3); // Horn tip flame
      setSym(6, 1, 3);
      setSym(4, 2, 3);
      setSym(5, 2, 3);
      setSym(3, 3, 2);
      setSym(4, 3, 3);
      setSym(3, 4, 2);
      setSym(4, 4, 2);
      setSym(2, 5, 2);
      setSym(3, 5, 2);
      setSym(2, 6, 2);
      setSym(3, 6, 1);
      setSym(2, 7, 1);
      setSym(3, 7, 1);
      setSym(3, 8, 1);
      setSym(4, 8, 1);
      setSym(4, 9, 1);
      setSym(5, 9, 1);
      setSym(5, 10, 1);
      setSym(6, 10, 1);
      setSym(6, 11, 1);
      setSym(7, 11, 1);

      // Horn thickness & depth
      setSym(4, 4, 3);
      setSym(3, 5, 2);
      setSym(4, 5, 2);
      setSym(3, 6, 2);
      setSym(4, 6, 1);
      setSym(4, 7, 1);
      setSym(5, 7, 1);
      setSym(5, 8, 1);
      setSym(6, 8, 1);
      setSym(6, 9, 1);
      setSym(7, 9, 1);
      setSym(7, 10, 1);
      setSym(8, 10, 1);
      setSym(8, 11, 1);

      // ----------------------------------------------------
      // 2. DEVIL SKULL & FOREHEAD
      // ----------------------------------------------------
      // Forehead Crown
      for (let x = 11; x <= 16; x++) {
        setSym(x, 6, 4);
        setSym(x, 7, 5);
        setSym(x, 8, 6);
        setSym(x, 9, 5);
      }
      for (let x = 9; x <= 10; x++) {
        setSym(x, 8, 5);
        setSym(x, 9, 5);
        setSym(x, 10, 5);
      }
      for (let x = 8; x <= 16; x++) {
        setSym(x, 10, 5);
      }

      // Temple & Upper Face
      for (let x = 7; x <= 16; x++) {
        setSym(x, 11, x === 7 ? 4 : 5);
      }

      // Piercing Angled Brow Ridges (fierce V-shape)
      setSym(6, 12, 4);
      setSym(7, 12, 4);
      setSym(8, 12, 4);
      setSym(9, 12, 6); // Brow highlight
      setSym(10, 12, 6);
      setSym(11, 12, 5);
      setSym(12, 13, 6);
      setSym(13, 13, 6);
      setSym(14, 14, 5);
      setSym(15, 14, 4);

      // Cheeks & Jawbone Contours
      setSym(5, 13, 4);
      setSym(6, 13, 5);
      setSym(7, 13, 5);
      setSym(8, 13, 5);

      setSym(5, 14, 4);
      setSym(6, 14, 5);
      setSym(7, 14, 5);
      setSym(8, 14, 5);

      setSym(4, 15, 4); // Flared cheekbone apex
      setSym(5, 15, 5);
      setSym(6, 15, 6);
      setSym(7, 15, 5);
      setSym(8, 15, 5);

      setSym(5, 16, 4);
      setSym(6, 16, 5);
      setSym(7, 16, 5);
      setSym(8, 16, 5);
      setSym(9, 16, 5);

      setSym(6, 17, 4);
      setSym(7, 17, 5);
      setSym(8, 17, 5);
      setSym(9, 17, 5);

      // Midface & Bridge
      for (let x = 14; x <= 16; x++) {
        setSym(x, 15, 5);
        setSym(x, 16, 5);
      }

      // Demonic Nostril Slits
      setSym(14, 17, 5);
      setSym(15, 17, 11); // Left nostril cavity
      setSym(16, 17, 11);
      setSym(15, 18, 4);
      setSym(16, 18, 4);

      // ----------------------------------------------------
      // 3. PIERCING GLOWING EYES
      // ----------------------------------------------------
      // Eye Sockets (cols 9 to 13, rows 13 to 15)
      if (isBlinkingRef.current) {
        // Closed / Slit blink line
        for (let x = 9; x <= 13; x++) {
          setSym(x, 14, 4);
        }
      } else {
        // Eye Sclera (burning glowing eye field)
        setSym(9, 13, 8);
        setSym(10, 13, 8);
        setSym(11, 13, 8);
        setSym(12, 13, 8);

        setSym(9, 14, 8);
        setSym(10, 14, 8);
        setSym(11, 14, 8);
        setSym(12, 14, 8);
        setSym(13, 14, 8);

        setSym(10, 15, 8);
        setSym(11, 15, 8);
        setSym(12, 15, 8);

        // Eye Iris ring
        setSym(10, 13, 9);
        setSym(11, 13, 9);
        setSym(10, 14, 9);
        setSym(11, 14, 9);
        setSym(12, 14, 9);
        setSym(11, 15, 9);

        // Dynamic Slit Pupil tracking mouse
        // mousePosRef: {x: 0..1, y: 0..1}
        let pupilOffsetX = 0;
        if (mousePosRef.current.x < 0.4) pupilOffsetX = -1;
        else if (mousePosRef.current.x > 0.6) pupilOffsetX = 1;

        // Pupil vertical slit
        const px = 11 + pupilOffsetX;
        setSym(px, 13, 10);
        setSym(px, 14, 10);
        setSym(px, 15, 10);

        // High intensity eye gleam / white spark
        if (isSpeaking || isLaughing) {
          setSym(12, 13, 13); // Glint
        }
      }

      // ----------------------------------------------------
      // 4. JAW & ANIMATED LAUGHING MOUTH WITH RAZOR FANGS
      // ----------------------------------------------------
      // Determine effective mouth state based on audio or prop
      let effectiveMouth = mouthState;
      if (isSpeaking && audioAmplitude > 0.15) {
        // Modulate mouth opening based on voice speech amplitude
        effectiveMouth = audioAmplitude > 0.5 ? 2 : 1;
      }

      // Upper Lip
      for (let x = 10; x <= 16; x++) {
        setSym(x, 19, 4);
      }
      setSym(8, 19, 4);
      setSym(9, 19, 4);

      if (effectiveMouth === 0) {
        // === STATE 0: SINISTER SMIRK / CLOSED GRIN ===
        // Crescent evil smirk
        setSym(7, 19, 4);
        setSym(8, 20, 4);
        setSym(9, 20, 11);
        for (let x = 10; x <= 16; x++) {
          setSym(x, 20, 11);
        }

        // Razor Sharp Fangs Overlapping Upper Lip
        setSym(10, 20, 13);
        setSym(10, 21, 13); // Sharp left upper fang
        setSym(13, 20, 13);
        setSym(13, 21, 13); // Sharp left inner fang
        setSym(12, 20, 13);
        setSym(15, 20, 13);

        // Lower lip
        for (let x = 9; x <= 16; x++) {
          setSym(x, 21, 5);
          setSym(x, 22, 5);
        }

        // Chin
        for (let x = 11; x <= 16; x++) {
          setSym(x, 23, 5);
          setSym(x, 24, 5);
          setSym(x, 25, 4);
        }
        setSym(14, 26, 4);
        setSym(15, 26, 4);
        setSym(16, 26, 4);
        setSym(15, 27, 4);
        setSym(16, 27, 4);
      } else if (effectiveMouth === 1) {
        // === STATE 1: CHUCKLING / SPEAKING PHONEME ===
        // Mouth opens 2 rows
        for (let x = 9; x <= 16; x++) {
          setSym(x, 20, 11); // Oral cavity
          setSym(x, 21, 11);
        }
        setSym(8, 20, 4);

        // Throat fire / tongue glow
        setSym(14, 21, 12);
        setSym(15, 21, 12);
        setSym(16, 21, 12);

        // Upper Fangs
        setSym(10, 20, 13);
        setSym(10, 21, 13);
        setSym(13, 20, 13);
        setSym(13, 21, 13);

        // Lower Fangs
        setSym(11, 21, 13);
        setSym(14, 21, 13);

        // Lower Lip & Chin (shifted slightly down)
        for (let x = 8; x <= 16; x++) {
          setSym(x, 22, 5);
          setSym(x, 23, 5);
        }
        for (let x = 11; x <= 16; x++) {
          setSym(x, 24, 5);
          setSym(x, 25, 4);
          setSym(x, 26, 4);
        }
        setSym(14, 27, 4);
        setSym(15, 27, 4);
        setSym(16, 27, 4);
        setSym(15, 28, 4);
        setSym(16, 28, 4);
      } else if (effectiveMouth === 2) {
        // === STATE 2: WIDE EVIL LAUGH ===
        // Mouth drops 4 rows wide!
        setSym(7, 19, 4);
        setSym(7, 20, 4);

        for (let x = 8; x <= 16; x++) {
          setSym(x, 20, 11);
          setSym(x, 21, 11);
          setSym(x, 22, 11);
          setSym(x, 23, 11);
        }

        // Inner Hellfire Blazing inside demonic throat
        setSym(13, 21, 12);
        setSym(14, 21, 12);
        setSym(15, 21, 12);
        setSym(16, 21, 12);

        setSym(12, 22, 12);
        setSym(13, 22, 12);
        setSym(14, 22, 12);
        setSym(15, 22, 12);
        setSym(16, 22, 12);

        // Top Razor Fangs
        setSym(9, 20, 13);
        setSym(10, 20, 13);
        setSym(10, 21, 13); // Long fang
        setSym(12, 20, 13);
        setSym(14, 20, 13);

        // Bottom Sharp Teeth
        setSym(9, 23, 13);
        setSym(11, 23, 13);
        setSym(11, 22, 13); // Sharp lower fang
        setSym(14, 23, 13);
        setSym(15, 23, 13);

        // Jaw dropped
        for (let x = 8; x <= 16; x++) {
          setSym(x, 24, 5);
          setSym(x, 25, 5);
        }
        for (let x = 11; x <= 16; x++) {
          setSym(x, 26, 5);
          setSym(x, 27, 4);
        }
        setSym(14, 28, 4);
        setSym(15, 28, 4);
        setSym(16, 28, 4);
        setSym(15, 29, 4);
        setSym(16, 29, 4);
      } else {
        // === STATE 3: EXTREME MANIACAL CACKLE (MWAHAHAHA) ===
        // Gaping Maw with trembling Hellfire
        setSym(6, 19, 4);
        setSym(6, 20, 4);
        setSym(7, 20, 4);

        for (let x = 7; x <= 16; x++) {
          setSym(x, 20, 11);
          setSym(x, 21, 11);
          setSym(x, 22, 11);
          setSym(x, 23, 11);
          setSym(x, 24, 11);
        }

        // Hellfire core
        const fireFlicker = tick % 2 === 0 ? 12 : 3;
        for (let y = 21; y <= 23; y++) {
          for (let x = 11; x <= 16; x++) {
            setSym(x, y, fireFlicker);
          }
        }

        // Jagged Menacing Fangs
        setSym(8, 20, 13);
        setSym(9, 20, 13);
        setSym(9, 21, 13);
        setSym(10, 20, 13);
        setSym(11, 20, 13);
        setSym(11, 21, 13);
        setSym(13, 20, 13);
        setSym(14, 20, 13);

        // Bottom Sharp Fangs
        setSym(8, 24, 13);
        setSym(10, 24, 13);
        setSym(10, 23, 13);
        setSym(12, 24, 13);
        setSym(13, 24, 13);
        setSym(15, 24, 13);
        setSym(15, 23, 13);

        // Extended Jaw
        for (let x = 7; x <= 16; x++) {
          setSym(x, 25, 5);
          setSym(x, 26, 5);
        }
        for (let x = 10; x <= 16; x++) {
          setSym(x, 27, 5);
          setSym(x, 28, 4);
        }
        setSym(13, 29, 4);
        setSym(14, 29, 4);
        setSym(15, 29, 4);
        setSym(16, 29, 4);
        setSym(14, 30, 4);
        setSym(15, 30, 4);
        setSym(16, 30, 4);
      }

      // Cheek lines connecting jaw
      setSym(7, 18, 4);
      setSym(8, 18, 5);
      setSym(9, 18, 5);

      // Color mapping table
      const colorMap: Record<number, string> = {
        1: pal.hornBase,
        2: pal.hornMid,
        3: pal.hornTip,
        4: pal.faceShade,
        5: pal.faceBase,
        6: pal.faceHighlight,
        7: pal.bgFace,
        8: pal.eyeSclera,
        9: pal.eyeIris,
        10: pal.eyePupil,
        11: pal.mouthCavity,
        12: pal.mouthFire,
        13: pal.teeth,
      };

      // ----------------------------------------------------
      // DRAW PIXELS ON CANVAS
      // ----------------------------------------------------
      const gap = showGridGaps ? 1.5 : 0;
      const cellDrawSize = blockSize - gap;

      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const cid = grid[y][x];
          const px = x * blockSize;
          const py = y * blockSize;

          if (cid !== null && colorMap[cid]) {
            ctx.fillStyle = colorMap[cid];
            ctx.fillRect(px, py, cellDrawSize, cellDrawSize);

            // Subtle highlight on top-left of each block for 3D retro LED chip feel
            if (showGridGaps && blockSize >= 12 && cid !== 10 && cid !== 11) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
              ctx.fillRect(px, py, cellDrawSize, 1.5);
              ctx.fillRect(px, py, 1.5, cellDrawSize);
            }
          } else if (showGridGaps) {
            // Faint unlit pixel grid cell for authentic black LED monitor
            ctx.fillStyle = 'rgba(20, 20, 25, 0.4)';
            ctx.fillRect(px, py, cellDrawSize, cellDrawSize);
          }
        }
      }

      // ----------------------------------------------------
      // 5. FLOATING PIXEL HELLFIRE EMBERS
      // ----------------------------------------------------
      if (showEmbers) {
        // Spawn new pixel embers from horns and mouth
        if (Math.random() < (isLaughing ? 0.85 : 0.35)) {
          const spawnFromHorn = Math.random() > 0.4;
          let spawnX = 0;
          let spawnY = 0;

          if (spawnFromHorn) {
            // Spawn from horn tips
            const leftHorn = Math.random() > 0.5;
            spawnX = (leftHorn ? 4 + Math.random() * 4 : 24 + Math.random() * 4) * blockSize;
            spawnY = (2 + Math.random() * 5) * blockSize;
          } else {
            // Spawn from mouth / chin
            spawnX = (12 + Math.random() * 8) * blockSize;
            spawnY = (20 + Math.random() * 6) * blockSize;
          }

          const emberColor = pal.ember[Math.floor(Math.random() * pal.ember.length)];
          particlesRef.current.push({
            x: spawnX,
            y: spawnY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(1.2 + Math.random() * 2.2),
            color: emberColor,
            life: 0,
            maxLife: 30 + Math.random() * 40,
            size: Math.random() > 0.5 ? blockSize * 0.75 : blockSize * 0.5,
          });
        }

        // Update and draw embers
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          if (p.life >= p.maxLife || p.y < -10) {
            particles.splice(i, 1);
            continue;
          }

          const alpha = 1 - p.life / p.maxLife;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          // Snap ember to block coordinates for crisp pixel aesthetic
          const snapX = Math.round(p.x / blockSize) * blockSize;
          const snapY = Math.round(p.y / blockSize) * blockSize;
          ctx.fillRect(snapX, snapY, p.size, p.size);
          ctx.restore();
        }
      }

      ctx.restore(); // Restore shake translation

      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [
    palette,
    mouthState,
    isLaughing,
    isSpeaking,
    audioAmplitude,
    blockSize,
    showGridGaps,
    showEmbers,
  ]);

  const canvasWidth = GRID_SIZE * blockSize;
  const canvasHeight = GRID_SIZE * blockSize;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={onDevilClick}
      className="relative flex items-center justify-center cursor-crosshair select-none group"
      style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
      title="Click the devil to unleash an evil cackle"
    >
      <canvas
        ref={canvasRef}
        className="block pixel-art transition-transform duration-100 ease-out"
        style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
      />
    </div>
  );
};
