/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Shield,
  Play,
  RotateCcw,
  Flame,
  Zap,
  ZapOff,
  Skull,
  Crosshair,
  KeyRound,
  DatabaseZap,
  ScanSearch,
  Rocket,
  CornerDownLeft,
} from 'lucide-react';
import hackerImg from '../assets/hacker.jpg';

interface HackerVMProps {
  isSiphoning: boolean;
  onToggleSiphon: (attackType?: string) => void;
  onSelectAttack?: (type: string) => void;
  onSpeakHacker: (text?: string) => void;
  onTriggerLaugh: () => void;
  onReplayIntro: () => void;
  onLaunchAttack?: (type: string) => void;
  hackerIp?: string;
}

export const HackerVM: React.FC<HackerVMProps> = ({
  isSiphoning,
  onToggleSiphon,
  onSelectAttack,
  onSpeakHacker,
  onTriggerLaugh,
  onReplayIntro,
  onLaunchAttack,
  hackerIp = '119.235.52.196',
}) => {
  const [selectedAttack, setSelectedAttack] = useState<'brute' | 'sqli' | 'scan' | 'deploy'>('brute');
  const [lines, setLines] = useState<string[]>([
    `[*] KALI LINUX 2026.1 // ATTACKER VM-A (${hackerIp})`,
    '[*] Target: College Portal Backend (:8000)',
    `root@kali:~# nmap -sS -T4 -p 22,80,443,8000 target-host`,
    '[+] 8000/tcp OPEN  FastAPI Telemetry API v4.8.2',
    '[*] Telemetry HUD Card located at 0x7FFF82A',
    '[+] QUANTUM SIPHON PROBES ARMED FOR EXTRACTION',
    '[*] Ready to deploy attack payload stream...',
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Update banner when real hacker IP is detected
  useEffect(() => {
    if (hackerIp) {
      setLines((prev) => {
        const next = [...prev];
        if (next[0]?.includes('KALI LINUX')) {
          next[0] = `[*] KALI LINUX 2026.1 // ATTACKER VM-A (${hackerIp})`;
        }
        return next;
      });
    }
  }, [hackerIp]);

  // Log wire status when siphoning state changes
  useEffect(() => {
    if (isSiphoning) {
      setLines((prev) => [
        ...prev,
        `[!] LAUNCHING ${selectedAttack.toUpperCase()} ATTACK STREAM...`,
        '[>>>] SIPHON LASER DEPLOYED ACROSS MIDDLE SPACE',
        '[!] DEFENSE SENTINEL ENGAGED: AI Agent intercepted wires in mid-transit!',
        '[!] WIRE FLOW TERMINATED AT AGENT SHIELD. Zero packets reached Software VM.',
        '[*] n8n Autonomous Agent investigating incident via Webhook & Telegram...',
      ]);
    } else if (lines.length > 7) {
      setLines((prev) => [
        ...prev,
        '[*] ATTACK VECTOR SUSPENDED. TARGET SOFTWARE SECURED.',
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
        '  suck / attack - deploy attack stream against Software VM',
        '  stop / detach - cease attack transmission',
        '  brute         - select Hydra brute force vector',
        '  sqli          - select SQLMap SQL injection vector',
        '  scan          - select Gobuster directory scanning',
        '  deploy        - select bad deploy regression fault',
        '  devil / hack  - speak sinister hacker voice',
        '  laugh         - trigger evil cackle',
        '  clear         - clear console logs',
      ]);
    } else if (lower === 'suck' || lower === 'attack' || lower === 'drain') {
      if (!isSiphoning) onToggleSiphon(selectedAttack);
    } else if (lower === 'stop' || lower === 'detach') {
      if (isSiphoning) onToggleSiphon(selectedAttack);
    } else if (lower === 'brute') {
      setSelectedAttack('brute');
      onSelectAttack?.('brute');
      setLines((prev) => [...prev, '[*] Vector set: Hydra Password Brute Force']);
    } else if (lower === 'sqli') {
      setSelectedAttack('sqli');
      onSelectAttack?.('sqli');
      setLines((prev) => [...prev, '[*] Vector set: SQLMap SQL Injection Probe']);
    } else if (lower === 'scan') {
      setSelectedAttack('scan');
      onSelectAttack?.('scan');
      setLines((prev) => [...prev, '[*] Vector set: Gobuster Directory Scan']);
    } else if (lower === 'deploy') {
      setSelectedAttack('deploy');
      onSelectAttack?.('deploy');
      setLines((prev) => [...prev, '[*] Vector set: Bad Deploy Regression Injection']);
    } else if (lower === 'devil' || lower === 'hack') {
      onSpeakHacker("Enter as hacker");
    } else if (lower === 'laugh') {
      onTriggerLaugh();
    } else if (lower === 'clear') {
      setLines(['[*] Console cleared.']);
    } else {
      setLines((prev) => [...prev, `[-] Command unrecognized: "${cmd}". Type "help".`]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/70 border-r border-zinc-200 font-mono text-[11px] overflow-hidden select-text">
      {/* 1. Hacker VM Window Header Bar with Small Profile Logo at Top Left */}
      <div className="flex items-center justify-between px-3.5 py-3 bg-white border-b border-zinc-200 select-none shadow-2xs">
        <div className="flex items-center gap-2.5">
          {/* Small Profile Logo (Top Left Profile) */}
          <div className="relative group shrink-0">
            <div className="size-9 rounded-full overflow-hidden border-2 border-red-500 shadow-sm bg-zinc-900">
              <img
                src={hackerImg}
                alt="Hacker Profile Avatar"
                className="w-full h-full object-cover object-center filter contrast-125"
              />
            </div>
            {/* Live Indicator Dot on Profile */}
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {/* Window dots */}
              <div className="flex items-center gap-1 mr-0.5">
                <span className="w-2 h-2 rounded-full bg-red-500/90 inline-block" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/90 inline-block" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/90 inline-block" />
              </div>
              <span className="text-zinc-900 font-bold text-[11px] tracking-wide flex items-center gap-1">
                HACKER VM // VM-A
              </span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">
              root@kali · <span className="text-red-700 font-bold">{hackerIp}</span> (Real Public IP)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border transition-colors ${
              isSiphoning
                ? 'bg-red-50 border-red-300 text-red-800 animate-pulse shadow-xs'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
            }`}
          >
            {isSiphoning ? 'ATTACKING' : 'ONLINE'}
          </span>
        </div>
      </div>

      {/* 2. Attack Vector Quick Selector */}
      <div className="px-3 py-2 bg-white border-b border-zinc-200">
        <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-red-500" />
          SELECT ATTACK VECTOR:
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'brute', label: 'Hydra Brute', desc: 'Auth 401 surge', icon: KeyRound },
            { id: 'sqli', label: 'SQLMap SQLi', desc: 'UNION SELECT injection', icon: DatabaseZap },
            { id: 'scan', label: 'Gobuster Scan', desc: '404 endpoint fuzzing', icon: ScanSearch },
            { id: 'deploy', label: 'Bad Deploy', desc: '500 error regression', icon: Rocket },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setSelectedAttack(v.id as any);
                onSelectAttack?.(v.id);
                if (isSiphoning) {
                  onLaunchAttack?.(v.id);
                }
                setLines((prev) => [...prev, `[*] Armed vector: ${v.label} (${v.desc})`]);
              }}
              className={`p-1.5 rounded border text-left transition-all cursor-pointer shadow-2xs ${
                selectedAttack === v.id
                  ? 'bg-red-50 border-red-400 text-red-950 font-semibold ring-2 ring-red-200'
                  : 'bg-zinc-50/80 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-[10px]">
                <v.icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>{v.label}</span>
              </div>
              <div className="text-[8px] text-zinc-500 truncate">{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Terminal Output Log Area (Authentic Black Terminal Console) */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 terminal-scroll leading-relaxed bg-[#050608] border-y border-zinc-900 text-zinc-300 shadow-inner"
      >
        {lines.map((line, idx) => {
          const isPrompt = line.startsWith('root@kali:');
          const isSuccess = line.startsWith('[+]');
          const isSiphon = line.includes('SIPHON') || line.includes('TRANSMITTING') || line.includes('ATTACK STREAM');
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
                  ? 'text-emerald-400 font-medium'
                  : isWarning
                  ? 'text-red-400 font-medium'
                  : 'text-zinc-300'
              }`}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* 4. Primary Attack Launch Button */}
      <div className="p-3 bg-white border-t border-zinc-200 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onToggleSiphon(selectedAttack)}
          className={`w-full py-2.5 px-3 rounded text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            isSiphoning
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title="Shoot attack siphon wires across to Software VM"
        >
          {isSiphoning ? (
            <>
              <ZapOff className="w-4 h-4" />
              <span>STOP ATTACK STREAM</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current text-white" />
              <span>⚡ LAUNCH ATTACK & SUCK DATA</span>
            </>
          )}
        </button>

        {/* Command Input Form */}
        <form onSubmit={handleCommand} className="flex items-center gap-1.5 pt-0.5">
          <span className="text-red-600 font-bold select-none">&gt;</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="type 'attack', 'brute', 'sqli'..."
            className="flex-1 bg-black border border-zinc-800 rounded px-2.5 py-1 text-emerald-400 text-[11px] outline-none placeholder:text-zinc-600 font-mono focus:border-red-500"
          />
          <button
            type="submit"
            className="text-[10px] px-2.5 py-1 rounded bg-zinc-900 text-white hover:bg-black transition-colors uppercase font-medium cursor-pointer shadow-2xs border border-zinc-800"
          >
            <CornerDownLeft className="w-3 h-3" aria-hidden="true" />
            EXEC
          </button>
        </form>
      </div>

      {/* 5. Quick Tool Audio Actions */}
      <div className="px-3 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-600 select-none">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSpeakHacker("Enter as hacker")}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 transition-colors cursor-pointer shadow-2xs font-medium"
          >
            <Play className="w-2.5 h-2.5 text-emerald-600 fill-current" />
            <span>"Enter as hacker"</span>
          </button>
          <button
            type="button"
            onClick={onTriggerLaugh}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 transition-colors cursor-pointer shadow-2xs font-medium"
          >
            <Flame className="w-2.5 h-2.5 text-red-500 fill-current" />
            <span>Laugh</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReplayIntro}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer font-medium"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Intro</span>
        </button>
      </div>
    </div>
  );
};
