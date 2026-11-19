import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EMOJI = ["🎮", "🚀", "👾", "🕹️", "🎲", "🧩", "⚡", "🌟"];
const make = () => [...EMOJI, ...EMOJI].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, e, flip: false, done: false }));

export default function MemoryGame({ onClose }) {
  const [cards, setCards] = useState(make);
  const [picked, setPicked] = useState([]);
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (picked.length === 2) {
      setBusy(true);
      const [a, b] = picked;
      const ca = cards.find((c) => c.id === a), cb = cards.find((c) => c.id === b);
      if (ca.e === cb.e) {
        setCards((cs) => cs.map((c) => (c.id === a || c.id === b ? { ...c, done: true } : c)));
        setPicked([]); setBusy(false);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((c) => (c.id === a || c.id === b ? { ...c, flip: false } : c)));
          setPicked([]); setBusy(false);
        }, 700);
      }
      setMoves((m) => m + 1);
    }
  }, [picked]);

  const flip = (c) => {
    if (busy || c.flip || c.done) return;
    setCards((cs) => cs.map((x) => (x.id === c.id ? { ...x, flip: true } : x)));
    setPicked((p) => [...p, c.id]);
  };

  const won = cards.every((c) => c.done);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold font-display">Memory Match</h2>
          <span className="text-sm text-cyan-400">Moves: {moves}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cards.map((c) => (
            <button key={c.id} onClick={() => flip(c)} className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-all ${c.flip || c.done ? "bg-white/10" : "bg-fuchsia-500/20 hover:bg-fuchsia-500/30"}`}>
              {c.flip || c.done ? c.e : "?"}
            </button>
          ))}
        </div>
        {won && <p className="text-center text-emerald-400 mt-3 text-sm">You won in {moves} moves!</p>}
        <button onClick={() => { setCards(make()); setPicked([]); setMoves(0); }} className="mt-3 w-full py-2 rounded-full bg-fuchsia-500 text-black text-sm font-semibold">New game</button>
      </div>
    </div>
  );
}