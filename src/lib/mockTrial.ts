import type { TrialResult, TrialRound } from "@/components/Trial";

export function generateMockTrial(
  asset: string,
  action: "BUY" | "SELL",
  evidence: {
    entryPrice: number;
    nowPrice: number;
    pricePctChange: number;
    confPctOfPrice: number;
    emaDivergence: number;
    emaConfRatio: number;
    entryConf: number;
    entryEma: number;
    entryEmaConf: number;
    nowConf: number;
    closePrice: number | null;
    closeConf: number | null;
    closePnl: number | null;
    missedPnl: number | null;
    isClosed: boolean;
    openTimestamp: number;
    closeTimestamp: number | null;
    currentTimestamp: number;
    benchmark: {
      periodHigh: number;
      periodLow: number;
      volatilityPct: number;
      preTradeTrend: number;
    } | null;
  }
): TrialResult {
  const isBuy = action === "BUY";
  const priceWentUp = evidence.pricePctChange > 0;
  const tradeProfitable = isBuy ? priceWentUp : !priceWentUp;
  const highUncertainty = evidence.confPctOfPrice > 0.5;
  const againstTrend = isBuy ? evidence.emaDivergence > 1 : evidence.emaDivergence < -1;

  const exitPrice = evidence.closePrice ?? evidence.nowPrice;
  const exitLabel = evidence.isClosed ? "at close" : "current";

  const rounds: TrialRound[] = [
    // 1: Prosecution — Entry price
    {
      type: "prosecution",
      label: "Entry Analysis",
      text: tradeProfitable
        ? `The defendant ${action.toLowerCase() === "buy" ? "bought" : "sold"} ${asset} at $${evidence.entryPrice.toFixed(2)} and it moved ${Math.abs(evidence.pricePctChange).toFixed(2)}% in their favor. Skill or pure luck? Let the data decide!`
        : `The defendant ${action.toLowerCase() === "buy" ? "bought" : "sold"} ${asset} at $${evidence.entryPrice.toFixed(2)} and it's down ${Math.abs(evidence.pricePctChange).toFixed(2)}%. This trade is underwater. The numbers don't lie!`,
      evidence: {
        label: "Price at Entry vs " + exitLabel,
        source: "Pyth Price Feeds",
        value: `${evidence.pricePctChange > 0 ? "+" : ""}${evidence.pricePctChange.toFixed(2)}%`,
        detail: `Entry: $${evidence.entryPrice.toFixed(2)} → ${exitLabel}: $${exitPrice.toFixed(2)}`,
        isPositive: tradeProfitable,
        rawField: "price",
        sampledAt: evidence.openTimestamp,
      },
    },
    // 2: Defense — EMA context
    {
      type: "defense",
      label: "Market Context",
      text: evidence.entryEma > 0
        ? (tradeProfitable
          ? `The moving average at entry was $${evidence.entryEma.toFixed(2)}. My client entered ${Math.abs(evidence.emaDivergence) < 0.5 ? "right at fair value" : "reading the trend correctly"}. The ${Math.abs(evidence.pricePctChange).toFixed(2)}% profit speaks for itself!`
          : `The moving average showed $${evidence.entryEma.toFixed(2)} at entry, only ${Math.abs(evidence.emaDivergence).toFixed(2)}% divergence. Entry was at a reasonable level. This move is within normal ${asset} volatility!`)
        : (tradeProfitable
          ? `My client's ${Math.abs(evidence.pricePctChange).toFixed(2)}% profit proves this was a calculated move, not gambling. The result speaks louder than any indicator!`
          : `The price moved against my client, yes. But a ${Math.abs(evidence.pricePctChange).toFixed(2)}% move is within normal ${asset} volatility. That's trading, not a crime!`),
      evidence: {
        label: "EMA Price at Entry",
        source: "Pyth Price Feeds — EMA",
        value: evidence.entryEma > 0 ? `$${evidence.entryEma.toFixed(2)}` : "N/A",
        detail: evidence.entryEma > 0 ? `Divergence from spot: ${evidence.emaDivergence > 0 ? "+" : ""}${evidence.emaDivergence.toFixed(2)}%. ${Math.abs(evidence.emaDivergence) < 1 ? "Stable market." : "Active trend."}` : "EMA data unavailable for this timestamp.",
        isPositive: !againstTrend,
        rawField: "ema_price",
        sampledAt: evidence.openTimestamp,
      },
    },
    // 3: Prosecution — Confidence
    {
      type: "prosecution",
      label: "Uncertainty Evidence",
      text: highUncertainty
        ? `The market spread was ${evidence.confPctOfPrice.toFixed(3)}% wide when this trade happened. That's massive uncertainty! Trading in that chaos is reckless.`
        : `Sure, the spread was tight at ${evidence.confPctOfPrice.toFixed(3)}%. But knowing the exact price doesn't mean knowing the direction. Price certainty is not directional certainty!`,
      evidence: {
        label: "Confidence Interval at Entry",
        source: "Pyth Price Feeds — Confidence",
        value: `±$${evidence.entryConf.toFixed(4)}`,
        detail: `${evidence.confPctOfPrice.toFixed(3)}% of price. ${highUncertainty ? "HIGH uncertainty." : "LOW uncertainty - publishers agreed."}`,
        isPositive: !highUncertainty,
        rawField: "conf",
        sampledAt: evidence.openTimestamp,
      },
    },
    // 4: Defense — Data quality
    {
      type: "defense",
      label: "Oracle Reliability",
      text: highUncertainty
        ? `My client knew the spread was wide and sized accordingly. That's risk management, not recklessness!`
        : `The tight spread proves my client picked the perfect moment. Clean data, precise entry. That IS quality trading!`,
      evidence: {
        label: "EMA Confidence Trend",
        source: "Pyth Price Feeds — EMA Conf",
        value: evidence.entryEmaConf > 0 ? `±$${evidence.entryEmaConf.toFixed(4)}` : "N/A",
        detail: evidence.emaConfRatio !== 1 ? `Ratio: ${evidence.emaConfRatio.toFixed(2)}x. ${evidence.emaConfRatio < 1.2 ? "Stable." : "Shifting conditions."}` : "EMA confidence data unavailable for this timestamp.",
        isPositive: evidence.emaConfRatio < 1.5,
        rawField: "ema_conf",
        sampledAt: evidence.openTimestamp,
      },
    },
    // 5: Prosecution — Trend
    {
      type: "prosecution",
      label: "Trend Evidence",
      text: againstTrend
        ? `The price was trending ${evidence.emaDivergence > 0 ? "up" : "down"} and the defendant went the other way. Counter-trend without a thesis is gambling!`
        : `Even trading with the trend, there's zero edge here. Just following the crowd with ${Math.abs(evidence.emaDivergence).toFixed(2)}% divergence. No alpha, just noise!`,
      evidence: {
        label: "Trend Direction",
        source: "Pyth Price Feeds — EMA vs Spot",
        value: `${evidence.emaDivergence > 0 ? "+" : ""}${evidence.emaDivergence.toFixed(2)}%`,
        detail: againstTrend ? "COUNTER-TREND entry." : "TREND-ALIGNED entry.",
        isPositive: !againstTrend,
        rawField: "ema_price vs price",
        sampledAt: evidence.openTimestamp,
      },
    },
  ];

  // Benchmark context round (Pyth Pro)
  if (evidence.benchmark) {
    const bm = evidence.benchmark;
    const highVolatility = bm.volatilityPct > 2;
    const preTrendAgainst = isBuy ? bm.preTradeTrend < -0.5 : bm.preTradeTrend > 0.5;

    rounds.push({
      type: "prosecution",
      label: "Market Context",
      text: highVolatility
        ? `Pyth Pro Benchmarks reveal the 2-hour window around this trade had ${bm.volatilityPct.toFixed(2)}% volatility! The price swung from $${bm.periodLow.toFixed(2)} to $${bm.periodHigh.toFixed(2)}. Trading in such chaos without proper risk management is reckless!`
        : preTrendAgainst
        ? `Pyth Pro Benchmarks show the hour before this trade, the price was already moving ${bm.preTradeTrend > 0 ? "up" : "down"} ${Math.abs(bm.preTradeTrend).toFixed(2)}%. The defendant entered against the established short-term momentum!`
        : `According to Pyth Pro Benchmarks, the 2-hour period showed only ${bm.volatilityPct.toFixed(2)}% volatility. In such a calm market, this trade had no meaningful edge to exploit!`,
      evidence: {
        label: "Period Volatility",
        source: "Pyth Pro Benchmarks",
        value: `${bm.volatilityPct.toFixed(2)}%`,
        detail: `2hr OHLC range: $${bm.periodLow.toFixed(2)} - $${bm.periodHigh.toFixed(2)}. Pre-trade trend: ${bm.preTradeTrend > 0 ? "+" : ""}${bm.preTradeTrend.toFixed(2)}%`,
        isPositive: false,
        rawField: "OHLC high/low",
        sampledAt: evidence.openTimestamp,
      },
    });

    rounds.push({
      type: "defense",
      label: "Benchmark Defense",
      text: highVolatility
        ? `The high volatility shown by Pyth Pro Benchmarks actually proves my client read the market correctly! Volatility creates opportunity. The ${bm.volatilityPct.toFixed(2)}% range means there was real price action to capture!`
        : !preTrendAgainst
        ? `Pyth Pro Benchmarks confirm the pre-trade trend of ${bm.preTradeTrend > 0 ? "+" : ""}${bm.preTradeTrend.toFixed(2)}% was aligned with my client's position. They traded WITH the short-term momentum!`
        : `The calm market conditions shown by Pyth Pro Benchmarks prove this was a low-risk environment. My client chose a stable moment to enter, minimizing downside risk!`,
      evidence: {
        label: "Pre-trade Momentum",
        source: "Pyth Pro Benchmarks",
        value: `${bm.preTradeTrend > 0 ? "+" : ""}${bm.preTradeTrend.toFixed(2)}%`,
        detail: `1hr trend before trade. ${!preTrendAgainst ? "Aligned with position." : "Against position, but context matters."}`,
        isPositive: !preTrendAgainst,
        rawField: "OHLC open/close",
        sampledAt: evidence.openTimestamp,
      },
    });
  }

  // If trade is closed — analyze the exit
  if (evidence.isClosed && evidence.closePrice && evidence.closePnl !== null && evidence.missedPnl !== null) {
    const closedTooEarly = isBuy
      ? evidence.missedPnl > 5
      : evidence.missedPnl < -5;
    const closedTooLate = isBuy
      ? evidence.closePnl < 0 && evidence.missedPnl > 0
      : evidence.closePnl > 0 && evidence.missedPnl < 0;

    rounds.push({
      type: "prosecution",
      label: "Exit Timing",
      text: closedTooEarly
        ? `The defendant closed at $${evidence.closePrice.toFixed(2)}, locking in ${evidence.closePnl.toFixed(2)}% — but the price has since moved another ${Math.abs(evidence.missedPnl).toFixed(2)}%! They left money on the table. Premature exit is a crime against profit!`
        : closedTooLate
        ? `The defendant held too long and closed at $${evidence.closePrice.toFixed(2)} for ${evidence.closePnl.toFixed(2)}%. The oracle shows they should have exited earlier when conditions deteriorated!`
        : `The defendant exited at $${evidence.closePrice.toFixed(2)}. While the timing was acceptable, the Pyth data shows there was a better exit window available!`,
      evidence: {
        label: "Exit P&L vs Current",
        source: "Pyth Price Feeds",
        value: `${evidence.closePnl > 0 ? "+" : ""}${evidence.closePnl.toFixed(2)}%`,
        detail: `Closed at $${evidence.closePrice.toFixed(2)}. If held: additional ${evidence.missedPnl > 0 ? "+" : ""}${evidence.missedPnl.toFixed(2)}% move since.`,
        isPositive: false,
      },
    });

    rounds.push({
      type: "defense",
      label: "Exit Defense",
      text: closedTooEarly
        ? `Hindsight is 20/20, Your Honor! At the exit, the Pyth confidence was shifting. My client took profit responsibly — no one ever went broke taking gains. The subsequent move was unpredictable!`
        : evidence.closePnl > 0
        ? `My client locked in a ${evidence.closePnl.toFixed(2)}% profit! That IS the goal of trading. The exit confidence at $${evidence.closeConf?.toFixed(4) ?? "N/A"} suggested growing uncertainty — exiting was the prudent choice!`
        : `Market conditions at exit showed deteriorating confidence. My client cut losses — the most important skill in trading! Living to trade another day is not a crime!`,
      evidence: {
        label: "Confidence at Close",
        source: "Pyth Price Feeds — Confidence",
        value: evidence.closeConf ? `±$${evidence.closeConf.toFixed(4)}` : "N/A",
        detail: evidence.closeConf && evidence.entryConf
          ? `${evidence.closeConf > evidence.entryConf ? "WIDER than entry — uncertainty was growing." : "TIGHTER than entry — conditions were stable."}`
          : "Close confidence data.",
        isPositive: true,
      },
    });
  } else {
    // Still open — final defense
    rounds.push({
      type: "defense",
      label: "Position Status",
      text: tradeProfitable
        ? `My client's position is STILL OPEN and currently ${Math.abs(evidence.pricePctChange).toFixed(2)}% in profit! The conviction to hold shows confidence. Current Pyth data confirms the thesis is playing out!`
        : `My client's position is still open — they haven't realized any loss yet. The Pyth EMA suggests a potential reversal. Diamond hands are not a crime, Your Honor!`,
      evidence: {
        label: "Current Unrealized P&L",
        source: "Pyth Price Feeds — Live",
        value: `${evidence.pricePctChange > 0 ? "+" : ""}${evidence.pricePctChange.toFixed(2)}%`,
        detail: `Position open. Current price: $${evidence.nowPrice.toFixed(2)}. Confidence: ±$${evidence.nowConf.toFixed(4)}.`,
        isPositive: tradeProfitable,
      },
    });
  }

  // Guilt score
  let score = 50;
  if (!tradeProfitable) score += 20;
  if (highUncertainty) score += 15;
  if (againstTrend) score += 10;
  if (tradeProfitable) score -= 20;
  if (!highUncertainty) score -= 10;
  if (evidence.emaConfRatio < 1.2) score -= 5;
  // Exit analysis adjustments
  if (evidence.isClosed && evidence.closePnl !== null) {
    if (evidence.closePnl > 0) score -= 10;
    if (evidence.closePnl < -5) score += 10;
    if (evidence.missedPnl !== null && Math.abs(evidence.missedPnl) > 10) score += 5;
  }
  score = Math.max(5, Math.min(95, score));

  const verdict = score > 50 ? "GUILTY" : "NOT GUILTY";

  const exitContext = evidence.isClosed
    ? `The exit at $${evidence.closePrice?.toFixed(2)} ${evidence.closePnl && evidence.closePnl > 0 ? "secured a profit" : "resulted in a loss"}, ${evidence.missedPnl && Math.abs(evidence.missedPnl) > 5 ? "though significant price movement followed" : "and the timing was reasonable"}.`
    : `The position remains open with ${tradeProfitable ? "unrealized gains" : "unrealized losses"}.`;

  const verdictText =
    verdict === "GUILTY"
      ? `After examining all evidence from the Pyth Oracle Network, this court finds the ${action.toLowerCase()} of ${asset} GUILTY. ${exitContext} The combination of ${!tradeProfitable ? "negative returns" : "questionable timing"}, ${highUncertainty ? "high uncertainty at entry" : "false confidence"}, and ${againstTrend ? "counter-trend positioning" : "lack of edge"} demonstrates poor judgment. Study the oracle data more carefully next time.`
      : `After reviewing all Pyth oracle evidence, this court finds the defendant NOT GUILTY. The ${action.toLowerCase()} of ${asset} was ${tradeProfitable ? "profitable and well-reasoned" : "defensible given conditions"}. ${exitContext} The confidence data shows ${!highUncertainty ? "strong publisher consensus at entry" : "risk awareness"}, and the trend analysis ${!againstTrend ? "confirms aligned execution" : "shows contrarian conviction"}. The defendant is free to trade again.`;

  return { rounds, verdict, verdictText, score };
}
