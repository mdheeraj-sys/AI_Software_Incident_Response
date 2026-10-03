/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface CyberSiphonWiresProps {
  isActive: boolean;
  interceptAtAgent?: boolean;
  onDeployAgent?: () => void;
  onExtractionComplete?: () => void;
}

interface SiphonParticle {
  id: number;
  wireIndex: number;
  progress: number;
  speed: number;
  label: string;
  color: string;
}

export const CyberSiphonWires: React.FC<CyberSiphonWiresProps> = ({
  isActive,
  interceptAtAgent = false,
  onDeployAgent,
  onExtractionComplete,
}) => {
  // Wire growth from start (0.0) to end (1.0)
  const [growthProgress, setGrowthProgress] = useState<number>(0);
  // Continuous forward flow offset along the established wire
  const [flowOffset, setFlowOffset] = useState<number>(0);

  const [particles, setParticles] = useState<SiphonParticle[]>([]);
  const packetAnimRef = useRef<number | null>(null);

  // Live calculated positions
  const [wirePoints, setWirePoints] = useState({
    start: { x: 380, y: 350 },
    // Interception targets directly at Agent Avatar icon
    shieldTop: { x: 620, y: 310 },
    shieldCenter: { x: 605, y: 350 },
    shieldBottom: { x: 620, y: 390 },
    agentCenter: { x: 660, y: 350 },
    // Unprotected breach targets directly on Software VM (right pane)
    softwareTop: { x: 1050, y: 260 },
    softwareCenter: { x: 1050, y: 380 },
    softwareBottom: { x: 1050, y: 520 },
  });

  // Calculate live anchor points based on viewport, Agent, and Software DOM elements
  useEffect(() => {
    const updatePositions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const sidebarWidth = Math.min(380, Math.max(300, w * 0.28));

      // Attempt to locate actual Agent Avatar DOM element
      const agentEl =
        document.getElementById('agent-avatar-anchor') ||
        document.getElementById('hero-title-anchor');

      let center = { x: w * 0.50, y: h * 0.50 };
      if (agentEl) {
        const rect = agentEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }

      // Software VM target anchors
      const hudEl = document.getElementById('telemetry-hud-card');
      const softwareX = hudEl ? hudEl.getBoundingClientRect().left : w * 0.76;
      const hudTopY = hudEl ? hudEl.getBoundingClientRect().top + 50 : h * 0.30;

      // Agent shield boundary offset
      const shieldCenter = { x: center.x - 62, y: center.y };
      const shieldTop = { x: center.x - 48, y: center.y - 36 };
      const shieldBottom = { x: center.x - 48, y: center.y + 36 };

      setWirePoints({
        start: { x: sidebarWidth, y: h * 0.52 },
        shieldTop,
        shieldCenter,
        shieldBottom,
        agentCenter: center,
        softwareTop: { x: softwareX, y: hudTopY },
        softwareCenter: { x: softwareX, y: hudTopY + 110 },
        softwareBottom: { x: softwareX, y: hudTopY + 220 },
      });
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    const interval = setInterval(updatePositions, 800);
    return () => {
      window.removeEventListener('resize', updatePositions);
      clearInterval(interval);
    };
  }, []);

  // 1. Slow Start-to-End Wire Growth & Continuous Flow Animation Loop
  useEffect(() => {
    if (!isActive) {
      setGrowthProgress(0);
      setFlowOffset(0);
      return;
    }

    const startTime = performance.now();
    let animId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;

      // The wire physically creeps/grows from start to end slowly over ~2.8 seconds
      const growth = Math.min(1, elapsed / 2800);
      setGrowthProgress(growth);

      // Continuous slow energy flow offset advancing forward
      setFlowOffset((now * 0.04) % 1000);

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  // 2. Spawn and animate data packets along the wires
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Packet labels differ between Unprotected Breach vs Intercepted
    const dataLabels = interceptAtAgent
      ? ['ATTACK_STREAM', 'HYDRA_AUTH', 'SQLi_SELECT', 'FUZZ_404', 'BUFFER_SURGE', 'EXPLOIT_TCP']
      : ['STUDENT_PII', 'FEES_LEDGER', 'ADMIN_HASH', 'DB_DUMP', 'AUTH_TOKEN', 'ADMISSIONS_DATA'];

    const colors = interceptAtAgent
      ? ['#EF4444', '#F43F5E', '#FB923C', '#06B6D4', '#22D3EE']
      : ['#EF4444', '#F97316', '#DC2626', '#B91C1C', '#E11D48'];

    let particleId = 0;
    const spawnInterval = setInterval(() => {
      const wireIdx = Math.floor(Math.random() * 3);
      const label = dataLabels[Math.floor(Math.random() * dataLabels.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      setParticles((prev) => [
        ...prev.slice(-7),
        {
          id: particleId++,
          wireIndex: wireIdx,
          progress: 0.02,
          speed: 0.0035 + Math.random() * 0.001,
          label,
          color,
        },
      ]);
    }, 800);

    const updateLoop = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            progress: p.progress + p.speed,
          }))
          .filter((p) => p.progress < 1.0)
      );
      packetAnimRef.current = requestAnimationFrame(updateLoop);
    };
    packetAnimRef.current = requestAnimationFrame(updateLoop);

    return () => {
      clearInterval(spawnInterval);
      if (packetAnimRef.current) cancelAnimationFrame(packetAnimRef.current);
    };
  }, [isActive, interceptAtAgent]);

  if (!isActive) return null;

  const { start, shieldTop, shieldCenter, shieldBottom, agentCenter, softwareTop, softwareCenter, softwareBottom } = wirePoints;

  // Active target endpoints based on whether Agent is deployed or not
  const targetTop = interceptAtAgent ? shieldTop : softwareTop;
  const targetCenter = interceptAtAgent ? shieldCenter : softwareCenter;
  const targetBottom = interceptAtAgent ? shieldBottom : softwareBottom;

  // Bezier curve calculations
  // Wire 0: Kali Start -> Target Top
  const cp0_x = start.x + (targetTop.x - start.x) * 0.45;
  const cp0_y = start.y - 120;
  const cp0_x2 = start.x + (targetTop.x - start.x) * 0.75;
  const cp0_y2 = targetTop.y - 40;
  const path0 = `M ${start.x} ${start.y - 25} C ${cp0_x} ${cp0_y}, ${cp0_x2} ${cp0_y2}, ${targetTop.x} ${targetTop.y}`;

  // Wire 1: Kali Start -> Target Center
  const cp1_x = start.x + (targetCenter.x - start.x) * 0.5;
  const cp1_y = start.y - 30;
  const cp1_x2 = start.x + (targetCenter.x - start.x) * 0.75;
  const cp1_y2 = targetCenter.y + 20;
  const path1 = `M ${start.x} ${start.y} C ${cp1_x} ${cp1_y}, ${cp1_x2} ${cp1_y2}, ${targetCenter.x} ${targetCenter.y}`;

  // Wire 2: Kali Start -> Target Bottom
  const cp2_x = start.x + (targetBottom.x - start.x) * 0.45;
  const cp2_y = start.y + 110;
  const cp2_x2 = start.x + (targetBottom.x - start.x) * 0.75;
  const cp2_y2 = targetBottom.y + 40;
  const path2 = `M ${start.x} ${start.y + 25} C ${cp2_x} ${cp2_y}, ${cp2_x2} ${cp2_y2}, ${targetBottom.x} ${targetBottom.y}`;

  // Cubic bezier point interpolator
  const getBezierPoint = (t: number, p0: any, p1: any, p2: any, p3: any) => {
    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const xt = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
    const yt = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;
    return { x: xt, y: yt };
  };

  const getPositionOnWire = (wireIdx: number, progress: number) => {
    const t = Math.max(0, Math.min(1, progress));
    if (wireIdx === 0) {
      return getBezierPoint(
        t,
        { x: start.x, y: start.y - 25 },
        { x: cp0_x, y: cp0_y },
        { x: cp0_x2, y: cp0_y2 },
        { x: targetTop.x, y: targetTop.y }
      );
    } else if (wireIdx === 1) {
      return getBezierPoint(
        t,
        { x: start.x, y: start.y },
        { x: cp1_x, y: cp1_y },
        { x: cp1_x2, y: cp1_y2 },
        { x: targetCenter.x, y: targetCenter.y }
      );
    } else {
      return getBezierPoint(
        t,
        { x: start.x, y: start.y + 25 },
        { x: cp2_x, y: cp2_y },
        { x: cp2_x2, y: cp2_y2 },
        { x: targetBottom.x, y: targetBottom.y }
      );
    }
  };

  // Interception shield arc facing left on Agent
  const shieldArcPath = `M ${agentCenter.x - 42} ${agentCenter.y - 65} C ${agentCenter.x - 85} ${agentCenter.y - 30}, ${agentCenter.x - 85} ${agentCenter.y + 30}, ${agentCenter.x - 42} ${agentCenter.y + 65}`;

  // Tip positions during initial progressive growth
  const tipPos0 = getPositionOnWire(0, growthProgress);
  const tipPos1 = getPositionOnWire(1, growthProgress);
  const tipPos2 = getPositionOnWire(2, growthProgress);

  const isWireFullyGrown = growthProgress >= 0.95;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden select-none">
      {/* SVG Cyber Wires */}
      <svg className="w-full h-full">
        <defs>
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="shieldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Conduit Shock Wires (Drawing from start to end) */}
        <path
          d={path0}
          fill="none"
          stroke={interceptAtAgent ? 'rgba(244, 63, 94, 0.25)' : 'rgba(239, 68, 68, 0.35)'}
          strokeWidth="8"
          strokeLinecap="round"
          pathLength="1000"
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - growthProgress)}
        />
        <path
          d={path1}
          fill="none"
          stroke={interceptAtAgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(220, 38, 38, 0.45)'}
          strokeWidth="10"
          strokeLinecap="round"
          pathLength="1000"
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - growthProgress)}
        />
        <path
          d={path2}
          fill="none"
          stroke={interceptAtAgent ? 'rgba(244, 63, 94, 0.25)' : 'rgba(239, 68, 68, 0.35)'}
          strokeWidth="8"
          strokeLinecap="round"
          pathLength="1000"
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - growthProgress)}
        />

        {/* 2. Core Glowing Red Wires */}
        <path
          d={path0}
          fill="none"
          stroke="#F43F5E"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength="1000"
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - growthProgress)}
          filter="url(#glowRed)"
        />
        <path
          d={path1}
          fill="none"
          stroke="#EF4444"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength="1000"
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - growthProgress)}
          filter="url(#glowRed)"
        />
        <path
          d={path2}
          fill="none"
          stroke="#FB7185"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength="1000"
          strokeDasharray="1000"
          strokeDashoffset={1000 * (1 - growthProgress)}
          filter="url(#glowRed)"
        />

        {/* 3. Forward Energy Pulses flowing slowly from start to end */}
        {growthProgress > 0.15 && (
          <>
            <path
              d={path0}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="24 60"
              strokeDashoffset={-flowOffset}
              pathLength="1000"
              opacity={0.85}
            />
            <path
              d={path1}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeDasharray="30 70"
              strokeDashoffset={-flowOffset * 1.1}
              pathLength="1000"
              opacity={0.9}
            />
            <path
              d={path2}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="24 60"
              strokeDashoffset={-flowOffset * 0.95}
              pathLength="1000"
              opacity={0.85}
            />
          </>
        )}

        {/* 4. Glowing Plasma Sparks at the leading tip of each extending wire while growing */}
        {!isWireFullyGrown && (
          <>
            <circle cx={tipPos0.x} cy={tipPos0.y} r="5" fill="#FFFFFF" filter="url(#glowRed)" />
            <circle cx={tipPos1.x} cy={tipPos1.y} r="7" fill="#FFFFFF" filter="url(#glowRed)" />
            <circle cx={tipPos2.x} cy={tipPos2.y} r="5" fill="#FFFFFF" filter="url(#glowRed)" />
          </>
        )}

        {/* 5. INTERCEPTION SHIELD (Only active when Agent is Deployed) */}
        {interceptAtAgent && isWireFullyGrown && (
          <>
            <path
              d={shieldArcPath}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#shieldGlow)"
              className="animate-pulse"
            />
            <path
              d={shieldArcPath}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            <circle
              cx={shieldCenter.x}
              cy={shieldCenter.y}
              r="26"
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2"
              className="animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"
              opacity="0.6"
            />
            <circle
              cx={shieldCenter.x}
              cy={shieldCenter.y}
              r="45"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="1.5"
              className="animate-[ping_3.2s_cubic-bezier(0,0,0.2,1)_infinite]"
              opacity="0.35"
            />

            <circle cx={shieldTop.x} cy={shieldTop.y} r="6" fill="#06B6D4" />
            <circle cx={shieldTop.x} cy={shieldTop.y} r="3" fill="#FFFFFF" />
            <circle cx={shieldTop.x} cy={shieldTop.y} r="12" fill="none" stroke="#22D3EE" strokeWidth="2" />

            <circle cx={shieldCenter.x} cy={shieldCenter.y} r="8" fill="#06B6D4" className="animate-pulse" />
            <circle cx={shieldCenter.x} cy={shieldCenter.y} r="4" fill="#FFFFFF" />
            <circle cx={shieldCenter.x} cy={shieldCenter.y} r="16" fill="none" stroke="#06B6D4" strokeWidth="2.5" />

            <circle cx={shieldBottom.x} cy={shieldBottom.y} r="6" fill="#06B6D4" />
            <circle cx={shieldBottom.x} cy={shieldBottom.y} r="3" fill="#FFFFFF" />
            <circle cx={shieldBottom.x} cy={shieldBottom.y} r="12" fill="none" stroke="#22D3EE" strokeWidth="2" />
          </>
        )}

        {/* 6. Unprotected Breach Target Latches on Software VM */}
        {!interceptAtAgent && isWireFullyGrown && (
          <>
            <circle cx={softwareTop.x} cy={softwareTop.y} r="8" fill="#EF4444" className="animate-ping" opacity="0.6" />
            <circle cx={softwareTop.x} cy={softwareTop.y} r="4" fill="#FFFFFF" />
            <circle cx={softwareTop.x} cy={softwareTop.y} r="14" fill="none" stroke="#EF4444" strokeWidth="2" />

            <circle cx={softwareCenter.x} cy={softwareCenter.y} r="10" fill="#DC2626" className="animate-ping" opacity="0.7" />
            <circle cx={softwareCenter.x} cy={softwareCenter.y} r="5" fill="#FFFFFF" />
            <circle cx={softwareCenter.x} cy={softwareCenter.y} r="18" fill="none" stroke="#EF4444" strokeWidth="2.5" />

            <circle cx={softwareBottom.x} cy={softwareBottom.y} r="8" fill="#EF4444" className="animate-ping" opacity="0.6" />
            <circle cx={softwareBottom.x} cy={softwareBottom.y} r="4" fill="#FFFFFF" />
            <circle cx={softwareBottom.x} cy={softwareBottom.y} r="14" fill="none" stroke="#EF4444" strokeWidth="2" />
          </>
        )}

        {/* Hacker Kali Injection Port Anchor (Start) */}
        <circle cx={start.x} cy={start.y} r="10" fill="#EF4444" opacity="0.5" />
        <circle cx={start.x} cy={start.y} r="5" fill="#FFFFFF" />
        <circle cx={start.x} cy={start.y} r="15" fill="none" stroke="#EF4444" strokeWidth="2" className="animate-pulse" />
      </svg>

      {/* Siphoned Attack Packets Moving Along Wires */}
      {particles
        .filter((p) => p.progress <= growthProgress)
        .map((p) => {
          const pos = getPositionOnWire(p.wireIndex, p.progress);
          const isNearEnd = p.progress > 0.85;

          return (
            <div
              key={p.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider pointer-events-none transition-transform duration-200"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                color: interceptAtAgent && isNearEnd ? '#22D3EE' : p.color,
                textShadow: interceptAtAgent && isNearEnd ? '0 0 10px #06B6D4' : `0 0 8px ${p.color}`,
                opacity: p.progress < 0.9 ? 1 : (1 - p.progress) * 8,
                transform: `translate(-50%, -50%) scale(${isNearEnd ? 1.2 : 1})`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block animate-pulse"
                style={{ backgroundColor: interceptAtAgent && isNearEnd ? '#22D3EE' : p.color }}
              />
              <span className="bg-black/90 px-1 py-0.2 rounded border border-white/20">
                {p.label}
              </span>
            </div>
          );
        })}

      {/* Floating Center Interception Alert Banner (When Agent is Active) */}
      {interceptAtAgent && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/80 text-white font-mono text-xs flex items-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-md animate-pulse">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <span className="font-bold tracking-widest uppercase text-cyan-200">
            DEFENSE SENTINEL ENGAGED // WIRE FLOW STOPPED AT AGENT SHIELD
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
            0 BYTES TO SOFTWARE VM
          </span>
        </div>
      )}
    </div>
  );
};
