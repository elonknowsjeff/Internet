import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home, MessageSquare, Newspaper, Music2, Youtube, Heart, Sparkles, LayoutGrid,
  Settings as SettingsIcon, User, LogOut, LogIn, UserPlus, BarChart3,
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

  /* ---------- glossy floating icon tile (shared by rail + dock) ---------- */
  const Tile = ({ icon: Icon, active, size = "rail" }) => (
    <span
      className={`relative grid place-items-center shrink-0 overflow-hidden border transition-all duration-200 ${
        size === "rail" ? "w-11 h-11 rounded-[15px]" : "w-9 h-9 rounded-xl"
      } ${
        active
          ? "border-white/35 text-white shadow-[0_10px_26px_-12px_rgba(168,85,247,0.95),inset_0_1px_0_rgba(255,255,255,0.4)]"
          : "border-white/[0.09] text-white/55 bg-white/[0.045] hover:text-white hover:border-white/25 hover:bg-white/[0.1]"
      }`}
    >
      {active && <span className="absolute inset-0 brand-grad opacity-30" />}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      <Icon className={`relative ${size === "rail" ? "w-[19px] h-[19px]" : "w-[17px] h-[17px]"}`} />
    </span>
  );

  const AccountMenu = () => (
    <div className="fixed bottom-[86px] right-3 z-[70] w-60 rounded-2xl gloss-strong overflow-hidden animate-slide-up lg:left-3 lg:right-auto">
      <div className="px-3.5 py-3 border-b border-white/[0.08]">
        <p className="text-sm font-semibold truncate">{user ? user.display_name || user.full_name || "Member" : "Browsing as a guest"}</p>
        <p className="text-[11px] text-white/45 truncate">{user ? user.email : "Sign in to save your work"}</p>
      </div>
      <div className="p-1.5 space-y-0.5">
        {!user && (
          <>
            <Link to="/login" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><LogIn className="w-4 h-4 text-white/60" /> Sign in</Link>
            <Link to="/register" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><UserPlus className="w-4 h-4 text-white/60" /> Create account</Link>
          </>
        )}
        {user && <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><User className="w-4 h-4 text-white/60" /> My account</Link>}
        <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><SettingsIcon className="w-4 h-4 text-white/60" /> Settings</Link>
        <button onClick={() => { setTranslatorOpen(true); setAccountOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-white/[0.07]"><Sparkles className="w-4 h-4 text-white/60" /> Translate</button>
        {user && (
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-300 hover:bg-rose-500/15"><LogOut className="w-4 h-4" /> Log off</button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ---------- desktop: X-style left navigation rail ---------- */}
      <aside className="group hidden lg:block fixed left-3 top-3 bottom-3 z-[52]">
        <div className="xsi-rail relative flex h-full w-[68px] flex-col overflow-hidden rounded-[26px] transition-[width] duration-300 ease-out group-hover:w-[236px]">
          <Link to="/" className="flex h-16 shrink-0 items-center gap-3 px-3.5">
            <BrandLogo size={26} />
            <span className="hidden whitespace-nowrap font-display text-[16px] font-extrabold tracking-[0.06em] group-hover:block">XSI</span>
          </Link>

          <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto scrollbar-none px-3 pb-2">
            {PRIMARY.map(({ key, to, label, icon }) => {
              const active = isActive(location.pathname, to);
              return (
                <Link key={key} to={to} title={label} className="relative flex items-center gap-3">
                  <Tile icon={icon} active={active} />
                  <span className={`hidden whitespace-nowrap text-[13.5px] group-hover:block ${active ? "font-bold text-white" : "font-semibold text-white/60"}`}>{label}</span>
                  {key === "messages" && unread > 0 && (
                    <span className="absolute left-8 top-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white grid place-items-center ring-2 ring-[#0b0819]">{unread > 9 ? "9+" : unread}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2 border-t border-white/[0.09] px-3 py-3">
            <button onClick={() => setAppsOpen(true)} title="All apps" className="flex w-full items-center gap-3">
              <span className="grid place-items-center w-11 h-11 shrink-0 rounded-[15px] border border-white/[0.09] bg-white/[0.045] text-white/60 transition-colors hover:border-white/25 hover:bg-white/[0.1] hover:text-white">
                <LayoutGrid className="w-[19px] h-[19px]" />
              </span>
              <span className="hidden whitespace-nowrap text-[13.5px] font-semibold text-white/60 group-hover:block">All apps</span>
            </button>

            <Link to="/settings" title="Settings" className="flex items-center gap-3">
              <Tile icon={SettingsIcon} active={isActive(location.pathname, "/settings")} />
              <span className="hidden whitespace-nowrap text-[13.5px] font-semibold text-white/60 group-hover:block">Settings</span>
            </Link>

            <button onClick={() => setAccountOpen((v) => !v)} aria-label="Account menu" className="flex w-full items-center gap-3">
              <span className={`relative grid place-items-center w-11 h-11 shrink-0 overflow-hidden rounded-[15px] border transition-colors ${accountOpen ? "border-white/50" : "border-white/[0.12]"} bg-white/[0.06]`}>
                {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <User className="w-[18px] h-[18px] text-white/60" />}
              </span>
              <span className="hidden min-w-0 flex-col items-start group-hover:flex">
                <span className="max-w-[150px] truncate text-[13px] font-semibold text-white">{user ? user.display_name || user.full_name || "Account" : "Guest"}</span>
                <span className="text-[10px] text-white/40">{user ? "Account" : "Sign in"}</span>
              </span>
            </button>
          </div>
        </div>
      </aside>
      {accountOpen && <AccountMenu />}

      {/* ---------- mobile: X-style bottom tab bar ---------- */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-[52] px-2.5 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex items-stretch rounded-[24px] border border-white/[0.14] bg-[#0b0818]/80 px-1 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_30px_60px_-30px_rgba(0,0,0,1)] backdrop-blur-2xl">
          {mobileItems.map(({ key, to, label, icon: Icon }) => {
            const active = isActive(location.pathname, to);
            return (
              <Link key={key} to={to} title={label} className="group relative flex flex-1 flex-col items-center gap-[3px] rounded-[18px] py-1.5">
                <span className={`absolute inset-x-2 top-0 h-[2px] rounded-full brand-grad transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`} />
                {active && <span className="absolute inset-1 rounded-[16px] bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />}
                <Icon
                  className="relative h-[19px] w-[19px] transition-transform duration-150 group-active:scale-90"
                  strokeWidth={active ? 2.4 : 1.9}
                  style={{ color: active ? "var(--brand)" : "rgba(255,255,255,0.52)" }}
                />
                <span className={`relative text-[9.5px] leading-none ${active ? "font-bold text-white" : "font-medium text-white/45"}`}>{label}</span>
                {key === "messages" && unread > 0 && <span className="absolute right-2.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-[#0b0818]" />}
              </Link>
            );
          })}
          <button onClick={() => setAppsOpen(true)} title="All apps" className="group relative flex flex-1 flex-col items-center gap-[3px] rounded-[18px] py-1.5">
            <LayoutGrid className="h-[19px] w-[19px] text-white/50 transition-transform duration-150 group-active:scale-90" />
            <span className="text-[9.5px] font-medium leading-none text-white/45">Apps</span>
          </button>
          <button onClick={() => setAccountOpen((v) => !v)} aria-label="Account" className="ml-0.5 grid w-9 shrink-0 place-items-center">
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white/[0.1] ring-1 ring-white/20">
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