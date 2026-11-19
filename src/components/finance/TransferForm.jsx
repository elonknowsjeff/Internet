import React, { useState } from "react";
import { ArrowLeftRight, Check, Loader2 } from "lucide-react";

const MODES = [
  { key: "transfer", label: "Transfer" },
  { key: "deposit", label: "Add money" },
  { key: "withdraw", label: "Withdraw" },
];

export default function TransferForm({ accounts, onDone }) {
  const [mode, setMode] = useState("transfer");
  const [fromId, setFromId] = useState(accounts[0]?.id || "");
  const [toId, setToId] = useState(accounts[1]?.id || accounts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const sourceId = fromId || accounts[0]?.id;
  const source = accounts.find((a) => a.id === sourceId);
  const target = accounts.find((a) => a.id === (toId || accounts[0]?.id));

  const submit = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!source || !value || value <= 0) return;
    if (mode === "transfer" && (!target || target.id === source.id)) return;
    setBusy(true);
    try {
      await onDone({ mode, amount: value, note: note.trim(), sourceId: source.id, targetId: target?.id });
      setAmount("");
      setNote("");
      setDone(true);
      setTimeout(() => setDone(false), 2200);
    } catch {
      /* leave the inputs as they are so the user can retry */
    }
    setBusy(false);
  };

  return (
    <section className="panel p-3.5">
      <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em]">Move money</h2>

      <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-full border border-white/[0.08] bg-black/25 p-1">
        {MODES.map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)} className={`rounded-full py-1.5 text-[11.5px] font-semibold transition-colors ${mode === m.key ? "bg-white text-black" : "text-white/55 hover:text-white"}`}>{m.label}</button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-2.5 space-y-2">
        <label className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/35">
          {mode === "deposit" ? "Into" : "From"}
        </label>
        <select
          value={sourceId || ""}
          onChange={(e) => setFromId(e.target.value)}
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-2.5 py-2 text-[12.5px] outline-none focus:border-white/30"
        >
          {accounts.length === 0 && <option value="">No accounts yet</option>}
          {accounts.map((a) => <option key={a.id} value={a.id} className="bg-[#120d26]">{a.name} · {a.currency}</option>)}
        </select>

        {mode === "transfer" && (
          <>
            <label className="block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/35">To</label>
            <select
              value={toId || ""}
              onChange={(e) => setToId(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-2.5 py-2 text-[12.5px] outline-none focus:border-white/30"
            >
              {accounts.map((a) => <option key={a.id} value={a.id} className="bg-[#120d26]">{a.name} · {a.currency}</option>)}
            </select>
          </>
        )}

        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            className="rounded-xl border border-white/[0.1] bg-white/[0.05] px-2.5 py-2 font-display text-[15px] tabular-nums outline-none focus:border-white/30"
          />
          <span className="px-1 text-[12px] text-white/45">{source?.currency || "USD"}</span>
        </div>

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-2.5 py-2 text-[12px] outline-none focus:border-white/30"
        />

        <button type="submit" disabled={busy || !accounts.length} className="flex w-full items-center justify-center gap-1.5 rounded-full brand-grad py-2 text-[12.5px] font-bold text-black disabled:opacity-40">
          {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : done ? <><Check className="h-3.5 w-3.5" /> Done</> : <><ArrowLeftRight className="h-3.5 w-3.5" /> {MODES.find((m) => m.key === mode)?.label}</>}
        </button>
      </form>
    </section>
  );
}