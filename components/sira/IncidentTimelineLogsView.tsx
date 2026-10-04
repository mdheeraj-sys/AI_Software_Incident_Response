import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Lock, 
  Activity, 
  Search, 
  Filter, 
  ArrowRight, 
  FileText, 
  Zap, 
  Eye, 
  Clock, 
  Server, 
  Cpu, 
  UserX,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Database,
  Globe
} from 'lucide-react';

interface IncidentStory {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  sourceIp: string;
  target: string;
  // Simple English Explanations
  errorOccurred: {
    heading: string;
    description: string;
    technicalCode: string;
    impact: string;
  };
  whatDetected: {
    heading: string;
    description: string;
    detector: string;
    anomalyConfidence: string;
  };
  whatSolved: {
    heading: string;
    description: string;
    actionTaken: string;
    outcome: string;
  };
  auditHash: string;
  timelineSteps: {
    time: string;
    badge: string;
    badgeType: 'error' | 'detect' | 'human' | 'solved';
    title: string;
    simpleSummary: string;
  }[];
}

interface LogEntry {
  id: string;
  time: string;
  service: 'auth' | 'web' | 'db' | 'firewall';
  level: 'ERROR' | 'WARN' | 'INFO' | 'SOLVED';
  ip: string;
  raw: string;
  simpleWhat: string;
  simpleSolved: string;
}

export const IncidentTimelineLogsView: React.FC<{
  onOpenSoc?: () => void;
  onOpenAssistant?: () => void;
}> = ({ onOpenSoc, onOpenAssistant }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'logs'>('timeline');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('inc-01');
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'solved' | 'auth' | 'db'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Curated Incident Case Studies explained in Simple English
  const incidents: IncidentStory[] = [
    {
      id: 'inc-01',
      title: 'Password Guessing (Brute-Force) Attack Blocked',
      category: 'Credential Stuffing (T1110)',
      severity: 'high',
      timestamp: '22:28:26 UTC',
      sourceIp: '106.192.2.103',
      target: '/login (Admin Portal)',
      errorOccurred: {
        heading: 'What Error Occurred?',
        description: 'An attacker tried to break into the portal by guessing the administrator password 48 times in less than 2 seconds.',
        technicalCode: 'HTTP 401 Unauthorized Volumetric Burst',
        impact: 'High risk of unauthorized admin account takeover and student records leakage.'
      },
      whatDetected: {
        heading: 'What Did SIRA AI Detect?',
        description: 'SIRA watched the login stream and noticed a massive 4.2x spike in failed logins compared to ordinary student activity.',
        detector: 'Drain 3.0 Log Clusterer + Isolation Forest Anomaly Engine',
        anomalyConfidence: '96.8% Confidence'
      },
      whatSolved: {
        heading: 'How SIRA Solved It?',
        description: 'SIRA instantly isolated the attacker IP address at the firewall gateway. All future requests from the attacker were blocked in 0.8 seconds. Zero accounts were breached.',
        actionTaken: 'Firewall perimeter IP quarantine rule enforced (iptables DROP)',
        outcome: 'Attacker locked out with HTTP 403 Forbidden. College portal remained 100% healthy.'
      },
      auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timelineSteps: [
        {
          time: '22:28:24',
          badge: 'ATTACK STARTED',
          badgeType: 'error',
          title: 'Adversary Initiated Login Flooding',
          simpleSummary: 'Attacker IP 106.192.2.103 started blasting automated password guesses against /login.'
        },
        {
          time: '22:28:26',
          badge: 'AI DETECTED',
          badgeType: 'detect',
          title: 'SIRA Anomaly Triggered',
          simpleSummary: 'Drain parser grouped 48 identical failed login lines. Anomaly score surged to 0.94.'
        },
        {
          time: '22:28:27',
          badge: 'HITL APPROVAL',
          badgeType: 'human',
          title: 'Security Operator Approved Defense Plan',
          simpleSummary: 'SIRA presented the triage evidence card. Human operator confirmed perimeter IP block.'
        },
        {
          time: '22:28:28',
          badge: 'SOLVED & PROTECTED',
          badgeType: 'solved',
          title: 'Firewall Rule Activated',
          simpleSummary: 'Attacker IP blocked at the edge. Cryptographic SHA-256 hash saved to audit log.'
        }
      ]
    },
    {
      id: 'inc-02',
      title: 'SQL Injection Database Exploit Thwarted',
      category: 'Database Injection (T1190)',
      severity: 'critical',
      timestamp: '22:28:50 UTC',
      sourceIp: '106.192.2.103',
      target: '/search (Student Catalog)',
      errorOccurred: {
        heading: 'What Error Occurred?',
        description: 'An attacker typed hidden SQL database commands ("SELECT ... SLEEP(3)") into the product search bar to force the database to crash and leak private tables.',
        technicalCode: 'SQL Execution Syntax Error (SQLite 500)',
        impact: 'Direct threat to student fee records and user password hashes stored in PostgreSQL/SQLite.'
      },
      whatDetected: {
        heading: 'What Did SIRA AI Detect?',
        description: 'SIRA saw database syntax error logs and recognized common SQL hacker patterns like "UNION", "SLEEP", and "--" comments in the query parameter.',
        detector: 'Syntax Anomaly Correlator + Database Log Monitor',
        anomalyConfidence: '98.2% Confidence'
      },
      whatSolved: {
        heading: 'How SIRA Solved It?',
        description: 'SIRA intercepted the malicious search queries, dropped the attacker connection, and enforced query sanitation rules. Zero database records were leaked.',
        actionTaken: 'Query parameter sanitization & IP rate-limit lock',
        outcome: 'Database response time restored to 2.1ms. Attacker exploit attempts defused.'
      },
      auditHash: '8a97c160b72a4e9e432c699742cf6f76e1f0e4b789a263155f19067b0754128a',
      timelineSteps: [
        {
          time: '22:28:49',
          badge: 'MALICIOUS INPUT',
          badgeType: 'error',
          title: 'Adversary Sent SQL Injection Payload',
          simpleSummary: 'HTTP GET /search?q=\' AND SLEEP(3)-- reached the database layer.'
        },
        {
          time: '22:28:50',
          badge: 'AI DETECTED',
          badgeType: 'detect',
          title: 'SIRA Caught Database Error Signature',
          simpleSummary: 'Drain template E09 flagged unexpected SQLite execution syntax error.'
        },
        {
          time: '22:28:51',
          badge: 'HITL APPROVAL',
          badgeType: 'human',
          title: 'Operator Gated Defense Confirmation',
          simpleSummary: 'Operator confirmed attack vector is malicious SQL exploration.'
        },
        {
          time: '22:28:52',
          badge: 'SOLVED & PROTECTED',
          badgeType: 'solved',
          title: 'Vulnerability Mitigated',
          simpleSummary: 'Query safely escaped, attacker quarantined, and database health confirmed online.'
        }
      ]
    },
    {
      id: 'inc-03',
      title: 'Hidden Sensitive Files Scanner Blocked',
      category: 'Directory Traversal / Recon (T1083)',
      severity: 'medium',
      timestamp: '22:29:02 UTC',
      sourceIp: '106.192.2.103',
      target: '/.env, /config.json, /wp-admin',
      errorOccurred: {
        heading: 'What Error Occurred?',
        description: 'An automated scanner script probed the server trying to find exposed password files like "/.env" and "/admin/config".',
        technicalCode: 'HTTP 404 & 403 Probe Velocity',
        impact: 'Adversary searching for backend secrets and API keys to exploit.'
      },
      whatDetected: {
        heading: 'What Did SIRA AI Detect?',
        description: 'SIRA noticed rapid-fire 404 errors for secret files that ordinary students never visit.',
        detector: 'Path Entropy & Directory Enumeration Filter',
        anomalyConfidence: '91.4% Confidence'
      },
      whatSolved: {
        heading: 'How SIRA Solved It?',
        description: 'SIRA automatically rate-limited the scanner and added an allow-list rule. The secret files remained completely invisible.',
        actionTaken: 'Path honeypot defense + 10-minute temporary traffic jail',
        outcome: 'Scanner received HTTP 429 Too Many Requests and gave up.'
      },
      auditHash: 'bfcf0e9d65a8e9e432c699742cf6f76e1f0e4b789a263155f19067b0754128a',
      timelineSteps: [
        {
          time: '22:29:00',
          badge: 'PROBE DETECTED',
          badgeType: 'error',
          title: 'Scanner Probed Secret Endpoints',
          simpleSummary: 'Adversary scanned for /.env, /config.json, and hidden backend tokens.'
        },
        {
          time: '22:29:02',
          badge: 'AI DETECTED',
          badgeType: 'detect',
          title: 'High Path Entropy Flagged',
          simpleSummary: 'Drain parser identified rapid 404 non-existent file lookups.'
        },
        {
          time: '22:29:03',
          badge: 'SOLVED & PROTECTED',
          badgeType: 'solved',
          title: 'Scanner Jailed & Silenced',
          simpleSummary: 'Automatic rate-limiting applied. Zero secret keys or environment files exposed.'
        }
      ]
    },
    {
      id: 'inc-04',
      title: 'Production Domain Cryptographic Verification',
      category: 'Zero-Trust Edge Security',
      severity: 'low',
      timestamp: '22:31:14 UTC',
      sourceIp: '127.0.0.1',
      target: 'vishnukanchipati.me',
      errorOccurred: {
        heading: 'What Challenge Occurred?',
        description: 'A new web domain (vishnukanchipati.me) was connected and needed cryptographic proof of ownership before being trusted by SIRA.',
        technicalCode: 'Pending DNS TXT Ownership Challenge',
        impact: 'Prevents unauthorized domain spoofing or man-in-the-middle attacks.'
      },
      whatDetected: {
        heading: 'What Did SIRA AI Detect?',
        description: 'SIRA probed Namecheap root nameservers and located the custom verification TXT token "sira-verify-8f2a9e3d1b74c0e6".',
        detector: 'Authoritative Anycast DNS Verification Mesh',
        anomalyConfidence: '100% Cryptographic Match'
      },
      whatSolved: {
        heading: 'How SIRA Solved It?',
        description: 'SIRA verified the domain, issued a fresh TLS 1.3 certificate, and established active edge shield monitoring.',
        actionTaken: 'Edge DNS TXT validation & Cloudflare/Vercel synchronization',
        outcome: 'Domain vishnukanchipati.me fully verified, SSL encrypted, and actively shielded.'
      },
      auditHash: '702f9a11e0586e9e432c699742cf6f76e1f0e4b789a263155f19067b0754128a',
      timelineSteps: [
        {
          time: '22:31:10',
          badge: 'CHALLENGE ISSUED',
          badgeType: 'error',
          title: 'DNS Ownership Challenge Generated',
          simpleSummary: 'SIRA provided TXT record _sira-verification.vishnukanchipati.me.'
        },
        {
          time: '22:31:12',
          badge: 'ANYCAST PROBE',
          badgeType: 'detect',
          title: 'Global DNS Probed Across 6 Regions',
          simpleSummary: 'Edge PoPs in US, Europe, and Asia confirmed TXT propagation.'
        },
        {
          time: '22:31:14',
          badge: 'SOLVED & PROTECTED',
          badgeType: 'solved',
          title: 'Domain Verified & Shielded',
          simpleSummary: 'Ownership proven. SSL TLS 1.3 active with zero-trust perimeter defense.'
        }
      ]
    }
  ];

  // Plain-English Log Stream
  const rawLogs: LogEntry[] = [
    {
      id: 'log-1',
      time: '22:28:26.386',
      service: 'auth',
      level: 'WARN',
      ip: '106.192.2.103',
      raw: "Authentication failed for user 'admin' from IP 106.192.2.103: Invalid credentials",
      simpleWhat: "Someone tried to guess the password for 'admin' and failed.",
      simpleSolved: "SIRA flagged the rapid failed attempts and prepared a firewall block."
    },
    {
      id: 'log-2',
      time: '22:28:28.112',
      service: 'firewall',
      level: 'SOLVED',
      ip: '106.192.2.103',
      raw: "AGENT MITIGATION EXECUTED: Blocked IP 106.192.2.103 via iptables -A INPUT -j DROP",
      simpleWhat: "Attacker attempted to send more password guesses.",
      simpleSolved: "SOLVED: Firewall dropped all incoming packets from 106.192.2.103. Attack completely stopped."
    },
    {
      id: 'log-3',
      time: '22:28:50.587',
      service: 'db',
      level: 'ERROR',
      ip: '106.192.2.103',
      raw: "Database query execution error for query [SELECT id, name FROM products WHERE name LIKE '%1' AND SLEEP(3)--%']: no such function: SLEEP",
      simpleWhat: "Attacker tried to run a SQL Injection command in the search bar to crash the database.",
      simpleSolved: "SIRA caught the malicious syntax and neutralized the query before any data could leak."
    },
    {
      id: 'log-4',
      time: '22:29:02.171',
      service: 'web',
      level: 'WARN',
      ip: '106.192.2.103',
      raw: "HTTP GET /.env HTTP/1.1 from 106.192.2.103 -> 404 Not Found",
      simpleWhat: "Automated scanner searched for hidden password file /.env.",
      simpleSolved: "Server returned 404 Not Found and SIRA locked the scanner with rate limits."
    },
    {
      id: 'log-5',
      time: '22:31:14.021',
      service: 'auth',
      level: 'INFO',
      ip: '127.0.0.1',
      raw: "Token verification issued for vishnukanchipati.me via TLS 1.3 handshake",
      simpleWhat: "Domain ownership validation check for vishnukanchipati.me.",
      simpleSolved: "Cryptographic token matched! Domain is now officially protected by SIRA."
    }
  ];

  const currentIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const filteredLogs = rawLogs.filter(log => {
    if (logFilter === 'error' && log.level !== 'ERROR' && log.level !== 'WARN') return false;
    if (logFilter === 'solved' && log.level !== 'SOLVED') return false;
    if (logFilter === 'auth' && log.service !== 'auth') return false;
    if (logFilter === 'db' && log.service !== 'db') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.raw.toLowerCase().includes(q) ||
        log.simpleWhat.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Top Banner & Mode Controls */}
      <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <History className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Incident Timeline & Plain-English Logs
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold uppercase">
                  Simple English
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Clear story of what went wrong, what SIRA detected, and how it was solved.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Chips: Timeline vs Logs Table */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'timeline'
                  ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/80 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Incident Story Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/80 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Raw Logs & Explainer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 terminal-scroll">
        {activeTab === 'timeline' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* 1. Incident Scenario Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                Select Security Incident Case Study:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {incidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedIncidentId === inc.id
                        ? 'bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-950/30'
                        : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                      <span>{inc.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded uppercase font-semibold ${
                        inc.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                        inc.severity === 'high' ? 'bg-rose-500/20 text-rose-300' :
                        inc.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-100 line-clamp-1">
                      {inc.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                      {inc.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. The Big 3 Summary Cards: What Happened -> Detected -> Solved */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: What Error Occurred? */}
              <div className="p-4 rounded-2xl border border-red-500/30 bg-zinc-900/70 backdrop-blur-md shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> STEP 1: PROBLEM
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{currentIncident.target}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    {currentIncident.errorOccurred.heading}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {currentIncident.errorOccurred.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                  <div className="text-red-400 font-semibold">{currentIncident.errorOccurred.technicalCode}</div>
                  <div className="text-zinc-500 text-[10px]">{currentIncident.errorOccurred.impact}</div>
                </div>
              </div>

              {/* Card 2: What Did SIRA Detect? */}
              <div className="p-4 rounded-2xl border border-cyan-500/30 bg-zinc-900/70 backdrop-blur-md shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" /> STEP 2: AI DETECTION
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">{currentIncident.whatDetected.anomalyConfidence}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    {currentIncident.whatDetected.heading}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {currentIncident.whatDetected.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                  <div className="text-cyan-400 font-semibold">{currentIncident.whatDetected.detector}</div>
                  <div className="text-zinc-500 text-[10px]">Attacker IP: {currentIncident.sourceIp}</div>
                </div>
              </div>

              {/* Card 3: What Was Solved? */}
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-zinc-900/70 backdrop-blur-md shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> STEP 3: RESOLUTION
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">100% SECURED</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">
                    {currentIncident.whatSolved.heading}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {currentIncident.whatSolved.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1 text-[11px] font-mono">
                  <div className="text-emerald-400 font-semibold">{currentIncident.whatSolved.actionTaken}</div>
                  <div className="text-zinc-500 text-[10px]">{currentIncident.whatSolved.outcome}</div>
                </div>
              </div>
            </div>

            {/* 3. The Visual Step-by-Step Timeline */}
            <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-space">
                    Chronological Incident Timeline
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256 Audit Chain: <span className="text-emerald-400 font-bold">{currentIncident.auditHash.slice(0, 16)}...</span></span>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                {currentIncident.timelineSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    {/* Circle Node */}
                    <span className={`absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-zinc-950 ${
                      step.badgeType === 'error' ? 'border-red-500 text-red-500' :
                      step.badgeType === 'detect' ? 'border-cyan-400 text-cyan-400' :
                      step.badgeType === 'human' ? 'border-amber-400 text-amber-400' :
                      'border-emerald-400 text-emerald-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        step.badgeType === 'error' ? 'bg-red-500' :
                        step.badgeType === 'detect' ? 'bg-cyan-400' :
                        step.badgeType === 'human' ? 'bg-amber-400' :
                        'bg-emerald-400'
                      }`} />
                    </span>

                    <div className="p-3.5 rounded-xl border border-zinc-800/70 bg-zinc-950/80 hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-zinc-400">{step.time}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                            step.badgeType === 'error' ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                            step.badgeType === 'detect' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                            step.badgeType === 'human' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {step.badge}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-semibold text-white">
                        {step.title}
                      </h4>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {step.simpleSummary}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw Logs & Plain-English Explainer */}
        {activeTab === 'logs' && (
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-2 overflow-x-auto terminal-scroll">
                <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 shrink-0 px-1">
                  <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filters:
                </span>
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    logFilter === 'all'
                      ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All Logs
                </button>
                <button
                  onClick={() => setLogFilter('error')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    logFilter === 'error'
                      ? 'bg-zinc-800 text-red-400 border border-red-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Errors (401/500)
                </button>
                <button
                  onClick={() => setLogFilter('solved')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    logFilter === 'solved'
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Mitigations (Solved)
                </button>
                <button
                  onClick={() => setLogFilter('auth')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    logFilter === 'auth'
                      ? 'bg-zinc-800 text-cyan-400 border border-cyan-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Auth
                </button>
                <button
                  onClick={() => setLogFilter('db')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    logFilter === 'db'
                      ? 'bg-zinc-800 text-purple-400 border border-purple-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Database
                </button>
              </div>

              {/* Search box */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search IP, error, or template..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Logs List with Simple English Translation Drawer */}
            <div className="space-y-2.5">
              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-all hover:border-zinc-700"
                  >
                    {/* Log Header Row */}
                    <div
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                        <button className="text-zinc-500 mt-0.5 sm:mt-0">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                        </button>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                          log.level === 'ERROR' ? 'bg-red-950/80 text-red-300 border border-red-800/80' :
                          log.level === 'WARN' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/80' :
                          log.level === 'SOLVED' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80' :
                          'bg-zinc-800 text-cyan-300 border border-zinc-700'
                        }`}>
                          {log.level}
                        </span>

                        <span className="font-mono text-[11px] text-zinc-500 shrink-0">{log.time}</span>
                        <span className="font-mono text-xs text-zinc-300 truncate">{log.raw}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                        <span className="text-zinc-500 text-[11px]">{log.ip}</span>
                        <span className="text-cyan-400 text-[11px] hover:underline flex items-center gap-1">
                          {isExpanded ? 'Hide Story' : 'Explain'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Simple Grammar Explainer Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-4 py-3.5 bg-zinc-950/90 border-t border-zinc-800/80 space-y-3"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            {/* What Occurred */}
                            <div className="p-3 rounded-lg border border-red-500/20 bg-red-950/10 space-y-1">
                              <span className="font-mono text-[10px] text-red-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" /> What Occurred in Simple Words:
                              </span>
                              <p className="text-zinc-200 leading-relaxed font-sans">
                                {log.simpleWhat}
                              </p>
                            </div>

                            {/* What SIRA Solved */}
                            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/10 space-y-1">
                              <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3" /> What Was Solved:
                              </span>
                              <p className="text-zinc-200 leading-relaxed font-sans">
                                {log.simpleSolved}
                              </p>
                            </div>
                          </div>

                          {/* Raw technical line */}
                          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 select-all overflow-x-auto">
                            <code>{log.raw}</code>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
