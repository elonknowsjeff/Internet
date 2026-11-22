import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import ArcadeHub from "@/components/home/ArcadeHub";
import WiiHome from "@/components/home/WiiHome";
import Assistant from "@/pages/Assistant";
import EntertainmentHub from "@/components/home/EntertainmentHub";
import NotificationCenter from "@/components/notifications/NotificationCenter";

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
  const [view, setView] = useState("feed");
  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const isGaming = cat === "gaming";
  const isAi = cat === "aichat";
  const isSocial = cat === "social";
  const isNotifications = cat === "notifications";
  const section = SECTIONS[cat];
  const feedMode = isSocial && view === "feed";

  return (
    <div className="min-h-[100dvh] bg-black">
      <FeedTopBar />
      <main className={`mx-auto w-full px-3 sm:px-4 ${feedMode ? "max-w-[640px]" : "max-w-[1240px]"} xl:px-6`}>
        {isGaming ? (
          <ArcadeHub />
        ) : isAi ? (
          <Assistant />
        ) : isNotifications ? (
          <div className="mx-auto max-w-[640px] pb-28 xl:pb-6">
            <NotificationCenter user={user} />
          </div>
        ) : isSocial ? (
          feedMode ? (
            <>
              <div className="mt-2 flex items-center gap-2 xl:hidden">
                <button
                  onClick={() => setView("grid")}
                  className="flex items-center gap-1.5 rounded-full border border-[#2F3336] px-3 py-1.5 text-[12px] font-semibold text-white/60 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> All apps
                </button>
              </div>
              <UnifiedFeed />
            </>
          ) : (
            <WiiHome onFeed={() => setView("feed")} />
          )
        ) : cat === "entertainment" ? (
          <EntertainmentHub />
        ) : section ? (
          <SectionPanel {...section} />
        ) : null}
      </main>
    </div>
  );
}