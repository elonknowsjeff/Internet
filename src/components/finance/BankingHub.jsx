import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import AccountsSection, { money } from "@/components/finance/AccountsSection";
import TransferForm from "@/components/finance/TransferForm";
import LiveRates from "@/components/finance/LiveRates";

const TX_META = {
  deposit: { icon: ArrowDownLeft, tone: "text-emerald-300", sign: "+" },
  withdrawal: { icon: ArrowUpRight, tone: "text-rose-300", sign: "−" },
  transfer_in: { icon: ArrowLeftRight, tone: "text-sky-300", sign: "+" },
  transfer_out: { icon: ArrowLeftRight, tone: "text-amber-300", sign: "−" },
};

export default function BankingHub() {
  const [accounts, setAccounts] = useState([]);
  const [txs, setTxs] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [acc, tx] = await Promise.all([
        base44.entities.BankAccount.list("-created_date", 50),
        base44.entities.BankTx.list("-created_date", 15),
      ]);
      setAccounts(acc);
      setTxs(tx);
      setActiveId((prev) => (acc.some((a) => a.id === prev) ? prev : acc[0]?.id || ""));
    } catch {
      setAccounts([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createAccount = async (data) => {
    await base44.entities.BankAccount.create(data);
    await load();
  };

  const move = async ({ mode, amount, note, sourceId, targetId }) => {
    const source = accounts.find((a) => a.id === sourceId);
    if (!source) return;
    const target = accounts.find((a) => a.id === targetId);

    if (mode === "transfer" && target) {
      await base44.entities.BankAccount.update(source.id, { balance: Number(source.balance || 0) - amount });
      await base44.entities.BankAccount.update(target.id, { balance: Number(target.balance || 0) + amount });
      await base44.entities.BankTx.bulkCreate([
        { account_id: source.id, account_name: source.name, type: "transfer_out", amount, currency: source.currency, note: note || `To ${target.name}` },
        { account_id: target.id, account_name: target.name, type: "transfer_in", amount, currency: target.currency, note: note || `From ${source.name}` },
      ]);
    } else {
      const sign = mode === "deposit" ? 1 : -1;
      await base44.entities.BankAccount.update(source.id, { balance: Number(source.balance || 0) + sign * amount });
      await base44.entities.BankTx.create({
        account_id: source.id,
        account_name: source.name,
        type: mode === "deposit" ? "deposit" : "withdrawal",
        amount,
        currency: source.currency,
        note,
      });
    }
    await load();
  };

  const active = accounts.find((a) => a.id === activeId);

  return (
    <div className="space-y-3">
      <AccountsSection accounts={accounts} activeId={activeId} onSelect={setActiveId} onCreate={createAccount} />

      <div className="grid gap-3 md:grid-cols-2">
        <TransferForm accounts={accounts} onDone={move} />
        <LiveRates />
      </div>

      <section className="panel p-3.5">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-[-0.01em]">
          <Wallet className="h-4 w-4" style={{ color: "var(--brand)" }} /> Recent activity
          {active && <span className="text-[11px] font-normal text-white/40">· {active.name}</span>}
        </h2>
        {loading ? (
          <p className="py-5 text-center text-[12px] text-white/40">Loading activity…</p>
        ) : txs.filter((t) => !active || t.account_id === active.id).length === 0 ? (
          <p className="py-5 text-center text-[12px] text-white/40">Nothing moved yet.</p>
        ) : (
          <div className="mt-1.5 divide-y divide-white/[0.05]">
            {txs.filter((t) => !active || t.account_id === active.id).map((t) => {
              const meta = TX_META[t.type] || TX_META.deposit;
              const Icon = meta.icon;
              return (
                <div key={t.id} className="flex items-center gap-2.5 py-2">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.05] ${meta.tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium capitalize">{t.type.replace("_", " ")}</span>
                    <span className="block truncate text-[10.5px] text-white/35">{t.note || t.account_name}</span>
                  </span>
                  <span className={`shrink-0 text-[12.5px] font-semibold tabular-nums ${meta.tone}`}>
                    {meta.sign}{money(t.amount, t.currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}