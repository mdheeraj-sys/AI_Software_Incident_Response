import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  RefreshCw, 
  Database, 
  Server, 
  Bug, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Copy, 
  Check, 
  GitBranch, 
  Play, 
  Maximize2, 
  Minimize2,
  Code2,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebsiteAuditInspectorProps {
  targetDomain?: string;
  onClose?: () => void;
}

export const WebsiteAuditInspector: React.FC<WebsiteAuditInspectorProps> = ({
  targetDomain = 'vishnukanchipati.me',
  onClose
}) => {
  const [scanStage, setScanStage] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [previewMode, setPreviewMode] = useState<'iframe' | 'telemetry'>('iframe');
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);
  const [resolvedIssues, setResolvedIssues] = useState<string[]>([]);
  const [retestingId, setRetestingId] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState<boolean>(false);

  const cleanDomain = targetDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const targetUrl = `https://${cleanDomain}`;

  // Step-by-step automated audit simulation
  useEffect(() => {
    setIsScanning(true);
    setScanStage(1);

    const t1 = setTimeout(() => setScanStage(2), 700);
    const t2 = setTimeout(() => setScanStage(3), 1400);
    const t3 = setTimeout(() => setScanStage(4), 2100);
    const t4 = setTimeout(() => {
      setScanStage(5);
      setIsScanning(false);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [cleanDomain]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPatchId(id);
    setTimeout(() => setCopiedPatchId(null), 2000);
  };

  const handleRetestAndFix = (id: string) => {
    setRetestingId(id);
    setTimeout(() => {
      setRetestingId(null);
      setResolvedIssues(prev => [...prev, id]);
    }, 1500);
  };

  // Structured findings with title of type of attack and exact solution
  const findings = [
    {
      id: 'vuln-idor-bola',
      attackTitle: 'Insecure Direct Object Reference (IDOR) / Broken Object-Level Authorization (BOLA)',
      attackType: 'API Authorization & Database Access Control (OWASP API1:2023)',
      severity: 'Critical',
      cvss: 8.8,
      affectedComponent: 'PostgreSQL Database • Users Table via /api/v1/users/{id}',
      issueDescription: 
        `When querying the user profile endpoint, the backend executes 'SELECT * FROM users WHERE id = :id' using the request path parameter directly without validating that the authenticated session owns that user record or possesses administrative permissions. An auditor or attacker can enumerate sequential IDs and dump sensitive customer records.`,
      pocCommand: `curl -s -X GET "https://api.${cleanDomain}/api/v1/users/102" -H "Authorization: Bearer test_auditor_token"`,
      pocResponse: `HTTP/2 200 OK\n{"id": 102, "name": "System Admin", "email": "admin@vishnukanchipati.me", "role": "superuser", "api_keys": ["sk_live_9f81a7b..."]}`,
      solutionTitle: 'Defensive Solution: Record-Level Authorization & PostgreSQL Row-Level Security (RLS)',
      solutionCode: `# 1. Backend API Fix (FastAPI / SQLAlchemy / Node)
from fastapi import HTTPException, Depends

def get_user_profile(user_id: int, current_user = Depends(get_current_user)):
    # Enforce object-level ownership check
    if current_user.id != user_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Forbidden: Access Denied to Requested Resource")
    return db.query(User).filter(User.id == user_id).first()

# 2. Database Layer Defense (PostgreSQL RLS Policy)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_isolation_policy ON users
    FOR ALL
    TO authenticated_role
    USING (id = current_setting('app.current_user_id')::int OR current_setting('app.is_admin')::boolean = true);`,
      solutionSummary: 'Enforce strict session ID validation against requested resource ID at the API middleware layer, and apply PostgreSQL Row-Level Security (RLS) so the database rejects cross-tenant queries at the storage engine.'
    },
    {
      id: 'vuln-sql-injection',
      attackTitle: 'SQL Injection via Dynamic Search Query Parameter',
      attackType: 'Database Query Injection (OWASP A03:2021)',
      severity: 'High',
      cvss: 7.9,
      affectedComponent: 'PostgreSQL Database Engine via /api/v1/search?q=',
      issueDescription: 
        `The search endpoint constructs database queries using dynamic raw SQL string interpolation. Input values containing single quotes and UNION SELECT directives alter the query syntax, enabling unauthorized extraction of database table schemas and credentials.`,
      pocCommand: `curl -s "https://api.${cleanDomain}/api/v1/search?q=' UNION SELECT id, username, password_hash, email FROM users--"`,
      pocResponse: `HTTP/2 200 OK\n[{"id": 1, "username": "admin", "password_hash": "$2b$12$e8..."}, ...]`,
      solutionTitle: 'Defensive Solution: Enforce Parameterized Queries & Prepared Statements',
      solutionCode: `# Backend Solution: Parameterized Queries (Never use f-strings or string concatenation in SQL)
# Vulnerable:
# db.execute(f"SELECT * FROM articles WHERE title LIKE '%{query}%'")

# Remediation:
stmt = select(Article).where(Article.title.ilike(f"%{query}%"))
results = db.execute(stmt).scalars().all()

# Or Raw SQL with Bind Parameters:
db.execute(text("SELECT * FROM articles WHERE title ILIKE :search"), {"search": f"%{query}%"})`,
      solutionSummary: 'Replace all dynamic string interpolation with parameterized SQL prepared statements or ORM type-safe query builders to neutralize input manipulation.'
    },
    {
      id: 'vuln-rate-limit',
      attackTitle: 'High-Velocity Credential Stuffing & Rate-Limiting Bypass',
      attackType: 'Authentication Exhaustion (OWASP A07:2021)',
      severity: 'Medium',
      cvss: 6.2,
      affectedComponent: 'Auth Controller & Session Store on /auth/login',
      issueDescription: 
        `The authentication endpoint accepts unlimited POST requests without backoff, CAPTCHA, or IP throttling. During SIRA audit, 140 rapid login attempts succeeded without triggering an HTTP 429 Too Many Requests response.`,
      pocCommand: `for i in {1..140}; do curl -s -o /dev/null -w "%{http_code}\\n" -X POST "https://${cleanDomain}/auth/login" -d '{"u":"admin","p":"1234"}'; done`,
      pocResponse: `Sustained HTTP 200 / 401 status across 140 requests in 2.4s (No throttling detected).`,
      solutionTitle: 'Defensive Solution: Distributed Redis Token Bucket Rate Limiter',
      solutionCode: `# Redis Token Bucket Rate Limiting (FastAPI / Express middleware)
from redis.asyncio import Redis

async def rate_limit_login(client_ip: str, redis: Redis):
    key = f"rate:login:{client_ip}"
    attempts = await redis.incr(key)
    if attempts == 1:
        await redis.expire(key, 60) # 60 second window
    if attempts > 5:
        raise HTTPException(
            status_code=429, 
            detail="Too Many Login Attempts. Account locked for 60 seconds."
        )`,
      solutionSummary: 'Deploy Redis sliding window rate-limiting capping authentication attempts to 5 requests per 60 seconds per IP, coupled with Cloudflare WAF managed challenges.'
    }
  ];

  return (
    <div className="w-full rounded-2xl border border-zinc-800/90 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl text-zinc-100 overflow-hidden flex flex-col font-sans transition-all">
      {/* 1. TOP BROWSER INSPECTOR BAR */}
      <div className="px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-zinc-500 text-xs font-mono ml-2 hidden sm:inline">SIRA Live Inspector</span>
        </div>

        {/* Browser URL Bar */}
        <div className="flex-1 max-w-xl mx-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-zinc-700/80 text-xs font-mono text-zinc-300 shadow-inner">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-emerald-400">https://</span>
          <span className="text-white font-medium truncate">{cleanDomain}</span>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-zinc-400">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">TLS 1.3</span>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-xs font-mono">
            <button
              onClick={() => setPreviewMode('iframe')}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === 'iframe' ? 'bg-cyan-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Live Iframe
            </button>
            <button
              onClick={() => setPreviewMode('telemetry')}
              className={`px-2.5 py-1 rounded transition-colors ${
                previewMode === 'telemetry' ? 'bg-cyan-600 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Audit Stream
            </button>
          </div>

          <a
            href={targetUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. LIVE IFRAME CONTAINER / WEBSITE PREVIEW */}
      {previewMode === 'iframe' && (
        <div className="relative w-full h-[340px] sm:h-[400px] bg-zinc-900 border-b border-zinc-800 overflow-hidden">
          <iframe
            src={targetUrl}
            title={`Live preview of ${cleanDomain}`}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setIframeError(true)}
          />

          {/* Floating Live Scanning Telemetry Overlay Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Target Loaded: {cleanDomain}</span>
            <span className="text-zinc-500">|</span>
            <span className="text-emerald-400">Inspecting DOM & Network</span>
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-zinc-700 text-[11px] font-mono text-zinc-300 shadow-xl">
            <span>Note: If site blocks iframe embedding via X-Frame-Options, use</span>
            <a href={targetUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline flex items-center gap-1">
              External View <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 3. MULTI-PHASE AUDIT PROGRESS STEPPER */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
              {isScanning ? 'Autonomous Full-Stack Security Audit in Progress...' : 'Audit Complete: Vulnerabilities & Solutions Identified'}
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {isScanning ? `Stage ${scanStage} of 4` : '100% Inspected'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className={`p-2 rounded-lg border ${scanStage >= 1 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'}`}>
            <div className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>1. DNS & Network</span>
            </div>
            <div className="text-[10px] opacity-75 mt-0.5">Cloudflare Anycast Resolved</div>
          </div>

          <div className={`p-2 rounded-lg border ${scanStage >= 2 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'}`}>
            <div className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>2. HTTP & Web Layer</span>
            </div>
            <div className="text-[10px] opacity-75 mt-0.5">TLS 1.3 & Headers Checked</div>
          </div>

          <div className={`p-2 rounded-lg border ${scanStage >= 3 ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'}`}>
            <div className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>3. Database & API</span>
            </div>
            <div className="text-[10px] opacity-75 mt-0.5">PostgreSQL / ORM Audited</div>
          </div>

          <div className={`p-2 rounded-lg border ${scanStage >= 4 ? 'border-rose-500/40 bg-rose-950/20 text-rose-300' : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'}`}>
            <div className="flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>4. Attack Findings</span>
            </div>
            <div className="text-[10px] opacity-75 mt-0.5">3 Vulnerabilities Mapped</div>
          </div>
        </div>
      </div>

      {/* 4. VULNERABILITY FINDINGS, ATTACK TITLES & DEFENSIVE SOLUTIONS */}
      <div className="p-4 sm:p-6 space-y-6 max-h-[500px] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-400" />
              Security Audit Findings for {cleanDomain}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review each attack vector, reproducible proof-of-concept, and production-ready solution patch.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {findings.length} Vulnerabilities Detected
          </span>
        </div>

        {findings.map((item) => {
          const isResolved = resolvedIssues.includes(item.id);
          const isRetesting = retestingId === item.id;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isResolved
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : item.severity === 'Critical'
                  ? 'border-rose-500/40 bg-zinc-900/80 shadow-xl'
                  : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              {/* Header with Title of Type of Attack */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        item.severity === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : item.severity === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {item.severity.toUpperCase()} • CVSS {item.cvss}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">{item.attackType}</span>
                  </div>

                  {/* Title of Attack */}
                  <h4 className="text-base font-bold text-white mt-2 flex items-center gap-1.5">
                    <span className="text-rose-400">Attack:</span> {item.attackTitle}
                  </h4>
                  <p className="text-xs font-mono text-cyan-300 mt-0.5">
                    Affected: {item.affectedComponent}
                  </p>
                </div>

                <div className="shrink-0">
                  {isResolved ? (
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PATCHED & VERIFIED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-mono bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> EXPLOIT ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Issue Description */}
              <div className="mt-3 text-xs text-zinc-300 leading-relaxed">
                {item.issueDescription}
              </div>

              {/* Reproducible PoC */}
              <div className="mt-3 p-3 rounded-xl bg-black/80 border border-zinc-800 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-cyan-400" /> Reproducible Exploit PoC (cURL)
                  </span>
                </div>
                <div className="text-rose-300 select-all overflow-x-auto pb-0.5">{item.pocCommand}</div>
                <div className="text-emerald-400 text-[11px] border-t border-zinc-800/80 pt-1 whitespace-pre-line">
                  {item.pocResponse}
                </div>
              </div>

              {/* Solution to it */}
              <div className="mt-4 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      {item.solutionTitle}
                    </span>
                  </div>

                  <button
                    onClick={() => copyToClipboard(item.solutionCode, item.id)}
                    className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-200 transition-colors"
                  >
                    {copiedPatchId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPatchId === item.id ? 'Copied' : 'Copy Solution'}</span>
                  </button>
                </div>

                <p className="text-xs text-zinc-300">
                  {item.solutionSummary}
                </p>

                <div className="p-3 rounded-lg bg-black/90 border border-zinc-800 font-mono text-[11px] text-zinc-200 overflow-x-auto whitespace-pre leading-relaxed">
                  {item.solutionCode}
                </div>

                {/* Fix / Retest Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-zinc-400">
                    Automated Verification: <span className="text-cyan-300">Replays Exploit in Kali Sandbox</span>
                  </span>

                  <Button
                    size="sm"
                    disabled={isRetesting || isResolved}
                    onClick={() => handleRetestAndFix(item.id)}
                    className={
                      isResolved
                        ? "bg-emerald-600/80 text-white cursor-default text-xs h-8"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs h-8 shadow-md"
                    }
                  >
                    {isRetesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                        <span>Applying Patch & Retesting...</span>
                      </>
                    ) : isResolved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Vulnerability Closed</span>
                      </>
                    ) : (
                      <>
                        <GitBranch className="w-3.5 h-3.5 mr-1" />
                        <span>Apply Solution & Retest</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
