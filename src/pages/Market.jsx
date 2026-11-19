import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Plus, Loader2, MessageSquare, ImageOff } from "lucide-react";
import ListingTile from "@/components/market/ListingTile";
import ListingDetail from "@/components/market/ListingDetail";
import SellListingDialog from "@/components/market/SellListingDialog";
import DmsPanel from "@/components/DmsPanel";
import AccountView from "@/components/social/AccountView";

const CATEGORIES = ["All", "Furniture", "Electronics", "Vehicles", "Fashion", "Home", "Sports", "Toys", "Free", "Other"];

export default function Market() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sellOpen, setSellOpen] = useState(false);
  const [view, setView] = useState(null);
  const [dmHandle, setDmHandle] = useState(null);
  const [profileHandle, setProfileHandle] = useState(null);

  const load = async () => {
    try {
      const page = await base44.entities.Listing.filter({}, { sort: "-created_date", limit: 80 });
      setListings(page?.items || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    base44.auth.me().then(setMe).catch(() => {});
    const unsub = base44.entities.Listing?.subscribe?.(() => load());
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const q = query.trim().toLowerCase();
  const shown = listings.filter((l) => {
    const inCat = category === "All" || l.category === category;
    const hit = !q || [l.title, l.description, l.location].some((v) => (v || "").toLowerCase().includes(q));
    return inCat && hit;
  });

  const onStatus = (id, status) => {
    setListings((arr) => arr.map((l) => (l.id === id ? { ...l, status } : l)));
    setView((v) => (v && v.id === id ? { ...v, status } : v));
  };

  const onDeleted = (id) => {
    setListings((arr) => arr.filter((l) => l.id !== id));
    setView(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] px-3 py-3 pb-28 sm:px-4 sm:pb-8">
      <header className="sticky top-0 z-30 mb-3 rounded-2xl panel px-3 py-2.5 backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl brand-grad text-[15px] font-extrabold text-black">M</div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[17px] font-extrabold leading-none">Marketplace</h1>
            <p className="mt-0.5 truncate text-[11px] text-white/45">Browse photos near you · message any seller</p>
          </div>
          <button
            onClick={() => setDmHandle("")}
            title="Messages"
            className="grid h-9 w-9 place-items-center rounded-full text-white/65 hover:bg-white/10 hover:text-white"
          >
            <MessageSquare className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={() => setSellOpen(true)}
            className="flex items-center gap-1 rounded-full brand-grad px-3.5 py-2 text-[12px] font-bold text-black"
          >
            <Plus className="h-3.5 w-3.5" /> Sell
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search marketplace"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder-white/35"
          />
        </div>
      </header>

      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              category === c ? "brand-grad text-black" : "border border-white/10 bg-white/[0.05] text-white/65 hover:border-white/25 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-sm text-white/45">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading listings…
        </div>
      ) : shown.length === 0 ? (
        <div className="py-20 text-center">
          <ImageOff className="mx-auto mb-2 h-8 w-8 text-white/25" />
          <p className="text-sm text-white/45">
            {listings.length === 0 ? "No listings yet — sell the first thing." : "Nothing matches that search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((l) => (
            <ListingTile key={l.id} listing={l} onOpen={setView} />
          ))}
        </div>
      )}

      {view && (
        <ListingDetail
          listing={view}
          me={me}
          onClose={() => setView(null)}
          onMessage={(handle) => { setDmHandle(handle); setView(null); }}
          onProfile={(handle) => { setProfileHandle(handle); setView(null); }}
          onDeleted={onDeleted}
          onStatus={onStatus}
        />
      )}

      {sellOpen && (
        <SellListingDialog me={me} onClose={() => setSellOpen(false)} onSaved={() => { setSellOpen(false); load(); }} />
      )}

      {dmHandle !== null && <DmsPanel initialHandle={dmHandle} onClose={() => setDmHandle(null)} />}

      {profileHandle && (
        <AccountView
          handle={profileHandle}
          me={me}
          onClose={() => setProfileHandle(null)}
          onMessage={(h) => { setProfileHandle(null); setDmHandle(h); }}
        />
      )}
    </div>
  );
}