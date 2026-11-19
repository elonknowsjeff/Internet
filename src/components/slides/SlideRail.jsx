import React from "react";
import { Plus, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { themeOf } from "./slideThemes";

export default function SlideRail({ slides, active, setActive, addSlide, move, delSlide }) {
  return (
    <aside className="w-[128px] sm:w-[188px] shrink-0 border-r border-white/10 bg-[#0f0b22] overflow-y-auto thin-scrollbar p-2 space-y-2">
      {slides.map((s, i) => {
        const t = themeOf(s.color);
        return (
          <div key={i} className="group relative">
            <button
              onClick={() => setActive(i)}
              className={`w-full text-left rounded-lg overflow-hidden border-2 transition-colors ${i === active ? "border-[var(--brand)]" : "border-white/10 hover:border-white/30"}`}
            >
              <div className={`aspect-video bg-gradient-to-br ${t.grad} ${t.text} px-2 py-1.5 flex flex-col justify-center`}>
                <p className="text-[7px] font-bold leading-tight line-clamp-2">{s.title || `Slide ${i + 1}`}</p>
                <p className={`text-[5.5px] line-clamp-3 mt-0.5 ${t.sub}`}>{s.body}</p>
              </div>
              <span className="block text-center text-[9px] text-white/40 py-0.5 bg-black/40">{i + 1}</span>
            </button>
            <div className="absolute right-1 top-1 hidden group-hover:flex flex-col gap-0.5">
              <button onClick={() => move(-1, i)} disabled={i === 0} className="w-5 h-5 rounded bg-black/70 text-white/70 hover:text-white flex items-center justify-center disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
              <button onClick={() => move(1, i)} disabled={i === slides.length - 1} className="w-5 h-5 rounded bg-black/70 text-white/70 hover:text-white flex items-center justify-center disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
              <button onClick={() => delSlide(i)} disabled={slides.length <= 1} className="w-5 h-5 rounded bg-black/70 text-rose-300 hover:text-rose-200 flex items-center justify-center disabled:opacity-30"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        );
      })}
      <button onClick={addSlide} className="w-full aspect-video rounded-lg border-2 border-dashed border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40">
        <Plus className="w-4 h-4" />
      </button>
    </aside>
  );
}