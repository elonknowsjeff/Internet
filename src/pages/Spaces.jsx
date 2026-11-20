import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Mic, MicOff, Hand, Plus, Radio, Users, ArrowLeft, X, Loader2, Volume2,
  Sparkles, Circle, Crown, Search,
} from "lucide-react";

const TOPICS = ["Just chatting", "Music", "Gaming", "News", "Tech", "Sports", "Education", "Crypto"];
const asItems = (res) => (Array.isArray(res) ? res : res?.items || []);

const nameOf = (u) => u?.display_name || u?.full_name || (u?.email ? u.email.split("@")[0] : "You");
const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "");
const avatarOf = (u) => u?.avatar || `https://i.pravatar.cc/120?u=${u?.id || "you"}`;

export default function Spaces() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // space room object
  const [participants, setParticipants] = useState([]);
  const [me, setMe] = useState(null); // my participant row
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", topic: "Just chatting" });
  const [query, setQuery] = useState("");
  const [micOn, setMicOn] = useState(false);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const analyzeRef = useRef(null);
  const rafRef = useRef(null);

  const loadRooms = async () => {
    try {
      const list = asItems(await base44.entities.SpaceRoom.filter({ is_live: true }, { sort: "-started_at", limit: 50 }));
      setRooms(list);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadRooms();
    const unsub = base44.entities.SpaceRoom?.subscribe?.(() => loadRooms());
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  // live participants for active room
  const loadParticipants = async (spaceId) => {
    try {
      const list = asItems(await base44.entities.SpaceParticipant.filter({ space_id: spaceId }, { sort: "-created_date", limit: 200 }));
      setParticipants(list);
    } catch { setParticipants([]); }
  };

  useEffect(() => {
    if (!active) { setParticipants([]); setMe(null); return; }
    loadParticipants(active.id);
    const unsub = base44.entities.SpaceParticipant?.subscribe?.((e) => {
      if (!e) return;
      loadParticipants(active.id);
    });
    return () => { if (typeof unsub === "function") unsub(); };
  }, [active?.id]);

  useEffect(() => {
    if (!user || !active) { setMe(null); return; }
    setMe(participants.find((p) => p.user_id === user.id) || null);
  }, [participants, user, active]);

  // mic level meter
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
      const src = audioCtxRef.current.createMediaStreamSource(stream);
      analyzeRef.current = audioCtxRef.current.createAnalyser();
      analyzeRef.current.fftSize = 256;
      src.connect(analyzeRef.current);
      const data = new Uint8Array(analyzeRef.current.frequencyBinCount);
      const tick = () => {
        analyzeRef.current.getByteFrequencyData(data);
        let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i];
        const level = sum / data.length;
        if (me && level > 12 && !me.is_speaking) {
          base44.entities.SpaceParticipant.update(me.id, { is_speaking: true }).catch(() => {});
        } else if (me && level <= 12 && me.is_speaking) {
          base44.entities.SpaceParticipant.update(me.id, { is_speaking: false }).catch(() => {});
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* mic denied — keep UI toggle */ }
  };

  const stopMic = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (me) base44.entities.SpaceParticipant.update(me.id, { is_speaking: false }).catch(() => {});
  };

  useEffect(() => () => stopMic(), []);

  const toggleMic = async () => {
    if (!me) return;
    const next = !micOn;
    setMicOn(next);
    await base44.entities.SpaceParticipant.update(me.id, { muted: !next }).catch(() => {});
    if (next) startMic(); else stopMic();
  };

  const raiseHand = async () => {
    if (!me) return;
    await base44.entities.SpaceParticipant.update(me.id, { hand_raised: !me.hand_raised }).catch(() => {});
  };

  const createSpace = async () => {
    if (!form.title.trim() || !user) return;
    const room = await base44.entities.SpaceRoom.create({
      title: form.title.trim(),
      topic: form.topic,
      host_name: nameOf(user),
      host_handle: handleOf(user),
      host_avatar: avatarOf(user),
      is_live: true,
      started_at: new Date().toISOString(),
    });
    await base44.entities.SpaceParticipant.create({
      space_id: room.id,
      user_id: user.id,
      user_name: nameOf(user),
      user_handle: handleOf(user),
      user_avatar: avatarOf(user),
      role: "host",
      muted: true,
    });
    setForm({ title: "", topic: "Just chatting" });
    setCreating(false);
    setActive(room);
    loadRooms();
  };

  const joinSpace = async (room) => {
    if (!user) return;
    const existing = asItems(await base44.entities.SpaceParticipant.filter({ space_id: room.id, user_id: user.id }, { limit: 5 }));
    if (!existing.length) {
      await base44.entities.SpaceParticipant.create({
        space_id: room.id,
        user_id: user.id,
        user_name: nameOf(user),
        user_handle: handleOf(user),
        user_avatar: avatarOf(user),
        role: "listener",
        muted: true,
      });
    }
    setActive(room);
  };

  const leaveSpace = async () => {
    if (me) { await base44.entities.SpaceParticipant.delete(me.id).catch(() => {}); }
    stopMic();
    setMicOn(false);
    setActive(null);
    setMe(null);
    loadRooms();
  };

  const endSpace = async () => {
    if (!active || active.created_by_id !== user?.id) { leaveSpace(); return; }
    await base44.entities.SpaceParticipant.deleteMany({ space_id: active.id }).catch(() => {});
    await base44.entities.SpaceRoom.update(active.id, { is_live: false }).catch(() => {});
    stopMic();
    setMicOn(false);
    setActive(null);
    setMe(null);
    loadRooms();
  };

  const speakers = participants.filter((p) => p.role === "host" || p.role === "speaker");
  const listeners = participants.filter((p) => p.role === "listener");
  const q = query.trim().toLowerCase();
  const filtered = rooms.filter((r) => !q || `${r.title} ${r.topic} ${r.host_name}`.toLowerCase().includes(q));

  if (active) {
    return (
      <div className="mx-auto w-full max-w-[680px] px-3 sm:px-4 pb-32 pt-3">
        {/* header */}
        <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 mb-3 border-b border-white/10 bg-[#0b0b0d]/85 px-3 sm:px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button onClick={leaveSpace} className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center shrink-0"><ArrowLeft className="w-5 h-5" /></button>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--brand)" }}><Circle className="w-2 h-2 fill-current animate-pulse" /> Live</p>
              <h1 className="truncate text-[15px] font-bold leading-tight">{active.title}</h1>
              <p className="truncate text-[11px] text-white/45">{active.topic} · {participants.length} in space</p>
            </div>
            <button onClick={endSpace} className="px-3 py-1.5 rounded-full text-[12px] font-bold text-rose-300 border border-rose-400/40 hover:bg-rose-500/10">
              {active.created_by_id === user?.id ? "End" : "Leave"}
            </button>
          </div>
        </div>

        {/* speakers ring */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{speakers.length} speaking</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {speakers.map((p) => {
              const isMe = p.user_id === user?.id;
              const speaking = isMe ? (micOn && !p.muted) : p.is_speaking;
              return (
                <div key={p.id} className="flex flex-col items-center gap-1.5 text-center">
                  <div className={`relative grid place-items-center rounded-full transition-all duration-200 ${speaking ? "ring-2 ring-offset-2 ring-offset-[#0b0b0d]" : ""}`} style={speaking ? { "--tw-ring-color": "var(--brand)" } : {}}>
                    <img src={p.user_avatar} alt="" className={`w-16 h-16 rounded-full object-cover ${speaking ? "animate-pulse" : ""}`} />
                    {p.role === "host" && <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-black"><Crown className="w-3 h-3" /></span>}
                    {p.muted && <span className="absolute -bottom-0.5 -left-0.5 grid h-5 w-5 place-items-center rounded-full bg-neutral-800 border border-white/15"><MicOff className="w-3 h-3 text-rose-400" /></span>}
                  </div>
                  <p className="truncate max-w-[72px] text-[11px] font-semibold">{p.user_name}{isMe ? " (you)" : ""}</p>
                  <p className="text-[9px] text-white/40">{p.role === "host" ? "Host" : "Speaker"}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* listeners */}
        {listeners.length > 0 && (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/40">{listeners.length} listening</p>
            <div className="flex flex-wrap gap-2">
              {listeners.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5">
                  <img src={p.user_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-[11px] font-medium truncate max-w-[90px]">{p.user_name}</span>
                  {p.hand_raised && <Hand className="w-3 h-3 text-amber-400" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* controls */}
        <div className="fixed bottom-[92px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-white/12 bg-[#1c1c1e]/95 px-2 py-2 backdrop-blur-xl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)]">
          <button onClick={toggleMic} className={`grid h-12 w-12 place-items-center rounded-full transition-colors ${micOn ? "text-black" : "text-white/70 hover:bg-white/10"}`} style={micOn ? { background: "var(--brand)" } : {}}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          {me?.role === "listener" && (
            <button onClick={raiseHand} className={`grid h-12 w-12 place-items-center rounded-full transition-colors ${me.hand_raised ? "bg-amber-400/20 text-amber-300" : "text-white/70 hover:bg-white/10"}`}>
              <Hand className={`w-5 h-5 ${me.hand_raised ? "fill-current" : ""}`} />
            </button>
          )}
          <button onClick={leaveSpace} className="grid h-12 w-12 place-items-center rounded-full bg-rose-500/15 text-rose-300 hover:bg-rose-500/25">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[680px] px-3 sm:px-4 pb-28 pt-3">
      {/* header */}
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 mb-3 border-b border-white/10 bg-[#0b0b0d]/85 px-3 sm:px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--brand)" }}><Radio className="w-5 h-5 text-black" /></span>
          <div className="min-w-0 flex-1">
            <h1 className="text-[17px] font-extrabold tracking-tight leading-tight">Live Spaces</h1>
            <p className="text-[11px] text-white/45">{rooms.length} live · audio rooms</p>
          </div>
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-bold text-black" style={{ background: "var(--brand)" }}>
            <Plus className="w-4 h-4" /> Start
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2">
          <Search className="w-4 h-4 text-white/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search spaces" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder-white/35" />
          {query && <button onClick={() => setQuery("")}><X className="w-4 w-4 text-white/40" /></button>}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[13px] text-white/40"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Loading spaces…</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Radio className="mx-auto mb-3 h-10 w-10 text-white/25" />
          <p className="text-[14px] font-semibold">No live spaces</p>
          <p className="mt-1 text-[12px] text-white/45">Start one and invite people to join the conversation.</p>
          <button onClick={() => setCreating(true)} className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-black" style={{ background: "var(--brand)" }}>
            <Plus className="w-4 h-4" /> Start a space
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => joinSpace(r)} className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={r.host_avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white"><Radio className="w-2.5 h-2.5" /></span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-bold leading-tight">{r.title}</p>
                  <p className="truncate text-[11.5px] text-white/50">{r.host_name} · {r.topic}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-semibold text-white/65"><Users className="w-3 h-3" /> Join</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* create dialog */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-3xl border border-white/12 bg-[#0c0c0f] p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: "var(--brand)" }} />
              <h2 className="text-lg font-bold">Start a Space</h2>
              <button onClick={() => setCreating(false)} className="ml-auto w-8 h-8 rounded-full hover:bg-white/10 grid place-items-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={80} placeholder="What do you want to talk about?" className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 text-sm outline-none focus:border-white/30" />
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button key={t} onClick={() => setForm({ ...form, topic: t })} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${form.topic === t ? "text-black" : "border border-white/12 text-white/60 hover:bg-white/8"}`} style={form.topic === t ? { background: "var(--brand)" } : {}}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={createSpace} disabled={!form.title.trim()} className="mt-4 w-full py-2.5 rounded-full text-[13px] font-bold text-black disabled:opacity-40" style={{ background: "var(--brand)" }}>Start your Space</button>
          </div>
        </div>
      )}
    </div>
  );
}