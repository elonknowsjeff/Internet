import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Home as HomeIcon, MessageSquare, Sparkles, Compass, Newspaper, Music2, Youtube, Radio,
  Gamepad2, Monitor, Globe, ListChecks, StickyNote, CalendarDays, Calculator as CalculatorIcon,
  Table, FileText, Presentation, Cloud as CloudIcon, Store, TrendingUp, BedDouble, Plane,
  Heart, Film, User, Settings as SettingsIcon, LogOut, LogIn, UserPlus, Camera, Upload, BookOpen,
  Tv,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import ProfilePhotoDialog from "@/components/profile/ProfilePhotoDialog";

// Every app, in plain sight on the main bar — grouped into themed sections.
const SECTIONS = [
  {
    name: "Social",
    apps: [
      { to: "/", label: "Feed", icon: HomeIcon, match: (p, cat) => p === "/" && cat !== "gaming" && cat !== "entertainment" && cat !== "aichat" },
      { to: "/messages", label: "Messages", icon: MessageSquare, match: (p) => p === "/messages" },
      { to: "/stories", label: "Stories", icon: Sparkles, match: (p) => p === "/stories" },
      { to: "/discover", label: "Discover", icon: Compass, match: (p) => p === "/discover" },
      { to: "/news", label: "News", icon: Newspaper, match: (p) => p === "/news" },
      { to: "/articles", label: "Articles", icon: BookOpen, match: (p) => p === "/articles" },
      { to: "/dating", label: "Dating", icon: Heart, match: (p) => p === "/dating" },
      { to: "/upload", label: "Upload", icon: Upload, match: (p) => p === "/upload" },
    ],
  },
  {
    name: "Entertainment",
    apps: [
      { to: "/music", label: "Music", icon: Music2, match: (p) => p === "/music" },
      { to: "/video", label: "Video", icon: Youtube, match: (p) => p === "/video" },
      { to: "/movies", label: "Series", icon: Film, match: (p) => p === "/movies" },
      { to: "/cable", label: "Live TV", icon: Tv, match: (p) => p === "/cable" },
      { to: "/radio", label: "Radio", icon: Radio, match: (p) => p === "/radio" },
      { to: "/?cat=gaming", label: "Arcade", icon: Gamepad2, match: (p, cat) => p === "/" && cat === "gaming" },
      { to: "/assistant", label: "AI Chat", icon: Sparkles, match: (p, cat) => p === "/assistant" || (p === "/" && cat === "aichat") },
    ],
  },
  {
    name: "Productivity",
    apps: [
      { to: "/productivity", label: "Hub", icon: ListChecks, match: (p) => p === "/productivity" },
      { to: "/notes", label: "Notes", icon: StickyNote, match: (p) => p === "/notes" },
      { to: "/calendar", label: "Calendar", icon: CalendarDays, match: (p) => p === "/calendar" },
      { to: "/calculator", label: "Calc", icon: CalculatorIcon, match: (p) => p === "/calculator" },
      { to: "/sheets", label: "Sheets", icon: Table, match: (p) => p === "/sheets" },
      { to: "/docs", label: "Docs", icon: FileText, match: (p) => p === "/docs" },
      { to: "/slides", label: "Slides", icon: Presentation, match: (p) => p === "/slides" },
      { to: "/cloud", label: "Cloud", icon: CloudIcon, match: (p) => p === "/cloud" },
    ],
  },
  {
    name: "Tools",
    apps: [
      { to: "/desktop", label: "Desktop", icon: Monitor, match: (p) => p === "/desktop" },
      { to: "/browser", label: "Browser", icon: Globe, match: (p) => p === "/browser" },
      { to: "/market", label: "Market", icon: Store, match: (p) => p === "/market" },
      { to: "/finance", label: "Finance", icon: TrendingUp, match: (p) => p === "/finance" },
      { to: "/hotels", label: "Hotels", icon: BedDouble, match: (p) => p === "/hotels" },
      { to: "/flights", label: "Flights", icon: Plane, match: (p) => p === "/flights" },
    ],
  },
];

export default function BottomTabs() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const cat = params.get("cat") || "social";
  const [accountOpen, setAccountOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
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

  const AppIcon = ({ item }) => {
    const active = item.match(pathname, cat);
    const Icon = item.icon;
    return (
      <Link to={item.to} className="group relative flex shrink-0 flex-col items-center justify-center" title={item.label}>
        <span
          className="relative grid h-10 w-10 place-items-center rounded-xl transition-all duration-150"
          style={active
            ? { background: "color-mix(in srgb, var(--brand) 20%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--brand) 42%, transparent)" }
            : {}}
        >
          <Icon
            className="h-[18px] w-[18px] transition-transform duration-150 group-active:scale-90"
            strokeWidth={active ? 2.3 : 1.7}
            style={{ color: active ? "var(--brand)" : "rgba(255,255,255,0.72)" }}
          />
          {item.to === "/messages" && unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-black" style={{ background: "var(--brand)" }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
        {/* Windows 11 active indicator pill */}
        <span
          className="mt-0.5 h-[3px] rounded-full transition-all duration-150"
          style={active ? { width: 16, background: "var(--brand)" } : { width: 0, background: "transparent" }}
        />
        {/* hover label */}
        <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-white/10 bg-black/85 px-2 py-1 text-[11px] font-medium opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
          {item.label}
        </span>
      </Link>
    );
  };

  const AccountMenu = () => (
    <div className="fixed bottom-[76px] right-3 z-[70] w-64 overflow-hidden rounded-2xl border border-white/12 bg-[#1c1c20]/85 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-slide-up">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-3.5 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10">
          {user?.avatar ? <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <User className="h-5 w-5 text-white/60" />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user ? user.display_name || user.full_name || "Member" : "Browsing as a guest"}</p>
          <p className="truncate text-[11px] text-white/45">{user ? user.email : "Sign in to save your work"}</p>
        </div>
      </div>
      <div className="space-y-0.5 p-1.5">
        {!user && (
          <>
            <Link to="/login" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><LogIn className="h-4 w-4 text-white/60" /> Sign in</Link>
            <Link to="/register" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><UserPlus className="h-4 w-4 text-white/60" /> Create account</Link>
          </>
        )}
        {user && <Link to="/profile" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><User className="h-4 w-4 text-white/60" /> My account</Link>}
        {user && (
          <button onClick={() => { setPhotoOpen(true); setAccountOpen(false); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]">
            <Camera className="h-4 w-4 text-white/60" /> Edit profile photo
          </button>
        )}
        <Link to="/settings" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-white/[0.06]"><SettingsIcon className="h-4 w-4 text-white/60" /> Settings</Link>
        {user && (
          <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"><LogOut className="h-4 w-4" /> Log off</button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Windows 11 taskbar — centered, acrylic, every app in plain sight */}
      <div className="fixed inset-x-0 bottom-0 z-[52] flex justify-center px-2 pb-[calc(8px+env(safe-area-inset-bottom))]">
        <div className="flex max-w-full items-center gap-0.5 overflow-x-auto scrollbar-none rounded-[18px] border border-white/[0.08] bg-[#101014]/72 px-2 py-1.5 backdrop-blur-2xl shadow-[0_14px_44px_-18px_rgba(0,0,0,0.9)]">
          <Link to="/" className="mr-1 hidden h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-white/10 sm:grid" title="Internet X">
            <BrandLogo size={22} />
          </Link>
          {SECTIONS.map((sec) => (
            <div key={sec.name} className="flex shrink-0 items-center gap-0.5">
              <span className="hidden shrink-0 select-none px-1 text-[8.5px] font-semibold uppercase tracking-wider text-white/30 lg:block">{sec.name}</span>
              <span className="mx-1 hidden h-7 w-px shrink-0 bg-white/10 sm:block" />
              {sec.apps.map((item) => <AppIcon key={item.label} item={item} />)}
            </div>
          ))}
          <button
            onClick={() => setAccountOpen((v) => !v)}
            aria-label="Account"
            className="flex shrink-0 flex-col items-center justify-center"
          >
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl transition-transform active:scale-95">
              {user?.avatar
                ? <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/15" />
                : <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><User className="h-4 w-4 text-white/70" /></span>}
            </span>
            <span className="mt-0.5 h-[3px] w-0 rounded-full" />
          </button>
        </div>
      </div>
      {accountOpen && <AccountMenu />}
      {photoOpen && (
        <ProfilePhotoDialog
          open={photoOpen}
          user={user}
          onClose={() => setPhotoOpen(false)}
          onSaved={(url) => { setUser((u) => ({ ...u, avatar: url })); setPhotoOpen(false); }}
        />
      )}
    </>
  );
}