import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Table, Plus, Save, FileText, Trash2, Download, Rows3, Columns3, Sigma, Loader2 } from "lucide-react";

const COLS_DEFAULT = 6;
const ROWS_DEFAULT = 10;
const colLetter = (i) => String.fromCharCode(65 + i);
const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const refToCell = (ref) => { const m = ref.match(/^([A-Z])(\d+)$/i); if (!m) return null; return { c: m[1].toUpperCase().charCodeAt(0) - 65, r: parseInt(m[2]) - 1 }; };

const blank = (r, c) => Array.from({ length: r }, () => Array.from({ length: c }, () => ""));
const sample = () => [
  ["Item", "Qty", "Price", "Total"],
  ["Walza+ sub", "1", "4.99", "=B2*C2"],
  ["Coffee", "3", "4.5", "=B3*C3"],
  ["Ride", "2", "13.5", "=B4*C4"],
  ["", "", "Sum", "=SUM(D2:D4)"],
  ...Array.from({ length: ROWS_DEFAULT - 5 }, () => Array.from({ length: 4 }, () => "")),
];

const compute = (grid, r, c, seen = new Set()) => {
  const key = `${r},${c}`;
  if (seen.has(key)) return "#CIRC";
  seen.add(key);
  const raw = grid[r]?.[c];
  if (raw == null || raw === "" || !String(raw).startsWith("=")) return raw || "";
  let expr = String(raw).slice(1);
  expr = expr.replace(/SUM\(([A-Z]\d+):([A-Z]\d+)\)/gi, (_, a, b) => {
    const ca = refToCell(a), cb = refToCell(b);
    if (!ca || !cb) return "0";
    let sum = 0;
    for (let i = ca.r; i <= cb.r; i++) for (let j = ca.c; j <= cb.c; j++) sum += num(compute(grid, i, j, seen));
    return sum;
  });
  expr = expr.replace(/AVERAGE\(([A-Z]\d+):([A-Z]\d+)\)/gi, (_, a, b) => {
    const ca = refToCell(a), cb = refToCell(b); if (!ca || !cb) return "0";
    let sum = 0, cnt = 0;
    for (let i = ca.r; i <= cb.r; i++) for (let j = ca.c; j <= cb.c; j++) { sum += num(compute(grid, i, j, seen)); cnt++; }
    return cnt ? sum / cnt : 0;
  });
  expr = expr.replace(/[A-Z]\d+/gi, (ref) => {
    const cell = refToCell(ref); if (!cell) return "0";
    return num(compute(grid, cell.r, cell.c, seen));
  });
  try { const v = Function('"use strict";return (' + expr + ")")(); return v; } catch { return "#ERR"; }
};

export default function Sheets() {
  const [sheets, setSheets] = useState([]);
  const [name, setName] = useState("Untitled sheet");
  const [grid, setGrid] = useState(sample);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    try { setSheets(await base44.entities.Sheet.list("-created_date", 50)); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // keyboard navigation: move the active cell with arrows / Tab / Enter (Enter opens edit)
  useEffect(() => {
    const onKey = (e) => {
      if (editing || !active) return;
      const rows = grid.length, cmax = (grid[0]?.length || 0) - 1;
      if (cmax < 0) return;
      let { r, c } = active;
      let handled = true;
      if (e.key === "ArrowUp") r = Math.max(0, r - 1);
      else if (e.key === "ArrowDown") r = Math.min(rows - 1, r + 1);
      else if (e.key === "ArrowLeft") c = Math.max(0, c - 1);
      else if (e.key === "ArrowRight" || e.key === "Tab") c = Math.min(cmax, c + 1);
      else if (e.key === "Enter") { startEdit(active.r, active.c); }
      else handled = false;
      if (handled) { e.preventDefault(); setActive({ r, c }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, editing, grid]);

  const cols = grid[0]?.length || 0;

  const setCell = (r, c, v) => setGrid((g) => { const n = g.map((row) => row.slice()); n[r][c] = v; return n; });

  const startEdit = (r, c) => {
    setActive({ r, c });
    setEditing({ r, c });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = (v) => {
    if (editing) setCell(editing.r, editing.c, v);
    setEditing(null);
  };

  const addRow = () => setGrid((g) => [...g, Array.from({ length: g[0]?.length || COLS_DEFAULT }, () => "")]);
  const addCol = () => setGrid((g) => g.map((row) => [...row, ""]));

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Sheet.create({ name: name.trim() || "Untitled", grid });
      setSaved(true); setTimeout(() => setSaved(false), 1500); load();
    } catch (e) {}
    setSaving(false);
  };

  const open = (s) => { setName(s.name); setGrid(s.grid && s.grid.length ? s.grid : blank(ROWS_DEFAULT, COLS_DEFAULT)); setActive(null); };
  const remove = async (s) => { if (!confirm("Delete this sheet?")) return; await base44.entities.Sheet.delete(s.id); load(); };
  const newSheet = () => { setName("Untitled sheet"); setGrid(blank(ROWS_DEFAULT, COLS_DEFAULT)); setActive(null); };

  const TEMPLATES = {
    invoice: [
      ["Invoice #", "Qty", "Rate", "Amount"],
      ["Consulting hours", "10", "150", "=B2*C2"],
      ["Design retainer", "1", "1200", "=B3*C3"],
      ["", "", "Subtotal", "=SUM(D2:D3)"],
      ["", "", "Tax 13%", "=D4*0.13"],
      ["", "", "Total", "=D4+D5"],
      ...Array.from({ length: ROWS_DEFAULT - 6 }, () => ["", "", "", ""]),
    ],
    payroll: [
      ["Employee", "Hours", "Rate", "Gross"],
      ["Alex Morgan", "80", "42", "=B2*C2"],
      ["Sam Rivera", "76", "38", "=B3*C3"],
      ["Jo Chen", "84", "45", "=B4*C4"],
      ["", "", "Payroll total", "=SUM(D2:D4)"],
      ...Array.from({ length: ROWS_DEFAULT - 5 }, () => ["", "", "", ""]),
    ],
    budget: [
      ["Category", "Budgeted", "Spent", "Left"],
      ["Rent", "1400", "1400", "=B2-C2"],
      ["Food", "500", "380", "=B3-C3"],
      ["Fun", "250", "190", "=B4-C4"],
      ["Transit", "120", "96", "=B5-C5"],
      ["", "", "Total left", "=SUM(D2:D5)"],
      ...Array.from({ length: ROWS_DEFAULT - 6 }, () => ["", "", "", ""]),
    ],
  };

  const applyTemplate = (key) => {
    const labels = { invoice: "Invoice", payroll: "Payroll run", budget: "Monthly budget" };
    setName(labels[key] || "Untitled");
    setGrid(TEMPLATES[key]);
    setActive(null);
  };

  const clearSheet = () => {
    if (!confirm("Clear all cells in this sheet?")) return;
    setGrid((g) => blank(g.length, g[0]?.length || COLS_DEFAULT));
    setActive(null);
  };
  const filledCount = grid.flat().filter((v) => String(v ?? "").trim() !== "").length;

  const exportCsv = () => {
    const csv = grid
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = (name || "sheet").replace(/[^\w\-]+/g, "-") + ".csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const activeRef = active ? `${colLetter(active.c)}${active.r + 1}` : "";
  const activeRaw = active ? grid[active.r]?.[active.c] ?? "" : "";
  const activeValue = active ? (String(activeRaw).startsWith("=") ? compute(grid, active.r, active.c) : activeRaw) : "";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#080b09] text-white">
      {/* top bar */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-white/[0.08] bg-[#0b110d]/95 px-3 py-2 backdrop-blur-xl">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300">
          <Table className="h-4 w-4" />
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-1 font-display text-[15px] font-bold outline-none focus:bg-white/[0.06]"
        />
        <button onClick={newSheet} className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1.5 text-[11.5px] font-semibold text-white/70 hover:bg-white/[0.07] hover:text-white">
          <FileText className="h-3.5 w-3.5" /> New
        </button>
        <button onClick={exportCsv} className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1.5 text-[11.5px] font-semibold text-white/70 hover:bg-white/[0.07] hover:text-white">
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1 rounded-full bg-emerald-400 px-3.5 py-1.5 text-[11.5px] font-bold text-black disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save"}
        </button>
      </header>

      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px]">
        <span className="mr-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
          <Sigma className="h-3 w-3" /> Templates
        </span>
        <button onClick={() => applyTemplate("invoice")} className="rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/65 hover:bg-white/[0.08] hover:text-white">Invoice</button>
        <button onClick={() => applyTemplate("payroll")} className="rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/65 hover:bg-white/[0.08] hover:text-white">Payroll</button>
        <button onClick={() => applyTemplate("budget")} className="rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/65 hover:bg-white/[0.08] hover:text-white">Budget</button>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <button onClick={addRow} className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/65 hover:bg-white/[0.08] hover:text-white">
          <Rows3 className="h-3 w-3" /> Row
        </button>
        <button onClick={addCol} className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/65 hover:bg-white/[0.08] hover:text-white">
          <Columns3 className="h-3 w-3" /> Column
        </button>
        <button onClick={clearSheet} className="flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 font-semibold text-white/55 hover:bg-rose-400/10 hover:text-rose-200">
          <Trash2 className="h-3 w-3" /> Clear
        </button>
        <span className="ml-auto tabular-nums text-white/30">{filledCount} filled · {grid.length}r × {cols}c</span>
      </div>

      {/* formula bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0b110d]/80 px-2.5 py-1.5">
        <span className="w-14 shrink-0 rounded-md border border-white/10 bg-white/[0.05] py-0.5 text-center text-[11px] font-bold tabular-nums text-white/70">
          {activeRef || "—"}
        </span>
        <span className="shrink-0 font-serif text-[13px] italic text-white/35">fx</span>
        <input
          value={String(activeRaw)}
          readOnly={!editing}
          onChange={(e) => editing && setCell(editing.r, editing.c, e.target.value)}
          placeholder="Select a cell, type a value or =SUM(A1:A9)"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder-white/25"
        />
        <span className="hidden shrink-0 text-[11px] tabular-nums text-emerald-300/80 sm:block">{String(activeValue)}</span>
      </div>

      {/* grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse text-[12.5px]">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 w-9 border border-white/[0.07] bg-[#121a14]" />
              {Array.from({ length: cols }).map((_, c) => (
                <th
                  key={c}
                  className={`sticky top-0 z-20 border border-white/[0.07] bg-[#121a14] py-1 text-[10.5px] font-semibold ${
                    active?.c === c ? "text-emerald-300" : "text-white/40"
                  }`}
                >
                  {colLetter(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                <td
                  className={`sticky left-0 z-10 border border-white/[0.07] bg-[#121a14] text-center text-[10.5px] tabular-nums ${
                    active?.r === r ? "text-emerald-300" : "text-white/35"
                  }`}
                >
                  {r + 1}
                </td>
                {row.map((cell, c) => {
                  const isEdit = editing && editing.r === r && editing.c === c;
                  const isActive = active && active.r === r && active.c === c;
                  const val = isEdit ? cell : (String(cell).startsWith("=") ? compute(grid, r, c) : cell);
                  return (
                    <td
                      key={c}
                      onClick={() => !isEdit && startEdit(r, c)}
                      className={`h-7 min-w-[6.5rem] border border-white/[0.07] p-0 transition-colors hover:bg-white/[0.04] ${
                        isActive ? "bg-emerald-400/[0.07] outline outline-1 -outline-offset-1 outline-emerald-400/70" : ""
                      }`}
                    >
                      {isEdit ? (
                        <input
                          ref={inputRef}
                          defaultValue={cell}
                          onBlur={(e) => commitEdit(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(e.target.value);
                            if (e.key === "Escape") setEditing(null);
                          }}
                          className="h-7 w-full bg-[#0b110d] px-1.5 text-white outline-none"
                        />
                      ) : (
                        <div className={`flex h-7 items-center truncate px-1.5 ${String(cell).startsWith("=") ? "font-semibold text-emerald-300" : "text-white/85"}`}>
                          {val ?? ""}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* sheet tabs */}
      <footer className="sticky bottom-0 z-20 flex items-center gap-1 overflow-x-auto border-t border-white/[0.08] bg-[#0b110d]/95 px-2 py-1.5 backdrop-blur-xl scrollbar-none">
        <span className="mr-1 shrink-0 rounded-t-md bg-emerald-400/15 px-2.5 py-1 text-[11.5px] font-bold text-emerald-200">{name || "Untitled"}</span>
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-white/30" />
        ) : (
          sheets.map((s) => (
            <div key={s.id} className="group flex shrink-0 items-center rounded-t-md text-[11.5px] text-white/50 hover:bg-white/[0.06] hover:text-white">
              <button onClick={() => open(s)} className="max-w-[140px] truncate px-2.5 py-1">{s.name}</button>
              <button onClick={() => remove(s)} title="Delete sheet" className="pr-1.5 text-white/20 hover:text-rose-300">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
        <button onClick={newSheet} className="ml-1 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/10 hover:text-white">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </footer>
    </div>
  );
}