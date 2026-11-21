import React from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon, Compass, Clapperboard, MessageSquare, Film, Music2, Youtube,
  Tv, Radio, Gamepad2, Sparkles, Monitor, ListChecks, StickyNote, CalendarDays,
  Calculator, Table, FileText, Presentation, Cloud as CloudIcon, Globe, Newspaper,
  BookOpen, Store, TrendingUp, BedDouble, Plane, Heart, User, Settings, Upload,
  LayoutGrid, Hash, Users,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

// Every feature as a visible tile — nothing hidden in drawers.
const TILES = [
  { kind: "feed", label: "Social Feed", Icon: Hash, tint: "from-sky-500 to-blue-600" },
  { to: "/discover", label: "Discover", Icon: Compass, tint: "from-violet-500 to-purple-600" },
  { to: "/stories", label: "Stories", Icon: Clapperboard, tint: "from-fuchsia-500 to-pink-600" },
  { to: "/messages", label: "Messages", Icon: MessageSquare, tint: "from-emerald-500 to-teal-600" },
  { to: "/?cat=entertainment", label: "Entertainment", Icon: Film, tint: "from-rose-500 to-red-600" },
  { to: "/music", label: "Music", Icon: Music2, tint: "from-orange-500 to-amber-600" },
  { to: "/video", label: "Video", Icon: Youtube, tint: "from-red-500 to-rose-600" },
  { to: "/movies", label: "Movies", Icon: Film, tint: "from-indigo-500 to-violet-600" },
  { to: "/cable", label: "Live TV", Icon: Tv, tint: "from-cyan-500 to-sky-600" },
  { to: "/radio", label: "Radio", Icon: Radio, tint: "from-lime-500 to-green-600" },
  { to: "/?cat=gaming", label: "Arcade", Icon: Gamepad2, tint: "from-purple-500 to-fuchsia-600" },
  { to: "/assistant", label: "AI Chat", Icon: Sparkles, tint: "from-blue-500 to-cyan-600" },
  { to: "/desktop", label: "Desktop OS", Icon: Monitor, tint: "from-slate-500 to-zinc-700" },
  { to: "/productivity", label: "Productivity", Icon: ListChecks, tint: "from-teal-500 to-emerald-600" },
  { to: "/notes", label: "Notes", Icon: StickyNote, tint: "from-amber-500 to-yellow-600" },
  { to: "/calendar", label: "Calendar", Icon: CalendarDays, tint: "from-red-500 to-orange-600" },
  { to: "/calculator", label: "Calculator", Icon: Calculator, tint: "from-zinc-500 to-slate-700" },
  { to: "/sheets", label: "Sheets", Icon: Table, tint: "from-green-500 to-emerald-600" },
  { to: "/docs", label: "Docs", Icon: FileText, tint: "from-blue-500 to-indigo-600" },
  { to: "/slides", label: "Slides", Icon: Presentation, tint: "from-orange-500 to-red-600" },
  { to: "/cloud", label: "Cloud", Icon: CloudIcon, tint: "from-sky-500 to-cyan-600" },
  { to: "/browser", label: "Browser", Icon: Globe, tint: "from-cyan-500 to-blue-600" },
  { to: "/news", label: "News", Icon: Newspaper, tint: "from-amber-500 to-orange-600" },
  { to: "/articles", label: "Articles", Icon: BookOpen, tint: "from-stone-500 to-amber-700" },
  { to: "/market", label: "Market", Icon: Store, tint: "from-emerald-500 to-green-600" },
  { to: "/finance", label: "Finance", Icon: TrendingUp, tint: "from-green-500 to-teal-600" },
  { to: "/hotels", label: "Hotels", Icon: BedDouble, tint: "from-rose-500 to-pink-600" },
  { to: "/flights", label: "Flights", Icon: Plane, tint: "from-sky-500 to-indigo-600" },
  { to: "/dating", label: "Dating", Icon: Heart, tint: "from-pink-500 to-rose-600" },
  { to: "/profile", label: "Profile", Icon: User, tint: "from-violet-500 to-purple-600" },
  { to: "/upload", label: "Upload", Icon: Upload, tint: "from-fuchsia-500 to-purple-600" },
  { to: "/apps", label: "All apps", Icon: LayoutGrid, tint: "from-zinc-500 to-slate-700" },
  { to: "/settings", label: "Settings", Icon: Settings, tint: "from-slate-500 to-zinc-700" },
];

function Tile({ tile, onFeed }) {
  const Icon = tile.Icon;
  const inner = (
    <span className="group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)]">
      <span className={`absolute inset-0 opacity-25 transition-opacity group-hover:opacity-45 bg-gradient-to-br ${tile.tint}`} />
      <span className={`relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tile.tint} text-white shadow-lg`}>
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <span className="relative text-[11.5px] font-semibold leading-tight text-white/85 line-clamp-2">{tile.label}</span>
    </span>
  );
  if (tile.kind === "feed") {
    return (
      <button onClick={onFeed} className="block w-full text-left sm:col-span-2 lg:col-span-2">
        {React.cloneElement(inner, { className: "group relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] h-full min-h-[120px]" })}
      </button>
    );
  }
  return <Link to={tile.to} className="block">{inner}</Link>;
}

export default function WiiHome({ onFeed }) {
  return (
    <div className="pb-28 pt-3">
      {/* Hero */}
      <header className="mb-5 flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-xl">
        <BrandLogo size={56} />
        <div className="leading-tight">
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">Internet X</h1>
          <p className="text-[12.5px] text-white/50">Every feature, one home. Tap a tile to open it.</p>
        </div>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/60 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All systems online
        </span>
      </header>

      {/* Tile grid — Wii U style, everything visible */}
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {TILES.map((t) => (
          <Tile key={t.label} tile={t} onFeed={onFeed} />
        ))}
      </div>
    </div>
  );
}