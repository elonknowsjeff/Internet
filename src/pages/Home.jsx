import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Music2, Film, Youtube, Radio, Globe, Table, FileText, Presentation,
  Cloud as CloudIcon, Calculator as CalculatorIcon, Newspaper, BookOpen, Compass,
  UtensilsCrossed, Car, Store, BedDouble, Plane, TrendingUp, Truck,
  ListChecks, StickyNote, CalendarDays, Clapperboard, Cpu, Tv,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import HubNav from "@/components/home/HubNav";
import WidgetsRail from "@/components/feed/WidgetsRail";
import SectionPanel from "@/components/home/SectionPanel";
import DatingPanel from "@/components/home/DatingPanel";
import GamingPanel from "@/components/home/GamingPanel";
import Feed from "@/pages/Feed";
import Gaming from "@/pages/Gaming";
import Assistant from "@/pages/Assistant";
import TvHero from "@/components/home/TvHero";
import EntertainmentHub from "@/components/home/EntertainmentHub";

const SECTIONS = {
  entertainment: {
    title: "Entertainment", icon: Clapperboard, tint: "from-fuchsia-500 to-purple-600",
    apps: [
      { to: "/music", label: "Music", icon: Music2 },
      { to: "/movies", label: "Movies", icon: Film },
      { to: "/video", label: "Video", icon: Youtube },
      { to: "/radio", label: "Radio", icon: Radio },
      { to: "/cable", label: "Cable TV", icon: Tv },
    ],
  },
  tech: {
    title: "Tech", icon: Cpu, tint: "from-cyan-500 to-blue-600",
    apps: [
      { to: "/browser", label: "Browser", icon: Globe },
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
      { to: "/market", label: "Market", icon: Store },
      { to: "/hotels", label: "Hotels", icon: BedDouble },
      { to: "/flights", label: "Flights", icon: Plane },
      { to: "/finance", label: "Finance", icon: TrendingUp },
      { to: "/logistics", label: "Logistics", icon: Truck },
    ],
  },
};

const STACKED = [SECTIONS.news];

export default function Home() {
  const [params] = useSearchParams();
  const cat = params.get("cat") || "social";
  const [user, setUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const isGaming = cat === "gaming";
  const isAi = cat === "aichat";
  const isSocial = cat === "social";
  const section = SECTIONS[cat];

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto w-full max-w-[1320px] lg:px-4">
        <div className="lg:grid lg:grid-cols-[264px_minmax(0,1fr)] xl:grid-cols-[264px_minmax(0,1fr)_330px] lg:gap-5">
          <HubNav />
          <main className="min-w-0">
            {isGaming ? (
              <Gaming />
            ) : isAi ? (
              <Assistant />
            ) : isSocial ? (
              <>
                <TvHero />
                <Feed />
                <div className="mx-auto max-w-[600px] px-3 sm:px-4 pt-8">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-full brand-grad" />
                    <h2 className="text-[14px] font-bold uppercase tracking-wide text-white/55">Explore more</h2>
                  </div>
                </div>
                {STACKED.map((s) => (
                  <SectionPanel key={s.title} {...s} />
                ))}
                <DatingPanel />
              </>
            ) : cat === "entertainment" ? (
              <EntertainmentHub />
            ) : section ? (
              <SectionPanel {...section} />
            ) : null}
          </main>
          <WidgetsRail user={user} />
        </div>
      </div>
    </div>
  );
}