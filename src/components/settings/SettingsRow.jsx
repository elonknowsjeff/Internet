import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function SettingsRow({ title, desc, children, to, onClick, danger }) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] font-semibold leading-snug ${danger ? "text-rose-300" : "text-white"}`}>{title}</p>
        {desc && <p className="mt-0.5 text-[12px] leading-snug text-white/45">{desc}</p>}
      </div>
      {children ?? (to || onClick ? <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-white/25" /> : null)}
    </>
  );

  const cls = "flex w-full items-start gap-3 border-b border-white/[0.07] px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.03]";
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export function Toggle({ on, onClick, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "brand-grad" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function Group({ title, desc, children }) {
  return (
    <section className="border-b border-white/[0.07] last:border-0">
      <div className="px-4 pb-1.5 pt-4">
        <h2 className="font-display text-[17px] font-extrabold tracking-tight">{title}</h2>
        {desc && <p className="mt-0.5 text-[12px] text-white/40">{desc}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${
        active ? "brand-grad text-black" : "border border-white/10 text-white/60 hover:border-white/30 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}