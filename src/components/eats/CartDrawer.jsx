import React from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, MapPin, Check } from "lucide-react";

export default function CartDrawer({ open, items, onClose, onInc, onDec, onRemove, onCheckout, placing, address, setAddress, placed }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = items.length ? 2.99 : 0;
  const total = subtotal + fee;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 bottom-0 z-[61] w-full max-w-sm bg-[#0b0818] border-l border-white/10 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
          <h2 className="font-bold flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-amber-400" /> Your order</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
        </header>

        {placed ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 grid place-items-center mb-3"><Check className="w-8 h-8 text-emerald-400" /></div>
            <p className="font-bold text-lg">Order placed!</p>
            <p className="text-sm text-neutral-400 mt-1">Your kitchen is preparing your food. Track it in the Orders tab.</p>
            <button onClick={onClose} className="mt-5 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm">Done</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center text-neutral-500">
            <ShoppingBag className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">Your cart is empty.</p>
            <p className="text-xs mt-1">Add a dish to get started.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto thin-scrollbar px-3 py-3 space-y-2">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[.03] p-2">
                  <img src={i.image} alt={i.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{i.name}</p>
                    <p className="text-[11px] text-amber-400 font-bold">${i.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onDec(i)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-5 text-center text-sm font-bold">{i.qty}</span>
                    <button onClick={() => onInc(i)} className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 grid place-items-center"><Plus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onRemove(i)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 grid place-items-center text-rose-300 ml-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-3.5 space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2">
                <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Delivery address"
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-white/35"
                />
              </div>
              <div className="flex justify-between text-[12px] text-neutral-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-[12px] text-neutral-400"><span>Delivery fee</span><span>${fee.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <button
                onClick={onCheckout}
                disabled={placing || !address.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing order…</> : <>Place order · ${total.toFixed(2)}</>}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}