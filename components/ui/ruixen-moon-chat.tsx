"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Terminal,
  Layers,
  Sparkles,
  ArrowUpIcon,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Lock,
  Server,
  RefreshCw,
  GitBranch,
  Key,
  Database,
  Code2,
  Bug,
  Activity,
  Play,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronLeft,
  X,
  FileText
} from "lucide-react";
import { WebsiteAuditInspector } from "@/components/sira/WebsiteAuditInspector";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`; // reset first
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface Message {
  id: string;
  sender: "user" | "sira";
  text: string;
  timestamp: string;
  actionType?: "domain_view" | "pentest_wizard" | "issues_hub" | "agent_graph" | "website_audit" | "info";
  targetDomain?: string;
}

export default function RuixenMoonChat({
  onNavigateView,
  initialTargetDomain = "vishnukanchipati.me",
}: {
  onNavigateView?: (view: string) => void;
  initialTargetDomain?: string;
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showPentestWizard, setShowPentestWizard] = useState(false);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [activeDomain, setActiveDomain] = useState(initialTargetDomain);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 5-Step Pentest Wizard state
  const [pentestStep, setPentestStep] = useState(1);
  const [pentestConfig, setPentestConfig] = useState({
    target: "https://vishnukanchipati.me",
    scope: "*.vishnukanchipati.me, api.vishnukanchipati.me",
    sourceCodeRepo: "github.com/vishnukanchipati/portfolio-core",
    branch: "main",
    whiteBoxEnabled: true,
    authType: "Bearer JWT + OAuth2 Session",
    testAccounts: "admin@vishnukanchipati.me, audit-user@sira.internal",
    contextStack: "React 19, TypeScript, Tailwind CSS, FastAPI, PostgreSQL",
    wafMode: "Bypass Validation & Probe Latency",
    agents: ["Root Coordinator", "Recon Hacker", "Web/API Hacker", "Source Analyzer", "Exploit Validator"]
  });

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSend = (customPrompt?: string) => {
    const textToSend = (customPrompt || message).trim();
    if (!textToSend) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    adjustHeight(true);
    setIsTyping(true);

    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let responseText = "";
      let actionType: Message["actionType"] = "info";
      let targetDomainForAudit = activeDomain;

      if (lower.startsWith("check") || lower.includes("check vishnukanchipati.me") || lower.includes("audit") || lower.includes("database")) {
        const match = lower.match(/(?:check|inspect|audit)\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (match && match[1]) {
          targetDomainForAudit = match[1];
          setActiveDomain(match[1]);
        }
        responseText = `Loading live target **${targetDomainForAudit}** into the SIRA Browser Inspector iframe. Initiating deep-dive security inspection across DNS, DOM, API endpoints, and the PostgreSQL database. Identifying attack surfaces, titles of attack vectors, and automated defensive solutions below:`;
        actionType = "website_audit";
      } else if (lower.includes("vishnukanchipati.me") || lower.includes("domain") || lower.includes("verify")) {
        responseText = `Target domain **${activeDomain}** located. Autonomous reconnaissance, DNS resolution, TLS certificate, and attack surface mapped successfully. You can inspect all findings and telemetry in the deep-dive panel below.`;
        actionType = "domain_view";
        setShowDomainModal(true);
      } else if (lower.includes("pentest") || lower.includes("wizard") || lower.includes("scan")) {
        responseText = `Initiating 5-Step Web App Pentest Wizard for **${activeDomain}**. Step 1 (Targets) ➔ Step 2 (Source Code) ➔ Step 3 (Access) ➔ Step 4 (Context) ➔ Step 5 (Review & Launch). Configure your parameters below:`;
        actionType = "pentest_wizard";
        setShowPentestWizard(true);
      } else if (lower.includes("issue") || lower.includes("vulnerabilit") || lower.includes("cve")) {
        responseText = `Accessing Vulnerability Management Issues Hub. 3 active findings detected for **${activeDomain}** (1 High CVSS 8.8 IDOR, 1 Medium Rate-limit bypass, 1 Informational TLS cipher). Full PoC exploits and automated git patches ready for inspection.`;
        actionType = "issues_hub";
        setShowIssuesModal(true);
      } else if (lower.includes("agent") || lower.includes("architecture") || lower.includes("strix")) {
        responseText = `SIRA Multi-Agent Orchestration Architecture active. Root Orchestrator has deployed 4 specialized subagents: Recon Hacker, Web/API Injection Agent, Source Analysis Agent, and Exploit Validator inside isolated Kali Docker sandbox with Caido proxy integration.`;
        actionType = "agent_graph";
        setShowAgentModal(true);
      } else {
        responseText = `I am SIRA Assistant, your autonomous AI Security Incident Response & Penetration Testing Agent. Type **check vishnukanchipati.me** to load the website into the live iframe and scan the DOM, API, and database for attack vectors and solutions.`;
        actionType = "info";
      }

      const siraMsg: Message = {
        id: `s-${Date.now()}`,
        sender: "sira",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionType,
        targetDomain: targetDomainForAudit,
      };

      setMessages((prev) => [...prev, siraMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center flex flex-col items-center overflow-x-hidden font-sans"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2000&q=80')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark Ambient Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] pointer-events-none" />

      {/* Top Banner / Navigation Bar Header */}
      <header className="relative z-20 w-full max-w-6xl px-4 py-4 flex items-center justify-between border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-base uppercase bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                SIRA Assistant
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40">
                Autonomous Pentest v2.4
              </span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Target: <span className="text-cyan-300 font-mono underline cursor-pointer hover:text-cyan-100" onClick={() => setShowDomainModal(true)}>{activeDomain}</span>
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setShowDomainModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-colors text-cyan-300 hover:text-white"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Target: {activeDomain}</span>
          </button>
        </div>
      </header>

      {/* Main Conversation Stream or Hero Title */}
      <main className="relative z-10 flex-1 w-full max-w-4xl px-4 py-6 flex flex-col justify-between">
        {messages.length === 0 ? (
          /* Centered AI Title */
          <div className="flex-1 w-full flex flex-col items-center justify-center my-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Strix-Class Autonomous Pentesting & Incident Response</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              SIRA Assistant
            </h1>
            <p className="mt-3 text-neutral-300 text-sm sm:text-base max-w-lg mx-auto">
              Autonomous multi-agent penetration testing, attack surface reconnaissance, and verified exploit remediation.
            </p>

            {/* Target Highlight Badge */}
            <div 
              onClick={() => setShowDomainModal(true)}
              className="mt-6 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/60 border border-cyan-500/40 backdrop-blur-md hover:border-cyan-400 hover:bg-cyan-950/40 transition-all cursor-pointer group shadow-xl"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">Monitored Target</div>
                <div className="text-sm font-semibold text-cyan-300 font-mono group-hover:text-cyan-100 flex items-center gap-1.5">
                  {activeDomain}
                  <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                </div>
              </div>
              <span className="ml-2 text-xs font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                RECON READY
              </span>
            </div>
          </div>
        ) : (
          /* Chat Message Stream */
          <div className="flex-1 w-full space-y-4 mb-6 overflow-y-auto max-h-[55vh] pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col gap-1.5 w-full",
                  msg.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                  <span>{msg.sender === "user" ? "Operator" : "SIRA Assistent"}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed backdrop-blur-md shadow-xl",
                    msg.actionType === "website_audit" ? "w-full max-w-4xl" : "max-w-2xl",
                    msg.sender === "user"
                      ? "bg-cyan-600/90 text-white border border-cyan-400/40 rounded-tr-none"
                      : "bg-black/80 text-neutral-100 border border-neutral-700/80 rounded-tl-none"
                  )}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Contextual Interactive Actions inside AI message */}
                  {msg.actionType === "website_audit" && (
                    <div className="mt-4 w-full">
                      <WebsiteAuditInspector targetDomain={msg.targetDomain || activeDomain} />
                    </div>
                  )}

                  {msg.actionType === "domain_view" && (
                    <div className="mt-3 pt-3 border-t border-neutral-700 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDomainModal(true)}
                        className="bg-cyan-950/60 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 text-xs h-8"
                      >
                        <Globe className="w-3.5 h-3.5 mr-1" /> Inspect {activeDomain}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowPentestWizard(true)}
                        className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700 text-xs h-8"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" /> Launch Pentest
                      </Button>
                    </div>
                  )}

                  {msg.actionType === "pentest_wizard" && (
                    <div className="mt-3 pt-3 border-t border-neutral-700 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShowPentestWizard(true)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs h-8"
                      >
                        Open 5-Step Pentest Wizard
                      </Button>
                    </div>
                  )}

                  {msg.actionType === "issues_hub" && (
                    <div className="mt-3 pt-3 border-t border-neutral-700 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShowIssuesModal(true)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs h-8"
                      >
                        <Bug className="w-3.5 h-3.5 mr-1" /> View Issues Hub (3)
                      </Button>
                    </div>
                  )}

                  {msg.actionType === "agent_graph" && (
                    <div className="mt-3 pt-3 border-t border-neutral-700 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => setShowAgentModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-8"
                      >
                        <Layers className="w-3.5 h-3.5 mr-1" /> View Multi-Agent Graph
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono bg-black/60 px-3 py-2 rounded-xl border border-cyan-500/30 w-fit backdrop-blur-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>SIRA Assistant is reasoning across security modules...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Input Box Section */}
        <div className="w-full">
          <div className="relative bg-black/75 backdrop-blur-xl rounded-2xl border border-neutral-700/80 shadow-2xl transition-all focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/40">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustHeight();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask SIRA Assistant to inspect ${activeDomain}, run 5-step pentest, or triage issues...`}
              className={cn(
                "w-full px-4 py-3.5 resize-none border-none",
                "bg-transparent text-white text-sm",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-neutral-400 min-h-[48px]"
              )}
              style={{ overflow: "hidden" }}
            />

            {/* Footer Buttons */}
            <div className="flex items-center justify-between p-3 border-t border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-neutral-300 hover:text-white hover:bg-neutral-800 h-8 w-8"
                  title="Attach Log / Vulnerability Evidence"
                  onClick={() => handleSend("Attach telemetry log for forensic inspection")}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                  Press Enter to send, Shift+Enter for newline
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSend()}
                  disabled={!message.trim()}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all font-medium text-xs h-8",
                    message.trim()
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 hover:scale-105 active:scale-95"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  )}
                >
                  <span>Send</span>
                  <ArrowUpIcon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions (Adapted for Security Architecture) */}
          <div className="flex items-center justify-center flex-wrap gap-2.5 mt-5">
            <QuickAction
              icon={<Globe className="w-3.5 h-3.5 text-cyan-400" />}
              label={`Check ${activeDomain}`}
              onClick={() => {
                handleSend(`check ${activeDomain}`);
              }}
            />
            <QuickAction
              icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              label={`Verify ${activeDomain}`}
              onClick={() => {
                setShowDomainModal(true);
                handleSend(`Inspect attack surface for ${activeDomain}`);
              }}
            />
            <QuickAction
              icon={<Play className="w-3.5 h-3.5 text-emerald-400" />}
              label="5-Step Pentest Wizard"
              onClick={() => {
                setShowPentestWizard(true);
                handleSend("Launch 5-step Web App Pentest Wizard");
              }}
            />
            <QuickAction
              icon={<Bug className="w-3.5 h-3.5 text-rose-400" />}
              label="Vulnerability Issues (3)"
              onClick={() => {
                setShowIssuesModal(true);
                handleSend("Show active vulnerability findings and PoCs");
              }}
            />
            <QuickAction
              icon={<Layers className="w-3.5 h-3.5 text-purple-400" />}
              label="Multi-Agent Orchestration"
              onClick={() => {
                setShowAgentModal(true);
                handleSend("Display Strix-style multi-agent loop");
              }}
            />
            <QuickAction
              icon={<Terminal className="w-3.5 h-3.5 text-amber-400" />}
              label="Kali Sandbox Tooling"
              onClick={() => {
                handleSend("Inspect Kali Docker sandbox tools (Nmap, Nuclei, Caido, Semgrep)");
              }}
            />
            <QuickAction
              icon={<ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
              label="PR Auto-Fix & Retest"
              onClick={() => {
                handleSend("Generate GitHub PR fix for IDOR and retest exploit");
              }}
            />
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 1. DEEP-DIVE MODAL: vishnukanchipati.me FULL VIEW & DATA  */}
      {/* ======================================================== */}
      {showDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white font-mono">
                      {activeDomain}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      LIVE PRODUCTION
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    SIRA Attack Surface & Asset Discovery • Real-Time Telemetry & Verification
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setShowDomainModal(false);
                    setShowPentestWizard(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Pentest This Target
                </Button>
                <button
                  onClick={() => setShowDomainModal(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Primary DNS</div>
                  <div className="text-sm font-semibold text-white mt-1">104.21.48.12</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Cloudflare Anycast</div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">TLS / SSL</div>
                  <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> TLS 1.3 Active
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Valid for 89 days</div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">Open Ports</div>
                  <div className="text-sm font-semibold text-cyan-300 mt-1 font-mono">80, 443, 8000</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">SSH (22) Filtered</div>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">SIRA Posture</div>
                  <div className="text-sm font-semibold text-amber-400 mt-1">Grade B+ (84/100)</div>
                  <div className="text-[10px] text-amber-300 mt-0.5">1 PoC Exploitable</div>
                </div>
              </div>

              {/* DNS & Verification Tokens */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" /> DNS Records & Cryptographic Verification
                  </h3>
                  <span className="text-[11px] text-emerald-400 font-mono">TXT Verified ✅</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded bg-black/60 border border-zinc-800">
                    <span className="text-neutral-400">TXT Name: _sira-verification.{activeDomain}</span>
                    <button
                      onClick={() => copyToClipboard(`_sira-verification.${activeDomain}`, "txt-name")}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === "txt-name" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-black/60 border border-zinc-800">
                    <span className="text-cyan-300">Value: sira-verify-8f2a9e3d1b74c0e6</span>
                    <button
                      onClick={() => copyToClipboard("sira-verify-8f2a9e3d1b74c0e6", "txt-val")}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === "txt-val" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Subdomains & Attack Surface Map */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  Discovered Subdomains & Endpoints
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">api.{activeDomain}</div>
                      <div className="text-[10px] text-neutral-400">FastAPI backend (:8000)</div>
                    </div>
                    <span className="text-[10px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">
                      IDOR FOUND
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">app.{activeDomain}</div>
                      <div className="text-[10px] text-neutral-400">React Client Dashboard</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      CLEAN
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">admin.{activeDomain}</div>
                      <div className="text-[10px] text-neutral-400">Internal Auth Portal</div>
                    </div>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      AUTH WALL
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Multi-Agent Log for this domain */}
              <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-neutral-400 border-b border-zinc-800/80 pb-2">
                  <span className="text-cyan-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Autonomous Pentesting Log
                  </span>
                  <span>Agent Graph: ACTIVE</span>
                </div>
                <div className="text-neutral-300 space-y-1 text-[11px] leading-relaxed">
                  <p className="text-neutral-500">[05:42:10] RootAgent -&gt; Spawned ReconAgent on https://{activeDomain}</p>
                  <p className="text-neutral-400">[05:42:15] ReconAgent -&gt; Identified HTTP/2, TLS 1.3, React 19 frontend</p>
                  <p className="text-neutral-400">[05:42:22] WebApiAgent -&gt; Discovered endpoint /api/v1/users/{'{id}'}</p>
                  <p className="text-rose-400">[05:42:30] WebApiAgent -&gt; EXPLOIT PROVEN: GET /api/v1/users/102 returned unauthorized user data (IDOR)</p>
                  <p className="text-emerald-400">[05:42:35] FixAgent -&gt; Generated git patch for FastAPI role-check dependency</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono">
                Asset ID: <span className="text-cyan-400">ast_vishnu_77a9</span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDomainModal(false)}
                  className="border-zinc-700 text-neutral-300 text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowDomainModal(false);
                    setShowIssuesModal(true);
                  }}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
                >
                  Inspect Findings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. 5-STEP WEB APP PENTEST WIZARD MODAL                    */}
      {/* ======================================================== */}
      {showPentestWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <Play className="w-4 h-4 text-cyan-400" /> Launch New Web App Pentest
                </h2>
                <p className="text-xs text-neutral-400">
                  Configure autonomous multi-agent security assessment
                </p>
              </div>
              <button
                onClick={() => setShowPentestWizard(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wizard Steps Indicator */}
            <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between text-xs font-mono">
              {[
                { num: 1, label: "Targets" },
                { num: 2, label: "Source Code" },
                { num: 3, label: "Access" },
                { num: 4, label: "Context" },
                { num: 5, label: "Review & Launch" },
              ].map((step) => (
                <div
                  key={step.num}
                  onClick={() => setPentestStep(step.num)}
                  className={cn(
                    "flex items-center gap-1.5 cursor-pointer transition-colors",
                    pentestStep === step.num
                      ? "text-cyan-400 font-bold"
                      : pentestStep > step.num
                      ? "text-emerald-400"
                      : "text-neutral-500"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] border",
                      pentestStep === step.num
                        ? "border-cyan-400 bg-cyan-950 text-cyan-300"
                        : pentestStep > step.num
                        ? "border-emerald-400 bg-emerald-950 text-emerald-300"
                        : "border-neutral-700 bg-neutral-900 text-neutral-500"
                    )}
                  >
                    {step.num}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {pentestStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 1: Define Assessment Targets</h3>
                  <p className="text-xs text-neutral-400">Specify host URLs, API gateways, and out-of-scope boundaries.</p>
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1">Target Primary URL</label>
                    <input
                      type="text"
                      value={pentestConfig.target}
                      onChange={(e) => setPentestConfig({ ...pentestConfig, target: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1">In-Scope Subdomains</label>
                    <input
                      type="text"
                      value={pentestConfig.scope}
                      onChange={(e) => setPentestConfig({ ...pentestConfig, scope: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {pentestStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 2: Source Code & White-Box Analysis</h3>
                  <p className="text-xs text-neutral-400">
                    Connect GitHub repository for AST code analysis, Semgrep rule verification, and suspicious route discovery.
                  </p>
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1">GitHub Repository</label>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-cyan-400" />
                      <input
                        type="text"
                        value={pentestConfig.sourceCodeRepo}
                        onChange={(e) => setPentestConfig({ ...pentestConfig, sourceCodeRepo: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1">Branch</label>
                    <input
                      type="text"
                      value={pentestConfig.branch}
                      onChange={(e) => setPentestConfig({ ...pentestConfig, branch: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {pentestStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 3: Access & Authentication Credentials</h3>
                  <p className="text-xs text-neutral-400">
                    Grant the agent multi-role test accounts to probe for IDOR, Privilege Escalation, and BFLA.
                  </p>
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1">Auth Scheme</label>
                    <input
                      type="text"
                      value={pentestConfig.authType}
                      onChange={(e) => setPentestConfig({ ...pentestConfig, authType: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1">Test Accounts Matrix</label>
                    <input
                      type="text"
                      value={pentestConfig.testAccounts}
                      onChange={(e) => setPentestConfig({ ...pentestConfig, testAccounts: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {pentestStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 4: Application Context & Environment</h3>
                  <p className="text-xs text-neutral-400">
                    Stack details allow specialized agents to load targeted methodology playbooks (Next.js, FastAPI, GraphQL, etc.).
                  </p>
                  <div>
                    <label className="text-xs font-mono text-neutral-300 block mb-1">Detected Frameworks & Databases</label>
                    <input
                      type="text"
                      value={pentestConfig.contextStack}
                      onChange={(e) => setPentestConfig({ ...pentestConfig, contextStack: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-neutral-200 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {pentestStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 5: Review & Launch Autonomous Pentest</h3>
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs font-mono">
                    <div className="text-neutral-400">Target: <span className="text-cyan-300">{pentestConfig.target}</span></div>
                    <div className="text-neutral-400">Repo: <span className="text-neutral-200">{pentestConfig.sourceCodeRepo}</span></div>
                    <div className="text-neutral-400">Auth: <span className="text-neutral-200">{pentestConfig.authType}</span></div>
                    <div className="text-neutral-400">Stack: <span className="text-neutral-200">{pentestConfig.contextStack}</span></div>
                    <div className="text-neutral-400">Agents: <span className="text-emerald-400">5 Specialized Agents Initialized</span></div>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Agents will run inside Kali Linux Docker Sandbox with Caido HTTP proxy & Playwright browser.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={pentestStep === 1}
                onClick={() => setPentestStep((s) => Math.max(1, s - 1))}
                className="border-zinc-700 text-neutral-300 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              {pentestStep < 5 ? (
                <Button
                  size="sm"
                  onClick={() => setPentestStep((s) => Math.min(5, s + 1))}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setShowPentestWizard(false);
                    handleSend(`Launch autonomous pentest run on ${pentestConfig.target}`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Launch Pentest Run
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ISSUES HUB (VULNERABILITY MANAGEMENT) MODAL             */}
      {/* ======================================================== */}
      {showIssuesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <Bug className="w-4 h-4 text-rose-400" /> Vulnerability Management (Issues Hub)
                </h2>
                <p className="text-xs text-neutral-400">
                  Track, prioritize, and auto-remediate validated security findings
                </p>
              </div>
              <button
                onClick={() => setShowIssuesModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Issue 1: High IDOR */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-rose-500/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        CRITICAL • CVSS 8.8
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        Insecure Direct Object Reference (IDOR) on /api/v1/users/{'{id}'}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">
                      Endpoint returns sensitive PII when supplied with non-session user IDs.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    EXPLOIT PROVEN
                  </span>
                </div>

                <div className="p-2.5 rounded bg-black/80 border border-zinc-800 font-mono text-xs text-neutral-300">
                  <div className="text-[10px] text-neutral-500 uppercase">Reproducible Proof of Concept (PoC)</div>
                  <div className="text-rose-300 mt-1">curl -X GET "https://api.{activeDomain}/api/v1/users/102" -H "Authorization: Bearer test_token"</div>
                  <div className="text-emerald-400 mt-0.5">Response: 200 OK {'{ "id": 102, "email": "admin@vishnukanchipati.me", "role": "admin" }'}</div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-neutral-400 font-mono">Location: app/routers/users.py:42</span>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-7"
                    onClick={() => {
                      setShowIssuesModal(false);
                      handleSend("Generate GitHub PR fix for IDOR and retest against API");
                    }}
                  >
                    <GitBranch className="w-3.5 h-3.5 mr-1" /> Create Remediation PR
                  </Button>
                </div>
              </div>

              {/* Issue 2: Medium Rate Limit */}
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-amber-500/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        MEDIUM • CVSS 6.2
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        Missing Rate Limiting on Authentication Endpoint (/auth/login)
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">
                      Target permitted 150 requests in 10 seconds without challenge or backoff.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    RESOLVED VIA FIREWALL
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-mono">2 issues found • 1 pending remediation</span>
              <Button
                size="sm"
                onClick={() => setShowIssuesModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs"
              >
                Close Hub
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MULTI-AGENT GRAPH & STRIX LOOP MODAL                  */}
      {/* ======================================================== */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-100">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <Layers className="w-4 h-4 text-purple-400" /> SIRA Multi-Agent Graph Architecture
                </h2>
                <p className="text-xs text-neutral-400">
                  Root Orchestrator ➔ Specialized Agents ➔ Sandbox Tooling ➔ Fix Retest Loop
                </p>
              </div>
              <button
                onClick={() => setShowAgentModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-3">
                <div className="text-purple-300 font-bold uppercase">Orchestration Graph (Hierarchical Nodes)</div>
                <div className="space-y-1.5 text-neutral-300">
                  <p className="text-cyan-400">● ROOT ORCHESTRATOR [Active] (Objective: Full Pentest of {activeDomain})</p>
                  <p className="pl-4 text-emerald-400">├─ RECON AGENT (Subfinder, Naabu, httpx, Katana)</p>
                  <p className="pl-4 text-amber-400">├─ WEB/API AGENT (Playwright Browser, Caido HTTP Proxy, Arjun)</p>
                  <p className="pl-4 text-blue-400">├─ CODE ANALYZER (Semgrep AST, Tree-sitter, Git diffs)</p>
                  <p className="pl-4 text-rose-400">├─ EXPLOIT VALIDATOR (Live PoC Execution, Evidence Builder)</p>
                  <p className="pl-4 text-purple-400">└─ AUTO-FIX AGENT (PR Generation, Exploit Replay & Retest)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <div className="text-white font-semibold">Autonomous Feedback Loop</div>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Target ➔ Hypothesize ➔ Attack in Kali Sandbox ➔ Capture Caido Traffic ➔ Prove Exploit ➔ Generate Patch ➔ Re-run Attack ➔ Verified Resolution.
                </p>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-end">
              <Button
                size="sm"
                onClick={() => setShowAgentModal(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs"
              >
                Close Graph
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-neutral-700/80 bg-black/60 text-neutral-200 hover:text-white hover:bg-neutral-800 hover:border-cyan-500/50 backdrop-blur-md shadow-lg transition-all h-8 px-3.5 text-xs"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
