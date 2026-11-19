import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Trash2, X, Terminal } from "lucide-react";

export default function BrowserConsole({ logs = [], onRun, onClose, enabled }) {
  const [code, setCode] = useState("");
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [logs.length]);

  const submit = () => {
    const value = code.trim();
    if (!value) return;
    onRun?.(value);
    setHistory((h) => [value, ...h].slice(0, 40));
    setHIdx(-1);
    setCode("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); return; }
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const next = Math.min(history.length - 1, hIdx + 1);
      setHIdx(next);
      setCode(history[next]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = hIdx - 1;
      setHIdx(next);
      setCode(next < 0 ? "" : history[next]);
    }
  };

  return (
    <div className="shrink-0 h-56 flex flex-col border-t border-white/10 bg-[#0b0d13] text-neutral-200">
      <div className="flex items-center gap-2 px-3 h-8 border-b border-white/10 shrink-0">
        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">JavaScript console</span>
        <button onClick={() => onRun?.("clear")} className="ml-auto text-[10px] text-neutral-500 hover:text-white">Reset page</button>
        <button onClick={onClose} className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center"><X className="w-3 h-3" /></button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto font-mono text-[11.5px] leading-relaxed px-3 py-2 space-y-1.5">
        {logs.length === 0 && (
          <p className="text-neutral-500">
            Run JavaScript on the page you are viewing. Try <span className="text-cyan-300">document.title</span> or{" "}
            <span className="text-cyan-300">document.querySelectorAll("a").length</span>.
          </p>
        )}
        {logs.map((l) => (
          <div key={l.id}>
            <p className="text-emerald-400"><span className="text-neutral-500">›</span> {l.code}</p>
            <p className={l.done ? (l.ok ? "text-neutral-300" : "text-rose-400") : "text-neutral-500"}>
              {l.done ? l.value || (l.ok ? "undefined" : "") : "running…"}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-1.5 px-3 h-9 border-t border-white/10 shrink-0">
        <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={!enabled}
          placeholder={enabled ? "Type JavaScript and press Enter" : "Open a page first"}
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent outline-none font-mono text-[11.5px] placeholder-neutral-600 disabled:opacity-50"
        />
        <button onClick={() => setHistory([])} title="Clear history" className="text-neutral-500 hover:text-white"><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  );
}