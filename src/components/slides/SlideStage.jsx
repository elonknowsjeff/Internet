import React from "react";
import { themeOf } from "./slideThemes";

export default function SlideStage({ slide, index, total, deckName, zoom, onChange }) {
  const t = themeOf(slide.color);
  const isTitle = index === 0;

  return (
    <div className="w-full transition-all" style={{ maxWidth: `${Math.round(900 * (zoom / 100))}px` }}>
      <div className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${t.grad} ${t.text} shadow-[0_36px_90px_-36px_rgba(0,0,0,0.95)] flex flex-col px-[7%] py-[6%]`}>
        <span className={`w-12 h-1 rounded-full mb-[5%] ${t.accent}`} />
        <input
          value={slide.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={isTitle ? "Presentation title" : "Slide title"}
          className={`w-full bg-transparent outline-none font-black tracking-tight leading-[1.05] ${t.ph} ${
            isTitle ? "text-[clamp(18px,3.4vw,44px)]" : "text-[clamp(15px,2.2vw,30px)]"
          }`}
        />
        <textarea
          value={slide.body}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Add your points — one per line"
          rows={isTitle ? 2 : 4}
          className={`mt-[3%] w-full flex-1 bg-transparent outline-none resize-none leading-relaxed text-[clamp(9px,1.15vw,15px)] ${t.sub} ${t.ph}`}
        />
        <div className={`mt-auto flex items-center gap-2 text-[9px] sm:text-[10px] ${t.sub}`}>
          <span className="truncate max-w-[60%]">{deckName || "Untitled deck"}</span>
          <span className="ml-auto tabular-nums">{index + 1} / {total}</span>
        </div>
      </div>
    </div>
  );
}