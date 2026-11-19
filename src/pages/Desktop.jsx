import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe, FolderOpen, Calculator as CalcIcon, Settings as Gear, Trash2, Music2, UtensilsCrossed,
  Car, Clapperboard, Film, Newspaper, Mail, StickyNote, CalendarDays, Cloud, Gamepad2, Plane,
  BedDouble, Heart, ShoppingBag, Store, MessageSquare, Sparkles, ListChecks,
} from "lucide-react";
import WindowFrame from "@/components/desktop/WindowFrame";
import CalculatorApp from "@/components/desktop/CalculatorApp";
import FilesApp from "@/components/desktop/FilesApp";
import TrashApp from "@/components/desktop/TrashApp";
import SettingsApp from "@/components/desktop/SettingsApp";
import TasksApp from "@/components/desktop/TasksApp";
import NotesApp from "@/components/desktop/NotesApp";
import Win11Bar from "@/components/os/Win11Bar";
import MacBar from "@/components/os/MacBar";
import DesktopIcons from "@/components/desktop/DesktopIcons";
import AppTabs from "@/components/desktop/AppTabs";
import AiChatsApp from "@/components/desktop/AiChatsApp";
import WallpaperPicker, { WALLPAPER_IMAGES } from "@/components/desktop/WallpaperPicker";

const WINDOW_APPS = [
  { id: "aichats", name: "AI chats", Icon: Sparkles, width: 720, height: 520, tone: "from-fuchsia-300 to-purple-600" },
  { id: "tasks", name: "To Do", Icon: ListChecks, width: 620, height: 540, tone: "from-fuchsia-300 to-purple-600" },
  { id: "notes", name: "Notes", Icon: StickyNote, width: 720, height: 480, tone: "from-purple-200 to-violet-500" },
  { id: "files", name: "Cloud files", Icon: FolderOpen, width: 720, height: 500, tone: "from-indigo-300 to-violet-600" },
  { id: "calc", name: "Calculator", Icon: CalcIcon, width: 300, height: 460, tone: "from-violet-200 to-purple-500" },
  { id: "settings", name: "Settings", Icon: Gear, width: 380, height: 520, tone: "from-fuchsia-200 to-violet-600" },
  { id: "trash", name: "Recycle Bin", Icon: Trash2, width: 620, height: 440, tone: "from-indigo-200 to-purple-700" },
];

const SHORTCUTS = [
  { name: "Music", to: "/music", Icon: Music2, tone: "from-fuchsia-300 to-purple-600" },
  { name: "Rides", to: "/rides", Icon: Car, tone: "from-purple-300 to-indigo-600" },
  { name: "Movies", to: "/movies", Icon: Clapperboard, tone: "from-indigo-300 to-fuchsia-700" },
  { name: "Video", to: "/video", Icon: Film, tone: "from-fuchsia-300 to-violet-700" },
  { name: "News", to: "/news", Icon: Newspaper, tone: "from-violet-300 to-purple-700" },
  { name: "Messages", to: "/messages", Icon: MessageSquare, tone: "from-fuchsia-300 to-violet-600" },
  { name: "Calendar", to: "/calendar", Icon: CalendarDays, tone: "from-indigo-300 to-purple-600" },
  { name: "Cloud", to: "/cloud", Icon: Cloud, tone: "from-violet-200 to-indigo-600" },
  { name: "Flights", to: "/flights", Icon: Plane, tone: "from-purple-300 to-violet-700" },
  { name: "Hotels", to: "/hotels", Icon: BedDouble, tone: "from-violet-300 to-indigo-500" },
  { name: "Dating", to: "/dating", Icon: Heart, tone: "from-fuchsia-300 to-purple-500" },
  { name: "Market", to: "/market", Icon: Store, tone: "from-violet-300 to-purple-500" },
];

const byTo = (to) => SHORTCUTS.find((s) => s.to === to);
// each OS keeps its own set of apps on the bar
const WIN_SHORTCUTS = ["/music", "/messages", "/market"].map(byTo).filter(Boolean);
const MAC_SHORTCUTS = ["/music", "/messages", "/news", "/movies", "/calendar"].map(byTo).filter(Boolean);
const WIN_PINNED = [
  ...WINDOW_APPS.filter((a) => ["files", "tasks", "notes", "calc"].includes(a.id)).map((a) => ({ key: a.id, name: a.name, Icon: a.Icon, appId: a.id })),
  ...["/music", "/market"].map(byTo).filter(Boolean).map((s) => ({ key: s.to, name: s.name, Icon: s.Icon, to: s.to })),
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

const ICON_ITEMS = [
  ...WINDOW_APPS.map((a) => ({ key: `app:${a.id}`, name: a.name, Icon: a.Icon, tone: a.tone, appId: a.id })),
  ...SHORTCUTS.map((s) => ({ key: `go:${s.to}`, name: s.name, Icon: s.Icon, tone: s.tone, to: s.to })),
];

const appMeta = (id) => WINDOW_APPS.find((a) => a.id === id);

export default function Desktop() {
  const navigate = useNavigate();
  const [wins, setWins] = useState([]);
  const [now, setNow] = useState(new Date());
  const [os, setOs] = useState(() => localStorage.getItem(OS_KEY) || "windows");
  const [wall, setWall] = useState(() => {
    const saved = localStorage.getItem(WALL_KEY);
    return ALL_WALLS[saved] ? saved : "nebula";
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [autoWall, setAutoWall] = useState(() => localStorage.getItem(WALL_AUTO_KEY) === "1");
  const zRef = useRef(20);
  const nextZ = () => ++zRef.current;

  useEffect(() => { localStorage.setItem(OS_KEY, os); }, [os]);
  useEffect(() => { localStorage.setItem(WALL_KEY, wall); }, [wall]);
  useEffect(() => { localStorage.setItem(WALL_AUTO_KEY, autoWall ? "1" : "0"); }, [autoWall]);
  useEffect(() => {
    if (!autoWall) return;
    const t = setInterval(() => {
      setWall((w) => WALL_ORDER[(WALL_ORDER.indexOf(w) + 1) % WALL_ORDER.length]);
    }, 30000);
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
  const cycleWall = () => setPickerOpen(true);

  const visible = wins.filter((w) => !w.min).sort((a, b) => a.z - b.z);
  const topZ = visible.length ? visible[visible.length - 1].z : 0;
  const isMac = os === "macos";
  const clock = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const dateLine = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className={`relative w-full h-[calc(100dvh-112px)] min-h-[560px] overflow-hidden select-none ${isMac ? "rounded-b-2xl" : ""}`}>
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: ALL_WALLS[wall]?.url
            ? `linear-gradient(180deg, rgba(8,5,20,0.35), rgba(5,4,12,0.62)), url(${ALL_WALLS[wall].url}) center/cover no-repeat`
            : ALL_WALLS[wall]?.css,
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-24 w-[420px] h-[420px] rounded-full blur-[110px] opacity-35" style={{ background: "var(--brand)" }} />
      <div className="pointer-events-none absolute right-0 bottom-16 w-[380px] h-[380px] rounded-full blur-[120px] opacity-25" style={{ background: "var(--brand-2)" }} />

      {isMac && (
        <MacBar apps={WINDOW_APPS} shortcuts={MAC_SHORTCUTS} os={os} openApp={openApp} wins={wins} focusApp={focusApp} now={now} setOs={setOs} onWall={cycleWall} onShowDesktop={showDesktop} />
      )}

      {/* All apps as tabs, Windows 11 style */}
      <AppTabs windowApps={WINDOW_APPS} wins={wins} onOpenApp={openApp} />

      {/* Desktop icons — drag any of them anywhere */}
      <DesktopIcons
        items={ICON_ITEMS}
        topOffset={16}
        onOpen={(item) => (item.appId ? openApp(item.appId) : navigate(item.to))}
      />

      {/* Clock widget (Windows) */}
      {!isMac && (
        <div className="hidden lg:block absolute right-4 top-4 z-10 w-[228px] gloss-strong rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Windows 11 · Super Internet</p>
          <p className="mt-1 text-4xl font-black tabular-nums leading-none tracking-tight">{clock}</p>
          <p className="mt-1.5 text-[11px] text-white/55">{dateLine}</p>
          <div className="mt-3 h-px bg-white/10" />
          <p className="mt-2.5 text-[11px] text-white/55">{visible.length ? `${visible.length} window${visible.length > 1 ? "s" : ""} open` : "Drag icons to arrange your screen"}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              onClick={() => setOs("windows")}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${!isMac ? "brand-grad text-black border-transparent" : "bg-white/10 border-white/15 text-white/70 hover:bg-white/15"}`}
            >
              Windows 11
            </button>
            <button
              onClick={() => setOs("macos")}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors ${isMac ? "brand-grad text-black border-transparent" : "bg-white/10 border-white/15 text-white/70 hover:bg-white/15"}`}
            >
              macOS
            </button>
            <button onClick={cycleWall} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Wallpaper</button>
          </div>
        </div>
      )}

      {/* Windows */}
      {visible.map((w) => {
        const m = appMeta(w.id);
        if (!m) return null;
        const index = visible.filter((x) => !x.min).findIndex((x) => x.id === w.id);
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
            initial={isMac ? { x: 64 + index * 22, y: 46 + index * 20 } : { x: 40 + index * 26, y: 26 + index * 22 }}
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
            {w.id === "trash" ? <TrashApp /> : null}
            {w.id === "settings" ? <SettingsApp /> : null}
          </WindowFrame>
        );
      })}

      {/* Restore tray for minimized windows */}
      {wins.some((w) => w.min) && (
        <div className={`absolute right-3 z-40 flex items-center gap-1.5 gloss-strong rounded-full px-2 py-1.5 ${isMac ? "bottom-24" : "bottom-[70px]"}`}>
          {wins.filter((w) => w.min).map((w) => {
            const m = appMeta(w.id);
            if (!m) return null;
            return (
              <button key={w.id} onClick={() => focusApp(w.id)} title={`Restore ${m.name}`} className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/10 text-[10px] font-semibold">
                <m.Icon className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> {m.name}
              </button>
            );
          })}
        </div>
      )}

      {!isMac && (
        <Win11Bar apps={WINDOW_APPS} shortcuts={WIN_SHORTCUTS} pinned={WIN_PINNED} os={os} openApp={openApp} wins={wins} focusApp={focusApp} now={now} setOs={setOs} onWall={cycleWall} onShowDesktop={showDesktop} />
      )}

      <button
        onClick={() => setPickerOpen(true)}
        className="absolute left-3 bottom-[76px] z-40 gloss-strong rounded-full px-3 py-1.5 text-[11px] font-semibold flex items-center gap-1.5 hover:brightness-125"
        title="Change wallpaper"
      >
        <Sparkles className="w-3 h-3" style={{ color: "var(--brand)" }} /> Wallpaper
      </button>

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