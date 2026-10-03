/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Activity, Clock, Users, ArrowUpRight } from 'lucide-react';

interface TelemetrySparklinesProps {
  isSiphoning?: boolean;
}

interface DataPoint {
  time: number;
  throughput: number;
  latency: number;
}

export const TelemetrySparklines: React.FC<TelemetrySparklinesProps> = ({ isSiphoning = false }) => {
  const [data, setData] = useState<DataPoint[]>(() => {
    const initial: DataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      initial.push({
        time: now - i * 1200,
        throughput: 240 + Math.floor(Math.random() * 25),
        latency: 12.5 + Math.random() * 2.5,
      });
    }
    return initial;
  });

  const [currentThroughput, setCurrentThroughput] = useState<string>('248 req/s');
  const [currentLatency, setCurrentLatency] = useState<string>('14.2 ms');

  // Real-time telemetry feed updater
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        let newThroughput: number;
        let newLatency: number;

        if (isSiphoning) {
          // Surge during malicious attack traffic / siphon
          newThroughput = 1450 + Math.floor(Math.random() * 650);
          newLatency = 380.0 + Math.random() * 140.0;
        } else {
          // Normal nominal student traffic oscillations
          newThroughput = 230 + Math.floor(Math.random() * 35);
          newLatency = 13.0 + Math.random() * 3.0;
        }

        setCurrentThroughput(`${newThroughput} req/s`);
        setCurrentLatency(`${newLatency.toFixed(1)} ms`);

        const nextPoint: DataPoint = {
          time: (last?.time || Date.now()) + 1200,
          throughput: newThroughput,
          latency: newLatency,
        };

        return [...prev.slice(1), nextPoint];
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isSiphoning]);

  return (
    <div className="space-y-3.5">
      {/* 1. HTTP REQUEST THROUGHPUT STREAM */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-600 font-medium flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSiphoning ? 'bg-rose-500 animate-ping' : 'bg-cyan-600'
              }`}
            />
            HTTP TRAFFIC THROUGHPUT
          </span>
          <span
            className={`font-semibold font-mono tracking-wider transition-colors ${
              isSiphoning ? 'text-rose-600 animate-pulse font-bold' : 'text-zinc-900'
            }`}
          >
            {currentThroughput}
          </span>
        </div>

        {/* Recharts Area Sparkline */}
        <div className="h-10 w-full bg-zinc-50 border border-zinc-200 rounded-sm overflow-hidden p-0.5 shadow-2xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id="tpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Area
                type="monotone"
                dataKey="throughput"
                stroke={isSiphoning ? '#DC2626' : '#0284c7'}
                strokeWidth={1.75}
                fill="url(#tpGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. SERVER RESPONSE LATENCY REAL-TIME SPARKLINES */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-600 font-medium flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSiphoning ? 'bg-rose-500 animate-ping' : 'bg-emerald-600 animate-pulse'
              }`}
            />
            PORTAL LATENCY (P99)
          </span>
          <span
            className={`font-semibold font-mono tracking-wider transition-colors ${
              isSiphoning ? 'text-rose-600 animate-pulse font-bold' : 'text-emerald-700'
            }`}
          >
            {currentLatency}
          </span>
        </div>

        {/* Recharts Emerald Sparkline */}
        <div className="h-10 w-full bg-emerald-50/60 border border-emerald-200 rounded-sm overflow-hidden p-0.5 shadow-2xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Area
                type="monotone"
                dataKey="latency"
                stroke={isSiphoning ? '#DC2626' : '#059669'}
                strokeWidth={1.75}
                fill="url(#latGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
