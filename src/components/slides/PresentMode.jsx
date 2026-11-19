import React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { themeOf, bullets } from "./slideThemes";

export default function PresentMode({ slides, active, go, onExit }) {
  const cur = slides[active] || slides[0];
  const t = themeOf(cur.color);
  const isTitle = active === 0;
  const lines = bullets(cur.body);

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col">
      <div className={`flex-1 bg-gradient-to-br ${t.grad} ${t.text} px-[7%] py-[6%] flex flex-col`} onClick={() => go(1)}>
        <span className={`w-14 h-1 rounded-full mb-[4%] ${t.accent}`} />
        <h1 className={`font-black tracking-tight leading-[1.05] ${isTitle ? "text-[clamp(28px,5vw,72px)]" : "text-[clamp(22px,3.4vw,52px)]"}`}>
          {cur.title || "Untitled slide"}
        </h1>
        {lines.length > 0 && (
          <ul className={`mt-[3%] space-y-2 ${t.sub} text-[clamp(13px,1.6vw,24px)]`}>
            {lines.map((l, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`mt-[0.55em] w-1.5 h-1.5 rounded-full shrink-0 ${t.accent}`} />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex items-center justify-center gap-4 py-3 bg-black/90 border-t border-white/10">
        <button onClick={(e) => { e.stopPropagation(); go(-1); }} disabled={active === 0} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
        <span className="text-sm text-white/60 tabular-nums">{active + 1} / {slides.length}</span>
        <button onClick={(e) => { e.stopPropagation(); go(1); }} disabled={active === slides.length - 1} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
        <button onClick={(e) => { e.stopPropagation(); onExit(); }} className="ml-4 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm flex items-center gap-1"><X className="w-4 h-4" /> Exit</button>
      </div>
    </div>
  );
}