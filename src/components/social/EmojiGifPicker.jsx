import React, { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";

const EMOJIS = "😀 😂 🥹 😍 😘 😎 🥳 🤝 💜 🔥 ✨ 💫 🎉 👏 🙌 💯 🚀 🌊 🍜 🎶 ☕ 🍕 🌙 🌈 ⚡ 😭 😅 🤔 😴 🙃 😤 🫶 🧠 👀 💬".split(" ");

async function searchGifs(term) {
  const q = encodeURIComponent(term || "reaction");
  try {
    const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&limit=12&rating=pg-13&q=${q}`);
    const data = await res.json();
    const list = (data?.data || []).map((g) => g?.images?.fixed_width?.url || g?.images?.original?.url).filter(Boolean);
    if (list.length) return list;
  } catch {}
  try {
    const res = await fetch(`https://g.tenor.com/v1/search?key=LIVDSRZULELA&limit=12&q=${q}`);
    const data = await res.json();
    return (data?.results || []).map((g) => g?.media?.[0]?.gif?.url).filter(Boolean);
  } catch {
    return [];
  }
}

export default function EmojiGifPicker({ onEmoji, onGif, onClose }) {
  const [tab, setTab] = useState("emoji");
  const [q, setQ] = useState("");
  const [gifs, setGifs] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async (term) => {
    setBusy(true);
    setGifs(await searchGifs(term));
    setBusy(false);
  };

  useEffect(() => {
    if (tab === "gif" && !gifs.length && !busy) load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="absolute z-40 bottom-full mb-2 left-0 w-[min(290px,78vw)] rounded-2xl border border-white/12 bg-[#140e2b] shadow-2xl p-2 animate-pop-in">
      <div className="flex items-center gap-1 mb-2">
        {["emoji", "gif"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${tab === t ? "bg-white text-black" : "text-white/55 hover:bg-white/10"}`}
          >
            {t === "emoji" ? "Emoji" : "GIF"}
          </button>
        ))}
        <button type="button" onClick={onClose} className="ml-auto text-[11px] text-white/45 hover:text-white px-1.5">Close</button>
      </div>

      {tab === "emoji" ? (
        <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto thin-scrollbar">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => onEmoji(e)} className="h-8 rounded-lg text-lg leading-none hover:bg-white/10">{e}</button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 rounded-full bg-white/[0.08] border border-white/10 px-2.5 py-1.5 mb-2">
            <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(q)}
              placeholder="Search GIFs"
              className="flex-1 min-w-0 bg-transparent outline-none text-xs placeholder-white/40"
            />
            <button type="button" onClick={() => load(q)} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-black">Go</button>
          </div>
          {busy ? (
            <div className="py-8 grid place-items-center"><Loader2 className="w-4 h-4 animate-spin text-white/60" /></div>
          ) : gifs.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-white/45">No GIFs found.</p>
          ) : (
            <div className="grid grid-cols-3 gap-1 max-h-52 overflow-y-auto thin-scrollbar">
              {gifs.map((u) => (
                <button key={u} type="button" onClick={() => onGif(u)} className="aspect-square rounded-lg overflow-hidden bg-black/40 hover:ring-2 hover:ring-white/40">
                  <img src={u} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}