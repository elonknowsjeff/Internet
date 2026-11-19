import React, { useState } from "react";
import { Plus, Wallet, Landmark, CreditCard, TrendingUp, X } from "lucide-react";

const KINDS = [
  { key: "checking", label: "Checking", icon: Landmark },
  { key: "savings", label: "Savings", icon: Wallet },
  { key: "credit", label: "Credit", icon: CreditCard },
  { key: "investment", label: "Investing", icon: TrendingUp },
];

const KIND_META = {
  checking: { label: "Checking", grad: "from-sky-500/35 to-indigo-600/20", icon: Landmark },
  savings: { label: "Savings", grad: "from-emerald-500/35 to-teal-600/20", icon: Wallet },
  credit: { label: "Credit", grad: "from-pink-500/35 to-fuchsia-600/20", icon: CreditCard },
  investment: { label: "Investing", grad: "from-violet-500/35 to-purple-600/20", icon: TrendingUp },
};

export const money = (n, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(n) || 0);
  } catch {
    return `${Number(n || 0).toFixed(2)} ${currency}`;
  }
};

export default function AccountsSection({ accounts, activeId, onSelect, onCreate }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", kind: "checking", currency: "USD", balance: "" });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onCreate({ ...form, name: form.name.trim(), currency: form.currency.toUpperCase().slice(0, 3), balance: Number(form.balance) || 0 });
    setForm({ name: "", kind: "checking", currency: "USD", balance: "" });
    setAdding(false);
  };

  return (
    <section className="panel p-3.5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em]">Your accounts</h2>
        <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-1 rounded-full border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold hover:bg-white/[0.12]">
          {adding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />} {adding ? "Cancel" : "Add account"}
        </button>
      </div>

      {adding && (
        <form onSubmit={submit} className="mt-2.5 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Account name" className="col-span-2 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-[12px] outline-none focus:border-white/30" />
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-2 py-1.5 text-[12px] outline-none">
            {KINDS.map((k) => <option key={k.key} value={k.key} className="bg-[#120d26]">{k.label}</option>)}
          </select>
          <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="USD" maxLength={3} className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-[12px] uppercase outline-none focus:border-white/30" />
          <input value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="Starting balance" inputMode="decimal" className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-[12px] outline-none focus:border-white/30" />
          <button type="submit" className="rounded-lg brand-grad px-2.5 py-1.5 text-[12px] font-bold text-black">Create</button>
        </form>
      )}

      {accounts.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-white/40">No accounts yet — add one to start tracking balances.</p>
      ) : (
        <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1 thin-scrollbar">
          {accounts.map((a) => {
            const meta = KIND_META[a.kind] || KIND_META.checking;
            const Icon = meta.icon;
            return (
              <button
                key={a.id}
                onClick={() => onSelect(a.id)}
                className={`relative w-[184px] shrink-0 overflow-hidden rounded-2xl border p-3 text-left transition-colors ${activeId === a.id ? "border-white/35" : "border-white/[0.09] hover:border-white/20"}`}
              >
                <span className={`absolute inset-0 bg-gradient-to-br ${meta.grad}`} />
                <span className="relative block">
                  <span className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">{meta.label}</span>
                    <Icon className="h-3.5 w-3.5 text-white/60" />
                  </span>
                  <span className="mt-3 block truncate text-[12.5px] font-semibold text-white/85">{a.name}</span>
                  <span className="mt-0.5 block font-display text-[19px] font-semibold tabular-nums tracking-[-0.02em]">{money(a.balance, a.currency)}</span>
                  <span className="mt-0.5 block text-[10px] text-white/40">{a.institution || a.currency}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}