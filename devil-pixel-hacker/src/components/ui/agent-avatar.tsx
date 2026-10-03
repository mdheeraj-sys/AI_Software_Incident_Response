"use client";

import React, { useId, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, AlertTriangle, Zap, Activity, CheckCircle2, Terminal } from "lucide-react";

export type AgentStatus =
  | "monitoring"
  | "investigating"
  | "threat_detected"
  | "mitigating"
  | "secured";

export type AvatarColor =
  | "blue"
  | "orange"
  | "red"
  | "green"
  | "purple"
  | "yellow"
  | "cyan"
  | "pink"
  | "indigo"
  | "lime"
  | "turquoise"
  | "violet";

export type AvatarSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "square" | "squircle";

export interface AgentAvatarProps {
  status?: AgentStatus;
  blinking?: boolean;
  color?: AvatarColor;
  size?: AvatarSize;
  shape?: AvatarShape;
  showHudRing?: boolean;
  showScanline?: boolean;
  showStatusBadge?: boolean;
  statusLabel?: string;
  interactive?: boolean;
  pulseGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

const BLINK_KEYFRAMES = `
@keyframes av-blink {
  0%, 88%, 100% { transform: scaleY(1); }
  93%            { transform: scaleY(0.07); }
  97%            { transform: scaleY(0.07); }
}

@keyframes av-scanline {
  0%   { transform: translateY(-100%); opacity: 0; }
  15%  { opacity: 0.85; }
  85%  { opacity: 0.85; }
  100% { transform: translateY(220%); opacity: 0; }
}

@keyframes av-hud-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes av-hud-reverse {
  from { transform: rotate(360deg); }
  to   { transform: rotate(0deg); }
}

@keyframes av-threat-pulse {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.4)); }
  50%      { transform: scale(1.04); filter: drop-shadow(0 0 26px rgba(239, 68, 68, 0.85)); }
}
`;

const STATUS_COLOR_MAP: Record<AgentStatus, { color: AvatarColor; label: string; icon: React.ElementType; accent: string }> = {
  monitoring: {
    color: "cyan",
    label: "SYS // MONITORING",
    icon: Activity,
    accent: "#0a8fb5",
  },
  investigating: {
    color: "yellow",
    label: "AI // INVESTIGATING",
    icon: Terminal,
    accent: "#ffc93a",
  },
  threat_detected: {
    color: "red",
    label: "ALERT // THREAT DETECTED",
    icon: AlertTriangle,
    accent: "#ff304f",
  },
  mitigating: {
    color: "purple",
    label: "SENTINEL // MITIGATING",
    icon: Zap,
    accent: "#a855f7",
  },
  secured: {
    color: "green",
    label: "SECURE // INCIDENT RESOLVED",
    icon: CheckCircle2,
    accent: "#2a9d5f",
  },
};

const PRESETS: Record<
  AvatarColor,
  {
    gradient: string;
    boxShadow: string;
    iris: string;
    shine: string;
    ringColor: string;
  }
> = {
  cyan: {
    gradient:
      "radial-gradient(circle at 50% 45%, #003d66 0%, #0a8fb5 40%, #5dd4ff 68%, #cdf5ff 100%)",
    boxShadow:
      "0 0 4px 0px rgba(10,143,181,.45), 0 0 20px 8px rgba(10,143,181,.25), inset 0 0 0 1px rgba(255,255,255,.1)",
    iris: "linear-gradient(135deg, #ffffff 0%, #d0f0ff 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.8) 0%, rgba(255,255,255,.15) 50%, transparent 70%)",
    ringColor: "rgba(10, 143, 181, 0.55)",
  },
  yellow: {
    gradient:
      "radial-gradient(circle at 50% 45%, #8a5500 0%, #d4a000 40%, #ffc93a 68%, #fff5cc 100%)",
    boxShadow:
      "0 0 4px 0px rgba(214,142,0,.45), 0 0 22px 8px rgba(214,142,0,.25), inset 0 0 0 1px rgba(255,255,255,.1)",
    iris: "linear-gradient(135deg, #ffffff 0%, #fff0a8 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.8) 0%, rgba(255,255,255,.15) 50%, transparent 70%)",
    ringColor: "rgba(214, 142, 0, 0.55)",
  },
  red: {
    gradient:
      "radial-gradient(circle at 50% 45%, #8a001a 0%, #d81e3a 40%, #ff526d 68%, #ffd6dc 100%)",
    boxShadow:
      "0 0 4px 0px rgba(239,68,68,.55), 0 0 28px 10px rgba(239,68,68,.35), inset 0 0 0 1px rgba(255,255,255,.15)",
    iris: "linear-gradient(135deg, #ffffff 0%, #ffd0d5 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.85) 0%, rgba(255,255,255,.18) 50%, transparent 70%)",
    ringColor: "rgba(239, 68, 68, 0.65)",
  },
  purple: {
    gradient:
      "radial-gradient(circle at 50% 45%, #4a0080 0%, #8b3fd1 40%, #c896ff 68%, #e8d4ff 100%)",
    boxShadow:
      "0 0 4px 0px rgba(110,46,224,.45), 0 0 22px 8px rgba(110,46,224,.25), inset 0 0 0 1px rgba(255,255,255,.1)",
    iris: "linear-gradient(135deg, #ffffff 0%, #e0c9ff 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.8) 0%, rgba(255,255,255,.15) 50%, transparent 70%)",
    ringColor: "rgba(139, 63, 209, 0.55)",
  },
  green: {
    gradient:
      "radial-gradient(circle at 50% 45%, #0d6632 0%, #2a9d5f 40%, #6dd187 68%, #d1fadd 100%)",
    boxShadow:
      "0 0 4px 0px rgba(12,168,82,.45), 0 0 22px 8px rgba(12,168,82,.25), inset 0 0 0 1px rgba(255,255,255,.1)",
    iris: "linear-gradient(135deg, #ffffff 0%, #c5f5d8 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.8) 0%, rgba(255,255,255,.15) 50%, transparent 70%)",
    ringColor: "rgba(42, 157, 95, 0.55)",
  },
  blue: {
    gradient:
      "radial-gradient(circle at 50% 45%, #0d4d9a 0%, #3d7dd8 40%, #6fb3ff 68%, #e0eeff 100%)",
    boxShadow:
      "0 0 4px 0px rgba(20,102,216,.35), 0 0 16px 6px rgba(20,102,216,.18), inset 0 0 0 1px rgba(255,255,255,.05)",
    iris: "linear-gradient(135deg, #ffffff 0%, #d4ecff 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)",
    ringColor: "rgba(20, 102, 216, 0.45)",
  },
  orange: {
    gradient:
      "radial-gradient(circle at 50% 45%, #a63e10 0%, #e27a2a 40%, #ffb46a 68%, #ffe8cc 100%)",
    boxShadow:
      "0 0 4px 0px rgba(232,100,0,.35), 0 0 16px 6px rgba(232,100,0,.18), inset 0 0 0 1px rgba(255,255,255,.05)",
    iris: "linear-gradient(135deg, #ffffff 0%, #ffd9b8 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)",
    ringColor: "rgba(232, 100, 0, 0.45)",
  },
  pink: {
    gradient:
      "radial-gradient(circle at 50% 45%, #7a0055 0%, #d63384 40%, #ff6bb3 68%, #ffe5f5 100%)",
    boxShadow:
      "0 0 4px 0px rgba(214,51,132,.35), 0 0 16px 6px rgba(214,51,132,.18), inset 0 0 0 1px rgba(255,255,255,.05)",
    iris: "linear-gradient(135deg, #ffffff 0%, #ffd6ed 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)",
    ringColor: "rgba(214, 51, 132, 0.45)",
  },
  indigo: {
    gradient:
      "radial-gradient(circle at 50% 45%, #2d157a 0%, #4f46e5 40%, #8b7eff 68%, #ddd6ff 100%)",
    boxShadow:
      "0 0 4px 0px rgba(79,70,229,.35), 0 0 16px 6px rgba(79,70,229,.18), inset 0 0 0 1px rgba(255,255,255,.05)",
    iris: "linear-gradient(135deg, #ffffff 0%, #e0d9ff 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)",
    ringColor: "rgba(79, 70, 229, 0.45)",
  },
  lime: {
    gradient:
      "radial-gradient(circle at 50% 45%, #4a5910 0%, #84cc16 40%, #bef264 68%, #ecfccf 100%)",
    boxShadow:
      "0 0 4px 0px rgba(132,204,22,.35), 0 0 16px 6px rgba(132,204,22,.18), inset 0 0 0 1px rgba(255,255,255,.05)",
    iris: "linear-gradient(135deg, #ffffff 0%, #f7fee8 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)",
    ringColor: "rgba(132, 204, 22, 0.45)",
  },
  turquoise: {
    gradient:
      "radial-gradient(circle at 50% 45%, #1a5555 0%, #0d9488 40%, #2dd4bf 68%, #ccfbf1 100%)",
    boxShadow:
      "0 0 4px 0px rgba(13,148,136,.35), 0 0 16px 6px rgba(13,148,136,.18), inset 0 0 0 1px rgba(255,255,255,.05)",
    iris: "linear-gradient(135deg, #ffffff 0%, #c0fdf5 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)",
    ringColor: "rgba(13, 148, 136, 0.45)",
  },
  violet: {
    gradient:
      "radial-gradient(circle at 50% 45%, #4a2a7a 0%, #a855f7 40%, #d8b4fe 68%, #f3e8ff 100%)",
    boxShadow:
      "0 0 4px 0px rgba(168,85,247,.35), 0 0 16px 6px rgba(168,85,247,.18), inset 0 0 0 1px rgba(255,255,255,.05)",
    iris: "linear-gradient(135deg, #ffffff 0%, #ede9fe 100%)",
    shine:
      "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)",
    ringColor: "rgba(168, 85, 247, 0.45)",
  },
};

const SIZE: Record<
  AvatarSize,
  {
    orb: string;
    eye: string;
    eyeGap: string;
    eyeY: string;
    hudRadius: number;
    wrapper: string;
  }
> = {
  sm: {
    orb: "size-8",
    eye: "w-1 h-1.5",
    eyeGap: "gap-1.5",
    eyeY: "-translate-y-0.5",
    hudRadius: 22,
    wrapper: "size-12",
  },
  md: {
    orb: "size-14",
    eye: "w-2 h-3",
    eyeGap: "gap-3",
    eyeY: "-translate-y-0.5",
    hudRadius: 36,
    wrapper: "size-20",
  },
  lg: {
    orb: "size-20",
    eye: "w-2.5 h-4",
    eyeGap: "gap-4",
    eyeY: "-translate-y-1",
    hudRadius: 52,
    wrapper: "size-28",
  },
  xl: {
    orb: "size-32",
    eye: "w-4 h-6",
    eyeGap: "gap-6",
    eyeY: "-translate-y-1.5",
    hudRadius: 80,
    wrapper: "size-44",
  },
  "2xl": {
    orb: "size-48",
    eye: "w-6 h-9",
    eyeGap: "gap-8",
    eyeY: "-translate-y-2",
    hudRadius: 120,
    wrapper: "size-64",
  },
};

const SHAPE_RADIUS: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-[0%]",
  squircle: "rounded-[40%]",
};

interface EyeProps {
  blinking: boolean;
  delayMs?: number;
  irisGradient: string;
  sizeClass: string;
  isThreat?: boolean;
}

function Eye({ blinking, delayMs = 0, irisGradient, sizeClass, isThreat }: EyeProps) {
  return (
    <div
      className={["rounded-full transition-all duration-300", sizeClass].filter(Boolean).join(" ")}
      style={{
        background: irisGradient,
        boxShadow: isThreat ? "0 0 6px rgba(255, 255, 255, 0.95)" : "none",
        ...(blinking
          ? { animation: `av-blink ${isThreat ? "1.8s" : "3.6s"} ease-in-out ${delayMs}ms infinite` }
          : {}),
      }}
    />
  );
}

export function AgentAvatar({
  status,
  blinking = true,
  color,
  size = "md",
  shape = "circle",
  showHudRing = true,
  showScanline = true,
  showStatusBadge = false,
  statusLabel,
  interactive = true,
  pulseGlow = true,
  className = "",
  onClick,
}: AgentAvatarProps) {
  const uid = useId();
  const noiseId = `av-n${uid.replace(/\W/g, "")}`;
  const grainId = `av-g${uid.replace(/\W/g, "")}`;

  // If status is provided, resolve color and label from status
  const currentStatusInfo = status ? STATUS_COLOR_MAP[status] : undefined;
  const resolvedColor = color ?? currentStatusInfo?.color ?? "cyan";
  const preset = PRESETS[resolvedColor] ?? PRESETS.cyan;
  const dims = SIZE[size] ?? SIZE.md;
  const isThreat = status === "threat_detected";
  const isInvestigating = status === "investigating";

  const StatusIcon = currentStatusInfo?.icon ?? Shield;
  const displayLabel = statusLabel ?? currentStatusInfo?.label;

  return (
    <div className="inline-flex flex-col items-center select-none">
      <style>{BLINK_KEYFRAMES}</style>

      {/* Main Avatar Container with optional HUD Rings */}
      <div
        className={["relative flex items-center justify-center", dims.wrapper].join(" ")}
        onClick={onClick}
      >
        {/* Outer Rotating HUD Concentric Ring */}
        {showHudRing && (
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70"
            style={{
              animation: isThreat
                ? "av-hud-rotate 4s linear infinite"
                : isInvestigating
                ? "av-hud-rotate 7s linear infinite"
                : "av-hud-rotate 16s linear infinite",
            }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer tick ring */}
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke={preset.ringColor}
                strokeWidth="1"
                strokeDasharray="4 6 12 6"
              />
              {/* Aperture marks */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={preset.ringColor}
                strokeWidth="0.75"
                strokeDasharray="2 18"
                opacity="0.6"
              />
            </svg>
          </div>
        )}

        {/* Counter-rotating Inner Micro-HUD ring */}
        {showHudRing && (
          <div
            className="absolute inset-1 pointer-events-none flex items-center justify-center opacity-50"
            style={{
              animation: isThreat
                ? "av-hud-reverse 3s linear infinite"
                : "av-hud-reverse 12s linear infinite",
            }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="38"
                stroke={preset.ringColor}
                strokeWidth="0.8"
                strokeDasharray="1 8 4 8"
              />
            </svg>
          </div>
        )}

        {/* The Animated Eye Orb Core */}
        <motion.div
          aria-label="Agent AI Avatar"
          role="img"
          whileHover={interactive ? { scale: 1.06 } : undefined}
          whileTap={interactive ? { scaleX: 1.15, scaleY: 1.3 } : undefined}
          transition={{
            type: "tween",
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          className={[
            "relative flex items-center justify-center overflow-hidden transition-shadow duration-500",
            interactive ? "cursor-pointer" : "cursor-default",
            dims.orb,
            SHAPE_RADIUS[shape],
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            background: preset.gradient,
            boxShadow: preset.boxShadow,
            animation: isThreat
              ? "av-threat-pulse 1.2s ease-in-out infinite"
              : pulseGlow
              ? "none"
              : "none",
          }}
        >
          {/* Fractal Noise Turbulence Filter */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id={noiseId} x="0%" y="0%" width="100%" height="100%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.72"
                  numOctaves="4"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
          </svg>

          {/* Micro Grain Texture */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-overlay"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id={grainId} x="0%" y="0%" width="100%" height="100%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="3.2"
                  numOctaves="1"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter={`url(#${grainId})`} />
          </svg>

          {/* Specular Shine Overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: preset.shine }}
          />

          {/* Vignette Shadow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 blur-xs"
            style={{
              background:
                "radial-gradient(circle at 62% 68%, rgba(0,0,0,0.22) 0%, transparent 55%)",
            }}
          />

          {/* Cyber Laser Scanline Beam (Investigation / Analysis) */}
          {(showScanline || isInvestigating) && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 h-[2px] bg-white/70 shadow-[0_0_8px_#ffffff]"
              style={{
                animation: `av-scanline ${isThreat ? "1.2s" : "2.4s"} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              }}
            />
          )}

          {/* Blinking Eyes */}
          <div
            className={[
              "relative z-10 flex items-center transition-transform duration-200",
              dims.eyeGap,
              dims.eyeY,
            ].join(" ")}
          >
            <Eye
              blinking={blinking}
              delayMs={0}
              irisGradient={preset.iris}
              sizeClass={dims.eye}
              isThreat={isThreat}
            />
            <Eye
              blinking={blinking}
              delayMs={isThreat ? 30 : 60}
              irisGradient={preset.iris}
              sizeClass={dims.eye}
              isThreat={isThreat}
            />
          </div>
        </motion.div>
      </div>

      {/* Optional Status Pill / Cyber Badge */}
      {showStatusBadge && displayLabel && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-black/60 backdrop-blur-md text-[10px] tracking-widest font-mono uppercase text-zinc-300 shadow-lg"
        >
          <span
            className="size-1.5 rounded-full animate-ping"
            style={{ backgroundColor: preset.ringColor }}
          />
          <StatusIcon className="size-3 text-zinc-400" />
          <span className="font-semibold text-white/90">{displayLabel}</span>
        </motion.div>
      )}
    </div>
  );
}

export default AgentAvatar;
