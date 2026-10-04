import React, { useState } from 'react';
import { 
  Globe, 
  GitBranch, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Search, 
  Plus, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Play,
  Bug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DomainDeepDiveView } from './DomainDeepDiveView';

interface AssetsManagementViewProps {
  onLaunchPentest?: (target: string) => void;
  onViewIssues?: () => void;
  onBackToChat?: () => void;
}

export const AssetsManagementView: React.FC<AssetsManagementViewProps> = ({
  onLaunchPentest,
  onViewIssues,
  onBackToChat
}) => {
  const [activeTab, setActiveTab] = useState<'domains' | 'repos'>('domains');
  const [selectedDomain, setSelectedDomain] = useState<string | null>('vishnukanchipati.me');
  const [searchQuery, setSearchQuery] = useState('');

  const domains = [
    {
      name: 'vishnukanchipati.me',
      type: 'Apex Domain',
      status: 'Active',
      ssl: 'TLS 1.3 Active',
      subdomains: 4,
      issues: 1,
      lastScanned: '2 mins ago',
      ip: '104.21.48.12',
      grade: 'B+'
    },
    {
      name: 'api.vishnukanchipati.me',
      type: 'Subdomain / API Gateway',
      status: 'Active',
      ssl: 'TLS 1.3 Active',
      subdomains: 0,
      issues: 1,
      lastScanned: '2 mins ago',
      ip: '104.21.48.12:8000',
      grade: 'C'
    },
    {
      name: 'app.vishnukanchipati.me',
      type: 'React Client',
      status: 'Active',
      ssl: 'TLS 1.3 Active',
      subdomains: 0,
      issues: 0,
      lastScanned: '10 mins ago',
      ip: '172.67.182.91',
      grade: 'A'
    }
  ];

  const repos = [
    {
      name: 'vishnukanchipati/portfolio-core',
      branch: 'main',
      commits: '142',
      language: 'TypeScript / React',
      sastStatus: 'Passed with 1 Advisory',
      visibility: 'Public'
    },
    {
      name: 'vishnukanchipati/sira-backend-api',
      branch: 'main',
      commits: '89',
      language: 'Python / FastAPI',
      sastStatus: 'Semgrep IDOR Rule Flagged',
      visibility: 'Private'
    }
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#080a0f] text-zinc-100 p-4 lg:p-8 overflow-y-auto font-sans select-none">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ASSET & ATTACK SURFACE MANAGEMENT
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">Domains & Repositories</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Attack Surface Inventory
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any target like <strong className="text-cyan-300 font-mono">vishnukanchipati.me</strong> to open comprehensive deep-dive telemetry, DNS resolution, and security posture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToChat}
                className="border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white text-xs"
              >
                Back to SIRA Assistant
              </Button>
            )}
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 w-fit">
            <button
              onClick={() => setActiveTab('domains')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'domains'
                  ? 'bg-zinc-800 text-cyan-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Domains ({domains.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('repos')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'repos'
                  ? 'bg-zinc-800 text-cyan-300 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Repositories ({repos.length})</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* SELECTED DOMAIN DEEP DIVE MODAL / EMBEDDED VIEW */}
        {selectedDomain && (
          <div className="border-2 border-cyan-500/50 rounded-2xl shadow-2xl p-1 bg-gradient-to-b from-cyan-950/20 to-transparent">
            <DomainDeepDiveView
              domain={selectedDomain}
              onLaunchPentest={(target) => onLaunchPentest?.(target)}
              onViewIssues={() => onViewIssues?.()}
              onClose={() => setSelectedDomain(null)}
            />
          </div>
        )}

        {/* ASSET LIST (DOMAINS) */}
        {activeTab === 'domains' && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Tracked Domains & Endpoints (Click to inspect full view)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {domains.map((dom) => (
                <div
                  key={dom.name}
                  onClick={() => setSelectedDomain(dom.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    selectedDomain === dom.name
                      ? 'border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-950/40'
                      : 'border-zinc-800/80 bg-zinc-950/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white group-hover:text-cyan-300">
                          {dom.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {dom.type}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-3">
                        <span>IP: {dom.ip}</span>
                        <span>•</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {dom.ssl}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {dom.issues > 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {dom.issues} Finding
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> 0 Vulnerabilities
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDomain(dom.name);
                      }}
                      className="border-zinc-700 bg-zinc-900/60 text-cyan-300 text-xs h-8"
                    >
                      Inspect Data
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSET LIST (REPOSITORIES) */}
        {activeTab === 'repos' && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Connected Source Code Repositories
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {repos.map((repo) => (
                <div
                  key={repo.name}
                  className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {repo.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {repo.visibility}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-3">
                        <span>Branch: {repo.branch}</span>
                        <span>•</span>
                        <span>Stack: {repo.language}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/15 border border-purple-500/30 text-purple-300">
                      {repo.sastStatus}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onLaunchPentest?.('https://vishnukanchipati.me')}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8"
                    >
                      Run White-Box Scan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
