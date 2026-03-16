"use client";

import { useState } from "react";
import TradeInput, { type TradeData } from "@/components/TradeInput";
import Trial, { type TrialResult } from "@/components/Trial";
import Verdict from "@/components/Verdict";
import { collectTradeEvidence } from "@/lib/pyth";
import { generateMockTrial } from "@/lib/mockTrial";
import { generateAITrial } from "@/lib/ai";

type Phase = "input" | "loading" | "trial" | "verdict";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("input");
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  const [trialResult, setTrialResult] = useState<TrialResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("Querying Pyth Oracle Network...");

  const handleTradeSubmit = async (trade: TradeData) => {
    setTradeData(trade);
    setPhase("loading");
    setError(null);
    setLoadingMsg("Querying Pyth Oracle Network...");

    try {
      const evidence = await collectTradeEvidence(
        trade.feedId,
        trade.openTimestamp,
        trade.closeTimestamp
      );

      const exitPrice = evidence.closePrice ?? evidence.nowPrice;

      // Try AI first, fallback to mock
      let result: TrialResult;
      try {
        setLoadingMsg("AI is preparing the trial...");
        result = await generateAITrial({
          asset: trade.asset,
          action: trade.action,
          entryPrice: evidence.entryPrice,
          exitPrice,
          pricePctChange: evidence.pricePctChange,
          entryConf: evidence.entryConf,
          confPctOfPrice: evidence.confPctOfPrice,
          entryEma: evidence.entryEma,
          emaDivergence: evidence.emaDivergence,
          entryEmaConf: evidence.entryEmaConf,
          emaConfRatio: evidence.emaConfRatio,
          nowConf: evidence.nowConf,
          isClosed: evidence.isClosed,
          closePrice: evidence.closePrice,
          closePnl: evidence.closePnl,
          missedPnl: evidence.missedPnl,
        });
      } catch (aiErr) {
        console.warn("AI failed, using mock trial:", aiErr);
        result = generateMockTrial(trade.asset, trade.action, evidence);
      }

      setTrialResult(result);
      setPhase("trial");
    } catch (err) {
      console.error("Failed to collect evidence:", err);
      setError(
        "Failed to fetch oracle data. Try a more recent date (Pyth historical data may be limited)."
      );
      setPhase("input");
    }
  };

  const handleTrialComplete = () => {
    setPhase("verdict");
  };

  const handleRetry = () => {
    setTradeData(null);
    setTrialResult(null);
    setPhase("input");
  };

  if (phase === "input") {
    return (
      <>
        <TradeInput onSubmit={handleTradeSubmit} />
        {error && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md p-3 bg-pyth-red/10 border border-pyth-red/30 rounded-lg text-center">
            <p className="text-[10px] font-[var(--font-pixel)] text-pyth-red">
              {error}
            </p>
          </div>
        )}
      </>
    );
  }

  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <span className="font-[var(--font-pixel)] text-pyth-purple-light text-sm animate-pulse">
              Collecting evidence...
            </span>
          </div>
          <div className="flex gap-2 justify-center mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-pyth-purple rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-[8px] text-pyth-text-dim font-[var(--font-pixel)]">
            {loadingMsg}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "trial" && trialResult && tradeData) {
    return (
      <Trial
        result={trialResult}
        asset={tradeData.asset}
        onComplete={handleTrialComplete}
      />
    );
  }

  if (phase === "verdict" && trialResult && tradeData) {
    return (
      <Verdict
        result={trialResult}
        asset={tradeData.asset}
        action={tradeData.action}
        onRetry={handleRetry}
      />
    );
  }

  return null;
}
