import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, Plane, Check } from "lucide-react";

const reference = () => "SI" + Math.random().toString(36).slice(2, 7).toUpperCase();

export default function BookFlightDialog({ flight, search, onClose, onBooked }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const total = Number(flight.price) * search.passengers;

  const confirm = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Add the passenger name."); return; }
    setSaving(true);
    setError("");
    try {
      const record = await base44.entities.FlightBooking.create({
        airline: flight.airline,
        flight_number: flight.flight_number,
        from_code: search.from.code,
        from_city: search.from.city,
        to_code: search.to.code,
        to_city: search.to.city,
        depart_time: flight.depart_time,
        arrive_time: flight.arrive_time,
        duration: flight.duration,
        stops: Number(flight.stops) || 0,
        cabin: search.cabin,
        date: search.date,
        passengers: search.passengers,
        price: total,
        passenger_name: name.trim(),
        passenger_email: email.trim(),
        reference: reference(),
        status: "confirmed",
      });
      onBooked(record);
    } catch (err) {
      setError("Could not confirm that booking. Try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3">
      <form onSubmit={confirm} className="w-full max-w-md rounded-2xl bg-[#1b1633] border border-white/15 p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Confirm flight</p>
            <h2 className="text-lg font-bold flex items-center gap-2 mt-0.5"><Plane className="w-4 h-4 text-cyan-300" /> {flight.airline} {flight.flight_number}</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm space-y-1">
          <p>{search.from.code} → {search.to.code} · {search.date}</p>
          <p className="text-neutral-400 text-xs">{flight.depart_time} – {flight.arrive_time} · {search.cabin} · {search.passengers} passenger{search.passengers > 1 ? "s" : ""}</p>
          <p className="text-lg font-black pt-1">${total.toFixed(2)}</p>
        </div>

        <div className="mt-3 space-y-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Passenger full name" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email for the ticket (optional)" className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-cyan-400" />
        </div>

        {error && <p className="text-xs text-rose-300 mt-2">{error}</p>}

        <button type="submit" disabled={saving} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</> : <><Check className="w-4 h-4" /> Book this flight</>}
        </button>
        <p className="text-[10px] text-neutral-500 text-center mt-2">Demo booking — no card is charged.</p>
      </form>
    </div>
  );
}