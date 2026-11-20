import React, { useState, useEffect, useRef } from "react";
import {
  Apple, Monitor, Sparkles, LayoutGrid, Wifi, BatteryFull, Volume2, Minimize2, Search as SearchIcon,
} from "lucide-react";
import { APPS, DOCK, SYSTEM } from "@/components/os/desktopApps";
import WindowFrame from "@/components/desktop/WindowFrame";
import DesktopSearch from "@/components/os/DesktopSearch";
import AppGrid from "@/components/os/AppGrid";
import BrandLogo from "@/components/BrandLogo";

const WALLS = {
  nebula: "radial-gradient(120% 90% at 12% -10%, rgba(168,85,247,0.5), transparent 58%), radial-gradient(90% 70% at 92% 6%, rgba(56,189,248,0.34), transparent 55%), linear-gradient(165deg,#0a0716 0%,#05060c 72%)",
  aurora: "radial-gradient(110% 80% at 50% 112%, rgba(139,92,246,0.38), transparent 62%), radial-gradient(80% 60% at 16% 0%, rgba(217,70,239,0.3), transparent 60%), linear-gradient(180deg,#0d0718 0%,#05060f 72%)",
  ocean: "radial-gradient(110% 80% at 20% 10%, rgba(10,132,255,0.4), transparent 58%), radial-gradient(90% 70% at 88% 80%, rgba(99,102,241,0.36), transparent 60%), linear-gradient(165deg,#060b1a 0%,#05060f 72%)",
};
const WALL_KEYS = Object.keys(WALLS);
const OS_KEY = "vazolex_os";
const WALL_KEY = "vazolex_wall";
const CAT_MAP = { social: "feed", entertainment: "movies", tech: "web", news: "news", food: "eats", gaming: "gaming", aichat: "assistant" };

export default function DesktopOS() {
  const [wins, setWins] = useState([]);
  const [os, setOs] = useState(() => localStorage.getItem(OS_KEY) || "windows");
  const [wall, setWall] = useState(() => WALL_KEYS.includes(localStorage.getItem(WALL_KEY)) ? localStorage.getItem(WALL_KEY) : "nebula");
  const [grid, setGrid] = useState(false);
  const [now, setNow] = useState(new Date());
  const zRef = useRef(20);
  const booted = useRef(false);
  const nextZ = () => ++zRef.current;

  useEffect(() => { localStorage.setItem(OS_KEY, os); }, [os]);
  useEffect(() => { localStorage.setItem(WALL_KEY, wall); }, [wall]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(t); }, []);

  const openApp = (key) => {
    if (!APPS[key]) return;
    setWins((prev) => {
      const ex = prev.find((w) => w.key === key);
      if (ex) return prev.map((w) => (w.key === key ? { ...w, min: false, z: nextZ() } : w));
      return [...prev, { key, min: false, max: false, z: nextZ() }];
    });
  };
  const focusWin = (key) => setWins((p) => p.map((w) => (w.key === key ? { ...w, z: nextZ(), min: false } : w)));
  const closeWin = (key) => setWins((p) => p.filter((w) => w.key !== key));
  const minWin = (key) => setWins((p) => p.map((w) => (w.key === key ? { ...w, min: true } : w)));
  const toggleMax = (key) => setWins((p) => p.map((w) => (w.key === key ? { ...w, max: !w.max, z: nextZ() } : w)));
  const showDesktop = () => setWins((p) => p.map((w) => ({ ...w, min: true })));

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat") || "social";
    openApp(CAT_MAP[cat] || "feed");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = wins.filter((w) => !w.min).sort((a, b) => a.z - b.z);
  const topZ = visible.length ? visible[visible.length - 1].z : 0;
  const isMac = os === "macos";
  const clock = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const DockBtn = ({ k }) => {
    const app = APPS[k];
    if (!app) return null;
    const win = wins.find((w) => w.key === k);
    const running = !!win;
    const isActive = running && !win.min && win.z === topZ;
    return (
      <button onClick={() => openApp(k)} title={app.name} className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors hover:bg-white/10">
        {isActive && <span className="absolute inset-0 rounded-2xl" style={{ background: "color-mix(in srgb, var(--brand) 20%, transparent)" }} />}
        <app.icon className="relative h-[21px] w-[21px]" style={{ color: running ? "var(--brand)" : "rgba(255,255,255,0.72)" }} />
        {running && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: "var(--brand)" }} />}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-20 overflow-hidden select-none">
      <div className="absolute inset-0 transition-all duration-700" style={{ background: WALLS[wall] }} />
      <div className="pointer-events-none absolute -left-24 top-24 w-[420px] h-[420px] rounded-full blur-[120px] opacity-30" style={{ background: "var(--brand)" }} />
      <div className="pointer-events-none absolute right-0 bottom-24 w-[380px] h-[380px] rounded-full blur-[130px] opacity-20" style={{ background: "var(--brand-2)" }} />

      {/* top menu bar */}
      <div className="absolute top-0 inset-x-0 z-40 flex items-center gap-3 h-11 px-3 sm:px-4 backdrop-blur-xl bg-black/35 border-b border-white/10">
        <button onClick={() => setWins([])} className="flex items-center gap-2 shrink-0 hover:opacity-90" title="Show desktop">
          <BrandLogo size={20} />
          <span className="text-[13px] font-semibold tracking-tight hidden sm:block">Vazolex Plus</span>
        </button>
        <div className="flex-1 flex justify-center">
          <DesktopSearch onOpen={openApp} />
        </div>
        <div className="flex items-center gap-1.5 shrink-0 text-white/70">
          <button onClick={() => setWall((w) => WALL_KEYS[(WALL_KEYS.indexOf(w) + 1) % WALL_KEYS.length])} title="Wallpaper" className="w-8 h-8 rounded-full grid place-items-center hover:bg-white/10"><Sparkles className="w-4 h-4" /></button>
          <button onClick={showDesktop} title="Show desktop" className="w-8 h-8 rounded-full grid place-items-center hover:bg-white/10"><Minimize2 className="w-4 h-4" /></button>
          <button onClick={() => setOs(isMac ? "windows" : "macos")} title={isMac ? "Switch to Windows" : "Switch to macOS"} className="w-8 h-8 rounded-full grid place-items-center hover:bg-white/10">{isMac ? <Monitor className="w-4 h-4" /> : <Apple className="w-4 h-4" />}</button>
          <span className="hidden sm:flex items-center gap-2 text-[12px] tabular-nums pl-1">
            <Volume2 className="w-3.5 h-3.5" /><Wifi className="w-3.5 h-3.5" /><BatteryFull className="w-3.5 h-3.5" />
            <span className="opacity-70">{date}</span><span className="opacity-40">·</span><span>{clock}</span>
          </span>
        </div>
      </div>

      {/* windows */}
      {visible.map((w, i) => {
        const app = APPS[w.key];
        if (!app) return null;
        const Comp = app.Comp;
        return (
          <WindowFrame
            key={w.key}
            title={app.name}
            Icon={app.icon}
            variant={os}
            width={app.w}
            height={app.h}
            maximized={w.max}
            zIndex={w.z}
            active={w.z === topZ}
            initial={{ x: 80 + i * 26, y: 60 + i * 22 }}
            onFocus={() => focusWin(w.key)}
            onClose={() => closeWin(w.key)}
            onMinimize={() => minWin(w.key)}
            onMaximize={() => toggleMax(w.key)}
          >
            <div className="os-win-body h-full w-full"><Comp /></div>
          </WindowFrame>
        );
      })}

      {/* taskbar / dock */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex justify-center px-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-1 max-w-[calc(100vw-1rem)] overflow-x-auto scrollbar-none rounded-2xl border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.95)]">
          <button onClick={() => setGrid(true)} title="All apps" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl hover:bg-white/10 text-white/70"><LayoutGrid className="w-5 h-5" /></button>
          <span className="mx-0.5 h-6 w-px bg-white/10 shrink-0" />
          {DOCK.map((k) => <DockBtn key={k} k={k} />)}
          <span className="mx-0.5 h-6 w-px bg-white/10 shrink-0" />
          {SYSTEM.map((k) => <DockBtn key={k} k={k} />)}
        </div>
      </div>

      {grid && <AppGrid onOpen={(k) => { openApp(k); setGrid(false); }} onClose={() => setGrid(false)} />}
    </div>
  );
}