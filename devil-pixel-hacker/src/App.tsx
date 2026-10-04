/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TribalDevilEmblem } from './components/TribalDevilEmblem';
import { HackerVM } from './components/HackerVM';
import { AgentMiddleCanvas } from './components/AgentMiddleCanvas';
import { SoftwareVM } from './components/SoftwareVM';
import { CyberSiphonWires } from './components/CyberSiphonWires';
import { evilAudio } from './audio/evilAudioEngine';
import { Bot, Volume2, VolumeX, Shield, SkipForward, LogIn } from 'lucide-react';
import { AgentStatus } from './components/ui/agent-avatar';
import { AgentShowcaseModal } from './components/AgentShowcaseModal';
import { CollegePortalModal } from './components/CollegePortalModal';
import { 
  dispatchN8nIncidentAlert, 
  getIncidentPayloadForAttack, 
  queryOpenRouterIncidentTriage, 
  executeFirewallBlock,
  fetchRealHackerIp,
  getHackerIp,
  LLMTriageResult 
} from './services/n8nIncidentService';

import { SiraNavbar, SiraViewType } from './components/sira/SiraNavbar';
import { AnimatedAIChat } from './components/ui/animated-ai-chat';
import RuixenMoonChat from './components/ui/ruixen-moon-chat';
import { PentestWizardView } from './components/sira/PentestWizardView';
import { IssuesHubView } from './components/sira/IssuesHubView';
import { AssetsManagementView } from './components/sira/AssetsManagementView';
import { IncidentTimelineLogsView } from './components/sira/IncidentTimelineLogsView';

type IntroPhase =
  | 'idle_black'
  | 'devil_emerges'
  | 'speaking_hacker'
  | 'evil_laugh'
  | 'glitch_transition'
  | 'completed';

export default function App() {
  const [activeView, setActiveView] = useState<SiraViewType>('chat');
  const [chatTheme, setChatTheme] = useState<'moon' | 'stream'>('moon');
  const [activeLogo, setActiveLogo] = useState<string>('/sira-logo-1.jpg');
  const [introPhase, setIntroPhase] = useState<IntroPhase>('completed');
  const [isLaughing, setIsLaughing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeWord, setActiveWord] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSiphoning, setIsSiphoning] = useState<boolean>(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState<boolean>(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState<boolean>(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('monitoring');
  const [isAgentDeployed, setIsAgentDeployed] = useState<boolean>(false);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [llmTriage, setLlmTriage] = useState<LLMTriageResult | null>(null);
  const [currentAttack, setCurrentAttack] = useState<string>('brute');
  const [hackerIp, setHackerIpState] = useState<string>(getHackerIp());

  // Auto-detect real public IP on mount
  useEffect(() => {
    fetchRealHackerIp().then((ip) => {
      setHackerIpState(ip);
    });
  }, []);

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

  // Trigger demonic speech: "Enter as hacker" + laugh
  const triggerHackerSpeech = useCallback(
    (text: string = "Enter as hacker", withLaugh: boolean = true, onEndCallback?: () => void) => {
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

  // Enter as Hacker action
  const handleEnterAsHacker = useCallback(() => {
    if (introPhase === 'speaking_hacker' || introPhase === 'glitch_transition' || introPhase === 'completed') {
      return;
    }
    setIntroPhase('speaking_hacker');

    triggerHackerSpeech("Enter as hacker", true, () => {
      // After speech & laugh completes:
      setIntroPhase('glitch_transition');

      // Glitch transition -> shrinks and docks into 3-pane layout!
      setTimeout(() => {
        setIntroPhase('completed');
      }, 1100);
    });
  }, [introPhase, triggerHackerSpeech]);

  // Master Intro Orchestration Sequence
  const runIntroSequence = useCallback(() => {
    setIntroPhase('idle_black');
    setIsSpeaking(false);
    setIsLaughing(false);
    setIsSiphoning(false);

    // 0.6s: 2D Tribal Devil Emblem appears in center with red/white glow
    setTimeout(() => {
      setIntroPhase('devil_emerges');
    }, 600);
  }, []);

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

  // Trigger defense sentinel with real-time OpenRouter LLM & n8n Webhook
  const triggerAgentDefense = useCallback((attackType: string) => {
    setIsAgentDeployed(true);
    setAgentStatus('threat_detected');

    const payload = getIncidentPayloadForAttack(attackType, hackerIp);

    // 1. Query OpenRouter LLM (qwen/qwen3.8-27b:free)
    queryOpenRouterIncidentTriage(payload).then((triage) => {
      setLlmTriage(triage);
    });

    // 2. Dispatch real-time incident alert to n8n webhook (/webhook/incident-alert -> Telegram @Vishnu130507)
    dispatchN8nIncidentAlert(payload).then((res) => {
      setActiveIncident(res);
    });

    // 3. Shift to mitigating after allowing user to observe threat detection
    setTimeout(() => {
      setAgentStatus('mitigating');
    }, 2500);
  }, [hackerIp]);

  // Deploy Agent Action ("USE AGENT")
  const handleDeployAgent = () => {
    setIsAgentDeployed(true);
    evilAudio.playGlitchBurst();

    // If attack is ALREADY active when "USE AGENT" is clicked, deploy defense & alerts!
    // If NO attack is active yet, Agent enters monitoring standby (NO calls or messages until attack is launched!)
    if (isSiphoning) {
      executeFirewallBlock(hackerIp);
      triggerAgentDefense(currentAttack);
    } else {
      setAgentStatus('monitoring');
    }
  };

  // Toggle cyber siphon wire extraction
  const handleToggleSiphon = (attackType?: string) => {
    const targetAttack = attackType || currentAttack;
    const nextState = !isSiphoning;
    setIsSiphoning(nextState);
    setCurrentAttack(targetAttack);

    if (nextState) {
      evilAudio.playGlitchBurst();
      evilAudio.playDemonicRumble(5.0);

      // ONLY trigger calls and messages if Agent has been deployed ("USE AGENT" clicked)!
      // If NOT yet deployed, Phase 1 commences: wires flow to software directly, zero calls/messages!
      if (isAgentDeployed) {
        executeFirewallBlock(hackerIp);
        triggerAgentDefense(targetAttack);
      } else {
        setAgentStatus('threat_detected');
      }

      setTimeout(() => {
        triggerEvilLaugh(3);
      }, 800);
    } else {
      // Attack stopped
      if (isAgentDeployed) {
        setAgentStatus('mitigating');
        setTimeout(() => {
          setAgentStatus('secured');
        }, 2000);
      }
    }
  };

  const handleSelectAttack = (attackType: string) => {
    setCurrentAttack(attackType);
    // If attack is actively running AND Agent is deployed, adapt defense for the new vector
    if (isSiphoning && isAgentDeployed) {
      executeFirewallBlock(hackerIp);
      triggerAgentDefense(attackType);
    }
  };

  const handleLaunchAttack = (attackType: string) => {
    setCurrentAttack(attackType);
    if (!isSiphoning) {
      handleToggleSiphon(attackType);
    } else if (isAgentDeployed) {
      executeFirewallBlock(hackerIp);
      triggerAgentDefense(attackType);
    }
  };

  // Human-in-the-loop mitigation approval (simulating Telegram Approve button)
  const handleApproveMitigation = () => {
    executeFirewallBlock(hackerIp);
    setIsSiphoning(false);
    setAgentStatus('secured');
  };

  const isIntroActive = introPhase !== 'completed';

  return (
    <div className="relative w-full h-screen bg-[#090b10] text-zinc-100 flex flex-col overflow-hidden font-inter select-none">
      {/* SIRA Global Navigation Bar */}
      <SiraNavbar
        currentView={activeView}
        onViewChange={(v) => setActiveView(v)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        activeIncidentsCount={activeIncident ? 1 : 0}
        activeLogo={activeLogo}
        onSelectLogo={setActiveLogo}
      />

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* VIEW 1: SIRA ASSISTANT (RUIXEN MOON CHAT & STREAM CHAT)  */}
      {/* ======================================================== */}
      {activeView === 'chat' && (
        <div className="relative flex-1 w-full h-[calc(100vh-61px)] flex overflow-hidden">
          {/* Subtle Theme Toggle in Top Right */}
          <div className="absolute top-3 right-4 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-mono">
            <span className="text-zinc-400">Theme:</span>
            <button
              onClick={() => setChatTheme('moon')}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                chatTheme === 'moon' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Moon Chat
            </button>
            <button
              onClick={() => setChatTheme('stream')}
              className={`px-2 py-0.5 rounded-full transition-colors ${
                chatTheme === 'stream' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              SOC Stream
            </button>
          </div>

          {chatTheme === 'moon' ? (
            <div className="w-full h-full overflow-y-auto">
              <RuixenMoonChat
                initialTargetDomain="vishnukanchipati.me"
                onNavigateView={(v) => setActiveView(v as SiraViewType)}
              />
            </div>
          ) : (
            <AnimatedAIChat
              hackerIp={hackerIp}
              onOpenSoc={() => setActiveView('soc')}
              onOpenTimeline={() => setActiveView('timeline')}
              activeLogo={activeLogo}
              onSelectLogo={setActiveLogo}
            />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: 5-STEP WEB APP PENTEST WIZARD                    */}
      {/* ======================================================== */}
      {activeView === 'pentest' && (
        <div className="relative flex-1 w-full h-[calc(100vh-61px)] flex overflow-hidden">
          <PentestWizardView
            initialTarget="https://vishnukanchipati.me"
            onBackToChat={() => setActiveView('chat')}
            onLaunchSuccess={() => setActiveView('issues')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 3: VULNERABILITY MANAGEMENT (ISSUES HUB)            */}
      {/* ======================================================== */}
      {activeView === 'issues' && (
        <div className="relative flex-1 w-full h-[calc(100vh-61px)] flex overflow-hidden">
          <IssuesHubView
            onBackToChat={() => setActiveView('chat')}
            onOpenTargetDomain={() => setActiveView('assets')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: ASSET & ATTACK SURFACE MANAGEMENT (DOMAINS/REPOS)*/}
      {/* ======================================================== */}
      {activeView === 'assets' && (
        <div className="relative flex-1 w-full h-[calc(100vh-61px)] flex overflow-hidden">
          <AssetsManagementView
            onBackToChat={() => setActiveView('chat')}
            onLaunchPentest={(t) => setActiveView('pentest')}
            onViewIssues={() => setActiveView('issues')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW: INCIDENT TIMELINE & PLAIN-ENGLISH LOGS             */}
      {/* ======================================================== */}
      {activeView === 'timeline' && (
        <div className="relative flex-1 w-full h-[calc(100vh-61px)] flex overflow-hidden">
          <IncidentTimelineLogsView
            onOpenSoc={() => setActiveView('soc')}
            onOpenAssistant={() => setActiveView('chat')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: DUAL-CLOUD SOC TELEMETRY & ATTACK BATTLEGROUND   */}
      {/* ======================================================== */}
      {activeView === 'soc' && (
        <div className="relative flex-1 w-full h-[calc(100vh-61px)] flex overflow-hidden">
          {/* 1. INTRO CINEMATIC OVERLAY (2D Tribal Devil Blend) */}
          {isIntroActive && (
            <div
              id="intro-overlay"
              className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${
                introPhase === 'glitch_transition' ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {/* Subtle Ambient Radial Lighting */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black pointer-events-none" />

              {/* Skip Intro Button */}
              <button
                onClick={handleSkipIntro}
                className="absolute top-6 right-8 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-space tracking-widest uppercase transition-colors cursor-pointer text-white/80 hover:text-white z-50"
              >
                <span>Skip Intro</span>
                <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
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
                  onClick={() => {
                    if (introPhase === 'devil_emerges') {
                      handleEnterAsHacker();
                    } else {
                      triggerEvilLaugh(6);
                    }
                  }}
                />

                <div className="mt-8 min-h-[90px] flex items-center justify-center text-center">
                  {introPhase === 'devil_emerges' && (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={handleEnterAsHacker}
                        className="group relative px-8 py-3.5 rounded-xl bg-black/85 hover:bg-red-950/50 border-2 border-red-500/70 hover:border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.45)] hover:shadow-[0_0_45px_rgba(239,68,68,0.85)] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer flex flex-col items-center gap-1.5 backdrop-blur-md"
                      >
                        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-red-400" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-red-400" />
                        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-red-400" />
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-red-400" />

                        <div className="flex items-center gap-2">
                          <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-red-300" aria-hidden="true" />
                          <span className="font-syncopate font-bold text-xl sm:text-3xl text-white tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] group-hover:text-red-200 transition-colors">
                            &gt; ENTER AS HACKER
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-red-400/90 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                          <span>[ INITIALIZE AS HACKER ]</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {introPhase === 'speaking_hacker' && (
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-syncopate font-bold text-2xl sm:text-4xl text-white tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-pulse">
                        &gt; ENTER AS HACKER
                      </span>
                      {activeWord ? (
                        <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest">
                          [VOICE_SYNTH: "{activeWord}"]
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-red-400 uppercase tracking-widest animate-pulse">
                          [INITIALIZING AS HACKER...]
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. CYBER SIPHON WIRES */}
          <CyberSiphonWires
            isActive={isSiphoning && !isIntroActive}
            interceptAtAgent={isAgentDeployed}
            onDeployAgent={handleDeployAgent}
          />

          {/* 3. THREE-PANE BATTLEGROUND ARCHITECTURE (WHITE CANVAS) */}
          <div className="relative z-20 w-full h-full flex flex-row items-stretch justify-between overflow-hidden bg-white">
            {/* PANE 1 (LEFT): HACKER VM (VM-A: Attacker) */}
            <aside className="w-[340px] md:w-[380px] shrink-0 h-full">
              <HackerVM
                hackerIp={hackerIp}
                isSiphoning={isSiphoning}
                onToggleSiphon={handleToggleSiphon}
                onSpeakHacker={(text) => triggerHackerSpeech(text || "Enter as hacker")}
                onTriggerLaugh={() => triggerEvilLaugh(6)}
                onReplayIntro={runIntroSequence}
                onSelectAttack={handleSelectAttack}
                onLaunchAttack={handleLaunchAttack}
              />
            </aside>

            {/* PANE 2 (MIDDLE): WHITE CANVAS WITH INTERACTABLE AI AGENT */}
            <main className="flex-1 min-w-0 h-full bg-white">
              <AgentMiddleCanvas
                agentStatus={agentStatus}
                onSelectAgentStatus={(st) => setAgentStatus(st)}
                isSiphoning={isSiphoning}
                onOpenStudio={() => setIsAgentModalOpen(true)}
                showAvatar={isAgentDeployed}
                activeIncident={activeIncident}
                llmTriage={llmTriage}
                onApproveMitigation={handleApproveMitigation}
                onDeployAgent={handleDeployAgent}
                hackerIp={hackerIp}
              />
            </main>

            {/* PANE 3 (RIGHT): THE SOFTWARE (VM-B: Protected Application) */}
            <aside className="w-[360px] md:w-[410px] shrink-0 h-full">
              <SoftwareVM
                hackerIp={hackerIp}
                isSiphoning={isSiphoning && !isAgentDeployed}
                isBlocked={agentStatus === 'secured' || (isSiphoning && isAgentDeployed)}
                onViewSoftwareCompletely={() => setIsPortalModalOpen(true)}
              />
            </aside>
          </div>

          {/* Floating Audio Mute / USE AGENT / Agent Studio Controls */}
          <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
            <button
              onClick={handleDeployAgent}
              className={`px-3.5 py-2 rounded-full border text-[11px] font-mono tracking-wider flex items-center gap-2 backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer font-bold shadow-md ${
                isAgentDeployed
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-2 ring-cyan-200'
                  : 'bg-white hover:bg-zinc-50 border-cyan-400 text-cyan-900 animate-pulse'
              }`}
              title={isAgentDeployed ? 'AI Agent Deployed' : 'Deploy AI Agent to Intercept Attack'}
            >
              <Shield className="w-3.5 h-3.5 text-cyan-600" />
              <span>{isAgentDeployed ? 'AGENT ACTIVE' : 'USE AGENT'}</span>
            </button>

            <button
              onClick={() => setIsAgentModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-white/95 hover:bg-zinc-50 border border-zinc-300 text-zinc-800 shadow-md hover:border-zinc-400 text-[11px] font-mono tracking-wider flex items-center gap-2 backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-pointer font-bold"
            >
              <Bot className="w-3.5 h-3.5 text-zinc-600" />
              <span>STUDIO</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Agent Showcase Modal */}
      <AgentShowcaseModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onSelectAgentStatus={(st) => setAgentStatus(st)}
      />

      {/* College Portal Full Software Modal */}
      <CollegePortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        isUnderAttack={isSiphoning}
      />
    </div>
  );
}
