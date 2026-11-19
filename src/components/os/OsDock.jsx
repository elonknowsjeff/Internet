import React from "react";
import { Link } from "react-router-dom";
import { Apple, Monitor, Sparkles, Minimize2, Wifi, BatteryFull } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function OsDock({
  apps = [], shortcuts = [], openApp, wins = [], focusApp,
  launcherOpen, onLauncher, os, setOs, onWall, onShowDesktop, now, variant = "windows",
}) {
  const isMac = variant === "macos";
  const tray = os === "macos" ? <Apple className="w-4 h-4 text-white/70" /> : <Monitor className="w-4 h-4 text-white/70" />;
  const clock = now ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "";
  const date = now ? now.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" }) : "";

  const itemClass = `group relative shrink-0 w-10 h-10 flex items-center justify-center transition-transform ${
    isMac ? "hover:-translate-y-1" : "rounded-xl hover:bg-white/10"
  }`;

  const Item = ({ item }) => {
    const running = item.appId && wins.some((w) => w.id === item.appId);
    const inner = (
      <>
        <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/25 bg-gradient-to-b from-white/25 to-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_22px_-12px_rgba(0,0,0,0.9)]">
          <span className="pointer-events-none absolute inset-0 brand-grad opacity-25" />
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent" />
          <item.Icon className="relative h-[18px] w-[18px]" />
        </span>
        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${running ? "bg-fuchsia-300" : "bg-transparent"}`} />
      </>
    );
    return item.to ? (
      <Link to={item.to} title={item.name} className={itemClass}>{inner}</Link>
    ) : (
      <button onClick={() => openApp(item.appId)} title={item.name} className={itemClass}>{inner}</button>
    );
  };

  return (
    <div
      className={`pointer-events-auto relative flex items-center gap-1.5 border px-2 py-1.5 gloss-strong ${
        isMac ? "rounded-[24px]" : "rounded-2xl"
      }`}
    >
      <button
        onClick={onLauncher}
        title="All apps — Super Internet"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${launcherOpen ? "bg-white/20" : "hover:bg-white/10"}`}
      >
        <BrandLogo size={24} />
      </button>
      <span className="w-px h-6 bg-white/15 mx-0.5" />

      {apps.map((a) => <Item key={a.id} item={{ key: a.id, name: a.name, Icon: a.Icon, appId: a.id }} />)}
      <span className="w-px h-6 bg-white/15 mx-0.5" />
      {shortcuts.slice(0, 6).map((s) => <Item key={s.to} item={{ key: s.to, name: s.name, Icon: s.Icon, to: s.to }} />)}

      <span className="w-px h-6 bg-white/15 mx-0.5" />
      <button onClick={onWall} title="Change wallpaper" className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:bg-white/10">
        <Sparkles className="w-4 h-4" />
      </button>
      <button onClick={onShowDesktop} title="Show desktop" className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:bg-white/10">
        <Minimize2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => setOs(os === "macos" ? "windows" : "macos")}
        title={os === "macos" ? "Switch to Windows 11" : "Switch to macOS"}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10"
      >
        {tray}
      </button>

      {!isMac && now && (
        <div className="pl-1 pr-1 flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-white/55" />
          <BatteryFull className="w-3.5 h-3.5 text-emerald-400" />
          <div className="leading-tight text-right">
            <p className="text-[11px] tabular-nums text-white/85">{clock}</p>
            <p className="text-[10px] tabular-nums text-white/45">{date}</p>
          </div>
        </div>
      )}
    </div>
  );
}