import React from "react";

export const LOGO_URL = "https://base44.app/api/apps/6afae7fce0500df0d5129845/files/mp/public/6afae7fce0500df0d5129845/7ce4c4c13_laxin-logo.jpg";

export default function BrandLogo({ size = 44, className = "" }) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-[28%] blur-lg opacity-70"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.75), rgba(56,189,248,0.25) 55%, transparent 72%)" }}
      />
      <img
        src={LOGO_URL}
        alt="XSI"
        className="relative w-full h-full rounded-[28%] object-cover"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.22), 0 10px 26px -10px rgba(34,211,238,0.8)" }}
      />
    </span>
  );
}