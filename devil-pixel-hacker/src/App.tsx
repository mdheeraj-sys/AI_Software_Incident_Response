/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TribalDevilEmblem } from './components/TribalDevilEmblem';
import { KaliTerminal } from './components/KaliTerminal';
import { DrivenHero } from './components/DrivenHero';
import { CyberSiphonWires } from './components/CyberSiphonWires';
import { evilAudio } from './audio/evilAudioEngine';
import { Skull, Volume2, VolumeX, RotateCcw, PanelLeftClose, PanelLeft, Zap, Flame, Bot, Sparkles } from 'lucide-react';
import AgentAvatar, { AgentStatus } from './components/ui/agent-avatar';
import { AgentShowcaseModal } from './components/AgentShowcaseModal';

type IntroPhase =
  | 'idle_black'
  | 'devil_emerges'
  | 'speaking_hacker'
  | 'evil_laugh'
  | 'glitch_transition'
  | 'completed';

export default function App() {
  const [introPhase, setIntroPhase] = useState<IntroPhase>('idle_black');
  const [isLaughing, setIsLaughing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeWord, setActiveWord] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSiphoning, setIsSiphoning] = useState<boolean>(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState<boolean>(false);
  const [avatarMode, setAvatarMode] = useState<'agent' | 'daemon'>('agent');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('threat_detected');

  // Trigger evil laugh
  const triggerEvilLaugh = useCallback(
    (customCount: number = 7, onEndCallback?: () => void) => {
      setIsLaughing(true);
      evilAudio.playEvilLaugh({
        laughCount: customCount,
        speed: 1.1,
        basePitch: 95,
        onEnd: () => {
          setIsLaughing(false);
          onEndCallback?.();
        },
      });
    },
    []
  );

  // Trigger demonic speech: "I'm a hacker" + laugh
  const triggerHackerSpeech = useCallback(
    (text: string = "I'm a hacker", withLaugh: boolean = true, onEndCallback?: () => void) => {
      setIsSpeaking(true);
      setActiveWord('');

      evilAudio.speakSinisterPhrase(text, {
        pitchShift: 0.25,
        rate: 0.78,
        withLaughAfter: withLaugh,
        onWord: (word) => {
          setActiveWord(word);
        },
        onLaughStart: () => {
          setIsSpeaking(false);
          setActiveWord('');
          setIsLaughing(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setIsLaughing(false);
          setActiveWord('');
          onEndCallback?.();
        },
      });
    },
    []
  );

  // Master Intro Orchestration Sequence
  const runIntroSequence = useCallback(() => {
    setIntroPhase('idle_black');
    setIsSpeaking(false);
    setIsLaughing(false);
    setIsSiphoning(false);

    // 0.6s: 2D Tribal Devil Emblem appears in center with red/white glow
    setTimeout(() => {
      setIntroPhase('devil_emerges');

      // 1.8s: Devil starts speaking "I'M A HACKER"
      setTimeout(() => {
        setIntroPhase('speaking_hacker');
        triggerHackerSpeech("I'm a hacker", true, () => {
          // After speech & laugh completes:
          setIntroPhase('glitch_transition');

          // Glitch transition -> shrinks and docks into left sidebar!
          setTimeout(() => {
            setIntroPhase('completed');
          }, 1100);
        });
      }, 1200);
    }, 600);
  }, [triggerHackerSpeech]);

  // Run on page mount
  useEffect(() => {
    runIntroSequence();
  }, [runIntroSequence]);

  const handleSkipIntro = () => {
    evilAudio.stopAll();
    setIsSpeaking(false);
    setIsLaughing(false);
    setActiveWord('');
    setIntroPhase('completed');
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    evilAudio.setMuted(next);
  };

  // Toggle cyber siphon wire extraction
  const handleToggleSiphon = () => {
    const nextState = !isSiphoning;
    setIsSiphoning(nextState);

    if (nextState) {
      evilAudio.playGlitchBurst();
      evilAudio.playDemonicRumble(5.0);
      // Small evil laugh as wires suck data
      setTimeout(() => {
        triggerEvilLaugh(4);
      }, 600);
    }
  };

  const isIntroActive = introPhase !== 'completed';

  return (
    <div className="relative w-full min-h-screen bg-[#07080a] text-white flex overflow-hidden font-inter">
      {/* ======================================================== */}
      {/* 1. INTRO CINEMATIC OVERLAY (2D Tribal Devil Blend)       */}
      {/* ======================================================== */}
      {isIntroActive && (
        <div
          className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-all duration-1000 ${
            introPhase === 'glitch_transition' ? 'glitch-active opacity-90' : 'opacity-100'
          }`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-radial from-red-950/25 via-black to-black pointer-events-none" />

          {/* Skip Intro Button */}
          <button
            onClick={handleSkipIntro}
            className="absolute top-6 right-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-space tracking-widest uppercase transition-colors cursor-pointer text-white/80 hover:text-white z-50"
          >
            Skip Intro &rarr;
          </button>

          {/* Central 2D Tribal Devil Emblem */}
          <div
            className={`relative transition-all duration-1000 ease-out flex flex-col items-center ${
              introPhase === 'idle_black'
                ? 'opacity-0 scale-50'
                : introPhase === 'devil_emerges'
                ? 'opacity-100 scale-100'
                : introPhase === 'speaking_hacker' || introPhase === 'evil_laugh'
                ? 'opacity-100 scale-105'
                : 'opacity-50 scale-75 -translate-x-64'
            }`}
          >
            <TribalDevilEmblem
              size={290}
              isLaughing={isLaughing}
              isSpeaking={isSpeaking}
              glow="dramatic"
              onClick={() => triggerEvilLaugh(6)}
            />

            {/* Glowing Subtitle: "I'M A HACKER" / "MWAHAHAHA" */}
            <div className="mt-8 min-h-[50px] flex items-center justify-center text-center">
              {introPhase === 'speaking_hacker' && (
                <div className="flex flex-col items-center gap-2">
                  <span className="font-syncopate font-bold text-2xl sm:text-4xl text-white tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-pulse">
                    &gt; I'M A HACKER.
                  </span>
                  {activeWord && (
                    <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest">
                      [VOICE_SYNTH: "{activeWord}"]
                    </span>
                  )}
                </div>
              )}

              {isLaughing && (
                <span className="font-syncopate font-bold text-2xl sm:text-4xl text-red-500 tracking-[0.25em] uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-bounce">
                  MWAHAHAHAHAHA!
                </span>
              )}

              {introPhase === 'devil_emerges' && (
                <span className="font-space text-xs text-zinc-500 uppercase tracking-[0.3em] animate-pulse">
                  [INITIALIZING 2D CYBER DAEMON...]
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CYBER SIPHON WIRES (Sucking info across the middle!)  */}
      {/* ======================================================== */}
      <CyberSiphonWires isActive={isSiphoning && !isIntroActive} />

      {/* ======================================================== */}
      {/* 3. LEFT KALI LINUX TERMINAL SIDEBAR                      */}
      {/* ======================================================== */}
      <aside
        className={`relative z-40 h-screen transition-all duration-500 ease-in-out shrink-0 border-r border-zinc-800 bg-[#07080a] flex flex-col ${
          isSidebarOpen ? 'w-[340px] md:w-[380px]' : 'w-[56px]'
        }`}
      >
        {isSidebarOpen ? (
          <>
            {/* Sidebar Top: Agent Avatar / Daemon Switcher */}
            <div className="p-3 bg-[#090b0e] border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {avatarMode === 'agent' ? (
                  <div
                    className="cursor-pointer group relative"
                    onClick={() => setIsAgentModalOpen(true)}
                    title="Click to open AI Agent Studio"
                  >
                    <AgentAvatar
                      status={agentStatus}
                      size="sm"
                      showHudRing={true}
                      showScanline={true}
                    />
                  </div>
                ) : (
                  <div
                    className="cursor-pointer group relative"
                    onClick={() => triggerEvilLaugh(5)}
                    title="Click devil to trigger evil cackle"
                  >
                    <TribalDevilEmblem
                      size={62}
                      isLaughing={isLaughing}
                      isSpeaking={isSpeaking}
                      glow="sidebar"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                  </div>
                )}

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-syncopate text-[11px] font-bold tracking-wider text-white uppercase">
                      {avatarMode === 'agent' ? 'AI AGENT' : 'DAEMON'}
                    </span>
                    <button
                      onClick={() => setAvatarMode(avatarMode === 'agent' ? 'daemon' : 'agent')}
                      className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-[9px] text-cyan-400 font-mono hover:bg-cyan-900 cursor-pointer"
                      title="Toggle between Daemon and AI Agent Avatar"
                    >
                      {avatarMode === 'agent' ? 'DAEMON' : 'AGENT'}
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {avatarMode === 'agent'
                      ? `STATUS: ${agentStatus.toUpperCase().replace('_', ' ')}`
                      : isSiphoning
                      ? 'SUCKING DATA FROM PAGE'
                      : isLaughing
                      ? 'MWAHAHAHA (LAUGHING)'
                      : isSpeaking
                      ? 'TRANSMITTING'
                      : 'ONLINE // WIRES READY'}
                  </span>
                </div>
              </div>

              {/* Sidebar Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsAgentModalOpen(true)}
                  className="p-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
                  title="Open AI Agent Avatar Studio"
                >
                  <Bot className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Interactive Kali Linux Terminal */}
            <KaliTerminal
              onTriggerLaugh={() => triggerEvilLaugh(6)}
              onSpeakHacker={(text) => triggerHackerSpeech(text || "I'm a hacker")}
              onReplayIntro={runIntroSequence}
              isSiphoning={isSiphoning}
              onToggleSiphon={handleToggleSiphon}
            />
          </>
        ) : (
          /* Collapsed Mini Sidebar */
          <div className="w-full h-full flex flex-col items-center justify-between py-4 bg-[#090b0e]">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-4 h-4 text-emerald-400" />
              </button>

              {avatarMode === 'agent' ? (
                <div
                  className="cursor-pointer"
                  onClick={() => setIsAgentModalOpen(true)}
                  title="Click for AI Agent Studio"
                >
                  <AgentAvatar
                    status={agentStatus}
                    size="sm"
                    showHudRing={false}
                    showScanline={true}
                  />
                </div>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => triggerEvilLaugh(5)}
                  title="Click devil to laugh"
                >
                  <TribalDevilEmblem
                    size={42}
                    isLaughing={isLaughing}
                    isSpeaking={isSpeaking}
                    glow="sidebar"
                  />
                </div>
              )}

              {/* Mini Siphon Toggle Button */}
              <button
                onClick={handleToggleSiphon}
                className={`p-2 rounded transition-colors cursor-pointer ${
                  isSiphoning
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-zinc-900 text-emerald-400 hover:bg-zinc-800'
                }`}
                title="Toggle Cyber Wire Extraction"
              >
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>

            <button
              onClick={runIntroSequence}
              className="p-2 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
              title="Replay intro"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* ======================================================== */}
      {/* 4. RIGHT SIDE: DRIVEN PRECISION ENGINEERING HERO        */}
      {/* ======================================================== */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <DrivenHero
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isSiphoning={isSiphoning}
        />
      </main>

      {/* Floating Quick Agent Studio Launcher */}
      <button
        onClick={() => setIsAgentModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 shadow-xl shadow-cyan-950/50 hover:bg-cyan-900/90 hover:border-cyan-400 text-xs font-mono tracking-wider flex items-center gap-2.5 backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer"
      >
        <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
        <Bot className="w-4 h-4 text-cyan-400" />
        <span className="font-semibold text-white">AI AGENT STUDIO</span>
        <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-[10px] text-cyan-300">
          {agentStatus.toUpperCase().replace('_', ' ')}
        </span>
      </button>

      {/* Interactive Agent Showcase Modal */}
      <AgentShowcaseModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSelectAgentStatus={(st) => setAgentStatus(st)}
      />
    </div>
  );
}
