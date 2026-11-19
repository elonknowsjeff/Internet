import React from "react";
import { Link } from "react-router-dom";
import { Timer } from "lucide-react";
import { STORES } from "@/components/eats/storeData";
import WidgetShell from "@/components/feed/widgets/WidgetShell";

export default function FoodCard({ onHide }) {
  const stores = STORES.filter((s) => s.category === "restaurant").slice(0, 4);

  return (
    <WidgetShell title="Food near you" action={<Link to="/eats" className="text-[10.5px] font-semibold text-white/45 hover:text-white">Order</Link>} onHide={onHide}>
      <div className="space-y-1 px-2 pb-2">
        {stores.map((s) => (
          <Link key={s.id} to="/eats" className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-white/[0.05]">
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/10">
              {s.image && <img src={s.image} alt="" className="h-full w-full object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-semibold">{s.name}</span>
              <span className="block truncate text-[10.5px] text-white/40">{s.cuisine}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[10.5px] text-white/45"><Timer className="h-3 w-3" /> {s.eta}</span>
          </Link>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto border-t border-white/[0.07] px-3 py-2 scrollbar-none">
        <Link to="/eats" className="shrink-0 rounded-full border border-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-white/55 hover:bg-white/10 hover:text-white">Restaurants</Link>
        <Link to="/eats" className="shrink-0 rounded-full border border-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-white/55 hover:bg-white/10 hover:text-white">Grocery</Link>
        <Link to="/eats" className="shrink-0 rounded-full border border-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-white/55 hover:bg-white/10 hover:text-white">Dessert</Link>
      </div>
    </WidgetShell>
  );
}