import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, ShoppingBag, RefreshCw, ExternalLink } from "lucide-react";
import ProductTicket from "@/components/shop/ProductTicket";
import ShopBasket from "@/components/shop/ShopBasket";

const CHIPS = ["Wireless earbuds", "Laptop", "Sneakers", "Coffee maker", "Gaming mouse", "Air fryer", "Smart watch", "Skincare"];
const DEFAULT_TERM = "wireless earbuds";

export default function Shop() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState(DEFAULT_TERM);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchUrl, setSearchUrl] = useState("https://www.amazon.com");
  const [basket, setBasket] = useState([]);
  const [basketOpen, setBasketOpen] = useState(false);
  const [added, setAdded] = useState({});

  const search = useCallback(async (query) => {
    const t = query.trim();
    if (!t) return;
    setTerm(t);
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("amazonSearch", { query: t });
      const data = res.data || {};
      const rows = data.products || [];
      setProducts(rows);
      if (data.searchUrl) setSearchUrl(data.searchUrl);
      if (!rows.length) setError(data.error || "Nothing came back for that search.");
    } catch (e) {
      setProducts([]);
      setError("Couldn't reach Amazon just now. Try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { search(DEFAULT_TERM); }, [search]);

  const add = (p) => {
    setBasket((b) => {
      const hit = b.find((x) => x.asin === p.asin);
      if (hit) return b.map((x) => (x.asin === p.asin ? { ...x, qty: x.qty + 1 } : x));
      return [...b, { ...p, qty: 1 }];
    });
    setAdded((a) => ({ ...a, [p.asin]: true }));
  };

  const changeQty = (asin, delta) =>
    setBasket((b) =>
      b.map((x) => (x.asin === asin ? { ...x, qty: Math.max(1, x.qty + delta) } : x)),
    );

  const remove = (asin) => {
    setBasket((b) => b.filter((x) => x.asin !== asin));
    setAdded((a) => { const n = { ...a }; delete n[asin]; return n; });
  };

  const count = basket.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="min-h-[100dvh] pb-28">
      {/* Storefront header */}
      <header className="sticky top-3 z-30 mb-4 overflow-hidden rounded-[22px] atmo-glass">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl brand-grad text-black"><ShoppingBag className="h-[18px] w-[18px]" /></span>
          <div className="min-w-0">
            <h1 className="font-display text-[17px] font-extrabold leading-tight tracking-tight">Shop</h1>
            <p className="text-[11px] text-white/45">Live catalog · prices from Amazon</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); search(q); }}
            className="ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-3 py-2 focus-within:border-white/30 sm:max-w-md"
          >
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${term}…`}
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35"
            />
            {q.trim() && (
              <button type="submit" className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-black">Go</button>
            )}
          </form>
          <button
            onClick={() => setBasketOpen(true)}
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/[0.12] bg-white/[0.05] hover:bg-white/10"
            aria-label="Open basket"
          >
            <ShoppingBag className="h-[17px] w-[17px]" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold">{count}</span>
            )}
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-3 pb-2.5 scrollbar-none">
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => { setQ(c); search(c); }}
              className={`shrink-0 rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors ${
                term === c ? "brand-grad text-black" : "border border-white/[0.1] bg-white/[0.05] text-white/60 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="px-1 sm:px-2">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[12px] uppercase tracking-[0.1em] text-white/40">
            {loading ? "Loading results…" : `${products.length} results · ${term}`}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => search(term)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10" title="Refresh">
              <RefreshCw className={`h-3.5 w-3.5 text-white/45 ${loading ? "animate-spin" : ""}`} />
            </button>
            <a href={searchUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-white/45 hover:text-white">
              Open on Amazon <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-1.5">
                <div className="aspect-[4/3] rounded-[10px] bg-white/[0.05]" />
                <div className="h-24 rounded-[10px] bg-white/[0.035]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl panel px-5 py-12 text-center">
            <p className="text-[13px] text-white/60">{error}</p>
            <button onClick={() => search(term)} className="mt-3 rounded-full brand-grad px-4 py-1.5 text-[12px] font-bold text-black">Try again</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductTicket key={p.asin} product={p} added={!!added[p.asin]} onAdd={add} />
            ))}
          </div>
        )}
      </div>

      <ShopBasket
        items={basket}
        open={basketOpen}
        onClose={() => setBasketOpen(false)}
        onQty={changeQty}
        onRemove={remove}
      />
    </div>
  );
}