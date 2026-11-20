import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, Package, Search, Plus, X, Loader2, MapPin, Clock, Check, Weight, Boxes, PackageCheck } from "lucide-react";

const SERVICES = [
  { key: "Standard", eta: "3-5 days", perKg: 4.5, icon: Boxes },
  { key: "Express", eta: "1-2 days", perKg: 9.5, icon: Truck },
  { key: "Same Day", eta: "Today", perKg: 18, icon: PackageCheck },
  { key: "Freight", eta: "5-7 days", perKg: 2.8, icon: Truck },
];

const STATUS_FLOW = ["label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"];
const STATUS_META = {
  label_created: { label: "Label created", dot: "bg-white/40", tone: "text-white/55" },
  picked_up: { label: "Picked up", dot: "bg-sky-400", tone: "text-sky-300" },
  in_transit: { label: "In transit", dot: "bg-indigo-400", tone: "text-indigo-300" },
  out_for_delivery: { label: "Out for delivery", dot: "bg-amber-400", tone: "text-amber-300" },
  delivered: { label: "Delivered", dot: "bg-emerald-400", tone: "text-emerald-300" },
};

const genTracking = () => "VAL" + Math.random().toString(36).slice(2, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export default function Logistics() {
  const [view, setView] = useState("track");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState("");
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({ sender_name: "", sender_address: "", recipient_name: "", recipient_address: "", service: "Standard", weight_kg: 1, notes: "" });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Shipment.list("-created_date", 50);
      setShipments(Array.isArray(data) ? data : data?.items || []);
    } catch { setShipments([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      const active = shipments.filter((s) => s.status && s.status !== "delivered");
      if (!active.length) return;
      const next = STATUS_FLOW[STATUS_FLOW.indexOf(active[0].status) + 1];
      if (next) {
        await base44.entities.Shipment.update(active[0].id, { status: next }).catch(() => {});
        load();
      }
    }, 15000);
    return () => clearInterval(id);
  }, [shipments]);

  const trackByNumber = async (num) => {
    setSearching(true); setFound(null);
    try {
      const data = await base44.entities.Shipment.filter({ tracking_number: num.trim() }, { limit: 1 });
      const list = Array.isArray(data) ? data : data?.items || [];
      setFound(list[0] || null);
    } catch { setFound(null); }
    setSearching(false);
  };

  const createShipment = async () => {
    if (creating) return;
    if (!form.recipient_name.trim() || !form.recipient_address.trim() || !form.sender_name.trim()) return;
    setCreating(true);
    try {
      const svc = SERVICES.find((s) => s.key === form.service);
      const cost = Number((form.weight_kg * svc.perKg + 3.5).toFixed(2));
      const etaDays = svc.key === "Same Day" ? 0 : svc.key === "Express" ? 2 : svc.key === "Standard" ? 4 : 6;
      const rec = await base44.entities.Shipment.create({ ...form, tracking_number: genTracking(), cost, status: "label_created", estimated_delivery: addDays(etaDays) });
      setCreated(rec);
      setForm({ sender_name: "", sender_address: "", recipient_name: "", recipient_address: "", service: "Standard", weight_kg: 1, notes: "" });
      load();
    } catch {}
    setCreating(false);
  };

  const stats = {
    total: shipments.length,
    active: shipments.filter((s) => s.status && s.status !== "delivered").length,
    delivered: shipments.filter((s) => s.status === "delivered").length,
  };

  const tabs = [
    { k: "track", l: "Track", icon: Search },
    { k: "create", l: "New shipment", icon: Plus },
    { k: "all", l: "My shipments", icon: Package },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 pb-28">
      <header className="pt-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl brand-grad text-black shadow-[0_10px_26px_-10px_var(--brand)]"><Truck className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-[26px] font-semibold leading-none tracking-[-0.02em]">Logistics</h1>
            <p className="mt-1.5 text-[12px] text-white/40">Ship parcels, print labels and track every package in real time.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { label: "Shipments", value: stats.total, icon: Package, tint: "text-white" },
            { label: "In transit", value: stats.active, icon: Truck, tint: "text-amber-300" },
            { label: "Delivered", value: stats.delivered, icon: PackageCheck, tint: "text-emerald-300" },
          ].map((s) => (
            <div key={s.label} className="panel flex items-center gap-2.5 p-3">
              <s.icon className={`h-4 w-4 ${s.tint}`} />
              <div className="min-w-0">
                <p className="text-[18px] font-bold leading-none">{s.value}</p>
                <p className="text-[10.5px] text-white/40 truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-5 flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
        {tabs.map(({ k, l, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition ${view === k ? "brand-grad text-black" : "text-white/55 hover:text-white"}`}
          >
            <Icon className="h-3.5 w-3.5" /> {l}
          </button>
        ))}
      </div>

      {view === "track" && (
        <div className="mt-5">
          <div className="panel flex items-center gap-2 px-3.5 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && trackingInput.trim() && trackByNumber(trackingInput)}
              placeholder="Enter a tracking number"
              className="flex-1 bg-transparent text-[13px] outline-none placeholder-white/35"
            />
            {trackingInput && <button onClick={() => { setTrackingInput(""); setFound(null); }} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>}
            <button onClick={() => trackingInput.trim() && trackByNumber(trackingInput)} disabled={!trackingInput.trim() || searching} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-bold text-white disabled:opacity-40 hover:bg-white/15">
              {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Track"}
            </button>
          </div>

          {searching && <p className="mt-6 text-center text-[13px] text-white/40 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Searching…</p>}
          {!searching && trackingInput && !found && <p className="mt-6 text-center text-[13px] text-white/40">No shipment with that tracking number. Create one in the New shipment tab.</p>}
          {found && <ShipmentDetail s={found} />}
        </div>
      )}

      {view === "create" && (
        <div className="mt-5">
          {created && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              <div className="flex-1">
                <p className="text-[13px] font-bold">Shipment created</p>
                <p className="mt-0.5 text-[12px] text-white/60">Tracking number: <span className="font-mono font-bold text-emerald-300">{created.tracking_number}</span></p>
                <button onClick={() => { setView("track"); setTrackingInput(created.tracking_number); setFound(created); setCreated(null); }} className="mt-2 text-[12px] font-semibold text-emerald-300 hover:underline">Track it now →</button>
              </div>
              <button onClick={() => setCreated(null)} className="text-white/40 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
          )}
          <div className="panel space-y-4 p-5">
            <FormSection label="From">
              <input value={form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} placeholder="Sender name" className="field" />
              <input value={form.sender_address} onChange={(e) => setForm({ ...form, sender_address: e.target.value })} placeholder="Pickup address" className="field" />
            </FormSection>
            <FormSection label="To">
              <input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} placeholder="Recipient name" className="field" />
              <input value={form.recipient_address} onChange={(e) => setForm({ ...form, recipient_address: e.target.value })} placeholder="Delivery address" className="field" />
            </FormSection>
            <FormSection label="Service">
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((s) => {
                  const Icon = s.icon;
                  const active = form.service === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setForm({ ...form, service: s.key })}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${active ? "border-[color:var(--brand)] bg-[color:var(--brand)]/10" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"}`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "" : "text-white/45"}`} style={active ? { color: "var(--brand)" } : undefined} />
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold">{s.key}</p>
                        <p className="text-[10px] text-white/40">{s.eta} · ${s.perKg}/kg</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </FormSection>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
                <Weight className="h-4 w-4 text-white/40" />
                <input type="number" min="0.1" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })} className="flex-1 bg-transparent text-[13px] outline-none" />
                <span className="text-[11px] text-white/35">kg</span>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[13px] font-bold" style={{ color: "var(--brand)" }}>
                ${(form.weight_kg * (SERVICES.find((s) => s.key === form.service)?.perKg || 0) + 3.5).toFixed(2)}
              </div>
            </div>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="field" />
            <button
              onClick={createShipment}
              disabled={creating || !form.recipient_name.trim() || !form.recipient_address.trim() || !form.sender_name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-full brand-grad py-3 text-[13px] font-bold text-black disabled:opacity-50"
            >
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating label…</> : <><Plus className="h-4 w-4" /> Create shipment</>}
            </button>
          </div>
        </div>
      )}

      {view === "all" && (
        <div className="mt-5">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-16 text-white/40"><Loader2 className="h-6 w-6 animate-spin" /> <span className="text-[13px]">Loading shipments…</span></div>
          ) : shipments.length === 0 ? (
            <div className="panel py-12 text-center">
              <Package className="mx-auto mb-2 h-8 w-8 text-white/25" />
              <p className="text-[13px] text-white/45">No shipments yet. Create one in the New shipment tab.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {shipments.map((s) => (
                <ShipmentRow key={s.id} s={s} onClick={() => { setView("track"); setTrackingInput(s.tracking_number); setFound(s); }} />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`.field{width:100%;border-radius:12px;border:1px solid hsl(var(--border));background:hsl(var(--card));padding:10px 14px;font-size:13px;outline:none}.field:focus{border-color:hsl(var(--primary))}`}</style>
    </div>
  );
}

function FormSection({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ShipmentRow({ s, onClick }) {
  const meta = STATUS_META[s.status] || STATUS_META.label_created;
  return (
    <button onClick={onClick} className="panel flex w-full items-center gap-3 p-3.5 text-left transition hover:border-white/20">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03]"><Package className="h-5 w-5 text-sky-300" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[12px] font-bold" style={{ color: "var(--brand)" }}>{s.tracking_number}</p>
        <p className="mt-0.5 truncate text-[13px] font-semibold">{s.recipient_name}</p>
        <p className="flex items-center gap-1 truncate text-[11px] text-white/40"><MapPin className="h-3 w-3" /> {s.recipient_address}</p>
      </div>
      <div className="shrink-0 text-right">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/70">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
        </span>
        <p className="mt-1.5 text-[11px] text-white/40">{s.service} · {s.weight_kg}kg</p>
        <p className="mt-0.5 text-[13px] font-bold">${s.cost?.toFixed(2)}</p>
      </div>
    </button>
  );
}

function ShipmentDetail({ s }) {
  const meta = STATUS_META[s.status] || STATUS_META.label_created;
  const stepIdx = STATUS_FLOW.indexOf(s.status);
  return (
    <div className="panel mt-4 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[13px] font-bold" style={{ color: "var(--brand)" }}>{s.tracking_number}</p>
          <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/70">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
          </span>
        </div>
        <p className="text-[18px] font-bold">${s.cost?.toFixed(2)}</p>
      </div>

      <div className="mt-5 relative pl-6">
        <span className="absolute left-[7px] top-1 bottom-1 w-px bg-white/10" />
        {STATUS_FLOW.map((st, idx) => {
          const done = idx <= stepIdx;
          const current = idx === stepIdx;
          const m = STATUS_META[st];
          return (
            <div key={st} className="relative pb-4 last:pb-0">
              <span className={`absolute -left-6 top-0.5 grid h-4 w-4 place-items-center rounded-full ${done ? "brand-grad" : "bg-white/15"}`}>
                {done && <Check className="h-2.5 w-2.5 text-black" />}
              </span>
              <p className={`text-[12.5px] font-semibold ${current ? m.tone : done ? "text-white/80" : "text-white/40"}`}>{m.label}</p>
              {current && <p className="text-[10.5px] text-white/40">Current status</p>}
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">From</p>
          <p className="text-[13px] font-semibold">{s.sender_name}</p>
          <p className="text-[11px] text-white/40">{s.sender_address || "—"}</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">To</p>
          <p className="text-[13px] font-semibold">{s.recipient_name}</p>
          <p className="text-[11px] text-white/40">{s.recipient_address}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-white/45">
        <span className="flex items-center gap-1.5"><Boxes className="h-3.5 w-3.5" /> {s.service}</span>
        <span className="flex items-center gap-1.5"><Weight className="h-3.5 w-3.5" /> {s.weight_kg} kg</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ETA {s.estimated_delivery}</span>
      </div>
      {s.notes && <p className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-[12px] text-white/60">{s.notes}</p>}
    </div>
  );
}