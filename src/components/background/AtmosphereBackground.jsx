import React from "react";

/*
  Dark atmospheric canvas: a stratified near-black base with three slow
  drifting light fields, fine grain and a deep vignette. The palette shifts
  with the user's chosen background mode so the appearance setting still works.
*/
const PALETTES = {
  trails: [
    "radial-gradient(circle, rgba(99,102,241,0.55), transparent 62%)",
    "radial-gradient(circle, rgba(34,211,238,0.32), transparent 60%)",
    "radial-gradient(circle, rgba(236,72,153,0.26), transparent 62%)",
  ],
  planets: [
    "radial-gradient(circle, rgba(168,85,247,0.48), transparent 62%)",
    "radial-gradient(circle, rgba(59,130,246,0.3), transparent 60%)",
    "radial-gradient(circle, rgba(251,146,60,0.22), transparent 62%)",
  ],
  orbit: [
    "radial-gradient(circle, rgba(56,189,248,0.42), transparent 62%)",
    "radial-gradient(circle, rgba(129,140,248,0.3), transparent 60%)",
    "radial-gradient(circle, rgba(16,185,129,0.22), transparent 62%)",
  ],
  space: [
    "radial-gradient(circle, rgba(76,29,149,0.6), transparent 64%)",
    "radial-gradient(circle, rgba(30,64,175,0.4), transparent 62%)",
    "radial-gradient(circle, rgba(148,163,184,0.18), transparent 60%)",
  ],
  aurora: [
    "radial-gradient(circle, rgba(16,185,129,0.38), transparent 62%)",
    "radial-gradient(circle, rgba(34,211,238,0.34), transparent 60%)",
    "radial-gradient(circle, rgba(139,92,246,0.3), transparent 62%)",
  ],
  waves: [
    "radial-gradient(circle, rgba(14,165,233,0.42), transparent 62%)",
    "radial-gradient(circle, rgba(45,212,191,0.28), transparent 60%)",
    "radial-gradient(circle, rgba(99,102,241,0.28), transparent 62%)",
  ],
  mesh: [
    "radial-gradient(circle, rgba(236,72,153,0.4), transparent 62%)",
    "radial-gradient(circle, rgba(168,85,247,0.34), transparent 60%)",
    "radial-gradient(circle, rgba(56,189,248,0.24), transparent 62%)",
  ],
  gradient: [
    "radial-gradient(circle, rgba(244,63,94,0.34), transparent 62%)",
    "radial-gradient(circle, rgba(251,191,36,0.24), transparent 60%)",
    "radial-gradient(circle, rgba(129,140,248,0.3), transparent 62%)",
  ],
  black: [
    "radial-gradient(circle, rgba(148,163,184,0.16), transparent 62%)",
    "radial-gradient(circle, rgba(100,116,139,0.14), transparent 60%)",
    "radial-gradient(circle, rgba(71,85,105,0.12), transparent 62%)",
  ],
};

export default function AtmosphereBackground({ mode = "trails" }) {
  const [a, b, c] = PALETTES[mode] || PALETTES.trails;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden atmo-base">
      <div className="absolute inset-0 atmo-strata" />
      <div
        className="absolute -top-[34vh] left-[-14vw] h-[92vh] w-[92vw] rounded-full blur-[130px] atmo-aurora-a"
        style={{ background: a }}
      />
      <div
        className="absolute -right-[16vw] top-[18vh] h-[80vh] w-[76vw] rounded-full blur-[140px] atmo-aurora-b"
        style={{ background: b }}
      />
      <div
        className="absolute bottom-[-26vh] left-[16vw] h-[70vh] w-[82vw] rounded-full blur-[150px] atmo-aurora-c"
        style={{ background: c }}
      />
      <div className="absolute inset-0 atmo-grain opacity-[0.05]" />
      <div className="absolute inset-0 atmo-vignette" />
    </div>
  );
}