import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Bell, Info, LayoutGrid, Palette, UserRound } from "lucide-react";
import AccountPane from "@/components/settings/panes/AccountPane";
import AppearancePane from "@/components/settings/panes/AppearancePane";
import SoundsPane from "@/components/settings/panes/SoundsPane";
import ToolsPane from "@/components/settings/panes/ToolsPane";
import AboutPane from "@/components/settings/panes/AboutPane";

const SECTIONS = [
  { key: "account", label: "Your account", desc: "Profile & photo", icon: UserRound, Pane: AccountPane },
  { key: "appearance", label: "Appearance", desc: "Theme & background", icon: Palette, Pane: AppearancePane },
  { key: "sounds", label: "Sound & alerts", desc: "Chimes & reminders", icon: Bell, Pane: SoundsPane },
  { key: "tools", label: "Tools & panels", desc: "Navigation & apps", icon: LayoutGrid, Pane: ToolsPane },
  { key: "about", label: "About", desc: "Session & reset", icon: Info, Pane: AboutPane },
];

export default function Settings() {
  const [active, setActive] = useState("account");
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const handle = user?.username || (user?.email ? user.email.split("@")[0] : "");
  const current = SECTIONS.find((s) => s.key === active) || SECTIONS[0];
  const Pane = current.Pane;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-2 pb-28 pt-2 sm:px-4">
      <header className="sticky top-0 z-30 -mx-2 flex items-center gap-3 bg-[#0d0920]/85 px-3 py-2.5 backdrop-blur-2xl sm:-mx-4 sm:px-4">
        <Link to="/" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-[17px] font-extrabold leading-none">Settings</h1>
          <p className="mt-0.5 truncate text-[11.5px] text-white/40">{handle ? `@${handle}` : "Customize your app"}</p>
        </div>
      </header>

      <div className="mt-3 flex gap-3">
        <nav className="hidden w-[248px] shrink-0 md:block">
          <div className="sticky top-[58px] overflow-hidden rounded-2xl panel">
            <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Settings</p>
            {SECTIONS.map((s) => {
              const on = s.key === active;
              return (
                <button
                  key={s.key}
                  onClick={() => setActive(s.key)}
                  className={`relative flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                    on ? "bg-white/[0.08] font-bold text-white" : "font-semibold text-white/55 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {on && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full brand-grad" />}
                  <s.icon className={`h-4 w-4 shrink-0 ${on ? "text-white" : "text-white/40"}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] leading-tight">{s.label}</span>
                    <span className="block truncate text-[10.5px] font-normal text-white/35">{s.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 flex-1">
          <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none md:hidden">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
                  s.key === active ? "brand-grad text-black" : "border border-white/10 text-white/60"
                }`}
              >
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </button>
            ))}
          </div>

          <div key={active} className="overflow-hidden rounded-2xl panel animate-fade-in">
            <Pane />
          </div>
        </div>
      </div>
    </div>
  );
}