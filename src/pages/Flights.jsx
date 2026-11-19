import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plane, MapPin, Search, Loader2, CalendarDays, Users, ArrowRightLeft, Check } from "lucide-react";
import { AIRPORTS, distanceKm, airportByCode } from "@/lib/airports";
import FlightCard from "@/components/flights/FlightCard";
import BookFlightDialog from "@/components/flights/BookFlightDialog";

const CABINS = ["Economy", "Premium economy", "Business", "First"];
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export default function Flights() {
  const [nearby, setNearby] = useState(AIRPORTS.slice(0, 6));
  const [locating, setLocating] = useState(false);
  const [from, setFrom] = useState("YYZ");
  const [to, setTo] = useState("JFK");
  const [date, setDate] = useState(inDays(7));
  const [passengers, setPassengers] = useState(1);
  const [cabin, setCabin] = useState("Economy");
  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [bookings, setBookings] = useState([]);

  const fromAirport = airportByCode(from);
  const toAirport = airportByCode(to);

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
        setFrom(sorted[0].code);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const swap = () => { setFrom(to); setTo(from); };

  const search = async (e) => {
    e?.preventDefault();
    if (from === to) { setError("Pick two different airports."); return; }
    setLoading(true);
    setError("");
    setFlights([]);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `List 6 realistic one-way flight options from ${fromAirport.city} (${fromAirport.code}) to ${toAirport.city} (${toAirport.code}) on ${date}, ${passengers} passenger(s), ${cabin} cabin.
Use live web context for airlines that actually fly this route and typical current fares in USD per passenger.
Times should be local to each airport. Return the cheapest useful spread of departures (morning to evening).`,
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
      setSearched({ from: fromAirport, to: toAirport, date, passengers, cabin });
      if (!res?.flights?.length) setError("No flights came back — try another date or route.");
    } catch (err) {
      setError("Flight search is unavailable right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const airportOptions = useMemo(() => AIRPORTS, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-5 pb-28">
      <header className="mb-5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">Fly from where you are</p>
        <h1 className="text-2xl sm:text-3xl font-black font-display flex items-center gap-2 mt-1">
          <Plane className="w-6 h-6 text-cyan-300" /> Flights
        </h1>
        <p className="text-sm text-neutral-400 mt-1">Find airports near you, compare fares and book in one step.</p>
      </header>

      <form onSubmit={search} className="rounded-2xl border border-white/10 bg-white/[.04] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <button type="button" onClick={findNearby} className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 hover:text-cyan-200">
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />} {locating ? "Finding airports…" : "Find airports near me"}
          </button>
          <span className="text-[11px] text-neutral-500">{nearby.slice(0, 3).map((a) => a.code).join(" · ")} near you</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">From</span>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#170f26] px-3 py-2.5 text-sm outline-none">
              {airportOptions.map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code}) — {a.name}</option>)}
            </select>
          </label>
          <button type="button" onClick={swap} title="Swap" className="mt-4 mx-auto w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">To</span>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#170f26] px-3 py-2.5 text-sm outline-none">
              {airportOptions.map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code}) — {a.name}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-2.5 py-2.5 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Guests</span>
            <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-white/10 bg-[#170f26] px-2.5 py-2.5 text-sm outline-none">
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500">Cabin</span>
            <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#170f26] px-2.5 py-2.5 text-sm outline-none">
              {CABINS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching live fares…</> : <><Search className="w-4 h-4" /> Search flights</>}
        </button>
      </form>

      {error && <p className="text-sm text-amber-300 mt-3">{error}</p>}

      {flights.length > 0 && searched && (
        <section className="mt-5">
          <h2 className="text-sm font-bold text-neutral-300 mb-2">
            {searched.from.code} → {searched.to.code} · {searched.date} · {searched.passengers} passenger{searched.passengers > 1 ? "s" : ""}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {flights.map((f, i) => (
              <FlightCard key={`${f.flight_number}-${i}`} flight={{ ...f, from_code: searched.from.code, to_code: searched.to.code }} index={i} cabin={searched.cabin} onSelect={(fl) => setSelected(fl)} />
            ))}
          </div>
        </section>
      )}

      {bookings.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-300 mb-3 flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-cyan-300" /> Your flights</h2>
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3">
                <Plane className="w-4 h-4 text-cyan-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{b.from_code} → {b.to_code} · {b.airline} {b.flight_number}</p>
                  <p className="text-[11px] text-neutral-400">{b.date} · {b.depart_time}–{b.arrive_time} · {b.passengers} pax · ref {b.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${Number(b.price).toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end"><Check className="w-3 h-3" /> {b.status}</p>
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