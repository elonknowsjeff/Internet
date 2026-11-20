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

function Metric({ icon: Icon, label, value, accent }) {
  return (
    <div className="panel p-3">
      <Icon className="mb-1.5 h-4 w-4" style={accent ? { color: "var(--brand)" } : undefined} />
      <p className="text-[20px] font-black leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-white/40">{label}</p>
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
      {m}:{String(s).padStart(2, "0")} <span className="text-[10px] text-white/40">left</span>
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
    <div className="panel p-5">
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${delivered ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-white"}`}>
          <Truck className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold">{order.restaurant_name}</p>
          <p className="truncate text-[11px] text-white/45">
            {items.length || 0} item{items.length === 1 ? "" : "s"} · {money(order.total)} · {order.delivery_address || "Delivery address saved at checkout"}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-emerald-300">
          <Clock className="h-3.5 w-3.5" /> <EtaClock order={order} now={now} />
        </span>
      </div>

      <div className="relative mt-5 mb-1">
        <div className="absolute left-0 right-0 top-3.5 h-[3px] rounded-full bg-white/10" />
        <div className="absolute left-0 top-3.5 h-[3px] rounded-full brand-grad transition-all duration-700" style={{ width: `${progress}%` }} />
        <div className="relative flex justify-between">
          {STEPS.map((s, i) => {
            const done = i <= idx;
            return (
              <div key={s.key} className="flex w-1/4 flex-col items-center gap-1.5">
                <span className={`grid h-8 w-8 place-items-center rounded-full border transition-all ${done ? "brand-grad border-transparent text-black" : "border-white/15 bg-white/[0.03] text-white/40"}`}>
                  <s.icon className="h-4 w-4" />
                </span>
                <span className={`text-center text-[10px] font-semibold ${done ? "text-white" : "text-white/40"}`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <DeliveryMap address={order.delivery_address} progress={delivered ? 1 : 0.12 + idx * 0.3} height="h-40" />
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[11px] font-black text-emerald-300">
          {courier.name.split(" ")[0][0]}
          {courier.name.split(" ")[1]?.[0] || ""}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-[12.5px] font-semibold">
            {courier.name} <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> {courier.rating}
          </p>
          <p className="truncate text-[10.5px] text-white/40">{courier.vehicle} · {courier.plate}</p>
        </div>
        <a href={`tel:${courier.phone.replace(/[^\d+]/g, "")}`} className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] hover:bg-white/15" title="Call courier">
          <Phone className="h-3.5 w-3.5" />
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address || order.restaurant_name)}`}
          target="_blank"
          rel="noreferrer"
          className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] hover:bg-white/15"
          title="Track on map"
        >
          <Navigation className="h-3.5 w-3.5" />
        </a>
      </div>

      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {items.slice(0, 6).map((it, i) => (
            <span key={`${it.name}-${i}`} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10.5px] text-white/65">
              {it.quantity || 1}× {it.name}
            </span>
          ))}
        </div>
      )}

      {!delivered && (
        <button
          onClick={() => onAdvance(order, nextKey)}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full brand-grad py-2.5 text-[12.5px] font-bold text-black disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
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
      <div className="grid place-items-center px-4 py-16 text-white/50">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 pt-4">
      <div>
        <h2 className="flex items-center gap-2 text-[16px] font-bold"><Truck className="h-4 w-4" style={{ color: "var(--brand)" }} /> Delivery tracking</h2>
        <p className="mt-0.5 text-[11.5px] text-white/45">Live tracking for every food delivery, from kitchen to door.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric icon={Bike} label="In transit" value={active.length} accent />
        <Metric icon={PackageCheck} label="Delivered" value={delivered.length} />
        <Metric icon={ShoppingBag} label="Total spent" value={money(spent)} />
      </div>

      {orders.length === 0 ? (
        <div className="panel py-10 text-center">
          <Truck className="mx-auto mb-2 h-9 w-9 text-white/30" />
          <p className="text-[13px] font-semibold">No deliveries yet</p>
          <p className="mt-1 text-[12px] text-white/45">Place a food order and it shows up here with live tracking.</p>
          <button onClick={onBrowse} className="mt-3 rounded-full brand-grad px-4 py-2 text-[12px] font-bold text-black">Browse restaurants</button>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[12px] font-bold uppercase tracking-wide text-white/40">Active deliveries</h3>
              {active.map((o) => (
                <TrackingCard key={o.id} order={o} onAdvance={advance} busy={busyId === o.id} />
              ))}
            </section>
          )}

          {delivered.length > 0 && (
            <section>
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-white/40">Delivered</h3>
              <div className="space-y-2">
                {delivered.map((o) => {
                  const c = courierFor(o.id);
                  return (
                    <div key={o.id} className="panel flex items-center gap-3 px-3.5 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-300"><PackageCheck className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">{o.restaurant_name}</p>
                        <p className="truncate text-[10.5px] text-white/40">
                          {(o.items || []).length} items · {c.name} · {new Date(o.updated_date || o.created_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12.5px] font-bold">{money(o.total)}</span>
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