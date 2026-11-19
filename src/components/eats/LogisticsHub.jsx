import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Truck, PackageCheck, ChefHat, Bike, MapPin, Phone, Clock, ArrowRight, ShoppingBag, Star, Loader2, Navigation,
} from "lucide-react";
import DeliveryMap from "@/components/eats/DeliveryMap";

const STEPS = [
  { key: "placed", label: "Confirmed", icon: PackageCheck },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "on_the_way", label: "On the way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const COURIERS = [
  { name: "Marcus D.", rating: 4.9, vehicle: "Honda Civic · Silver", plate: "BXK 248", phone: "+1 (416) 555-0142" },
  { name: "Aisha R.", rating: 4.8, vehicle: "Toyota Prius · Black", plate: "CPT 771", phone: "+1 (416) 555-0187" },
  { name: "Jonas P.", rating: 5.0, vehicle: "E-Bike · Blue", plate: "BIKE 19", phone: "+1 (647) 555-0110" },
  { name: "Priya S.", rating: 4.9, vehicle: "Hyundai Elantra · White", plate: "AKR 530", phone: "+1 (647) 555-0164" },
];

const TOTAL_MIN = 34;

const hashOf = (str = "") => {
  let h = 7;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
};

const courierFor = (id) => COURIERS[hashOf(id || "x") % COURIERS.length];
const stepIndex = (status) => Math.max(0, STEPS.findIndex((s) => s.key === status));
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

function useTick() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className={`rounded-2xl border p-3 ${tone}`}>
      <Icon className="w-4 h-4 mb-1.5 opacity-80" />
      <p className="text-xl font-black leading-none tabular-nums">{value}</p>
      <p className="text-[10.5px] uppercase tracking-wide opacity-70 mt-1">{label}</p>
    </div>
  );
}

function EtaClock({ order, now }) {
  if (order.status === "delivered") return <span className="text-emerald-300">Delivered</span>;
  const target = new Date(order.created_date || Date.now()).getTime() + TOTAL_MIN * 60000;
  const left = Math.max(0, target - now);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <span className="tabular-nums">
      {m}:{String(s).padStart(2, "0")} <span className="text-[10px] opacity-60">left</span>
    </span>
  );
}

function TrackingCard({ order, onAdvance, busy }) {
  const now = useTick();
  const idx = stepIndex(order.status);
  const courier = useMemo(() => courierFor(order.id), [order.id]);
  const delivered = order.status === "delivered";
  const items = order.items || [];
  const progress = (idx / (STEPS.length - 1)) * 100;
  const nextKey = STEPS[Math.min(idx + 1, STEPS.length - 1)].key;

  return (
    <div className="rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-4 shadow-[0_24px_60px_-40px_rgba(16,185,129,0.9)]">
      <div className="flex items-start gap-3">
        <span className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${delivered ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white animate-pulse"}`}>
          <Truck className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold truncate">{order.restaurant_name}</p>
          <p className="text-[11px] text-white/55 truncate">
            {items.length || 0} item{items.length === 1 ? "" : "s"} · {money(order.total)} · {order.delivery_address || "Delivery address saved at checkout"}
          </p>
        </div>
        <span className="text-sm font-black text-emerald-300 shrink-0 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> <EtaClock order={order} now={now} />
        </span>
      </div>

      <div className="relative mt-5 mb-1">
        <div className="absolute left-0 right-0 top-3.5 h-[3px] rounded-full bg-white/10" />
        <div className="absolute left-0 top-3.5 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-700" style={{ width: `${progress}%` }} />
        <div className="relative flex justify-between">
          {STEPS.map((s, i) => {
            const done = i <= idx;
            return (
              <div key={s.key} className="flex flex-col items-center gap-1.5 w-1/4">
                <span className={`w-8 h-8 rounded-full grid place-items-center border transition-all ${done ? "bg-emerald-400 text-black border-emerald-300 shadow-[0_0_18px_-4px_rgba(52,211,153,0.9)]" : "bg-[#1a1327] text-white/40 border-white/15"}`}>
                  <s.icon className="w-4 h-4" />
                </span>
                <span className={`text-[10px] font-semibold text-center ${done ? "text-white" : "text-white/40"}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <DeliveryMap address={order.delivery_address} progress={delivered ? 1 : 0.12 + idx * 0.3} height="h-40" />
      </div>

      <div className="mt-2.5 rounded-2xl bg-black/25 border border-white/10 p-2.5 flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 grid place-items-center shrink-0 text-xs font-black">
          {courier.name.split(" ")[0][0]}
          {courier.name.split(" ")[1]?.[0] || ""}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold truncate flex items-center gap-1">
            {courier.name} <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> {courier.rating}
          </p>
          <p className="text-[10.5px] text-white/50 truncate">{courier.vehicle} · {courier.plate}</p>
        </div>
        <a href={`tel:${courier.phone.replace(/[^\d+]/g, "")}`} className="w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white/20" title="Call courier">
          <Phone className="w-3.5 h-3.5" />
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address || order.restaurant_name)}`}
          target="_blank"
          rel="noreferrer"
          className="w-8 h-8 rounded-full bg-white/10 grid place-items-center hover:bg-white/20"
          title="Track on map"
        >
          <Navigation className="w-3.5 h-3.5" />
        </a>
      </div>

      {items.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {items.slice(0, 6).map((it, i) => (
            <span key={`${it.name}-${i}`} className="px-2 py-1 rounded-full bg-white/[0.07] border border-white/10 text-[10.5px] text-white/70">
              {it.quantity || 1}× {it.name}
            </span>
          ))}
        </div>
      )}

      {!delivered && (
        <button
          onClick={() => onAdvance(order, nextKey)}
          disabled={busy}
          className="mt-3 w-full py-2.5 rounded-full bg-emerald-400 text-black text-[12.5px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 hover:brightness-105"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Mark as {STEPS[idx + 1]?.label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export default function LogisticsHub({ onBrowse, onChanged }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setOrders(await base44.entities.Order.list("-created_date", 25));
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.Order.subscribe(() => load());
    return unsubscribe;
  }, []);

  const advance = async (order, status) => {
    setBusyId(order.id);
    try {
      await base44.entities.Order.update(order.id, { status });
      await load();
      onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  const active = orders.filter((o) => o.status !== "delivered");
  const delivered = orders.filter((o) => o.status === "delivered");
  const spent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  if (loading) {
    return (
      <div className="px-4 py-16 grid place-items-center text-white/60">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 space-y-5">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-300" /> Logistics</h2>
        <p className="text-[11.5px] text-white/50 mt-0.5">Live tracking for every food delivery, from kitchen to door.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric icon={Bike} label="In transit" value={active.length} tone="border-emerald-400/25 bg-emerald-500/10 text-emerald-200" />
        <Metric icon={PackageCheck} label="Delivered" value={delivered.length} tone="border-white/12 bg-white/[0.06] text-white" />
        <Metric icon={ShoppingBag} label="Total spent" value={money(spent)} tone="border-white/12 bg-white/[0.06] text-white" />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/20 p-8 text-center">
          <Truck className="w-9 h-9 mx-auto mb-2 text-white/40" />
          <p className="font-semibold">No deliveries yet</p>
          <p className="text-xs text-white/50 mt-1">Place a food order and it shows up here with live tracking.</p>
          <button onClick={onBrowse} className="mt-3 px-4 py-2 rounded-full bg-emerald-400 text-black text-xs font-bold">Browse restaurants</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-white/45">Active deliveries</h3>
              {active.map((o) => (
                <TrackingCard key={o.id} order={o} onAdvance={advance} busy={busyId === o.id} />
              ))}
            </section>
          )}

          {delivered.length > 0 && (
            <section>
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-white/45 mb-2">Delivered</h3>
              <div className="space-y-1.5">
                {delivered.map((o) => {
                  const c = courierFor(o.id);
                  return (
                    <div key={o.id} className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2.5">
                      <span className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-300 grid place-items-center shrink-0"><PackageCheck className="w-4 h-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold truncate">{o.restaurant_name}</p>
                        <p className="text-[10.5px] text-white/45 truncate">
                          {(o.items || []).length} items · {c.name} · {new Date(o.updated_date || o.created_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="text-[12.5px] font-bold shrink-0">{money(o.total)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}