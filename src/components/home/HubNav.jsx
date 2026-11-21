import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/BrandLogo";
import UniversalSearch from "@/components/home/UniversalSearch";
import {
  Home as HomeIcon, Clapperboard, Cpu, Newspaper, UtensilsCrossed, Gamepad2, Sparkles, Globe,
  BookOpen, Camera, Heart, MessageSquare, User as UserIcon, Music2, Film, Youtube, Radio,
  StickyNote, CalendarDays, Table, FileText, Presentation, Cloud, Calculator, Car, Store,
  BedDouble, Plane, TrendingUp, Truck, Settings, ListChecks, PenSquare, Monitor, LayoutGrid, Tv,
} from "lucide-react";

const GROUPS = [
  {
    label: "Hubs",
    items: [
      { to: "/assistant", label: "Super Internet", icon: Sparkles, top: true },
      { to: "/?cat=social", cat: "social", label: "Home", icon: HomeIcon },
      { to: "/?cat=entertainment", cat: "entertainment", label: "Entertainment", icon: Clapperboard },
      { to: "/?cat=tech", cat: "tech", label: "Tech", icon: Cpu },
      { to: "/?cat=news", cat: "news", label: "News", icon: Newspaper },
      { to: "/?cat=food", cat: "food", label: "Food & Services", icon: UtensilsCrossed },
      { to: "/?cat=gaming", cat: "gaming", label: "Gaming", icon: Gamepad2 },
      { to: "/?cat=aichat", cat: "aichat", label: "AI Chat", icon: Sparkles },
      { to: "/web", label: "Web Browser", icon: Globe },
    ],
  },
  {
    label: "Social",
    items: [
      { to: "/articles", label: "Articles", icon: BookOpen },
      { to: "/stories", label: "Stories", icon: Camera },
      { to: "/dating", label: "Dating", icon: Heart },
      { to: "/messages", label: "Messages", icon: MessageSquare },
      { to: "/profile", label: "Profile", icon: UserIcon },
    ],
  },
  {
    label: "Entertainment",
    items: [
      { to: "/music", label: "Music", icon: Music2 },
      { to: "/movies", label: "Movies", icon: Film },
      { to: "/video", label: "Video", icon: Youtube },
      { to: "/radio", label: "Radio", icon: Radio },
      { to: "/cable", label: "Cable TV", icon: Tv },
    ],
  },
  {
    label: "Productivity",
    items: [
      { to: "/productivity", label: "Productivity", icon: ListChecks },
      { to: "/notes", label: "Notes", icon: StickyNote },
      { to: "/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/sheets", label: "Sheets", icon: Table },
      { to: "/docs", label: "Docs", icon: FileText },
      { to: "/slides", label: "Slides", icon: Presentation },
      { to: "/cloud", label: "Cloud", icon: Cloud },
      { to: "/calculator", label: "Calculator", icon: Calculator },
    ],
  },
  {
    label: "Food & Services",
    items: [
      { to: "/eats", label: "Eats", icon: UtensilsCrossed },
      { to: "/rides", label: "Rides", icon: Car },
      { to: "/market", label: "Market", icon: Store },
      { to: "/hotels", label: "Hotels", icon: BedDouble },
      { to: "/flights", label: "Flights", icon: Plane },
      { to: "/finance", label: "Finance", icon: TrendingUp },
      { to: "/logistics", label: "Logistics", icon: Truck },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/desktop", label: "Desktop OS", icon: Monitor },
      { to: "/apps", label: "All Apps", icon: LayoutGrid },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

function Item({ item, active }) {
  const Icon = item.icon;
  if (item.top) {
    return (
      <Link
        to={item.to}
        className="group mb-1 flex items-center gap-3.5 rounded-2xl px-3.5 py-3 text-[15px] font-bold neon-btn transition-transform active:scale-[0.98]"
      >
        <Icon className="h-[22px] w-[22px] shrink-0" strokeWidth={2.4} />
        <span className="truncate">{item.label}</span>
        <span className="ml-auto rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">AI</span>
      </Link>
    );
  }
  return (
    <Link
      to={item.to}
      className={`group flex items-center gap-3.5 rounded-full px-3.5 py-2.5 text-[15px] transition-colors ${
        active ? "bg-white/[0.08] font-bold text-white" : "font-medium text-white/65 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <Icon className="h-[21px] w-[21px] shrink-0" style={{ color: active ? "var(--brand)" : undefined }} strokeWidth={active ? 2.4 : 1.9} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export default function HubNav() {
  const { pathname, search } = useLocation();
  const cat = new URLSearchParams(search).get("cat") || "social";
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const isActive = (item) => {
    if (item.cat) return pathname === "/" && (item.cat === "social" ? cat === "social" : cat === item.cat);
    if (item.to === "/") return pathname === "/" && cat === "social";
    return pathname === item.to;
  };

  const name = user?.display_name || user?.full_name || "Member";

  return (
    <aside className="hidden lg:flex sticky top-2 h-[calc(100dvh-16px)] w-[264px] shrink-0 flex-col">
      <div className="flex items-center gap-2.5 px-2 pb-3 pt-1">
        <BrandLogo size={34} />
        <span className="font-display text-[19px] font-extrabold tracking-tight leading-none">
          Vazolex <span style={{ color: "var(--brand)" }}>Plus</span>
        </span>
      </div>

      <div className="px-2 pb-2">
        <UniversalSearch />
      </div>

      <nav className="flex-1 overflow-y-auto thin-scrollbar px-1.5">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">{g.label}</p>
            {g.items.map((it) => (
              <Item key={it.to + it.label} item={it} active={isActive(it)} />
            ))}
          </div>
        ))}
      </nav>

      <div className="px-2 pt-2 pb-2 space-y-2">
        <Link
          to="/?cat=social"
          className="flex w-full items-center justify-center gap-2 rounded-full neon-btn py-3 text-[15px] font-bold"
        >
          <PenSquare className="h-4 w-4" /> Post
        </Link>
        <Link to="/profile" className="flex items-center gap-2.5 rounded-full px-2.5 py-2 hover:bg-white/[0.06] transition-colors">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><UserIcon className="h-4 w-4 text-white/70" /></span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold leading-tight">{name}</span>
            <span className="block truncate text-[11px] text-white/40">{user?.email || "Sign in"}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}