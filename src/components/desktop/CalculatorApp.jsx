import React, { useState } from "react";

const KEYS = ["C", "±", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "⌫", "="];

const apply = (a, b, op) => {
  const x = Number(a);
  const y = Number(b);
  if (Number.isNaN(x) || Number.isNaN(y)) return "0";
  if (op === "+") return String(x + y);
  if (op === "−") return String(x - y);
  if (op === "×") return String(x * y);
  if (op === "÷") return y === 0 ? "Error" : String(x / y);
  return String(y);
};

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(true);

  const press = (k) => {
    if (k === "C") { setDisplay("0"); setAcc(null); setOp(null); setFresh(true); return; }
    if (k === "⌫") { setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0")); return; }
    if (k === "±") { setDisplay((d) => (d.startsWith("-") ? d.slice(1) : `-${d}`)); return; }
    if (k === "%") { setDisplay((d) => String(Number(d) / 100)); return; }
    if ("+−×÷".includes(k)) {
      setAcc(acc !== null && op && !fresh ? apply(acc, display, op) : display);
      setOp(k);
      setFresh(true);
      return;
    }
    if (k === "=") {
      if (acc !== null && op) { setDisplay(apply(acc, display, op)); setAcc(null); setOp(null); setFresh(true); }
      return;
    }
    if (k === ".") { if (!display.includes(".")) setDisplay(`${display}.`); setFresh(false); return; }
    setDisplay(fresh || display === "0" ? k : display + k);
    setFresh(false);
  };

  return (
    <div className="h-full flex flex-col p-3 gap-2 bg-black/30">
      <div className="rounded-xl px-3 py-4 text-right gloss border border-white/10">
        <p className="text-[10px] text-neutral-500 h-3">{acc !== null && op ? `${acc} ${op}` : ""}</p>
        <p className="text-3xl font-light font-mono truncate">{display}</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {KEYS.map((k) => {
          const isOp = "+−×÷=".includes(k);
          const isTop = ["C", "±", "%"].includes(k);
          return (
            <button
              key={k}
              onClick={() => press(k)}
              className={`rounded-lg text-sm font-semibold transition active:scale-95 ${
                isOp ? "text-black" : isTop ? "bg-white/15 text-white" : "bg-white/10 text-white hover:bg-white/20"
              }`}
              style={isOp ? { backgroundImage: "linear-gradient(135deg, var(--brand), var(--brand-2))" } : undefined}
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}