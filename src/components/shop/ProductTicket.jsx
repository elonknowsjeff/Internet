import React, { useState } from "react";
import { Star } from "lucide-react";

/*
  Ticket-style product card (designed component, restyled to XSI):
  image panel, tear-line notches, info panel that reveals a spec sheet on
  hover/focus, and an add-to-basket stub.
*/
const SURFACE = "#11131d";
const SURFACE_OPEN = "#171a26";

const Tear = ({ fill }) => (
  <svg
    className="relative -my-[3px] block h-[28px] w-full"
    viewBox="0 0 453 22"
    preserveAspectRatio="none"
    aria-hidden="true"
    style={{ zIndex: 1 }}
  >
    <path d="M23 0 H430 A11 11 0 0 0 430 22 H23 A11 11 0 0 0 23 0 Z" fill={fill} />
  </svg>
);

export default function ProductTicket({ product, added, onAdd }) {
  const [open, setOpen] = useState(false);
  const surface = open ? SURFACE_OPEN : SURFACE;
  const hasPrice = typeof product.price === "number";

  const specs = [
    ["Rating", product.rating ? `${product.rating} / 5` : "Not rated"],
    ["Reviews", product.reviews ? product.reviews.toLocaleString() : "New"],
    ["Sold by", product.prime ? "Amazon · Prime" : "Amazon"],
  ];

  return (
    <article
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
      className="w-full min-w-0 text-white"
    >
      <div
        className="relative aspect-[4/3] rounded-[10px] p-3 transition-colors duration-300"
        style={{ background: surface }}
      >
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="relative block h-full overflow-hidden rounded-md bg-white/[0.03]"
        >
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className={`h-full w-full object-contain mix-blend-lighten transition-transform duration-500 ease-out ${open ? "scale-105" : "scale-100"}`}
          />
        </a>
        <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#11131d]">
          {product.prime ? "Prime" : "Amazon"}
        </span>
      </div>

      <Tear fill={surface} />

      <div
        className="rounded-[10px] px-5 pb-6 pt-5 transition-colors duration-300 sm:px-6"
        style={{ background: surface }}
      >
        <h3 className="line-clamp-2 font-display text-[16px] font-light uppercase leading-snug tracking-[0.01em]">
          {product.title}
        </h3>

        <p className="mt-3 flex items-center gap-1.5 text-[12px] uppercase tracking-[0.04em] text-white/60">
          <Star className="h-3 w-3 fill-white/70 text-white/70" />
          {product.rating ? product.rating : "—"}
          {product.reviews ? <span className="text-white/35">· {product.reviews.toLocaleString()} reviews</span> : null}
        </p>

        <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-white/45">
          Ships from Amazon. Final price, delivery and checkout are confirmed on Amazon.
        </p>

        <div
          className={`grid transition-all duration-500 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 overflow-hidden">
            <dl className="mt-4 border-t border-white/[0.12]">
              {specs.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between border-b border-white/[0.12] py-2.5 text-[11px] uppercase tracking-[0.05em]"
                >
                  <dt className="text-white/40">{k}</dt>
                  <dd className="text-white/85">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <p className="mt-4 text-[17px] font-semibold leading-none">
          {hasPrice ? `$${product.price.toFixed(2)}` : <span className="text-[13px] font-normal text-white/55">See price on Amazon</span>}
        </p>
      </div>

      <Tear fill={surface} />

      <button
        type="button"
        onClick={() => onAdd(product)}
        className="group relative z-[2] flex h-[64px] w-full items-center rounded-[10px] px-6 text-left text-[12.5px] font-semibold uppercase tracking-[0.06em] text-white transition-colors duration-300 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
        style={{ background: surface }}
        aria-label={`Add ${product.title} to basket`}
      >
        <span className={`inline-block transition-transform duration-300 ${added ? "" : "group-hover:rotate-90"}`}>
          {added ? "✓" : "+"}
        </span>
        <span className={`ml-2 inline-block transition-transform duration-300 ${added ? "" : "group-hover:translate-x-1.5"}`}>
          {added ? "Added" : "Add to basket"}
        </span>
      </button>
    </article>
  );
}