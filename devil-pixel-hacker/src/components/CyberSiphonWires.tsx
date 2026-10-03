/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';

interface CyberSiphonWiresProps {
  isActive: boolean;
  onExtractionComplete?: () => void;
}

interface SiphonParticle {
  id: number;
  wireIndex: number;
  progress: number; // 1 -> 0 (moving from target back into terminal)
  speed: number;
  label: string;
  color: string;
}

export const CyberSiphonWires: React.FC<CyberSiphonWiresProps> = ({
  isActive,
  onExtractionComplete,
}) => {
  const [particles, setParticles] = useState<SiphonParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Wire paths from Kali terminal edge (approx left: 360px) to targets across middle space
  // Wire 0: to Telemetry HUD card (top-right, approx x: 82%, y: 38%)
  // Wire 1: to Main Title "PRECISION" (center-left, approx x: 48%, y: 28%)
  // Wire 2: to Bottom Metrics Bar (bottom, approx x: 65%, y: 88%)
  const [wirePoints, setWirePoints] = useState({
    start: { x: 380, y: 350 },
    hudTarget: { x: 920, y: 340 },
    titleTarget: { x: 620, y: 260 },
    metricsTarget: { x: 780, y: 720 },
  });

  // Calculate live anchor points based on viewport
  useEffect(() => {
    const updatePositions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const sidebarWidth = Math.min(380, Math.max(300, w * 0.28));

      // Attempt to find actual DOM bounding boxes if present
      const hudEl = document.getElementById('telemetry-hud-card');
      const titleEl = document.getElementById('hero-title-anchor');
      const metricsEl = document.getElementById('metrics-bar-anchor');

      const hudPos = hudEl
        ? { x: hudEl.getBoundingClientRect().left, y: hudEl.getBoundingClientRect().top + 80 }
        : { x: w * 0.78, y: h * 0.42 };

      const titlePos = titleEl
        ? { x: titleEl.getBoundingClientRect().right - 40, y: titleEl.getBoundingClientRect().top + 50 }
        : { x: w * 0.52, y: h * 0.32 };

      const metricsPos = metricsEl
        ? { x: metricsEl.getBoundingClientRect().left + 150, y: metricsEl.getBoundingClientRect().top + 20 }
        : { x: w * 0.62, y: h * 0.88 };

      setWirePoints({
        start: { x: sidebarWidth, y: h * 0.52 },
        hudTarget: hudPos,
        titleTarget: titlePos,
        metricsTarget: metricsPos,
      });
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    const interval = setInterval(updatePositions, 1000);
    return () => {
      window.removeEventListener('resize', updatePositions);
      clearInterval(interval);
    };
  }, []);

  // Spawn and animate particles traveling backwards along the wires
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const dataLabels = [
      '0101', '0x8F', 'TOLERANCE', 'EFF_INDEX', '99.8%',
      '±0.001mm', 'CIPHER', 'HEX_DUMP', 'ROOT_INTEL', 'AUTH_KEY', 'TELEMETRY'
    ];
    const colors = ['#10B981', '#FFFFFF', '#60A5FA', '#F43F5E', '#A78BFA'];

    let particleId = 0;
    const spawnInterval = setInterval(() => {
      // Spawn new packet at target (progress = 1.0)
      const wireIdx = Math.floor(Math.random() * 3);
      const label = dataLabels[Math.floor(Math.random() * dataLabels.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      setParticles((prev) => [
        ...prev.slice(-24),
        {
          id: particleId++,
          wireIndex: wireIdx,
          progress: 1.0, // starts at target
          speed: 0.015 + Math.random() * 0.02,
          label,
          color,
        },
      ]);
    }, 160);

    // Render loop moving particles from 1.0 down to 0.0
    const updateLoop = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            progress: p.progress - p.speed,
          }))
          .filter((p) => p.progress > 0)
      );
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };
    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      clearInterval(spawnInterval);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  const { start, hudTarget, titleTarget, metricsTarget } = wirePoints;

  // Bezier curve calculations
  // Wire 1: Start -> HUD Target
  const cp1_x = start.x + (hudTarget.x - start.x) * 0.45;
  const cp1_y = start.y - 120;
  const cp2_x = start.x + (hudTarget.x - start.x) * 0.75;
  const cp2_y = hudTarget.y + 60;
  const path1 = `M ${start.x} ${start.y} C ${cp1_x} ${cp1_y}, ${cp2_x} ${cp2_y}, ${hudTarget.x} ${hudTarget.y}`;

  // Wire 2: Start -> Title Target
  const cp3_x = start.x + (titleTarget.x - start.x) * 0.5;
  const cp3_y = start.y - 160;
  const path2 = `M ${start.x} ${start.y - 30} C ${cp3_x} ${cp3_y}, ${titleTarget.x - 60} ${titleTarget.y + 80}, ${titleTarget.x} ${titleTarget.y}`;

  // Wire 3: Start -> Metrics Target
  const cp4_x = start.x + (metricsTarget.x - start.x) * 0.4;
  const cp4_y = start.y + 140;
  const path3 = `M ${start.x} ${start.y + 30} C ${cp4_x} ${cp4_y}, ${metricsTarget.x - 80} ${metricsTarget.y - 60}, ${metricsTarget.x} ${metricsTarget.y}`;

  // Interpolate cubic bezier point
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
    // progress is 1 at target, 0 at start
    const t = 1 - progress; // t=0 at start, t=1 at target
    if (wireIdx === 0) {
      return getBezierPoint(
        t,
        { x: start.x, y: start.y },
        { x: cp1_x, y: cp1_y },
        { x: cp2_x, y: cp2_y },
        { x: hudTarget.x, y: hudTarget.y }
      );
    } else if (wireIdx === 1) {
      return getBezierPoint(
        t,
        { x: start.x, y: start.y - 30 },
        { x: cp3_x, y: cp3_y },
        { x: titleTarget.x - 60, y: titleTarget.y + 80 },
        { x: titleTarget.x, y: titleTarget.y }
      );
    } else {
      return getBezierPoint(
        t,
        { x: start.x, y: start.y + 30 },
        { x: cp4_x, y: cp4_y },
        { x: metricsTarget.x - 80, y: metricsTarget.y - 60 },
        { x: metricsTarget.x, y: metricsTarget.y }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden select-none">
      {/* SVG Cyber Siphon Cables */}
      <svg className="w-full h-full">
        <defs>
          <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Conduit Shield Wires (thick semi-transparent) */}
        <path d={path1} fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="8" strokeLinecap="round" />
        <path d={path2} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="6" strokeLinecap="round" />
        <path d={path3} fill="none" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="7" strokeLinecap="round" />

        {/* Glowing Core Wires with animated dashing */}
        <path
          d={path1}
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeDasharray="12 8"
          className="animate-[dash_1s_linear_infinite]"
          filter="url(#glowGreen)"
        />
        <path
          d={path2}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="8 6"
          className="animate-[dash_1.2s_linear_infinite]"
        />
        <path
          d={path3}
          fill="none"
          stroke="#EF4444"
          strokeWidth="2.5"
          strokeDasharray="14 10"
          className="animate-[dash_0.9s_linear_infinite]"
          filter="url(#glowRed)"
        />

        {/* Latching Anchor Clamps at Targets */}
        {/* HUD Target Anchor */}
        <circle cx={hudTarget.x} cy={hudTarget.y} r="8" fill="#10B981" className="animate-ping" opacity="0.6" />
        <circle cx={hudTarget.x} cy={hudTarget.y} r="5" fill="#FFFFFF" />
        <circle cx={hudTarget.x} cy={hudTarget.y} r="12" fill="none" stroke="#10B981" strokeWidth="2" />

        {/* Title Target Anchor */}
        <circle cx={titleTarget.x} cy={titleTarget.y} r="7" fill="#FFFFFF" className="animate-ping" opacity="0.5" />
        <circle cx={titleTarget.x} cy={titleTarget.y} r="4" fill="#FFFFFF" />
        <circle cx={titleTarget.x} cy={titleTarget.y} r="10" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Metrics Target Anchor */}
        <circle cx={metricsTarget.x} cy={metricsTarget.y} r="8" fill="#EF4444" className="animate-ping" opacity="0.6" />
        <circle cx={metricsTarget.x} cy={metricsTarget.y} r="5" fill="#FFFFFF" />
        <circle cx={metricsTarget.x} cy={metricsTarget.y} r="12" fill="none" stroke="#EF4444" strokeWidth="2" />

        {/* Terminal Extraction Injection Port Anchor (Start) */}
        <circle cx={start.x} cy={start.y} r="10" fill="#10B981" opacity="0.4" />
        <circle cx={start.x} cy={start.y} r="6" fill="#FFFFFF" />
        <circle cx={start.x} cy={start.y} r="14" fill="none" stroke="#10B981" strokeWidth="2" className="animate-pulse" />
      </svg>

      {/* Siphoned Data Packets & Binary Bits Flowing Back into Terminal */}
      {particles.map((p) => {
        const pos = getPositionOnWire(p.wireIndex, p.progress);
        return (
          <div
            key={p.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 font-mono text-[10px] font-bold tracking-wider pointer-events-none"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              color: p.color,
              textShadow: `0 0 8px ${p.color}`,
              opacity: Math.sin(p.progress * Math.PI),
            }}
          >
            <span
              className="w-2 h-2 rounded-full inline-block animate-ping"
              style={{ backgroundColor: p.color }}
            />
            <span className="bg-black/90 px-1 py-0.2 rounded border border-white/20">
              {p.label}
            </span>
          </div>
        );
      })}

      {/* Floating Center Notification */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-red-950/80 border border-red-500/80 text-white font-mono text-xs flex items-center gap-2.5 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
        <span className="font-bold tracking-widest uppercase">
          DATA EXTRACTION ACTIVE // SIPHONING TELEMETRY HUD &amp; METRICS
        </span>
      </div>
    </div>
  );
};
