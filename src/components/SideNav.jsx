import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon, Clapperboard, Cpu, Newspaper, UtensilsCrossed, Gamepad2, Sparkles, Globe,
  Settings as SettingsIcon, User, LogOut, LogIn, UserPlus,
} from "lucide-react";
import TranslatorPanel from "@/components/TranslatorPanel";
import BrandLogo from "@/components/BrandLogo";

// Bottom dock = every section, icon-only, clean. Scrolls horizontally on small screens.
const CATS = [
  { key: "social", to: "/", label: "Social", icon: HomeIcon },
  { key: "entertainment", to: "/?cat=entertainment", label: "Entertainment", icon: Clapperboard },
  { key: "tech", to: "/?cat=tech", label: "Tech", icon: Cpu },
  { key: "news", to: "/?cat=news", label: "News", icon: Newspaper },
  { key: "food", to: "/?cat=food", label: "Food", icon: UtensilsCrossed },
  { key: "gaming", to: "/?cat=gaming", label: "Gaming", icon: Gamepad2 },
  { key: "aichat", to: "/?cat=aichat", label: "AI Chat", icon: Sparkles },
  { key: "web", to: "/browser", label: "Web Browser", icon: Globe },
];

export default function SideNav() {
  const location = useLocation();
  const [params] = useSearchParams();
  const cat = params.get("cat") || "social";
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

  useEffect(() => { setAccountOpen(false); }, [location.pathname, location.search]);

  const logout = async () => {
    try { await base44.auth.logout(); } catch { window.location.href = "/"; }
  };

  const onHome = location.pathname === "/";
  const isActive = (item) => {
    if (item.to && item.to !== "/" && !item.to.includes("?")) return location.pathname === item.to;
    return onHome && (item.key === "social" ? cat === "social" : cat === item.key);
  };

  const AccountMenu = () => (
    <div className="fixed bottom-[84px] right-3 z-[70] w-60 rounded-2xl bg-[#1c1c1e] border border-white/10 overflow-hidden animate-slide-up shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)]">
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
    const active = isActive(item);
    return (
      <Link to={item.to} title={item.label} className="group relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors">
        {active && <span className="absolute inset-0 rounded-2xl" style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)" }} />}
        <item.icon
          className="relative h-[21px] w-[21px] transition-transform duration-150 group-active:scale-90"
          strokeWidth={active ? 2.3 : 1.7}
          style={{ color: active ? "var(--brand)" : "rgba(255,255,255,0.6)" }}
        />
        {item.key === "social" && unread > 0 && (
          <span className="absolute right-1.5 top-1.5 min-w-4 h-4 px-1 rounded-full bg-[var(--brand)] text-[10px] font-bold text-white grid place-items-center">{unread > 9 ? "9+" : unread}</span>
        )}
        <span className="pointer-events-none absolute -top-7 px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-white/70">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[52] flex justify-center px-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-0.5 max-w-[calc(100vw-1rem)] overflow-x-auto scrollbar-none rounded-2xl border border-white/[0.08] bg-[#1c1c1e]/90 px-1.5 py-1.5 backdrop-blur-xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)]">
          <Link to="/" className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl sm:grid" title="Vazolex Plus">
            <BrandLogo size={22} />
          </Link>

          {CATS.map((item) => (
            <NavButton key={item.key} item={item} />
          ))}

          <span className="mx-0.5 h-6 w-px shrink-0 bg-white/10" />

          <button onClick={() => setAccountOpen((v) => !v)} aria-label="Account" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><User className="h-4 w-4 text-white/70" /></span>}
          </button>
        </div>
      </div>
      {accountOpen && <AccountMenu />}

      {translatorOpen && <TranslatorPanel onClose={() => setTranslatorOpen(false)} />}
    </>
  );
}