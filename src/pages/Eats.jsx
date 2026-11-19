import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { UtensilsCrossed, Search, X, ShoppingBag, Loader2, Store, Star, Clock, Bike, ChefHat, Package } from "lucide-react";
import DishCard from "@/components/eats/DishCard";
import CartDrawer from "@/components/eats/CartDrawer";

const CATEGORIES = ["All", "Chicken", "Beef", "Pasta", "Seafood", "Vegetarian", "Dessert", "Breakfast"];

const STATUS_META = {
  placed: { label: "Placed", color: "text-amber-400", bg: "bg-amber-500/15" },
  preparing: { label: "Preparing", color: "text-orange-400", bg: "bg-orange-500/15" },
  on_the_way: { label: "On the way", color: "text-sky-400", bg: "bg-sky-500/15" },
  delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

const STATUS_FLOW = ["placed", "preparing", "on_the_way", "delivered"];

export default function Eats() {
  const [tab, setTab] = useState("dishes");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);

  const loadDishes = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("foodApi", {
        query: query.trim(),
        category: category === "All" ? "" : category,
      });
      setDishes(res.data?.dishes || []);
    } catch {
      setDishes([]);
    }
    setLoading(false);
  };

  const loadRestaurants = async () => {
    try {
      const data = await base44.entities.Restaurant.list("-rating", 30);
      setRestaurants(Array.isArray(data) ? data : data?.items || []);
    } catch {
      setRestaurants([]);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await base44.entities.Order.list("-created_date", 20);
      setOrders(Array.isArray(data) ? data : data?.items || []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => { loadDishes(); }, []);
  useEffect(() => { loadRestaurants(); loadOrders(); }, []);

  // live order status progression
  useEffect(() => {
    const id = setInterval(async () => {
      const active = orders.filter((o) => o.status && o.status !== "delivered");
      if (!active.length) return;
      const next = STATUS_FLOW[STATUS_FLOW.indexOf(active[0].status) + 1];
      if (next) {
        await base44.entities.Order.update(active[0].id, { status: next }).catch(() => {});
        loadOrders();
      }
    }, 12000);
    return () => clearInterval(id);
  }, [orders]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (dish) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === dish.id);
      if (ex) return c.map((x) => (x.id === dish.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { id: dish.id, name: dish.name, price: dish.price, image: dish.image, qty: 1 }];
    });
    setCartOpen(true);
    setPlaced(false);
  };
  const inc = (i) => setCart((c) => c.map((x) => (x.id === i.id ? { ...x, qty: x.qty + 1 } : x)));
  const dec = (i) => setCart((c) => c.flatMap((x) => (x.id === i.id ? (x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []) : [x])));
  const removeItem = (i) => setCart((c) => c.filter((x) => x.id !== i.id));

  const checkout = async () => {
    if (placing || !cart.length || !address.trim()) return;
    setPlacing(true);
    try {
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0) + 2.99;
      await base44.entities.Order.create({
        restaurant_name: "XSI Eats Kitchen",
        items: cart.map((i) => ({ name: i.name, price: i.price, quantity: i.qty })),
        total,
        status: "placed",
        delivery_address: address.trim(),
      });
      setCart([]);
      setPlaced(true);
      loadOrders();
    } catch {
      setPlacing(false);
    }
    setPlacing(false);
  };

  const filteredDishes = useMemo(
    () => dishes.filter((d) => (query.trim() ? (d.name + " " + d.area).toLowerCase().includes(query.toLowerCase()) : true)),
    [dishes, query]
  );

  return (
    <div className="px-4 py-5 pb-28">
      <header className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300">Food delivery</p>
        <h1 className="text-2xl sm:text-3xl font-black font-display flex items-center gap-2 mt-1">
          <UtensilsCrossed className="w-6 h-6 text-amber-300" /> Eats
        </h1>
        <p className="text-sm text-neutral-400 mt-1">Browse dishes, pick a restaurant and get it delivered to your door.</p>
      </header>

      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.04] p-1 mb-4 w-full sm:w-auto sm:inline-flex">
        {[
          { k: "dishes", l: "Dishes", icon: ChefHat },
          { k: "restaurants", l: "Restaurants", icon: Store },
          { k: "orders", l: "Orders", icon: Package },
        ].map(({ k, l, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === k ? "bg-white text-black" : "text-neutral-300 hover:bg-white/10"}`}
          >
            <Icon className="w-4 h-4" /> {l}
          </button>
        ))}
      </div>

      {tab === "dishes" && (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex items-center gap-2 flex-1 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5">
              <Search className="w-4 h-4 text-neutral-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes…" className="flex-1 bg-transparent outline-none text-sm" />
              {query && <button onClick={() => setQuery("")} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${category === c ? "bg-amber-500 text-black border-amber-500" : "border-white/12 bg-white/[.04] text-neutral-300 hover:bg-white/[.08]"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-neutral-500 flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin" /> Loading dishes…</div>
          ) : filteredDishes.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No dishes found. Try another search or category.</p>
          ) : (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDishes.map((d) => <DishCard key={d.id} dish={d} onAdd={addToCart} />)}
            </div>
          )}
        </>
      )}

      {tab === "restaurants" && (
        <>
          {restaurants.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No restaurants listed yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {restaurants.map((r) => (
                <article key={r.id} className="rounded-2xl overflow-hidden border border-white/10 bg-white/[.03] hover:border-amber-400/40 transition flex flex-col">
                  {r.image && (
                    <div className="relative h-36">
                      <img src={r.image} alt={r.name} loading="lazy" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/65 text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300" /> {r.rating?.toFixed(1) || "4.5"}
                      </span>
                    </div>
                  )}
                  <div className="p-3.5 flex flex-col flex-1">
                    <h3 className="font-bold leading-tight">{r.name}</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{r.cuisine}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.delivery_time || "20-30 min"}</span>
                      <span className="flex items-center gap-1"><Bike className="w-3 h-3" /> ${r.delivery_fee?.toFixed(2) || "2.99"}</span>
                      <span className="text-amber-400">{r.price_range || "$$"}</span>
                    </div>
                    {r.menu?.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {r.menu.slice(0, 3).map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[12px]">
                            <span className="text-neutral-300 truncate pr-2">{m.name}</span>
                            <span className="font-bold text-amber-400 shrink-0">${m.price?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No orders yet. Place one from the Dishes tab.</p>
          ) : (
            orders.map((o) => {
              const meta = STATUS_META[o.status] || STATUS_META.placed;
              const stepIdx = STATUS_FLOW.indexOf(o.status);
              return (
                <div key={o.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{o.restaurant_name}</p>
                      <p className="text-[11px] text-neutral-400">{o.delivery_address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${o.total?.toFixed(2)}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    {STATUS_FLOW.map((s, idx) => (
                      <React.Fragment key={s}>
                        <span className={`w-2.5 h-2.5 rounded-full ${idx <= stepIdx ? "bg-amber-500" : "bg-white/15"}`} />
                        {idx < STATUS_FLOW.length - 1 && <span className={`flex-1 h-0.5 rounded ${idx < stepIdx ? "bg-amber-500" : "bg-white/10"}`} />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400">{o.items?.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* floating cart button */}
      {cartCount > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 lg:bottom-6 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-2xl shadow-amber-500/30"
        >
          <ShoppingBag className="w-5 h-5" /> {cartCount} item{cartCount > 1 ? "s" : ""} · ${(cart.reduce((s, i) => s + i.price * i.qty, 0) + 2.99).toFixed(2)}
        </button>
      )}

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onInc={inc}
        onDec={dec}
        onRemove={removeItem}
        onCheckout={checkout}
        placing={placing}
        address={address}
        setAddress={setAddress}
        placed={placed}
      />
    </div>
  );
}