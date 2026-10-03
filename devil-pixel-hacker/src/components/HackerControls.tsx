/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Flame,
  Activity,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface HackerControlsProps {
  blockSize: number;
  onBlockSizeChange: (size: number) => void;
  showGridGaps: boolean;
  onToggleGridGaps: () => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
  showHaBubbles: boolean;
  onToggleHaBubbles: () => void;
  glowIntensity: 'none' | 'subtle' | 'high';
  onGlowIntensityChange: (glow: 'none' | 'subtle' | 'high') => void;
  allowShake: boolean;
  onToggleShake: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  pitchMode: number;
  onPitchModeChange: (pitch: number) => void;
  laughSpeed: number;
  onLaughSpeedChange: (speed: number) => void;
}

export const HackerControls: React.FC<HackerControlsProps> = ({
  blockSize,
  onBlockSizeChange,
  showGridGaps,
  onToggleGridGaps,
  showScanlines,
  onToggleScanlines,
  showHaBubbles,
  onToggleHaBubbles,
  glowIntensity,
  onGlowIntensityChange,
  allowShake,
  onToggleShake,
  isMuted,
  onToggleMute,
  pitchMode,
  onPitchModeChange,
  laughSpeed,
  onLaughSpeedChange,
}) => {
  return (
    <div className="w-full max-w-xl bg-black border border-zinc-800 rounded-lg p-3 text-xs font-mono-code flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <Sliders className="w-3.5 h-3.5 text-white" />
          <span>WHITE PIXEL BLOCK CONTROLS</span>
        </div>
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-zinc-900 border-zinc-700 text-zinc-400'
              : 'bg-white text-black border-white font-bold'
          }`}
        >
          {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-black" />}
          <span className="text-[10px] uppercase">{isMuted ? 'Muted' : 'Audio On'}</span>
        </button>
      </div>

      {/* Row 1: Block Size & Glow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Block Size */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-zinc-500" />
            Block Size: {blockSize}px
          </label>
          <div className="flex items-center gap-1">
            {[14, 16, 18, 20].map((sz) => (
              <button
                key={sz}
                onClick={() => onBlockSizeChange(sz)}
                className={`flex-1 py-1 text-center rounded-none text-[10px] border cursor-pointer ${
                  blockSize === sz
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Glow */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-zinc-500" />
            White Glow:
          </label>
          <div className="flex items-center gap-1">
            {(['none', 'subtle', 'high'] as const).map((g) => (
              <button
                key={g}
                onClick={() => onGlowIntensityChange(g)}
                className={`flex-1 py-1 text-center rounded-none text-[10px] border cursor-pointer capitalize ${
                  glowIntensity === g
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Depth */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-zinc-500" />
            Voice Depth:
          </label>
          <div className="flex items-center gap-1">
            {[
              { label: 'Deep', val: 0.25 },
              { label: 'Demon', val: 0.4 },
              { label: 'Grit', val: 0.65 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => onPitchModeChange(p.val)}
                className={`flex-1 py-1 text-center rounded-none text-[10px] border cursor-pointer ${
                  pitchMode === p.val
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Laugh Speed */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-500 text-[10px] uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-zinc-500" />
            Cackle Speed:
          </label>
          <div className="flex items-center gap-1">
            {[
              { label: 'Slow', val: 0.85 },
              { label: 'Normal', val: 1.05 },
              { label: 'Fast', val: 1.35 },
            ].map((sp) => (
              <button
                key={sp.label}
                onClick={() => onLaughSpeedChange(sp.val)}
                className={`flex-1 py-1 text-center rounded-none text-[10px] border cursor-pointer ${
                  laughSpeed === sp.val
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Visual Toggles */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-900">
        <span className="text-zinc-500 text-[10px] uppercase">Toggles:</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleGridGaps}
            className={`px-2 py-0.5 rounded-none text-[10px] border cursor-pointer ${
              showGridGaps
                ? 'bg-zinc-800 border-white text-white'
                : 'bg-black border-zinc-800 text-zinc-500'
            }`}
            title="Toggle pixel block separation gaps"
          >
            Blocks: {showGridGaps ? 'LED Gap' : 'Solid'}
          </button>

          <button
            onClick={onToggleHaBubbles}
            className={`px-2 py-0.5 rounded-none text-[10px] border cursor-pointer ${
              showHaBubbles
                ? 'bg-zinc-800 border-white text-white'
                : 'bg-black border-zinc-800 text-zinc-500'
            }`}
            title="Toggle floating HA HA laugh bubbles"
          >
            "HA!" Bubbles: {showHaBubbles ? 'On' : 'Off'}
          </button>

          <button
            onClick={onToggleScanlines}
            className={`px-2 py-0.5 rounded-none text-[10px] border cursor-pointer ${
              showScanlines
                ? 'bg-zinc-800 border-white text-white'
                : 'bg-black border-zinc-800 text-zinc-500'
            }`}
            title="Toggle CRT Scanline curvature"
          >
            CRT: {showScanlines ? 'On' : 'Off'}
          </button>

          <button
            onClick={onToggleShake}
            className={`px-2 py-0.5 rounded-none text-[10px] border cursor-pointer ${
              allowShake
                ? 'bg-zinc-800 border-white text-white'
                : 'bg-black border-zinc-800 text-zinc-500'
            }`}
            title="Toggle screen shake on laugh"
          >
            Tremor: {allowShake ? 'On' : 'Off'}
          </button>
        </div>
      </div>
    </div>
  );
};
