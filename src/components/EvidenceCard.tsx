"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export interface EvidenceData {
  label: string;
  source: string;
  value: string;
  detail: string;
  isPositive: boolean;
}

interface EvidenceCardProps {
  evidence: EvidenceData;
  index: number;
}

export default function EvidenceCard({ evidence, index }: EvidenceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`dialogue-box bg-pyth-bg rounded-lg p-4 relative overflow-hidden ${
        evidence.isPositive ? "border-pyth-green" : "border-pyth-red"
      }`}
      style={{
        borderColor: evidence.isPositive
          ? "var(--color-pyth-green)"
          : "var(--color-pyth-red)",
      }}
    >
      {/* Source badge */}
      <div className="flex items-center gap-2 mb-2">
        <Image
          src="/brand/pyth-logo-symbol-dark.svg"
          alt=""
          width={12}
          height={12}
        />
        <span className="text-[7px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
          {evidence.source}
        </span>
        <span
          className={`ml-auto text-[7px] font-[var(--font-pixel)] px-2 py-0.5 rounded ${
            evidence.isPositive
              ? "bg-pyth-green/20 text-pyth-green"
              : "bg-pyth-red/20 text-pyth-red"
          }`}
        >
          {evidence.isPositive ? "DEFENSE" : "PROSECUTION"}
        </span>
      </div>

      {/* Label */}
      <h4 className="text-[9px] font-[var(--font-pixel)] text-pyth-text mb-1">
        {evidence.label}
      </h4>

      {/* Value */}
      <div
        className={`text-lg font-bold mb-1 ${
          evidence.isPositive ? "text-pyth-green" : "text-pyth-red"
        }`}
      >
        {evidence.value}
      </div>

      {/* Detail */}
      <p className="text-[10px] text-pyth-text-dim leading-relaxed">
        {evidence.detail}
      </p>

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
        <div
          className={`absolute -top-4 -right-4 w-8 h-8 rotate-45 ${
            evidence.isPositive ? "bg-pyth-green/10" : "bg-pyth-red/10"
          }`}
        />
      </div>
    </motion.div>
  );
}
