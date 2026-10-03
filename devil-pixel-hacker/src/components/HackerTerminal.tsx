/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Flame, Play, Volume2, ShieldAlert, Sparkles } from 'lucide-react';

interface HackerTerminalProps {
  currentPhrase: string;
  isExecuting: boolean;
  isLaughing: boolean;
  activeWord: string;
  onExecute: (customPhrase?: string) => void;
  onTriggerLaugh: () => void;
  onStop: () => void;
  logLines: string[];
  onClearLogs: () => void;
}

const PRESET_QUOTES = [
  "Enter as hacker",
  "I'm a hacker",
  "Your firewall has fallen",
  "Root access granted",
  "I live in your mainframe",
  "System compromised",
];

export const HackerTerminal: React.FC<HackerTerminalProps> = ({
  currentPhrase,
  isExecuting,
  isLaughing,
  activeWord,
  onExecute,
  onTriggerLaugh,
  onStop,
  logLines,
  onClearLogs,
}) => {
  const [customInput, setCustomInput] = useState<string>("Enter as hacker");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onExecute(customInput.trim());
    }
  };

  return (
    <div className="w-full max-w-xl bg-black border border-zinc-800 rounded-lg overflow-hidden shadow-2xl relative z-10 flex flex-col">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-700 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-500 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-white inline-block" />
          </div>
          <span className="ml-1 text-xs font-mono-code text-zinc-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-white" />
            root@daemon-matrix:~#
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isExecuting && (
            <span className="text-[11px] font-mono-code flex items-center gap-1 text-white animate-pulse">
              <ShieldAlert className="w-3 h-3 text-white" />
              VOICING
            </span>
          )}
          {isLaughing && (
            <span className="text-[11px] font-mono-code flex items-center gap-1 text-white animate-pulse font-bold">
              <Flame className="w-3 h-3 text-white" />
              MWAHAHAHA
            </span>
          )}
          <button
            onClick={onClearLogs}
            className="text-[11px] text-zinc-500 hover:text-white font-mono-code px-2 py-0.5 rounded transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-3.5 font-mono-code text-xs h-32 overflow-y-auto space-y-1 bg-black scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="text-zinc-600 select-none">
          WHITE_BLOCK_DAEMON // SYSTEM STATUS: ACTIVE
        </div>
        {logLines.map((line, idx) => {
          const isSpeech = line.includes("SPEECH:") || line.includes("HACKER");
          const isLaugh = line.includes("MWAHA") || line.includes("CACKLE") || line.includes("LAUGH");
          return (
            <div
              key={idx}
              className={`leading-relaxed break-words ${
                isLaugh
                  ? 'text-white font-bold tracking-wide'
                  : isSpeech
                  ? 'text-zinc-200 font-semibold'
                  : 'text-zinc-400'
              }`}
            >
              {line}
            </div>
          );
        })}

        {/* Real-time word banner */}
        {isExecuting && activeWord && (
          <div className="text-sm font-pixel text-white pt-1 flex items-center gap-2">
            <span className="text-white">&gt;</span>
            <span className="px-2 py-0.5 bg-white text-black font-extrabold rounded-none">
              "{activeWord.toUpperCase()}"
            </span>
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Speak "ENTER AS HACKER" + Laugh */}
          <button
            type="button"
            onClick={() => onExecute("Enter as hacker")}
            disabled={isExecuting || isLaughing}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-none font-pixel text-xs tracking-wider transition-all uppercase select-none cursor-pointer border ${
              isExecuting || isLaughing
                ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-white text-black border-white hover:bg-zinc-200 active:scale-[0.99] font-bold shadow-[0_0_15px_rgba(255,255,255,0.4)]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>SAY "ENTER AS HACKER" &amp; LAUGH</span>
          </button>

          {/* Quick Evil Laugh */}
          <button
            type="button"
            onClick={onTriggerLaugh}
            disabled={isLaughing}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 border border-zinc-700 hover:border-white text-white font-mono-code text-xs font-semibold tracking-wide transition-colors active:scale-[0.99] cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-white" />
            <span>ANIMATED LAUGH</span>
          </button>

          {(isExecuting || isLaughing) && (
            <button
              type="button"
              onClick={onStop}
              className="py-2.5 px-3 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white rounded-none font-mono-code text-xs transition-colors cursor-pointer"
              title="Stop voice and animation"
            >
              STOP
            </button>
          )}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono-code text-xs">
              &gt;
            </span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type phrase for devil to recite..."
              className="w-full pl-7 pr-3 py-1.5 bg-black border border-zinc-800 focus:border-white text-xs font-mono-code text-white placeholder:text-zinc-600 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isExecuting || isLaughing || !customInput.trim()}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white disabled:opacity-50 text-xs font-mono-code text-white transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Speak
          </button>
        </form>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono-code text-zinc-400">
          <span className="text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-zinc-500" />
            Presets:
          </span>
          {PRESET_QUOTES.map((quote, qIdx) => (
            <button
              key={qIdx}
              type="button"
              onClick={() => {
                setCustomInput(quote);
                onExecute(quote);
              }}
              className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-colors text-[10px] cursor-pointer"
            >
              {quote}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
