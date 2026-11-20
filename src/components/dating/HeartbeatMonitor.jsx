import React from "react";
import { Heart } from "lucide-react";

const deriveBpm = (seed = "", age) => {
  const base = age ? Math.round(220 - age) : 72;
  let h = 5;
  for (let i = 0; i < (seed || "x").length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000;
  return Math.min(140, Math.max(58, base - 80 + (h % 40)));
};

export default function HeartbeatMonitor({ profile, className = "" }) {
  const bpm = Number(profile?.bpm) || deriveBpm(profile?.id || profile?.display_name, profile?.age);
  const beat = Math.max(0.45, 60 / bpm);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/35 neon-edge-soft p-2.5 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span
          className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full"
          style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)" }}
        >
          <Heart
            className="h-3.5 w-3.5 animate-pulse"
            style={{ color: "var(--brand)", animationDuration: `${beat}s` }}
            fill="currentColor"
          />
        </span>
        <div className="min-w-0 shrink-0">
          <p className="text-[8.5px] uppercase tracking-[0.22em] text-white/40">Heartbeat</p>
          <p className="text-[13px] font-bold leading-none neon-text" style={{ color: "var(--brand)" }}>
            {bpm}
            <span className="ml-1 text-[9px] font-medium text-white/45">BPM</span>
          </p>
        </div>
        <svg viewBox="0 0 320 36" className="ml-auto h-7 w-[150px] overflow-visible" preserveAspectRatio="none">
          <path
            d="M0 18 H70 l5 -12 l5 22 l5 -16 l7 6 H140 l5 -12 l5 22 l5 -16 l7 6 H210 l5 -12 l5 22 l5 -16 l7 6 H320"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--brand) 75%, transparent))" }}
            className="ecg-trace"
          />
        </svg>
      </div>
      <style>{`
        .ecg-trace {
          stroke-dasharray: 640;
          stroke-dashoffset: 640;
          animation: ecgsweep ${beat * 2}s linear infinite;
        }
        @keyframes ecgsweep { to { stroke-dashoffset: -640; } }
      `}</style>
    </div>
  );
}