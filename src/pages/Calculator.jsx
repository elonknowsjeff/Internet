import React from "react";
import CalculatorApp from "@/components/desktop/CalculatorApp";
import { Calculator as CalcIcon } from "lucide-react";

export default function Calculator() {
  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl gloss-strong flex items-center justify-center">
          <CalcIcon className="w-5 h-5" style={{ color: "var(--brand)" }} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display leading-none">Calculator</h1>
          <p className="text-[11px] text-neutral-400 mt-1">Quick maths, right inside Walza Plus</p>
        </div>
      </div>
      <div className="rounded-3xl gloss-strong overflow-hidden h-[480px]">
        <CalculatorApp />
      </div>
      <p className="text-[11px] text-neutral-500 mt-3 text-center">The same calculator is on the desktop in the Browser section.</p>
    </div>
  );
}