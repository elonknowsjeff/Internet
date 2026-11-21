import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Search, ShoppingCart, Store as StoreIcon, Library, Sparkles, Gem, Gamepad2, X, Play, Cpu, Loader2 } from "lucide-react";
import GameArcade from "@/components/GameArcade";
import GameTile from "@/components/gaming/GameTile";
import GameDetail from "@/components/gaming/GameDetail";
import SkinsMarket from "@/components/gaming/SkinsMarket";
import AiGameStudio from "@/components/gaming/AiGameStudio";
import { seedGames, seedSkins, priceOf } from "@/components/gaming/gameData";
import GamePlayer from "@/components/games/GamePlayer";

const CART_KEY = "walza_store_cart";
const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; } };

const Shelf = ({ title, note, games, owned, onOpen, onAdd }) => (
  <section className="mt-5">
    <div className="flex items-baseline gap-2 px-1 mb-2">
      <h2 className="text-sm font-bold uppercase tracking-wide text-[#c6d4df]">{title}</h2>
      {note && <span className="text-[11px] text-[#8f98a0]">{note}</span>}
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {games.map((g) => (
        <div key={g.id} className="w-[140px] sm:w-[168px] shrink-0">
          <GameTile game={g} owned={owned.has(g.id)} onOpen={onOpen} onAdd={onAdd} compact />
        </div>
      ))}
    </div>
  </section>
);

export default function Gaming() {
  const [games, setGames] = useState([]);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("store");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState(null);
  const [cart, setCart] = useState(readCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [arcade, setArcade] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };

  const load = useCallback(async () => {
    try {
      const data = await base44.entities.Game.list("-created_date", 500);
      if (data.length === 0) {
        await base44.entities.Game.bulkCreate(seedGames);
        setGames(await base44.entities.Game.list("-created_date", 500));
      } else setGames(data);
    } catch (e) {}
    try {
      const skins = await base44.entities.GameItem.list("-created_date", 300);
      if (skins.length === 0) {
        await base44.entities.GameItem.bulkCreate(seedSkins);
        setItems(await base44.entities.GameItem.list("-created_date", 300));
      } else setItems(skins);
    } catch (e) {}
    setLoading(false);
  }, []);

  const loadPurchases = useCallback(async () => {
    try { setPurchases(await base44.entities.GamePurchase.list("-created_date", 300)); } catch (e) {}
  }, []);

  useEffect(() => {
    load(); loadPurchases();
    base44.auth.me().then(setUser).catch(() => {});
  }, [load, loadPurchases]);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  const owned = new Set(purchases.filter((p) => p.item_type === "game" && p.item_id).map((p) => p.item_id));
  const ownedSkins = new Set(purchases.filter((p) => p.item_type === "skin" && p.item_id).map((p) => p.item_id));

  const addToCart = async (g) => {
    const { now } = priceOf(g);
    if (owned.has(g.id)) { play(g); return; }
    if (now === 0) {
      try {
        await base44.entities.GamePurchase.create({ item_type: "game", item_id: g.id, item_name: g.title, cover: g.cover, price: 0, order_ref: `WZ-${Date.now().toString(36).toUpperCase()}` });
        await loadPurchases();
        flash(`${g.title} added to your library`);
      } catch (e) { flash("Couldn't add that game"); }
      return;
    }
    if (cart.some((c) => c.id === g.id)) { setCartOpen(true); return; }
    setCart((c) => [...c, { id: g.id, title: g.title, cover: g.cover, price: now }]);
    setDetail(null);
    flash(`${g.title} added to cart`);
  };

  const checkout = async () => {
    if (!cart.length || busy) return;
    setBusy(true);
    const ref = `WZ-${Date.now().toString(36).toUpperCase()}`;
    try {
      await base44.entities.GamePurchase.bulkCreate(cart.map((c) => ({ item_type: "game", item_id: c.id, item_name: c.title, cover: c.cover, price: c.price, order_ref: ref })));
      setCart([]); setCartOpen(false); await loadPurchases();
      flash(`Order ${ref} complete`);
      setTab("library");
    } catch (e) { flash("Checkout failed — try again"); }
    setBusy(false);
  };

  const buySkin = async (it) => {
    try {
      await base44.entities.GamePurchase.create({ item_type: "skin", item_id: it.id, item_name: it.name, cover: it.image, price: it.price, order_ref: `WZ-${Date.now().toString(36).toUpperCase()}` });
      await loadPurchases();
      flash(`${it.name} purchased`);
    } catch (e) { flash("Purchase failed — try again"); }
  };

  const play = async (g) => {
    setDetail(null);
    setPlaying(g);
    try { await base44.entities.Game.update(g.id, { plays: (g.plays || 0) + 1 }); } catch (e) {}
    load();
  };

  const total = cart.reduce((s, c) => s + c.price, 0);
  const q = query.trim().toLowerCase();
  const search = q ? games.filter((g) => `${g.title} ${g.genre} ${g.developer} ${g.tags || ""}`.toLowerCase().includes(q)) : [];
  const aiGames = games.filter((g) => g.ai_generated);
  const topSellers = [...games].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 12);
  const newReleases = [...games].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 12);
  const cheap = games.filter((g) => priceOf(g).now > 0 && priceOf(g).now < 10);
  const featured = aiGames[0] || games[0];
  const library = games.filter((g) => owned.has(g.id));

  const tabs = [
    { key: "store", label: "Store", icon: StoreIcon },
    { key: "ai", label: "AI Studio", icon: Sparkles },
    { key: "skins", label: "Skins", icon: Gem },
    { key: "library", label: "Library", icon: Library },
  ];

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 bg-[#171a21] border-b border-black/60">
        <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5">
          <Gamepad2 className="w-5 h-5 text-[#66c0f4] shrink-0" />
          <span className="font-black tracking-tight text-sm hidden sm:block">Internet X</span>
          <nav className="flex items-center gap-0.5 ml-2 overflow-x-auto scrollbar-none">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`px-2.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${tab === t.key ? "bg-[#2a475e] text-white" : "text-[#8f98a0] hover:text-white"}`}>
                <t.icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-black/50 border border-white/10 rounded px-2 py-1.5 w-28 sm:w-56">
              <Search className="w-3.5 h-3.5 text-[#8f98a0] shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the store" className="flex-1 min-w-0 bg-transparent outline-none text-xs" />
            </div>
            <button onClick={() => setArcade(true)} className="flex items-center gap-1.5 px-2.5 h-9 rounded bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black text-xs font-bold" title="Play the free arcade">
              <Gamepad2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Arcade</span>
            </button>
            <button onClick={() => setCartOpen(true)} className="relative w-9 h-9 rounded bg-[#2a475e] flex items-center justify-center hover:bg-[#31576f]" title="Cart">
              <ShoppingCart className="w-4 h-4 text-[#66c0f4]" />
              {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-[#4c6b22] text-[#beee11] text-[10px] font-bold flex items-center justify-center">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-b from-[#1b2838] to-[#171d26] min-h-screen">
        {loading ? (
          <div className="p-16 text-center text-[#8f98a0] flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading store…</div>
        ) : q ? (
          <div className="p-3 sm:p-5">
            <h2 className="text-sm font-bold text-[#c6d4df] mb-2">{search.length} results for "{query}"</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {search.map((g) => <GameTile key={g.id} game={g} owned={owned.has(g.id)} onOpen={setDetail} onAdd={addToCart} />)}
            </div>
          </div>
        ) : tab === "store" ? (
          <div className="p-3 sm:p-5">
            {featured && (
              <div className="relative rounded-lg overflow-hidden border border-black/40">
                <img src={featured.cover} alt={featured.title} className="w-full h-44 sm:h-60 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#171d26] via-[#171d26]/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end sm:justify-center p-4 sm:p-6 max-w-md">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-fuchsia-400 to-cyan-300 px-2 py-0.5 rounded w-fit mb-2 flex items-center gap-1"><Cpu className="w-3 h-3" /> AI original</span>
                  <h1 className="text-2xl sm:text-4xl font-black leading-none">{featured.title}</h1>
                  <p className="text-xs text-[#c6d4df] mt-2 line-clamp-2">{featured.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => setDetail(featured)} className="px-4 py-2 rounded bg-[#4c6b22] text-[#beee11] text-sm font-bold hover:bg-[#5a7d29]">
                      {priceOf(featured).now === 0 ? "Play free" : `Buy $${priceOf(featured).now.toFixed(2)}`}
                    </button>
                    <button onClick={() => play(featured)} className="px-4 py-2 rounded bg-[#2a475e] text-[#66c0f4] text-sm font-bold flex items-center gap-1 hover:bg-[#31576f]"><Play className="w-3.5 h-3.5" /> Play</button>
                  </div>
                </div>
              </div>
            )}
            <Shelf title="AI games" note="Built by Walza AI Studio" games={aiGames} owned={owned} onOpen={setDetail} onAdd={addToCart} />
            <Shelf title="Top sellers" games={topSellers} owned={owned} onOpen={setDetail} onAdd={addToCart} />
            <Shelf title="New & trending" games={newReleases} owned={owned} onOpen={setDetail} onAdd={addToCart} />
            {cheap.length > 0 && <Shelf title="Under $10" games={cheap} owned={owned} onOpen={setDetail} onAdd={addToCart} />}
          </div>
        ) : tab === "ai" ? (
          <AiGameStudio user={user} onCreated={() => { load(); flash("Your game is live in the store"); }} />
        ) : tab === "skins" ? (
          <SkinsMarket items={items} ownedIds={ownedSkins} onBuy={buySkin} />
        ) : (
          <div className="p-3 sm:p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#c6d4df] mb-2">Your library · {library.length} games · {purchases.filter((p) => p.item_type === "skin").length} skins</h2>
            {library.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/15 p-10 text-center text-[#8f98a0] text-sm">
                Nothing owned yet — buy a game from the store or generate your own in AI Studio.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {library.map((g) => <GameTile key={g.id} game={g} owned onOpen={setDetail} onAdd={play} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {detail && <GameDetail game={detail} owned={owned.has(detail.id)} onClose={() => setDetail(null)} onAdd={addToCart} onPlay={play} />}

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-sm h-full bg-[#171a21] border-l border-white/10 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-[#66c0f4]" /> Your cart</h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.length === 0 && <p className="text-sm text-[#8f98a0] py-8 text-center">Your cart is empty.</p>}
              {cart.map((c) => (
                <div key={c.id} className="flex items-center gap-2 bg-black/30 rounded p-2">
                  <img src={c.cover} alt="" className="w-12 h-16 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-[#beee11]">${c.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => setCart((s) => s.filter((x) => x.id !== c.id))} className="text-[#8f98a0] hover:text-rose-400"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-sm mb-2"><span className="text-[#8f98a0]">Estimated total</span><span className="font-bold">${total.toFixed(2)}</span></div>
              <button onClick={checkout} disabled={!cart.length || busy} className="w-full py-2.5 rounded bg-[#4c6b22] text-[#beee11] font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : "Purchase"}
              </button>
              <p className="text-[10px] text-[#8f98a0] mt-2 text-center">Games are added to your library instantly after purchase.</p>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded bg-[#4c6b22] text-[#beee11] text-sm font-bold shadow-lg">{toast}</div>}
      {arcade && <GameArcade onClose={() => setArcade(false)} />}
      {playing && <GamePlayer game={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}