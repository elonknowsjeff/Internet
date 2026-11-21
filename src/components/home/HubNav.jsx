import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/BrandLogo";
import UniversalSearch from "@/components/home/UniversalSearch";
import { ChevronDown } from "lucide-react";
import {
  Home as HomeIcon, Clapperboard, Cpu, Newspaper, UtensilsCrossed, Gamepad2, Sparkles, Globe,
  BookOpen, Camera, Heart, MessageSquare, User as UserIcon, Music2, Film, Youtube, Radio,
  StickyNote, CalendarDays, Table, FileText, Presentation, Cloud, Calculator, Car, Store,
  BedDouble, Plane, TrendingUp, Truck, Settings, ListChecks, PenSquare, Monitor, LayoutGrid, Tv,
  Twitter, Instagram, MessageCircle,
} from "lucide-react";

const GROUPS = [
  { label: "Hubs", items: [
    { to: "/?cat=social", cat: "social", label: "Home", icon: HomeIcon },
    { to: "/?cat=entertainment", cat: "entertainment", label: "Entertainment", icon: Clapperboard },
    { to: "/?cat=tech", cat: "tech", label: "Tech", icon: Cpu },
    { to: "/?cat=news", cat: "news", label: "News", icon: Newspaper },
    { to: "/?cat=food", cat: "food", label: "Food & Services", icon: UtensilsCrossed },
    { to: "/?cat=gaming", cat: "gaming", label: "Arcade", icon: Gamepad2 },
    { to: "/?cat=aichat", cat: "aichat", label: "AI Chat", icon: Sparkles },
  ]},
  { label: "Social", items: [
    { to: "/browser?url=https://x.com", label: "X", icon: Twitter },
    { to: "/browser?url=https://www.instagram.com", label: "Instagram", icon: Instagram },
    { to: "/browser?url=https://web.whatsapp.com", label: "WhatsApp", icon: MessageCircle },
    { to: "/browser", label: "Web Browser", icon: Globe },
    { to: "/articles", label: "Articles", icon: BookOpen },
    { to: "/stories", label: "Stories", icon: Camera },
    { to: "/dating", label: "Dating", icon: Heart },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/profile", label: "Profile", icon: UserIcon },
  ]},
  { label: "Entertainment", items: [
    { to: "/music", label: "Music", icon: Music2 },
    { to: "/video", label: "Video", icon: Youtube },
    { to: "/radio", label: "Radio", icon: Radio },
    { to: "/cable", label: "Cable TV", icon: Tv },
  ]},
  { label: "Productivity", items: [
    { to: "/productivity", label: "Productivity", icon: ListChecks },
    { to: "/notes", label: "Notes", icon: StickyNote },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/sheets", label: "Sheets", icon: Table },
    { to: "/docs", label: "Docs", icon: FileText },
    { to: "/slides", label: "Slides", icon: Presentation },
    { to: "/cloud", label: "Cloud", icon: Cloud },
    { to: "/calculator", label: "Calculator", icon: Calculator },
  ]},
  { label: "Food & Services", items: [
    { to: "/market", label: "Market", icon: Store },
    { to: "/hotels", label: "Hotels", icon: BedDouble },
    { to: "/flights", label: "Flights", icon: Plane },
    { to: "/finance", label: "Finance", icon: TrendingUp },
  ]},
  { label: "System", items: [
    { to: "/desktop", label: "Desktop OS", icon: Monitor },
    { to: "/apps", label: "All Apps", icon: LayoutGrid },
  ]},
  { label: "Account", items: [
    { to: "/settings", label: "Settings", icon: Settings },
  ]},
];

function isActiveItem(item, pathname, cat) {
  if (item.cat) return pathname === "/" && (item.cat === "social" ? cat === "social" : cat === item.cat);
  if (item.to === "/") return pathname === "/" && cat === "social";
  return pathname === item.to;
}

export default function HubNav() {
  const { pathname, search } = useLocation();
  const cat = new URLSearchParams(search).get("cat") || "social";
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(() => ({
    Hubs: true, Social: true, Entertainment: true, Productivity: true,
    "Food & Services": true, System: true, Account: true,
  }));

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  const name = user?.display_name || user?.full_name || "Member";
  const toggle = (label) => setOpen((o) => ({ ...o, [label]: !o[label] }));

  return (
    <aside className="hidden lg:flex sticky top-2 h-[calc(100dvh-16px)] w-[264px] shrink-0 flex-col rounded-[28px] ig-panel overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
        <BrandLogo size={32} />
        <span className="font-display text-[19px] font-extrabold tracking-tight leading-none ig-text">
          Vazolex <span style={{ color: "var(--accent)" }}>Plus</span>
        </span>
      </div>

      <div className="px-3 pb-2">
        <UniversalSearch />
      </div>

      <nav className="flex-1 overflow-y-auto thin-scrollbar px-2.5 pb-3">
        {/* Super Internet — pinned at the top */}
        <Link
          to="/assistant"
          className="group mb-3 flex h-14 items-center gap-3 rounded-2xl ig-grad px-3 text-white transition-transform active:scale-[0.98]"
          style={{ boxShadow: "0 8px 28px -8px var(--accent)" }}
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/25">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>
          <span className="flex-1 text-[15px] font-bold">Super Internet</span>
          <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">AI</span>
        </Link>

        {GROUPS.map((g) => (
          <div key={g.label} className="mb-3">
            <button
              onClick={() => toggle(g.label)}
              className="flex w-full items-center justify-between px-2 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] ig-muted hover:opacity-80"
            >
              <span>{g.label}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open[g.label] ? "" : "-rotate-90"}`} />
            </button>
            {open[g.label] && (
              <div className="space-y-0.5">
                {g.items.map((it) => {
                  const active = isActiveItem(it, pathname, cat);
                  const Icon = it.icon;
                  return (
                    <Link
                      key={it.to + it.label}
                      to={it.to}
                      className={`ig-row relative flex items-center gap-3 px-3 py-2.5 text-[15px] ${active ? "is-active" : ""}`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full" style={{ background: "var(--accent)" }} />
                      )}
                      <Icon className="h-[21px] w-[21px] shrink-0" strokeWidth={active ? 2.4 : 1.8} />
                      <span className={`truncate ${active ? "font-semibold" : ""}`}>{it.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-3 pt-2 pb-3 space-y-2.5">
        <Link
          to="/?cat=social"
          className="ig-post flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold transition-all"
        >
          <PenSquare className="h-4 w-4" /> Post
        </Link>
        <Link
          to="/profile"
          className="ig-chip flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 transition-colors"
        >
          {user?.avatar ? (
            <span className="relative">
              <span className="absolute -inset-0.5 rounded-full" style={{ background: "var(--accent-gradient)" }} />
              <img src={user.avatar} alt="" className="relative h-9 w-9 rounded-full object-cover ring-2 ring-[var(--surface-solid)]" />
            </span>
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full ig-solid">
              <UserIcon className="h-4 w-4 ig-muted" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold ig-text">{name}</span>
            <span className="block truncate text-[11px] ig-muted">{user?.email || "Sign in"}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}