import React from "react";
import { Heart, MessageCircle, MapPin, Sparkles } from "lucide-react";

export default function MatchInbox({ matches, incoming, onLikeBack, onMessage }) {
  return (
    <div className="space-y-5 mt-4">
      <section>
        <h2 className="text-[13px] font-bold flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> Your matches
          <span className="text-[11px] font-normal text-neutral-500">· {matches.length}</span>
        </h2>
        {matches.length === 0 ? (
          <p className="text-[12px] text-neutral-500 mt-2">No matches yet — swipe right on Discover and they'll show up when they like you back.</p>
        ) : (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {matches.map((p) => (
              <div key={p.id} className="rounded-2xl gloss-strong overflow-hidden">
                <div className="aspect-[4/5] bg-neutral-900">
                  {p.photo ? <img src={p.photo} alt={p.display_name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-semibold truncate">{p.display_name}{p.age ? `, ${p.age}` : ""}</p>
                  <button
                    onClick={() => onMessage(p)}
                    className="mt-1.5 w-full py-1.5 rounded-full brand-grad text-black text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[13px] font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--brand)" }} /> Likes you
          <span className="text-[11px] font-normal text-neutral-500">· {incoming.length}</span>
        </h2>
        {incoming.length === 0 ? (
          <p className="text-[12px] text-neutral-500 mt-2">No new likes yet.</p>
        ) : (
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {incoming.map((l) => (
              <div key={l.id} className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04]">
                <div className="aspect-square bg-neutral-900">
                  {l.from_photo ? <img src={l.from_photo} alt={l.from_name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="p-2">
                  <p className="text-[11.5px] font-semibold truncate">{l.from_name || "Someone"}</p>
                  <button onClick={() => onLikeBack(l)} className="mt-1 w-full py-1 rounded-full border border-white/15 text-[10.5px] font-bold text-white/80 hover:bg-white/10">
                    Like back
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {matches.length > 0 && (
        <p className="text-[11px] text-neutral-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Matches stay private between you two.
        </p>
      )}
    </div>
  );
}