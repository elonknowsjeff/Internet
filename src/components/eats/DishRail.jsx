import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChefHat, Loader2, Search, Star, ExternalLink, X } from "lucide-react";

const CATEGORIES = ["Beef", "Chicken", "Seafood", "Dessert", "Pasta", "Vegetarian", "Breakfast"];

export default function DishRail() {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const load = async (q = "", cat = "") => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("foodApi", { query: q, category: cat });
      setDishes(res.data?.dishes || []);
    } catch {
      setDishes([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const search = (e) => {
    e.preventDefault();
    load(query.trim(), category);
  };

  const pickCategory = (c) => {
    const next = category === c ? "" : c;
    setCategory(next);
    load(query.trim(), next);
  };

  return (
    <section className="panel p-3.5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-[-0.01em]">
          <ChefHat className="h-4 w-4" style={{ color: "var(--brand)" }} /> Live kitchen
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">API</span>
        </h2>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-white/40" />}
      </div>

      <form onSubmit={search} className="mt-2.5 flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.055] px-3 py-1.5 focus-within:border-white/30">
        <Search className="h-3.5 w-3.5 shrink-0 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes worldwide (tacos, ramen…)"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder-white/35"
        />
      </form>

      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => pickCategory(c)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${category === c ? "brand-grad text-black" : "border border-white/[0.1] bg-white/[0.05] text-white/60 hover:text-white"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-2 flex gap-2.5 overflow-hidden pb-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[142px] shrink-0 animate-pulse overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03]">
              <div className="h-[86px] bg-white/[0.05]" />
              <div className="space-y-1.5 px-2 py-2">
                <div className="h-2.5 w-4/5 rounded bg-white/[0.07]" />
                <div className="h-2 w-1/2 rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-white/40">No dishes for that search.</p>
      ) : (
        <div className="mt-2 flex gap-2.5 overflow-x-auto pb-1 thin-scrollbar">
          {dishes.slice(0, 14).map((d) => (
            <button key={d.id} onClick={() => setOpen(d)} className="group w-[142px] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] text-left transition-colors hover:border-white/25">
              <span className="relative block h-[86px] overflow-hidden bg-white/[0.06]">
                <img src={d.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-bold">${d.price}</span>
              </span>
              <span className="block px-2 py-1.5">
                <span className="block truncate text-[11.5px] font-semibold leading-snug">{d.name}</span>
                <span className="block truncate text-[10px] text-white/40">{d.area} · {d.category}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center" onClick={() => setOpen(null)}>
          <div className="max-h-[86vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#120d26] p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[17px] font-semibold leading-tight">{open.name}</h3>
              <button onClick={() => setOpen(null)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <img src={open.image} alt="" className="mt-2.5 h-40 w-full rounded-xl object-cover" />
            <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-300 text-amber-300" /> {open.category}</span>
              <span>· {open.area}</span>
              <span>· ${open.price}</span>
            </p>
            <p className="mt-2 text-[11.5px] font-semibold text-white/70">Ingredients</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {open.ingredients.slice(0, 12).map((i, n) => (
                <span key={n} className="rounded-full border border-white/[0.08] bg-white/[0.05] px-2 py-0.5 text-[10.5px] text-white/60">{i}</span>
              ))}
            </div>
            <p className="mt-3 line-clamp-6 whitespace-pre-line text-[11.5px] leading-relaxed text-white/55">{open.instructions}</p>
            <div className="mt-3 flex gap-2">
              <a href={`https://www.ubereats.com/search?q=${encodeURIComponent(open.name)}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1 rounded-full brand-grad px-3 py-2 text-[11.5px] font-bold text-black">Order it <ExternalLink className="h-3 w-3" /></a>
              <a href={`https://www.doordash.com/search/store/${encodeURIComponent(open.name)}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-1 rounded-full border border-white/20 bg-white/[0.08] px-3 py-2 text-[11.5px] font-semibold">DoorDash</a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}