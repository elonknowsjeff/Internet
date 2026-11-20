import React from "react";
import { Link } from "react-router-dom";
import { ALL_APPS } from "@/lib/navApps";

/**
 * Windows 11 style app tab strip.
 * Desktop apps open as windows; every other app opens its page.
 */
export default function AppTabs({ windowApps = [], wins = [], onOpenApp }) {
  const running = (id) => wins.some((w) => w.id === id);

  return (
    <div className="absolute left-24 right-3 top-2 z-30 lg:right-[252px]">
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0c11]/90 px-1.5 py-1 scrollbar-none backdrop-blur-2xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]">
        {windowApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            title={app.name}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors ${running(app.id) ? "bg-white/[0.12] text-white" : "text-white/55 hover:bg-white/[0.08] hover:text-white"}`}
          >
            <app.Icon className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{app.name}</span>
            {running(app.id) && <span className="h-1 w-1 rounded-full" style={{ background: "var(--brand)" }} />}
          </button>
        ))}

        <span className="mx-1 h-4 w-px shrink-0 bg-white/[0.14]" />

        {ALL_APPS.map((app) => (
          <Link
            key={app.key}
            to={app.to}
            title={app.label}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold text-white/55 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <app.icon className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{app.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}