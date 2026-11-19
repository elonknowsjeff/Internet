import React from "react";
import { Link } from "react-router-dom";

// Apple-style glossy squircle tile used by the bottom dock.
const TINTS = {
  feed: ["#6366F1", "#8B5CF6"],
  messages: ["#22D3EE", "#3B82F6"],
  dating: ["#FB7185", "#F472B6"],
  music: ["#FB2D55", "#FF7A8A"],
  movies: ["#A855F7", "#6366F1"],
  video: ["#EF4444", "#F97316"],
  radio: ["#14B8A6", "#22D3EE"],
  assistant: ["#8B5CF6", "#EC4899"],
  cloud: ["#38BDF8", "#6366F1"],
  docs: ["#F59E0B", "#F97316"],
  default: ["#64748B", "#94A3B8"],
};

export default function DockIcon({ appKey, to, label, icon: Icon, active, badge, onClick }) {
  const [a, b] = TINTS[appKey] || TINTS.default;
  const tile = (
    <span
      className={`relative grid h-[34px] w-[34px] place-items-center overflow-hidden rounded-[11px] border border-white/25 transition-all duration-200 ${
        active ? "translate-y-[-2px] scale-[1.04]" : "group-hover:-translate-y-1"
      }`}
      style={{
        backgroundImage: `linear-gradient(165deg, ${a}, ${b})`,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -8px 14px -8px rgba(0,0,0,0.65), 0 10px 20px -10px rgba(0,0,0,0.95)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(120% 70% at 30% -10%, rgba(255,255,255,0.7), rgba(255,255,255,0) 60%)" }}
      />
      <Icon className="relative h-[17px] w-[17px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-[#FF3B30] px-1 text-[9px] font-bold text-white ring-2 ring-[#0b0818]">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
  );

  const shell = "group relative flex flex-col items-center";
  const tip =
    "pointer-events-none absolute -top-7 whitespace-nowrap rounded-md bg-black/85 px-2 py-1 text-[10px] text-white/90 opacity-0 transition-opacity group-hover:opacity-100";

  if (!to) {
    return (
      <button onClick={onClick} aria-label={label} className={shell}>
        {tile}
        <span className={tip}>{label}</span>
      </button>
    );
  }

  return (
    <Link to={to} aria-label={label} className={shell}>
      {tile}
      <span className={tip}>{label}</span>
      {active && <span className="mt-[3px] h-1 w-1 rounded-full bg-white/85" />}
    </Link>
  );
}