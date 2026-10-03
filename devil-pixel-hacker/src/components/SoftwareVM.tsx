/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Server, 
  Activity, 
  Database, 
  CheckCircle2, 
  ExternalLink, 
  GraduationCap, 
  Globe, 
  Users, 
  CreditCard, 
  Cloud, 
  Cpu, 
  Lock,
  Wifi,
  Layers
} from 'lucide-react';
import { TelemetrySparklines } from './TelemetrySparklines';

interface SoftwareVMProps {
  isSiphoning: boolean;
  isBlocked?: boolean;
  onViewSoftwareCompletely: () => void;
  hackerIp?: string;
}

export const SoftwareVM: React.FC<SoftwareVMProps> = ({
  isSiphoning,
  isBlocked = false,
  onViewSoftwareCompletely,
  hackerIp = '119.235.52.196',
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-slate-50/70 border-l border-zinc-200 font-mono text-[11px] overflow-y-auto select-none">
      {/* 1. Software VM Window Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {/* Window control dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/90 inline-block" />
          </div>
          <div className="flex flex-col ml-1">
            <span className="text-zinc-900 font-bold text-[11px] tracking-wide flex items-center gap-1.5 font-space">
              <GraduationCap className="w-4 h-4 text-cyan-600" />
              SOFTWARE VM // COLLEGE PORTAL
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">Gokul Global University · 10.10.10.12:8000</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded text-[9px] font-semibold tracking-wider uppercase border transition-colors ${
              isSiphoning
                ? 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse shadow-sm'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
            }`}
          >
            {isSiphoning ? 'UNDER ATTACK' : 'PORTAL ONLINE'}
          </span>
        </div>
      </div>

      {/* 2. Main Software Stage & Telemetry HUD */}
      <div className="flex-1 p-3.5 space-y-3">
        {/* Prominent Action Button: View Software Completely (Requested Feature!) */}
        <button
          type="button"
          onClick={onViewSoftwareCompletely}
          className="w-full py-2.5 px-3.5 rounded-lg bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-bold text-[11px] font-space tracking-wider uppercase flex items-center justify-between shadow-md shadow-cyan-500/20 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          title="Open complete interactive live college website mockup"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span>VIEW SOFTWARE COMPLETELY</span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs flex items-center gap-1 font-mono">
            LIVE MOCKUP <ExternalLink className="w-3 h-3" />
          </span>
        </button>

        {/* Real-Time Telemetry HUD Card (id="telemetry-hud-card" so wires connect here) */}
        <div
          id="telemetry-hud-card"
          className={`relative p-3.5 bg-white border rounded-sm transition-all duration-300 ${
            isSiphoning
              ? 'border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-200'
              : 'border-zinc-200/90 shadow-sm'
          }`}
        >
          {/* Technical Corner Brackets */}
          <span className="absolute -top-1 -left-1 text-zinc-400 font-mono text-xs select-none">┌</span>
          <span className="absolute -top-1 -right-1 text-zinc-400 font-mono text-xs select-none">┐</span>
          <span className="absolute -bottom-1 -left-1 text-zinc-400 font-mono text-xs select-none">└</span>
          <span className="absolute -bottom-1 -right-1 text-zinc-400 font-mono text-xs select-none">┘</span>

          {/* Telemetry Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSiphoning ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isSiphoning ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="font-space text-xs tracking-wider font-semibold text-zinc-900 uppercase">
                {isSiphoning ? 'BREACH ATTEMPT DETECTED' : 'LIVE PORTAL TELEMETRY'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-500 font-medium">v4.8.2</span>
          </div>

          {/* Dynamic Recharts Sparklines (Throughput + Latency) */}
          <TelemetrySparklines isSiphoning={isSiphoning} />

          {/* Live Quick KPI Stream */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-zinc-100 text-[10px]">
            <div className="flex items-center gap-1.5 text-zinc-600">
              <Users className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>Active Students:</span>
              <span className="font-bold text-zinc-900 ml-auto">1,420</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>HTTP 200 Ratio:</span>
              <span className={`font-bold ml-auto ${isSiphoning ? 'text-rose-600' : 'text-emerald-700'}`}>
                {isSiphoning ? '72.4%' : '99.8%'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Real Backend Infrastructure & Microservices (Database, Hosting, API) */}
        <div className="p-3.5 bg-white border border-zinc-200/90 rounded-sm space-y-2 shadow-sm">
          <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-space">
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              BACKEND INFRASTRUCTURE
            </span>
            <span className="text-emerald-700 font-semibold font-mono">100% ONLINE</span>
          </div>

          <div className="space-y-1.5 text-[10px]">
            {/* Hosting & Ingress */}
            <div className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200/80">
              <span className="text-zinc-800 flex items-center gap-2 font-medium">
                <Cloud className="w-3.5 h-3.5 text-cyan-600" />
                Cloud Hosting / FastAPI (:8000)
              </span>
              <span className="text-emerald-700 font-semibold">200 OK</span>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200/80">
              <span className="text-zinc-800 flex items-center gap-2 font-medium">
                <Database className="w-3.5 h-3.5 text-purple-600" />
                PostgreSQL / Student DB (4,820 rec)
              </span>
              <span className="text-emerald-700 font-semibold">2.1ms</span>
            </div>

            {/* Fees & Admissions Engine */}
            <div className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200/80">
              <span className="text-zinc-800 flex items-center gap-2 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Fee Ledgers & Admission Engine
              </span>
              <span className="text-emerald-700 font-semibold">SYNCED</span>
            </div>

            {/* Firewall & Drain Parser */}
            <div className="flex items-center justify-between p-2 rounded bg-zinc-50 border border-zinc-200/80">
              <span className="text-zinc-800 flex items-center gap-2 font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                Drain 3.0 Telemetry Firewall
              </span>
              <span className={isSiphoning ? 'text-amber-700 font-semibold' : 'text-zinc-600'}>
                {isSiphoning ? 'DROPPING ATTACK PACKETS' : 'ALLOW-LIST ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Active Defense Shield Status */}
        <div
          className={`p-3 rounded-sm border transition-all duration-300 shadow-2xs ${
            isSiphoning
              ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-sm'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isSiphoning ? (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>
              {isSiphoning
                ? `DEFENSE SHIELD ENGAGED // QUARANTINING ${hackerIp}`
                : 'AUTONOMOUS SENTINEL GUARD ACTIVE'}
            </span>
          </div>
          <p className="mt-1 text-[9px] text-zinc-600 leading-normal">
            {isSiphoning
              ? 'AI Agent has correlated attack anomaly and verified zero student data leak from Admissions/Fee database.'
              : 'All college portal telemetry and auth requests parsed in real time via Drain 3.0 tree parser.'}
          </p>
        </div>

        {/* 5. External SOC Command Center Dashboard Link */}
        <a
          href="http://127.0.0.1:9000/dashboard"
          target="_blank"
          rel="noreferrer"
          className="w-full py-2 px-3 rounded bg-zinc-900 hover:bg-black text-white flex items-center justify-center gap-2 text-[10px] tracking-wider uppercase transition-colors cursor-pointer shadow-xs font-medium"
        >
          <span>Open Full SOC Command Center (:9000)</span>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
        </a>
      </div>

      {/* 6. Footer Telemetry Info */}
      <div className="p-2.5 bg-white border-t border-zinc-200 flex items-center justify-between text-[9px] text-zinc-500">
        <span>ENCRYPTED CAMPUS SUBNET 10.10.10.0/24</span>
        <span className="text-emerald-700 font-semibold">PORTAL HEALTHY</span>
      </div>
    </div>
  );
};
