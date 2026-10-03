/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SimpleWhiteDevilProps {
  mouthState: number; // 0: smirk, 1: chuckle, 2: wide laugh, 3: manic laugh
  isLaughing: boolean;
  isSpeaking: boolean;
  audioAmplitude: number;
  blockSize: number; // Size of each white block (e.g. 14 to 22)
  blockStyle: 'geometric' | 'rounded' | 'seamless';
  glowEffect: boolean;
  onDevilClick?: () => void;
}

export const SimpleWhiteDevil: React.FC<SimpleWhiteDevilProps> = ({
  mouthState,
  isLaughing,
  isSpeaking,
  audioAmplitude,
  blockSize = 18,
  blockStyle = 'geometric',
  glowEffect = true,
  onDevilClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse tracking with smooth lerp
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const currentMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const frameIdRef = useRef<number | null>(null);
  const blinkTimerRef = useRef<number>(0);
  const isBlinkingRef = useRef<boolean>(false);
  const headBobRef = useRef<{ y: number; x: number }>({ y: 0, x: 0 });
  const laughRingsRef = useRef<{ radius: number; opacity: number }[]>([]);

  // 24x24 Clean Geometric Block Grid
  const COLS = 24;
  const ROWS = 24;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    targetMouseRef.current = {
      x: Math.max(0, Math.min(1, nx)),
      y: Math.max(0, Math.min(1, ny)),
    };
  }, []);

  // Spawn modern sleek laugh sound rings during cackle
  useEffect(() => {
    if (!isLaughing) return;
    const interval = setInterval(() => {
      laughRingsRef.current.push({
        radius: (COLS * blockSize) * 0.25,
        opacity: 0.8,
      });
      if (laughRingsRef.current.length > 6) {
        laughRingsRef.current.shift();
      }
    }, 280);
    return () => clearInterval(interval);
  }, [isLaughing, blockSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = COLS * blockSize;
    const logicalHeight = ROWS * blockSize;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    ctx.scale(dpr, dpr);

    let tick = 0;

    const render = () => {
      tick++;

      // Smooth lerp mouse tracking
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.1;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.1;

      // Natural eye blink timer
      blinkTimerRef.current++;
      if (blinkTimerRef.current > 190 + Math.random() * 100) {
        isBlinkingRef.current = true;
        if (blinkTimerRef.current > 205 + Math.random() * 100) {
          isBlinkingRef.current = false;
          blinkTimerRef.current = 0;
        }
      }

      // Smooth modern laughing bounce
      if (isLaughing) {
        const bobSin = Math.sin(tick * 0.42);
        const shakeIntensity = mouthState === 3 ? 3 : 1.5;
        headBobRef.current = {
          y: bobSin * (mouthState === 3 ? 4 : 2.5),
          x: (Math.random() - 0.5) * shakeIntensity,
        };
      } else if (isSpeaking) {
        headBobRef.current = {
          y: Math.sin(tick * 0.28) * (audioAmplitude * 4),
          x: 0,
        };
      } else {
        headBobRef.current = {
          y: Math.sin(tick * 0.04) * 1.5,
          x: 0,
        };
      }

      // Clear Canvas to pure black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // Render modern sound wave arcs behind devil when laughing
      if (isLaughing && laughRingsRef.current.length > 0) {
        ctx.save();
        const centerX = logicalWidth / 2;
        const centerY = logicalHeight * 0.65;
        const rings = laughRingsRef.current;

        for (let i = rings.length - 1; i >= 0; i--) {
          const ring = rings[i];
          ring.radius += 2.2;
          ring.opacity -= 0.018;

          if (ring.opacity <= 0) {
            rings.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${ring.opacity * 0.35})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.translate(headBobRef.current.x, headBobRef.current.y);

      // Construct the simple white block grid (24x24)
      const grid: boolean[][] = Array(ROWS)
        .fill(false)
        .map(() => Array(COLS).fill(false));

      const setPixel = (x: number, y: number) => {
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
          grid[y][x] = true;
        }
      };

      const setSym = (x: number, y: number) => {
        setPixel(x, y);
        setPixel(COLS - 1 - x, y);
      };

      // ----------------------------------------------------
      // 1. SIMPLE WHITE DEVIL HORNS (Geometric & Curved)
      // ----------------------------------------------------
      setSym(4, 0); // Sharp horn tip
      setSym(3, 1);
      setSym(4, 1);
      setSym(2, 2);
      setSym(3, 2);
      setSym(2, 3);
      setSym(3, 3);
      setSym(2, 4);
      setSym(3, 4);
      setSym(3, 5);
      setSym(4, 5);
      setSym(4, 6);
      setSym(5, 6);
      setSym(5, 7);
      setSym(6, 7);

      // Horn body thickness
      setSym(3, 3);
      setSym(4, 4);
      setSym(5, 5);

      // ----------------------------------------------------
      // 2. DEVIL SKULL / FOREHEAD & CHEEKS
      // ----------------------------------------------------
      for (let x = 6; x <= 11; x++) {
        setSym(x, 5);
        setSym(x, 6);
      }
      for (let x = 5; x <= 11; x++) {
        setSym(x, 7);
      }
      for (let x = 4; x <= 11; x++) {
        setSym(x, 8);
      }

      // Flared cheekbones
      setSym(3, 9);
      setSym(4, 9);
      setSym(5, 9);
      for (let x = 6; x <= 11; x++) setSym(x, 9);

      setSym(3, 10);
      setSym(4, 10);
      setSym(5, 10);
      for (let x = 6; x <= 11; x++) setSym(x, 10);

      // Sharp pointed cheek spurs
      setSym(2, 10);
      setSym(2, 11);
      setSym(3, 11);
      setSym(4, 11);
      setSym(5, 11);

      setSym(3, 12);
      setSym(4, 12);
      setSym(5, 12);

      setSym(4, 13);
      setSym(5, 13);

      setSym(4, 14);
      setSym(5, 14);

      for (let y = 15; y <= 17; y++) {
        setSym(5, y);
        setSym(6, y);
      }

      // ----------------------------------------------------
      // 3. EYES (Menacing & Animated)
      // ----------------------------------------------------
      if (isLaughing || mouthState >= 2) {
        // Wicked crescent laughing squint slits: ^  ^
        grid[9][7] = false;
        grid[9][8] = false;
        grid[9][15] = false;
        grid[9][16] = false;

        grid[10][8] = false;
        grid[10][9] = false;
        grid[10][14] = false;
        grid[10][15] = false;

        grid[11][7] = true;
        grid[11][8] = true;
        grid[11][9] = true;
        grid[11][10] = true;
        grid[11][13] = true;
        grid[11][14] = true;
        grid[11][15] = true;
        grid[11][16] = true;
      } else if (isBlinkingRef.current) {
        // Sleek closed blink
        for (let x = 7; x <= 10; x++) {
          grid[10][x] = false;
          grid[10][COLS - 1 - x] = false;
        }
      } else {
        // Open piercing eyes
        grid[9][8] = false;
        grid[9][9] = false;
        grid[9][14] = false;
        grid[9][15] = false;

        grid[10][7] = false;
        grid[10][8] = false;
        grid[10][9] = false;
        grid[10][14] = false;
        grid[10][15] = false;
        grid[10][16] = false;

        grid[11][8] = false;
        grid[11][9] = false;
        grid[11][14] = false;
        grid[11][15] = false;

        // Dynamic pupil tracking cursor
        let pupilCol = 8;
        if (currentMouseRef.current.x < 0.42) pupilCol = 7;
        else if (currentMouseRef.current.x > 0.58) pupilCol = 9;

        grid[10][pupilCol] = true;
        grid[10][COLS - 1 - pupilCol] = true;
      }

      // Nostril slits
      grid[12][11] = false;
      grid[12][12] = false;
      grid[13][11] = true;
      grid[13][12] = true;

      // ----------------------------------------------------
      // 4. ANIMATED LAUGHING MOUTH & RAZOR FANGS
      // ----------------------------------------------------
      let curMouth = mouthState;
      if (isSpeaking && audioAmplitude > 0.18) {
        curMouth = audioAmplitude > 0.45 ? 2 : 1;
      }

      if (curMouth === 0) {
        // === FRAME 0: IDLE SINISTER SMIRK ===
        for (let x = 7; x <= 11; x++) setSym(x, 14);

        for (let x = 6; x <= 11; x++) {
          grid[15][x] = false;
          grid[15][COLS - 1 - x] = false;
        }

        // Sharp fangs
        grid[15][7] = true;
        grid[15][10] = true;
        grid[15][COLS - 1 - 7] = true;
        grid[15][COLS - 1 - 10] = true;

        for (let x = 6; x <= 11; x++) {
          setSym(x, 16);
          setSym(x, 17);
        }

        // Pointed chin
        setSym(8, 18);
        setSym(9, 18);
        setSym(10, 18);
        setSym(11, 18);
        setSym(9, 19);
        setSym(10, 19);
        setSym(11, 19);
        setSym(10, 20);
        setSym(11, 20);
      } else if (curMouth === 1) {
        // === FRAME 1: CHUCKLE / PHONEME ===
        for (let x = 6; x <= 11; x++) {
          grid[14][x] = true;
          grid[14][COLS - 1 - x] = true;

          grid[15][x] = false;
          grid[15][COLS - 1 - x] = false;
          grid[16][x] = false;
          grid[16][COLS - 1 - x] = false;
        }

        // Upper fangs
        grid[15][7] = true;
        grid[15][10] = true;
        grid[15][COLS - 1 - 7] = true;
        grid[15][COLS - 1 - 10] = true;

        // Lower fangs
        grid[16][8] = true;
        grid[16][COLS - 1 - 8] = true;

        for (let x = 6; x <= 11; x++) {
          setSym(x, 17);
          setSym(x, 18);
        }
        setSym(8, 19);
        setSym(9, 19);
        setSym(10, 19);
        setSym(11, 19);
        setSym(10, 20);
        setSym(11, 20);
        setSym(11, 21);
      } else if (curMouth === 2) {
        // === FRAME 2: WIDE GAPING LAUGH ===
        for (let x = 5; x <= 11; x++) {
          grid[14][x] = true;
          grid[14][COLS - 1 - x] = true;

          grid[15][x] = false;
          grid[15][COLS - 1 - x] = false;
          grid[16][x] = false;
          grid[16][COLS - 1 - x] = false;
          grid[17][x] = false;
          grid[17][COLS - 1 - x] = false;
        }

        // Upper fangs
        grid[15][6] = true;
        grid[15][7] = true;
        grid[15][10] = true;
        grid[15][COLS - 1 - 6] = true;
        grid[15][COLS - 1 - 7] = true;
        grid[15][COLS - 1 - 10] = true;

        // Lower fangs
        grid[17][7] = true;
        grid[17][9] = true;
        grid[17][COLS - 1 - 7] = true;
        grid[17][COLS - 1 - 9] = true;

        // Tongue block in throat
        grid[17][11] = true;
        grid[17][12] = true;

        // Dropped jaw
        for (let x = 6; x <= 11; x++) {
          setSym(x, 18);
          setSym(x, 19);
        }
        setSym(8, 20);
        setSym(9, 20);
        setSym(10, 20);
        setSym(11, 20);
        setSym(10, 21);
        setSym(11, 21);
        setSym(11, 22);
      } else {
        // === FRAME 3: EXTREME MANIACAL CACKLE (MWAHAHAHA!) ===
        for (let x = 4; x <= 11; x++) {
          grid[14][x] = true;
          grid[14][COLS - 1 - x] = true;

          grid[15][x] = false;
          grid[15][COLS - 1 - x] = false;
          grid[16][x] = false;
          grid[16][COLS - 1 - x] = false;
          grid[17][x] = false;
          grid[17][COLS - 1 - x] = false;
          grid[18][x] = false;
          grid[18][COLS - 1 - x] = false;
        }

        // Jagged fangs
        grid[15][5] = true;
        grid[15][7] = true;
        grid[15][8] = true;
        grid[15][10] = true;
        grid[15][COLS - 1 - 5] = true;
        grid[15][COLS - 1 - 7] = true;
        grid[15][COLS - 1 - 8] = true;
        grid[15][COLS - 1 - 10] = true;

        grid[18][6] = true;
        grid[18][8] = true;
        grid[18][9] = true;
        grid[18][COLS - 1 - 6] = true;
        grid[18][COLS - 1 - 8] = true;
        grid[18][COLS - 1 - 9] = true;

        grid[18][11] = true;
        grid[18][12] = true;

        // Maximum dropped chin
        for (let x = 5; x <= 11; x++) {
          setSym(x, 19);
          setSym(x, 20);
        }
        setSym(7, 21);
        setSym(8, 21);
        setSym(9, 21);
        setSym(10, 21);
        setSym(11, 21);
        setSym(9, 22);
        setSym(10, 22);
        setSym(11, 22);
        setSym(10, 23);
        setSym(11, 23);
      }

      // ----------------------------------------------------
      // 5. DRAW SIMPLE WHITE BLOCKS
      // ----------------------------------------------------
      const gap = blockStyle === 'seamless' ? 0 : 2;
      const cellDrawSize = blockSize - gap;
      const radius = blockStyle === 'rounded' ? 3.5 : 1;

      if (glowEffect) {
        ctx.shadowColor = isLaughing ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.35)';
        ctx.shadowBlur = isLaughing ? 18 : 8;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#FFFFFF';

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const isWhite = grid[r][c];
          const px = c * blockSize;
          const py = r * blockSize;

          if (isWhite) {
            if (radius > 1 && ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(px, py, cellDrawSize, cellDrawSize, radius);
              ctx.fill();
            } else {
              ctx.fillRect(px, py, cellDrawSize, cellDrawSize);
            }
          }
        }
      }

      ctx.restore();

      frameIdRef.current = requestAnimationFrame(render);
    };

    frameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [
    mouthState,
    isLaughing,
    isSpeaking,
    audioAmplitude,
    blockSize,
    blockStyle,
    glowEffect,
  ]);

  const logicalWidth = COLS * blockSize;
  const logicalHeight = ROWS * blockSize;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={onDevilClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: `${logicalWidth}px`, height: `${logicalHeight}px` }}
      title="Click devil to trigger animated laugh"
    >
      <canvas
        ref={canvasRef}
        className="block transition-transform duration-100 ease-out"
      />
    </div>
  );
};
