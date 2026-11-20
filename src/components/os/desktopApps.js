import {
  Home as HomeIcon, Music2, Compass, Film, Youtube, Newspaper, UtensilsCrossed,
  Car, Heart, Gamepad2, Sparkles, Cloud as CloudIcon, Store, TrendingUp,
  MessageSquare, User, Settings as Gear,
} from "lucide-react";
import Feed from "@/pages/Feed";
import Music from "@/pages/Music";
import WebBrowser from "@/components/web/WebBrowser";
import Movies from "@/pages/Movies";
import Video from "@/pages/Video";
import News from "@/pages/News";
import Eats from "@/pages/Eats";
import Rides from "@/pages/Rides";
import Dating from "@/pages/Dating";
import Gaming from "@/pages/Gaming";
import Assistant from "@/pages/Assistant";
import Cloud from "@/pages/Cloud";
import Market from "@/pages/Market";
import Finance from "@/pages/Finance";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";

export const APPS = {
  feed:      { name: "Social",     icon: HomeIcon,         Comp: Feed,      w: 1080, h: 700 },
  music:     { name: "Music",      icon: Music2,           Comp: Music,     w: 1000, h: 680 },
  web:       { name: "Web",        icon: Compass,          Comp: WebBrowser,w: 1000, h: 660 },
  movies:    { name: "Movies",     icon: Film,             Comp: Movies,    w: 980,  h: 640 },
  video:     { name: "Video",      icon: Youtube,          Comp: Video,     w: 1000, h: 660 },
  news:      { name: "News",       icon: Newspaper,        Comp: News,      w: 900,  h: 640 },
  eats:      { name: "Eats",       icon: UtensilsCrossed,  Comp: Eats,      w: 920,  h: 640 },
  rides:     { name: "Rides",      icon: Car,              Comp: Rides,     w: 900,  h: 620 },
  dating:    { name: "Dating",     icon: Heart,            Comp: Dating,    w: 980,  h: 660 },
  gaming:    { name: "Gaming",     icon: Gamepad2,          Comp: Gaming,    w: 1040, h: 680 },
  assistant: { name: "AI Chat",    icon: Sparkles,         Comp: Assistant, w: 880,  h: 640 },
  cloud:     { name: "Cloud",      icon: CloudIcon,        Comp: Cloud,     w: 960,  h: 620 },
  market:    { name: "Market",     icon: Store,             Comp: Market,    w: 940,  h: 640 },
  finance:   { name: "Finance",    icon: TrendingUp,        Comp: Finance,   w: 940,  h: 640 },
  messages:  { name: "Messages",  icon: MessageSquare,     Comp: Messages,  w: 900,  h: 620 },
  profile:   { name: "Profile",    icon: User,              Comp: Profile,   w: 820,  h: 600 },
  settings:  { name: "Settings",   icon: Gear,              Comp: Settings,  w: 760,  h: 600 },
};

export const DOCK = ["feed", "music", "web", "movies", "video", "news", "eats", "rides", "dating", "gaming", "assistant", "cloud"];
export const SYSTEM = ["profile", "settings"];