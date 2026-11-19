import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Loader2, TrendingUp, Package, ChevronDown } from "lucide-react";
import ListingCard from "@/components/music/ListingCard";
import SellListingModal from "@/components/music/SellListingModal";
import BuyListingModal from "@/components/music/BuyListingModal";

const GENRES = ["All", "Hip-Hop", "Electronic", "Lo-Fi", "Jazz", "Pop", "Rock", "Trap", "R&B"];

const SORTS = [
  { id: "newest", label: "Newest" },
  { id: "price_low", label: "Price: low to high" },
  { id: "price_high", label: "Price: high to low" },
  { id: "popular", label: "Best selling" },
];

export default function MusicMarketplace({ user, audio, current, playing }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("newest");
  const [sellOpen, setSellOpen] = useState(false);
  const [buying, setBuying] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const load = async () => {
    try {
      const data = await base44.entities.MusicListing.list("-created_date", 100);
      setListings(data);
    } catch (e) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try { setOrders(await base44.entities.MusicOrder.list("-created_date", 50)); } catch (e) {}
  };

  useEffect(() => { load(); loadOrders(); }, []);

  const preview = async (l) => {
    const key = `mk:${l.id}`;
    if (current?.key === key) { audio.toggle(); return; }
    try {
      let src = null;
      if (l.preview_file_uri) {
        const r = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: l.preview_file_uri });
        src = r.signed_url;
      }
      audio.play({
        key,
        src,
        simulated: !src,
        title: l.title,
        subtitle: `${l.seller_name} · @${l.seller_handle}`,
        art: l.artwork,
        duration: 90,
      });
      base44.entities.MusicListing.update(l.id, { plays: (l.plays || 0) + 1 });
      setListings((arr) => arr.map((x) => (x.id === l.id ? { ...x, plays: (x.plays || 0) + 1 } : x)));
    } catch (e) {}
  };

  const afterOrder = (l) => {
    setListings((arr) => arr.map((x) => (x.id === l.id ? { ...x, sold: (x.sold || 0) + 1 } : x)));
    loadOrders();
  };

  const q = query.trim().toLowerCase();
  let filtered = listings.filter((l) => {
    if (genre !== "All" && l.genre !== genre) return false;
    if (!q) return true;
    return `${l.title} ${l.seller_name} ${l.seller_handle} ${l.genre} ${l.tags || ""}`.toLowerCase().includes(q);
  });
  filtered = [...filtered].sort((a, b) => {
    if (sort === "price_low") return (a.price || 0) - (b.price || 0);
    if (sort === "price_high") return (b.price || 0) - (a.price || 0);
    if (sort === "popular") return (b.sold || 0) - (a.sold || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const totalSold = listings.reduce((s, l) => s + (l.sold || 0), 0);
  const myListings = user ? listings.filter((l) => l.created_by_id === user.id) : [];

  return (
    <div className="pb-24 min-w-0 overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl border-b border-neutral-800 -mx-3 sm:-mx-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-fuchsia-500 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold font-display leading-none">SoundCloud Market</h1>
            <p className="text-[11px] text-neutral-400 mt-0.5">Buy and sell beats, loops and full tracks · {listings.length} listings · {totalSold} sold</p>
          </div>
          <button onClick={() => setSellOpen(true)} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-orange-500 text-black text-xs font-bold hover:bg-orange-400">
            <Plus className="w-4 h-4" /> Sell
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-2 focus-within:border-orange-500">
            <Search className="w-4 h-4 text-neutral-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search beats, sellers, tags…" className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-full px-3 py-2 text-xs outline-none text-neutral-300">
            {SORTS.map((s) => <option key={s.id} value={s.id} className="bg-neutral-900">{s.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pt-3 pb-0.5 -mx-1 px-1">
          {GENRES.map((g) => (
            <button key={g} onClick={() => setGenre(g)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${genre === g ? "bg-orange-500 text-black border-orange-500" : "bg-white/5 border-white/10 text-neutral-300 hover:border-white/30"}`}>{g}</button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-neutral-500 text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading listings…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 text-sm">
          No listings match. <button onClick={() => { setQuery(""); setGenre("All"); }} className="text-orange-400 underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {filtered.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              isCurrent={current?.key === `mk:${l.id}`}
              isPlaying={playing}
              onPreview={preview}
              onBuy={setBuying}
            />
          ))}
        </div>
      )}

      <section className="mt-6 grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-orange-400" /> Your shop</h3>
          <p className="text-2xl font-black font-display mt-2">{myListings.length}</p>
          <p className="text-xs text-neutral-500">listing{myListings.length === 1 ? "" : "s"} live · {myListings.reduce((s, l) => s + (l.sold || 0), 0)} sold</p>
          <button onClick={() => setSellOpen(true)} className="mt-3 w-full py-2 rounded-full bg-orange-500 text-black text-xs font-bold">List a new sound</button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <button onClick={() => setOrdersOpen((v) => !v)} className="w-full flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-emerald-400" /> My orders ({orders.length})</h3>
            <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${ordersOpen ? "rotate-180" : ""}`} />
          </button>
          {orders.length === 0 ? (
            <p className="text-xs text-neutral-500 mt-2">No purchases yet. Buy a license to see it here.</p>
          ) : ordersOpen ? (
            <div className="mt-2 space-y-2 max-h-44 overflow-y-auto">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center gap-2 text-xs">
                  <img src={o.artwork} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                  <span className="flex-1 truncate text-neutral-200">{o.listing_title}</span>
                  <span className="text-neutral-500">{o.status}</span>
                  <span className="font-semibold">${Number(o.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 mt-2">{orders.length} order{orders.length === 1 ? "" : "s"} · ${orders.reduce((s, o) => s + (o.price || 0), 0).toFixed(2)} spent</p>
          )}
        </div>
      </section>

      {sellOpen && <SellListingModal user={user} onClose={() => setSellOpen(false)} onCreated={(l) => setListings((arr) => [l, ...arr])} />}
      {buying && <BuyListingModal listing={buying} user={user} onClose={() => setBuying(null)} onDone={afterOrder} />}
    </div>
  );
}