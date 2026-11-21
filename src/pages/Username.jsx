import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, AtSign, Check, Loader2, X } from "lucide-react";

const norm = (s) => (s || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);

export default function Username() {
  const [user, setUser] = useState(null);
  const [current, setCurrent] = useState(null);
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("idle"); // idle | checking | taken | free | invalid
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const mine = await base44.entities.Username.filter({ user_id: u.id });
        const rec = mine[0];
        if (rec) { setCurrent(rec); setVal(rec.handle); }
        else if (u?.username) setVal(norm(u.username));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    setSavedMsg("");
    const h = norm(val);
    if (!h) { setStatus("idle"); return; }
    if (h.length < 3) { setStatus("invalid"); return; }
    setStatus("checking");
    const t = setTimeout(async () => {
      try {
        const hits = await base44.entities.Username.filter({ handle: h });
        const takenByOther = hits.some((r) => r.user_id !== user?.id);
        setStatus(takenByOther ? "taken" : "free");
      } catch { setStatus("idle"); }
    }, 350);
    return () => clearTimeout(t);
  }, [val, user]);

  const handle = norm(val);
  const canSave = status === "free" && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (current) {
        await base44.entities.Username.update(current.id, { handle });
      } else {
        const rec = await base44.entities.Username.create({
          handle,
          user_id: user.id,
          display_name: user.display_name || user.full_name,
        });
        setCurrent(rec);
      }
      try { await base44.auth.updateMe({ username: handle }); } catch {}
      setSavedMsg("Your username is now @" + handle);
      setCurrent((c) => ({ ...(c || {}), handle }));
    } catch {}
    setSaving(false);
  };

  if (!user) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/50" /></div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">
      <header className="flex items-center gap-3 mb-5">
        <Link to="/profile" className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-bold">Username</h1>
      </header>

      <div className="ig-panel rounded-2xl p-5">
        <p className="text-sm ig-muted mb-4">Pick a public username. It must be unique, only one person can have each name at a time.</p>

        <label className="text-[12px] font-semibold ig-muted">Username</label>
        <div className="mt-1.5 flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 focus-within:border-[color:var(--brand)]">
          <AtSign className="w-4 h-4 text-white/40 mr-1.5" />
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="yourname" className="flex-1 min-w-0 bg-transparent outline-none text-sm" />
          {status === "checking" && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
          {status === "free" && <Check className="w-4 h-4 text-emerald-400" />}
          {status === "taken" && <X className="w-4 h-4 text-rose-400" />}
        </div>

        <p className="mt-2 text-[12px] min-h-[18px]">
          {status === "invalid" && <span className="text-rose-400">At least 3 letters, numbers or underscores.</span>}
          {status === "taken" && <span className="text-rose-400">Sorry, @{handle} is already taken.</span>}
          {status === "free" && <span className="text-emerald-400">@{handle} is available!</span>}
          {status === "idle" && <span className="text-white/40">Letters, numbers and underscores only.</span>}
        </p>

        <button onClick={save} disabled={!canSave} className="mt-4 w-full py-2.5 rounded-full brand-grad text-black font-bold text-sm disabled:opacity-40">
          {saving ? "Saving..." : current ? "Update username" : "Claim username"}
        </button>
        {savedMsg && <p className="mt-3 text-center text-[12px] text-emerald-400">{savedMsg}</p>}
        {current && <p className="mt-3 text-center text-[12px] ig-muted">Current: @{current.handle}</p>}
      </div>

      <p className="mt-4 text-center text-[12px] ig-muted">Your username appears as your @handle across Vazolex Plus.</p>
    </div>
  );
}