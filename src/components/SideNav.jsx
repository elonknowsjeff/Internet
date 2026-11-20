import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home, MessageSquare, Newspaper, Music2, Youtube, Heart, Sparkles, LayoutGrid,
  Settings as SettingsIcon, User, LogOut, LogIn, UserPlus, BarChart3, UtensilsCrossed,
  AudioLines, Hash,
} from "lucide-react";
import { ALL_APPS } from "@/lib/navApps";
import AppsMenu from "@/components/os/AppsMenu";
import TranslatorPanel from "@/components/TranslatorPanel";
import BrandLogo from "@/components/BrandLogo";

// Bottom dock navigation. The same bar serves every viewport.
const PRIMARY = [
  { key: "feed", to: "/", label: "Home", icon: Home, mobile: true },
  { key: "spaces", to: "/spaces", label: "Spaces", icon: AudioLines, mobile: true },
  { key: "chats", to: "/chats", label: "Chats", icon: Hash, mobile: true },
  { key: "messages", to: "/messages", label: "Messages", icon: MessageSquare, mobile: true },
  { key: "music", to: "/music", label: "Music", icon: Music2, mobile: true },
  { key: "video", to: "/video", label: "Video", icon: Youtube, mobile: false },
  { key: "news", to: "/news", label: "News", icon: Newspaper, mobile: false },
  { key: "eats", to: "/eats", label: "Eats", icon: UtensilsCrossed, mobile: false },
  { key: "dating", to: "/dating", label: "Dating", icon: Heart, mobile: false },
  { key: "assistant", to: "/assistant", label: "Assistant", icon: Sparkles, mobile: false },
];

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

  const AccountMenu = () => (
    <div className="fixed bottom-[88px] right-3 z-[70] w-60 rounded-2xl bg-[#1c1c1e] border border-white/10 overflow-hidden animate-slide-up shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]">
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

  const NavButton = ({ item }) => {
    const active = isActive(location.pathname, item.to);
    return (
      <Link to={item.to} title={item.label} className="group relative grid h-10 w-10 place-items-center rounded-full transition-all duration-200 hover:bg-white/[0.07]">
        {active && <span className="absolute inset-0 rounded-full" style={{ background: "color-mix(in srgb, var(--brand) 16%, transparent)" }} />}
        <item.icon
          className="relative h-[19px] w-[19px] transition-transform duration-200 group-active:scale-90"
          strokeWidth={active ? 2.4 : 1.8}
          style={{ color: active ? "var(--brand)" : "rgba(255,255,255,0.6)" }}
        />
        {item.key === "messages" && unread > 0 && (
          <span className="absolute right-0.5 top-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--brand)] text-[10px] font-bold text-white grid place-items-center ring-2 ring-[#1c1c1e]">{unread > 9 ? "9+" : unread}</span>
        )}
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/85 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* ---------- unified bottom dock (all viewports) ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-[52] flex justify-center px-2.5 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-1 rounded-[22px] border border-white/[0.09] bg-[#161618]/85 px-2 py-1.5 backdrop-blur-2xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.95)]">
          <Link to="/" className="hidden h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/[0.07] sm:grid" title="Valo">
            <BrandLogo size={21} />
          </Link>

          <span className="mx-0.5 hidden h-6 w-px bg-white/10 sm:block" />

          {PRIMARY.map((item) => (
            <div key={item.key} className={item.mobile ? "" : "hidden sm:block"}>
              <NavButton item={item} />
            </div>
          ))}

          <Link to="/settings" title="Settings" className="group relative hidden h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/[0.07] sm:grid">
            <SettingsIcon className={`h-[19px] w-[19px] transition-colors ${isActive(location.pathname, "/settings") ? "text-[var(--brand)]" : "text-white/55"}`} strokeWidth={1.8} />
          </Link>

          <button onClick={() => setAppsOpen(true)} title="All apps" className="group relative grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/[0.07]">
            <LayoutGrid className="h-[19px] w-[19px] text-white/55 transition-transform duration-150 group-active:scale-90" strokeWidth={1.8} />
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/85 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Apps</span>
          </button>

          <button onClick={() => setAccountOpen((v) => !v)} aria-label="Account" className="grid h-10 w-10 shrink-0 place-items-center rounded-full overflow-hidden transition-transform active:scale-95">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10"><User className="h-4 w-4 text-white/70" /></span>}
          </button>
        </div>
      </div>
      {accountOpen && <AccountMenu />}

      <AppsMenu open={appsOpen} onClose={() => setAppsOpen(false)} onTranslate={() => setTranslatorOpen(true)} />
      {translatorOpen && <TranslatorPanel onClose={() => setTranslatorOpen(false)} />}
    </>
  );
}