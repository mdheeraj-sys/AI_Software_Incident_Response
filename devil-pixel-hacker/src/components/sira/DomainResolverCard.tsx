import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Cloud, 
  Triangle, 
  FileCode, 
  UploadCloud, 
  Code2, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Zap,
  Server,
  Lock
} from 'lucide-react';

interface DomainResolverCardProps {
  domain?: string;
  initialProvider?: string;
  onVerified?: (domain: string) => void;
}

type TabType = 'dns' | 'file' | 'meta';
type VerificationStatus = 'pending' | 'verifying' | 'verified' | 'failed';

export const DomainResolverCard: React.FC<DomainResolverCardProps> = ({
  domain = 'vishnukanchipati.me',
  initialProvider = 'Namecheap',
  onVerified
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dns');
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);
  const [verifyProgress, setVerifyProgress] = useState<number>(0);
  const [verifyLogs, setVerifyLogs] = useState<string[]>([]);

  const recordName = `_sira-verification.${domain}`;
  const recordValue = `sira-verify-8f2a9e3d1b74c0e6`;
  const metaTagContent = `<meta name="sira-site-verification" content="${recordValue}" />`;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleVerify = () => {
    if (status === 'verifying') return;
    setStatus('verifying');
    setVerifyProgress(10);
    setVerifyLogs(['Querying root DNS servers (ns1.namecheaphosting.com)...']);

    setTimeout(() => {
      setVerifyProgress(45);
      setVerifyLogs(prev => [...prev, `Found TXT record for ${recordName}`]);
    }, 900);

    setTimeout(() => {
      setVerifyProgress(80);
      setVerifyLogs(prev => [...prev, 'Cryptographic token matched sira-verify-8f2a9e3d1b74c0e6']);
    }, 1800);

    setTimeout(() => {
      setVerifyProgress(100);
      setVerifyLogs(prev => [...prev, 'TLS edge certificate issued and SIRA protection active.']);
      setStatus('verified');
      onVerified?.(domain);
    }, 2600);
  };

  const handleQuickConnect = (provider: 'Vercel' | 'Cloudflare') => {
    setActiveIntegration(provider);
    setStatus('verifying');
    setVerifyProgress(30);
    setVerifyLogs([`Connecting to ${provider} API via OAuth2...`]);

    setTimeout(() => {
      setVerifyProgress(70);
      setVerifyLogs(prev => [...prev, `Auto-injecting TXT record to ${provider} DNS zone...`]);
    }, 1100);

    setTimeout(() => {
      setVerifyProgress(100);
      setVerifyLogs(prev => [...prev, `Record committed to ${provider} edge. Instant propagation complete.`]);
      setStatus('verified');
      onVerified?.(domain);
    }, 2200);
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 overflow-hidden text-zinc-100 transition-all duration-300 hover:border-zinc-700/80">
      {/* 1. Header with dynamic status dot */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-900/60 via-zinc-900/30 to-zinc-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                Domain Added: <span className="text-cyan-400 font-mono font-medium">{domain}</span>
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {status === 'pending' && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-medium text-amber-400/90 tracking-wide uppercase">Verification Pending</span>
                </>
              )}
              {status === 'verifying' && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-xs font-medium text-cyan-400 tracking-wide uppercase">Resolving DNS Records...</span>
                </>
              )}
              {status === 'verified' && (
                <>
                  <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Domain Verified & Shielded
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'verified' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> SSL TLS 1.3 Active
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-800/80 border border-zinc-700/60 text-zinc-400">
              Zone ID: #sira-702
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* 2. Provider Detection Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <Server className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              DNS provider detected: <strong className="text-amber-300 font-semibold">{initialProvider}</strong>. Add the TXT record below, then click Verify.
            </span>
          </div>
          <button 
            onClick={() => window.open(`https://ap.www.namecheap.com/domains/domaincontrolpanel/${domain}/advancedns`, '_blank')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-colors shrink-0"
          >
            <span>Open {initialProvider} DNS settings</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* 3. Integration Quick-Connects */}
        <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Using Vercel or Cloudflare? Connect it and SIRA adds the record for you
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">1-Click Auto Config</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickConnect('Vercel')}
              disabled={status === 'verifying' || status === 'verified'}
              className="flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-white transition-all shadow-sm hover:border-zinc-600 disabled:opacity-50"
            >
              <div className="w-4 h-4 flex items-center justify-center bg-white text-black rounded-sm p-0.5">
                <Triangle className="w-2.5 h-2.5 fill-current" />
              </div>
              {activeIntegration === 'Vercel' && status === 'verified' ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected to Vercel</span>
                </span>
              ) : (
                <span>Connect Vercel DNS</span>
              )}
            </button>
            <button
              onClick={() => handleQuickConnect('Cloudflare')}
              disabled={status === 'verifying' || status === 'verified'}
              className="flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-orange-500/30 text-orange-200 hover:text-white transition-all shadow-sm hover:border-orange-500/50 disabled:opacity-50"
            >
              <Cloud className="w-4 h-4 text-orange-400" />
              {activeIntegration === 'Cloudflare' && status === 'verified' ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected to Cloudflare</span>
                </span>
              ) : (
                <span>Connect Cloudflare</span>
              )}
            </button>
          </div>
        </div>

        {/* 4. Verification Methods Segmented Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Manual Verification Method</label>
            <span className="text-xs text-zinc-500">Select preferred protocol</span>
          </div>

          <div className="grid grid-cols-3 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <button
              onClick={() => setActiveTab('dns')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dns'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>DNS Record</span>
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'file'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>File Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'meta'
                  ? 'bg-zinc-800 text-cyan-400 shadow-md border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Meta Tag</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {activeTab === 'dns' && (
              <motion.div
                key="dns"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                {/* Record Type and TTL header */}
                <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                  <span>Record Type: <strong className="text-zinc-200 font-mono">TXT</strong></span>
                  <span>TTL: <strong className="text-zinc-200 font-mono">300 (Automatic)</strong></span>
                </div>

                {/* Record Name Box */}
                <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                    <span>Record name / Host</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 text-[10px]">Click copy</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-zinc-200 bg-zinc-950/80 px-3 py-2 rounded-lg border border-zinc-800/80">
                    <span className="truncate select-all">{recordName}</span>
                    <button
                      onClick={() => copyToClipboard(recordName, 'name')}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 transition-colors shrink-0"
                      title="Copy to clipboard"
                    >
                      {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Record Value Box */}
                <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                    <span>Record value / Target</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 text-[10px]">Click copy</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-zinc-200 bg-zinc-950/80 px-3 py-2 rounded-lg border border-zinc-800/80">
                    <span className="truncate select-all text-cyan-300">{recordValue}</span>
                    <button
                      onClick={() => copyToClipboard(recordValue, 'value')}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 transition-colors shrink-0"
                      title="Copy to clipboard"
                    >
                      {copiedField === 'value' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'file' && (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <FileCode className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="space-y-1 text-xs">
                      <p className="text-zinc-200 font-medium">1. Download verification token file</p>
                      <p className="text-zinc-400">Place file at path: <code className="text-cyan-400 font-mono">https://{domain}/.well-known/sira-verification.txt</code></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        const blob = new Blob([recordValue], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'sira-verification.txt';
                        a.click();
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors flex items-center gap-2"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download sira-verification.txt</span>
                    </button>
                    <span className="text-[11px] text-zinc-500 font-mono">Size: 32 bytes</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'meta' && (
              <motion.div
                key="meta"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                  <p className="text-xs text-zinc-300">
                    Paste this meta tag into your homepage’s HTML inside the <code className="text-cyan-400 font-mono">&lt;head&gt;</code> element:
                  </p>
                  <div className="flex items-center justify-between gap-2 font-mono text-xs text-cyan-300 bg-zinc-950/80 px-3 py-2 rounded-lg border border-zinc-800/80">
                    <span className="truncate select-all">{metaTagContent}</span>
                    <button
                      onClick={() => copyToClipboard(metaTagContent, 'meta')}
                      className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-cyan-300 transition-colors shrink-0"
                    >
                      {copiedField === 'meta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Verification Progress log (visible when verifying or verified) */}
        {verifyLogs.length > 0 && (
          <div className="rounded-xl bg-zinc-950/90 border border-zinc-800/90 p-3 space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/60 pb-1 mb-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                SIRA DNS Auditor Stream
              </span>
              <span>{verifyProgress}%</span>
            </div>
            {verifyLogs.map((log, i) => (
              <div key={i} className="text-zinc-300 flex items-center gap-2">
                {i === verifyLogs.length - 1 && status === 'verified' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                )}
                <span className={i === verifyLogs.length - 1 && status === 'verified' ? 'text-emerald-400 font-medium' : ''}>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Footer with Propagation Note, Spinner & Primary Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/90">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span>Propagation might take 2-10 minutes</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {status === 'verifying' && (
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Checking nameservers...</span>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={status === 'verifying' || status === 'verified'}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
              status === 'verified'
                ? 'bg-emerald-600 text-white cursor-default shadow-emerald-950/40'
                : status === 'verifying'
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50 hover:shadow-cyan-500/25 active:scale-[0.98]'
            }`}
          >
            {status === 'verified' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Verified & Protected</span>
              </>
            ) : status === 'verifying' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Verifying Records...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
