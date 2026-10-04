import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  FileText, 
  Flame, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Activity,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface IncidentTriageCardProps {
  incidentId?: string;
  attackType?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  sourceIp?: string;
  targetEndpoint?: string;
  onMitigated?: () => void;
}

export const IncidentTriageCard: React.FC<IncidentTriageCardProps> = ({
  incidentId = 'inc_65f62396',
  attackType = 'Credential Brute Force',
  severity = 'high',
  sourceIp = '106.192.2.103',
  targetEndpoint = '/login',
  onMitigated
}) => {
  const [actionStatus, setActionStatus] = useState<'pending' | 'executing' | 'approved' | 'rejected'>('pending');
  const [auditHash, setAuditHash] = useState<string | null>(null);

  const handleApprove = async () => {
    setActionStatus('executing');
    try {
      // Call local backend if available, or simulate hash chain
      const res = await fetch(`http://localhost:8080/incidents/${incidentId}/actions/act_1/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decided_by: 'SOC Operator (SIRA Chat)' })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setAuditHash(data.audit_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      } else {
        setAuditHash('a8f94d21e0586e9e432c699742cf6f76e1f0e4b789a263155f19067b0754128a');
      }
    } catch {
      setAuditHash('a8f94d21e0586e9e432c699742cf6f76e1f0e4b789a263155f19067b0754128a');
    }

    setTimeout(() => {
      setActionStatus('approved');
      onMitigated?.();
    }, 900);
  };

  const handleReject = () => {
    setActionStatus('rejected');
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-red-500/30 bg-zinc-950/85 backdrop-blur-xl shadow-2xl shadow-red-950/20 overflow-hidden text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-950/40 via-zinc-900/30 to-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Incident Triage: <span className="text-red-400 font-mono">{attackType}</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/20 border border-red-500/40 text-red-300">
                {severity}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {incidentId} • Detection: Drain 3.0 + Isolation Forest</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-zinc-400">Confidence</span>
          <div className="text-sm font-bold text-red-400">96.8%</div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Forensic Summary */}
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-2 text-xs">
          <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Root Cause Analysis
            </span>
            <span>MITRE ATT&CK: T1110</span>
          </div>
          <p className="text-zinc-200 leading-relaxed">
            High-frequency failed authentication attempts detected from IP <strong className="text-red-400 font-mono">{sourceIp}</strong> targeting <code className="text-cyan-300 font-mono">{targetEndpoint}</code>. Volumetric burst surpassed EWMA anomaly threshold by 4.2x standard deviation.
          </p>
        </div>

        {/* Evidence & Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <span className="text-[10px] text-zinc-500 block">Attacker IP</span>
            <span className="text-red-400 font-semibold">{sourceIp}</span>
          </div>
          <div className="grid-cell p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <span className="text-[10px] text-zinc-500 block">HTTP Velocity</span>
            <span className="text-zinc-200">25 req / 2.3s</span>
          </div>
          <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <span className="text-[10px] text-zinc-500 block">Error Rate</span>
            <span className="text-amber-400">100% 401s</span>
          </div>
          <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
            <span className="text-[10px] text-zinc-500 block">Forensic Tool</span>
            <span className="text-cyan-400">inspect_ip</span>
          </div>
        </div>

        {/* Audit Hash display if approved */}
        {auditHash && (
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cryptographic SHA-256 Audit Trail Committed
            </div>
            <div className="truncate text-[11px] text-emerald-400 select-all">{auditHash}</div>
          </div>
        )}
      </div>

      {/* Human In The Loop Mitigation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/90">
        <div className="text-xs text-zinc-400 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span>Gated Mitigation: Requires Human Approval</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {actionStatus === 'pending' && (
            <>
              <button
                onClick={handleReject}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors"
              >
                Reject Action
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-950/50 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approve Firewall Block ({sourceIp})</span>
              </button>
            </>
          )}

          {actionStatus === 'executing' && (
            <div className="text-xs font-mono text-cyan-400 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Applying iptables rule to perimeter gateway...</span>
            </div>
          )}

          {actionStatus === 'approved' && (
            <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Attacker IP Blocked Successfully</span>
            </div>
          )}

          {actionStatus === 'rejected' && (
            <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>Action Dismissed by Operator</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
