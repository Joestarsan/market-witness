import type { TrialResult } from "@/components/Trial";

interface TradeContext {
  asset: string;
  action: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  pricePctChange: number;
  entryConf: number;
  confPctOfPrice: number;
  entryEma: number;
  emaDivergence: number;
  entryEmaConf: number;
  emaConfRatio: number;
  nowConf: number;
  isClosed: boolean;
  closePrice: number | null;
  closePnl: number | null;
  missedPnl: number | null;
  benchmark: {
    periodHigh: number;
    periodLow: number;
    volatilityPct: number;
    preTradeTrend: number;
  } | null;
}

export async function generateAITrial(context: TradeContext): Promise<TrialResult> {
  const fmt = (n: number | null | undefined, decimals = 2) => {
    if (n === null || n === undefined || isNaN(n)) return "N/A";
    return n.toFixed(decimals);
  };

  const emaAvailable = context.entryEma > 0 && !isNaN(context.entryEma);

  const userPrompt = `Generate a courtroom trial for this trade:

TRADE DATA (from Pyth Oracle):
- Asset: ${context.asset}
- Action: ${context.action}
- Entry Price: $${fmt(context.entryPrice)}
- ${context.isClosed ? `Exit Price: $${fmt(context.closePrice)}` : `Current Price: $${fmt(context.exitPrice)}`}
- P&L: ${context.pricePctChange > 0 ? "+" : ""}${fmt(context.pricePctChange)}%
- Pyth Confidence at Entry: ±$${fmt(context.entryConf, 4)} (${fmt(context.confPctOfPrice, 3)}% of price)
${emaAvailable ? `- Pyth EMA at Entry: $${fmt(context.entryEma)} (${context.emaDivergence > 0 ? "+" : ""}${fmt(context.emaDivergence)}% divergence)
- EMA Confidence: ±$${fmt(context.entryEmaConf, 4)} (ratio: ${fmt(context.emaConfRatio)}x)` : "- Pyth EMA: Not available for this timestamp (use other evidence instead)"}
- Current Confidence: ±$${fmt(context.nowConf, 4)}
${context.isClosed ? `- Trade P&L at Close: ${fmt(context.closePnl)}%\n- Price Move After Close: ${fmt(context.missedPnl)}%` : "- Position: STILL OPEN"}
${context.benchmark ? `
PYTH PRO BENCHMARKS DATA (2-hour window around trade):
- Period High: $${fmt(context.benchmark.periodHigh)}
- Period Low: $${fmt(context.benchmark.periodLow)}
- Period Volatility: ${fmt(context.benchmark.volatilityPct)}%
- Pre-trade Trend (1hr before): ${context.benchmark.preTradeTrend > 0 ? "+" : ""}${fmt(context.benchmark.preTradeTrend)}%
Use this Pyth Pro Benchmarks data as additional evidence. Reference "Pyth Pro Benchmarks" as the source.` : ""}

IMPORTANT: If any data shows "N/A", do NOT reference it. Use only available data points. Never show NaN in output.

Respond with ONLY valid JSON in this exact format:
{
  "rounds": [
    {
      "type": "prosecution",
      "label": "short label for this argument",
      "text": "dramatic prosecution argument referencing specific data",
      "evidence": {
        "label": "data point name",
        "source": "Pyth Price Feeds or Pyth Price Feeds - EMA or Pyth Price Feeds - Confidence or Pyth Pro Benchmarks",
        "value": "the specific value like +5.2% or ±$0.0012",
        "detail": "one line explanation of this data point",
        "isPositive": false
      }
    },
    {
      "type": "defense",
      "label": "short label",
      "text": "dramatic defense argument",
      "evidence": {
        "label": "data point name",
        "source": "Pyth source",
        "value": "specific value",
        "detail": "explanation",
        "isPositive": true
      }
    }
  ],
  "verdict": "GUILTY" or "NOT GUILTY",
  "verdictText": "Judge's ruling in 2-3 sentences max",
  "score": 65
}

Generate exactly 4-6 rounds alternating prosecution/defense. Each "text" field must be MAX 2 sentences, punchy and dramatic. Score 0-100 (higher = more guilty). Base verdict on actual data quality. Keep verdictText to 2-3 sentences max.`;

  const res = await fetch("/api/trial", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userPrompt }),
  });

  if (!res.ok) {
    throw new Error("AI trial generation failed");
  }

  const data = await res.json();
  return data.trial as TrialResult;
}
