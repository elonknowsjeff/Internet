import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Music2, Film, Youtube, Radio, Globe, LayoutGrid, Table, FileText, Presentation,
  Cloud as CloudIcon, Calculator as CalculatorIcon, Newspaper, BookOpen, Compass,
  UtensilsCrossed, Car, Store, BedDouble, Plane, TrendingUp, Truck,
  ListChecks, StickyNote, CalendarDays, Clapperboard, Cpu,
} from "lucide-react";
import HubHeader from "@/components/home/HubHeader";
import SectionPanel from "@/components/home/SectionPanel";
import DatingPanel from "@/components/home/DatingPanel";
import GamingPanel from "@/components/home/GamingPanel";
import Feed from "@/pages/Feed";
import Gaming from "@/pages/Gaming";
import Assistant from "@/pages/Assistant";

const SECTIONS = {
  entertainment: {
    title: "Entertainment", icon: Clapperboard, tint: "from-fuchsia-500 to-purple-600",
    apps: [
      { to: "/music", label: "Music", icon: Music2 },
      { to: "/movies", label: "Movies", icon: Film },
      { to: "/video", label: "Video", icon: Youtube },
      { to: "/radio", label: "Radio", icon: Radio },
    ],
  },
  tech: {
    title: "Tech", icon: Cpu, tint: "from-cyan-500 to-blue-600",
    apps: [
      { to: "/browser", label: "Browser", icon: Globe },
      { to: "/web", label: "Web", icon: Compass },
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
    title: "News", icon: Newspaper, tint: "from-amber-500 to-orange-600",
    apps: [
      { to: "/news", label: "News", icon: Newspaper },
      { to: "/articles", label: "Articles", icon: BookOpen },
    ],
  },
  food: {
    title: "Food & Services", icon: UtensilsCrossed, tint: "from-emerald-500 to-teal-600",
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

const STACKED = [SECTIONS.entertainment, SECTIONS.tech, SECTIONS.news, SECTIONS.food];

export default function Home() {
  const [params] = useSearchParams();
  const cat = params.get("cat") || "social";

  if (cat === "gaming") return <Gaming />;
  if (cat === "aichat") return <Assistant />;

  const section = SECTIONS[cat];

  return (
    <div className="min-h-[100dvh]">
      <HubHeader />

      {cat === "social" ? (
        <>
          <Feed />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-1">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1.5 rounded-full brand-grad" />
              <h2 className="text-[14px] font-bold uppercase tracking-wide text-white/55">Explore more</h2>
            </div>
          </div>
          {STACKED.map((s) => (
            <SectionPanel key={s.title} {...s} />
          ))}
          <DatingPanel />
          <GamingPanel />
        </>
      ) : section ? (
        <SectionPanel {...section} />
      ) : null}
    </div>
  );
}