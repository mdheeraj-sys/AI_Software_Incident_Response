/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Play, RotateCcw, Flame, Zap, ZapOff } from 'lucide-react';

interface KaliTerminalProps {
  onTriggerLaugh: () => void;
  onSpeakHacker: (text?: string) => void;
  onReplayIntro: () => void;
  isSiphoning: boolean;
  onToggleSiphon: () => void;
}

export const KaliTerminal: React.FC<KaliTerminalProps> = ({
  onTriggerLaugh,
  onSpeakHacker,
  onReplayIntro,
  isSiphoning,
  onToggleSiphon,
}) => {
  const [lines, setLines] = useState<string[]>([
    '[*] KALI LINUX 2026.1 // ROLLING RELEASE [x86_64]',
    '[*] Target: driven-engineering.corp (192.168.1.100)',
    'root@kali:~# nmap -sS -T4 -p 22,80,443 driven-engineering.corp',
    '[+] 443/tcp OPEN  https Driven/Telemetry-v4.8.2',
    '[*] Telemetry HUD Card located at 0x7FFF82A',
    'root@kali:~# ./probe_wire_interface.sh --detect',
    '[+] QUANTUM SIPHON PROBES READY FOR EXTRACTION',
    '[*] Type "suck" or click "⚡ SUCK DATA" to deploy wires!',
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Log wire status when siphoning state changes
  useEffect(() => {
    if (isSiphoning) {
      setLines((prev) => [
        ...prev,
        '[!] DEPLOYING QUANTUM CYBER WIRES ACROSS MIDDLE SPACE...',
        '[>>>] WIRES LATCHED: [1] HUD CARD [2] MAIN TITLE [3] METRICS',
        '[>>>] SUCKING EFFICIENCY INDEX (99.8% -> EXTRACTING)',
        '[>>>] SUCKING TOLERANCE STREAM (±0.001mm -> COMPROMISED)',
        '[+] REAL-TIME TELEMETRY PACKETS FLOWING INTO ROOT MEMORY...',
      ]);
    } else if (lines.length > 8) {
      setLines((prev) => [
        ...prev,
        '[*] CYBER WIRES DETACHED. TELEMETRY STABILIZING.',
      ]);
    }
  }, [isSiphoning]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    setLines((prev) => [...prev, `root@kali:~# ${cmd}`]);
    setInputVal('');

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      setLines((prev) => [
        ...prev,
        'Available commands:',
        '  suck / drain - deploy cyber wires to suck out page data & telemetry',
        '  stop / detach- disconnect cyber wires',
        '  devil / hack - speak "I\'m a hacker" with demonic voice',
        '  laugh        - trigger demonic cackle',
        '  scan         - run port & tolerance sensor vulnerability sweep',
        '  status       - display HUD bus & telemetry extraction status',
        '  clear        - clear console logs',
        '  replay       - replay cinematic intro with 2D tribal devil',
      ]);
    } else if (lower === 'suck' || lower === 'drain' || lower === 'extract' || lower === 'wire') {
      if (!isSiphoning) {
        onToggleSiphon();
      } else {
        setLines((prev) => [...prev, '[!] CYBER WIRES ALREADY ACTIVE AND SUCKING DATA!']);
      }
    } else if (lower === 'stop' || lower === 'detach' || lower === 'disconnect') {
      if (isSiphoning) {
        onToggleSiphon();
      } else {
        setLines((prev) => [...prev, '[*] Wires are not currently attached.']);
      }
    } else if (lower === 'devil' || lower === 'hack') {
      onSpeakHacker("I'm a hacker");
    } else if (lower === 'laugh') {
      onTriggerLaugh();
    } else if (lower === 'scan') {
      setLines((prev) => [
        ...prev,
        '[*] Initiating precision HUD sensor bus sweep...',
        '[+] Target Tolerance: ±0.001 mm [Insecure telemetry port 9042]',
        '[+] Target Efficiency: 99.8% [Open Modbus telemetry line]',
        '[+] Ready to suck out info via quantum wires.',
      ]);
    } else if (lower === 'status') {
      setLines((prev) => [
        ...prev,
        `[i] SIPHON STATUS: ${isSiphoning ? 'ACTIVE (SUCKING DATA)' : 'STANDBY (READY)'}`,
        '[i] HUD TELEMETRY BUS: 0x7FFF82A',
        '[i] METRICS LINK: ATTACHABLE',
      ]);
    } else if (lower === 'clear') {
      setLines(['[*] KALI LINUX TERMINAL RESET']);
    } else if (lower === 'replay' || lower === 'intro') {
      onReplayIntro();
    } else if (lower.startsWith('say ')) {
      const textToSay = cmd.substring(4).trim();
      onSpeakHacker(textToSay);
    } else {
      setLines((prev) => [
        ...prev,
        `bash: ${cmd}: command not found. Type 'help' or 'suck'.`,
      ]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050608] border-t border-zinc-800/80 font-mono text-[11px] overflow-hidden select-text">
      {/* Kali Window Chrome Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d0e12] border-b border-zinc-800/60 select-none">
        <div className="flex items-center gap-2">
          {/* Linux window dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-zinc-400 font-semibold text-[10px] tracking-wide ml-1 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-emerald-400" />
            root@kali: ~#
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border transition-colors ${
              isSiphoning
                ? 'bg-red-950/80 border-red-700 text-red-400 animate-pulse'
                : 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400'
            }`}
          >
            {isSiphoning ? 'SUCKING DATA...' : 'LIVE KERNEL'}
          </span>
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 terminal-scroll leading-relaxed text-zinc-300"
      >
        {lines.map((line, idx) => {
          const isPrompt = line.startsWith('root@kali:');
          const isSuccess = line.startsWith('[+]');
          const isSiphon = line.includes('SUCKING') || line.includes('WIRES') || line.includes('EXTRACTION');
          const isWarning = line.startsWith('[*]') || line.startsWith('[!]');
          return (
            <div
              key={idx}
              className={`break-words ${
                isSiphon
                  ? 'text-amber-400 font-bold animate-pulse'
                  : isPrompt
                  ? 'text-white font-semibold'
                  : isSuccess
                  ? 'text-emerald-400'
                  : isWarning
                  ? 'text-red-400'
                  : 'text-zinc-400'
              }`}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* Primary Cyber Siphon Button (Requested Feature!) */}
      <div className="p-2.5 bg-[#090b0e] border-t border-zinc-800 flex flex-col gap-2">
        <button
          type="button"
          onClick={onToggleSiphon}
          className={`w-full py-2.5 px-3 rounded text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
            isSiphoning
              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
          }`}
          title="Shoot cyber wires across the middle to suck out telemetry & info from the page"
        >
          {isSiphoning ? (
            <>
              <ZapOff className="w-4 h-4" />
              <span>DETACH CYBER WIRES</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>⚡ SUCK DATA FROM PAGE</span>
            </>
          )}
        </button>

        {/* Command Input Form */}
        <form onSubmit={handleCommand} className="flex items-center gap-1 pt-0.5">
          <span className="text-emerald-400 font-bold select-none">&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="type 'suck', 'devil', 'scan'..."
            className="flex-1 bg-transparent text-white text-[11px] outline-none placeholder:text-zinc-600 font-mono"
          />
          <button
            type="submit"
            className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors uppercase font-medium cursor-pointer"
          >
            EXEC
          </button>
        </form>
      </div>

      {/* Quick Tool Action Bar */}
      <div className="px-3 py-2 bg-[#0a0b0e] border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-400 select-none">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSpeakHacker("I'm a hacker")}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 text-emerald-400 fill-current" />
            <span>"I'm a hacker"</span>
          </button>
          <button
            type="button"
            onClick={onTriggerLaugh}
            className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Flame className="w-2.5 h-2.5 text-red-400 fill-current" />
            <span>Laugh</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReplayIntro}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Replay Intro</span>
        </button>
      </div>
    </div>
  );
};
