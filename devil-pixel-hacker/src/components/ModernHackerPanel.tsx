/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Volume2, Sparkles, Sliders, Square, CornerDownLeft, ShieldAlert } from 'lucide-react';

interface ModernHackerPanelProps {
  isExecuting: boolean;
  isLaughing: boolean;
  onExecute: (phrase: string) => void;
  onTriggerLaugh: () => void;
  onStop: () => void;
  pitchMode: number;
  onPitchModeChange: (val: number) => void;
  laughSpeed: number;
  onLaughSpeedChange: (val: number) => void;
  blockStyle: 'geometric' | 'rounded' | 'seamless';
  onBlockStyleChange: (s: 'geometric' | 'rounded' | 'seamless') => void;
  glowEffect: boolean;
  onToggleGlow: () => void;
}

const PRESET_PHRASES = [
  "I'm a hacker",
  "Your firewall has fallen",
  "Root access granted",
  "I live inside your system",
];

export const ModernHackerPanel: React.FC<ModernHackerPanelProps> = ({
  isExecuting,
  isLaughing,
  onExecute,
  onTriggerLaugh,
  onStop,
  pitchMode,
  onPitchModeChange,
  laughSpeed,
  onLaughSpeedChange,
  blockStyle,
  onBlockStyleChange,
  glowEffect,
  onToggleGlow,
}) => {
  const [customText, setCustomText] = useState<string>("I'm a hacker");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onExecute(customText.trim());
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-3 font-sans">
      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onExecute("I'm a hacker")}
          disabled={isExecuting || isLaughing}
          className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 select-none shadow-xl cursor-pointer ${
            isExecuting || isLaughing
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              : 'bg-white text-black hover:bg-zinc-200 active:scale-[0.99] border border-white shadow-[0_0_25px_rgba(255,255,255,0.25)]'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Say "I'm a hacker" &amp; Laugh</span>
        </button>

        <button
          type="button"
          onClick={onTriggerLaugh}
          disabled={isLaughing}
          className="flex items-center justify-center gap-2 py-3.5 px-5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.99] cursor-pointer"
        >
          <span className="text-base leading-none">😈</span>
          <span>Evil Laugh</span>
        </button>

        {(isExecuting || isLaughing) && (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center gap-1.5 py-3.5 px-4 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            title="Stop playback"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Modern Custom Speech Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-1.5 focus-within:border-zinc-500 transition-colors shadow-inner"
      >
        <div className="flex items-center gap-2 flex-1 pl-3">
          <Volume2 className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type custom text for devil to recite..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isExecuting || isLaughing || !customText.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
        >
          <span>Speak</span>
          <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </form>

      {/* Preset Phrases */}
      <div className="flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-xs text-zinc-500 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-zinc-500" />
          Quick Phrases:
        </span>
        {PRESET_PHRASES.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setCustomText(phrase);
              onExecute(phrase);
            }}
            className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            "{phrase}"
          </button>
        ))}
      </div>

      {/* Collapsible Modern Settings */}
      <div className="mt-1 border-t border-zinc-900 pt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Voice &amp; Block Settings {showSettings ? '▲' : '▼'}</span>
          </button>

          {isExecuting && (
            <span className="text-xs text-zinc-400 flex items-center gap-1 animate-pulse">
              <ShieldAlert className="w-3 h-3 text-white" />
              Speaking phrase...
            </span>
          )}
        </div>

        {showSettings && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-zinc-950/70 border border-zinc-900 text-xs">
            {/* Voice Pitch */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Voice Tone</label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                {[
                  { label: 'Deep Sub', val: 0.25 },
                  { label: 'Demon', val: 0.4 },
                  { label: 'Crisp', val: 0.65 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onPitchModeChange(item.val)}
                    className={`flex-1 py-1 text-center rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                      pitchMode === item.val
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Laugh Speed */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Laugh Cadence</label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                {[
                  { label: 'Slow', val: 0.85 },
                  { label: 'Normal', val: 1.05 },
                  { label: 'Frenzy', val: 1.35 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onLaughSpeedChange(item.val)}
                    className={`flex-1 py-1 text-center rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                      laughSpeed === item.val
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Block Corner Style */}
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Block Style</label>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
                {[
                  { label: 'Grid', val: 'geometric' as const },
                  { label: 'Rounded', val: 'rounded' as const },
                  { label: 'Solid', val: 'seamless' as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onBlockStyleChange(item.val)}
                    className={`flex-1 py-1 text-center rounded-md font-medium text-[11px] transition-colors cursor-pointer ${
                      blockStyle === item.val
                        ? 'bg-white text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
