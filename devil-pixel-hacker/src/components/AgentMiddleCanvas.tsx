/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import AgentAvatar, { AgentStatus } from './ui/agent-avatar';
import { 
  Shield, 
  Terminal, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  Activity, 
  Sliders, 
  Sparkles,
  Bot,
  SlidersHorizontal,
} from 'lucide-react';

interface AgentMiddleCanvasProps {
  agentStatus: AgentStatus;
  onSelectAgentStatus?: (status: AgentStatus) => void;
  isSiphoning: boolean;
  onOpenStudio: () => void;
  onMitigate?: () => void;
  showAvatar?: boolean;
  activeIncident?: any;
  llmTriage?: any;
  onApproveMitigation?: () => void;
  onDeployAgent?: () => void;
  hackerIp?: string;
}

export const AgentMiddleCanvas: React.FC<AgentMiddleCanvasProps> = ({
  agentStatus,
  onSelectAgentStatus,
  isSiphoning,
  onOpenStudio,
  onMitigate,
  showAvatar = false,
  activeIncident,
  llmTriage,
  onApproveMitigation,
  onDeployAgent,
  hackerIp = '119.235.52.196',
}) => {
  const STATUS_DETAILS: Record<
    AgentStatus,
    { label: string; sub: string; color: string; ringColor: string; bgBadge: string; dotColor: string }
  > = {
    monitoring: {
      label: 'SYS // PASSIVE MONITORING',
      sub: 'Drain 3.0 Tree Log Parser & EWMA Baseline Active',
      color: 'text-cyan-800',
      ringColor: 'rgba(6, 182, 212, 0.12)',
      bgBadge: 'bg-cyan-50 border-cyan-300 text-cyan-800',
      dotColor: 'bg-cyan-500',
    },
    investigating: {
      label: 'AI // BOUNDED FORENSIC INVESTIGATION',
      sub: '5 Bounded Tools Active · Correlating Temporal Windows',
      color: 'text-amber-800',
      ringColor: 'rgba(245, 158, 11, 0.12)',
      bgBadge: 'bg-amber-50 border-amber-300 text-amber-800',
      dotColor: 'bg-amber-500',
    },
    threat_detected: {
      label: 'ALERT // ATTACK SIGNATURE DETECTED',
      sub: 'Hydra Brute Force / SQL Injection Exceeds MAD Threshold',
      color: 'text-rose-800',
      ringColor: 'rgba(244, 63, 94, 0.14)',
      bgBadge: 'bg-rose-50 border-rose-300 text-rose-800',
      dotColor: 'bg-rose-500',
    },
    mitigating: {
      label: 'SENTINEL // HUMAN-IN-THE-LOOP MITIGATION',
      sub: 'Proposing Tiered Firewall Action · Awaiting Human Approval',
      color: 'text-purple-800',
      ringColor: 'rgba(168, 85, 247, 0.12)',
      bgBadge: 'bg-purple-50 border-purple-300 text-purple-800',
      dotColor: 'bg-purple-500',
    },
    secured: {
      label: 'SECURED // AUDIT LOG SHA-256 HASH CHAINED',
      sub: 'Malicious IP Quarantined · System Returned to Nominal',
      color: 'text-emerald-800',
      ringColor: 'rgba(16, 185, 129, 0.12)',
      bgBadge: 'bg-emerald-50 border-emerald-300 text-emerald-800',
      dotColor: 'bg-emerald-500',
    },
  };

  const current = STATUS_DETAILS[agentStatus];

  return (
    <div className="relative flex-1 w-full h-full bg-white text-zinc-900 flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Pure White Canvas (Clean background when avatar is temporarily hidden) */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: isSiphoning
            ? 'radial-gradient(circle at center, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.85) 60%, #ffffff 100%)'
            : showAvatar
            ? `radial-gradient(circle at center, ${current.ringColor} 0%, rgba(255, 255, 255, 0.85) 60%, #ffffff 100%)`
            : '#ffffff',
        }}
      />

      {/* Clean Subtle Technical Grid Lines */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* 2. Top Header Bar (Clean Light Theme) */}
      <div className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-zinc-200/90 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded border border-cyan-400/50 bg-cyan-50 flex items-center justify-center shadow-xs">
            <Shield className="w-4 h-4 text-cyan-600" />
          </div>
          <div>
            <div className="font-space text-xs font-bold tracking-widest text-zinc-900 uppercase flex items-center gap-2">
              <span>AI SOFTWARE INCIDENT RESPONSE AGENT</span>
            </div>
            <div className="font-mono text-[10px] text-zinc-500">
              AUTONOMOUS INCIDENT RESPONSE & FORENSIC INVESTIGATOR
            </div>
          </div>
        </div>

        {/* Live Threat Indicator */}
        <div className="flex items-center gap-2">
          {!showAvatar && onDeployAgent && (
            <button
              onClick={onDeployAgent}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
              title="Deploy AI Agent to Intercept Attack"
            >
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>USE AGENT</span>
            </button>
          )}

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${current.bgBadge} flex items-center gap-1.5 shadow-xs font-medium`}>
            <span className={`size-1.5 rounded-full ${isSiphoning ? 'bg-rose-500 animate-ping' : current.dotColor}`} />
            {agentStatus.toUpperCase().replace('_', ' ')}
          </span>
          <button
            onClick={onOpenStudio}
            className="p-1.5 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer shadow-xs"
            title="Open Full Agent Studio"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Center White Canvas Stage: The Interactable Agent */}
      <div
        id="hero-title-anchor"
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-6"
      >
        {/* Wire Anchor Target: Quantum Cyber Wires converge directly here */}
        <div id="agent-avatar-anchor" className="relative flex flex-col items-center justify-center">
          {showAvatar ? (
            <div 
              className="relative flex flex-col items-center justify-center group cursor-pointer transition-all duration-500 animate-in fade-in zoom-in-90" 
              onClick={onOpenStudio}
              title="Click to open Agent Studio"
            >
              {/* Outer Soft Aura */}
              <div
                className={`absolute -inset-16 rounded-full transition-all duration-700 pointer-events-none ${
                  isSiphoning
                    ? 'bg-cyan-400/25 blur-3xl animate-pulse ring-4 ring-cyan-400/30'
                    : 'bg-cyan-400/15 blur-2xl'
                }`}
              />

              {/* Forcefield Shield Boundary when Intercepting */}
              {isSiphoning && (
                <div className="absolute -inset-6 rounded-full border-2 border-cyan-400/80 border-dashed animate-[spin_10s_linear_infinite] pointer-events-none shadow-[0_0_25px_rgba(6,182,212,0.4)]" />
              )}

              {/* The Hero Agent Avatar Component */}
              <AgentAvatar
                status={agentStatus}
                size="2xl"
                showHudRing={true}
                showScanline={true}
                blinking={true}
                pulseGlow={true}
                interactive={true}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm animate-in fade-in duration-500">
              {isSiphoning ? (
                <div className="p-5 rounded-2xl border-2 border-red-300 bg-red-50/90 shadow-lg flex flex-col items-center gap-3 backdrop-blur-xs">
                  <AlertTriangle className="w-10 h-10 text-red-600 animate-bounce" />
                  <div className="font-bold text-red-950 text-sm font-space uppercase">
                    ATTACK IN PROGRESS // UNPROTECTED
                  </div>
                  <p className="text-[11px] text-red-800 font-mono leading-relaxed">
                    Siphon wires are breaching College Portal. Click <b>USE AGENT</b> to deploy autonomous incident response sentinel.
                  </p>
                  {onDeployAgent && (
                    <button
                      onClick={onDeployAgent}
                      className="mt-1 px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 animate-pulse"
                    >
                      <Shield className="w-4 h-4" />
                      <span>USE AGENT NOW</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-400">
                  <div className="size-16 rounded-full border border-dashed border-zinc-300 flex items-center justify-center bg-zinc-50">
                    <Shield className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div className="text-[11px] font-mono tracking-wider uppercase text-zinc-600 font-bold">
                    AI AGENT STANDBY
                  </div>
                  <p className="text-[10px] text-zinc-500 max-w-[260px] font-mono leading-relaxed">
                    Click <b>USE AGENT</b> and then launch attacks. The AI sentinel, phone calls, and Telegram alerts will trigger upon threat detection.
                  </p>
                  {onDeployAgent && (
                    <button
                      onClick={onDeployAgent}
                      className="mt-1 px-4 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>USE AGENT</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Threat Interception & n8n Live Workflow Card (Only displayed when Agent is deployed) */}
        {isSiphoning && showAvatar && (
          <div className="mt-6 flex flex-col items-center gap-2 max-w-lg w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Primary Interception Shield Banner */}
            <div className="px-4 py-2 rounded-full border border-cyan-400 bg-cyan-50/90 shadow-sm flex items-center gap-2.5 text-cyan-950 font-mono text-xs backdrop-blur-xs">
              <Shield className="w-4 h-4 text-cyan-600 shrink-0 animate-pulse" />
              <span className="font-bold tracking-wide">
                WIRE FLOW STOPPED AT AGENT SHIELD // ACCESS DENIED TO COLLEGE PORTAL
              </span>
            </div>

            {/* 1. OpenRouter LLM Live Security Intelligence Card */}
            {llmTriage && (
              <div className="w-full p-3 rounded-lg border border-cyan-200 bg-cyan-50/70 shadow-xs font-mono text-[10px] space-y-1.5 backdrop-blur-xs">
                <div className="flex items-center justify-between border-b border-cyan-200/80 pb-1">
                  <span className="text-cyan-900 flex items-center gap-1.5 font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600 animate-spin" />
                    OpenRouter AI Forensic Triage ({llmTriage.modelUsed || 'Qwen 3.8 27B'})
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-900 font-bold text-[9px]">
                    CONFIDENCE: {((llmTriage.confidence || 0.98) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="text-zinc-800 text-[10px]">
                  <span className="font-bold text-cyan-950">RCA: </span>
                  {llmTriage.rootCause}
                </div>

                {llmTriage.evidence && llmTriage.evidence.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {llmTriage.evidence.map((ev: string, idx: number) => (
                      <span key={idx} className="bg-white/80 border border-cyan-200 px-1.5 py-0.2 rounded text-[9px] text-zinc-700">
                        • {ev}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-700 bg-white/70 px-2 py-1 rounded border border-cyan-200/60">
                  <span className="font-semibold text-zinc-600">Offending Attacker IP:</span>
                  <span className="font-bold text-red-700 font-mono">{hackerIp} (Verified Egress)</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-cyan-200/80 text-[10px]">
                  <span className="text-zinc-600 font-medium">Proposed Mitigation:</span>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold uppercase text-[9px]">
                    {llmTriage.recommendedAction || 'BLOCK_IP'}
                  </span>
                </div>
              </div>
            )}

            {/* 2. n8n Live Workflow & Telegram Notification Status */}
            <div className="w-full p-3 rounded-lg border border-zinc-200 bg-white/95 shadow-sm font-mono text-[10px] space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <span className="text-zinc-600 flex items-center gap-1.5 font-bold uppercase">
                  <Activity className="w-3 h-3 text-cyan-600" />
                  n8n Incident Response Agent
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-semibold text-[9px] ${
                    activeIncident?.statusCode === 200
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeIncident?.statusCode === 500
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-cyan-100 text-cyan-800'
                  }`}
                >
                  {activeIncident?.statusCode === 200
                    ? '200 OK // TRIGGERED'
                    : activeIncident?.statusCode === 500
                    ? '500 // N8N HEADER AUTH'
                    : 'ALERT DISPATCHED'}
                </span>
              </div>

              {/* CallMeBot On-Call Voice Call Status */}
              <div className="bg-purple-50/70 border border-purple-200/80 rounded p-1.5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-purple-900 font-bold flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    On-Call Audio Call:
                  </span>
                  <span className="text-purple-800 font-semibold">@Vishnu130507</span>
                </div>
                <div className="text-[9px] text-purple-700 font-mono">
                  {activeIncident?.callMeBotStatus || 'Telegram audio call dispatched via CallMeBot'}
                </div>
              </div>

              {/* n8n Webhook Diagnostic */}
              <div className="text-zinc-600 flex items-center justify-between text-[10px]">
                <span>n8n Webhook URL:</span>
                <code className="text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded text-[9px]">
                  craftsman.app.n8n.cloud/webhook/incident-alert
                </code>
              </div>

              {activeIncident?.statusCode === 500 && (
                <div className="bg-amber-50 border border-amber-200 rounded p-1.5 text-[9px] text-amber-900 leading-tight">
                  <span className="font-bold">⚠️ Note on n8n Cloud: </span>
                  Your n8n Webhook node currently has <span className="font-mono font-bold">Header Auth</span> selected.
                  In n8n, change <b>Authentication</b> to <b>None</b> (or set header credentials) so n8n runs without 500.
                </div>
              )}

              {onApproveMitigation && (
                <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-zinc-100">
                  <span className="text-zinc-500 text-[9px]">Telegram Bot Approval:</span>
                  <button
                    onClick={onApproveMitigation}
                    className="px-3 py-1 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Approve Mitigation (Block {hackerIp})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. Bottom Agent Telemetry Strip (Clean Light Footer) */}
      <div className="relative z-10 w-full px-6 py-3 border-t border-zinc-200 bg-zinc-50/90 flex items-center justify-between text-[11px] font-mono text-zinc-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-800">DRAIN 3.0: 100% ONLINE</span>
          </span>
          <span className="hidden sm:inline text-zinc-300">·</span>
          <span className="hidden sm:inline">EWMA/MAD DETECTOR: ACTIVE</span>
          <span className="hidden md:inline text-zinc-300">·</span>
          <span className="hidden md:inline">SHA-256 AUDIT: HASH-CHAINED</span>
        </div>

        <button
          onClick={onOpenStudio}
          className="text-cyan-700 hover:text-cyan-900 font-semibold underline underline-offset-4 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Agent Studio</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>
    </div>
  );
};
