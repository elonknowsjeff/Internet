import React, { useEffect, useRef, useState } from "react";
import { X, Gamepad2 } from "lucide-react";

/*
  Street Brawl — a 2D fighter. Player vs CPU, best of 3 rounds.
  Canvas-based, self-contained. Keyboard:
    Arrow Left/Right — move
    Arrow Up — jump
    J — punch (fast, light)
    K — kick (slow, heavy)
    L (hold) — block
*/

const W = 900, H = 420;
const GROUND = 360;
const GRAV = 0.8;
const FLOOR_FRICTION = 0.82;

const makeFighter = (x, facing, color, name) => ({
  x, y: GROUND, vy: 0, facing,
  color, name,
  hp: 100, wins: 0,
  state: "idle", timer: 0, cd: 0, flash: 0, hitstun: 0,
  blocking: false,
  atk: null, // {kind, active, dmg, range, kb}
});

const bodyBox = (f) => {
  const w = 46, h = 96;
  return { x: f.x - w / 2, y: f.y - h, w, h };
};

const hitBox = (f) => {
  if (!f.atk || f.atk.active <= 0) return null;
  const reach = f.atk.range;
  const w = reach, h = f.atk.kind === "kick" ? 28 : 22;
  return { x: f.facing > 0 ? f.x + 8 : f.x - 8 - w, y: f.y - (f.atk.kind === "kick" ? 70 : 60), w, h };
};

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export default function StreetFighter({ onClose }) {
  const canvasRef = useRef(null);
  const p1 = useRef(makeFighter(280, 1, "#4ea1ff", "YOU"));
  const p2 = useRef(makeFighter(620, -1, "#ff4d4d", "CPU"));
  const keys = useRef({});
  const raf = useRef(0);
  const phase = useRef("fight"); // fight | ko | match
  const phaseTimer = useRef(0);
  const [, force] = useState(0);
  const tick = () => force((n) => n + 1);

  useEffect(() => {
    const onDown = (e) => {
      const k = e.key;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) e.preventDefault();
      keys.current[k] = true;
      if (k === "ArrowUp" && p1.current.state === "idle" && p1.current.vy === 0 && p1.current.y >= GROUND) {
        p1.current.vy = -14;
        p1.current.state = "idle";
      }
    };
    const onUp = (e) => { keys.current[e.key] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    let last = performance.now();

    const startAtk = (f, kind) => {
      if (f.state === "hit" || f.cd > 0 || f.hitstun > 0) return;
      f.state = kind;
      f.timer = kind === "kick" ? 22 : 14;
      f.cd = kind === "kick" ? 34 : 22;
      f.atk = { kind, active: kind === "kick" ? 8 : 6, dmg: kind === "kick" ? 13 : 6, range: kind === "kick" ? 70 : 48, kb: kind === "kick" ? 8 : 4 };
    };

    const cpu = (me, opp) => {
      const d = opp.x - me.x;
      const ad = Math.abs(d);
      me.facing = d > 0 ? 1 : -1;
      me.blocking = false;
      if (me.hitstun > 0 || me.state === "hit") return;
      // walk toward player when far
      if (ad > 80) { me.x += me.facing * 2.4; me.state = "walk"; }
      else {
        me.state = "idle";
        if (me.cd <= 0 && Math.random() < 0.05) {
          // sometimes block when player is attacking
          if (opp.atk && opp.atk.active > 0 && Math.random() < 0.5) me.blocking = true;
          else startAtk(me, Math.random() < 0.5 ? "punch" : "kick");
        }
      }
      // random jump
      if (me.y >= GROUND && Math.random() < 0.008) me.vy = -12;
    };

    const step = (f, opp, isP1) => {
      // gravity
      if (f.y < GROUND || f.vy < 0) {
        f.vy += GRAV;
        f.y += f.vy;
        if (f.y >= GROUND) { f.y = GROUND; f.vy = 0; }
      }
      if (f.timer > 0) f.timer--;
      if (f.cd > 0) f.cd--;
      if (f.flash > 0) f.flash--;
      if (f.hitstun > 0) f.hitstun--;
      if (f.atk) {
        if (f.atk.active > 0) f.atk.active--;
        if (f.timer <= 0) { f.atk = null; f.state = "idle"; }
      }
      if (f.state === "hit" && f.timer <= 0) f.state = "idle";

      if (isP1) {
        const k = keys.current;
        const moving = k["ArrowLeft"] || k["ArrowRight"];
        if (f.state !== "hit" && f.hitstun <= 0) {
          f.blocking = !!k["l"] || !!k["L"];
          if (k["ArrowLeft"]) { f.x -= 3.2; f.facing = -1; if (f.state !== "punch" && f.state !== "kick") f.state = "walk"; }
          else if (k["ArrowRight"]) { f.x += 3.2; f.facing = 1; if (f.state !== "punch" && f.state !== "kick") f.state = "walk"; }
          else if (f.state !== "punch" && f.state !== "kick" && f.state !== "hit") f.state = f.blocking ? "block" : "idle";
          if (k["j"] || k["J"]) startAtk(f, "punch");
          if (k["k"] || k["K"]) startAtk(f, "kick");
          if (moving && f.state === "walk") {}
        }
      } else {
        cpu(f, opp);
      }

      // resolve hits
      const hb = hitBox(f);
      if (hb) {
        const ob = bodyBox(opp);
        if (overlap(hb, ob) && !f._landed) {
          f._landed = true;
          const blocked = opp.blocking && ((opp.facing < 0 && f.x > opp.x) || (opp.facing > 0 && f.x < opp.x));
          const dmg = blocked ? Math.ceil(f.atk.dmg * 0.2) : f.atk.dmg;
          opp.hp = Math.max(0, opp.hp - dmg);
          opp.x += f.facing * (blocked ? f.atk.kb * 0.4 : f.atk.kb);
          opp.hitstun = blocked ? 6 : 12;
          if (!blocked) { opp.state = "hit"; opp.timer = 12; }
          opp.flash = 8;
          if (opp.hp <= 0 && phase.current === "fight") {
            phase.current = "ko"; phaseTimer.current = 90;
            f.wins++;
          }
        }
      }
      if (f.atk && f.atk.active <= 0) f._landed = false;

      // keep on stage
      f.x = Math.max(40, Math.min(W - 40, f.x));
    };

    const drawFighter = (f) => {
      const x = f.x, y = f.y;
      ctx.save();
      if (f.flash > 0 && f.flash % 4 < 2) ctx.globalAlpha = 0.5;
      // shadow
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath(); ctx.ellipse(x, GROUND + 4, 26, 7, 0, 0, Math.PI * 2); ctx.fill();
      // body
      ctx.fillStyle = f.color;
      const bw = 46, bh = 96;
      const bx = x - bw / 2, by = y - bh;
      ctx.fillRect(bx, by + 22, bw, bh - 22); // torso+legs
      // head
      ctx.fillRect(x - 16, by, 32, 26);
      // limb by state
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      if (f.state === "punch" || f.state === "kick") {
        const dir = f.facing;
        if (f.state === "punch") ctx.fillRect(x + (dir > 0 ? 10 : -40), by + 36, dir > 0 ? 40 : 40, 12);
        else ctx.fillRect(x + (dir > 0 ? 10 : -52), by + 24, dir > 0 ? 52 : 52, 16);
      } else if (f.state === "block") {
        ctx.fillStyle = "rgba(180,220,255,0.7)";
        ctx.fillRect(x + (f.facing > 0 ? 8 : -36), by + 30, 28, 50);
      } else if (f.state === "hit") {
        ctx.fillRect(x - 22, by + 30, 8, 30);
      }
      // eyes
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + (f.facing > 0 ? 2 : -12), by + 9, 10, 5);
      ctx.restore();
    };

    const draw = () => {
      // sky gradient stage
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#1a1140"); g.addColorStop(0.6, "#2a1850"); g.addColorStop(1, "#3a1f5a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // distant skyline
      ctx.fillStyle = "rgba(255,80,200,0.18)";
      for (let i = 0; i < 14; i++) { const bw = 40 + (i % 5) * 14; ctx.fillRect(40 + i * 60, 180 - (i % 4) * 30, bw, 200); }
      // ground
      ctx.fillStyle = "#0e0a1a"; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.strokeStyle = "rgba(120,80,255,0.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();

      drawFighter(p1.current);
      drawFighter(p2.current);

      // hit sparks
      [p1.current, p2.current].forEach((f) => {
        if (f.atk && f.atk.active > 0) {
          const hb = hitBox(f);
          if (hb) { ctx.fillStyle = "rgba(255,230,120,0.5)"; ctx.fillRect(hb.x, hb.y, hb.w, hb.h); }
        }
      });
    };

    const loop = (now) => {
      const dt = Math.min(40, now - last); last = now;
      if (phase.current === "fight") {
        step(p1.current, p2.current, true);
        step(p2.current, p1.current, false);
        // face each other when idle on ground
        if (p1.current.state === "idle") p1.current.facing = p2.current.x > p1.current.x ? 1 : -1;
      } else if (phase.current === "ko") {
        phaseTimer.current--;
        if (phaseTimer.current <= 0) {
          if (p1.current.wins >= 2 || p2.current.wins >= 2) { phase.current = "match"; phaseTimer.current = 0; }
          else {
            p1.current.hp = 100; p2.current.hp = 100;
            p1.current.x = 280; p2.current.x = 620;
            p1.current.state = p2.current.state = "idle";
            p1.current.atk = p2.current.atk = null;
            p1.current.hitstun = p2.current.hitstun = 0;
            phase.current = "fight";
          }
        }
      }
      draw();
      tick();
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const a = p1.current, b = p2.current;
  const Bar = ({ f, align }) => (
    <div className="flex-1">
      <div className="flex items-center gap-1.5 mb-0.5" style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        <span className="text-[12px] font-extrabold tracking-tight">{f.name}</span>
        <span className="flex gap-1">
          {[0, 1].map((i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${f.wins > i ? "bg-amber-300" : "bg-white/15"}`} />)}
        </span>
      </div>
      <div className={`h-3.5 rounded-full overflow-hidden bg-black/50 border border-white/15 ${align === "right" ? "scale-x-[-1]" : ""}`}>
        <div className="h-full rounded-full transition-all duration-150" style={{ width: `${Math.max(0, f.hp)}%`, background: f.color }} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/92 backdrop-blur-md p-2 sm:p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-2 px-1 pb-2">
          <Gamepad2 className="h-4 w-4 text-fuchsia-400" />
          <p className="text-sm font-semibold">Street Brawl</p>
          <span className="text-[10px] uppercase tracking-wide rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-white/60">2D fighter</span>
          <button onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20" title="Close"><X className="h-4 w-4" /></button>
        </div>

        <div className="mb-2 flex items-center gap-3">
          <Bar f={a} align="left" />
          <div className="shrink-0 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Round</p>
            <p className="text-[13px] font-extrabold">{a.wins + b.wins + 1}</p>
          </div>
          <Bar f={b} align="right" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black">
          <canvas ref={canvasRef} width={W} height={H} className="block w-full" style={{ imageRendering: "pixelated", aspectRatio: `${W}/${H}` }} />
          {phase.current === "ko" && (
            <div className="absolute inset-0 grid place-items-center bg-black/40">
              <div className="text-center animate-fade-in">
                <p className="font-display text-5xl font-black tracking-tighter text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">K.O.</p>
                <p className="mt-1 text-sm font-semibold text-white/80">{(a.hp <= 0 ? b : a).name} wins the round</p>
              </div>
            </div>
          )}
          {phase.current === "match" && (
            <div className="absolute inset-0 grid place-items-center bg-black/70">
              <div className="text-center">
                <p className="font-display text-4xl font-black tracking-tighter text-fuchsia-300">MATCH OVER</p>
                <p className="mt-2 text-base font-bold">{(a.wins >= 2 ? a : b).name} takes the bout</p>
                <div className="mt-4 flex justify-center gap-2">
                  <button onClick={() => { a.wins = 0; b.wins = 0; a.hp = 100; b.hp = 100; a.x = 280; b.x = 620; phase.current = "fight"; }} className="rounded-full bg-fuchsia-500 px-4 py-2 text-sm font-bold text-black">Rematch</button>
                  <button onClick={onClose} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-white/55">
          <span><kbd className="rounded bg-white/10 px-1.5 py-0.5">←/→</kbd> move</span>
          <span><kbd className="rounded bg-white/10 px-1.5 py-0.5">↑</kbd> jump</span>
          <span><kbd className="rounded bg-white/10 px-1.5 py-0.5">J</kbd> punch</span>
          <span><kbd className="rounded bg-white/10 px-1.5 py-0.5">K</kbd> kick</span>
          <span><kbd className="rounded bg-white/10 px-1.5 py-0.5">L</kbd> block</span>
        </div>
      </div>
    </div>
  );
}