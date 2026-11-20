import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Apple, Wifi, BatteryFull, Monitor, Sparkles, Minimize2, ChevronRight, LayoutGrid, Settings as SettingsIcon,
  Newspaper, Music2, BarChart3, Youtube,
} from "lucide-react";
import OsDock from "./OsDock";
import OsLauncher from "./OsLauncher";

export default function MacBar(props) {
  const { apps = [], wins = [], focusApp, openApp, now, setOs, onWall, onShowDesktop } = props;
  const [menu, setMenu] = useState(null);
  const [launcher, setLauncher] = useState(false);
  const clock = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  const MenuItem = ({ label, onClick, icon: Icon }) => (
    <button onClick={() => { onClick?.(); setMenu(null); }} className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[12px] text-white/85 hover:bg-[var(--brand)] hover:text-black">
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null} {label}
    </button>
  );

  return (
    <>
      {/* Menu bar — docked to the bottom, XSI style */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex h-8 items-center gap-3 overflow-hidden gloss-strong px-2.5 text-[11px] rounded-t-xl border-x-0 border-b-0">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent" />
        <button onClick={() => setMenu(menu === "apple" ? null : "apple")} className="relative rounded px-1.5 hover:bg-white/15">
          <Apple className="h-3.5 w-3.5" />
        </button>
        <span className="relative bg-gradient-to-r from-fuchsia-300 via-violet-200 to-cyan-300 bg-clip-text font-bold text-transparent">Valo</span>
        <button onClick={() => setMenu(menu === "view" ? null : "view")} className="relative hidden rounded px-1.5 text-white/80 hover:bg-white/15 sm:block">View</button>
        <button onClick={() => setMenu(menu === "window" ? null : "window")} className="relative hidden rounded px-1.5 text-white/80 hover:bg-white/15 sm:block">Window</button>
        <button onClick={onShowDesktop} className="relative hidden rounded px-1.5 text-white/80 hover:bg-white/15 sm:block">Show desktop</button>

        <div className="relative ml-auto flex items-center gap-3 text-white/80">
          <button title="All apps" onClick={() => setLauncher(true)} className="rounded px-1.5 hover:bg-white/15"><LayoutGrid className="h-3.5 w-3.5" /></button>
          <button
            title="More settings"
            onClick={() => setMenu(menu === "more" ? null : "more")}
            className={`rounded px-1.5 hover:bg-white/15 ${menu === "more" ? "bg-white/15 text-white" : ""}`}
          >
            <SettingsIcon className="h-3.5 w-3.5" />
          </button>
          <button title="Switch to Windows 11 style" onClick={() => setOs("windows")} className="rounded px-1.5 hover:bg-white/15"><Monitor className="h-3.5 w-3.5" /></button>
          <BatteryFull className="h-3.5 w-3.5 text-emerald-400" />
          <Wifi className="h-3.5 w-3.5" />
          <span className="tabular-nums">{clock}</span>
          <span className="tabular-nums">{time}</span>
        </div>
      </div>

      {menu && (
        <>
          <div className="absolute inset-0 z-40" onClick={() => setMenu(null)} />
          <div className={`absolute bottom-9 z-50 w-60 overflow-hidden rounded-xl gloss-strong p-1.5 animate-slide-up ${menu === "more" ? "right-2" : "left-2"}`}>
            {menu === "apple" && (
              <>
                <p className="px-3 py-1 text-[11px] text-white/45">Valo OS 2</p>
                <div className="my-1 h-px bg-white/10" />
                <MenuItem label="All apps" onClick={() => setLauncher(true)} icon={LayoutGrid} />
                <MenuItem label="Open Settings" onClick={() => openApp("settings")} icon={LayoutGrid} />
                <MenuItem label="Show desktop" onClick={onShowDesktop} icon={Minimize2} />
                <MenuItem label="Change wallpaper" onClick={onWall} icon={Sparkles} />
                <MenuItem label="Switch to Windows 11" onClick={() => setOs("windows")} icon={Monitor} />
              </>
            )}
            {menu === "view" && (
              <>
                <MenuItem label="Change wallpaper" onClick={onWall} icon={Sparkles} />
                <MenuItem label="Show desktop" onClick={onShowDesktop} icon={Minimize2} />
                <MenuItem label="Switch to Windows 11" onClick={() => setOs("windows")} icon={Monitor} />
              </>
            )}
            {menu === "window" && (
              <>
                {wins.length === 0 ? <p className="px-3 py-2 text-[12px] text-white/45">No open windows</p> : wins.map((w) => {
                  const app = apps.find((a) => a.id === w.id);
                  if (!app) return null;
                  return <MenuItem key={w.id} label={app.name} onClick={() => focusApp(w.id)} icon={ChevronRight} />;
                })}
                <div className="my-1 h-px bg-white/10" />
                <MenuItem label="Show desktop" onClick={onShowDesktop} icon={Minimize2} />
              </>
            )}
            {menu === "more" && (
              <>
                <p className="px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/35">More settings</p>
                <MenuItem label="Open System Settings" onClick={() => openApp("settings")} icon={SettingsIcon} />
                <MenuItem label="Wallpaper & style" onClick={onWall} icon={Sparkles} />
                <MenuItem label="All apps" onClick={() => setLauncher(true)} icon={LayoutGrid} />
                <MenuItem label="Show desktop" onClick={onShowDesktop} icon={Minimize2} />
                <div className="my-1 h-px bg-white/10" />
                <p className="px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/35">Jump to</p>
                {[
                  { to: "/news", label: "News", icon: Newspaper },
                  { to: "/studio", label: "Creator Studio", icon: BarChart3 },
                  { to: "/video", label: "Video", icon: Youtube },
                  { to: "/music", label: "Music", icon: Music2 },
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setMenu(null)} className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[12px] text-white/85 hover:bg-[var(--brand)] hover:text-black">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </Link>
                ))}
                <div className="my-1 h-px bg-white/10" />
                <MenuItem label="Switch to Windows 11" onClick={() => setOs("windows")} icon={Monitor} />
              </>
            )}
          </div>
        </>
      )}

      {launcher && <OsLauncher {...props} onClose={() => setLauncher(false)} />}

      {/* Dock */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-24 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-11 z-40 flex justify-center px-2">
        <OsDock {...props} variant="macos" launcherOpen={launcher} onLauncher={() => setLauncher((v) => !v)} />
      </div>
    </>
  );
}