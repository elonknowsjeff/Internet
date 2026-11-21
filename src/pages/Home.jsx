import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Globe, Table, FileText, Presentation,
  Cloud as CloudIcon, Calculator as CalculatorIcon, Newspaper, BookOpen,
  UtensilsCrossed, Store, BedDouble, Plane, TrendingUp,
  ListChecks, StickyNote, CalendarDays, Cpu,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import FeedTopBar from "@/components/home/FeedTopBar";
import SectionPanel from "@/components/home/SectionPanel";
import UnifiedFeed from "@/components/home/UnifiedFeed";
import Gaming from "@/pages/Gaming";
import Assistant from "@/pages/Assistant";
import EntertainmentHub from "@/components/home/EntertainmentHub";

const SECTIONS = {
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
    ],
  },
};

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
      <FeedTopBar />

      <main className={`mx-auto w-full px-3 sm:px-4 ${isSocial ? "max-w-[640px]" : "max-w-[1100px]"}`}>
        {isGaming ? (
          <Gaming />
        ) : isAi ? (
          <Assistant />
        ) : isSocial ? (
          <UnifiedFeed />
        ) : cat === "entertainment" ? (
          <EntertainmentHub />
        ) : section ? (
          <SectionPanel {...section} />
        ) : null}
      </main>
    </div>
  );
}