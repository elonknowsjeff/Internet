import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { X, Loader2, Trash2 } from "lucide-react";

const COLORS = [
  { key: "violet", cls: "bg-violet-500" },
  { key: "sky", cls: "bg-sky-500" },
  { key: "emerald", cls: "bg-emerald-500" },
  { key: "amber", cls: "bg-amber-500" },
  { key: "rose", cls: "bg-rose-500" },
];

export default function EventDialog({ initial, defaultDate, onClose, onSaved }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [date, setDate] = useState(format(initial?.start ? new Date(initial.start) : defaultDate || new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(initial?.start ? format(new Date(initial.start), "HH:mm") : "09:00");
  const [endTime, setEndTime] = useState(initial?.end ? format(new Date(initial.end), "HH:mm") : "10:00");
  const [allDay, setAllDay] = useState(!!initial?.all_day);
  const [location, setLocation] = useState(initial?.location || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || "violet");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Give your event a name."); return; }
    setSaving(true);
    setError("");
    const start = new Date(`${date}T${allDay ? "00:00" : startTime}`);
    const end = new Date(`${date}T${allDay ? "23:59" : endTime}`);
    const payload = {
      title: title.trim(),
      description,
      location,
      all_day: allDay,
      color,
      start: start.toISOString(),
      end: (end > start ? end : start).toISOString(),
    };
    try {
      if (initial?.id) await base44.entities.CalendarEvent.update(initial.id, payload);
      else await base44.entities.CalendarEvent.create(payload);
      onSaved();
    } catch (err) {
      setError(err?.message || "Could not save the event.");
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!initial?.id) return;
    setSaving(true);
    try {
      await base44.entities.CalendarEvent.delete(initial.id);
      onSaved();
    } catch (err) {
      setError(err?.message || "Could not delete the event.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={save} className="relative w-full max-w-md rounded-2xl border border-white/12 bg-neutral-950 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{initial?.id ? "Edit event" : "New event"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event name"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
            <label className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 text-sm">
              <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} className="accent-violet-500" /> All day
            </label>
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-2">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
            </div>
          )}
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-violet-400" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Notes (optional)" className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-violet-400 resize-none" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Color</span>
            {COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                className={`w-6 h-6 rounded-full ${c.cls} ${color === c.key ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-950" : "opacity-70"}`}
              />
            ))}
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        <div className="flex items-center gap-2 mt-5">
          {initial?.id && (
            <button type="button" onClick={remove} disabled={saving} aria-label="Delete event" className="w-10 h-10 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onClose} className="ml-auto px-4 py-2.5 rounded-xl border border-white/10 text-sm text-neutral-300 hover:bg-white/5">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-400 to-cyan-400 text-black text-sm font-bold disabled:opacity-60 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save event
          </button>
        </div>
      </form>
    </div>
  );
}