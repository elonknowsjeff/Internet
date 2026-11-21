import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen, Calculator as CalcIcon, Settings as Gear, Music2,
  Car, Clapperboard, Film, Newspaper, MessageSquare, StickyNote, CalendarDays, Cloud, Plane,
  BedDouble, Heart, Store, Sparkles, ListChecks, Hash, Apple, Monitor, Minimize2, LayoutGrid, Tv, Globe,
} from "lucide-react";
import WindowFrame from "@/components/desktop/WindowFrame";
import CalculatorApp from "@/components/desktop/CalculatorApp";
import FilesApp from "@/components/desktop/FilesApp";
import SettingsApp from "@/components/desktop/SettingsApp";
import TasksApp from "@/components/desktop/TasksApp";
import NotesApp from "@/components/desktop/NotesApp";
import AiChatsApp from "@/components/desktop/AiChatsApp";
import Launchpad from "@/components/desktop/Launchpad";
import WallpaperPicker, { WALLPAPER_IMAGES } from "@/components/desktop/WallpaperPicker";
import BrandLogo from "@/components/BrandLogo";

const WINDOW_APPS = [
  { id: "aichats", name: "AI chats", Icon: Sparkles, width: 720, height: 520 },
  { id: "tasks", name: "To Do", Icon: ListChecks, width: 620, height: 540 },
  { id: "notes", name: "Notes", Icon: StickyNote, width: 720, height: 480 },
  { id: "files", name: "Cloud files", Icon: FolderOpen, width: 720, height: 500 },
  { id: "calc", name: "Calculator", Icon: CalcIcon, width: 300, height: 460 },
  { id: "settings", name: "Settings", Icon: Gear, width: 380, height: 520 },
];

const SHORTCUTS = [
  { name: "Feed", to: "/", Icon: Hash },
  { name: "Music", to: "/music", Icon: Music2 },
  { name: "Cable TV", to: "/cable", Icon: Tv },
  { name: "Browser", to: "/browser", Icon: Globe },
  { name: "Video", to: "/video", Icon: Film },
  { name: "News", to: "/news", Icon: Newspaper },
  { name: "Messages", to: "/messages", Icon: MessageSquare },
  { name: "Calendar", to: "/calendar", Icon: CalendarDays },
  { name: "Cloud", to: "/cloud", Icon: Cloud },
  { name: "Flights", to: "/flights", Icon: Plane },
  { name: "Hotels", to: "/hotels", Icon: BedDouble },
  { name: "Dating", to: "/dating", Icon: Heart },
  { name: "Market", to: "/market", Icon: Store },
];

const WALLS = {
  nebula: {
    label: "Nebula",
    css: "radial-gradient(120% 90% at 12% -10%, rgba(168,85,247,0.55), transparent 58%), radial-gradient(90% 70% at 92% 6%, rgba(56,189,248,0.36), transparent 55%), linear-gradient(165deg,#0a0716 0%,#05060c 72%)",
  },
  ember: {
    label: "Ember",
    css: "radial-gradient(120% 90% at 84% -12%, rgba(244,114,182,0.42), transparent 60%), radial-gradient(90% 70% at 6% 24%, rgba(168,85,247,0.34), transparent 55%), linear-gradient(170deg,#160a1c 0%,#070509 72%)",
  },
  aurora: {
    label: "Aurora",
    css: "radial-gradient(110% 80% at 50% 112%, rgba(139,92,246,0.38), transparent 62%), radial-gradient(80% 60% at 16% 0%, rgba(217,70,239,0.32), transparent 60%), linear-gradient(180deg,#0d0718 0%,#05060f 72%)",
  },
  lagoon: {
    label: "Lagoon",
    css: "radial-gradient(110% 80% at 20% 10%, rgba(168,85,247,0.4), transparent 58%), radial-gradient(90% 70% at 88% 80%, rgba(99,102,241,0.38), transparent 60%), linear-gradient(165deg,#0b0619 0%,#06050f 72%)",
  },
  plum: {
    label: "Plum dawn",
    css: "radial-gradient(120% 90% at 70% 0%, rgba(244,114,182,0.35), transparent 60%), radial-gradient(90% 70% at 10% 90%, rgba(139,92,246,0.4), transparent 60%), linear-gradient(180deg,#150a20 0%,#080611 72%)",
  },
};
const PHOTO_WALLS = Object.fromEntries(
  WALLPAPER_IMAGES.map((w) => [w.id, { label: w.label, url: w.url }])
);
const ALL_WALLS = { ...WALLS, ...PHOTO_WALLS };
const WALL_ORDER = [...Object.keys(WALLS), ...Object.keys(PHOTO_WALLS)];
const OS_KEY = "si_desktop_os";
const WALL_KEY = "si_desktop_wall";
const WALL_AUTO_KEY = "si_desktop_wall_auto";

const appMeta = (id) => WINDOW_APPS.find((a) => a.id === id);

export default function Desktop() {
  const navigate = useNavigate();
  const [wins, setWins] = useState([]);
  const [now, setNow] = useState(new Date());
  const [os, setOs] = useState(() => localStorage.getItem(OS_KEY) || "macos");
  const [wall, setWall] = useState(() => {
    const saved = localStorage.getItem(WALL_KEY);
    return ALL_WALLS[saved] ? saved : "nebula";
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [launch, setLaunch] = useState(false);
  const [autoWall, setAutoWall] = useState(() => localStorage.getItem(WALL_AUTO_KEY) === "1");
  const zRef = useRef(20);
  const nextZ = () => ++zRef.current;

  useEffect(() => { localStorage.setItem(OS_KEY, os); }, [os]);
  useEffect(() => { localStorage.setItem(WALL_KEY, wall); }, [wall]);
  useEffect(() => { localStorage.setItem(WALL_AUTO_KEY, autoWall ? "1" : "0"); }, [autoWall]);
  useEffect(() => {
    if (!autoWall) return;
    const t = setInterval(() => setWall((w) => WALL_ORDER[(WALL_ORDER.indexOf(w) + 1) % WALL_ORDER.length]), 30000);
    return () => clearInterval(t);
  }, [autoWall]);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const openApp = (id) => {
    if (!appMeta(id)) return;
    setWins((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) return prev.map((w) => (w.id === id ? { ...w, min: false, z: nextZ() } : w));
      return [...prev, { id, min: false, max: false, z: nextZ() }];
    });
  };
  const focusApp = (id) => setWins((prev) => prev.map((w) => (w.id === id ? { ...w, z: nextZ(), min: false } : w)));
  const closeApp = (id) => setWins((prev) => prev.filter((w) => w.id !== id));
  const minimizeApp = (id) => setWins((prev) => prev.map((w) => (w.id === id ? { ...w, min: true } : w)));
  const toggleMax = (id) => setWins((prev) => prev.map((w) => (w.id === id ? { ...w, max: !w.max, z: nextZ() } : w)));
  const showDesktop = () => setWins((prev) => prev.map((w) => ({ ...w, min: true })));

  const visible = wins.filter((w) => !w.min).sort((a, b) => a.z - b.z);
  const topZ = visible.length ? visible[visible.length - 1].z : 0;
  const isMac = os === "macos";
  const clock = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const dateLine = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

  const launchItems = [
    ...WINDOW_APPS.map((a) => ({ key: a.id, name: a.name, Icon: a.Icon, appId: a.id })),
    ...SHORTCUTS.map((s) => ({ key: s.to, name: s.name, Icon: s.Icon, to: s.to })),
  ];
  const onOpen = (item) => (item.appId ? openApp(item.appId) : navigate(item.to));

  return (
    <div className="relative w-full h-[calc(100dvh-112px)] min-h-[520px] overflow-hidden select-none">
      {/* Wallpaper */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: ALL_WALLS[wall]?.url
            ? `linear-gradient(180deg, rgba(8,5,20,0.35), rgba(5,4,12,0.62)), url(${ALL_WALLS[wall].url}) center/cover no-repeat`
            : ALL_WALLS[wall]?.css,
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-24 w-[420px] h-[420px] rounded-full blur-[110px] opacity-30" style={{ background: "var(--brand)" }} />
      <div className="pointer-events-none absolute right-0 bottom-10 w-[380px] h-[380px] rounded-full blur-[120px] opacity-20" style={{ background: "var(--brand-2)" }} />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-40 flex items-center gap-3 h-11 px-3 sm:px-4 backdrop-blur-xl bg-black/35 border-b border-white/10">
        <div className="flex items-center gap-2 shrink-0">
          <BrandLogo size={18} />
          <span className="text-[13px] font-semibold tracking-tight hidden sm:block">Internet X</span>
        </div>
        <button
          onClick={() => setLaunch(true)}
          className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[12px] font-medium shrink-0"
        >
          <LayoutGrid className="w-4 h-4" /> Apps
        </button>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-2 text-[12px] text-white/70 tabular-nums shrink-0">
          <span>{dateLine}</span><span className="opacity-40">·</span><span>{clock}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setPickerOpen(true)} title="Wallpaper" className="w-8 h-8 rounded-full grid place-items-center hover:bg-white/10 text-white/70"><Sparkles className="w-4 h-4" /></button>
          <button onClick={showDesktop} title="Show desktop" className="w-8 h-8 rounded-full grid place-items-center hover:bg-white/10 text-white/70"><Minimize2 className="w-4 h-4" /></button>
          <button onClick={() => setOs(isMac ? "windows" : "macos")} title={isMac ? "Switch to Windows" : "Switch to macOS"} className="w-8 h-8 rounded-full grid place-items-center hover:bg-white/10 text-white/70">{isMac ? <Apple className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}</button>
        </div>
      </div>

      {/* Windows */}
      {visible.map((w) => {
        const m = appMeta(w.id);
        if (!m) return null;
        const index = visible.findIndex((x) => x.id === w.id);
        return (
          <WindowFrame
            key={w.id}
            title={m.name}
            Icon={m.Icon}
            variant={os}
            width={m.width}
            height={m.height}
            maximized={w.max}
            zIndex={w.z}
            active={w.z === topZ}
            initial={{ x: 100 + index * 34, y: 72 + index * 26 }}
            onFocus={() => focusApp(w.id)}
            onClose={() => closeApp(w.id)}
            onMinimize={() => minimizeApp(w.id)}
            onMaximize={() => toggleMax(w.id)}
          >
            {w.id === "aichats" ? <AiChatsApp /> : null}
            {w.id === "tasks" ? <TasksApp /> : null}
            {w.id === "notes" ? <NotesApp /> : null}
            {w.id === "calc" ? <CalculatorApp /> : null}
            {w.id === "files" ? <FilesApp /> : null}
            {w.id === "settings" ? <SettingsApp /> : null}
          </WindowFrame>
        );
      })}

      {/* Minimized tray */}
      {wins.some((w) => w.min) && (
        <div className="absolute right-3 bottom-3 z-40 flex items-center gap-1.5 gloss-strong rounded-full px-2 py-1.5">
          {wins.filter((w) => w.min).map((w) => {
            const m = appMeta(w.id);
            if (!m) return null;
            return (
              <button key={w.id} onClick={() => focusApp(w.id)} title={`Restore ${m.name}`} className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/10 text-[11px] font-semibold">
                <m.Icon className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> {m.name}
              </button>
            );
          })}
        </div>
      )}

      {launch && <Launchpad items={launchItems} onOpen={onOpen} onClose={() => setLaunch(false)} />}

      {pickerOpen && (
        <WallpaperPicker
          current={wall}
          auto={autoWall}
          onAuto={() => setAutoWall((v) => !v)}
          onPick={(id) => setWall(id)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}