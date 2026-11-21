import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plane, MapPin, Search, Loader2, CalendarDays, Check, ArrowRightLeft } from "lucide-react";
import { AIRPORTS, distanceKm, airportByCode } from "@/lib/airports";
import FlightCard from "@/components/flights/FlightCard";
import BookFlightDialog from "@/components/flights/BookFlightDialog";

const CABINS = ["Economy", "Premium economy", "Business", "First"];
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const resolvePlace = (s) => {
  const t = (s || "").trim();
  if (!t) return null;
  const byCode = airportByCode(t.toUpperCase());
  if (byCode) return { code: byCode.code, city: byCode.city };
  const byCity = AIRPORTS.find((a) => a.city.toLowerCase() === t.toLowerCase());
  if (byCity) return { code: byCity.code, city: byCity.city };
  return { code: t.toUpperCase().slice(0, 3), city: t };
};

export default function Flights() {
  const [nearby, setNearby] = useState(AIRPORTS.slice(0, 6));
  const [locating, setLocating] = useState(false);
  const [from, setFrom] = useState("Toronto");
  const [to, setTo] = useState("New York");
  const [date, setDate] = useState(inDays(7));
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState("Economy");
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      const res = await base44.entities.FlightBooking.list("-created_date", 5);
      setBookings(Array.isArray(res) ? res : res?.items || []);
    } catch { setBookings([]); }
  };

  useEffect(() => { loadBookings(); }, []);

  const findNearby = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const sorted = [...AIRPORTS].sort((a, b) => distanceKm(here, a) - distanceKm(here, b)).slice(0, 6);
        setNearby(sorted);
        setFrom(sorted[0].city);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const swap = () => { setFrom(to); setTo(from); };

  const search = async (e) => {
    e?.preventDefault();
    const fromPlace = resolvePlace(from);
    const toPlace = resolvePlace(to);
    if (!fromPlace || !toPlace) { setError("Enter where you're flying from and to."); return; }
    if (fromPlace.city.toLowerCase() === toPlace.city.toLowerCase()) { setError("Pick two different places."); return; }
    setLoading(true);
    setError("");
    setFlights([]);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `List 6 realistic one-way flight options from ${fromPlace.city}${fromPlace.code ? ` (${fromPlace.code})` : ""} to ${toPlace.city}${toPlace.code ? ` (${toPlace.code})` : ""} on ${date}, ${passengers} passenger(s), ${cabin} cabin.
Use live web context for airlines that actually serve this route and typical current fares in USD per passenger.
Times should be local to each airport. Return the cheapest useful spread of departures (morning to evening). If the cities have multiple airports, pick the main one.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            flights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  airline: { type: "string" },
                  flight_number: { type: "string" },
                  depart_time: { type: "string" },
                  arrive_time: { type: "string" },
                  duration: { type: "string" },
                  stops: { type: "number" },
                  price: { type: "number" },
                },
              },
            },
          },
        },
      });
      setFlights(res?.flights || []);
      setSearched({ from: fromPlace, to: toPlace, date, passengers, cabin });
      if (!res?.flights?.length) setError("No flights came back — try another date or route.");
    } catch (err) {
      setError("Flight search is unavailable right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const dataListOpts = useMemo(() => AIRPORTS.map((a) => `${a.city} (${a.code})`).sort(), []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-28">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--brand)" }}>Fly anywhere, your way</p>
        <h1 className="mt-1.5 flex items-center gap-2.5 text-3xl font-black font-display sm:text-4xl">
          <span className="grid h-11 w-11 place-items-center rounded-2xl brand-grad text-black"><Plane className="h-6 w-6" /></span>
          Flights
        </h1>
        <p className="mt-2 text-sm text-white/55">Search any city or airport in the world, compare fares and book in one step.</p>
      </header>

      <form onSubmit={search} className="ig-panel space-y-3.5 rounded-3xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <button type="button" onClick={findNearby} className="flex items-center gap-1.5 text-[12px] font-semibold hover:opacity-80" style={{ color: "var(--brand)" }}>
            {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />} {locating ? "Finding airports…" : "Find airports near me"}
          </button>
          <span className="text-[11px] text-white/40">{nearby.slice(0, 3).map((a) => `${a.city} (${a.code})`).join(" · ")} near you</span>
        </div>

        <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-white/45">From</span>
            <input list="airport-opts" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="City or airport" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none focus:border-[color:var(--brand)]" />
          </label>
          <button type="button" onClick={swap} title="Swap" className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20">
            <ArrowRightLeft className="h-4 w-4" />
          </button>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-white/45">To</span>
            <input list="airport-opts" value={to} onChange={(e) => setTo(e.target.value)} placeholder="City or airport" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none focus:border-[color:var(--brand)]" />
          </label>
        </div>
        <datalist id="airport-opts">
          {dataListOpts.map((o) => <option key={o} value={o} />)}
        </datalist>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-white/45">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none focus:border-[color:var(--brand)]" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-white/45">Guests</span>
            <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-white/45">Cabin</span>
            <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm outline-none">
              {CABINS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl brand-grad py-3.5 text-sm font-bold text-black disabled:opacity-60">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching live fares…</> : <><Search className="h-4 w-4" /> Search flights</>}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-amber-300">{error}</p>}

      {flights.length > 0 && searched && (
        <section className="mt-7">
          <h2 className="mb-3 text-sm font-bold text-white/70">
            {searched.from.code} · {searched.from.city} → {searched.to.code} · {searched.to.city} · {searched.date} · {searched.passengers} passenger{searched.passengers > 1 ? "s" : ""}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {flights.map((f, i) => (
              <FlightCard key={`${f.flight_number}-${i}`} flight={{ ...f, from_code: searched.from.code, to_code: searched.to.code }} index={i} cabin={searched.cabin} onSelect={(fl) => setSelected(fl)} />
            ))}
          </div>
        </section>
      )}

      {bookings.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-white/70"><CalendarDays className="h-4 w-4" style={{ color: "var(--brand)" }} /> Your flights</h2>
          <div className="space-y-2.5">
            {bookings.map((b) => (
              <div key={b.id} className="ig-panel flex items-center gap-3 rounded-2xl p-3.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06]"><Plane className="h-4 w-4" style={{ color: "var(--brand)" }} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{b.from_code} → {b.to_code} · {b.airline} {b.flight_number}</p>
                  <p className="text-[11px] text-white/45">{b.date} · {b.depart_time}–{b.arrive_time} · {b.passengers} pax · ref {b.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${Number(b.price).toFixed(2)}</p>
                  <p className="flex items-center justify-end gap-1 text-[10px] text-emerald-400"><Check className="h-3 w-3" /> {b.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {selected && searched && (
        <BookFlightDialog
          flight={selected}
          search={searched}
          onClose={() => setSelected(null)}
          onBooked={() => { setSelected(null); loadBookings(); }}
        />
      )}
    </div>
  );
}