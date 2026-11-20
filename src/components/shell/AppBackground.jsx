import React from "react";
import { useSettings } from "@/components/SettingsContext";

/*
  App-wide animated backdrop driven by the user's chosen background setting.
  Liquid waves, a galaxy with orbiting planets, aurora trails and more — all
  pure CSS, no assets. Sits behind everything (z-0, pointer-events-none).
*/

const BLOBS = {
  trails: ["rgba(99,102,241,0.5)", "rgba(34,211,238,0.32)", "rgba(236,72,153,0.28)"],
  planets: ["rgba(124,58,237,0.5)", "rgba(59,130,246,0.34)", "rgba(251,146,60,0.24)"],
  orbit: ["rgba(56,189,248,0.44)", "rgba(129,140,248,0.32)", "rgba(16,185,129,0.24)"],
  space: ["rgba(76,29,149,0.6)", "rgba(30,64,175,0.4)", "rgba(148,163,184,0.18)"],
  aurora: ["rgba(16,185,129,0.4)", "rgba(34,211,238,0.36)", "rgba(139,92,246,0.32)"],
  waves: ["rgba(14,165,233,0.46)", "rgba(45,212,191,0.3)", "rgba(99,102,241,0.3)"],
  mesh: ["rgba(236,72,153,0.42)", "rgba(168,85,247,0.36)", "rgba(56,189,248,0.26)"],
  gradient: ["rgba(244,63,94,0.36)", "rgba(251,191,36,0.26)", "rgba(129,140,248,0.32)"],
  sunset: ["rgba(251,146,60,0.46)", "rgba(244,63,94,0.34)", "rgba(168,85,247,0.28)"],
  ocean: ["rgba(14,165,233,0.46)", "rgba(20,184,166,0.34)", "rgba(59,130,246,0.3)"],
  ember: ["rgba(244,63,94,0.46)", "rgba(251,146,60,0.36)", "rgba(217,70,239,0.24)"],
  forest: ["rgba(16,185,129,0.42)", "rgba(34,197,94,0.32)", "rgba(132,204,22,0.24)"],
  candy: ["rgba(236,72,153,0.4)", "rgba(168,85,247,0.34)", "rgba(96,165,250,0.28)"],
  black: ["rgba(148,163,184,0.14)", "rgba(100,116,139,0.12)", "rgba(71,85,105,0.1)"],
};

const PLANETS = [
  { size: 120, color: "radial-gradient(circle at 32% 30%, #c4b5fd, #6d28d9 70%, #2e1065)", top: "16%", left: "12%", delay: "0s", dur: "26s", ring: true },
  { size: 70, color: "radial-gradient(circle at 32% 30%, #93c5fd, #2563eb 70%, #0c1b4d)", top: "62%", left: "74%", delay: "-6s", dur: "19s", ring: false },
  { size: 44, color: "radial-gradient(circle at 32% 30%, #fdba74, #ea580c 70%, #431407)", top: "30%", left: "78%", delay: "-2s", dur: "33s", ring: true },
  { size: 30, color: "radial-gradient(circle at 32% 30%, #6ee7b7, #059669 70%, #022c1d)", top: "78%", left: "20%", delay: "-10s", dur: "22s", ring: false },
];

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

export default function AppBackground() {
  const { settings } = useSettings();
  const mode = settings.background || "trails";
  const blobs = BLOBS[mode] || BLOBS.trails;
  const isGalaxy = mode === "planets" || mode === "orbit" || mode === "space";
  const isLiquid = mode === "waves" || mode === "ocean" || mode === "aurora";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-[#06060a]" />

      {/* drifting color fields */}
      <div className="absolute inset-0 opacity-70">
        <div
          className="absolute -top-[30vh] left-[-14vw] h-[90vh] w-[90vw] rounded-full blur-[140px] animate-glow"
          style={{ background: `radial-gradient(circle, ${blobs[0]}, transparent 62%)` }}
        />
        <div
          className="absolute -right-[16vw] top-[14vh] h-[78vh] w-[74vw] rounded-full blur-[150px] animate-glow"
          style={{ background: `radial-gradient(circle, ${blobs[1]}, transparent 60%)`, animationDelay: "1.5s" }}
        />
        <div
          className="absolute bottom-[-26vh] left-[14vw] h-[70vh] w-[80vw] rounded-full blur-[160px] animate-glow"
          style={{ background: `radial-gradient(circle, ${blobs[2]}, transparent 62%)`, animationDelay: "3s" }}
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
                  <div
                    className="absolute rounded-full border border-white/15"
                    style={{ width: p.size * 1.9, height: p.size * 1.9, transform: "rotate(-18deg)" }}
                  />
                )}
                <div
                  className="rounded-full shadow-[0_0_40px_-6px_currentColor]"
                  style={{ width: p.size, height: p.size, background: p.color }}
                />
              </div>
            </div>
          ))}
        </>
      )}

      {/* liquid: layered flowing waves */}
      {isLiquid && (
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -inset-x-1/2 bottom-[-20%] left-1/2 h-[80%] w-[200%] -translate-x-1/2 rounded-[50%] blur-[80px] animate-glow-pulse" style={{ background: `radial-gradient(circle, ${blobs[0]}, transparent 60%)` }} />
          <div className="absolute bottom-[-10%] left-1/2 h-[60%] w-[200%] -translate-x-1/2 rounded-[50%] blur-[70px] animate-glow-pulse" style={{ background: `radial-gradient(circle, ${blobs[1]}, transparent 60%)`, animationDelay: "1s" }} />
        </div>
      )}

      {/* subtle grain + vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
    </div>
  );
}