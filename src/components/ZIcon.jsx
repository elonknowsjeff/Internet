import React from "react";

export const Z_LOGO_URL =
  "https://base44.app/api/apps/6aff851241ee63818212a715/files/mp/public/6aff851241ee63818212a715/0b02643be_z-logo.jpg";

// Minimalist geometric double-lined white "Z" icon (pitch-black square, white Z).
export default function ZIcon({ size = 44, className = "", rounded = "28%" }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`} style={{ width: size, height: size, borderRadius: rounded, background: "#000" }}>
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" style={{ display: "block" }}>
        <g fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M12 13 H36" />
          <path d="M12 13 L36 35" />
          <path d="M12 35 H36" />
        </g>
      </svg>
    </span>
  );
}