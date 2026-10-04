import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe2, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  MapPin, 
  Shield, 
  Zap, 
  Server,
  Radio,
  Signal
} from 'lucide-react';

interface NodePropagation {
  location: string;
  region: string;
  popCode: string;
  ip: string;
  resolved: string;
  latencyMs: number;
  status: 'propagated' | 'resolving' | 'pending';
}

interface DnsPropagationCardProps {
  domain?: string;
}

export const DnsPropagationCard: React.FC<DnsPropagationCardProps> = ({
  domain = 'vishnukanchipati.me'
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [nodes, setNodes] = useState<NodePropagation[]>([
    { location: 'Ashburn, VA', region: 'US East', popCode: 'IAD', ip: '185.199.108.153', resolved: '185.199.108.153', latencyMs: 18, status: 'propagated' },
    { location: 'Frankfurt', region: 'EU Central', popCode: 'FRA', ip: '185.199.109.153', resolved: '185.199.109.153', latencyMs: 34, status: 'propagated' },
    { location: 'Singapore', region: 'AP Southeast', popCode: 'SIN', ip: '185.199.110.153', resolved: '185.199.110.153', latencyMs: 62, status: 'propagated' },
    { location: 'Tokyo', region: 'AP Northeast', popCode: 'HND', ip: '185.199.111.153', resolved: '185.199.111.153', latencyMs: 78, status: 'propagated' },
    { location: 'London', region: 'UK South', popCode: 'LHR', ip: '185.199.108.153', resolved: '185.199.108.153', latencyMs: 29, status: 'propagated' },
    { location: 'Sydney', region: 'Oceania', popCode: 'SYD', ip: '185.199.109.153', resolved: '185.199.109.153', latencyMs: 142, status: 'propagated' },
  ]);

  const handleRescan = () => {
    setIsScanning(true);
    setNodes(prev => prev.map(n => ({ ...n, status: 'resolving' })));

    nodes.forEach((_, idx) => {
      setTimeout(() => {
        setNodes(prev => {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            latencyMs: Math.floor(Math.random() * 50) + 15,
            status: 'propagated'
          };
          return updated;
        });
        if (idx === nodes.length - 1) {
          setIsScanning(false);
        }
      }, (idx + 1) * 350);
    });
  };

  const propagatedCount = nodes.filter(n => n.status === 'propagated').length;

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-2xl overflow-hidden text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-900/60 via-zinc-900/30 to-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Global DNS Propagation: <span className="text-cyan-400 font-mono">{domain}</span>
            </h3>
            <p className="text-xs text-zinc-400">Record Type: A & CNAME records propagation status</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {propagatedCount}/{nodes.length} Resolvers
          </span>
        </div>
      </div>

      {/* Nodes list */}
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-12 text-[11px] font-mono text-zinc-400 px-3 py-1 uppercase tracking-wider">
          <div className="col-span-5">POP Node / Region</div>
          <div className="col-span-4">Resolved Anycast IP</div>
          <div className="col-span-2 text-right">Latency</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {nodes.map((node, i) => (
          <div
            key={i}
            className="grid grid-cols-12 items-center px-3 py-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/80 text-xs transition-colors"
          >
            <div className="col-span-5 flex items-center gap-2.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-cyan-300 border border-zinc-700/80">
                {node.popCode}
              </span>
              <span className="text-zinc-200 font-medium">{node.location}</span>
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">({node.region})</span>
            </div>
            <div className="col-span-4 font-mono text-xs text-cyan-400 truncate">
              {node.status === 'resolving' ? (
                <span className="text-zinc-500 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" /> Querying...
                </span>
              ) : (
                node.resolved
              )}
            </div>
            <div className="col-span-2 text-right font-mono text-[11px] text-zinc-400">
              <span className="text-zinc-300 font-medium">{node.latencyMs}</span>
              <span className="text-zinc-500 ml-0.5">ms</span>
            </div>
            <div className="col-span-1 flex justify-end">
              {node.status === 'propagated' ? (
                <span className="flex h-2 w-2 relative">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-sm shadow-emerald-400/80"></span>
                </span>
              ) : (
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/90 text-xs">
        <span className="text-zinc-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          Synchronized across global Anycast mesh
        </span>
        <button
          onClick={handleRescan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isScanning ? 'Probing Nodes...' : 'Re-probe Global POPs'}</span>
        </button>
      </div>
    </div>
  );
};
