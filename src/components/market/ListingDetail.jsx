import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, MessageSquare, MapPin, Truck, Store, UserRound, Trash2, Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const DELIVERY = {
  pickup: { label: "Pickup only", icon: Store },
  shipping: { label: "Shipping available", icon: Truck },
  both: { label: "Pickup or shipping", icon: Truck },
};

export default function ListingDetail({ listing, me, onClose, onMessage, onProfile, onDeleted, onStatus }) {
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const images = listing.images?.length ? listing.images : [];
  const own = !!me && listing.seller_id === me.id;
  const ship = DELIVERY[listing.delivery] || DELIVERY.pickup;
  const ShipIcon = ship.icon;

  const toggleSold = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = listing.status === "sold" ? "available" : "sold";
      await base44.entities.Listing.update(listing.id, { status: next });
      onStatus(listing.id, next);
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (busy || !confirm("Delete this listing?")) return;
    setBusy(true);
    try {
      await base44.entities.Listing.delete(listing.id);
      onDeleted(listing.id);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/[0.12] gloss-strong sm:rounded-3xl animate-slide-up">
        <button onClick={onClose} className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black">
          <X className="h-4 w-4" />
        </button>

        <div className="flex-1 overflow-y-auto thin-scrollbar">
          {/* photos */}
          <div className="relative aspect-[4/3] w-full shrink-0 bg-black/40">
            {images.length ? (
              <img src={images[idx]} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-white/30">No photo</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur hover:bg-black"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/45"}`} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 p-4">
            <div>
              <p className="font-display text-2xl font-extrabold leading-none">
                {Number(listing.price || 0) === 0 ? "Free" : `$${Number(listing.price || 0).toLocaleString()}`}
              </p>
              <h2 className="mt-1 text-[15px] font-semibold leading-snug">{listing.title}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {listing.category && <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-white/70">{listing.category}</span>}
              {listing.condition && <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[11px] text-white/70">{listing.condition}</span>}
              {listing.status === "sold" && <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-black">Sold</span>}
            </div>

            <div className="space-y-1 text-[12.5px] text-white/60">
              {listing.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> {listing.location}</p>}
              <p className="flex items-center gap-1.5"><ShipIcon className="h-3.5 w-3.5 shrink-0" /> {ship.label}</p>
            </div>

            {listing.description && (
              <p className="whitespace-pre-line border-t border-white/[0.08] pt-3 text-[13px] leading-relaxed text-white/75">{listing.description}</p>
            )}

            {/* seller */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.09] bg-white/[0.04] p-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 text-sm font-bold text-black">
                {listing.seller_avatar ? <img src={listing.seller_avatar} alt="" className="h-full w-full object-cover" /> : (listing.seller_name?.[0] || "U").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{own ? "You" : listing.seller_name || "Seller"}</p>
                <p className="truncate text-[11px] text-white/45">@{listing.seller_handle || "member"}</p>
              </div>
              {!own && listing.seller_handle && (
                <button onClick={() => onProfile(listing.seller_handle)} title="View profile" className="grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
                  <UserRound className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2 border-t border-white/[0.09] bg-black/25 p-3">
          {own ? (
            <>
              <button
                onClick={toggleSold}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/10 py-2.5 text-[13px] font-semibold hover:bg-white/15 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {listing.status === "sold" ? "Mark as available" : "Mark as sold"}
              </button>
              <button onClick={remove} disabled={busy} className="grid h-10 w-10 place-items-center rounded-full bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 disabled:opacity-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onMessage(listing.seller_handle)}
              disabled={!listing.seller_handle}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full brand-grad py-2.5 text-[13px] font-bold text-black disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" /> Message seller
            </button>
          )}
        </div>
      </div>
    </div>
  );
}