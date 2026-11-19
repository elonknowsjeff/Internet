import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const winner = (b) => { for (const [a,c,d] of LINES) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return null; };
const findThreat = (b, p) => {
  for (const [a,c,d] of LINES) {
    const l = [b[a], b[c], b[d]];
    if (l.filter((x) => x === p).length === 2 && l.includes(null)) return [a, c, d][l.indexOf(null)];
  }
  return -1;
};
const aiMove = (b) => {
  let m = findThreat(b, "O"); if (m >= 0) return m;
  m = findThreat(b, "X"); if (m >= 0) return m;
  if (b[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter((i) => b[i] === null); if (corners.length) return corners[0];
  return b.indexOf(null);
};

export default function TicTacToe({ onClose }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const win = winner(board);
  const full = board.every(Boolean);

  useEffect(() => {
    if (turn === "O" && !win && !full) {
      const m = aiMove(board);
      if (m >= 0) { const nb = board.slice(); nb[m] = "O"; setBoard(nb); setTurn("X"); }
    }
  }, [turn]);

  const click = (i) => {
    if (board[i] || win || turn !== "X") return;
    const nb = board.slice(); nb[i] = "X"; setBoard(nb); setTurn("O");
  };
  const reset = () => { setBoard(Array(9).fill(null)); setTurn("X"); };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold font-display">Tic-Tac-Toe</h2>
          <span className="text-sm text-cyan-400">{win ? `${win} wins!` : full ? "Draw" : turn === "X" ? "Your turn" : "AI…"}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {board.map((c, i) => (
            <button key={i} onClick={() => click(i)} className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 text-4xl font-bold flex items-center justify-center hover:bg-white/10">
              <span className={c === "X" ? "text-cyan-400" : "text-fuchsia-400"}>{c || ""}</span>
            </button>
          ))}
        </div>
        <button onClick={reset} className="mt-3 w-full py-2 rounded-full bg-fuchsia-500 text-black text-sm font-semibold">Restart</button>
      </div>
    </div>
  );
}