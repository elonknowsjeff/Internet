import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Clock, MapPin, LocateFixed, ExternalLink, Search, Loader2, ChevronDown, ShoppingCart, X } from "lucide-react";
import { STORES } from "@/components/eats/storeData";
import StoreOrderSheet from "@/components/eats/StoreOrderSheet";
import PlaceAutocomplete from "@/components/places/PlaceAutocomplete";
import { StoreRow, FeaturedStore } from "@/components/eats/UberEatsCards";
import LogisticsHub from "@/components/eats/LogisticsHub";
import DishRail from "@/components/eats/DishRail";

const FOOD_IMG = {
  pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
  sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500",
  burger: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500",
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
  seafood: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=500",
};
const foodImg = (cuisine) => {
  const c = (cuisine || "").toLowerCase();
  for (const key of Object.keys(FOOD_IMG)) if (c.includes(key)) return FOOD_IMG[key];
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500";
};

const TABS = [
  { k: "restaurant", l: "Restaurants", e: "🍔" },
  { k: "grocery", l: "Grocery", e: "🛒" },
  { k: "animals", l: "Pets", e: "🐾" },
  { k: "live", l: "Search live", e: "🔎" },
  { k: "logistics", l: "Logistics", e: "🚚" },
];

export default function Eats() {
  const [tab, setTab] = useState("restaurant");
  const [storeQuery, setStoreQuery] = useState("");
  const [openStore, setOpenStore] = useState(null);
  const [orders, setOrders] = useState([]);

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [locating, setLocating] = useState(false);

  const loadOrders = async () => {
    try { setOrders(await base44.entities.Order.list("-created_date", 5)); } catch (e) {}
  };
  useEffect(() => { loadOrders(); }, []);

  const useLocation = () => {
    if (!navigator.geolocation) { setErr("Geolocation isn't supported."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Reverse geocode latitude ${latitude}, longitude ${longitude} to a short place name (neighborhood or city). Return only the place name. Use live web context.`,
          add_context_from_internet: true, model: "gemini_3_flash",
          response_json_schema: { type: "object", properties: { place: { type: "string" } } },
        });
        setLocation(res?.place || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
      } catch { setLocation(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`); }
      setLocating(false);
    }, () => { setLocating(false); setErr("Location permission denied."); }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setErr("");
    try {
      const loc = location.trim() || "near me";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Find real restaurants currently delivering ${query.trim()} ${loc === "near me" ? "near the user" : `in ${loc}`}. Return up to 10. For each: name, cuisine, rating (number out of 5), price_range ($ to $$$$), delivery_time (e.g. "25-35 min"), description. These must be real restaurants you'd find on DoorDash and Uber Eats. Use live web context. Current date October 2026.`,
        add_context_from_internet: true, model: "gemini_3_flash",
        response_json_schema: { type: "object", properties: { restaurants: { type: "array", items: { type: "object", properties: { name: { type: "string" }, cuisine: { type: "string" }, rating: { type: "number" }, price_range: { type: "string" }, delivery_time: { type: "string" }, description: { type: "string" } } } } } },
      });
      setResults(res?.restaurants || []);
    } catch (e2) { setErr("Couldn't fetch restaurants right now."); }
    setLoading(false);
  };

  const stores = STORES.filter((s) => s.category === tab).filter((s) => {
    const q = storeQuery.trim().toLowerCase();
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.cuisine.toLowerCase().includes(q) || s.menu.some((m) => m.name.toLowerCase().includes(q));
  });
  const featured = stores.slice(0, 2);
  const list = stores.slice(2);
  const groceries = STORES.filter((s) => s.category === "grocery").slice(0, 6);
  const walmart = STORES.find((s) => s.id === "walmart");

  return (
    <div className="max-w-5xl mx-auto pb-28">
      <header className="sticky top-2 z-30 rounded-2xl border border-white/[0.1] bg-[#0b0818]/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl">
        <div className="px-4 pt-3 pb-2.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <button onClick={useLocation} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 min-w-0">
              <MapPin className={`w-4 h-4 shrink-0 text-emerald-300 ${locating ? "animate-pulse" : ""}`} />
              <span className="text-sm font-semibold truncate max-w-[46vw]">{location.trim() || "Delivery address"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/50 shrink-0" />
            </button>
            <span className="ml-auto text-[11px] font-semibold text-white/45">Deliver now</span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 shadow-lg shadow-black/20">
            <Search className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              value={storeQuery}
              onChange={(e) => setStoreQuery(e.target.value)}
              placeholder={tab === "grocery" ? "Search stores or items (milk, eggs…)" : tab === "animals" ? "Search pets & animals…" : "Search restaurants or dishes…"}
              className="flex-1 bg-transparent outline-none text-sm text-black placeholder:text-neutral-500 min-w-0"
            />
            {storeQuery && <button onClick={() => setStoreQuery("")}><X className="w-4 h-4 text-neutral-400" /></button>}
          </div>
          <div className="flex gap-1.5 overflow-x-auto thin-scrollbar pb-0.5">
            {TABS.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${tab === t.k ? "bg-white text-black border-white" : "bg-white/5 border-white/15 text-white/75 hover:bg-white/10"}`}>
                <span>{t.e}</span> {t.l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {tab === "logistics" && (
        <LogisticsHub onBrowse={() => setTab("restaurant")} onChanged={loadOrders} />
      )}

      {tab !== "live" && tab !== "logistics" && (
        <div className="px-4 pt-4 space-y-6">
          <div className="flex gap-3 overflow-x-auto thin-scrollbar pb-1 -mx-4 px-4">
            {[
              { t: "$0 delivery fee", s: "On your first 3 orders", c: "from-emerald-500/80 to-teal-600/70" },
              { t: "XSI+ saves you more", s: "Free delivery on every order", c: "from-fuchsia-500/80 to-violet-600/70" },
            ].map((b) => (
              <div key={b.t} className={`shrink-0 w-[78%] sm:w-72 rounded-2xl bg-gradient-to-br ${b.c} border border-white/15 p-4`}>
                <p className="font-bold">{b.t}</p>
                <p className="text-xs text-white/80 mt-0.5">{b.s}</p>
              </div>
            ))}
          </div>

          <DishRail />

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Groceries & delivery</h2>
              <button onClick={() => setTab("grocery")} className="text-xs font-semibold text-emerald-300 hover:underline">See all</button>
            </div>
            {walmart && (
              <button
                onClick={() => setOpenStore(walmart)}
                className="w-full flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-3 mb-2 text-left hover:bg-emerald-500/15"
              >
                <span className="w-12 h-12 rounded-xl bg-white grid place-items-center shrink-0 overflow-hidden">
                  <img src={walmart.logo} alt="" className="w-8 h-8 object-contain" onError={(e) => { e.currentTarget.src = walmart.image; }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-sm">Walmart Delivery</span>
                  <span className="block text-[11px] text-white/60 truncate">Groceries, household & more · {walmart.eta}</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-300 shrink-0">Open</span>
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto thin-scrollbar pb-1">
              {groceries.map((s) => (
                <button key={s.id} onClick={() => setOpenStore(s)} className="shrink-0 w-28 rounded-xl overflow-hidden border border-white/10 bg-white/5 text-left hover:border-white/25">
                  <img src={s.image} alt="" className="w-full h-16 object-cover" />
                  <span className="block px-2 py-1.5 text-[11px] font-semibold truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </section>

          {featured.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-2">Featured near you</h2>
              <div className="grid grid-cols-2 gap-3">
                {featured.map((s) => <FeaturedStore key={s.id} store={s} onOpen={setOpenStore} />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold mb-1">{tab === "grocery" ? "Grocery stores" : tab === "animals" ? "Pets & animals" : "All stores"}</h2>
            {list.length === 0 && featured.length === 0 ? (
              <p className="text-sm text-white/50 py-8 text-center">No stores match “{storeQuery}”.</p>
            ) : (
              <div>{list.map((s) => <StoreRow key={s.id} store={s} onOpen={setOpenStore} />)}</div>
            )}
          </section>

          {orders.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-2 flex items-center gap-1.5"><ShoppingCart className="w-4 h-4" /> Your orders</h2>
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{o.restaurant_name}</p>
                      <p className="text-[11px] text-white/55">{(o.items || []).length} items · {o.status}</p>
                    </div>
                    <span className="font-semibold">${Number(o.total || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "live" && (
        <>
          <form onSubmit={search} className="px-4 py-4 space-y-2.5">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5">
              <Search className="w-4 h-4 text-neutral-500 shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="What are you craving? (pizza, sushi, thai…)" className="flex-1 min-w-0 bg-transparent outline-none text-sm text-black placeholder:text-neutral-500" />
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2.5">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <PlaceAutocomplete value={location} onChange={setLocation} placeholder="Address or city" />
              <button type="button" onClick={useLocation} disabled={locating} title="Use my location" className="text-white/60 hover:text-emerald-300 disabled:opacity-50">
                <LocateFixed className={`w-5 h-5 ${locating ? "animate-pulse" : ""}`} />
              </button>
            </div>
            <button type="submit" disabled={loading || !query.trim()} className="w-full brand-grad text-black font-semibold py-3 rounded-full disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</> : "Find restaurants"}
            </button>
          </form>

          {err && <p className="px-4 text-sm text-rose-300">{err}</p>}

          <div className="px-4 space-y-2">
            {results.map((r, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0"><img src={foodImg(r.cuisine)} alt={r.name} className="w-full h-full object-cover" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{r.name}</p>
                    <p className="text-[11px] text-white/55 truncate">{r.cuisine} · {r.price_range}</p>
                    <p className="text-[11px] text-white/70 mt-0.5 flex items-center gap-1">
                      {r.rating != null && <><Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {Number(r.rating).toFixed(1)} · </>}
                      <Clock className="w-3 h-3" /> {r.delivery_time}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 px-3 pb-3">
                  <a href={`https://www.ubereats.com/search?q=${encodeURIComponent(r.name)}`} target="_blank" rel="noreferrer" className="flex-1 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/20 flex items-center justify-center gap-1 hover:border-emerald-300">Order on Uber Eats <ExternalLink className="w-3 h-3" /></a>
                  <a href={`https://www.doordash.com/search/store/${encodeURIComponent(r.name)}`} target="_blank" rel="noreferrer" className="flex-1 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/20 flex items-center justify-center gap-1 hover:border-emerald-300">DoorDash <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
            ))}
            {!loading && results.length === 0 && !err && (
              <div className="p-10 text-center text-white/55 border border-dashed border-white/20 rounded-2xl">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Search a cuisine to discover real restaurants delivering to you.
              </div>
            )}
          </div>
        </>
      )}

      {openStore && <StoreOrderSheet store={openStore} onClose={() => setOpenStore(null)} onPlaced={loadOrders} />}
    </div>
  );
}