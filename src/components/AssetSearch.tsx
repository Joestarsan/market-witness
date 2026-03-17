"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { PythPriceFeed } from "@/lib/pyth";

interface AssetSearchProps {
  feeds: PythPriceFeed[];
  value: string;
  onChange: (feedId: string, label: string, symbol: string) => void;
}

export default function AssetSearch({ feeds, value, onChange }: AssetSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter feeds by query
  const filtered = useMemo(() => {
    if (!query.trim()) return feeds.slice(0, 50); // Show first 50 by default
    const q = query.toLowerCase();
    return feeds
      .filter(
        (f) =>
          f.attributes.base?.toLowerCase().includes(q) ||
          f.attributes.symbol?.toLowerCase().includes(q) ||
          f.attributes.description?.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [feeds, query]);

  // Group results by asset type
  const grouped = useMemo(() => {
    const groups: Record<string, PythPriceFeed[]> = {};
    for (const f of filtered) {
      const type = f.attributes.asset_type || "Other";
      const label =
        type === "Crypto" ? "Crypto" :
        type === "FX" ? "Forex" :
        type === "Metal" ? "Metals" :
        type === "Equity" ? "Equities" :
        type === "Rate" ? "Rates" :
        type;
      if (!groups[label]) groups[label] = [];
      groups[label].push(f);
    }
    return groups;
  }, [filtered]);

  const handleSelect = (feed: PythPriceFeed) => {
    const label = `${feed.attributes.base}/${feed.attributes.quote_currency}`;
    setSelectedLabel(label);
    setQuery("");
    setOpen(false);
    onChange(feed.id, label, feed.attributes.symbol || "");
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input */}
      <div
        className={`w-full h-10 bg-pyth-bg border rounded px-3 flex items-center cursor-pointer transition-colors ${
          open ? "border-pyth-purple" : "border-pyth-border"
        }`}
        onClick={() => setOpen(true)}
      >
        {value && !open ? (
          <span className="text-pyth-text text-sm">{selectedLabel}</span>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search ticker... BTC, SOL, AAPL, EUR..."
            className="w-full h-full bg-transparent text-pyth-text text-sm focus:outline-none placeholder:text-pyth-text-dim"
            autoComplete="off"
          />
        )}
        {value && !open && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange("", "", "");
              setSelectedLabel("");
              setQuery("");
            }}
            className="ml-auto text-pyth-text-dim hover:text-pyth-text text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-pyth-bg-panel border border-pyth-border rounded-lg shadow-xl z-30 max-h-64 overflow-y-auto">
          {Object.keys(grouped).length === 0 ? (
            <div className="p-3 text-center text-pyth-text-dim text-xs">
              No assets found
            </div>
          ) : (
            Object.entries(grouped).map(([group, assets]) => (
              <div key={group}>
                <div className="sticky top-0 bg-pyth-bg-card px-3 py-1.5 border-b border-pyth-border">
                  <span className="text-[7px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
                    {group}
                  </span>
                </div>
                {assets.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleSelect(f)}
                    className="w-full px-3 py-2 text-left hover:bg-pyth-purple/10 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-sm text-pyth-text">
                      {f.attributes.base}/{f.attributes.quote_currency}
                    </span>
                    <span className="text-[9px] text-pyth-text-dim">
                      {f.attributes.description?.slice(0, 30)}
                    </span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
