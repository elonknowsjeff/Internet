import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Gamepad2 } from "lucide-react";

const MAZE = [
  "###################",
  "#........#........#",
  "#o##.###.#.###.##o#",
  "#.................#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.###.#.###.####",
  "#....#.......#....#",
  "#.##.#.#####.#.##.#",
  "#....#...#...#....#",
  "####.###.#.###.####",
  "#....#...#...#....#",
  "#.##.#.#####.#.##.#",
  "#....#.......#....#",
  "####.###.#.###.####",
  "#....#...#...#....#",
  "#.##.#.#####.#.##.#",
  "#.................#",
  "#o##.###.#.###.##o#",
  "#........#........#",
  "###################",
];
const ROWS = MAZE.length, COLS = MAZE[0].length, CELL = 18;
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const OPP = { up: "down", down: "up", left: "right", right: "left" };
const isWall = (r, c) => r < 0 || c < 0 || r >= ROWS || c >= COLS || MAZE[r][c] === "#";
const GHOST_COLORS = ["#ff4d6d", "#4dd2ff", "#ffb84d"];

function initialState() {
  const dots = new Set(), power = new Set();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const ch = MAZE[r][c];
    if (ch === ".") dots.add(`${r},${c}`);
    if (ch === "o") { power.add(`${r},${c}`); dots.add(`${r},${c}`); }
  }
  return {
    dots, power,
    pac: { r: 17, c: 9, dir: "left", next: "left" },
    ghosts: [
      { r: 3, c: 4, dir: "right", color: GHOST_COLORS[0] },
      { r: 3, c: 9, dir: "down", color: GHOST_COLORS[1] },
      { r: 3, c: 14, dir: "left", color: GHOST_COLORS[2] },
    ],
    score: 0, lives: 3, powerTimer: 0, status: "ready", mouth: 0,
  };
}

export default function PacMan({ onClose }) {
  const canvasRef = useRef(null);
  const game = useRef(initialState());
  const [hud, setHud] = useState({ score: 0, lives: 3, status: "ready" });

  const draw = useCallback(() => {
    const g = game.current; const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#050510"; ctx.fillRect(0, 0, COLS * CELL, ROWS * CELL);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === "#") {
        ctx.fillStyle = "#1b2a6b"; ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
        ctx.strokeStyle = "#2a3fa0"; ctx.lineWidth = 1; ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
      }
    }
    g.dots.forEach((k) => { const [r, c] = k.split(",").map(Number); const isPow = g.power.has(k);
      ctx.fillStyle = isPow ? "#ffd6a0" : "#ffe066";
      ctx.beginPath(); ctx.arc(c * CELL + CELL / 2, r * CELL + CELL / 2, isPow ? 5 : 2, 0, 7); ctx.fill();
    });
    // pacman
    const p = g.pac; const px = p.c * CELL + CELL / 2, py = p.r * CELL + CELL / 2;
    const ang = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[p.dir];
    const m = (Math.sin(g.mouth) + 1) / 2 * 0.5;
    ctx.fillStyle = "#ffe600";
    ctx.beginPath(); ctx.moveTo(px, py);
    ctx.arc(px, py, CELL / 2 - 1, ang + m, ang - m + Math.PI * 2); ctx.closePath(); ctx.fill();
    // ghosts
    g.ghosts.forEach((gh) => {
      const gx = gh.c * CELL + CELL / 2, gy = gh.r * CELL + CELL / 2;
      ctx.fillStyle = g.powerTimer > 0 ? "#4040ff" : gh.color;
      ctx.beginPath(); ctx.arc(gx, gy - 1, CELL / 2 - 1, Math.PI, 0); ctx.lineTo(gx + CELL / 2 - 1, gy + CELL / 2 - 1);
      ctx.lineTo(gx + CELL / 4, gy + CELL / 3); ctx.lineTo(gx, gy + CELL / 2 - 1); ctx.lineTo(gx - CELL / 4, gy + CELL / 3); ctx.lineTo(gx - CELL / 2 + 1, gy + CELL / 2 - 1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(gx - 3, gy - 3, 2, 0, 7); ctx.arc(gx + 3, gy - 3, 2, 0, 7); ctx.fill();
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(gx - 3, gy - 3, 1, 0, 7); ctx.arc(gx + 3, gy - 3, 1, 0, 7); ctx.fill();
    });
  }, []);

  const step = useCallback(() => {
    const g = game.current;
    if (g.status !== "playing") return;
    g.mouth += 0.4;
    const p = g.pac;
    if (p.next && !isWall(p.r + DIRS[p.next][0], p.c + DIRS[p.next][1])) p.dir = p.next;
    if (!isWall(p.r + DIRS[p.dir][0], p.c + DIRS[p.dir][1])) { p.r += DIRS[p.dir][0]; p.c += DIRS[p.dir][1]; }
    const key = `${p.r},${p.c}`;
    if (g.power.has(key)) { g.power.delete(key); g.powerTimer = 28; g.score += 50; }
    if (g.dots.has(key)) { g.dots.delete(key); g.score += 10; }
    g.ghosts.forEach((gh) => {
      const opts = Object.keys(DIRS).filter((d) => d !== OPP[gh.dir] && !isWall(gh.r + DIRS[d][0], gh.c + DIRS[d][1]));
      let choices = opts.length ? opts : Object.keys(DIRS).filter((d) => !isWall(gh.r + DIRS[d][0], gh.c + DIRS[d][1]));
      if (Math.random() < 0.2 || !choices.length) choices = Object.keys(DIRS).filter((d) => !isWall(gh.r + DIRS[d][0], gh.c + DIRS[d][1]));
      if (choices.length) {
        const best = choices.reduce((a, b) => {
          const da = Math.abs(gh.r + DIRS[a][0] - p.r) + Math.abs(gh.c + DIRS[a][1] - p.c);
          const db = Math.abs(gh.r + DIRS[b][0] - p.r) + Math.abs(gh.c + DIRS[b][1] - p.c);
          return db < da ? b : a;
        });
        gh.dir = best; gh.r += DIRS[best][0]; gh.c += DIRS[best][1];
      }
    });
    if (g.powerTimer > 0) g.powerTimer--;
    g.ghosts.forEach((gh) => {
      if (gh.r === p.r && gh.c === p.c) {
        if (g.powerTimer > 0) { g.score += 200; gh.r = 3; gh.c = 9; gh.dir = "down"; }
        else { g.lives--; if (g.lives <= 0) { g.status = "over"; } else { g.pac = { r: 17, c: 9, dir: "left", next: "left" }; g.ghosts.forEach((x, i) => { x.r = 3; x.c = 4 + i * 5; x.dir = "down"; }); } }
      }
    });
    if (g.dots.size === 0) g.status = "win";
    setHud({ score: g.score, lives: g.lives, status: g.status });
  }, []);

  useEffect(() => {
    draw();
    const tick = setInterval(() => { step(); draw(); }, 130);
    const onKey = (e) => {
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
      const d = map[e.key]; if (d) { e.preventDefault(); game.current.pac.next = d; if (game.current.status === "ready") game.current.status = "playing"; }
    };
    window.addEventListener("keydown", onKey);
    let touchStart = null;
    const canvas = canvasRef.current;
    const onTouch = (e) => { touchStart = e.touches[0]; };
    const onTouchEnd = (e) => { if (!touchStart) return; const t = e.changedTouches[0]; const dx = t.clientX - touchStart.clientX, dy = t.clientY - touchStart.clientY;
      if (Math.abs(dx) > Math.abs(dy)) game.current.pac.next = dx > 0 ? "right" : "left"; else game.current.pac.next = dy > 0 ? "down" : "up";
      if (game.current.status === "ready") game.current.status = "playing"; };
    canvas?.addEventListener("touchstart", onTouch, { passive: true });
    canvas?.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => { clearInterval(tick); window.removeEventListener("keydown", onKey); canvas?.removeEventListener("touchstart", onTouch); canvas?.removeEventListener("touchend", onTouchEnd); };
  }, [step, draw]);

  const reset = () => { game.current = initialState(); setHud({ score: 0, lives: 3, status: "ready" }); draw(); };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-between w-full max-w-md mb-3">
        <h2 className="text-lg font-bold font-display flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-amber-400" /> Pac-Man</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex gap-4 text-sm mb-2"><span className="text-amber-400">Score: {hud.score}</span><span className="text-rose-400">Lives: {"❤".repeat(hud.lives)}</span></div>
      <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className="rounded-lg border border-white/10 touch-none" />
      <p className="text-xs text-neutral-500 mt-3 text-center">Arrow keys / WASD or swipe to move · eat all dots, grab the big pellets to chomp ghosts.</p>
      {hud.status !== "playing" && hud.status !== "ready" && (
        <div className="mt-3 text-center">
          <p className="font-bold text-lg mb-2">{hud.status === "win" ? "🎉 You cleared the maze!" : "Game Over"}</p>
          <button onClick={reset} className="px-5 py-2 rounded-full bg-amber-500 text-black font-semibold text-sm">Play again</button>
        </div>
      )}
      {hud.status === "ready" && <p className="mt-3 text-amber-400 font-semibold animate-pulse">Press a key to start</p>}
    </div>
  );
}