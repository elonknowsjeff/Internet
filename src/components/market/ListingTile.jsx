import React from "react";
import { ImageOff, MapPin } from "lucide-react";

export default function ListingTile({ listing, onOpen }) {
  const img = listing.images?.[0];
  return (
    <button
      onClick={() => onOpen(listing)}
      className="group relative aspect-square overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.04] text-left"
    >
      {img ? (
        <img
          src={img}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
      ) : (
        <span className="grid h-full w-full place-items-center text-white/20">
          <ImageOff className="h-6 w-6" />
        </span>
      )}

      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

      <span className="absolute inset-x-1.5 bottom-1.5 flex items-end justify-between gap-1.5">
        <span className="min-w-0 truncate text-[11px] font-semibold text-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {listing.title}
        </span>
        <span className="ml-auto shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-extrabold leading-tight text-black">
          {Number(listing.price || 0) === 0 ? "Free" : `$${Number(listing.price || 0).toLocaleString()}`}
        </span>
      </span>

      {listing.location && (
        <span className="absolute left-1.5 top-1.5 flex max-w-[75%] items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[9.5px] font-medium text-white/85 backdrop-blur-sm">
          <MapPin className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate">{listing.location}</span>
        </span>
      )}

      {listing.status === "sold" && (
        <span className="absolute inset-0 grid place-items-center bg-black/55">
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-black">Sold</span>
        </span>
      )}
    </button>
  );
}