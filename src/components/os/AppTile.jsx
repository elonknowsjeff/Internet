import React from "react";
import { Link } from "react-router-dom";

/*
  One glossy app tile, shared by every launcher surface so the whole icon
  language stays cohesive: dark glass slab, lit top edge, brand halo on hover.
*/
export default function AppTile({ to, label, icon: Icon, active, index = 0, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      title={label}
      style={{ animationDelay: `${Math.min(index, 24) * 22}ms` }}
      className={`app-enter group relative flex flex-col items-center gap-2 rounded-[18px] px-1 pb-2.5 pt-3 transition-colors duration-300 ${
        active ? "bg-white/[0.07]" : "hover:bg-white/[0.045]"
      }`}
    >
      <span
        className={`relative grid h-[54px] w-[54px] place-items-center overflow-hidden rounded-[17px] border transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-[1.05] ${
          active
            ? "border-white/40 shadow-[0_14px_30px_-14px_rgba(168,85,247,0.9),inset_0_1px_0_rgba(255,255,255,0.4)]"
            : "border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_16px_30px_-22px_rgba(0,0,0,1)] group-hover:border-white/30"
        }`}
        style={{
          backgroundImage:
            "linear-gradient(165deg, rgba(28,32,48,0.92), rgba(11,13,22,0.96))",
        }}
      >
        <span
          className={`pointer-events-none absolute inset-0 brand-grad transition-opacity duration-300 ${
            active ? "opacity-40" : "opacity-[0.14] group-hover:opacity-35"
          }`}
        />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
        <Icon
          className={`relative h-[21px] w-[21px] transition-colors duration-300 ${
            active ? "text-white" : "text-white/70 group-hover:text-white"
          }`}
        />
      </span>
      <span
        className={`w-full truncate text-center text-[10.5px] leading-tight transition-colors duration-300 ${
          active ? "font-bold text-white" : "font-medium text-white/55 group-hover:text-white"
        }`}
      >
        {label}
      </span>
      {active && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full brand-grad" />}
    </Link>
  );
}