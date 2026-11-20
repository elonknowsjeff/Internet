import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { NAV_SECTIONS, ALL_APPS } from "@/lib/navApps";

const isActive = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

// Distinct gradient per section — colorful, like a rainbow directory.
const SECTION_GRAD = {
  Social: "from-[#ff453a] to-[#ff9f0a]",
  Info: "from-[#0a84ff] to-[#5e5ce6]",
  Marketplace: "from-[#30b158] to-[#64d2ff]",
  Entertainment: "from-[#ff375f] to-[#bf5af2]",
  Productivity: "from-[#ff9f0a] to-[#ff453a]",
  Markets: "from-[#30b158] to-[#0a84ff]",
};

const TILE_GRAD = [
  "from-[#0a84ff] to-[#5e5ce6]",
  "from-[#ff375f] to-[#ff9f0a]",
  "from-[#30b158] to-[#64d2ff]",
  "from-[#bf5af2] to-[#ff375f]",
  "from-[#ff9f0a] to-[#ff453a]",
  "from-[#5e5ce6] to-[#bf5af2]",
  "from-[#64d2ff] to-[#0a84ff]",
  "from-[#a3e635] to-[#30b158]",
];

export default function Apps() {
  const location = useLocation();
  const [q, setQ] = useState("");
  const [section, setSection] = useState("All");

  const s = q.trim().toLowerCase();
  const matches = (i) => !s || i.label.toLowerCase().includes(s) || i.to.includes(s);
  const base = section === "All" ? NAV_SECTIONS : NAV_SECTIONS.filter((x) => x.name === section);
  const sections = useMemo(
    () => base.map((sec) => ({ ...sec, items: sec.items.filter(matches) })).filter((sec) => sec.items.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, section]
  );
  const total = sections.reduce((n, sec) => n + sec.items.length, 0);
  let tileCounter = 0;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 sm:px-4 pb-28">
      {/* hero */}
      <section className="relative mt-3 overflow-hidden rounded-[24px] border border-white/[0.1] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_40px_80px_-56px_rgba(0,0,0,1)] sm:p-7">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff453a] via-[#bf5af2] to-[#0a84ff] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(0,0,0,0.6),transparent_65%)]" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/60">Every app, one place</p>
          <h1 className="mt-2 max-w-lg font-display text-[26px] font-extrabold leading-tight tracking-[-0.025em] sm:text-[34px]">The full Valo directory</h1>
          <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-white/65">{ALL_APPS.length} apps across social, marketplace, entertainment, productivity and markets. Tap any tile to jump straight in.</p>
        </div>
      </section>

      {/* search + filters */}
      <div className="sticky top-0 z-30 mt-3 mb-2 rounded-2xl border border-white/[0.08] bg-[#06060a]/85 px-3 py-2.5 backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3.5 py-2 focus-within:border-white/30">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search every app…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35" />
            {q && <button onClick={() => setQ("")}><X className="h-4 w-4 text-white/40" /></button>}
            <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.08em] text-white/35 sm:block">{total} apps</span>
          </div>
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-none">
          {["All", ...NAV_SECTIONS.map((x) => x.name)].map((name) => (
            <button key={name} onClick={() => setSection(name)} className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors ${section === name ? "text-black" : "border border-white/[0.1] bg-white/[0.04] text-white/55 hover:text-white"}`} style={section === name ? { background: "var(--brand)" } : undefined}>
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* long colorful directory */}
      {sections.map((sec) => {
        const grad = SECTION_GRAD[sec.name] || "from-[#0a84ff] to-[#bf5af2]";
        return (
          <section key={`${sec.name}-${s}-${section}`} className="mt-5">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${grad} p-[1px]`}>
              <div className="flex items-center gap-2.5 rounded-2xl bg-[#0b0b0d]/85 px-4 py-3 backdrop-blur">
                <Sparkles className="h-4 w-4 text-white/80" />
                <h2 className="font-display text-[16px] font-extrabold tracking-[-0.01em]">{sec.name}</h2>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10.5px] font-semibold text-white/60">{sec.items.length}</span>
                <Link to={sec.items[0].to} className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-white/55 hover:text-white">
                  Open <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
              {sec.items.map(({ key, to, label, icon: Icon }) => {
                const g = TILE_GRAD[tileCounter++ % TILE_GRAD.length];
                const active = isActive(location.pathname, to);
                return (
                  <Link key={key} to={to} title={label} className="group flex flex-col items-center gap-2 rounded-[18px] p-2 transition-colors hover:bg-white/[0.05]">
                    <span className={`relative grid h-[58px] w-[58px] place-items-center overflow-hidden rounded-[17px] bg-gradient-to-br ${g} shadow-[0_16px_30px_-18px_rgba(0,0,0,1),inset_0_1px_0_rgba(255,255,255,0.45)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.06]`}>
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent" />
                      {active && <span className="absolute inset-0 rounded-[17px] ring-2 ring-white/70" />}
                      <Icon className="relative h-[22px] w-[22px] text-white" />
                    </span>
                    <span className={`w-full truncate text-center text-[11px] leading-tight ${active ? "font-bold text-white" : "font-medium text-white/60 group-hover:text-white"}`}>{label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {!total && (
        <div className="mt-10 rounded-2xl border border-dashed border-white/[0.14] p-10 text-center text-[13px] text-white/45">
          No apps match “{q}”.
        </div>
      )}
    </div>
  );
}