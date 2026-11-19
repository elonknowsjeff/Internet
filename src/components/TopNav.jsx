import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, Sparkles, User, Settings as SettingsIcon, LogOut } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { NAV_SECTIONS, ALL_APPS, PINNED } from "@/lib/navApps";
import BrandLogo from "@/components/BrandLogo";
import AccentPicker from "@/components/AccentPicker";

const byKey = (key) => ALL_APPS.find((a) => a.key === key);

export default function TopNav() {
  const location = useLocation();
  const { settings, update } = useSettings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(new Date());
  const [dragging, setDragging] = useState(null);
  const dragFrom = useRef(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const visible = (key) => !settings.hiddenTabs?.[key];
  const order = (settings.dockOrder?.length ? settings.dockOrder : PINNED).filter(visible);
  const pinned = order.map((key) => ({ key, ...(byKey(key) || {}) })).filter((a) => a.to);
  const matches = (a) => !query.trim() || a.label.toLowerCase().includes(query.trim().toLowerCase());

  const move = (from, to) => {
    if (!from || !to || from === to) return;
    const next = order.filter((k) => k !== from);
    const i = next.indexOf(to);
    next.splice(i < 0 ? next.length : i, 0, from);
    update({ dockOrder: next });
  };

  const logout = async () => { try { await base44.auth.logout(); } catch { window.location.href = "/"; } };

  return (
    <header className="sticky top-0 z-50 border-b border-white/12 bg-[#171330]/95 backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 px-2 h-14">
        <button
          onClick={() => setOpen((v) => !v)}
          title="All apps"
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${open ? "bg-white/20" : "hover:bg-white/10"}`}
        >
          <span className="grid grid-cols-2 gap-[3px]">
            <span className="w-[6px] h-[6px] rounded-[1px] bg-fuchsia-400" />
            <span className="w-[6px] h-[6px] rounded-[1px] bg-cyan-300" />
            <span className="w-[6px] h-[6px] rounded-[1px] bg-amber-300" />
            <span className="w-[6px] h-[6px] rounded-[1px] bg-emerald-300" />
          </span>
        </button>

        <Link to="/" className="shrink-0 flex items-center gap-1.5 pr-1">
          <BrandLogo size={26} />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-[13px] font-black font-display tracking-tight bg-gradient-to-r from-fuchsia-300 via-amber-200 to-cyan-300 bg-clip-text text-transparent">SUPER INTERNET</span>
            <span className="text-[8px] text-neutral-400 tracking-[0.24em] uppercase">everything in one place</span>
          </span>
        </Link>

        <div className="shrink-0 hidden xl:block"><AccentPicker /></div>

        <span className="shrink-0 w-px h-6 bg-white/12" />

        <nav className="flex-1 min-w-0 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {pinned.map(({ key, to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={key}
                to={to}
                draggable
                onDragStart={() => { dragFrom.current = key; setDragging(key); }}
                onDragEnd={() => { dragFrom.current = null; setDragging(null); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); move(dragFrom.current, key); dragFrom.current = null; setDragging(null); }}
                title={`${label} — drag to move`}
                className={`relative shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                  dragging === key ? "opacity-40" : active ? "bg-white/18 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-[15px] h-[15px]" />
                <span className="hidden md:block">{label}</span>
                {active && <span className="absolute bottom-0.5 left-2 right-2 h-[2px] rounded-full brand-grad" />}
              </Link>
            );
          })}
        </nav>

        <span className="shrink-0 w-px h-6 bg-white/12" />

        <Link to="/assistant" title="AI helper" className="shrink-0 flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full brand-grad text-black text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5" /> <span className="hidden lg:block">AI</span>
        </Link>

        <div className="shrink-0 text-right leading-tight hidden sm:block px-1">
          <p className="text-[11px] font-semibold tabular-nums">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          <p className="text-[9px] text-white/45">{now.toLocaleDateString([], { month: "short", day: "numeric" })}</p>
        </div>

        <Link to="/settings" title="Settings" className="shrink-0 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/70"><SettingsIcon className="w-4 h-4" /></Link>
        <Link to="/profile" title={user?.full_name || "Your account"} className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-white/12 border border-white/20 flex items-center justify-center">
          {user?.avatar ? <img src={user.avatar} alt="you" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-white/70" />}
        </Link>
        <button onClick={logout} title="Log off" className="shrink-0 w-8 h-8 rounded-lg hover:bg-rose-500/20 text-rose-300 flex items-center justify-center"><LogOut className="w-4 h-4" /></button>
      </div>

      {open && (
        <div className="absolute top-[calc(100%+6px)] left-2 z-[60] w-[min(92vw,520px)] rounded-2xl bg-[#1e1a38]/97 backdrop-blur-2xl border border-white/15 shadow-2xl animate-slide-up">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10">
            <Search className="w-4 h-4 text-white/50" />
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search apps…" className="flex-1 bg-transparent outline-none text-sm placeholder-white/40" />
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-3 space-y-3">
            {NAV_SECTIONS.map((sec) => {
              const items = sec.items.filter((a) => visible(a.key)).filter(matches);
              if (!items.length) return null;
              return (
                <div key={sec.name}>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1.5 px-1">{sec.name}</p>
                  <div className="grid grid-cols-4 gap-1">
                    {items.map(({ to, label, icon: Icon }) => (
                      <Link key={to} to={to} className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-white/10 text-center">
                        <span className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center"><Icon className="w-4 h-4" /></span>
                        <span className="text-[10px] leading-tight text-white/80">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}