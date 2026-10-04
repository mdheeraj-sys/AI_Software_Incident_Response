"use client";

import { useEffect, useRef, useCallback, useTransition, useState } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Globe,
    ShieldAlert,
    ShieldCheck,
    AlertTriangle,
    Activity,
    FileCode2,
    Paperclip,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
    ArrowUpRight,
    Bot,
    User,
    RefreshCw,
    Server,
    Zap,
    Lock,
    Radio,
    Terminal,
    History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { DomainResolverCard } from "@/components/sira/DomainResolverCard";
import { DnsPropagationCard } from "@/components/sira/DnsPropagationCard";
import { IncidentTriageCard } from "@/components/sira/IncidentTriageCard";
import { LogAnalyzerCard } from "@/components/sira/LogAnalyzerCard";
import { WebsiteAuditInspector } from "@/components/sira/WebsiteAuditInspector";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export interface CommandSuggestion {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    return (
      <div className={cn(
        "relative",
        containerClassName
      )}>
        <textarea
          className={cn(
            "flex min-h-[56px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {showRing && isFocused && (
          <motion.span 
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-cyan-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div 
            className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-cyan-500 rounded-full"
            style={{
              animation: 'none',
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export interface ChatMessage {
    id: string;
    sender: 'user' | 'sira';
    text: string;
    timestamp: string;
    widgetType?: 'domain_resolver' | 'incident_triage' | 'dns_propagation' | 'log_analyzer' | 'website_audit' | null;
    widgetProps?: Record<string, any>;
}

interface AnimatedAIChatProps {
    hackerIp?: string;
    onOpenSoc?: () => void;
    activeLogo?: string;
    onSelectLogo?: (logo: string) => void;
    onOpenTimeline?: () => void;
}

export function AnimatedAIChat({
    hackerIp = "106.192.2.103",
    onOpenSoc,
    activeLogo = "/sira-logo-1.jpg",
    onSelectLogo,
    onOpenTimeline
}: AnimatedAIChatProps) {
    const [value, setValue] = useState("");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [recentCommand, setRecentCommand] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 56,
        maxHeight: 180,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef<HTMLDivElement>(null);
    const chatBottomRef = useRef<HTMLDivElement>(null);

    // SIRA Chat History & Transition State
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const hasStarted = messages.length > 0;

    const logoOptions = [
        { id: '/sira-logo-1.jpg', name: 'Sentinel Mark' },
        { id: '/sira-logo-2.jpg', name: 'Faceted Crest' },
        { id: '/sira-logo-3.jpg', name: 'Neural Shield' },
    ];

    // Uniform, premium SIRA-specific command palette suggestions
    const commandSuggestions: CommandSuggestion[] = [
        { 
            icon: <Globe className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />, 
            label: "Verify Domain", 
            description: "Add and verify vishnukanchipati.me with SIRA Resolver", 
            prefix: "/verify" 
        },
        { 
            icon: <ShieldAlert className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />, 
            label: "Investigate Incident", 
            description: "Forensic analysis of active credential and SQL injection anomalies", 
            prefix: "/investigate" 
        },
        { 
            icon: <History className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />, 
            label: "Incident Timeline & Story", 
            description: "What error occurred and how SIRA solved it in plain English", 
            prefix: "/timeline" 
        },
        { 
            icon: <Terminal className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />, 
            label: "Analyze Logs", 
            description: "Drain 3.0 template discovery and real-time log stream", 
            prefix: "/logs" 
        },
        { 
            icon: <Radio className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />, 
            label: "Check DNS Propagation", 
            description: "Probe multi-region Anycast resolvers and latencies", 
            prefix: "/dns" 
        },
    ];

    // Scroll chat bottom on new messages
    useEffect(() => {
        if (hasStarted) {
            chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping, hasStarted]);

    // Handle command palette trigger
    useEffect(() => {
        if (value.startsWith('/') && !value.includes(' ')) {
            setShowCommandPalette(true);
            
            const matchingSuggestionIndex = commandSuggestions.findIndex(
                (cmd) => cmd.prefix.startsWith(value)
            );
            
            if (matchingSuggestionIndex >= 0) {
                setActiveSuggestion(matchingSuggestionIndex);
            } else {
                setActiveSuggestion(-1);
            }
        } else {
            setShowCommandPalette(false);
        }
    }, [value]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const commandButton = document.querySelector('[data-command-button]');
            
            if (commandPaletteRef.current && 
                !commandPaletteRef.current.contains(target) && 
                !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showCommandPalette) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev < commandSuggestions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => 
                    prev > 0 ? prev - 1 : commandSuggestions.length - 1
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                    
                    setRecentCommand(selectedCommand.label);
                    setTimeout(() => setRecentCommand(null), 3500);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleSendMessage = (overrideText?: string) => {
        const text = (overrideText || value).trim();
        if (!text) return;

        const userMsg: ChatMessage = {
            id: `user_${Date.now()}`,
            sender: 'user',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setValue("");
        adjustHeight(true);

        startTransition(() => {
            setIsTyping(true);

            setTimeout(() => {
                const lower = text.toLowerCase();
                let widgetType: ChatMessage['widgetType'] = null;
                let replyText = "";
                let widgetProps: Record<string, any> = {};

                if (lower.startsWith('check') || lower.includes('check vishnukanchipati.me') || lower.includes('audit')) {
                    widgetType = 'website_audit';
                    const match = lower.match(/(?:check|inspect|audit)\s+([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                    const detectedDomain = match?.[1] || 'vishnukanchipati.me';
                    replyText = `Loading target **${detectedDomain}** in live SIRA Browser Inspector. Conducting multi-stage full-stack inspection across DNS, DOM, API endpoints, and the PostgreSQL database. Attack surfaces and defensive solutions mapped below:`;
                    widgetProps = {
                        domain: detectedDomain
                    };
                } else if (lower.startsWith('/verify') || lower.includes('domain') || lower.includes('verify') || lower.includes('vishnukanchipati.me')) {
                    widgetType = 'domain_resolver';
                    const detectedDomain = lower.includes('vishnukanchipati.me') ? 'vishnukanchipati.me' : 'vishnukanchipati.me';
                    replyText = `Initialized domain security verification for **${detectedDomain}**. Below is the SIRA Domain & Infrastructure Resolver. You can verify via DNS TXT record or use 1-click automatic integration with Vercel or Cloudflare:`;
                    widgetProps = {
                        domain: detectedDomain,
                        initialProvider: 'Namecheap'
                    };
                } else if (lower.startsWith('/investigate') || lower.includes('incident') || lower.includes('triage') || lower.includes('attack') || lower.includes('brute') || lower.includes('sql')) {
                    widgetType = 'incident_triage';
                    replyText = `Forensic analysis complete. Drain 3.0 log clustering and Isolation Forest anomaly detection identified an active high-velocity credential attack from IP **${hackerIp}**. Gated mitigation requires operator approval:`;
                    widgetProps = {
                        incidentId: 'inc_65f62396',
                        attackType: 'Credential Brute Force',
                        severity: 'high',
                        sourceIp: hackerIp,
                        targetEndpoint: '/login'
                    };
                } else if (lower.startsWith('/dns') || lower.includes('dns') || lower.includes('propagation')) {
                    widgetType = 'dns_propagation';
                    replyText = `Probing authoritative DNS nameservers across 6 global Point-of-Presence (PoP) regions for **vishnukanchipati.me**. Multi-region status:`;
                    widgetProps = {
                        domain: 'vishnukanchipati.me'
                    };
                } else if (lower.startsWith('/timeline') || lower.includes('timeline') || lower.includes('story') || lower.includes('what happened')) {
                    replyText = `Here is the SIRA Incident Timeline story in simple English:

• **What Error Occurred:** An attacker flooded /login with 48 password guesses in 2 seconds (Credential Brute Force).
• **What SIRA AI Detected:** Drain 3.0 parser flagged a 4.2x spike in failed logins (96.8% anomaly confidence).
• **What SIRA Solved:** SIRA isolated IP **${hackerIp}** at the firewall in 0.8 seconds. Attacker was blocked, 0 accounts compromised, and student portal stayed 100% healthy!

You can explore the full interactive Story Timeline & Log Explainer using the **Timeline & Logs** tab in the top navigation bar.`;
                } else if (lower.startsWith('/logs') || lower.includes('log') || lower.includes('drain') || lower.includes('telemetry')) {
                    widgetType = 'log_analyzer';
                    replyText = `Inspecting live telemetry streams from the Target Victim Application. Drain 3.0 tree parser has categorized high-volume logs into structured templates with EWMA anomaly bounds:`;
                    widgetProps = {
                        initialService: 'auth'
                    };
                } else {
                    replyText = `I am SIRA, your autonomous AI Software Incident Response & Infrastructure Protection Agent. I monitor live telemetry, verify domains, triage cyber incidents with bounded forensic tools, and safely execute mitigations. What would you like to inspect or protect today?`;
                }

                const siraMsg: ChatMessage = {
                    id: `sira_${Date.now()}`,
                    sender: 'sira',
                    text: replyText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    widgetType,
                    widgetProps
                };

                setMessages(prev => [...prev, siraMsg]);
                setIsTyping(false);
            }, 800);
        });
    };

    const handleAttachFile = () => {
        const mockFileName = `telemetry-log-${Math.floor(Math.random() * 1000)}.json`;
        setAttachments(prev => [...prev, mockFileName]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    
    const selectCommandSuggestion = (index: number) => {
        const selectedCommand = commandSuggestions[index];
        handleSendMessage(selectedCommand.prefix);
        setShowCommandPalette(false);
        
        setRecentCommand(selectedCommand.label);
        setTimeout(() => setRecentCommand(null), 2000);
    };

    return (
        <div className="min-h-screen flex flex-col w-full items-center justify-between bg-[#07090e] text-white p-4 sm:p-6 relative overflow-hidden font-inter select-none">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
                <div className="tech-grid-overlay absolute inset-0 opacity-40"></div>
            </div>

            {/* Mouse-following dynamic gradient light */}
            {inputFocused && (
                <motion.div 
                    className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.03] bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 blur-[96px]"
                    animate={{
                        x: mousePosition.x - 400,
                        y: mousePosition.y - 400,
                    }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 150,
                        mass: 0.5,
                    }}
                />
            )}

            {/* Main Content Area */}
            <div className="w-full max-w-4xl mx-auto relative flex-1 flex flex-col justify-center z-10">
                {/* ======================================================== */}
                {/* 1. INITIAL CENTERED HERO (Fades out when chat starts)   */}
                {/* ======================================================== */}
                {!hasStarted && (
                    <motion.div 
                        className="relative z-10 space-y-8 my-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {/* SIRA Core Logo Emblem & Variation Picker */}
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="inline-block relative group"
                            >
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-2xl shadow-cyan-500/25 ring-2 ring-cyan-500/20 bg-zinc-950 mx-auto">
                                    <img 
                                        src={activeLogo} 
                                        alt="SIRA Logo" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    />
                                </div>
                                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                                </span>
                            </motion.div>

                            {/* Logo Variation Selector Chips */}
                            {onSelectLogo && (
                                <div className="flex items-center justify-center gap-2 pt-1">
                                    {logoOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => onSelectLogo(opt.id)}
                                            className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                                                activeLogo === opt.id
                                                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20 font-semibold'
                                                    : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                                            }`}
                                        >
                                            {opt.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="inline-block"
                            >
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white pb-1">
                                    How can <span className="text-cyan-400">SIRA</span> help today?
                                </h1>
                                <motion.div 
                                    className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                />
                            </motion.div>
                            <motion.p 
                                className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Autonomous AI incident response with Drain 3.0 parsing, bounded forensic triage, and domain protection.
                            </motion.p>
                        </div>

                        {/* Centered Floating Input Card */}
                        <motion.div 
                            className="relative backdrop-blur-2xl bg-zinc-950/85 rounded-2xl border border-zinc-800 shadow-2xl shadow-cyan-950/30 group hover:border-zinc-700 transition-colors"
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <AnimatePresence>
                                {showCommandPalette && (
                                    <motion.div 
                                        ref={commandPaletteRef}
                                        className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-zinc-950/95 rounded-xl z-50 shadow-2xl border border-zinc-800 overflow-hidden"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div className="py-1">
                                            {commandSuggestions.map((suggestion, index) => (
                                                <motion.div
                                                    key={suggestion.prefix}
                                                    className={cn(
                                                        "flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer",
                                                        activeSuggestion === index 
                                                            ? "bg-zinc-800/90 text-white" 
                                                            : "text-zinc-400 hover:bg-zinc-900/60"
                                                    )}
                                                    onClick={() => selectCommandSuggestion(index)}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 flex items-center justify-center">
                                                            {suggestion.icon}
                                                        </div>
                                                        <div className="font-medium text-zinc-200">{suggestion.label}</div>
                                                        <div className="text-zinc-500 text-[11px] hidden sm:inline">
                                                            — {suggestion.description}
                                                        </div>
                                                    </div>
                                                    <div className="text-cyan-400 font-mono text-[11px]">
                                                        {suggestion.prefix}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="p-4">
                                <Textarea
                                    ref={textareaRef}
                                    value={value}
                                    onChange={(e) => {
                                        setValue(e.target.value);
                                        adjustHeight();
                                    }}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => setInputFocused(true)}
                                    onBlur={() => setInputFocused(false)}
                                    placeholder="Ask SIRA to verify a domain, investigate an incident, or type / for commands..."
                                    containerClassName="w-full"
                                    className={cn(
                                        "w-full px-2 py-1",
                                        "resize-none",
                                        "bg-transparent",
                                        "border-none",
                                        "text-zinc-100 text-sm",
                                        "focus:outline-none",
                                        "placeholder:text-zinc-500",
                                        "min-h-[56px]"
                                    )}
                                    style={{
                                        overflow: "hidden",
                                    }}
                                    showRing={false}
                                />
                            </div>

                            <AnimatePresence>
                                {attachments.length > 0 && (
                                    <motion.div 
                                        className="px-4 pb-3 flex gap-2 flex-wrap"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        {attachments.map((file, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-center gap-2 text-xs bg-zinc-900 border border-zinc-800 py-1.5 px-3 rounded-lg text-zinc-300"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                            >
                                                <span>{file}</span>
                                                <button 
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-zinc-500 hover:text-white transition-colors"
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="p-3.5 border-t border-zinc-800/80 flex items-center justify-between gap-4 bg-zinc-950/60 rounded-b-2xl">
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        type="button"
                                        onClick={handleAttachFile}
                                        whileTap={{ scale: 0.94 }}
                                        className="p-2 text-zinc-400 hover:text-cyan-400 rounded-lg transition-colors hover:bg-zinc-900"
                                        title="Attach Log File"
                                    >
                                        <Paperclip className="w-4 h-4" strokeWidth={1.75} />
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        data-command-button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCommandPalette(prev => !prev);
                                        }}
                                        whileTap={{ scale: 0.94 }}
                                        className={cn(
                                            "p-2 text-zinc-400 hover:text-cyan-400 rounded-lg transition-colors hover:bg-zinc-900",
                                            showCommandPalette && "bg-zinc-800 text-cyan-400"
                                        )}
                                        title="Command Palette"
                                    >
                                        <Command className="w-4 h-4" strokeWidth={1.75} />
                                    </motion.button>
                                </div>
                                
                                <motion.button
                                    type="button"
                                    onClick={() => handleSendMessage()}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isTyping || !value.trim()}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-lg",
                                        value.trim()
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50"
                                            : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
                                    )}
                                >
                                    {isTyping ? (
                                        <LoaderIcon className="w-4 h-4 animate-spin text-cyan-400" />
                                    ) : (
                                        <SendIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                                    )}
                                    <span>Send</span>
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Uniform Suggested Action Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {commandSuggestions.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion.prefix}
                                    onClick={() => selectCommandSuggestion(index)}
                                    className="group flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900/90 hover:border-zinc-700 text-left transition-all shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                >
                                    <div className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/90 text-cyan-400 flex items-center justify-center shrink-0 group-hover:border-cyan-500/40 group-hover:bg-zinc-800 transition-colors">
                                        {suggestion.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                                {suggestion.label}
                                            </span>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" strokeWidth={1.75} />
                                        </div>
                                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                            {suggestion.description}
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ======================================================== */}
                {/* 2. ACTIVE SCROLLING CHAT STREAM WITH RICH CARDS         */}
                {/* ======================================================== */}
                {hasStarted && (
                    <div className="flex-1 overflow-y-auto py-6 space-y-6 terminal-scroll pr-1 max-h-[calc(100vh-200px)]">
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'sira' && (
                                    <div className="w-8 h-8 rounded-xl overflow-hidden border border-cyan-400/40 shadow-md shadow-cyan-950/50 bg-zinc-900 shrink-0">
                                        <img 
                                            src={activeLogo} 
                                            alt="SIRA Sentinel" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                )}

                                <div className={`space-y-3 max-w-2xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    {/* Text message bubble */}
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed backdrop-blur-md ${
                                            msg.sender === 'user'
                                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/40 rounded-tr-sm ml-auto'
                                                : 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 rounded-tl-sm'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                        <span className="text-[10px] text-zinc-400/80 block mt-1 text-right font-mono">
                                            {msg.timestamp}
                                        </span>
                                    </div>

                                    {/* Rich Custom Interactive Cards Embedded in Chat */}
                                    {msg.widgetType === 'website_audit' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-full"
                                        >
                                            <WebsiteAuditInspector
                                                targetDomain={msg.widgetProps?.domain || 'vishnukanchipati.me'}
                                            />
                                        </motion.div>
                                    )}

                                    {msg.widgetType === 'domain_resolver' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <DomainResolverCard
                                                domain={msg.widgetProps?.domain || 'vishnukanchipati.me'}
                                                initialProvider={msg.widgetProps?.initialProvider || 'Namecheap'}
                                            />
                                        </motion.div>
                                    )}

                                    {msg.widgetType === 'incident_triage' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <IncidentTriageCard
                                                incidentId={msg.widgetProps?.incidentId}
                                                attackType={msg.widgetProps?.attackType}
                                                severity={msg.widgetProps?.severity}
                                                sourceIp={msg.widgetProps?.sourceIp}
                                                targetEndpoint={msg.widgetProps?.targetEndpoint}
                                            />
                                        </motion.div>
                                    )}

                                    {msg.widgetType === 'dns_propagation' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <DnsPropagationCard domain={msg.widgetProps?.domain} />
                                        </motion.div>
                                    )}

                                    {msg.widgetType === 'log_analyzer' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <LogAnalyzerCard initialService={msg.widgetProps?.initialService} />
                                        </motion.div>
                                    )}
                                </div>

                                {msg.sender === 'user' && (
                                    <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4" strokeWidth={1.75} />
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {/* SIRA Thinking / Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-xl overflow-hidden border border-cyan-400/40 shadow-sm bg-zinc-900 shrink-0">
                                    <img 
                                        src={activeLogo} 
                                        alt="SIRA" 
                                        className="w-full h-full object-cover animate-pulse" 
                                    />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400 flex items-center gap-2">
                                    <span>SIRA is inspecting infrastructure & telemetry</span>
                                    <TypingDots />
                                </div>
                            </motion.div>
                        )}

                        <div ref={chatBottomRef} />
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* 3. DOCKED BOTTOM INPUT BAR (When Chat is Active)         */}
            {/* ======================================================== */}
            {hasStarted && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-4xl mx-auto pt-2 pb-4 z-20"
                >
                    {/* Quick action chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 terminal-scroll text-xs">
                        <span className="text-zinc-500 text-[11px] font-mono shrink-0">Quick Commands:</span>
                        <button
                            onClick={() => handleSendMessage('/verify')}
                            className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 transition-colors shrink-0 flex items-center gap-1.5"
                        >
                            <Globe className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
                            <span>/verify domain</span>
                        </button>
                        <button
                            onClick={() => handleSendMessage('/investigate')}
                            className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 transition-colors shrink-0 flex items-center gap-1.5"
                        >
                            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
                            <span>/investigate</span>
                        </button>
                        <button
                            onClick={() => handleSendMessage('/dns')}
                            className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 transition-colors shrink-0 flex items-center gap-1.5"
                        >
                            <Radio className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
                            <span>/dns propagation</span>
                        </button>
                        <button
                            onClick={() => handleSendMessage('/logs')}
                            className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-300 transition-colors shrink-0 flex items-center gap-1.5"
                        >
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
                            <span>/logs stream</span>
                        </button>
                    </div>

                    {/* Bottom input container */}
                    <div className="relative backdrop-blur-2xl bg-zinc-950/90 rounded-2xl border border-zinc-800 shadow-2xl shadow-cyan-950/20 group focus-within:border-cyan-500/70 transition-colors">
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div 
                                    ref={commandPaletteRef}
                                    className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-zinc-950/95 rounded-xl z-50 shadow-2xl border border-zinc-800 overflow-hidden"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <div className="py-1">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer",
                                                    activeSuggestion === index 
                                                        ? "bg-zinc-800/90 text-white" 
                                                        : "text-zinc-400 hover:bg-zinc-900/60"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-5 h-5 flex items-center justify-center">
                                                        {suggestion.icon}
                                                    </div>
                                                    <div className="font-medium text-zinc-200">{suggestion.label}</div>
                                                    <div className="text-zinc-500 text-[11px] hidden sm:inline">
                                                        — {suggestion.description}
                                                    </div>
                                                </div>
                                                <div className="text-cyan-400 font-mono text-[11px]">
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-3">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    adjustHeight();
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder="Message SIRA or type / for incident commands..."
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-2 py-1",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-zinc-100 text-sm",
                                    "focus:outline-none",
                                    "placeholder:text-zinc-500",
                                    "min-h-[48px]"
                                )}
                                style={{
                                    overflow: "hidden",
                                }}
                                showRing={false}
                            />
                        </div>

                        <div className="px-3 pb-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleAttachFile}
                                    className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded-lg transition-colors hover:bg-zinc-900"
                                    title="Attach File"
                                >
                                    <Paperclip className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                                <button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded-lg transition-colors hover:bg-zinc-900"
                                    title="Commands (/)"
                                >
                                    <Command className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                            </div>

                            <motion.button
                                type="button"
                                onClick={() => handleSendMessage()}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-lg",
                                    value.trim()
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-950/50"
                                        : "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800"
                                )}
                            >
                                {isTyping ? (
                                    <LoaderIcon className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                                ) : (
                                    <SendIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
                                )}
                                <span>Send</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* SIRA Ambient Status Pill */}
            <div className="fixed top-4 right-4 z-30 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/25 bg-zinc-950/80 backdrop-blur-md text-[11px] font-mono text-zinc-400">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span>SIRA SENTINEL ACTIVE</span>
            </div>
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center ml-1">
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1.5 h-1.5 bg-cyan-400 rounded-full mx-0.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                        opacity: [0.3, 0.9, 0.3],
                        scale: [0.85, 1.1, 0.85]
                    }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: dot * 0.15,
                        ease: "easeInOut",
                    }}
                    style={{
                        boxShadow: "0 0 4px rgba(6, 182, 212, 0.4)"
                    }}
                />
            ))}
        </div>
    );
}
