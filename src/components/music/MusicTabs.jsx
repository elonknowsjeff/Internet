import React from "react";
import { Compass, TrendingUp, ListMusic, Link2, ShoppingBag } from "lucide-react";

const items = [
  { id: "discover", label: "Your music", icon: Compass },
  { id: "charts", label: "Charts", icon: TrendingUp },
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "spotify", label: "Spotify", icon: Link2 },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
];

export default function MusicTabs({ tab, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-black/40 border border-white/10 w-fit overflow-x-auto scrollbar-none">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
            tab === id ? "bg-white text-black" : "text-white/60 hover:text-white"
          }`}
        >
          <Icon className="w-3.5 h-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}