import React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Music2, Film, Youtube, Radio, Globe, LayoutGrid, Table, FileText, Presentation,
  Cloud as CloudIcon, Calculator as CalculatorIcon, Newspaper, BookOpen,
  UtensilsCrossed, Car, Store, BedDouble, Plane, TrendingUp, Truck,
  ListChecks, StickyNote, CalendarDays, MessageSquare, Heart, Sparkles, User,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import Feed from "@/pages/Feed";
import Gaming from "@/pages/Gaming";
import Assistant from "@/pages/Assistant";

const SECTIONS = {
  entertainment: [
    { to: "/music", label: "Music", icon: Music2 },
    { to: "/movies", label: "Movies", icon: Film },
    { to: "/video", label: "Video", icon: Youtube },
    { to: "/radio", label: "Radio", icon: Radio },
  ],
  tech: [
    { to: "/browser", label: "Browser", icon: Globe },
    { to: "/apps", label: "Apps", icon: LayoutGrid },
    { to: "/productivity", label: "Productivity", icon: ListChecks },
    { to: "/notes", label: "Notes", icon: StickyNote },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/sheets", label: "Sheets", icon: Table },
    { to: "/docs", label: "Docs", icon: FileText },
    { to: "/slides", label: "Slides", icon: Presentation },
    { to: "/cloud", label: "Cloud", icon: CloudIcon },
    { to: "/calculator", label: "Calculator", icon: CalculatorIcon },
  ],
  news: [
    { to: "/news", label: "News", icon: Newspaper },
    { to: "/articles", label: "Articles", icon: BookOpen },
  ],
  food: [
    { to: "/eats", label: "Eats", icon: UtensilsCrossed },
    { to: "/rides", label: "Rides", icon: Car },
    { to: "/market", label: "Market", icon: Store },
    { to: "/hotels", label: "Hotels", icon: BedDouble },
    { to: "/flights", label: "Flights", icon: Plane },
    { to: "/finance", label: "Finance", icon: TrendingUp },
    { to: "/logistics", label: "Logistics", icon: Truck },
  ],
};

const SOCIAL_LINKS = [
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/dating", label: "Dating", icon: Heart },
  { to: "/stories", label: "Stories", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

function AppGrid({ apps }) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {apps.map((a) => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left hover:bg-white/[0.07] transition-colors"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl brand-grad text-black">
              <a.icon className="h-5 w-5" />
            </span>
            <span className="text-[14px] font-medium truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [params] = useSearchParams();
  const cat = params.get("cat") || "social";

  return (
    <div className="min-h-[100dvh]">
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <BrandLogo size={40} />
        <div>
          <h1 className="font-display text-[22px] font-bold tracking-tight leading-none">Vazolex Plus</h1>
          <p className="text-[11px] text-white/45 mt-1">Your everything hub</p>
        </div>
      </header>

      {cat === "social" && (
        <>
          <div className="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-none">
            {SOCIAL_LINKS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium hover:bg-white/[0.1]"
              >
                <s.icon className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> {s.label}
              </Link>
            ))}
          </div>
          <Feed />
        </>
      )}
      {cat === "gaming" && <Gaming />}
      {cat === "aichat" && <Assistant />}
      {SECTIONS[cat] && <AppGrid apps={SECTIONS[cat]} />}
    </div>
  );
}