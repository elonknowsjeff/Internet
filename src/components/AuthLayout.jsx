import React from "react";
import BrandLogo from "@/components/BrandLogo";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#241d45] px-4 py-10">
      <div className="pointer-events-none absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-fuchsia-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-44 -right-28 w-[480px] h-[480px] rounded-full bg-cyan-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.18),transparent_55%)]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4"><BrandLogo size={64} /></div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.44em] text-white/45 mb-2">XSI</p>
          <h1 className="text-3xl font-bold tracking-tight text-white font-display flex items-center justify-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-white/70" aria-hidden="true" />}
            {title}
          </h1>
          {subtitle && <p className="text-white/60 mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="rounded-3xl bg-white p-7 sm:p-8 ring-1 ring-white/50 shadow-[0_36px_90px_-28px_rgba(168,85,247,0.65)]">
          {children}
        </div>

        {footer && <p className="text-center text-sm text-white/55 mt-6">{footer}</p>}
      </div>
    </div>
  );
}