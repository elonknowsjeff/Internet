import React, { useState } from "react";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";
import { MEMBERSHIP_PLANS, planById } from "@/lib/membershipPlans";
import { startSubscription } from "@/lib/checkout";

export default function MembershipPlans() {
  const [planId, setPlanId] = useState("plus");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [returned] = useState(() => new URLSearchParams(window.location.search).get("subscribed") === "1");
  const plan = planById(planId);

  const subscribe = async () => {
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      await startSubscription(planId);
    } catch (e) {
      setErr(e?.message || "Couldn't open checkout.");
    }
    setBusy(false);
  };

  return (
    <section className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 mb-4">
      <h2 className="font-semibold mb-1 flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-cyan-400" /> Vazolex membership
      </h2>
      <p className="text-xs text-white/45 mb-3">One membership, six levels — pick the one that fits and pay once a month.</p>

      <div className="grid grid-cols-2 gap-2">
        {MEMBERSHIP_PLANS.map((p) => {
          const active = p.id === planId;
          return (
            <button
              key={p.id}
              onClick={() => setPlanId(p.id)}
              className={`rounded-xl border p-3 text-left transition-all ${active ? "border-cyan-400 bg-cyan-400/10" : "border-white/10 hover:border-white/30"}`}
            >
              <p className="text-[11px] uppercase tracking-wide text-white/45">{p.blurb}</p>
              <p className="text-sm font-semibold mt-0.5">{p.label}</p>
              <p className="text-lg font-bold font-display mt-1">
                ${p.price.toFixed(2)}
                <span className="text-[10px] font-normal text-white/45"> /mo</span>
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-4">
        <p className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" /> {plan.label}
        </p>
        <ul className="mt-2 space-y-1.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-white/70">
              <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> {f}
            </li>
          ))}
        </ul>
        {err && <p className="text-xs text-rose-300 mt-3">{err}</p>}
        {returned && !err && (
          <p className="text-xs text-white/60 mt-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
            Payment submitted. Your membership activates as soon as Stripe confirms the charge.
          </p>
        )}
        <button
          onClick={subscribe}
          disabled={busy}
          className="mt-4 w-full py-2.5 rounded-full brand-grad text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout…</> : `Subscribe · $${plan.price.toFixed(2)}/mo`}
        </button>
        <p className="text-[10px] text-white/35 mt-2 text-center">Secure recurring payment handled by Stripe. Cancel anytime.</p>
      </div>
    </section>
  );
}