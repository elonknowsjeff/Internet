import React from "react";
import { X, Trash2, ExternalLink, ShoppingBag } from "lucide-react";

export default function ShopBasket({ items, open, onClose, onQty, onRemove }) {
  const priced = items.filter((i) => typeof i.price === "number");
  const subtotal = priced.reduce((sum, i) => sum + i.price * i.qty, 0);
  const unpriced = items.length - priced.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-sm flex-col atmo-glass animate-slide-up">
        <header className="flex h-[58px] shrink-0 items-center gap-2 border-b border-white/[0.08] px-4">
          <ShoppingBag className="h-[18px] w-[18px]" style={{ color: "var(--brand)" }} />
          <h2 className="text-[15px] font-extrabold">Basket</h2>
          <span className="text-[12px] text-white/40">{items.length} item{items.length === 1 ? "" : "s"}</span>
          <button onClick={onClose} className="ml-auto grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Close basket">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto thin-scrollbar px-3 py-3">
          {items.length === 0 ? (
            <p className="py-16 text-center text-[13px] text-white/40">
              Your basket is empty. Add something from the shop.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((i) => (
                <div key={i.asin} className="flex gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2">
                  <a href={i.url} target="_blank" rel="noreferrer" className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/[0.04]">
                    <img src={i.image} alt="" className="h-full w-full object-contain mix-blend-lighten" />
                  </a>
                  <div className="min-w-0 flex-1">
                    <a href={i.url} target="_blank" rel="noreferrer" className="line-clamp-2 text-[12px] leading-snug hover:text-white/80">
                      {i.title}
                    </a>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onQty(i.asin, -1)} className="grid h-5 w-5 place-items-center rounded-full border border-white/15 text-[11px] hover:bg-white/10">−</button>
                        <span className="min-w-3 text-center text-[11.5px] font-semibold">{i.qty}</span>
                        <button onClick={() => onQty(i.asin, 1)} className="grid h-5 w-5 place-items-center rounded-full border border-white/15 text-[11px] hover:bg-white/10">+</button>
                      </div>
                      <span className="text-[12px] font-semibold">
                        {typeof i.price === "number" ? `$${(i.price * i.qty).toFixed(2)}` : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <a href={i.url} target="_blank" rel="noreferrer" className="grid h-6 w-6 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white" title="Open on Amazon"><ExternalLink className="h-3.5 w-3.5" /></a>
                    <button onClick={() => onRemove(i.asin)} className="grid h-6 w-6 place-items-center rounded-full text-white/40 hover:bg-rose-500/15 hover:text-rose-300" title="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-white/[0.08] p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.08em] text-white/45">Subtotal</span>
            <span className="text-[18px] font-bold">${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/35">
            {unpriced > 0 ? `${unpriced} item${unpriced === 1 ? "" : "s"} priced on Amazon. ` : ""}
            Shipping and checkout are completed on Amazon.
          </p>
          <a
            href={items[0]?.url || "https://www.amazon.com"}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 flex items-center justify-center gap-1.5 rounded-full brand-grad px-4 py-2.5 text-[12.5px] font-bold text-black"
          >
            Continue on Amazon <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </footer>
      </aside>
    </div>
  );
}