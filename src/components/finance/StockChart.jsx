import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function StockChart({ points, up, height = 190 }) {
  if (!points?.length) {
    return (
      <div className="grid place-items-center text-xs text-white/40" style={{ height }}>
        No chart data for this range
      </div>
    );
  }
  const color = up ? "#34d399" : "#fb7185";
  const data = points.map((p) => ({ x: p.t, y: p.c }));
  const id = up ? "chartUp" : "chartDown";

  return (
    <div style={{ height }} className="-mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.42} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" hide />
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.18)" }}
            content={({ active, payload }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-white/15 bg-[#1b1436] px-2 py-1 text-[11px] text-white">
                  ${Number(payload[0].value).toFixed(2)}
                </div>
              ) : null
            }
          />
          <Area type="monotone" dataKey="y" stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}