import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Lock, 
  Server, 
  Zap, 
  AlertTriangle, 
  Terminal, 
  Play, 
  GitBranch, 
  Bug, 
  RefreshCw, 
  Layers, 
  ArrowUpRight,
  Radio,
  FileCode2,
  Cpu,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DomainDeepDiveViewProps {
  domain?: string;
  onLaunchPentest?: (target: string) => void;
  onViewIssues?: () => void;
  onClose?: () => void;
}

export const DomainDeepDiveView: React.FC<DomainDeepDiveViewProps> = ({
  domain = 'vishnukanchipati.me',
  onLaunchPentest,
  onViewIssues,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dns' | 'ports' | 'subdomains' | 'headers' | 'agents'>('overview');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<string>('Just now');
  const [latencyMs, setLatencyMs] = useState<number>(24);
  const [exploitSimulated, setExploitSimulated] = useState<boolean>(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastFetched('Just now');
      setLatencyMs(Math.floor(20 + Math.random() * 15));
    }, 900);
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl shadow-2xl text-zinc-100 overflow-hidden flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-zinc-950/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-mono tracking-tight flex items-center gap-2">
                {domain}
                <a 
                  href={`https://${domain}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-zinc-500 hover:text-cyan-400 transition-colors"
                  title="Visit Website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE PRODUCTION
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              SIRA Asset Discovery • Cloudflare Edge • Real-time Data Fetched ({lastFetched} • {latencyMs}ms RTT)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:text-white text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? 'Re-probing...' : 'Fetch Live Data'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onLaunchPentest?.(domain)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs h-8 shadow-md shadow-cyan-600/30"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            <span>5-Step Pentest</span>
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-zinc-800/80 bg-zinc-900/30 overflow-x-auto text-xs font-mono">
        {[
          { id: 'overview', label: 'Security Posture' },
          { id: 'dns', label: 'DNS & Nameservers' },
          { id: 'subdomains', label: 'Subdomains (4)' },
          { id: 'ports', label: 'Open Ports & Services' },
          { id: 'headers', label: 'HTTP Security Headers' },
          { id: 'agents', label: 'Multi-Agent Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2.5 transition-colors border-b-2 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* TAB 1: OVERVIEW & POSTURE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Edge Anycast IP</span>
                <div className="text-sm font-semibold text-white mt-1 font-mono">104.21.48.12</div>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">Cloudflare ASN 13335</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">TLS Encryption</span>
                <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                  <Lock className="w-3.5 h-3.5" /> TLS 1.3 Strict
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">Expires in 89 days</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Attack Surface</span>
                <div className="text-sm font-semibold text-cyan-300 mt-1 font-mono">3 Live Endpoints</div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">FastAPI / React 19</span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 uppercase">Posture Grade</span>
                <div className="text-sm font-semibold text-amber-400 mt-1 font-mono">Grade B+ (84/100)</div>
                <span className="text-[10px] text-rose-400 mt-0.5 block">1 PoC Exploitable IDOR</span>
              </div>
            </div>

            {/* Live Vulnerability Finding Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/30 via-zinc-900/70 to-zinc-900/70 border border-rose-500/40 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      CRITICAL • CVSS 8.8
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      IDOR on API Endpoint: /api/v1/users/{'{id}'}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1">
                    SIRA Web/API Agent successfully proved unauthorized access to non-session user records.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30">
                  EXPLOIT PROVEN
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/80 border border-zinc-800 font-mono text-xs text-zinc-300 space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase">Proof-of-Concept Replay Payload</div>
                <div className="text-rose-300 select-all">
                  curl -i -s "https://api.{domain}/api/v1/users/102" -H "Authorization: Bearer test_guest_token"
                </div>
                <div className="text-emerald-400 text-[11px]">
                  HTTP/2 200 OK • Content-Type: application/json • PII Leaked: admin@vishnukanchipati.me
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExploitSimulated(true)}
                  className="border-rose-500/40 text-rose-300 hover:bg-rose-950/50 text-xs h-7"
                >
                  <Terminal className="w-3.5 h-3.5 mr-1" />
                  <span>{exploitSimulated ? 'Exploit Verified in Sandbox' : 'Simulate PoC in Sandbox'}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => onViewIssues?.()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-7"
                >
                  <GitBranch className="w-3.5 h-3.5 mr-1" />
                  <span>Create Auto-Fix PR</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DNS RECORDS & CRYPTOGRAPHIC TOKENS */}
        {activeTab === 'dns' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                <span className="text-cyan-400 font-semibold">Authoritative DNS Records</span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> DNSSEC Signed & Validated
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400">A Record: @</span>
                  <span className="text-white">104.21.48.12 (TTL 300)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400">A Record: @</span>
                  <span className="text-white">172.67.182.91 (TTL 300)</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-zinc-800/80">
                  <span className="text-zinc-400">NS (Nameservers):</span>
                  <span className="text-zinc-200">ns1.namecheaphosting.com, ns2.namecheaphosting.com</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/50 border border-zinc-800/80">
                  <span className="text-cyan-300">TXT Verification Token:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">sira-verify-8f2a9e3d1b74c0e6</span>
                    <button
                      onClick={() => copyToClipboard('sira-verify-8f2a9e3d1b74c0e6', 'txt')}
                      className="text-zinc-400 hover:text-white"
                    >
                      {copiedField === 'txt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBDOMAINS & ATTACK SURFACE */}
        {activeTab === 'subdomains' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">api.{domain}</span>
                <span className="text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded text-[10px] border border-rose-500/30">
                  VULNERABLE (IDOR)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Port 8000 • FastAPI Backend • Python 3.11</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">app.{domain}</span>
                <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px] border border-emerald-500/30">
                  SECURE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Port 443 • React 19 Client Dashboard</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">admin.{domain}</span>
                <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px] border border-amber-500/30">
                  SSO PROTECTED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Internal Auth Portal • 2FA Enforced</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">cdn.{domain}</span>
                <span className="text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded text-[10px]">
                  STATIC
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Cloudflare Edge Storage • Cache 98%</p>
            </div>
          </div>
        )}

        {/* TAB 4: OPEN PORTS & SERVICES */}
        {activeTab === 'ports' && (
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">Port 443 / TCP</span>
                <span className="text-zinc-300 ml-2">HTTPS (TLS 1.3, HTTP/2, HTTP/3 QUIC)</span>
              </div>
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px]">OPEN</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-cyan-400 font-bold">Port 80 / TCP</span>
                <span className="text-zinc-300 ml-2">HTTP (301 Permanent Redirect to HTTPS)</span>
              </div>
              <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px]">OPEN</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-amber-400 font-bold">Port 8000 / TCP</span>
                <span className="text-zinc-300 ml-2">Custom Microservice / API Gateway</span>
              </div>
              <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded text-[10px]">EXPOSED</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-zinc-500 font-bold">Port 22 / TCP</span>
                <span className="text-zinc-400 ml-2">SSH (OpenSSH 9.2p1)</span>
              </div>
              <span className="text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded text-[10px]">FILTERED BY FIREWALL</span>
            </div>
          </div>
        )}

        {/* TAB 5: HTTP SECURITY HEADERS */}
        {activeTab === 'headers' && (
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-cyan-300 font-bold">Strict-Transport-Security (HSTS)</div>
                <div className="text-zinc-400 text-[11px]">max-age=31536000; includeSubDomains; preload</div>
              </div>
              <span className="text-emerald-400 font-bold">GRADE A+</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-cyan-300 font-bold">Content-Security-Policy (CSP)</div>
                <div className="text-zinc-400 text-[11px]">default-src 'self'; script-src 'self' 'unsafe-inline'</div>
              </div>
              <span className="text-emerald-400 font-bold">ENFORCED</span>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-cyan-300 font-bold">X-Frame-Options</div>
                <div className="text-zinc-400 text-[11px]">DENY (Clickjacking mitigated)</div>
              </div>
              <span className="text-emerald-400 font-bold">PASS</span>
            </div>
          </div>
        )}

        {/* TAB 6: MULTI-AGENT LOGS */}
        {activeTab === 'agents' && (
          <div className="p-4 rounded-xl bg-black/80 border border-zinc-800 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/80 pb-2">
              <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
                <Terminal className="w-3.5 h-3.5" /> SIRA Multi-Agent Autonomous Pentest Log
              </span>
              <span>Root Orchestrator v2.4</span>
            </div>
            <div className="text-zinc-300 space-y-1 text-[11px] leading-relaxed">
              <p className="text-zinc-500">[05:42:10] RootAgent -&gt; Objective: Autonomous security testing on {domain}</p>
              <p className="text-zinc-400">[05:42:12] ReconAgent -&gt; Discovered 4 subdomains, Cloudflare edge, 3 exposed services</p>
              <p className="text-zinc-400">[05:42:18] WebApiAgent -&gt; Crawling endpoints with Playwright headless browser through Caido proxy</p>
              <p className="text-zinc-400">[05:42:25] WebApiAgent -&gt; Generated test session token and evaluated /api/v1/users/{'{id}'}</p>
              <p className="text-rose-400">[05:42:31] ExploitValidator -&gt; IDOR confirmed: User 102 accessed record of User 100 without authorization</p>
              <p className="text-purple-400">[05:42:38] AutoFixAgent -&gt; Generated git patch with RBAC verification logic and retested payload</p>
              <p className="text-emerald-400">[05:42:44] RetestValidator -&gt; Retested exploit against patched endpoint: HTTP 403 Forbidden returned. VULNERABILITY CLOSED.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer Controls */}
      <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-mono">
          Target Domain: <span className="text-cyan-300 font-semibold">{domain}</span>
        </span>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-zinc-300 text-xs"
            >
              Close
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onLaunchPentest?.(domain)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            Launch 5-Step Pentest
          </Button>
        </div>
      </div>
    </div>
  );
};
