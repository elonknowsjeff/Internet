import React from "react";
import { useLocation } from "react-router-dom";
import { frameFor } from "@/components/shell/pageLayouts";

/*
  Gives each route its own page frame so the app no longer shares a single
  universal container: media routes bleed to the edges, tool routes run full
  height, catalog routes get a broad sheet, editorial routes stay centred.
*/
export default function PageCanvas({ children }) {
  const { pathname } = useLocation();
  const { layout, className } = frameFor(pathname);
  const sheet = layout === "wide" || layout === "column";

  return (
    <div
      className={`relative min-h-[100dvh] min-w-0 ${sheet ? "atmo-sheet" : ""} ${className}`}
    >
      <div key={pathname} className="animate-fade-in w-full min-w-0">
        {children}
      </div>
    </div>
  );
}