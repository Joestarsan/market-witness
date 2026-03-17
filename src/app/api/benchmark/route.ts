import { NextRequest, NextResponse } from "next/server";

const BENCHMARKS_BASE = "https://benchmarks.pyth.network";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const timestamp = req.nextUrl.searchParams.get("timestamp");

  if (!symbol || !timestamp) {
    return NextResponse.json({ error: "Missing symbol or timestamp" }, { status: 400 });
  }

  const apiKey = process.env.PYTH_PRO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Pyth Pro key not configured" }, { status: 500 });
  }

  const ts = parseInt(timestamp);
  if (isNaN(ts) || ts < 0 || ts > Math.floor(Date.now() / 1000) + 86400) {
    return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
  }
  const from = ts - 3600;
  const to = ts + 3600;

  try {
    const res = await fetch(
      `${BENCHMARKS_BASE}/v1/shims/tradingview/history?symbol=${encodeURIComponent(symbol)}&resolution=5&from=${from}&to=${to}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Benchmarks API error" }, { status: res.status });
    }

    const data = await res.json();
    if (data.s !== "ok" || !data.t || data.t.length === 0) {
      return NextResponse.json({ benchmark: null });
    }

    const highs: number[] = data.h;
    const lows: number[] = data.l;
    const opens: number[] = data.o;
    const closes: number[] = data.c;
    const times: number[] = data.t;

    const periodHigh = Math.max(...highs);
    const periodLow = Math.min(...lows);
    const periodOpen = opens[0];
    const volatilityPct = periodOpen > 0 ? ((periodHigh - periodLow) / periodOpen) * 100 : 0;

    const preTradeCandles = times.filter((t) => t < ts);
    let preTradeTrend = 0;
    if (preTradeCandles.length >= 2) {
      preTradeTrend = opens[0] > 0
        ? ((closes[preTradeCandles.length - 1] - opens[0]) / opens[0]) * 100
        : 0;
    }

    return NextResponse.json({
      benchmark: {
        periodHigh,
        periodLow,
        periodOpen,
        periodClose: closes[closes.length - 1],
        volatilityPct,
        preTradeTrend,
        candles: data.t.length,
      },
    });
  } catch (err) {
    console.error("Benchmark fetch error:", err);
    return NextResponse.json({ benchmark: null });
  }
}
