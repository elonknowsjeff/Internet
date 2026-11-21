import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, Palette, Image as ImageIcon, Monitor, Apple, Wifi, Volume2, BatteryFull,
  User, Info, HardDrive, Bell, Globe, Sparkles, ArrowUpRight, Search, ChevronRight,
} from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { ACCENTS } from "@/lib/themeColors";
import BrandLogo from "@/components/BrandLogo";

const THEMES = [
  { id: "galaxy", label: "Galaxy" },
  { id: "clean", label: "Clean" },
  { id: "theater", label: "Theater" },
  { id: "midnight", label: "Midnight" },
  { id: "cyber", label: "Cyber" },
  { id: "daylight", label: "Daylight" },
  { id: "sunset", label: "Sunset" },
  { id: "borealis", label: "Borealis" },
];

const NAV = [
  { id: "personalize", label: "Personalization", Icon: Palette },
  { id: "system", label: "System", Icon: Monitor },
  { id: "apps", label: "Apps", Icon: Globe },
  { id: "network", label: "Network", Icon: Wifi },
  { id: "account", label: "Account", Icon: User },
  { id: "about", label: "About", Icon: Info },
];

function Card({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-white/80">
        <Icon className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> {title}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, hint, Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/8 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="h-3.5 w-3.5 text-white/40 shrink-0" />}
        <span className="text-[12px] text-white/85 truncate">{label}</span>
      </div>
      <span className="text-[11.5px] text-white/55 text-right">{value}</span>
    </div>
  );
}

export default function SettingsApp({ wall, walls, onWall, os, onOs }) {
  const { settings, update } = useSettings();
  const [nav, setNav] = useState("personalize");
  const [q, setQ] = useState("");
  const isMac = os === "macos";

  return (
    <div className="flex h-full bg-[#0a0b12] text-white">
      {/* Sidebar */}
      <aside className="w-[176px] shrink-0 border-r border-white/10 bg-white/[0.02] flex flex-col">
        <div className="flex items-center gap-2 px-3 py-3">
          <BrandLogo size={22} />
          <div className="leading-tight">
            <div className="text-[12px] font-semibold">Internet X</div>
            <div className="text-[9.5px] text-white/45">System settings</div>
          </div>
        </div>
        <div className="px-2.5 pb-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2 h-7">
            <Search className="h-3 w-3 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find setting" className="flex-1 bg-transparent text-[11px] outline-none placeholder:text-white/35" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto thin-scrollbar px-1.5 pb-2">
          {NAV.filter((n) => n.label.toLowerCase().includes(q.toLowerCase())).map((n) => (
            <button
              key={n.id}
              onClick={() => setNav(n.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${nav === n.id ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}
              style={nav === n.id ? { boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--brand) 35%, transparent)" } : undefined}
            >
              <n.Icon className="h-3.5 w-3.5" style={{ color: nav === n.id ? "var(--brand)" : "rgba(255,255,255,0.5)" }} />
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto thin-scrollbar p-3.5 space-y-3">
        {nav === "personalize" && (
          <>
            <Card title="Accent colour" icon={Palette}>
              <div className="grid grid-cols-6 gap-1.5">
                {ACCENTS.slice(0, 18).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => update({ accent: c.id })}
                    title={c.label}
                    className="relative h-8 rounded-lg border border-white/10 grid place-items-center transition hover:scale-[1.04]"
                    style={{ background: c.hex }}
                  >
                    {(settings.accent || "ocean") === c.id && <Check className="h-3.5 w-3.5 text-black/80" />}
                  </button>
                ))}
              </div>
            </Card>
            <Card title="Theme" icon={Sparkles}>
              <div className="grid grid-cols-4 gap-1.5">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => update({ theme: t.id })}
                    className={`px-2 py-1.5 rounded-md border text-[11px] text-center ${(settings.theme || "galaxy") === t.id ? "border-white/50 bg-white/10" : "border-white/10 hover:border-white/30"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Card>
            <Card title="Wallpaper" icon={ImageIcon}>
              <div className="grid grid-cols-4 gap-1.5">
                {walls.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onWall(w.id)}
                    className={`relative h-14 rounded-lg overflow-hidden border ${wall === w.id ? "border-white/60" : "border-white/10 hover:border-white/30"}`}
                  >
                    {w.url
                      ? <img src={w.url} alt={w.label} className="h-full w-full object-cover" />
                      : <span className="block h-full w-full" style={{ background: "linear-gradient(135deg,#1a1530,#0a0a14)" }} />}
                    <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[8.5px] text-white/90 truncate">{w.label}</span>
                  </button>
                ))}
              </div>
            </Card>
            <Card title="Desktop style" icon={isMac ? Apple : Monitor}>
              <button
                onClick={onOs}
                className="flex w-full items-center justify-between rounded-lg border border-white/12 px-3 py-2 hover:bg-white/5"
              >
                <span className="flex items-center gap-2 text-[12px] text-white/85">
                  {isMac ? <Apple className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  {isMac ? "macOS" : "Windows 11"}
                </span>
                <span className="text-[11px] text-white/50">Tap to switch</span>
              </button>
            </Card>
          </>
        )}

        {nav === "system" && (
          <>
            <Card title="About" icon={Info}>
              <Row label="Edition" value="Internet X OS" Icon={Sparkles} />
              <Row label="Version" value="2026.11" Icon={Info} />
              <Row label="Shell" value={isMac ? "macOS" : "Windows 11"} Icon={Monitor} />
              <Row label="Processor" value="Base44 Quantum 1" Icon={HardDrive} />
              <Row label="Memory" value="16.0 GB" Icon={HardDrive} />
            </Card>
            <Card title="Display" icon={Monitor}>
              <Row label="Resolution" value="Auto" Icon={Monitor} />
              <div className="pt-2">
                <div className="mb-1 flex justify-between text-[11px] text-white/60"><span>Brightness</span><span>80%</span></div>
                <div className="h-1.5 w-full rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: "80%", background: "var(--brand)" }} /></div>
              </div>
            </Card>
            <Card title="Sound" icon={Volume2}>
              <Row label="Output" value="Speakers" Icon={Volume2} />
              <div className="pt-2">
                <div className="mb-1 flex justify-between text-[11px] text-white/60"><span>Volume</span><span>65%</span></div>
                <div className="h-1.5 w-full rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: "65%", background: "var(--brand)" }} /></div>
              </div>
            </Card>
          </>
        )}

        {nav === "network" && (
          <Card title="Wi‑Fi" icon={Wifi}>
            <Row label="Internet X" value="Connected, secured" Icon={Wifi} />
            <Row label="Hotspot 5G" value="Available" Icon={Wifi} />
            <Row label="Battery" value="100%" Icon={BatteryFull} />
          </Card>
        )}

        {nav === "apps" && (
          <Card title="Installed apps" icon={Globe}>
            <p className="text-[11px] text-white/55 mb-2">Open the full directory to launch any app.</p>
            <Link to="/apps" className="flex items-center justify-between rounded-lg border border-white/12 px-3 py-2 hover:bg-white/5">
              <span className="text-[12px] text-white/85">All apps directory</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-white/50" />
            </Link>
            <Link to="/browser" className="mt-1.5 flex items-center justify-between rounded-lg border border-white/12 px-3 py-2 hover:bg-white/5">
              <span className="text-[12px] text-white/85">Web browser</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-white/50" />
            </Link>
          </Card>
        )}

        {nav === "account" && (
          <Card title="Account" icon={User}>
            <div className="flex items-center gap-3 pb-2">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><BrandLogo size={26} /></span>
              <div>
                <div className="text-[13px] font-semibold">Internet X member</div>
                <div className="text-[11px] text-white/50">Manage your profile</div>
              </div>
            </div>
            <Link to="/profile" className="flex items-center justify-between rounded-lg border border-white/12 px-3 py-2 hover:bg-white/5">
              <span className="text-[12px] text-white/85">Open profile</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            </Link>
            <Link to="/settings" className="mt-1.5 flex items-center justify-between rounded-lg border border-white/12 px-3 py-2 hover:bg-white/5">
              <span className="text-[12px] text-white/85">Full app settings</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-white/50" />
            </Link>
          </Card>
        )}

        {nav === "about" && (
          <Card title="About Internet X" icon={Info}>
            <div className="flex items-center gap-3 pb-2">
              <BrandLogo size={40} />
              <div>
                <div className="text-[14px] font-semibold">Internet X</div>
                <div className="text-[11px] text-white/50">One hub for everything.</div>
              </div>
            </div>
            <Row label="Build" value="2026.11.21" Icon={Info} />
            <Row label="Platform" value="Base44" Icon={Sparkles} />
            <Link to="/terms" className="mt-2 flex items-center justify-between rounded-lg border border-white/12 px-3 py-2 hover:bg-white/5">
              <span className="text-[12px] text-white/85">Terms & privacy</span>
              <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            </Link>
          </Card>
        )}
      </main>
    </div>
  );
}