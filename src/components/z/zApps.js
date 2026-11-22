// Registry of every original Internet X app, surfaced inside the Z desktop.
import Market from "@/pages/Market";
import Music from "@/pages/Music";
import Video from "@/pages/Video";
import Movies from "@/pages/Movies";
import Radio from "@/pages/Radio";
import News from "@/pages/News";
import Assistant from "@/pages/Assistant";
import Finance from "@/pages/Finance";
import Calculator from "@/pages/Calculator";
import Dating from "@/pages/Dating";
import Calendar from "@/pages/Calendar";
import Hotels from "@/pages/Hotels";
import Flights from "@/pages/Flights";
import Notes from "@/pages/Notes";
import Docs from "@/pages/Docs";
import Sheets from "@/pages/Sheets";
import Slides from "@/pages/Slides";
import Cloud from "@/pages/Cloud";
import Browser from "@/pages/Browser";
import Productivity from "@/pages/Productivity";
import Stories from "@/pages/Stories";
import Discover from "@/pages/Discover";
import CreatorStudio from "@/pages/CreatorStudio";
import LiveTV from "@/pages/LiveTV";
import Messages from "@/pages/Messages";
import ArcadeHub from "@/components/home/ArcadeHub";
import {
  Store, Music2, Youtube, Film, Radio as RadioIcon, Newspaper, Sparkles, TrendingUp,
  Calculator as CalcIcon, Heart, CalendarDays, BedDouble, Plane, StickyNote, FileText,
  Table, Presentation, Cloud as CloudIcon, Globe, ListChecks, Clapperboard, Compass,
  Tv, MessageSquare, Gamepad2,
} from "lucide-react";

export const Z_APPS = [
  { key: "market", label: "Market", icon: Store, Comp: Market },
  { key: "music", label: "Music", icon: Music2, Comp: Music },
  { key: "video", label: "Video", icon: Youtube, Comp: Video },
  { key: "movies", label: "Movies", icon: Film, Comp: Movies },
  { key: "radio", label: "Radio", icon: RadioIcon, Comp: Radio },
  { key: "livetv", label: "Live TV", icon: Tv, Comp: LiveTV },
  { key: "news", label: "News", icon: Newspaper, Comp: News },
  { key: "assistant", label: "AI Chat", icon: Sparkles, Comp: Assistant },
  { key: "games", label: "Arcade", icon: Gamepad2, Comp: ArcadeHub },
  { key: "finance", label: "Finance", icon: TrendingUp, Comp: Finance },
  { key: "calculator", label: "Calculator", icon: CalcIcon, Comp: Calculator },
  { key: "dating", label: "Dating", icon: Heart, Comp: Dating },
  { key: "calendar", label: "Calendar", icon: CalendarDays, Comp: Calendar },
  { key: "hotels", label: "Hotels", icon: BedDouble, Comp: Hotels },
  { key: "flights", label: "Flights", icon: Plane, Comp: Flights },
  { key: "notes", label: "Notes", icon: StickyNote, Comp: Notes },
  { key: "docs", label: "Docs", icon: FileText, Comp: Docs },
  { key: "sheets", label: "Sheets", icon: Table, Comp: Sheets },
  { key: "slides", label: "Slides", icon: Presentation, Comp: Slides },
  { key: "cloud", label: "Cloud", icon: CloudIcon, Comp: Cloud },
  { key: "browser", label: "Browser", icon: Globe, Comp: Browser },
  { key: "productivity", label: "Productivity", icon: ListChecks, Comp: Productivity },
  { key: "stories", label: "Stories", icon: Clapperboard, Comp: Stories },
  { key: "discover", label: "Discover", icon: Compass, Comp: Discover },
  { key: "studio", label: "Creator Studio", icon: Clapperboard, Comp: CreatorStudio },
  { key: "messages", label: "Messages", icon: MessageSquare, Comp: Messages },
];