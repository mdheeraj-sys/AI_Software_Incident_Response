import React, { useState } from "react";
import Avatar, { AvatarColor, AvatarShape } from "@/components/ui/components-primitives-avatar";
import AgentAvatar, { AgentStatus, AvatarSize as AgentAvatarSize } from "@/components/ui/agent-avatar";
import { 
  Shield, 
  Terminal, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Sliders, 
  Copy, 
  Check, 
  Radio, 
  Eye,
  Bot
} from "lucide-react";

interface AgentShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgentStatus?: (status: AgentStatus) => void;
}

export const AgentShowcaseModal: React.FC<AgentShowcaseModalProps> = ({
  isOpen,
  onClose,
  onSelectAgentStatus,
}) => {
  const [activeTab, setActiveTab] = useState<"agent" | "primitive" | "code">("agent");
  const [currentStatus, setCurrentStatus] = useState<AgentStatus>("threat_detected");
  const [selectedColor, setSelectedColor] = useState<AvatarColor>("cyan");
  const [selectedSize, setSelectedSize] = useState<AgentAvatarSize>("xl");
  const [selectedShape, setSelectedShape] = useState<AvatarShape>("circle");
  const [isBlinking, setIsBlinking] = useState<boolean>(true);
  const [showHudRing, setShowHudRing] = useState<boolean>(true);
  const [showScanline, setShowScanline] = useState<boolean>(true);
  const [showStatusBadge, setShowStatusBadge] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const STATUSES: { id: AgentStatus; label: string; icon: React.ElementType; color: string; desc: string }[] = [
    { id: "monitoring", label: "Monitoring", icon: Radio, color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30", desc: "Passive log drain analysis and baseline traffic monitoring." },
    { id: "investigating", label: "Investigating", icon: Terminal, color: "text-amber-400 border-amber-500/30 bg-amber-950/30", desc: "Active tool execution (rate limits, audit trail query, scanlines active)." },
    { id: "threat_detected", label: "Threat Detected", icon: AlertTriangle, color: "text-rose-400 border-rose-500/30 bg-rose-950/30", desc: "Attack correlated (SQLi / Brute Force) - rapid pulse & alert HUD." },
    { id: "mitigating", label: "Mitigating", icon: Zap, color: "text-purple-400 border-purple-500/30 bg-purple-950/30", desc: "Autonomous firewall rule proposal / traffic throttling underway." },
    { id: "secured", label: "Secured", icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/30", desc: "Remediation verified, audit hash chained, system returned to nominal." },
  ];

  const COLORS: AvatarColor[] = [
    "cyan", "blue", "yellow", "orange", "red", "green", "purple", "violet", "pink", "indigo", "lime", "turquoise"
  ];

  const handleCopyCode = () => {
    const code = `<AgentAvatar
  status="${currentStatus}"
  size="${selectedSize}"
  shape="${selectedShape}"
  showHudRing={${showHudRing}}
  showScanline={${showScanline}}
  showStatusBadge={${showStatusBadge}}
/>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0c0e12] border border-zinc-800 text-white shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight font-space text-white">
                  AI Agent Avatar System
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-900/40 border border-cyan-700/40 text-cyan-300">
                  v2.0 Modified
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-inter mt-0.5">
                shadcn/ui primitive component with cyber incident response modifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800/60 w-fit">
          <button
            onClick={() => setActiveTab("agent")}
            className={`px-4 py-2 rounded-lg text-xs font-space tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "agent"
                ? "bg-cyan-500 text-black font-semibold shadow-lg shadow-cyan-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Modified Agent Avatar
          </button>
          <button
            onClick={() => setActiveTab("primitive")}
            className={`px-4 py-2 rounded-lg text-xs font-space tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "primitive"
                ? "bg-white text-black font-semibold shadow-lg"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Base Avatar Primitive
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-4 py-2 rounded-lg text-xs font-space tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "code"
                ? "bg-zinc-700 text-white font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Integration & Code
          </button>
        </div>

        {/* Body Content */}
        {activeTab === "agent" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* Visualizer Stage */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 rounded-2xl bg-radial from-zinc-900/80 to-[#07090c] border border-zinc-800/80 relative min-h-[380px]">
              <div className="absolute top-4 left-4 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                INTERACTIVE PREVIEW // CLICK OR TAP ORB
              </div>

              {/* Render Agent Avatar */}
              <div className="my-auto py-6">
                <AgentAvatar
                  status={currentStatus}
                  size={selectedSize}
                  shape={selectedShape}
                  blinking={isBlinking}
                  showHudRing={showHudRing}
                  showScanline={showScanline}
                  showStatusBadge={showStatusBadge}
                  onClick={() => {
                    // Cycle status on click
                    const nextMap: Record<AgentStatus, AgentStatus> = {
                      monitoring: "investigating",
                      investigating: "threat_detected",
                      threat_detected: "mitigating",
                      mitigating: "secured",
                      secured: "monitoring",
                    };
                    const next = nextMap[currentStatus as AgentStatus] || "monitoring";
                    setCurrentStatus(next);
                    onSelectAgentStatus?.(next);
                  }}
                />
              </div>

              {/* Active Status Info banner */}
              <div className="w-full mt-4 p-3.5 rounded-xl bg-black/40 border border-zinc-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span className="text-zinc-300 font-mono">Current Incident State:</span>
                  <span className="font-bold text-white uppercase tracking-wider font-space">
                    {currentStatus.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied JSX!" : "Copy JSX"}
                </button>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Agent Status Switcher */}
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2.5 block">
                  Incident Response State
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {STATUSES.map((st) => {
                    const Icon = st.icon;
                    const isActive = currentStatus === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => {
                          setCurrentStatus(st.id);
                          onSelectAgentStatus?.(st.id);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isActive
                            ? `${st.color} border-current ring-1 ring-white/20`
                            : "border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold font-space uppercase">{st.label}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{st.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size & Shape Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
                    Size
                  </label>
                  <div className="flex gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    {(["sm", "md", "lg", "xl"] as AgentAvatarSize[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`flex-1 py-1 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                          selectedSize === s
                            ? "bg-zinc-700 text-white font-bold"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 block">
                    Shape
                  </label>
                  <div className="flex gap-1.5 p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    {(["circle", "squircle", "square"] as AvatarShape[]).map((sh) => (
                      <button
                        key={sh}
                        onClick={() => setSelectedShape(sh)}
                        className={`flex-1 py-1 rounded text-[11px] font-mono capitalize transition-colors cursor-pointer ${
                          selectedShape === sh
                            ? "bg-zinc-700 text-white font-bold"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {sh === "squircle" ? "Squir" : sh}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2.5">
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Concentric Cyber HUD Ring</span>
                  <input
                    type="checkbox"
                    checked={showHudRing}
                    onChange={(e) => setShowHudRing(e.target.checked)}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Laser Scanline Beam</span>
                  <input
                    type="checkbox"
                    checked={showScanline}
                    onChange={(e) => setShowScanline(e.target.checked)}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Status Pill Badge</span>
                  <input
                    type="checkbox"
                    checked={showStatusBadge}
                    onChange={(e) => setShowStatusBadge(e.target.checked)}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                  <span>Natural Blinking Animation</span>
                  <input
                    type="checkbox"
                    checked={isBlinking}
                    onChange={(e) => setIsBlinking(e.target.checked)}
                    className="accent-cyan-400"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Base Primitive */}
        {activeTab === "primitive" && (
          <div className="flex flex-col gap-6 mt-6">
            <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center min-h-[300px]">
              <div className="scale-125 mb-4">
                <Avatar
                  color={selectedColor}
                  size={(selectedSize === "xl" ? "lg" : selectedSize) as "sm" | "md" | "lg"}
                  shape={selectedShape}
                  blinking={isBlinking}
                />
              </div>
              <div className="text-xs font-mono text-zinc-400 mt-4">
                Exact unmodified primitive imported from <code className="text-cyan-400">@/components/ui/components-primitives-avatar</code>
              </div>
            </div>

            {/* Color Palette Grid */}
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-3 block">
                Choose Color Preset (12 Available)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`p-2 rounded-xl border text-xs font-mono capitalize transition-all cursor-pointer flex items-center gap-2 ${
                      selectedColor === c
                        ? "border-white bg-white/10 text-white font-bold"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="size-3 rounded-full bg-current" />
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Code & Integration */}
        {activeTab === "code" && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
              <div className="text-zinc-500 mb-2">// 1. Import either the base primitive or modified agent avatar</div>
              <pre className="text-emerald-400">
{`import Avatar from "@/components/ui/components-primitives-avatar";
import AgentAvatar from "@/components/ui/agent-avatar";`}
              </pre>

              <div className="text-zinc-500 mt-4 mb-2">// 2. Usage in incident response dashboard or hero</div>
              <pre className="text-cyan-300">
{`<AgentAvatar
  status="threat_detected"      // monitoring | investigating | threat_detected | mitigating | secured
  size="xl"                     // sm | md | lg | xl
  shape="circle"                // circle | squircle | square
  showHudRing={true}            // Rotating concentric aperture ticks
  showScanline={true}           // Cyber laser scanner beam
  showStatusBadge={true}        // Status badge pill with live ping dot
/>`}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
