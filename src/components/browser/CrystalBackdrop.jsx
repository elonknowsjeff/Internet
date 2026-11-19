import React from "react";

export default function CrystalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="crystal">
        <div className="crystal-edge" />
      </div>
      <div className="crystal crystal-sm">
        <div className="crystal-edge" />
      </div>
    </div>
  );
}