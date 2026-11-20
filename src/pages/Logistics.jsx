import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Truck, Package, Search, Plus, X, Loader2, MapPin, Clock, Check, Weight, Boxes, PackageCheck, ArrowRight } from "lucide-react";

const SERVICES = [
  { key: "Standard", eta: "3-5 days", perKg: 4.5, icon: Boxes },
  { key: "Express", eta: "1-2 days", perKg: 9.5, icon: Truck },
  { key: "Same Day", eta: "Today", perKg: 18, icon: PackageCheck },
  { key: "Freight", eta: "5-7 days", perKg: 2.8, icon: Truck },
];

const STATUS_FLOW = ["label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"];
const STATUS_META = {
  label_created: { label: "Label created", color: "text-neutral-300", bg: "bg-white/10" },
  picked_up: { label: "Picked up", color: "text-sky-400", bg: "bg-sky-500/15" },
  in_transit: { label: "In transit", color: "text-indigo-400", bg: "bg-indigo-500/15" },
  out_for_delivery: { label: "Out for delivery", color: "text-amber-400", bg: "bg-amber-500/15" },
  delivered: { label: "Delivered", color: "text-emerald-400", bg: "bg-emerald-500/15" },
};

const genTracking = () => "VAL" + Math.random().toString(36).slice(2, 8).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function Logistics() {
  const [view, setView] = useState("track");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState("");
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    sender_name: "",
    sender_address: "",
    recipient_name: "",
    recipient_address: "",
    service: "Standard",
    weight_kg: 1,
    notes: "",
  });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Shipment.list("-created_date", 50);
      setShipments(Array.isArray(data) ? data : data?.items || []);
    } catch {
      setShipments([]);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // live status progression for active shipments
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
    setSearching(true);
    setFound(null);
    try {
      const data = await base44.entities.Shipment.filter({ tracking_number: num.trim() }, { limit: 1 });
      const list = Array.isArray(data) ? data : data?.items || [];
      setFound(list[0] || null);
    } catch {
      setFound(null);
    }
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
      const rec = await base44.entities.Shipment.create({
        ...form,
        tracking_number: genTracking(),
        cost,
        status: "label_created",
        estimated_delivery: addDays(etaDays),
      });
      setCreated(rec);
      setForm({ sender_name: "", sender_address: "", recipient_name: "", recipient_address: "", service: "Standard", weight_kg: 1, notes: "" });
      load();
    } catch {}
    setCreating(false);
  };

  return (
    <div className="px-4 py-5 pb-28">
      <header className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-sky-300">Shipping & freight</p>
        <h1 className="text-2xl sm:text-3xl font-black font-display flex items-center gap-2 mt-1">
          <Truck className="w-6 h-6 text-sky-300" /> Logistics
        </h1>
        <p className="text-sm text-neutral-400 mt-1">Ship parcels, print labels and track every package in real time.</p>
      </header>

      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.04] p-1 mb-4 w-full sm:w-auto sm:inline-flex">
        {[
          { k: "track", l: "Track", icon: Search },
          { k: "create", l: "New shipment", icon: Plus },
          { k: "all", l: "My shipments", icon: Package },
        ].map(({ k, l, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setView(k)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${view === k ? "bg-white text-black" : "text-neutral-300 hover:bg-white/10"}`}
          >
            <Icon className="w-4 h-4" /> {l}
          </button>
        ))}
      </div>

      {view === "track" && (
        <div className="max-w-xl">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 mb-4">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && trackingInput.trim() && trackByNumber(trackingInput)}
              placeholder="Enter a tracking number (e.g. VALAB12CD3456)"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {trackingInput && <button onClick={() => { setTrackingInput(""); setFound(null); }} className="text-neutral-500 hover:text-white"><X className="w-4 h-4" /></button>}
            <button onClick={() => trackingInput.trim() && trackByNumber(trackingInput)} disabled={!trackingInput.trim() || searching} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold disabled:opacity-40">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track"}
            </button>
          </div>

          {found === null && searching && (
            <p className="text-center text-neutral-500 py-6 text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Searching…</p>
          )}
          {found === null && !searching && trackingInput && (
            <p className="text-center text-neutral-500 py-6 text-sm">No shipment with that tracking number. Create one in the New shipment tab.</p>
          )}
          {found && <ShipmentDetail s={found} />}
        </div>
      )}

      {view === "create" && (
        <div className="max-w-xl">
          {created && (
            <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm">Shipment created!</p>
                <p className="text-xs text-neutral-300 mt-0.5">Tracking number: <span className="font-mono font-bold text-emerald-300">{created.tracking_number}</span></p>
                <button onClick={() => { setView("track"); setTrackingInput(created.tracking_number); trackByNumber(created.tracking_number); setCreated(null); }} className="mt-2 text-xs font-semibold text-emerald-300 hover:underline">Track it now →</button>
              </div>
              <button onClick={() => setCreated(null)} className="text-neutral-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          )}
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4 space-y-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-2 font-semibold">From</p>
              <input value={form.sender_name} onChange={(e) => setForm({ ...form, sender_name: e.target.value })} placeholder="Sender name" className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm outline-none focus:border-sky-400/50 mb-2" />
              <input value={form.sender_address} onChange={(e) => setForm({ ...form, sender_address: e.target.value })} placeholder="Pickup address" className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm outline-none focus:border-sky-400/50" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-2 font-semibold">To</p>
              <input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} placeholder="Recipient name" className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm outline-none focus:border-sky-400/50 mb-2" />
              <input value={form.recipient_address} onChange={(e) => setForm({ ...form, recipient_address: e.target.value })} placeholder="Delivery address" className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm outline-none focus:border-sky-400/50" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-neutral-400 mb-2 font-semibold">Service</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((s) => {
                  const Icon = s.icon;
                  const active = form.service === s.key;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setForm({ ...form, service: s.key })}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${active ? "border-sky-400 bg-sky-500/15" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-sky-300" : "text-neutral-400"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-bold">{s.key}</p>
                        <p className="text-[10px] text-neutral-400">{s.eta} · ${s.perKg}/kg</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 flex-1">
                <Weight className="w-4 h-4 text-neutral-500" />
                <input type="number" min="0.1" step="0.1" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })} className="flex-1 bg-transparent outline-none text-sm w-full" />
                <span className="text-[11px] text-neutral-500">kg</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm font-bold text-sky-300">
                ${(form.weight_kg * (SERVICES.find((s) => s.key === form.service)?.perKg || 0) + 3.5).toFixed(2)}
              </div>
            </div>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-sm outline-none focus:border-sky-400/50" />
            <button
              onClick={createShipment}
              disabled={creating || !form.recipient_name.trim() || !form.recipient_address.trim() || !form.sender_name.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating label…</> : <><Plus className="w-4 h-4" /> Create shipment</>}
            </button>
          </div>
        </div>
      )}

      {view === "all" && (
        <div>
          {loading ? (
            <div className="py-16 text-center text-neutral-500 flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin" /> Loading shipments…</div>
          ) : shipments.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No shipments yet. Create one in the New shipment tab.</p>
          ) : (
            <div className="space-y-3">
              {shipments.map((s) => (
                <ShipmentRow key={s.id} s={s} onClick={() => { setView("track"); setTrackingInput(s.tracking_number); setFound(s); }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShipmentRow({ s, onClick }) {
  const meta = STATUS_META[s.status] || STATUS_META.label_created;
  return (
    <button onClick={onClick} className="w-full text-left rounded-2xl border border-white/10 bg-white/[.03] hover:border-sky-400/40 transition p-3.5 flex items-center gap-3">
      <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center shrink-0"><Package className="w-5 h-5 text-sky-300" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-mono font-bold text-xs text-sky-300">{s.tracking_number}</p>
        <p className="text-sm font-semibold truncate mt-0.5">{s.recipient_name}</p>
        <p className="text-[11px] text-neutral-400 truncate flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.recipient_address}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
        <p className="text-[11px] text-neutral-400 mt-1">{s.service} · {s.weight_kg}kg</p>
        <p className="text-sm font-bold mt-0.5">${s.cost?.toFixed(2)}</p>
      </div>
    </button>
  );
}

function ShipmentDetail({ s }) {
  const meta = STATUS_META[s.status] || STATUS_META.label_created;
  const stepIdx = STATUS_FLOW.indexOf(s.status);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono font-bold text-sky-300">{s.tracking_number}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color} mt-1 inline-block`}>{meta.label}</span>
        </div>
        <p className="font-bold text-lg">${s.cost?.toFixed(2)}</p>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5">
          {STATUS_FLOW.map((st, idx) => (
            <React.Fragment key={st}>
              <span className={`w-3 h-3 rounded-full grid place-items-center ${idx <= stepIdx ? "bg-sky-500" : "bg-white/15"}`}>
                {idx <= stepIdx && <Check className="w-2 h-2 text-white" />}
              </span>
              {idx < STATUS_FLOW.length - 1 && <span className={`flex-1 h-0.5 rounded ${idx < stepIdx ? "bg-sky-500" : "bg-white/10"}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[9px] text-neutral-400">
          {STATUS_FLOW.map((st) => <span key={st} className="flex-1 text-center first:text-left last:text-right">{STATUS_META[st].label}</span>)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-white/10 bg-white/[.02] p-3">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">From</p>
          <p className="font-semibold">{s.sender_name}</p>
          <p className="text-[11px] text-neutral-400">{s.sender_address || "—"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.02] p-3">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">To</p>
          <p className="font-semibold">{s.recipient_name}</p>
          <p className="text-[11px] text-neutral-400">{s.recipient_address}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[12px] text-neutral-400">
        <span className="flex items-center gap-1"><Boxes className="w-3.5 h-3.5" /> {s.service}</span>
        <span className="flex items-center gap-1"><Weight className="w-3.5 h-3.5" /> {s.weight_kg} kg</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ETA {s.estimated_delivery}</span>
      </div>
      {s.notes && <p className="mt-3 text-[12px] text-neutral-300 rounded-xl bg-white/[.03] border border-white/10 p-2.5">{s.notes}</p>}
    </div>
  );
}