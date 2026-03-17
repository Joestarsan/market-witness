"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { EvidenceData } from "./EvidenceCard";
import { playObjection, playHoldIt, playReveal, playGavel, playTypeClick } from "@/lib/sounds";

export interface TrialRound {
  type: "prosecution" | "defense";
  label: string;
  text: string;
  evidence: EvidenceData;
}

export interface TrialResult {
  rounds: TrialRound[];
  verdict: "GUILTY" | "NOT GUILTY";
  verdictText: string;
  score: number;
}

interface TrialProps {
  result: TrialResult;
  asset: string;
  onComplete: () => void;
}

interface ChatMessage {
  type: "prosecution" | "defense" | "judge";
  label?: string;
  text: string;
  evidence?: EvidenceData;
}

export default function Trial({ result, asset, onComplete }: TrialProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRound, setCurrentRound] = useState(-1); // -1 = intro
  const [displayingText, setDisplayingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCallout, setShowCallout] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [trialDone, setTrialDone] = useState(false);
  const [showCurrentEvidence, setShowCurrentEvidence] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typeCleanupRef = useRef<(() => void) | null>(null);
  const skipRef = useRef<{ text: string; onDone: () => void } | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const skipTyping = useCallback(() => {
    if (skipRef.current && isTyping) {
      typeCleanupRef.current?.();
      setDisplayingText(skipRef.current.text);
      setIsTyping(false);
      const onDone = skipRef.current.onDone;
      skipRef.current = null;
      onDone();
    }
  }, [isTyping]);

  const typeText = useCallback(
    (text: string, onDone: () => void) => {
      setIsTyping(true);
      setDisplayingText("");
      skipRef.current = { text, onDone };
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayingText(text.slice(0, i + 1));
          i++;
          if (i % 8 === 0) playTypeClick();
          if (i % 20 === 0) scrollToBottom();
        } else {
          clearInterval(interval);
          setIsTyping(false);
          onDone();
        }
      }, 15);
      typeCleanupRef.current = () => clearInterval(interval);
      return () => clearInterval(interval);
    },
    [scrollToBottom]
  );

  // Start intro
  useEffect(() => {
    if (currentRound !== -1) return;
    playGavel();
    const cleanup = typeText(
      `The court is now in session for the trial of the ${asset} trade. Both timestamps have been reconstructed from Pyth Pro historical records. All evidence will be sourced from Pyth Price Feeds and Pyth Pro Benchmarks. All rise!`,
      () => {
        // Commit intro message
        setMessages([
          {
            type: "judge",
            text: `The court is now in session for the trial of the ${asset} trade. Both timestamps have been reconstructed from Pyth Pro historical records. All evidence will be sourced from Pyth Price Feeds and Pyth Pro Benchmarks. All rise!`,
          },
        ]);
        setDisplayingText("");
        setTimeout(() => setCurrentRound(0), 800);
      }
    );
    return cleanup;
  }, [currentRound, asset, typeText]);

  // Play each round
  useEffect(() => {
    if (currentRound < 0 || currentRound >= result.rounds.length) return;

    const round = result.rounds[currentRound];
    const prosecutionCallouts = ["OBJECTION!", "TAKE THAT!", "NOT SO FAST!"];
    const defenseCallouts = ["HOLD IT!", "WAIT!", "I OBJECT!"];
    const callouts = round.type === "prosecution" ? prosecutionCallouts : defenseCallouts;
    const callout = callouts[currentRound % callouts.length];

    // Show callout + sound
    setShowCallout(callout);
    setShaking(true);
    setShowCurrentEvidence(false);
    if (round.type === "prosecution") playObjection();
    else playHoldIt();

    const t1 = setTimeout(() => setShaking(false), 500);
    const t2 = setTimeout(() => {
      setShowCallout(null);
      // Type the message
      const cleanup = typeText(round.text, () => {
        // Done typing — show evidence card + sound
        setShowCurrentEvidence(true);
        playReveal();
        scrollToBottom();
      });
      return cleanup;
    }, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      typeCleanupRef.current?.();
    };
  }, [currentRound, result.rounds, typeText, scrollToBottom]);

  // Handle advance to next round
  const handleAdvance = useCallback(() => {
    if (isTyping || currentRound < 0 || !showCurrentEvidence || trialDone) return;

    const round = result.rounds[currentRound];

    // Commit current message to chat
    setMessages((prev) => [
      ...prev,
      {
        type: round.type,
        label: round.label,
        text: round.text,
        evidence: round.evidence,
      },
    ]);
    setDisplayingText("");
    setShowCurrentEvidence(false);

    if (currentRound + 1 < result.rounds.length) {
      setCurrentRound((r) => r + 1);
    } else {
      // All rounds done
      setTrialDone(true);
    }
  }, [isTyping, currentRound, result.rounds, showCurrentEvidence, trialDone]);

  // Keyboard listener for advancing
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isTyping && showCurrentEvidence && !trialDone && (e.key === " " || e.key === "Enter" || e.key === "ArrowRight")) {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isTyping, showCurrentEvidence, trialDone, handleAdvance]);

  const currentRoundData =
    currentRound >= 0 && currentRound < result.rounds.length
      ? result.rounds[currentRound]
      : null;

  return (
    <div className={`min-h-screen flex flex-col ${shaking ? "shake" : ""}`}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-center gap-3 py-3 border-b border-pyth-border bg-pyth-bg-panel/95 backdrop-blur-sm">
        <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={18} height={18} />
        <span className="font-[var(--font-pixel)] text-[10px] text-pyth-purple-light uppercase tracking-wider">
          Pyth Trial — {asset}
        </span>
        <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={18} height={18} />
      </div>

      {/* OBJECTION / HOLD IT overlay */}
      {showCallout && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            pointerEvents: "none",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glow flash */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: currentRoundData?.type === "prosecution"
                ? "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 60%)"
                : "radial-gradient(circle, rgba(14,210,141,0.4) 0%, transparent 60%)",
              animation: "fadeOut 1s forwards",
            }}
          />
          {/* Callout badge - pure opacity, no scale/movement */}
          <div
            className={`px-12 py-8 md:px-16 md:py-10 rounded-2xl ${
              currentRoundData?.type === "prosecution"
                ? "bg-pyth-red shadow-[0_0_100px_rgba(239,68,68,0.7)]"
                : "bg-pyth-green shadow-[0_0_100px_rgba(14,210,141,0.7)]"
            }`}
            style={{
              animation: "calloutPop 0.3s ease-out",
              transform: "rotate(-2deg)",
            }}
          >
            <span className="font-[var(--font-pixel)] text-3xl md:text-7xl text-white objection-text whitespace-nowrap">
              {showCallout}
            </span>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6" onClick={() => {
        if (isTyping) skipTyping();
        else if (showCurrentEvidence && !trialDone) handleAdvance();
      }}>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Committed messages */}
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}

          {/* Currently typing message */}
          {displayingText && currentRoundData && (
            <div className="flex gap-3 items-start">
              {/* Left side: Defense speaking or reacting */}
              <motion.div
                animate={
                  currentRoundData.type === "defense" && isTyping
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
                }
                transition={
                  currentRoundData.type === "defense" && isTyping
                    ? { duration: 0.2, repeat: Infinity, ease: "easeInOut" }
                    : {}
                }
                className="flex-shrink-0 mt-4 text-center"
              >
                <div className={`w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-3 ${
                  currentRoundData.type === "defense"
                    ? "border-pyth-green/50 shadow-lg shadow-pyth-green/10"
                    : "border-pyth-green/20 opacity-70 hidden md:block"
                }`}>
                  <Image
                    src={currentRoundData.type === "defense" ? "/characters/planck-v2.png" : "/characters/planck-react.png"}
                    alt="Planck"
                    width={144}
                    height={144}
                    className="pixel-render w-full h-full object-cover"
                  />
                </div>
                <span className={`text-[8px] font-[var(--font-pixel)] mt-1.5 block ${
                  currentRoundData.type === "defense" ? "text-pyth-green" : "text-pyth-green/40"
                }`}>DEFENSE</span>
              </motion.div>
              <div
                className={`max-w-[80%] md:max-w-[65%] ${
                  currentRoundData.type === "prosecution" ? "items-end" : "items-start"
                }`}
              >
                {/* Speaker name */}
                <div
                  className={`flex items-center gap-2 mb-1 ${
                    currentRoundData.type === "prosecution" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span
                    className={`text-[10px] md:text-xs font-[var(--font-pixel)] uppercase ${
                      currentRoundData.type === "prosecution"
                        ? "text-pyth-red"
                        : "text-pyth-green"
                    }`}
                  >
                    {currentRoundData.type === "prosecution" ? "Chop" : "Planck"}
                  </span>
                  <span className="text-[7px] text-pyth-text-dim font-[var(--font-pixel)]">
                    {currentRoundData.label}
                  </span>
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-xl p-5 md:p-6 ${
                    currentRoundData.type === "prosecution"
                      ? "bg-pyth-red/10 border border-pyth-red/30 rounded-tr-sm"
                      : "bg-pyth-green/10 border border-pyth-green/30 rounded-tl-sm"
                  }`}
                >
                  <p className="text-base md:text-lg leading-relaxed text-pyth-text">
                    {displayingText}
                    {isTyping && <span className="cursor-blink" />}
                  </p>
                </div>

                {/* Evidence card */}
                <AnimatePresence>
                  {showCurrentEvidence && currentRoundData.evidence && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`mt-2 rounded-lg p-3 border ${
                        currentRoundData.type === "prosecution"
                          ? "bg-pyth-bg-card border-pyth-red/20"
                          : "bg-pyth-bg-card border-pyth-green/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Image
                          src="/brand/pyth-logo-symbol-light.svg"
                          alt=""
                          width={10}
                          height={10}
                        />
                        <span className="text-[8px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
                          {currentRoundData.evidence.source}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[7px] font-[var(--font-pixel)] text-pyth-text-dim">
                          {currentRoundData.evidence.label}
                        </span>
                        <span
                          className={`text-xl md:text-2xl font-bold ${
                            currentRoundData.evidence.isPositive
                              ? "text-pyth-green"
                              : "text-pyth-red"
                          }`}
                        >
                          {currentRoundData.evidence.value}
                        </span>
                      </div>
                      <p className="text-[9px] text-pyth-text-dim mt-1">
                        {currentRoundData.evidence.detail}
                      </p>
                      {(currentRoundData.evidence.rawField || currentRoundData.evidence.sampledAt) && (
                        <div className="mt-1.5 pt-1.5 border-t border-pyth-border/20 flex items-center gap-2 flex-wrap">
                          {currentRoundData.evidence.rawField && (
                            <span className="text-[8px] font-[var(--font-pixel)] text-pyth-purple-light/60 bg-pyth-purple/10 px-1 py-0.5 rounded">
                              {currentRoundData.evidence.rawField}
                            </span>
                          )}
                          {currentRoundData.evidence.sampledAt && (
                            <span className="text-[8px] font-[var(--font-pixel)] text-pyth-text-dim/50">
                              {new Date(currentRoundData.evidence.sampledAt * 1000).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Right side: Prosecution speaking or reacting */}
              <motion.div
                animate={
                  currentRoundData.type === "prosecution" && isTyping
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
                }
                transition={
                  currentRoundData.type === "prosecution" && isTyping
                    ? { duration: 0.2, repeat: Infinity, ease: "easeInOut" }
                    : {}
                }
                className="flex-shrink-0 mt-4 text-center"
              >
                <div className={`w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-3 ${
                  currentRoundData.type === "prosecution"
                    ? "border-pyth-red/50 shadow-lg shadow-pyth-red/10"
                    : "border-pyth-red/20 opacity-70 hidden md:block"
                }`}>
                  <Image
                    src={currentRoundData.type === "prosecution" ? "/characters/chop-v2.png" : "/characters/chop-react.png"}
                    alt="Chop"
                    width={144}
                    height={144}
                    className="pixel-render w-full h-full object-cover"
                  />
                </div>
                <span className={`text-[8px] font-[var(--font-pixel)] mt-1.5 block ${
                  currentRoundData.type === "prosecution" ? "text-pyth-red" : "text-pyth-red/40"
                }`}>PROSECUTOR</span>
              </motion.div>
            </div>
          )}

          {/* Currently typing intro */}
          {displayingText && currentRound === -1 && (
            <div className="flex justify-center">
              <div className="max-w-[80%]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-3 border-pyth-purple/50">
                    <Image src="/characters/pirb-v3.png" alt="PIRB" width={56} height={56} className="pixel-render w-full h-full object-cover" />
                  </div>
                  <span className="text-[8px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
                    Judge PIRB
                  </span>
                </div>
                <div className="rounded-xl p-5 md:p-6 bg-pyth-purple/10 border border-pyth-purple/30">
                  <p className="text-base md:text-lg leading-relaxed text-pyth-text text-center">
                    {displayingText}
                    {isTyping && <span className="cursor-blink" />}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Press any key to continue */}
          {showCurrentEvidence && !isTyping && !trialDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-center py-2 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleAdvance(); }}
            >
              <span className="text-[9px] font-[var(--font-pixel)] text-pyth-text-dim">
                ▶ Tap or press Space to continue...
              </span>
            </motion.div>
          )}

          {/* Trial done — verdict button */}
          {trialDone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6"
              >
                <span className="font-[var(--font-pixel)] text-xl text-pyth-red objection-text">
                  ALL EVIDENCE PRESENTED
                </span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="px-8 py-4 bg-pyth-purple text-white rounded-lg font-[var(--font-pixel)] text-xs uppercase tracking-wider hover:bg-pyth-purple-light shadow-lg shadow-pyth-purple/30 cursor-pointer flex items-center justify-center gap-3 mx-auto"
              >
                <Image src="/brand/pyth-logo-symbol-light.svg" alt="" width={16} height={16} />
                Hear the Verdict
              </motion.button>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="sticky bottom-0 bg-pyth-bg-panel/95 backdrop-blur-sm border-t border-pyth-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <span className="text-[7px] font-[var(--font-pixel)] text-pyth-text-dim">
            Round {Math.min(currentRound + 1, result.rounds.length)}/{result.rounds.length}
          </span>
          <div className="flex-1 flex gap-1.5">
            {result.rounds.map((r, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i <= currentRound
                    ? r.type === "prosecution"
                      ? "bg-pyth-red"
                      : "bg-pyth-green"
                    : "bg-pyth-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Chat bubble component for committed messages
function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.type === "judge") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="max-w-[80%]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-pyth-purple/50">
              <Image src="/characters/pirb-v3.png" alt="PIRB" width={40} height={40} className="pixel-render w-full h-full object-cover" />
            </div>
            <span className="text-[8px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
              Judge PIRB
            </span>
          </div>
          <div className="rounded-xl p-5 md:p-6 bg-pyth-purple/10 border border-pyth-purple/30">
            <p className="text-base md:text-lg leading-relaxed text-pyth-text text-center">
              {message.text}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const isProsecution = message.type === "prosecution";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isProsecution ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      className={`flex gap-3 ${isProsecution ? "justify-end" : "justify-start"}`}
    >
      {/* Defense avatar on left */}
      {!isProsecution && (
        <div className="flex-shrink-0 self-start mt-4 text-center">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-3 border-pyth-green/50">
            <Image src="/characters/planck-v2.png" alt="Planck" width={80} height={80} className="pixel-render w-full h-full object-cover" />
          </div>
          <span className="text-[8px] font-[var(--font-pixel)] text-pyth-green mt-1.5 block">DEFENSE</span>
        </div>
      )}
      <div className={`max-w-[80%] md:max-w-[65%]`}>
        {/* Speaker */}
        <div
          className={`flex items-center gap-2 mb-1 ${
            isProsecution ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] md:text-xs font-[var(--font-pixel)] uppercase ${
              isProsecution ? "text-pyth-red" : "text-pyth-green"
            }`}
          >
            {isProsecution ? "Chop" : "Planck"}
          </span>
          {message.label && (
            <span className="text-[7px] text-pyth-text-dim font-[var(--font-pixel)]">
              {message.label}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-xl p-5 md:p-6 ${
            isProsecution
              ? "bg-pyth-red/10 border border-pyth-red/30 rounded-tr-sm"
              : "bg-pyth-green/10 border border-pyth-green/30 rounded-tl-sm"
          }`}
        >
          <p className="text-base md:text-lg leading-relaxed text-pyth-text">{message.text}</p>
        </div>

        {/* Evidence card */}
        {message.evidence && (
          <div
            className={`mt-2 rounded-lg p-3 border bg-pyth-bg-card ${
              isProsecution ? "border-pyth-red/20" : "border-pyth-green/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Image
                src="/brand/pyth-logo-symbol-light.svg"
                alt=""
                width={10}
                height={10}
              />
              <span className="text-[8px] font-[var(--font-pixel)] text-pyth-purple-light uppercase">
                {message.evidence.source}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[7px] font-[var(--font-pixel)] text-pyth-text-dim">
                {message.evidence.label}
              </span>
              <span
                className={`text-xl md:text-2xl font-bold ${
                  message.evidence.isPositive ? "text-pyth-green" : "text-pyth-red"
                }`}
              >
                {message.evidence.value}
              </span>
            </div>
            <p className="text-[9px] text-pyth-text-dim mt-1">
              {message.evidence.detail}
            </p>
            {(message.evidence.rawField || message.evidence.sampledAt) && (
              <div className="mt-1.5 pt-1.5 border-t border-pyth-border/20 flex items-center gap-2 flex-wrap">
                {message.evidence.rawField && (
                  <span className="text-[8px] font-[var(--font-pixel)] text-pyth-purple-light/60 bg-pyth-purple/10 px-1 py-0.5 rounded">
                    {message.evidence.rawField}
                  </span>
                )}
                {message.evidence.sampledAt && (
                  <span className="text-[8px] font-[var(--font-pixel)] text-pyth-text-dim/50">
                    {new Date(message.evidence.sampledAt * 1000).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Prosecution avatar on right */}
      {isProsecution && (
        <div className="flex-shrink-0 self-start mt-4 text-center">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-xl overflow-hidden border-3 border-pyth-red/50">
            <Image src="/characters/chop-v2.png" alt="Chop" width={80} height={80} className="pixel-render w-full h-full object-cover" />
          </div>
          <span className="text-[8px] font-[var(--font-pixel)] text-pyth-red mt-1.5 block">PROSECUTOR</span>
        </div>
      )}
    </motion.div>
  );
}
