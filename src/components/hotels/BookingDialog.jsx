import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { differenceInCalendarDays, format } from "date-fns";
import { X, Loader2, Check } from "lucide-react";

const today = new Date();
const iso = (d) => format(d, "yyyy-MM-dd");
const plus = (days) => iso(new Date(today.getTime() + days * 86400000));

export default function BookingDialog({ hotel, onClose, onDone }) {
  const [checkIn, setCheckIn] = useState(plus(1));
  const [checkOut, setCheckOut] = useState(plus(3));
  const [guests, setGuests] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const nights = Math.max(0, differenceInCalendarDays(new Date(checkOut), new Date(checkIn)));
  const total = nights * hotel.price_per_night;

  const book = async (e) => {
    e.preventDefault();
    if (nights < 1) { setError("Check-out must be after check-in."); return; }
    setSaving(true);
    setError("");
    try {
      const user = await base44.auth.me().catch(() => null);
      const booking = await base44.entities.HotelBooking.create({
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        city: hotel.city,
        image: hotel.image,
        check_in: checkIn,
        check_out: checkOut,
        nights,
        guests: Number(guests),
        total: Number(total.toFixed(2)),
        guest_name: user?.full_name || "Guest",
        status: "confirmed",
        reference: "WZ-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      });
      setDone(booking);
      onDone?.();
    } catch (err) {
      setError(err?.message || "Could not complete the booking.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/12 bg-neutral-950 overflow-hidden">
        <div className="relative h-28">
          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent" />
          <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-4">
            <p className="font-bold leading-tight">{hotel.name}</p>
            <p className="text-[11px] text-neutral-300">{hotel.city}</p>
          </div>
        </div>

        {done ? (
          <div className="p-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">Booking confirmed</h3>
            <p className="text-sm text-neutral-400 mt-1">
              {done.hotel_name} · {format(new Date(done.check_in), "d MMM")} – {format(new Date(done.check_out), "d MMM")} · {done.nights} night{done.nights > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-neutral-500 mt-1">Reference {done.reference}</p>
            <p className="text-2xl font-black mt-3">${done.total?.toFixed(2)}</p>
            <button onClick={onClose} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm">Done</button>
          </div>
        ) : (
          <form onSubmit={book} className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] text-neutral-400">
                Check in
                <input type="date" value={checkIn} min={iso(today)} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-violet-400" />
              </label>
              <label className="text-[11px] text-neutral-400">
                Check out
                <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-violet-400" />
              </label>
            </div>
            <label className="text-[11px] text-neutral-400 block">
              Guests
              <input type="number" min={1} max={8} value={guests} onChange={(e) => setGuests(e.target.value)} className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-violet-400" />
            </label>

            <div className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm space-y-1">
              <p className="flex justify-between"><span className="text-neutral-400">${hotel.price_per_night} × {nights} night{nights === 1 ? "" : "s"}</span><span>${(hotel.price_per_night * nights).toFixed(2)}</span></p>
              <p className="flex justify-between"><span className="text-neutral-400">Taxes & fees</span><span>${(total * 0.12).toFixed(2)}</span></p>
              <p className="flex justify-between font-bold pt-1 border-t border-white/10"><span>Total</span><span>${(total * 1.12).toFixed(2)}</span></p>
            </div>

            {error && <p className="text-sm text-rose-400">{error}</p>}

            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Confirm booking
            </button>
            <p className="text-[10px] text-neutral-500 text-center">Reserve now, pay at the property. No card needed.</p>
          </form>
        )}
      </div>
    </div>
  );
}