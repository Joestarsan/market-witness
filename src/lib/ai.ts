import type { TrialResult, TrialRound } from "@/components/Trial";

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

const SYSTEM_PROMPT = `You are the AI engine for "The Market Witness" — a courtroom drama game where trades are judged using real Pyth Oracle data.

You generate a structured trial with prosecution and defense rounds. Each round references REAL data from the Pyth Network oracle.

Rules:
- Be dramatic and entertaining, like Ace Attorney
- Use specific numbers from the provided data
- Prosecution tries to prove the trade was bad
- Defense tries to justify the trade
- Each round should focus on a different data point
- Reference "Pyth Oracle", "Pyth Network", "Pyth confidence interval", "Pyth EMA" etc.
- Keep each line under 200 characters for readability
- Be witty and occasionally sarcastic
- The verdict should be based on the actual data, not random`;

export async function generateAITrial(context: TradeContext): Promise<TrialResult> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

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
      "text": "dramatic prosecution argument referencing specific Pyth data",
      "evidence": {
        "label": "data point name",
        "source": "Pyth Price Feeds or Pyth Price Feeds — EMA or Pyth Price Feeds — Confidence",
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
  "verdictText": "Judge's detailed ruling paragraph referencing Pyth data",
  "score": 65
}

Generate 6-8 rounds alternating prosecution/defense. Score 0-100 (higher = more guilty). Base verdict on actual data quality.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://market-witness.vercel.app",
      "X-Title": "The Market Witness",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("OpenRouter error:", errText);
    throw new Error("AI generation failed");
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No content from AI");
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = content;
  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  }

  const trial: TrialResult = JSON.parse(jsonStr.trim());

  // Validate structure
  if (!trial.rounds || !trial.verdict || !trial.verdictText || trial.score === undefined) {
    throw new Error("Invalid trial structure from AI");
  }

  return trial;
}
