import React from "react";
import { X } from "lucide-react";

export default function WidgetShell({ title, action, onHide, children, className = "" }) {
  return (
    <section className={`relative overflow-hidden rounded-2xl panel ${className}`}>
      <div className="flex items-center gap-2 px-3.5 pb-1.5 pt-3">
        <h2 className="min-w-0 truncate font-display text-[15px] font-extrabold tracking-tight">{title}</h2>
        {action}
        <button
          onClick={onHide}
          title="Hide this widget"
          aria-label="Hide widget"
          className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {children}
    </section>
  );
}