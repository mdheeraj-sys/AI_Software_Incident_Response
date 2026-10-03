/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, Menu, X, Shield, Check, Globe } from 'lucide-react';
import { VideoModal } from './VideoModal';
import { TelemetrySparklines } from './TelemetrySparklines';

interface DrivenHeroProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isSiphoning?: boolean;
}

export const DrivenHero: React.FC<DrivenHeroProps> = ({
  onToggleSidebar,
  isSidebarOpen = true,
  isSiphoning = false,
}) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Animated Count-Up Numbers for Bottom Stats
  const [yearsCount, setYearsCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [countriesCount, setCountriesCount] = useState<number>(0);

  useEffect(() => {
    // Years 0 -> 25
    let y = 0;
    const yTimer = setInterval(() => {
      y += 1;
      setYearsCount(y);
      if (y >= 25) clearInterval(yTimer);
    }, 45);

    // Projects 0 -> 1200
    let p = 0;
    const pTimer = setInterval(() => {
      p += 40;
      setProjectsCount(p);
      if (p >= 1200) {
        setProjectsCount(1200);
        clearInterval(pTimer);
      }
    }, 35);

    // Countries 0 -> 50
    let c = 0;
    const cTimer = setInterval(() => {
      c += 2;
      setCountriesCount(c);
      if (c >= 50) {
        setCountriesCount(50);
        clearInterval(cTimer);
      }
    }, 45);

    return () => {
      clearInterval(yTimer);
      clearInterval(pTimer);
      clearInterval(cTimer);
    };
  }, []);

  return (
    <div className="relative flex-1 w-full min-h-screen bg-[#07080a] text-white flex flex-col justify-between overflow-x-hidden selection:bg-white selection:text-black">
      {/* 1. Full-screen Background Video + Dark Radial Vignette + 60px Technical Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 opacity-35 mix-blend-screen"
          src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/abstract-video.mp4"
        />
        {/* Radial Dark Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at center, rgba(7, 8, 10, 0.4) 0%, rgba(7, 8, 10, 0.85) 75%, rgba(7, 8, 10, 0.98) 100%)',
          }}
        />
        {/* 60px x 60px Technical Grid Line Overlay */}
        <div className="absolute inset-0 tech-grid-overlay pointer-events-none" />
      </div>

      {/* 2. Top Navigation Bar (Fully Transparent) */}
      <nav className="relative z-30 w-full px-6 md:px-12 py-6 flex items-center justify-between">
        {/* Left: Brand Logo Lockup */}
        <div className="flex items-center gap-3">
          {/* Square outline container with geometric 3D cube SVG emblem */}
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center bg-white/[0.03] rounded-sm group hover:border-white transition-colors duration-300">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-white stroke-current fill-none stroke-[1.75]"
            >
              <polygon points="12,2 22,8 12,14 2,8" />
              <polygon points="2,8 12,14 12,22 2,16" />
              <polygon points="22,8 12,14 12,22 22,16" />
            </svg>
          </div>
          <span className="font-syncopate text-lg md:text-xl font-bold tracking-[0.25em] text-white uppercase">
            DRIVEN
          </span>
        </div>

        {/* Center: Desktop Navigation Links (Space Grotesk 11px uppercase wide tracking) */}
        <div className="hidden lg:flex items-center gap-8 font-space text-[11px] tracking-[0.22em] text-white/70 uppercase">
          {['SOLUTIONS', 'SERVICES', 'INDUSTRIES', 'ABOUT US', 'CONTACT'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              className="hover:text-white transition-colors duration-200 relative group py-1"
            >
              {link}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Right: "GET A QUOTE ->" Border Outline Button + Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          <a
            href="#quote"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 border border-white/30 hover:border-white text-white font-space text-[11px] tracking-[0.18em] uppercase rounded-none transition-all duration-300 hover:bg-white hover:text-black group cursor-pointer"
          >
            <span>GET A QUOTE</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/80 hover:text-white border border-white/20 rounded-none cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] z-40 bg-[#07080a]/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-4 font-space text-xs tracking-widest uppercase">
          {['SOLUTIONS', 'SERVICES', 'INDUSTRIES', 'ABOUT US', 'CONTACT'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(' ', '-')}`}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-white/80 hover:text-white border-b border-white/5"
            >
              {link}
            </a>
          ))}
          <a
            href="#quote"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-2 py-3 px-4 border border-white text-center text-white hover:bg-white hover:text-black transition-colors"
          >
            GET A QUOTE &rarr;
          </a>
        </div>
      )}

      {/* 3. Hero Main Stage: Spacious Middle Layout for Wire Traversal */}
      <div className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-16 xl:gap-24">
        {/* Main Content (Center Left) */}
        <div
          id="hero-title-anchor"
          className={`flex-1 max-w-xl space-y-6 transition-all duration-300 ${
            isSiphoning ? 'glitch-active' : ''
          }`}
        >
          {/* Tagline Badge: Fine horizontal line + "ENGINEERED TO PERFORM" + pulsing live white dot */}
          <div className="inline-flex items-center gap-3">
            <span className="w-8 h-[1px] bg-white/40 inline-block" />
            <span className="font-space text-[11px] tracking-[0.25em] text-white/80 uppercase font-semibold">
              ENGINEERED TO PERFORM
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
          </div>

          {/* Main Title: Syncopate Large Wide Typography */}
          <h1 className="font-syncopate font-bold text-4xl sm:text-5xl md:text-6xl xl:text-[4rem] leading-[1.06] tracking-[0.06em] uppercase">
            <span className="block text-white">PRECISION</span>
            <span className="block text-white/40">BUILT.</span>
            <span className="block text-white">PERFORMANCE</span>
            <span className="block text-white/40">DRIVEN.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-inter text-slate-300 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed font-normal">
            Advanced engineering solutions delivering unmatched quality, reliability, and efficiency for a stronger tomorrow.
          </p>

          {/* Action Buttons: Primary Outline with hover fill + Secondary Circular Demo Play Button */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
            <a
              href="#explore"
              className="inline-flex items-center gap-3 px-8 py-3.5 border border-white text-white font-space text-xs tracking-[0.2em] uppercase rounded-none transition-all duration-300 hover:bg-white hover:text-black group cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <span>EXPLORE SOLUTIONS</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="inline-flex items-center gap-3 font-space text-xs tracking-[0.2em] text-white/90 hover:text-white uppercase transition-colors group cursor-pointer py-2"
            >
              <span className="w-10 h-10 rounded-full border border-white/40 group-hover:border-white group-hover:scale-110 flex items-center justify-center transition-all duration-300 bg-white/[0.04]">
                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
              </span>
              <span>SYSTEM DEMO</span>
            </button>
          </div>
        </div>

        {/* Spacious Middle Corridor: Cyber wires pass through this open space! */}

        {/* Telemetry HUD Card (Center Right) with Recharts Dynamic Real-Time Sparklines */}
        <div
          id="telemetry-hud-card"
          className={`w-full lg:w-[380px] shrink-0 transition-all duration-300 ${
            isSiphoning ? 'scale-[1.02] shadow-[0_0_50px_rgba(239,68,68,0.5)] border-red-500/50' : ''
          }`}
        >
          <div className="relative p-6 sm:p-7 bg-[#0b0d12]/85 border border-white/10 backdrop-blur-xl shadow-2xl">
            {/* Custom L-shaped technical corner brackets on all 4 corners */}
            <span className="absolute -top-1 -left-1 text-white font-mono text-base select-none">┌</span>
            <span className="absolute -top-1 -right-1 text-white font-mono text-base select-none">┐</span>
            <span className="absolute -bottom-1 -left-1 text-white font-mono text-base select-none">└</span>
            <span className="absolute -bottom-1 -right-1 text-white font-mono text-base select-none">┘</span>

            {/* Card Header: ● SYSTEM ONLINE + version tag v4.8.2 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSiphoning ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isSiphoning ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                  />
                </span>
                <span className="font-space text-xs tracking-[0.18em] font-semibold text-white uppercase">
                  {isSiphoning ? 'BREACH IN PROGRESS' : 'SYSTEM ONLINE'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-white/40 tracking-wider">
                v4.8.2
              </span>
            </div>

            {/* DYNAMIC RECHARTS SPARKLINES (Replacing static bars!) */}
            <TelemetrySparklines isSiphoning={isSiphoning} />

            {/* Footer: GRID LATENCY: 2.4ms + OPTIMAL in green */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/50">GRID LATENCY: 2.4ms</span>
              <span
                className={`font-semibold tracking-wider flex items-center gap-1 ${
                  isSiphoning ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {isSiphoning ? 'COMPROMISED' : 'OPTIMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Metrics Bar */}
      <div
        id="metrics-bar-anchor"
        className={`relative z-20 w-full border-t border-white/10 bg-[#07080a]/90 backdrop-blur-md px-6 md:px-12 py-6 transition-all duration-300 ${
          isSiphoning ? 'border-red-500/40 bg-red-950/20' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Metric 1: 25+ YEARS OF EXCELLENCE */}
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white/80" />
            </span>
            <div>
              <span className="font-syncopate font-bold text-2xl text-white tracking-wider block">
                {yearsCount}+
              </span>
              <span className="font-space text-xs tracking-[0.16em] text-white/60 uppercase">
                YEARS OF EXCELLENCE
              </span>
            </div>
          </div>

          {/* Metric 2: 1200+ PROJECTS DELIVERED */}
          <div className="flex items-center gap-4 md:border-l md:border-white/10 md:pl-8">
            <span className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <span className="font-syncopate font-bold text-2xl text-white tracking-wider block">
                {projectsCount}+
              </span>
              <span className="font-space text-xs tracking-[0.16em] text-white/60 uppercase">
                PROJECTS DELIVERED
              </span>
            </div>
          </div>

          {/* Metric 3: 50+ COUNTRIES SERVED */}
          <div className="flex items-center gap-4 md:border-l md:border-white/10 md:pl-8">
            <span className="w-10 h-10 border border-white/15 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-white/80" />
            </span>
            <div>
              <span className="font-syncopate font-bold text-2xl text-white tracking-wider block">
                {countriesCount}+
              </span>
              <span className="font-space text-xs tracking-[0.16em] text-white/60 uppercase">
                COUNTRIES SERVED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Popup */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
};
