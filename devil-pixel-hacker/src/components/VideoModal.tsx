/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Play, ShieldCheck, Activity } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#090b0e] border border-white/20 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col">
        {/* Technical Corner Brackets */}
        <span className="absolute top-2 left-2 text-white/50 font-mono text-sm pointer-events-none">┌</span>
        <span className="absolute top-2 right-2 text-white/50 font-mono text-sm pointer-events-none">┐</span>
        <span className="absolute bottom-2 left-2 text-white/50 font-mono text-sm pointer-events-none">└</span>
        <span className="absolute bottom-2 right-2 text-white/50 font-mono text-sm pointer-events-none">┘</span>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-syncopate text-xs tracking-widest uppercase text-white font-bold">
              DRIVEN // SYSTEM DEMO v4.8.2
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Close Demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-90"
            src="https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/abstract-video.mp4"
          />

          {/* Technical HUD Overlay on Video */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-white/70">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                NEURAL TELEMETRY STREAM
              </span>
              <span>RES: 3840 x 2160 UHD // 60FPS</span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] tracking-widest font-syncopate uppercase text-white/50 block">
                  ACTIVE PIPELINE
                </span>
                <span className="text-xl font-syncopate font-bold text-white uppercase">
                  PRECISION AEROSPACE KINEMATICS
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/60 border border-white/20 text-xs font-mono text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>INVARIANTS 100% VERIFIED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-white/10 flex items-center justify-between text-xs text-white/60 font-space">
          <span>Target Architecture: Autonomous Industrial CAD &amp; Nanometer Fabrication</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors cursor-pointer text-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
