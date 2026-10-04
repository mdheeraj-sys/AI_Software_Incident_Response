import React, { useState } from 'react';
import { 
  Bug, 
  ShieldAlert, 
  CheckCircle2, 
  Terminal, 
  GitBranch, 
  ExternalLink, 
  Filter, 
  Check, 
  Copy, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IssuesHubViewProps {
  onBackToChat?: () => void;
  onOpenTargetDomain?: () => void;
}

export const IssuesHubView: React.FC<IssuesHubViewProps> = ({
  onBackToChat,
  onOpenTargetDomain
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resolvedIssues, setResolvedIssues] = useState<string[]>([]);
  const [retestingId, setRetestingId] = useState<string | null>(null);

  const issues = [
    {
      id: 'iss-001',
      title: 'Insecure Direct Object Reference (IDOR) on /api/v1/users/{id}',
      severity: 'Critical',
      cvss: 8.8,
      status: 'Open',
      asset: 'api.vishnukanchipati.me',
      endpoint: 'GET /api/v1/users/102',
      cve: 'CWE-639',
      proven: true,
      poc: `curl -s -X GET "https://api.vishnukanchipati.me/api/v1/users/102" -H "Authorization: Bearer test_auditor_token"`,
      proofOutput: `{"id": 102, "name": "Admin Root", "email": "admin@vishnukanchipati.me", "role": "superuser"}`,
      remediationPatch: `diff --git a/app/routers/users.py b/app/routers/users.py
@@ -42,3 +42,5 @@ def get_user_profile(user_id: int, current_user = Depends(get_current_user)):
+    if current_user.id != user_id and current_user.role != 'admin':
+        raise HTTPException(status_code=403, detail="Forbidden")
     return db.query(User).filter(User.id == user_id).first()`
    },
    {
      id: 'iss-002',
      title: 'Rate-Limiting Missing on Authentication Endpoint (/auth/login)',
      severity: 'Medium',
      cvss: 6.2,
      status: 'Open',
      asset: 'vishnukanchipati.me',
      endpoint: 'POST /auth/login',
      cve: 'CWE-307',
      proven: true,
      poc: `for i in {1..120}; do curl -s -o /dev/null -w "%{http_code}\\n" -X POST "https://vishnukanchipati.me/auth/login" -d '{"user":"test"}'; done`,
      proofOutput: `HTTP 200 OK sustained across 120 consecutive requests within 3 seconds (No 429 Too Many Requests response).`,
      remediationPatch: `iptables -A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 50 -j ACCEPT`
    },
    {
      id: 'iss-003',
      title: 'Informational: Content-Security-Policy Missing report-uri Directive',
      severity: 'Low',
      cvss: 3.1,
      status: 'Open',
      asset: 'vishnukanchipati.me',
      endpoint: 'GET /',
      cve: 'CWE-1021',
      proven: false,
      poc: `curl -I https://vishnukanchipati.me/ | grep -i content-security-policy`,
      proofOutput: `content-security-policy: default-src 'self' (No telemetry report-to or report-uri endpoint found).`,
      remediationPatch: `Add report-uri https://sira.internal/csp-reports to edge headers.`
    }
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRetestIssue = (id: string) => {
    setRetestingId(id);
    setTimeout(() => {
      setRetestingId(null);
      setResolvedIssues((prev) => [...prev, id]);
    }, 1800);
  };

  const filteredIssues = issues.filter((iss) => {
    if (filterSeverity === 'all') return true;
    return iss.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#080a0f] text-zinc-100 p-4 lg:p-8 overflow-y-auto font-sans select-none">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                VULNERABILITY MANAGEMENT
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-xs text-zinc-400 font-mono">Centralized Issues Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-400" />
              Vulnerabilities & Attack Chain Evidence
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Reproducible proof-of-concept exploits, attack path graphs, and automated git patch remediation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenTargetDomain && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTargetDomain}
                className="border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white text-xs"
              >
                Inspect vishnukanchipati.me
              </Button>
            )}
            {onBackToChat && (
              <Button
                size="sm"
                onClick={onBackToChat}
                className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs"
              >
                Back to SIRA Assistant
              </Button>
            )}
          </div>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 text-[11px] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'critical', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg uppercase transition-all ${
                filterSeverity === sev
                  ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const isResolved = resolvedIssues.includes(issue.id);
            const isRetesting = retestingId === issue.id;

            return (
              <div
                key={issue.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'border-emerald-500/40 bg-zinc-950/60 opacity-80'
                    : issue.severity === 'Critical'
                    ? 'border-rose-500/40 bg-zinc-950/90 shadow-xl'
                    : 'border-zinc-800 bg-zinc-950/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          issue.severity === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : issue.severity === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {issue.severity.toUpperCase()} • CVSS {issue.cvss}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{issue.cve}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-xs font-mono text-cyan-300">{issue.asset}</span>
                    </div>

                    <h2 className="text-base font-semibold text-white mt-1.5">{issue.title}</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">Endpoint: {issue.endpoint}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isResolved ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> RETEST PASSED • CLOSED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-1">
                        EXPLOIT VALIDATED
                      </span>
                    )}
                  </div>
                </div>

                {/* Reproducible PoC */}
                <div className="mt-4 p-3 rounded-xl bg-black/80 border border-zinc-800 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Terminal className="w-3 h-3 text-cyan-400" /> Reproducible Proof-of-Concept (cURL)
                    </span>
                    <button
                      onClick={() => copyToClipboard(issue.poc, issue.id)}
                      className="text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === issue.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-rose-300 select-all overflow-x-auto pb-1">{issue.poc}</div>
                  <div className="text-emerald-400 text-[11px] border-t border-zinc-800/80 pt-1.5">
                    Server Response: {issue.proofOutput}
                  </div>
                </div>

                {/* Patch & Retest Action Bar */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-mono text-zinc-400">
                    Fix Ready: <span className="text-emerald-300">Automated Git PR Available</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRetesting || isResolved}
                      onClick={() => handleRetestIssue(issue.id)}
                      className="border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white text-xs h-8"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 mr-1 ${isRetesting ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>{isRetesting ? 'Re-running PoC in Sandbox...' : 'Retest Exploit'}</span>
                    </Button>

                    <Button
                      size="sm"
                      disabled={isResolved}
                      onClick={() => handleRetestIssue(issue.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8"
                    >
                      <GitBranch className="w-3.5 h-3.5 mr-1" />
                      <span>{isResolved ? 'Remediated & Verified' : 'Deploy PR Fix & Verify'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
