import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, LayoutGrid, Wifi, BatteryFull, Sparkles, Minimize2,
  Settings as SettingsIcon, Apple, ChevronRight,
} from "lucide-react";
import OsLauncher from "./OsLauncher";
import BrandLogo from "@/components/BrandLogo";

export default function Win11Bar(props) {
  const { apps = [], shortcuts = [], openApp, wins = [], os, setOs, onWall, onShowDesktop, now, pinned: pinnedProp } = props;
  const [launcher, setLauncher] = useState(false);
  const [more, setMore] = useState(false);

  const clock = now ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "";
  const date = now ? now.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" }) : "";

  const pinned = pinnedProp || [
    ...apps.slice(0, 4).map((a) => ({ key: a.id, name: a.name, Icon: a.Icon, appId: a.id })),
    ...shortcuts.slice(0, 4).map((s) => ({ key: s.to, name: s.name, Icon: s.Icon, to: s.to })),
  ];

  const Tile = ({ item }) => {
    const running = item.appId && wins.some((w) => w.id === item.appId);
    const body = (
      <>
        <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-[10px] border border-white/[0.12] bg-white/[0.07] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] transition-colors group-hover:bg-white/[0.15]">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
          <item.Icon className="relative h-[18px] w-[18px]" />
        </span>
        <span className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all ${running ? "w-4 bg-[color:var(--brand)]" : "w-0 bg-transparent"}`} />
      </>
    );
    return item.to ? (
      <Link to={item.to} title={item.name} className="group relative grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-white/[0.09]">{body}</Link>
    ) : (
      <button onClick={() => openApp(item.appId)} title={item.name} className="group relative grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-white/[0.09]">{body}</button>
    );
  };

  const Row = ({ icon: Icon, label, onClick, to }) => {
    const inner = (
      <>
        <Icon className="h-4 w-4 shrink-0 text-white/60" />
        <span className="text-[12px] text-white/85">{label}</span>
        <ChevronRight className="ml-auto h-3 w-3 text-white/25" />
      </>
    );
    const cls = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left hover:bg-white/[0.12]";
    return to
      ? <Link to={to} onClick={() => setMore(false)} className={cls}>{inner}</Link>
      : <button onClick={onClick} className={cls}>{inner}</button>;
  };

  return (
    <>
      {launcher && <OsLauncher {...props} onClose={() => setLauncher(false)} />}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-2 pb-2">
        {/* More settings flyout */}
        {more && (
          <>
            <div className="pointer-events-auto absolute inset-0 -top-2" onClick={() => setMore(false)} />
            <div className="pointer-events-auto absolute bottom-[66px] right-2 z-50 w-60 overflow-hidden rounded-2xl gloss-strong p-1.5 animate-sheet-down">
              <p className="px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/35">More settings</p>
              <Row icon={SettingsIcon} label="Open Settings" onClick={() => { setMore(false); openApp("settings"); }} />
              <Row icon={Sparkles} label="Personalization" onClick={() => { setMore(false); onWall(); }} />
              <Row icon={LayoutGrid} label="All apps" onClick={() => { setMore(false); setLauncher(true); }} />
              <Row icon={Minimize2} label="Show desktop" onClick={() => { setMore(false); onShowDesktop(); }} />
              <div className="my-1 h-px bg-white/10" />
              <Row icon={Apple} label="Switch to macOS" onClick={() => { setMore(false); setOs("macos"); }} />
              <Row icon={SettingsIcon} label="App preferences" to="/settings" />
            </div>
          </>
        )}

        <div className="pointer-events-auto relative mx-auto flex max-w-[780px] items-center gap-0.5 overflow-hidden rounded-2xl border border-white/[0.14] gloss-strong px-1.5 py-1">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />

          <button
            onClick={() => setLauncher((v) => !v)}
            title="Start"
            className={`relative grid h-10 w-10 place-items-center rounded-lg transition-colors ${launcher ? "bg-white/[0.16]" : "hover:bg-white/[0.1]"}`}
          >
            <BrandLogo size={22} />
          </button>
          <button
            onClick={() => setLauncher((v) => !v)}
            title="Search apps"
            className="relative mr-1 hidden h-9 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] pl-2.5 pr-3 text-white/55 hover:bg-white/[0.12] sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-[11.5px]">Search</span>
          </button>

          <span className="mx-0.5 h-6 w-px shrink-0 bg-white/[0.12]" />

          <div className="relative flex items-center gap-0.5">
            {pinned.map((item) => <Tile key={item.key} item={item} />)}
            <button
              onClick={() => setLauncher((v) => !v)}
              title="All apps"
              className={`grid h-10 w-10 place-items-center rounded-lg transition-colors ${launcher ? "bg-white/[0.16]" : "hover:bg-white/[0.09]"}`}
            >
              <LayoutGrid className="h-[18px] w-[18px] text-white/80" />
            </button>
          </div>

          <div className="relative ml-auto flex items-center gap-0.5 pl-1">
            <button onClick={onWall} title="Personalization" className="hidden h-8 w-8 place-items-center rounded-md text-white/55 hover:bg-white/[0.1] sm:grid">
              <Sparkles className="h-3.5 w-3.5" />
            </button>
            <button onClick={onShowDesktop} title="Show desktop" className="grid h-8 w-8 place-items-center rounded-md text-white/55 hover:bg-white/[0.1]">
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMore((v) => !v)}
              title="More settings"
              className={`grid h-8 w-8 place-items-center rounded-md transition-colors ${more ? "bg-white/[0.16] text-white" : "text-white/55 hover:bg-white/[0.1]"}`}
            >
              <SettingsIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setOs(os === "macos" ? "windows" : "macos")}
              title="Switch desktop style"
              className="hidden h-8 w-8 place-items-center rounded-md text-white/55 hover:bg-white/[0.1] sm:grid"
            >
              <Wifi className="h-3.5 w-3.5" />
            </button>
            <div className="flex flex-col items-end rounded-md px-1.5 py-0.5 leading-tight hover:bg-white/[0.1]">
              <span className="text-[11px] tabular-nums text-white/85">{clock}</span>
              <span className="text-[9.5px] tabular-nums text-white/45">{date}</span>
            </div>
            <BatteryFull className="mr-0.5 hidden h-4 w-4 text-emerald-400/85 sm:block" />
          </div>
        </div>
      </div>
    </>
  );
}