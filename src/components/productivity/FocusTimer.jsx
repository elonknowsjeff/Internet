import React, { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const FOCUS = 25 * 60;
const BREAK = 5 * 60;

export default function FocusTimer() {
  const [mode, setMode] = useState("focus");
  const [left, setLeft] = useState(FOCUS);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((s) => {
        if (s > 1) return s - 1;
        setRunning(false);
        setMode((m) => (m === "focus" ? "break" : "focus"));
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (left !== 0) return;
    setLeft(mode === "break" ? BREAK : FOCUS);
  }, [mode, left]);

  const total = mode === "focus" ? FOCUS : BREAK;
  const pct = Math.round(((total - left) / total) * 100);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  const reset = () => {
    setRunning(false);
    setLeft(mode === "focus" ? FOCUS : BREAK);
  };

  const switchMode = (m) => {
    setMode(m);
    setRunning(false);
    setLeft(m === "focus" ? FOCUS : BREAK);
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-3">
      <div className="relative grid h-14 w-14 shrink-0 place-items-center">
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r="15.5" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
            className="transition-[stroke-dasharray] duration-500"
          />
        </svg>
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/45">{running ? "on" : "set"}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          {[
            { key: "focus", label: "Focus" },
            { key: "break", label: "Break" },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => switchMode(m.key)}
              className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold transition-colors ${
                mode === m.key ? "brand-grad text-black" : "border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-1 font-display text-[24px] font-extrabold leading-none tabular-nums">
          {mm}:{ss}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => setRunning((r) => !r)}
          title={running ? "Pause" : "Start"}
          className="grid h-10 w-10 place-items-center rounded-full brand-grad text-black shadow-[0_10px_22px_-12px_rgba(0,0,0,0.9)]"
        >
          {running ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black" />}
        </button>
        <button
          onClick={reset}
          title="Reset"
          className="grid h-9 w-9 place-items-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}