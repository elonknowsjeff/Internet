import { MessageSquare, BookOpen } from "lucide-react";
import { Home, Car, Music2, Film, Cloud as CloudIcon, User, Sparkles, Newspaper, Heart, Calculator as CalculatorIcon, CalendarDays, TrendingUp, ShoppingBag, Store, Youtube, Radio, Table, Tv, FileText, Presentation, Mail, Monitor, BedDouble, BarChart3, StickyNote, Plane, UtensilsCrossed, Truck, ListChecks, Globe, Compass } from "lucide-react";

export const NAV_SECTIONS = [
  {
    name: "Social", items: [
      { key: "feed", to: "/", label: "Feed", icon: Home },
      { key: "messages", to: "/messages", label: "Messages", icon: MessageSquare },
      { key: "stories", to: "/stories", label: "Stories", icon: Sparkles },
      { key: "articles", to: "/articles", label: "Articles", icon: BookOpen },
      { key: "studio", to: "/studio", label: "Studio", icon: BarChart3 },
      { key: "news", to: "/news", label: "News", icon: Newspaper },
      { key: "dating", to: "/dating", label: "Dating", icon: Heart },
    ],
  },
  {
    name: "Info", items: [
      { key: "desktop", to: "/desktop", label: "Desktop", icon: Monitor },
      { key: "browser", to: "/browser", label: "Browser", icon: Globe },
      { key: "web", to: "/web", label: "Web", icon: Compass },
      { key: "assistant", to: "/assistant", label: "Assistant", icon: Sparkles },
    ],
  },
  {
    name: "Marketplace", items: [
      { key: "rides", to: "/rides", label: "Rides", icon: Car },
      { key: "market", to: "/market", label: "Market", icon: Store },
      { key: "hotels", to: "/hotels", label: "Hotels", icon: BedDouble },
      { key: "flights", to: "/flights", label: "Flights", icon: Plane },
      { key: "eats", to: "/eats", label: "Eats", icon: UtensilsCrossed },
      { key: "logistics", to: "/logistics", label: "Logistics", icon: Truck },
    ],
  },
  {
    name: "Entertainment", items: [
      { key: "music", to: "/music", label: "Music", icon: Music2 },
      { key: "movies", to: "/movies", label: "Movies", icon: Film },
      { key: "video", to: "/video", label: "Video", icon: Youtube },
      { key: "radio", to: "/radio", label: "Radio", icon: Radio },
    ],
  },
  {
    name: "Productivity", items: [
      { key: "productivity", to: "/productivity", label: "Productivity", icon: ListChecks },
      { key: "tasks", to: "/productivity", label: "Tasks", icon: ListChecks },
      { key: "cloud", to: "/cloud", label: "Cloud", icon: CloudIcon },
      { key: "docs", to: "/docs", label: "Docs", icon: FileText },
      { key: "slides", to: "/slides", label: "Slides", icon: Presentation },
      { key: "sheets", to: "/sheets", label: "Sheets", icon: Table },
      { key: "notes", to: "/notes", label: "Notes", icon: StickyNote },
      { key: "calculator", to: "/calculator", label: "Calculator", icon: CalculatorIcon },
      { key: "calendar", to: "/calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    name: "Markets", items: [
      { key: "finance", to: "/finance", label: "Stock Market", icon: TrendingUp },
    ],
  },
];

export const ALL_APPS = NAV_SECTIONS.flatMap((s) => s.items);

export const PINNED = ["feed", "messages", "music", "docs", "settings"];