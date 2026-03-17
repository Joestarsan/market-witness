"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { TrialResult } from "./Trial";
import { playGavel, playVictory, playGuilty } from "@/lib/sounds";

interface VerdictProps {
  result: TrialResult;
  asset: string;
  action: "BUY" | "SELL";
  onRetry: () => void;
}

export default function Verdict({ result, asset, action, onRetry }: VerdictProps) {
  const isGuilty = result.verdict === "GUILTY";
  const [showStamp, setShowStamp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    playGavel();
    const t0 = setTimeout(() => {
      if (isGuilty) playGuilty();
      else playVictory();
    }, 1200);
    const t1 = setTimeout(() => setShowStamp(true), 2500);
    const t2 = setTimeout(() => setShowDetails(true), 4000);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-center gap-3 py-4 border-b border-pyth-border bg-pyth-bg-panel">
        <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={20} height={20} />
        <span className="font-[var(--font-pixel)] text-[10px] text-pyth-purple-light uppercase tracking-wider">
          Pyth Trial — Verdict
        </span>
        <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={20} height={20} />
      </div>

      <div className="flex-1 flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          {/* Characters row — judge center, defense left, prosecution right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-end justify-between mb-8 px-4 pt-8"
          >
            {/* Defense — LEFT (Planck) */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={
                  !isGuilty
                    ? { y: [0, -10, 0], scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }
                    : { y: [0, 2, 0], scale: [1, 0.97, 1] }
                }
                transition={
                  !isGuilty
                    ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }
                className={`w-28 h-28 md:w-36 md:h-36 border-3 rounded-xl overflow-hidden mb-2 ${
                  !isGuilty
                    ? "border-pyth-green shadow-[0_0_30px_rgba(14,210,141,0.4)]"
                    : "border-pyth-border opacity-50 grayscale-[40%]"
                }`}
              >
                <Image
                  src={!isGuilty ? "/characters/planck-happy.png" : "/characters/planck-sad.png"}
                  alt="Planck"
                  width={144}
                  height={144}
                  className="pixel-render w-full h-full object-cover"
                />
              </motion.div>
              <span className={`text-[7px] font-[var(--font-pixel)] block ${!isGuilty ? "text-pyth-green" : "text-pyth-text-dim"}`}>
                PLANCK
              </span>
              <span className="text-[6px] font-[var(--font-pixel)] text-pyth-text-dim block">DEFENSE</span>
              <span className={`text-[8px] font-[var(--font-pixel)] mt-1 block ${!isGuilty ? "text-pyth-green" : "text-pyth-red"}`}>
                {!isGuilty ? "WINS!" : "LOSES"}
              </span>
            </motion.div>

            {/* Judge — CENTER (PIRB) */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center -mt-4"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 border-3 border-pyth-purple rounded-xl overflow-hidden mb-2 shadow-[0_0_30px_rgba(109,40,217,0.4)]">
                <Image src="/characters/pirb-v3.png" alt="PIRB" width={160} height={160} className="pixel-render w-full h-full object-cover" />
              </div>
              <span className="text-[8px] text-pyth-purple-light font-[var(--font-pixel)] block">
                JUDGE PIRB
              </span>
            </motion.div>

            {/* Prosecution — RIGHT (Chop) */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <motion.div
                animate={
                  isGuilty
                    ? { y: [0, -10, 0], scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }
                    : { y: [0, 2, 0], scale: [1, 0.97, 1] }
                }
                transition={
                  isGuilty
                    ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }
                className={`w-28 h-28 md:w-36 md:h-36 border-3 rounded-xl overflow-hidden mb-2 ${
                  isGuilty
                    ? "border-pyth-red shadow-[0_0_30px_rgba(239,68,68,0.4)]"
                    : "border-pyth-border opacity-50 grayscale-[40%]"
                }`}
              >
                <Image
                  src={isGuilty ? "/characters/chop-happy.png" : "/characters/chop-sad.png"}
                  alt="Chop"
                  width={144}
                  height={144}
                  className="pixel-render w-full h-full object-cover"
                />
              </motion.div>
              <span className={`text-[7px] font-[var(--font-pixel)] block ${isGuilty ? "text-pyth-red" : "text-pyth-text-dim"}`}>
                CHOP
              </span>
              <span className="text-[6px] font-[var(--font-pixel)] text-pyth-text-dim block">PROSECUTOR</span>
              <span className={`text-[8px] font-[var(--font-pixel)] mt-1 block ${isGuilty ? "text-pyth-green" : "text-pyth-red"}`}>
                {isGuilty ? "WINS!" : "LOSES"}
              </span>
            </motion.div>
          </motion.div>

          {/* Verdict banner with stamp */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", damping: 10 }}
            className="relative mb-6"
          >
            <div
              className={`text-center py-6 px-8 rounded-lg border-4 ${
                isGuilty
                  ? "bg-pyth-red/10 border-pyth-red"
                  : "bg-pyth-green/10 border-pyth-green"
              }`}
            >
              <h2
                className={`font-[var(--font-pixel)] text-3xl md:text-5xl objection-text ${
                  isGuilty ? "text-pyth-red" : "text-pyth-green"
                }`}
              >
                {result.verdict}
              </h2>
              <p className="text-[9px] font-[var(--font-pixel)] text-pyth-text-dim mt-2">
                The {action.toLowerCase()} of {asset} has been judged
              </p>
            </div>

            {/* Judge stamp */}
            {showStamp && (
              <motion.div
                initial={{ scale: 3, rotate: -30, opacity: 0 }}
                animate={{ scale: 1, rotate: -12, opacity: 0.8 }}
                transition={{ type: "spring", damping: 8, stiffness: 200 }}
                className="absolute top-4 right-4 md:top-6 md:right-8"
              >
                <div
                  className={`border-4 rounded-lg px-4 py-2 ${
                    isGuilty ? "border-pyth-red" : "border-pyth-green"
                  }`}
                >
                  <span
                    className={`font-[var(--font-pixel)] text-sm md:text-base ${
                      isGuilty ? "text-pyth-red" : "text-pyth-green"
                    }`}
                  >
                    {isGuilty ? "SENTENCED" : "ACQUITTED"}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Judge dialogue */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="dialogue-box bg-pyth-bg-panel rounded-lg p-5 md:p-6 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
                Judge
              </span>
              <span className="text-[7px] text-pyth-text-dim font-[var(--font-pixel)]">
                — Final Ruling
              </span>
            </div>
            <p className="text-sm leading-relaxed text-pyth-text mb-4">
              {result.verdictText}
            </p>

            {/* Score bar */}
            <div className="mt-4 mb-2">
              <div className="flex justify-between mb-1">
                <span className="text-[7px] font-[var(--font-pixel)] text-pyth-green">
                  GOOD TRADE
                </span>
                <span className="text-[7px] font-[var(--font-pixel)] text-pyth-red">
                  BAD TRADE
                </span>
              </div>
              <div className="h-3 bg-pyth-bg rounded-full overflow-hidden border border-pyth-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className={`h-full rounded-full ${
                    result.score > 60
                      ? "bg-pyth-red"
                      : result.score > 40
                      ? "bg-pyth-orange"
                      : "bg-pyth-green"
                  }`}
                />
              </div>
              <div className="text-center mt-1">
                <span className="text-[8px] font-[var(--font-pixel)] text-pyth-text-dim">
                  Guilt Score: {result.score}/100
                </span>
              </div>
            </div>

            {/* Closing message */}
            <div className="mt-4 pt-4 border-t border-pyth-border text-center">
              <p className="text-[9px] font-[var(--font-pixel)] text-pyth-text-dim italic">
                {isGuilty
                  ? "\"Study the oracle data more carefully next time. The Pyth Network sees all.\""
                  : "\"A well-informed trader is the market's greatest ally. The oracle approves.\""}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="flex gap-3 mb-8"
          >
            <button
              onClick={onRetry}
              className="flex-1 h-12 bg-pyth-purple text-white rounded-lg font-[var(--font-pixel)] text-[9px] uppercase hover:bg-pyth-purple-light transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={14} height={14} />
              New Trial
            </button>
            <button
              onClick={() => {
                // TODO: share functionality
                alert("Share coming soon!");
              }}
              className="flex-1 h-12 bg-pyth-bg-card border border-pyth-border text-pyth-text rounded-lg font-[var(--font-pixel)] text-[9px] uppercase hover:border-pyth-purple transition-colors cursor-pointer"
            >
              Share Verdict
            </button>
          </motion.div>

          {/* Show Evidence button */}
          {showDetails && !showEvidence && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-8"
            >
              <button
                onClick={() => setShowEvidence(true)}
                className="px-6 py-3 border border-pyth-border text-pyth-text-dim rounded-lg font-[var(--font-pixel)] text-[8px] uppercase hover:border-pyth-purple hover:text-pyth-text transition-colors cursor-pointer"
              >
                View Evidence Review
              </button>
            </motion.div>
          )}

          {/* Detailed Evidence Review — all cards */}
          {showEvidence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-pyth-border" />
                <span className="text-[9px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
                  Evidence Review
                </span>
                <div className="h-px flex-1 bg-pyth-border" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {result.rounds.map((round, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`rounded-lg p-4 border ${
                      round.type === "prosecution"
                        ? "bg-pyth-red/5 border-pyth-red/30"
                        : "bg-pyth-green/5 border-pyth-green/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={12} height={12} />
                      <span className="text-[7px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
                        {round.evidence.source}
                      </span>
                      <span
                        className={`ml-auto text-[6px] font-[var(--font-pixel)] px-2 py-0.5 rounded ${
                          round.type === "prosecution"
                            ? "bg-pyth-red/20 text-pyth-red"
                            : "bg-pyth-green/20 text-pyth-green"
                        }`}
                      >
                        {round.type === "prosecution" ? "AGAINST" : "IN FAVOR"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[8px] font-[var(--font-pixel)] text-pyth-text">
                        {round.evidence.label}
                      </span>
                      <span
                        className={`text-base font-bold ${
                          round.evidence.isPositive ? "text-pyth-green" : "text-pyth-red"
                        }`}
                      >
                        {round.evidence.value}
                      </span>
                    </div>
                    <p className="text-[10px] text-pyth-text-dim leading-relaxed mb-2">
                      {round.evidence.detail}
                    </p>
                    <p className="text-[10px] text-pyth-text leading-relaxed italic">
                      &quot;{round.text.slice(0, 100)}...&quot;
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Pyth branding footer */}
              <div className="text-center pb-8">
                <Image
                  src="/brand/pyth-logo-light.svg"
                  alt="Pyth Network"
                  width={100}
                  height={32}
                  className="mx-auto mb-2 opacity-50"
                />
                <span className="text-[7px] text-pyth-text-dim/40 font-[var(--font-pixel)]">
                  All evidence sourced from Pyth Oracle Network
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
