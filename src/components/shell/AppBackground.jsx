import React from "react";
import { useSettings } from "@/components/SettingsContext";

/*
  Colorful aurora backdrop driven by the active theme (data-theme CSS vars),
  with optional galaxy / liquid extras from the background mode setting.
*/
function Stars({ count = 60 }) {
  const stars = React.useMemo(
    () =>
      Array.from({ length: count }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        delay: `${Math.random() * 3}s`,
        op: Math.random() * 0.6 + 0.25,
      })),
    [count]
  );
  return (
    <div className="absolute inset-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.op, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}

const PLANETS = [
  { size: 120, color: "radial-gradient(circle at 32% 30%, #c4b5fd, #6d28d9 70%, #2e1065)", top: "16%", left: "12%", delay: "0s", dur: "26s", ring: true },
  { size: 70, color: "radial-gradient(circle at 32% 30%, #93c5fd, #2563eb 70%, #0c1b4d)", top: "62%", left: "74%", delay: "-6s", dur: "19s", ring: false },
  { size: 44, color: "radial-gradient(circle at 32% 30%, #fdba74, #ea580c 70%, #431407)", top: "30%", left: "78%", delay: "-2s", dur: "33s", ring: true },
  { size: 30, color: "radial-gradient(circle at 32% 30%, #6ee7b7, #059669 70%, #022c1d)", top: "78%", left: "20%", delay: "-10s", dur: "22s", ring: false },
];

export default function AppBackground() {
  const { settings } = useSettings();
  const mode = settings.background || "trails";
  const isGalaxy = mode === "planets" || mode === "orbit" || mode === "space";
  const isLiquid = mode === "waves" || mode === "ocean" || mode === "aurora";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
      {/* drifting aurora color fields (theme-driven) */}
      <div className="absolute inset-0" style={{ opacity: "var(--aurora-opacity)" }}>
        <div
          className="ig-blob absolute -top-[30vh] left-[-14vw] h-[90vh] w-[90vw] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle, var(--aurora-1), transparent 62%)", animation: "ig-drift-a 28s ease-in-out infinite alternate" }}
        />
        <div
          className="ig-blob absolute -right-[16vw] top-[14vh] h-[78vh] w-[74vw] rounded-full blur-[150px]"
          style={{ background: "radial-gradient(circle, var(--aurora-2), transparent 60%)", animation: "ig-drift-b 30s ease-in-out infinite alternate" }}
        />
        <div
          className="ig-blob absolute bottom-[-26vh] left-[14vw] h-[70vh] w-[80vw] rounded-full blur-[160px]"
          style={{ background: "radial-gradient(circle, var(--aurora-3), transparent 62%)", animation: "ig-drift-c 32s ease-in-out infinite alternate" }}
        />
      </div>

      {/* galaxy: stars + orbiting planets */}
      {isGalaxy && (
        <>
          <Stars count={70} />
          {PLANETS.map((p, i) => (
            <div key={i} className="absolute animate-float-slow" style={{ top: p.top, left: p.left, animationDelay: p.delay, animationDuration: p.dur }}>
              <div className="relative grid place-items-center">
                {p.ring && (
                  <div className="absolute rounded-full border border-white/15" style={{ width: p.size * 1.9, height: p.size * 1.9, transform: "rotate(-18deg)" }} />
                )}
                <div className="rounded-full shadow-[0_0_40px_-6px_currentColor]" style={{ width: p.size, height: p.size, background: p.color }} />
              </div>
            </div>
          ))}
        </>
      )}

      {/* liquid: layered flowing waves */}
      {isLiquid && (
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -inset-x-1/2 bottom-[-20%] left-1/2 h-[80%] w-[200%] -translate-x-1/2 rounded-[50%] blur-[80px] animate-glow-pulse" style={{ background: "radial-gradient(circle, var(--aurora-1), transparent 60%)" }} />
          <div className="absolute bottom-[-10%] left-1/2 h-[60%] w-[200%] -translate-x-1/2 rounded-[50%] blur-[70px] animate-glow-pulse" style={{ background: "radial-gradient(circle, var(--aurora-2), transparent 60%)", animationDelay: "1s" }} />
        </div>
      )}

      {/* soft vignette toward the theme base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 55%, color-mix(in srgb, var(--bg-base) 78%, transparent))" }} />
    </div>
  );
}