import React, { useRef, useEffect } from "react";

const LIGHT_MODES = ["planets", "orbit", "space", "aurora", "waves"];

export const TRAILS_IMAGE = "https://media.base44.com/images/public/6ae2fa236367a8c9baa75290/28818924c_1080x3601.jpg";

export default function SpaceBackground({ mode = "planets" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!LIGHT_MODES.includes(mode)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, stars = [], t = 0;

    const init = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(300, Math.floor((w * h) / 8000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.8 + 0.2,
        r: Math.random() * 1.5 + 0.3, tw: Math.random() * Math.PI * 2, speed: Math.random() * 0.06 + 0.02,
      }));
    };

    const paintStars = (alpha = 1) => {
      for (const s of stars) {
        s.tw += 0.03; s.y -= s.speed;
        if (s.y < 0) { s.y = h; s.x = Math.random() * w; }
        const a = (0.45 + Math.sin(s.tw) * 0.45) * s.z * alpha;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#f5f3ff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.z, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const glow = (x, y, r, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    };

    // Planet with ring + moons
    const drawSphere = (cx, cy, radius, c1, c2, ring) => {
      const g = ctx.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.15, cx, cy, radius);
      g.addColorStop(0, c1); g.addColorStop(0.75, c2); g.addColorStop(1, "rgba(20,14,40,0.95)");
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      if (ring) {
        ctx.save();
        ctx.translate(cx, cy);
        const tilt = -0.42 + Math.sin(t * 0.5) * 0.03;
        ctx.rotate(tilt);
        ctx.strokeStyle = "rgba(232,220,255,0.55)";
        ctx.lineWidth = radius * 0.09;
        ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.75, radius * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(186,160,255,0.32)";
        ctx.lineWidth = radius * 0.035;
        ctx.beginPath(); ctx.ellipse(0, 0, radius * 2.05, radius * 0.52, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
    };

    const drawPlanets = () => {
      t += 0.006;
      const bg = ctx.createLinearGradient(0, 0, w * 0.4, h);
      bg.addColorStop(0, "#3b2a63");
      bg.addColorStop(0.45, "#2a2050");
      bg.addColorStop(1, "#221a3f");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      glow(w * 0.82, h * 0.18, Math.max(w, h) * 0.5, "rgba(186,160,255,0.30)");
      glow(w * 0.12, h * 0.78, Math.max(w, h) * 0.45, "rgba(129,140,248,0.24)");
      glow(w * 0.55, h * 0.95, Math.max(w, h) * 0.35, "rgba(244,114,182,0.16)");
      paintStars(0.85);
      drawSphere(w * 0.86, h * 0.26, Math.min(w, h) * 0.19, "#fef3c7", "#c084fc", true);
      drawSphere(w * 0.13, h * 0.66, Math.min(w, h) * 0.075, "#bfdbfe", "#6366f1", false);
      drawSphere(w * 0.68, h * 0.85, Math.min(w, h) * 0.045, "#fbcfe8", "#a855f7", false);
    };

    const drawOrbit = () => {
      t += 0.004;
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.9);
      bg.addColorStop(0, "#3d2f6b");
      bg.addColorStop(0.55, "#2b2151");
      bg.addColorStop(1, "#1f183b");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      glow(w * 0.5, h * 0.42, Math.max(w, h) * 0.4, "rgba(196,181,253,0.26)");
      paintStars(0.6);
      const cx = w * 0.5, cy = h * 0.44;
      const rings = [0.16, 0.26, 0.36, 0.47, 0.6];
      const colors = ["#fcd34d", "#f0abfc", "#a5b4fc", "#6ee7b7", "#fda4af"];
      rings.forEach((r, i) => {
        const rx = Math.min(w, h) * r * 1.5, ry = Math.min(w, h) * r * 0.55;
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
        const ang = t * (0.9 - i * 0.12) + i * 1.4;
        const px = cx + Math.cos(ang) * rx;
        const py = cy + Math.sin(ang) * ry;
        ctx.beginPath(); ctx.arc(px, py, 5 + i * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = colors[i]; ctx.fill();
      });
      const sun = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.min(w, h) * 0.09);
      sun.addColorStop(0, "#fef9c3"); sun.addColorStop(0.6, "#fbcfe8"); sun.addColorStop(1, "rgba(251,207,232,0)");
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.09, 0, Math.PI * 2); ctx.fillStyle = sun; ctx.fill();
    };

    const drawSpace = () => {
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#1e1a3c"); bg.addColorStop(0.6, "#1a1734"); bg.addColorStop(1, "#221c3d");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      glow(w * 0.25, h * 0.3, Math.max(w, h) * 0.45, "rgba(129,140,248,0.24)");
      glow(w * 0.8, h * 0.7, Math.max(w, h) * 0.45, "rgba(232,121,249,0.20)");
      paintStars(1);
    };

    const drawAurora = () => {
      t += 0.004;
      ctx.fillStyle = "#221a3f"; ctx.fillRect(0, 0, w, h);
      const blobs = [
        { hue: 265, x: 0.25, y: 0.3, rad: 0.55 }, { hue: 285, x: 0.72, y: 0.45, rad: 0.6 },
        { hue: 320, x: 0.5, y: 0.75, rad: 0.5 }, { hue: 220, x: 0.15, y: 0.8, rad: 0.45 },
      ];
      blobs.forEach((b, i) => {
        const cx = (b.x + Math.sin(t + i) * 0.12) * w;
        const cy = (b.y + Math.cos(t * 1.1 + i) * 0.1) * h;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.rad * Math.max(w, h));
        g.addColorStop(0, `hsla(${b.hue},85%,72%,0.34)`);
        g.addColorStop(0.5, `hsla(${b.hue},85%,68%,0.14)`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      paintStars(0.5);
    };

    const drawWaves = () => {
      t += 0.012;
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#2b2350"); bg.addColorStop(1, "#1d1738");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      const layers = [
        { amp: 38, len: 0.012, speed: 0.6, y: 0.55, color: "rgba(165,180,252,0.22)" },
        { amp: 52, len: 0.009, speed: 0.4, y: 0.68, color: "rgba(216,180,254,0.20)" },
        { amp: 66, len: 0.007, speed: 0.3, y: 0.82, color: "rgba(244,164,210,0.18)" },
      ];
      layers.forEach((L, li) => {
        ctx.beginPath(); ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 6) {
          const y = L.y * h + Math.sin(x * L.len + t * L.speed + li) * L.amp + Math.sin(x * L.len * 2 + t) * L.amp * 0.3;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.closePath(); ctx.fillStyle = L.color; ctx.fill();
      });
      paintStars(0.55);
    };

    const draw = () => {
      if (mode === "planets") drawPlanets();
      else if (mode === "orbit") drawOrbit();
      else if (mode === "space") drawSpace();
      else if (mode === "aurora") drawAurora();
      else drawWaves();
      rafRef.current = requestAnimationFrame(draw);
    };
    init(); draw();
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", onResize); };
  }, [mode]);

  if (mode === "trails")
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0b0716]">
        <div
          className="absolute -inset-[4%] bg-cover bg-center bg-no-repeat trails-drift opacity-40"
          style={{ backgroundImage: `url(${TRAILS_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[#0b0716]/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#120a26]/55 via-[#0b0716]/35 to-[#07040e]/85" />
      </div>
    );
  if (mode === "black") return <div className="fixed inset-0 -z-10 bg-neutral-950" />;
  if (mode === "sunset")
    return <div className="fixed inset-0 -z-10 bg-[linear-gradient(160deg,#3a1533_0%,#2a1030_45%,#160b22_100%)]" />;
  if (mode === "ocean")
    return <div className="fixed inset-0 -z-10 bg-[#0b1e2e] bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(16,185,129,0.18),transparent_45%)]" />;
  if (mode === "ember")
    return <div className="fixed inset-0 -z-10 bg-[#1a0f16] bg-[radial-gradient(circle_at_70%_15%,rgba(251,146,60,0.22),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(244,63,94,0.18),transparent_45%)]" />;
  if (mode === "forest")
    return <div className="fixed inset-0 -z-10 bg-[#0c1a15] bg-[radial-gradient(circle_at_30%_25%,rgba(52,211,153,0.20),transparent_45%),radial-gradient(circle_at_75%_80%,rgba(163,230,53,0.14),transparent_45%)]" />;
  if (mode === "candy")
    return <div className="fixed inset-0 -z-10 bg-[#241735] bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.28),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(165,180,252,0.24),transparent_45%)]" />;
  if (mode === "gradient") return <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#2a2350] via-[#221c3f] to-[#1b1633]" />;
  if (mode === "mesh") return <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(165,180,252,0.30),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(232,121,249,0.24),transparent_45%),radial-gradient(circle_at_50%_92%,rgba(125,211,252,0.22),transparent_42%)] bg-[#241d45]" />;
  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-[#241d45]" />;
}