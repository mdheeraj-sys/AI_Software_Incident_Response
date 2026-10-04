import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileCode2, 
  Terminal, 
  Cpu, 
  BarChart3, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle,
  Activity,
  GitBranch
} from 'lucide-react';

interface LogAnalyzerCardProps {
  initialService?: string;
}

export const LogAnalyzerCard: React.FC<LogAnalyzerCardProps> = ({
  initialService = 'auth'
}) => {
  const [activeService, setActiveService] = useState<string>(initialService);
  const [logs] = useState<any[]>([
    {
      time: '22:28:26.386',
      service: 'auth',
      level: 'WARN',
      template: 'Authentication failed for user <*>',
      ip: '106.192.2.103',
      raw: "Authentication failed for user 'admin' from IP 106.192.2.103: Invalid credentials"
    },
    {
      time: '22:28:50.587',
      service: 'db',
      level: 'ERROR',
      template: 'Database query execution error for query [*]',
      ip: '106.192.2.103',
      raw: "Database query execution error for query [SELECT id, name FROM products WHERE name LIKE '%1' AND SLEEP(3)--%']: no such function: SLEEP"
    },
    {
      time: '22:29:02.171',
      service: 'web',
      level: 'INFO',
      template: 'HTTP GET <*> -> 404',
      ip: '106.192.2.103',
      raw: "HTTP GET /.env HTTP/1.1 from 106.192.2.103 -> 404 Not Found"
    },
    {
      time: '22:31:14.021',
      service: 'auth',
      level: 'INFO',
      template: 'Token verification issued for <*> via TLS',
      ip: '127.0.0.1',
      raw: "Token verification issued for vishnukanchipati.me via TLS 1.3 handshake"
    }
  ]);

  const [clusters] = useState([
    { id: 'E14', template: 'Authentication failed for user <*>', count: 48, anomalyScore: 0.94 },
    { id: 'E09', template: 'Database query execution error for query [*]', count: 6, anomalyScore: 0.88 },
    { id: 'E02', template: 'HTTP GET <*> -> 404', count: 10, anomalyScore: 0.65 },
    { id: 'E01', template: 'Token verification issued for <*>', count: 12, anomalyScore: 0.05 },
  ]);

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-2xl overflow-hidden text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-900/60 via-zinc-900/30 to-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <FileCode2 className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Telemetry & Drain 3.0 Parser
            </h3>
            <p className="text-xs text-zinc-400">Structured log template clustering & statistical anomaly detection</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} /> Tree Depth: 4
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Template Clusters */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
            Top Discovered Log Templates
          </span>
          <div className="space-y-2">
            {clusters.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs">
                <div className="flex items-center gap-2.5 truncate max-w-[70%]">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">{c.id}</span>
                  <span className="font-mono text-zinc-200 truncate">{c.template}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-zinc-400">{c.count} hits</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                    c.anomalyScore > 0.8 
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {c.anomalyScore > 0.8 ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>ANOMALOUS</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>NORMAL</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Raw Tail */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Live Log Ingestion Stream
            </span>
            <span className="font-mono text-[10px] text-zinc-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Auto-tail enabled
            </span>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] space-y-1.5 max-h-36 overflow-y-auto terminal-scroll">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-500 shrink-0">{log.time}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 flex items-center gap-1 ${
                  log.level === 'ERROR' ? 'bg-red-950/80 text-red-300 border border-red-800/60' :
                  log.level === 'WARN' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' :
                  'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {log.level === 'ERROR' && <AlertCircle className="w-2.5 h-2.5 text-red-400" />}
                  {log.level === 'WARN' && <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
                  {log.level === 'INFO' && <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" />}
                  <span>{log.level}</span>
                </span>
                <span className="text-zinc-300 break-all">{log.raw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
