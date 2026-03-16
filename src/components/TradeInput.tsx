"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { fetchPriceFeedList, type PythPriceFeed } from "@/lib/pyth";
import AssetSearch from "./AssetSearch";

export interface TradeData {
  feedId: string;
  asset: string;
  action: "BUY" | "SELL";
  openTimestamp: number;
  closeTimestamp: number | null;
}

interface TradeInputProps {
  onSubmit: (trade: TradeData) => void;
}

export default function TradeInput({ onSubmit }: TradeInputProps) {
  const [feeds, setFeeds] = useState<PythPriceFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeed, setSelectedFeed] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [action, setAction] = useState<"BUY" | "SELL" | "">("");
  const [openDate, setOpenDate] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [stillOpen, setStillOpen] = useState(false);

  useEffect(() => {
    fetchPriceFeedList()
      .then((allFeeds) => {
        setFeeds(allFeeds);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isReady = selectedFeed && action && openDate && (closeDate || stillOpen);

  const handleSubmit = () => {
    if (!isReady) return;

    const openTs = Math.floor(new Date(openDate).getTime() / 1000);
    if (isNaN(openTs) || openTs <= 0) return;

    let closeTs: number | null = null;
    if (!stillOpen && closeDate) {
      closeTs = Math.floor(new Date(closeDate).getTime() / 1000);
      if (isNaN(closeTs) || closeTs <= 0) return;
    }

    onSubmit({
      feedId: selectedFeed,
      asset: selectedAsset,
      action: action as "BUY" | "SELL",
      openTimestamp: openTs,
      closeTimestamp: closeTs,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mx-auto"
      >
        {/* Pyth Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <Image src="/brand/pyth-logo-light.svg" alt="Pyth Network" width={120} height={40} priority />
        </motion.div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-2">
            <span className="text-pyth-purple-light text-[8px] tracking-[0.3em] uppercase font-[var(--font-pixel)]">
              Powered by Pyth Oracle
            </span>
          </motion.div>
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
            className="text-3xl md:text-4xl font-bold mb-3 font-[var(--font-pixel)] leading-relaxed"
          >
            <span className="text-pyth-purple-light">THE MARKET</span>
            <br />
            <span className="text-pyth-orange">WITNESS</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-2"
          >
            <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={16} height={16} />
            <span className="text-pyth-text-dim text-[9px] font-[var(--font-pixel)]">Your trades will be judged</span>
            <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={16} height={16} />
          </motion.div>
        </div>

        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="dialogue-box bg-pyth-bg-panel rounded-lg p-6 space-y-5"
        >
          {/* Asset Search */}
          <div>
            <label className="block text-[9px] text-pyth-text-dim font-[var(--font-pixel)] mb-2 uppercase">
              Select Asset
            </label>
            {loading ? (
              <div className="h-10 bg-pyth-bg rounded border border-pyth-border animate-pulse" />
            ) : (
              <AssetSearch
                feeds={feeds}
                value={selectedFeed}
                onChange={(feedId, label) => {
                  setSelectedFeed(feedId);
                  setSelectedAsset(label.split("/")[0] || "");
                }}
              />
            )}
          </div>

          {/* Action */}
          <div>
            <label className="block text-[9px] text-pyth-text-dim font-[var(--font-pixel)] mb-2 uppercase">
              What did you do?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setAction("BUY")}
                className={`flex-1 h-10 rounded border text-sm font-bold transition-all cursor-pointer ${
                  action === "BUY"
                    ? "bg-pyth-green/20 border-pyth-green text-pyth-green"
                    : "bg-pyth-bg border-pyth-border text-pyth-text-dim hover:border-pyth-green/50"
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setAction("SELL")}
                className={`flex-1 h-10 rounded border text-sm font-bold transition-all cursor-pointer ${
                  action === "SELL"
                    ? "bg-pyth-red/20 border-pyth-red text-pyth-red"
                    : "bg-pyth-bg border-pyth-border text-pyth-text-dim hover:border-pyth-red/50"
                }`}
              >
                SELL
              </button>
            </div>
          </div>

          {/* Open Date */}
          <div>
            <label className="block text-[9px] text-pyth-text-dim font-[var(--font-pixel)] mb-2 uppercase">
              When did you open?
            </label>
            <input
              type="datetime-local"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
              className="w-full h-10 bg-pyth-bg border border-pyth-border rounded px-3 text-pyth-text text-sm focus:border-pyth-purple focus:outline-none"
            />
          </div>

          {/* Close Date */}
          <div>
            <label className="block text-[9px] text-pyth-text-dim font-[var(--font-pixel)] mb-2 uppercase">
              When did you close?
            </label>
            <div className="space-y-2">
              <input
                type="datetime-local"
                value={closeDate}
                onChange={(e) => { setCloseDate(e.target.value); setStillOpen(false); }}
                min={openDate}
                max={new Date().toISOString().slice(0, 16)}
                disabled={stillOpen}
                className={`w-full h-10 bg-pyth-bg border border-pyth-border rounded px-3 text-pyth-text text-sm focus:border-pyth-purple focus:outline-none ${stillOpen ? "opacity-40" : ""}`}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stillOpen}
                  onChange={(e) => { setStillOpen(e.target.checked); if (e.target.checked) setCloseDate(""); }}
                  className="accent-pyth-purple"
                />
                <span className="text-[8px] text-pyth-text-dim font-[var(--font-pixel)]">
                  Still open (judge current position)
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={!isReady}
            whileHover={isReady ? { scale: 1.02 } : {}}
            whileTap={isReady ? { scale: 0.98 } : {}}
            className={`w-full h-14 rounded-lg font-[var(--font-pixel)] text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-3 ${
              isReady
                ? "bg-pyth-purple text-white hover:bg-pyth-purple-light shadow-lg shadow-pyth-purple/30 cursor-pointer"
                : "bg-pyth-border text-pyth-text-dim cursor-not-allowed"
            }`}
          >
            {isReady && <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={18} height={18} />}
            {isReady ? "Start Trial" : "Fill all fields..."}
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-6">
          <span className="text-[7px] text-pyth-text-dim/50 font-[var(--font-pixel)]">
            Evidence sourced from Pyth Price Feeds, Pyth Pro & Benchmarks
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
