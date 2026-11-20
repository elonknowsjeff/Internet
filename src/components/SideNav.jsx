import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home, MessageSquare, Newspaper, Music2, Youtube, Heart, Sparkles, LayoutGrid,
  Settings as SettingsIcon, User, LogOut, LogIn, UserPlus, BarChart3, UtensilsCrossed,
} from "lucide-react";
import { ALL_APPS } from "@/lib/navApps";
import AppsMenu from "@/components/os/AppsMenu";
import TranslatorPanel from "@/components/TranslatorPanel";
import BrandLogo from "@/components/BrandLogo";

const PRIMARY = [
  { key: "feed", to: "/", label: "Home", icon: Home },
  { key: "messages", to: "/messages", label: "Messages", icon: MessageSquare },
  { key: "news", to: "/news", label: "News", icon: Newspaper },
  { key: "studio", to: "/studio", label: "Studio", icon: BarChart3 },
  { key: "music", to: "/music", label: "Music", icon: Music2 },
  { key: "video", to: "/video", label: "Video", icon: Youtube },
  { key: "eats", to: "/eats", label: "Eats", icon: UtensilsCrossed },
  { key: "dating", to: "/dating", label: "Dating", icon: Heart },
  { key: "assistant", to: "/assistant", label: "Assistant", icon: Sparkles },
];

const MOBILE = ["feed", "messages", "news", "music", "studio"];

const isActive = (pathname, to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

export default function SideNav() {
  const location = useLocation();
  const [appsOpen, setAppsOpen] = useState(false);
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let unsub = null;
    base44.auth.me().then((u) => {
      setUser(u);
      base44.entities.DirectMessage.count({ receiver_id: u.id, read: false }).then(setUnread).catch(() => {});
      unsub = base44.entities.DirectMessage?.subscribe?.((e) => {
        const m = e?.data;
        if (e?.type === "create" && m?.receiver_id === u.id && m?.sender_id !== u.id) setUnread((n) => n + 1);
      });
    }).catch(() => setUser(null));
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  useEffect(() => { setAccountOpen(false); setAppsOpen(false); }, [location.pathname]);

  const logout = async () => {
    try { await base44.auth.logout(); } catch { window.location.href = "/"; }
  };

  const mobileItems = MOBILE.map((k) => ALL_APPS.find((a) => a.key === k)).filter(Boolean);

  const AccountMenu = () => (
    <div className="fixed bottom-[84px] right-3 z-[70] w-60 rounded-2xl bg-[#1c1c1e] border border-white/10 overflow-hidden animate-slide-up lg:left-3 lg:right-auto shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]">
      <div className="px-3.5 py-3 border-b border-white/[0.08]">
        <p className="text-sm font-semibold truncate">{user ? user.display_name || user.full_name || "Member" : "Browsing as a guest"}</p>
        <p className="text-[11px] text-white/45 truncate">{user ? user.email : "Sign in to save your work"}</p>
      </div>
      <div className="p-1.5 space-y-0.5">
        {!user && (
          <>
            <Link to="/login" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.06]"><LogIn className="w-4 h-4 text-white/60" /> Sign in</Link>
            <Link to="/register" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.06]"><UserPlus className="w-4 h-4 text-white/60" /> Create account</Link>
          </>
        )}
        {user && <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.06]"><User className="w-4 h-4 text-white/60" /> My account</Link>}
        <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.06]"><SettingsIcon className="w-4 h-4 text-white/60" /> Settings</Link>
        <button onClick={() => { setTranslatorOpen(true); setAccountOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.06]"><Sparkles className="w-4 h-4 text-white/60" /> Translate</button>
        {user && (
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10"><LogOut className="w-4 h-4" /> Log off</button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ---------- desktop: slim icon rail ---------- */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-[52] w-[76px] flex-col items-center bg-[#0b0b0d] border-r border-white/[0.08]">
        <Link to="/" className="flex h-16 w-full items-center justify-center shrink-0">
          <BrandLogo size={24} />
        </Link>

        <nav className="flex-1 min-h-0 w-full flex flex-col items-center gap-1 overflow-y-auto scrollbar-none px-2 py-2">
          {PRIMARY.map(({ key, to, label, icon: Icon }) => {
            const active = isActive(location.pathname, to);
            return (
              <Link key={key} to={to} title={label} className="relative grid place-items-center w-12 h-12 rounded-2xl transition-colors">
                {active && <span className="absolute inset-0 rounded-2xl bg-[var(--brand)]/15" />}
                <Icon
                  className="relative w-[21px] h-[21px] transition-colors"
                  strokeWidth={active ? 2.2 : 1.7}
                  style={{ color: active ? "var(--brand)" : "rgba(255,255,255,0.55)" }}
                />
                {key === "messages" && unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-[var(--brand)] text-[10px] font-bold text-white grid place-items-center">{unread > 9 ? "9+" : unread}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="w-full flex flex-col items-center gap-1 border-t border-white/[0.08] px-2 py-3">
          <Link to="/settings" title="Settings" className="relative grid place-items-center w-12 h-12 rounded-2xl transition-colors hover:bg-white/[0.06]">
            <SettingsIcon className={`w-[21px] h-[21px] ${isActive(location.pathname, "/settings") ? "text-[var(--brand)]" : "text-white/55"}`} strokeWidth={1.7} />
          </Link>
          <button onClick={() => setAppsOpen(true)} title="All apps" className="relative grid place-items-center w-12 h-12 rounded-2xl transition-colors hover:bg-white/[0.06]">
            <LayoutGrid className="w-[21px] h-[21px] text-white/55" strokeWidth={1.7} />
          </button>
          <button onClick={() => setAccountOpen((v) => !v)} aria-label="Account menu" className="relative grid place-items-center w-12 h-12 rounded-2xl overflow-hidden mt-1">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><User className="h-4 w-4 text-white/70" /></span>}
          </button>
        </div>
      </aside>
      {accountOpen && <AccountMenu />}

      {/* ---------- mobile: clean bottom tab bar ---------- */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-[52] px-2.5 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex items-stretch rounded-2xl border border-white/[0.08] bg-[#1c1c1e]/90 px-1 py-1 backdrop-blur-xl">
          {mobileItems.map(({ key, to, label, icon: Icon }) => {
            const active = isActive(location.pathname, to);
            return (
              <Link key={key} to={to} title={label} className="group relative flex flex-1 flex-col items-center gap-[3px] rounded-xl py-1.5">
                {active && <span className="absolute inset-1 rounded-xl bg-[var(--brand)]/15" />}
                <Icon
                  className="relative h-[20px] w-[20px] transition-transform duration-150 group-active:scale-90"
                  strokeWidth={active ? 2.2 : 1.7}
                  style={{ color: active ? "var(--brand)" : "rgba(255,255,255,0.5)" }}
                />
                <span className={`relative text-[9.5px] leading-none ${active ? "font-semibold text-white" : "font-medium text-white/45"}`}>{label}</span>
                {key === "messages" && unread > 0 && <span className="absolute right-2.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />}
              </Link>
            );
          })}
          <button onClick={() => setAppsOpen(true)} title="All apps" className="group relative flex flex-1 flex-col items-center gap-[3px] rounded-xl py-1.5">
            <LayoutGrid className="relative h-[20px] w-[20px] text-white/50 transition-transform duration-150 group-active:scale-90" strokeWidth={1.7} />
            <span className="relative text-[9.5px] font-medium leading-none text-white/45">Apps</span>
          </button>
          <button onClick={() => setAccountOpen((v) => !v)} aria-label="Account" className="ml-0.5 grid w-9 shrink-0 place-items-center">
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white/10">
              {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <User className="h-4 w-4 text-white/55" />}
            </span>
          </button>
        </div>
      </div>

      <AppsMenu open={appsOpen} onClose={() => setAppsOpen(false)} onTranslate={() => setTranslatorOpen(true)} />
      {translatorOpen && <TranslatorPanel onClose={() => setTranslatorOpen(false)} />}
    </>
  );
}