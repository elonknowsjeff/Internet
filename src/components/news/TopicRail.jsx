import React from "react";
import { TOPICS } from "@/lib/newsTopics";

export default function TopicRail({ active, onPick }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-3 pb-2 pt-1">
      {TOPICS.map((t) => {
        const Icon = t.icon;
        const on = active === t.key;
        return (
          <button key={t.key} onClick={() => onPick(t.key)} className="shrink-0 w-[66px] flex flex-col items-center gap-1.5 group">
            <span
              className={`relative grid place-items-center w-11 h-11 rounded-2xl border transition-all duration-200 ${on ? "border-white/35 -translate-y-0.5" : "border-white/10 group-hover:border-white/25"}`}
              style={{
                background: `linear-gradient(160deg, ${t.color}38, ${t.color}0f 60%, ${t.color}22)`,
                boxShadow: on
                  ? `inset 0 1px 0 rgba(255,255,255,0.28), 0 0 0 1px ${t.color}70, 0 12px 26px -12px ${t.color}`
                  : "inset 0 1px 0 rgba(255,255,255,0.14)",
              }}
            >
              <Icon
                className="w-[19px] h-[19px] transition-transform duration-200 group-hover:scale-110"
                style={{ color: t.color, filter: `drop-shadow(0 0 6px ${t.color}cc)` }}
              />
            </span>
            <span className={`text-[10px] font-semibold truncate max-w-[62px] ${on ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>
              {t.key}
            </span>
          </button>
        );
      })}
    </div>
  );
}