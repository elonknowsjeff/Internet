import React from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Music2, Film, Youtube, Radio, Globe, LayoutGrid, Table, FileText, Presentation,
  Cloud as CloudIcon, Calculator as CalculatorIcon, Newspaper, BookOpen, Compass,
  UtensilsCrossed, Car, Store, BedDouble, Plane, TrendingUp, Truck,
  ListChecks, StickyNote, CalendarDays, MessageSquare, Heart, Sparkles, User,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import Feed from "@/pages/Feed";
import Gaming from "@/pages/Gaming";
import Assistant from "@/pages/Assistant";

const SECTIONS = {
  entertainment: {
    title: "Entertainment",
    apps: [
      { to: "/music", label: "Music", icon: Music2 },
      { to: "/movies", label: "Movies", icon: Film },
      { to: "/video", label: "Video", icon: Youtube },
      { to: "/radio", label: "Radio", icon: Radio },
    ],
  },
  tech: {
    title: "Tech",
    apps: [
      { to: "/browser", label: "Browser", icon: Globe },
      { to: "/web", label: "Web", icon: Compass },
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
  },
  news: {
    title: "News",
    apps: [
      { to: "/news", label: "News", icon: Newspaper },
      { to: "/articles", label: "Articles", icon: BookOpen },
    ],
  },
  food: {
    title: "Food & Services",
    apps: [
      { to: "/eats", label: "Eats", icon: UtensilsCrossed },
      { to: "/rides", label: "Rides", icon: Car },
      { to: "/market", label: "Market", icon: Store },
      { to: "/hotels", label: "Hotels", icon: BedDouble },
      { to: "/flights", label: "Flights", icon: Plane },
      { to: "/finance", label: "Finance", icon: TrendingUp },
      { to: "/logistics", label: "Logistics", icon: Truck },
    ],
  },
};

const SOCIAL_LINKS = [
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/dating", label: "Dating", icon: Heart },
  { to: "/stories", label: "Stories", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: User },
];

function AppGrid({ section }) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-5xl px-4 pb-6 pt-2">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full brand-grad" />
        <h2 className="text-[18px] font-bold tracking-tight">{section.title}</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {section.apps.map((a) => (
          <button
            key={a.to}
            onClick={() => navigate(a.to)}
            className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl brand-grad text-black shadow-[0_8px_20px_-10px_var(--brand)] transition-transform group-hover:scale-105">
              <a.icon className="h-6 w-6" />
            </span>
            <span className="text-[13px] font-medium text-white/85">{a.label}</span>
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
      <header className="flex items-center gap-3 px-4 pt-5 pb-4 sm:px-6">
        <BrandLogo size={46} />
        <div className="min-w-0">
          <h1 className="font-display text-[24px] font-extrabold tracking-tight leading-none">
            Vazolex <span style={{ color: "var(--brand)" }}>Plus</span>
          </h1>
          <p className="text-[12px] text-white/45 mt-1.5">Your everything hub, all in one place</p>
        </div>
      </header>

      {cat === "social" && (
        <>
          <div className="flex gap-2 px-4 sm:px-6 pb-2 overflow-x-auto scrollbar-none">
            {SOCIAL_LINKS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[12.5px] font-medium hover:bg-white/[0.1] transition-colors"
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
      {SECTIONS[cat] && <AppGrid section={SECTIONS[cat]} />}
    </div>
  );
}