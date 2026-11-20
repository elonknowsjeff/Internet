import React, { useState } from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import { startSubscription } from "@/lib/checkout";
import WidgetShell from "@/components/feed/widgets/WidgetShell";

const PERKS = ["No ads anywhere", "AI movies & songs", "Bigger uploads", "Priority checkout"];

export default function ProCard({ user, onHide }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const go = async () => {
    setBusy(true);
    setErr("");
    try {
      await startSubscription("plus");
    } catch (e) {
      setErr(e?.message || "Checkout is unavailable right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WidgetShell title="Valo Pro" onHide={onHide}>
      <div className="px-3.5 pb-3.5">
        <div className="rounded-xl border border-white/[0.1] bg-[linear-gradient(135deg,rgba(168,85,247,0.22),rgba(56,189,248,0.12))] p-3">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold">
            <Crown className="h-4 w-4" style={{ color: "var(--brand)" }} />
            {user ? "Unlock more features" : "Sign in, then unlock more"}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-center gap-1.5 text-[11.5px] text-white/60">
                <Check className="h-3 w-3 shrink-0" style={{ color: "var(--brand)" }} /> {p}
              </li>
            ))}
          </ul>
          <button
            onClick={go}
            disabled={busy}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full brand-grad py-1.5 text-[12.5px] font-bold text-black disabled:opacity-60"
          >
            {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Opening checkout…</> : "Upgrade — $4.99/mo"}
          </button>
          <p className="mt-1.5 text-center text-[10px] text-white/35">Secure card payment by Stripe</p>
          {err && <p className="mt-1 text-center text-[10.5px] text-rose-300">{err}</p>}
        </div>
      </div>
    </WidgetShell>
  );
}