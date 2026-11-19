import React from "react";
import BrowserPanel from "@/components/desktop/BrowserPanel";

export default function Browser() {
  return (
    <div className="relative px-2 py-2 flex flex-col h-[calc(100dvh-104px)] min-h-[520px]">
      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15 gloss-strong shadow-[0_40px_100px_-30px_rgba(168,85,247,0.75)]">
        <BrowserPanel />
      </div>
    </div>
  );
}