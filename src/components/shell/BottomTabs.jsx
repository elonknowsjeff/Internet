import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon, Film, Gamepad2, Sparkles, Monitor, User, Settings as SettingsIcon, LogOut, LogIn, UserPlus,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

// Apps grouped by category, all laid out in the dock.
const TABS = [
  { key: "social", to: "/?cat=social", label: "Social", icon: HomeIcon, match: (p, cat) => p === "/" && cat !== "gaming" && cat !== "entertainment" && cat !== "aichat" },
  { key: "ent", to: "/?cat=entertainment", label: "Entertainment", icon: Film, match: (p, cat) => p === "/" && cat === "entertainment" },
  { key: "games", to: "/?cat=gaming", label: "Games", icon: Gamepad2, match: (p, cat) => p === "/" && cat === "gaming" },
  { key: "ai", to: "/assistant", label: "AI Chat", icon: Sparkles, match: (p, cat) => p === "/assistant" || (p === "/" && cat === "aichat") },
  { key: "desktop", to: "/desktop", label: "Desktop", icon: Monitor, match: (p) => p === "/desktop" },
];

export default function BottomTabs() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const cat = params.get("cat") || "social";
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

  useEffect(() => { setAccountOpen(false); }, [pathname]);

  const logout = async () => {
    try { await base44.auth.logout(); } catch { window.location.href = "/"; }
  };

  const Tab = ({ item }) => {
    const active = item.match(pathname, cat);
    const Icon = item.icon;
    return (
      <Link to={item.to} className="group relative flex flex-1 flex-col items-center justify-center gap-1 py-1">
        <span className="relative grid h-9 w-9 place-items-center rounded-xl transition-colors">
          {active && (
            <span
              className="absolute inset-0 rounded-xl"
              style={{ background: "color-mix(in srgb, var(--brand) 16%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--brand) 30%, transparent)" }}
            />
          )}
          <Icon
            className="relative h-5 w-5 transition-transform duration-150 group-active:scale-90"
            strokeWidth={active ? 2.2 : 1.7}
            style={{ color: active ? "var(--brand)" : "rgba(255,255,255,0.6)" }}
          />
          {item.key === "social" && unread > 0 && (
            <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-white" style={{ background: "var(--brand)" }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        <span className={`text-[10px] font-semibold tracking-tight ${active ? "text-[var(--brand)]" : "text-white/50"}`}>{item.label}</span>
      </Link>
    );
  };

  const AccountMenu = () => (
    <div className="fixed bottom-[88px] right-3 z-[70] w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1e] shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] animate-slide-up">
      <div className="border-b border-white/[0.08] px-3.5 py-3">
        <p className="truncate text-sm font-semibold">{user ? user.display_name || user.full_name || "Member" : "Browsing as a guest"}</p>
        <p className="truncate text-[11px] text-white/45">{user ? user.email : "Sign in to save your work"}</p>
      </div>
      <div className="space-y-0.5 p-1.5">
        {!user && (
          <>
            <Link to="/login" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><LogIn className="h-4 w-4 text-white/60" /> Sign in</Link>
            <Link to="/register" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><UserPlus className="h-4 w-4 text-white/60" /> Create account</Link>
          </>
        )}
        {user && <Link to="/profile" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><User className="h-4 w-4 text-white/60" /> My account</Link>}
        <Link to="/settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><SettingsIcon className="h-4 w-4 text-white/60" /> Settings</Link>
        {user && (
          <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Log off</button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[52] flex justify-center px-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex w-full max-w-[660px] items-center gap-1 rounded-[22px] border border-white/[0.07] bg-[#0b0b0f]/90 px-2 py-1.5 backdrop-blur-2xl shadow-[0_14px_40px_-18px_rgba(0,0,0,0.9)]">
          <Link to="/" className="mr-0.5 hidden h-9 w-9 shrink-0 place-items-center rounded-xl hover:bg-white/10 sm:grid" title="Internet X">
            <BrandLogo size={20} />
          </Link>
          {TABS.map((item) => <Tab key={item.key} item={item} />)}
          <button
            onClick={() => setAccountOpen((v) => !v)}
            aria-label="Account"
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1"
          >
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                : <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><User className="h-4 w-4 text-white/70" /></span>}
            </span>
            <span className="text-[10px] font-semibold text-white/50">Account</span>
          </button>
        </div>
      </div>
      {accountOpen && <AccountMenu />}
    </>
  );
}