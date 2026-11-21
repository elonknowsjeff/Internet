import React from "react";
import {
  Wifi, Volume2, BatteryFull, Sparkles, Minimize2, Apple, Monitor, Search,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

// Windows 11 / macOS-style bottom taskbar: centered start + app icons, right system tray + clock.
export default function Taskbar({
  os, apps, running, activeId, onOpen, onFocus, onStart, onWallpaper, onShowDesktop, onToggleOs, clock, date,
}) {
  const isMac = os === "macos";
  return (
    <div className="absolute inset-x-0 bottom-0 z-50 flex justify-center px-2 pb-[calc(6px+env(safe-area-inset-bottom))]">
      <div
        className={`flex items-center gap-1 ${isMac ? "rounded-[22px]" : "rounded-2xl"} border border-white/10 bg-black/50 px-2 h-14 backdrop-blur-2xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.95)]`}
      >
        {/* Start */}
        <button
          onClick={onStart}
          title="Start"
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors hover:bg-white/10"
        >
          <span className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100" style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--brand) 40%, transparent)" }} />
          <BrandLogo size={22} />
        </button>
        <span className="mx-0.5 h-7 w-px bg-white/10 shrink-0" />

        {/* App icons */}
        <div className="flex items-center gap-0.5 max-w-[58vw] overflow-x-auto scrollbar-none">
          {apps.map((a) => {
            const run = running.find((r) => r.id === a.id);
            const isActive = run && activeId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => (run ? onFocus(a.id) : onOpen(a.id))}
                title={a.name}
                className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors hover:bg-white/10"
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-2xl" style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)" }} />
                )}
                <a.Icon className="relative h-5 w-5" style={{ color: run ? "var(--brand)" : "rgba(255,255,255,0.72)" }} />
                {run && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: "var(--brand)" }} />
                )}
              </button>
            );
          })}
        </div>

        <span className="mx-0.5 h-7 w-px bg-white/10 shrink-0" />

        {/* System tray */}
        <button onClick={onWallpaper} title="Personalize" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl hover:bg-white/10 text-white/70">
          <Sparkles className="h-4 w-4" />
        </button>
        <div className="hidden sm:flex items-center gap-1 px-1.5 shrink-0 text-white/70">
          <Wifi className="h-4 w-4" />
          <Volume2 className="h-4 w-4" />
          <BatteryFull className="h-4 w-4" />
        </div>
        <button onClick={onShowDesktop} title="Show desktop" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl hover:bg-white/10 text-white/70">
          <Minimize2 className="h-4 w-4" />
        </button>
        <button onClick={onToggleOs} title={isMac ? "Switch to Windows" : "Switch to macOS"} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl hover:bg-white/10 text-white/70">
          {isMac ? <Monitor className="h-4 w-4" /> : <Apple className="h-4 w-4" />}
        </button>

        {/* Clock */}
        <div className="ml-1 px-2 shrink-0 text-right leading-tight text-white/85">
          <div className="text-[12px] font-semibold tabular-nums">{clock}</div>
          <div className="text-[10px] text-white/55">{date}</div>
        </div>
      </div>
    </div>
  );
}