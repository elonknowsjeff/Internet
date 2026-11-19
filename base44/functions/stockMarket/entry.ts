const Y = "https://query1.finance.yahoo.com/v8/finance/chart/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const num = (v?: string | number | null) => {
  if (v == null) return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

async function fetchChart(symbol: string, range: string, interval: string) {
  const res = await fetch(`${Y}${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return json?.chart?.result?.[0] || null;
}

function quoteFrom(result: any) {
  const m = result?.meta;
  if (!m) return null;
  const price = typeof m.regularMarketPrice === "number" ? m.regularMarketPrice : null;
  const prev =
    typeof m.chartPreviousClose === "number"
      ? m.chartPreviousClose
      : typeof m.previousClose === "number"
        ? m.previousClose
        : null;
  const change = price != null && prev != null ? Number((price - prev).toFixed(2)) : null;
  const changePercent = change != null && prev ? Number(((change / prev) * 100).toFixed(2)) : null;
  return {
    symbol: m.symbol,
    price,
    prevClose: prev,
    change,
    changePercent,
    currency: m.currency || "USD",
    exchange: m.fullExchangeName || m.exchangeName || "",
  };
}

export default async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "quotes");

    if (action === "quotes") {
      const symbols = (Array.isArray(body.symbols) ? body.symbols : [])
        .map((s: string) => String(s).toUpperCase().replace(/[^A-Z0-9.\-]/g, "").slice(0, 12))
        .filter(Boolean)
        .slice(0, 24);
      if (!symbols.length) return Response.json({ quotes: [] });

      const quotes: any[] = [];
      for (let i = 0; i < symbols.length; i += 6) {
        const batch = symbols.slice(i, i + 6);
        const settled = await Promise.allSettled(batch.map((s: string) => fetchChart(s, "1d", "1d")));
        for (const r of settled) {
          if (r.status === "fulfilled" && r.value) {
            const q = quoteFrom(r.value);
            if (q) quotes.push(q);
          }
        }
      }
      return Response.json({ quotes });
    }

    if (action === "chart") {
      const symbol = String(body.symbol || "").toUpperCase().replace(/[^A-Z0-9.\-]/g, "").slice(0, 12);
      if (!symbol) return Response.json({ error: "symbol is required" }, { status: 400 });
      const range = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "5y"].includes(body.range) ? body.range : "1mo";
      const interval =
        range === "1d" ? "5m" : range === "5d" ? "30m" : range === "1y" || range === "5y" ? "1wk" : "1d";

      const result = await fetchChart(symbol, range, interval);
      if (!result) return Response.json({ error: "No market data for that symbol." }, { status: 404 });

      const stamps: number[] = result.timestamp || [];
      const closes: (number | null)[] = result.indicators?.quote?.[0]?.close || [];
      const points = stamps
        .map((t, i) => ({ t: t * 1000, c: closes[i] }))
        .filter((p) => typeof p.c === "number" && Number.isFinite(p.c));

      return Response.json({ ...(quoteFrom(result) || {}), symbol, range, points });
    }

    if (action === "list") {
      const limit = Math.min(Math.max(Number(body.limit) || 60, 1), 200);
      const offset = Math.max(Number(body.offset) || 0, 0);
      const res = await fetch(
        `https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=${limit}&offset=${offset}&exchange=NASDAQ`,
        {
          headers: { "User-Agent": UA, Accept: "application/json" },
          signal: AbortSignal.timeout(12000),
        },
      );
      const json = await res.json().catch(() => null);
      const rows = json?.data?.table?.rows || [];
      const total = Number(json?.data?.totalrecords) || rows.length;
      const list = rows.map((r: any) => ({
        symbol: r.symbol,
        name: r.name,
        price: num(r.lastsale),
        change: num(r.netchange),
        changePercent: num(String(r.pctchange || "").replace("%", "")),
        marketCap: num(r.marketCap),
      }));
      return Response.json({ rows: list, total });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("stockMarket failed", error);
    return Response.json({ error: "Market data is unavailable right now." }, { status: 502 });
  }
}