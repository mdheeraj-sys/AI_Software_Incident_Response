/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { evilAudio } from '../audio/evilAudioEngine';

interface AudioVisualizerProps {
  isRumbling: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRumbling }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const barCount = 36;
    const barWidth = 4;
    const barGap = 3;
    const maxHeight = 28;

    const dpr = window.devicePixelRatio || 1;
    const totalWidth = barCount * (barWidth + barGap);

    canvas.width = totalWidth * dpr;
    canvas.height = maxHeight * dpr;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${maxHeight}px`;

    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, totalWidth, maxHeight);

      const freqData = evilAudio.getAudioData();
      const hasAudio = freqData.length > 0 && freqData.some((v) => v > 15);

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor((i / barCount) * (freqData.length * 0.65));
        let val = hasAudio ? (freqData[binIndex] || 0) / 255 : 0;

        if (isRumbling && val < 0.2) {
          val = 0.12 + Math.random() * 0.22;
        }

        const barHeight = Math.max(2, Math.floor(val * maxHeight));
        const x = i * (barWidth + barGap);
        const y = (maxHeight - barHeight) / 2; // Center-aligned modern soundwave

        ctx.fillStyle = val > 0.4 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRumbling]);

  return (
    <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-sm">
      <span className="text-[11px] font-medium tracking-wider text-zinc-500 uppercase">Voice Wave</span>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
