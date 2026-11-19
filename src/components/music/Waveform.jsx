import React, { useMemo } from "react";

export default function Waveform({ seed = "", bars = 40, active = false, className = "" }) {
  const heights = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 100003;
    return Array.from({ length: bars }, (_, i) => {
      h = (h * 1103515245 + 12345) % 2147483648;
      const base = 24 + (h % 66);
      const wave = Math.sin((i / bars) * Math.PI * 3) * 12;
      return Math.max(14, Math.min(100, base + wave));
    });
  }, [seed, bars]);

  return (
    <div className={`flex items-center gap-[2px] h-6 ${className}`} aria-hidden="true">
      {heights.map((v, i) => (
        <span
          key={i}
          className={`w-[2px] rounded-full ${active ? (i % 3 ? "bg-[#FA2D48]/60" : "bg-[#FA2D48]") : "bg-white/25"}`}
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}