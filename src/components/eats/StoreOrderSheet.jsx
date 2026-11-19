import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Minus, Plus, Check, Loader2, MapPin, CreditCard, ExternalLink } from "lucide-react";
import { startCheckout } from "@/lib/checkout";

export default function StoreOrderSheet({ store, onClose, onPlaced }) {
  const [cart, setCart] = useState({});
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(null);
  const [payErr, setPayErr] = useState("");

  const step = (name, delta) =>
    setCart((c) => {
      const q = Math.max(0, (c[name] || 0) + delta);
      const next = { ...c };
      if (q === 0) delete next[name]; else next[name] = q;
      return next;
    });

  const items = store.menu
    .filter((m) => cart[m.name])
    .map((m) => ({ name: m.name, price: m.price, quantity: cart[m.name] }));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal > 0 ? subtotal + store.fee : 0;

  const place = async () => {
    if (!items.length || placing) return;
    setPlacing(true);
    setPayErr("");
    try {
      const order = await base44.entities.Order.create({
        restaurant_name: store.name,
        items,
        total: Number(total.toFixed(2)),
        status: "placed",
        delivery_address: address.trim() || "My saved address",
      });
      setDone(order);
      onPlaced?.();
      await startCheckout({
        kind: "eats",
        store_id: store.id,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
      });
    } catch (e) {
      setPayErr(e?.message || "Couldn't open checkout.");
    }
    setPlacing(false);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="glass-card w-full sm:max-w-lg max-h-[88vh] flex flex-col bg-[#2a2152]/95" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/15">
          <div className="w-9 h-9 rounded-lg bg-white overflow-hidden flex items-center justify-center">
            <img src={store.logo} alt="" className="w-6 h-6 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{store.name}</p>
            <p className="text-[11px] text-white/60">{store.cuisine} · {store.eta}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-3"><Check className="w-7 h-7 text-emerald-300" /></div>
            <h3 className="text-lg font-bold">Order placed</h3>
            <p className="text-sm text-white/70 mt-1">{store.name} · ${Number(done.total).toFixed(2)}</p>
            <p className="text-xs text-white/50 mt-1">Arriving in about {store.eta}</p>
            <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-full brand-grad text-black font-semibold">Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {store.menu.map((m) => (
                <div key={m.name} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-xs text-white/60">${m.price.toFixed(2)}</p>
                  </div>
                  {cart[m.name] ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => step(m.name, -1)} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                      <span className="text-sm w-4 text-center">{cart[m.name]}</span>
                      <button onClick={() => step(m.name, 1)} className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => step(m.name, 1)} className="px-3 py-1 rounded-full brand-grad text-black text-xs font-semibold">Add</button>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-white/15 p-3 space-y-2">
              <div className="flex items-center gap-2 bg-white/5 border border-white/15 rounded-full px-3 py-2">
                <MapPin className="w-4 h-4 text-fuchsia-300" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" className="flex-1 bg-transparent outline-none text-sm placeholder-white/40" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{items.reduce((s, i) => s + i.quantity, 0)} items · delivery ${store.fee.toFixed(2)}</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              {payErr && <p className="text-xs text-rose-300 text-center">{payErr}</p>}
              <button onClick={place} disabled={!items.length || placing} className="w-full py-2.5 rounded-full brand-grad text-black font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
                {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout…</> : <><CreditCard className="w-4 h-4" /> Pay ${total.toFixed(2)} & place order</>}
              </button>
              <a
                href={`https://www.ubereats.com/ca/search?q=${encodeURIComponent(store.name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-full bg-white/10 border border-white/15 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/15"
              >
                Order on Uber Eats <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}