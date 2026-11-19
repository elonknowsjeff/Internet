import React from "react";
import { Star, Plus, ExternalLink } from "lucide-react";

const stars = (rating) =>
  [1, 2, 3, 4, 5].map((i) => (
    <Star
      key={i}
      className={`w-3 h-3 ${rating >= i - 0.25 ? "fill-amber-400 text-amber-400" : "text-neutral-600"}`}
    />
  ));

export default function AmazonProductCard({ product, onAdd }) {
  return (
    <div className="group flex flex-col rounded-lg bg-white/[.04] border border-white/10 overflow-hidden hover:border-amber-400/50 transition-colors">
      <a href={product.url} target="_blank" rel="noreferrer" className="block aspect-square bg-white p-2">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.visibility = "hidden"; }}
          className="w-full h-full object-contain group-hover:scale-[1.04] transition-transform duration-300"
        />
      </a>
      <div className="p-3 flex flex-col flex-1 gap-1">
        <a href={product.url} target="_blank" rel="noreferrer" className="text-[13px] leading-snug line-clamp-2 hover:text-amber-300">
          {product.title}
        </a>
        <div className="flex items-center gap-1">
          <div className="flex">{stars(product.rating || 0)}</div>
          {product.rating ? <span className="text-[11px] text-amber-300">{product.rating}</span> : null}
          {product.reviews ? <span className="text-[11px] text-neutral-500">({product.reviews.toLocaleString()})</span> : null}
        </div>
        <p className="mt-0.5 text-lg font-bold text-white leading-none">
          {product.price != null ? <>${product.price.toFixed(2)}</> : <span className="text-sm text-neutral-400">See price on Amazon</span>}
        </p>
        {product.prime && <span className="text-[10px] font-bold text-sky-400">prime</span>}
        <div className="mt-auto pt-2 flex gap-1.5">
          <button
            onClick={() => onAdd(product)}
            className="flex-1 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold"
          >
            Add to cart
          </button>
          <a
            href={product.url}
            target="_blank"
            rel="noreferrer"
            title="Open on Amazon"
            className="w-8 h-8 shrink-0 rounded-full border border-white/15 flex items-center justify-center text-neutral-300 hover:bg-white/10"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}