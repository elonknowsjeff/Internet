import React from "react";

export const LOGO_URL = "https://base44.app/api/apps/6aff851241ee63818212a715/files/mp/public/6aff851241ee63818212a715/e9f870ff6_valo-logo.jpg";

export default function BrandLogo({ size = 44, className = "" }) {
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-[28%] blur-lg opacity-80"
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--brand) 75%, transparent), color-mix(in srgb, var(--brand-2) 50%, transparent) 55%, transparent 72%)" }}
      />
      <img
        src={LOGO_URL}
        alt="Valo"
        className="relative w-full h-full rounded-[28%] object-cover"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.22), 0 10px 26px -10px color-mix(in srgb, var(--brand) 80%, transparent)" }}
      />
    </span>
  );
}