import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon, Search, Play, Mail, Bell, CreditCard, User, Plus,
  MoreHorizontal, LogOut, Settings as Gear, Sparkles, Music2, Youtube, Radio,
  Gamepad2, Newspaper, BookOpen, Heart, Table, FileText, Presentation,
  Cloud as CloudIcon, Store, TrendingUp, BedDouble, Plane, Monitor, Globe,
  CalendarDays, StickyNote, Calculator as CalcIcon, ArrowLeft, Check,
} from "lucide-react";
import ZIcon from "@/components/ZIcon";

const NAV = [
  { to: "/", label: "Home", icon: HomeIcon, match: (p) => p === "/" },
  { to: "/discover", label: "Explore", icon: Search, match: (p) => p === "/discover" },
  { to: "/video", label: "Reels", icon: Play, match: (p) => p === "/video" },
  { to: "/messages", label: "Messages", icon: Mail, match: (p) => p === "/messages" },
  { to: "/?cat=notifications", label: "Notifications", icon: Bell, match: (p) => p === "/?cat=notifications" },
  { to: "/finance", label: "Wallet", icon: CreditCard, match: (p) => p === "/finance" },
  { to: "/profile", label: "Profile", icon: User, match: (p) => p === "/profile" },
];

const MORE_APPS = [
  { to: "/music", label: "Music", icon: Music2 },
  { to: "/movies", label: "Movies", icon: Youtube },
  { to: "/radio", label: "Radio", icon: Radio },
  { to: "/?cat=gaming", label: "Arcade", icon: Gamepad2 },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/articles", label: "Articles", icon: BookOpen },
  { to: "/dating", label: "Dating", icon: Heart },
  { to: "/productivity", label: "Hub", icon: Sparkles },
  { to: "/notes", label: "Notes", icon: StickyNote },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/calculator", label: "Calc", icon: CalcIcon },
  { to: "/sheets", label: "Sheets", icon: Table },
  { to: "/docs", label: "Docs", icon: FileText },
  { to: "/slides", label: "Slides", icon: Presentation },
  { to: "/cloud", label: "Cloud", icon: CloudIcon },
  { to: "/market", label: "Market", icon: Store },
  { to: "/hotels", label: "Hotels", icon: BedDouble },
  { to: "/flights", label: "Flights", icon: Plane },
  { to: "/desktop", label: "Desktop", icon: Monitor },
  { to: "/browser", label: "Browser", icon: Globe },
  { to: "/assistant", label: "AI Chat", icon: Sparkles },
  { to: "/upload", label: "Upload", icon: Plus },
];

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/discover", label: "Explore", icon: Search },
  { to: "/video", label: "Reels", icon: Play },
  { to: "/messages", label: "Messages", icon: Mail },
  { to: "/profile", label: "Profile", icon: User },
];

export default function ZNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u) {
        base44.entities.DirectMessage.count({ receiver_id: u.id, read: false }).then(setUnread).catch(() => {});
      }
    }).catch(() => setUser(null));
  }, []);

  useEffect(() => { setMoreOpen(false); setAcctOpen(false); }, [pathname]);

  const logout = async () => { try { await base44.auth.logout(); } catch { window.location.href = "/"; } };

  const isActive = (item) => {
    if (item.to === "/") return pathname === "/";
    return pathname.startsWith(item.to.split("?")[0]) && item.to !== "/";
  };

  // ── Desktop left sidebar ──
  const SidebarItem = ({ item }) => {
    const active = isActive(item);
    const Icon = item.icon;
    return (
      <Link
        to={item.to}
        className="group flex items-center gap-5 rounded-full px-4 py-3 text-[19px] transition-colors hover:bg-white/[0.06]"
        style={active ? { fontWeight: 700 } : { fontWeight: 400 }}
      >
        <span className="relative">
          <Icon className="h-[26px] w-[26px]" strokeWidth={active ? 2.5 : 1.8} />
          {item.label === "Messages" && unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#1d9bf0] px-1 text-[9px] font-bold text-black">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        <span className="hidden xl:inline">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-[100dvh] w-[72px] flex-col border-r border-[#2F3336] bg-black px-2 py-3 lg:flex lg:w-[260px]">
        <Link to="/" className="mb-2 flex items-center gap-2 px-3 py-2">
          <ZIcon size={36} />
          <span className="hidden text-2xl font-black tracking-tighter lg:inline">Z</span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => <SidebarItem key={item.label} item={item} />)}
          <button
            onClick={() => navigate("/upload")}
            className="mx-2 mt-3 flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[17px] font-bold text-black transition-transform active:scale-95 xl:mx-0"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            <span className="hidden lg:inline">Create</span>
          </button>
        </nav>

        {/* More apps */}
        <div className="relative mt-auto">
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className="flex w-full items-center gap-5 rounded-full px-4 py-3 text-[19px] hover:bg-white/[0.06]"
          >
            <MoreHorizontal className="h-[26px] w-[26px]" strokeWidth={1.8} />
            <span className="hidden xl:inline">More</span>
          </button>
          {moreOpen && (
            <div className="absolute bottom-0 left-full ml-3 w-64 rounded-2xl border border-[#2F3336] bg-black p-2 shadow-2xl">
              <div className="grid grid-cols-3 gap-1">
                {MORE_APPS.map((app) => {
                  const Icon = app.icon;
                  return (
                    <Link
                      key={app.to}
                      to={app.to}
                      className="flex flex-col items-center gap-1.5 rounded-xl p-2.5 text-center hover:bg-white/[0.06]"
                    >
                      <Icon className="h-5 w-5 text-white/80" strokeWidth={1.8} />
                      <span className="text-[10px] text-white/60">{app.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Account */}
        <button
          onClick={() => setAcctOpen((v) => !v)}
          className="mt-2 flex items-center gap-3 rounded-full p-2 hover:bg-white/[0.06]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              : <User className="h-4 w-4 text-white/60" />}
          </span>
          <span className="hidden min-w-0 flex-1 text-left xl:block">
            <span className="block truncate text-[14px] font-bold">{user?.display_name || user?.full_name || "Guest"}</span>
            <span className="block truncate text-[12px] text-white/45">@{user?.username || (user?.email ? user.email.split("@")[0] : "guest")}</span>
          </span>
        </button>
        {acctOpen && (
          <div className="absolute bottom-16 left-3 w-56 rounded-2xl border border-[#2F3336] bg-black p-1.5 shadow-2xl">
            {!user && (
              <>
                <Link to="/login" className="block rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.06]">Sign in</Link>
                <Link to="/register" className="block rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.06]">Create account</Link>
              </>
            )}
            {user && <Link to="/profile" className="block rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.06]">My profile</Link>}
            <Link to="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm hover:bg-white/[0.06]"><Gear className="h-4 w-4" /> Settings</Link>
            {user && (
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Log off</button>
            )}
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-[#2F3336] bg-black/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl xl:hidden">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="flex flex-1 flex-col items-center gap-0.5 py-1.5">
              <span className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 1.8} style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)" }} />
                {item.label === "Messages" && unread > 0 && (
                  <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#1d9bf0] px-1 text-[9px] font-bold text-black">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span className="text-[10px]" style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}