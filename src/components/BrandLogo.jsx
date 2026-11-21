import React from "react";

export const LOGO_URL = "https://base44.app/api/apps/6aff851241ee63818212a715/files/mp/public/6aff851241ee63818212a715/91d694d8b_internetx-logo.jpg";

export default function BrandLogo({ size = 44, className = "" }) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-[28%] blur-lg opacity-50"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 55%, transparent), transparent 70%)" }}
      />
      <img
        src={LOGO_URL}
        alt="Internet X"
        className="relative w-full h-full rounded-[28%] object-cover"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.18), 0 6px 18px -8px rgba(0,0,0,0.6)" }}
      />
    </span>
  );
}