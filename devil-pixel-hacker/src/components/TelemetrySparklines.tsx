/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface TelemetrySparklinesProps {
  isSiphoning?: boolean;
}

interface DataPoint {
  time: number;
  tolerance: number;
  efficiency: number;
}

export const TelemetrySparklines: React.FC<TelemetrySparklinesProps> = ({ isSiphoning = false }) => {
  const [data, setData] = useState<DataPoint[]>(() => {
    const initial: DataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      initial.push({
        time: now - i * 1200,
        tolerance: 0.0009 + Math.random() * 0.0003,
        efficiency: 99.6 + Math.random() * 0.35,
      });
    }
    return initial;
  });

  const [currentTolerance, setCurrentTolerance] = useState<string>('±0.0010');
  const [currentEfficiency, setCurrentEfficiency] = useState<string>('99.8%');

  // Real-time telemetry feed updater
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        let newTol: number;
        let newEff: number;

        if (isSiphoning) {
          // Erratic fluctuations during hacker cyber siphon
          newTol = 0.0005 + Math.random() * 0.0035;
          newEff = 88.0 + Math.random() * 11.5;
        } else {
          // Normal nominal precision oscillations
          newTol = 0.00085 + Math.random() * 0.0003;
          newEff = 99.55 + Math.random() * 0.35;
        }

        setCurrentTolerance(`±${newTol.toFixed(4)}`);
        setCurrentEfficiency(`${newEff.toFixed(1)}%`);

        const nextPoint: DataPoint = {
          time: (last?.time || Date.now()) + 1200,
          tolerance: newTol,
          efficiency: newEff,
        };

        return [...prev.slice(1), nextPoint];
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isSiphoning]);

  return (
    <div className="space-y-4">
      {/* 1. TOLERANCE REAL-TIME SPARKLINES */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white/60 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSiphoning ? 'bg-red-400 animate-ping' : 'bg-white/80'
              }`}
            />
            TOLERANCE STREAM
          </span>
          <span
            className={`font-semibold font-mono tracking-wider transition-colors ${
              isSiphoning ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {currentTolerance} mm
          </span>
        </div>

        {/* Recharts Area Sparkline */}
        <div className="h-10 w-full bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden p-0.5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id="tolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Area
                type="monotone"
                dataKey="tolerance"
                stroke={isSiphoning ? '#F87171' : '#FFFFFF'}
                strokeWidth={1.5}
                fill="url(#tolGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. EFFICIENCY INDEX REAL-TIME SPARKLINES */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white/60 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSiphoning ? 'bg-red-400 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            EFFICIENCY INDEX
          </span>
          <span
            className={`font-semibold font-mono tracking-wider transition-colors ${
              isSiphoning ? 'text-red-400 animate-pulse' : 'text-emerald-400'
            }`}
          >
            {currentEfficiency}
          </span>
        </div>

        {/* Recharts Emerald Sparkline */}
        <div className="h-10 w-full bg-emerald-950/10 border border-emerald-500/20 rounded-sm overflow-hidden p-0.5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke={isSiphoning ? '#EF4444' : '#10B981'}
                strokeWidth={1.75}
                fill="url(#effGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
