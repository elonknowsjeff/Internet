import React from "react";

const ICON = "https://base44.app/api/apps/6afae7fce0500df0d5129845/files/mp/public/6afae7fce0500df0d5129845/6a5c48c55_laxin-plus-icon.jpg";

export default function HubBanner() {
  return (
    <div className="px-3 sm:px-4 pt-3">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0920]">
        <div
          className="absolute inset-0 opacity-70 blur-2xl"
          style={{ background: "radial-gradient(70% 60% at 50% 10%, rgba(246,62,38,0.55), transparent 70%)" }}
        />
        <img
          src={ICON}
          alt="Valo"
          className="relative w-full max-h-[340px] object-contain"
        />
      </div>
    </div>
  );
}