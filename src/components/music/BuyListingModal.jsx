import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Check, Loader2, ShieldCheck, Music2 } from "lucide-react";

export default function BuyListingModal({ listing, user, onClose, onDone }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const confirm = async () => {
    setBusy(true); setErr("");
    try {
      await base44.entities.MusicOrder.create({
        listing_id: listing.id,
        listing_title: listing.title,
        seller_name: listing.seller_name,
        license_type: listing.license_type || "Basic Lease",
        price: Number(listing.price) || 0,
        artwork: listing.artwork,
        buyer_name: user?.display_name || user?.full_name || "Buyer",
        status: "pending",
      });
      await base44.entities.MusicListing.update(listing.id, { sold: (listing.sold || 0) + 1 });
      setDone(true);
      onDone?.(listing);
    } catch (e) {
      setErr("Could not place the order. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-neutral-950 border border-white/15 p-5">
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>

        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto mb-3"><Check className="w-7 h-7" /></div>
            <h2 className="text-lg font-bold font-display">Order placed</h2>
            <p className="text-sm text-neutral-400 mt-1.5">
              {listing.title} · {listing.license_type || "Basic Lease"}
            </p>
            <p className="text-xs text-neutral-500 mt-3 max-w-xs mx-auto">
              {listing.seller_name} has been notified and will send the files and license in Messages. Your order is saved under Music → Marketplace → My orders.
            </p>
            <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-full bg-orange-500 text-black font-semibold text-sm">Done</button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold font-display mb-4">Checkout</h2>
            <div className="flex gap-3">
              <img src={listing.artwork} alt={listing.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold truncate">{listing.title}</p>
                <p className="text-xs text-neutral-400 truncate">@{listing.seller_handle}</p>
                <p className="text-xs text-orange-300 mt-1 flex items-center gap-1"><Music2 className="w-3 h-3" />{listing.license_type || "Basic Lease"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-400"><span>License</span><span className="text-neutral-200">{listing.license_type || "Basic Lease"}</span></div>
              <div className="flex justify-between text-neutral-400"><span>Seller</span><span className="text-neutral-200">{listing.seller_name}</span></div>
              <div className="flex justify-between font-bold pt-1.5 border-t border-white/10"><span>Total</span><span>${Number(listing.price || 0).toFixed(2)}</span></div>
            </div>

            <p className="text-[11px] text-neutral-500 mt-3 flex items-start gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> The order is recorded and the seller delivers the files and license in Messages. Card checkout isn't connected yet.</p>
            {err && <p className="text-xs text-rose-400 mt-2">{err}</p>}

            <div className="flex gap-2 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-neutral-800 text-sm">Cancel</button>
              <button onClick={confirm} disabled={busy} className="flex-1 py-2.5 rounded-full bg-orange-500 text-black font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing…</> : "Confirm order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}