# The Market Witness

**Team:** @[YOUR_DISCORD_HANDLE]
**Submitted:** March 2026

---

## Answer Capsule

The Market Witness transforms Pyth oracle data into courtroom evidence. Users input a real trade and watch a pixel-art trial unfold where AI-powered prosecution and defense argue using live Pyth Price Feeds data (price, confidence intervals, EMA, EMA confidence) and Pyth Pro Benchmarks (historical OHLC, volatility). Each data point becomes a dramatic round of evidence, turning raw oracle feeds into an interactive experience.

---

## What It Does

Ever made a trade and wondered if it was actually good or just lucky? The Market Witness puts your trades on trial in a pixel-art courtroom. You enter a real trade (any of 500+ assets), and three original characters - Chop The Shark (prosecutor), Planck (defense attorney), and Judge PIRB - battle it out using real Pyth oracle data as evidence. AI generates unique dialogue for every trial, and the verdict is based on actual market conditions at the time of your trade.

---

## Pyth Features Used

- **Price Feeds** (off-chain via Hermes API)
  - `price` - entry/exit price comparison and P&L calculation
  - `conf` - confidence interval width as market uncertainty evidence
  - `ema_price` - trend analysis via EMA divergence from spot
  - `ema_conf` - market stability assessment via EMA confidence ratio
  - Historical lookups at both trade open and close timestamps
- **Pyth Pro / Benchmarks API**
  - Historical OHLC data (5-min candles) in 2-hour window around trade
  - Period volatility calculation as courtroom evidence
  - Pre-trade momentum analysis (1hr trend before entry)

Each Pyth data point is used as a distinct piece of courtroom evidence, not just displayed as a number. The prosecution uses weak data points against the trader, while the defense uses strong data points to justify the trade.

---

## Links

- **Live Demo:** https://market-witness.vercel.app
- **Source Code:** https://github.com/Joestarsan/market-witness

---

## Screenshots

<!-- SCREENSHOT 1: Landing page with the input form -->
**Landing Page - Trade Input**
[INSERT SCREENSHOT: The main page showing Pyth logo, THE MARKET WITNESS title, asset search, BUY/SELL buttons, date pickers]

<!-- SCREENSHOT 2: Trial in progress showing Chop and Planck arguing -->
**Trial in Progress - Prosecution vs Defense**
[INSERT SCREENSHOT: Chat-style trial with Chop on the right making an accusation, Planck on the left reacting, evidence card visible below with Pyth data]

<!-- SCREENSHOT 3: OBJECTION callout animation -->
**Dramatic Callout Animation**
[INSERT SCREENSHOT: OBJECTION! or TAKE THAT! callout appearing over the trial with glow effect]

<!-- SCREENSHOT 4: Verdict screen with all three characters -->
**Verdict Screen**
[INSERT SCREENSHOT: Judge PIRB in center, Chop and Planck on sides, GUILTY/NOT GUILTY banner, stamp animation, guilt score bar]

<!-- SCREENSHOT 5: Evidence review with Pyth data cards -->
**Evidence Review - Pyth Data Cards**
[INSERT SCREENSHOT: Grid of evidence cards showing Pyth Price Feeds, Pyth Pro Benchmarks data with raw field names and timestamps]

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion + CSS Keyframes
- **Sound Effects:** Web Audio API (synthesized, no external files)
- **AI Dialogue:** OpenRouter API (server-side, key protected)
- **Oracle Data:** Pyth Hermes REST API + Pyth Pro Benchmarks API
- **Character Art:** AI-generated pixel art (GPT-5 Image via OpenRouter)
- **Deployment:** Vercel

---

## How It Works (Technical)

1. User selects any asset from 500+ Pyth price feeds and enters trade dates
2. App fetches historical price data from Pyth Hermes API (open + close timestamps)
3. In parallel, Pyth Pro Benchmarks API provides OHLC context (via server-side API route)
4. 5 distinct Pyth data points are collected as "evidence": price, confidence, EMA price, EMA confidence, and Benchmarks volatility
5. AI (via server-side API route) generates unique prosecution/defense dialogue based on the real data
6. Interactive trial plays out with pixel-art characters, sound effects, and animations
7. Verdict is calculated from actual data quality, not random

All API keys are protected server-side via Next.js API routes. The app includes a mock trial fallback if AI is unavailable, ensuring it always works.

---

## Content Contributions

- **Public Post:** [INSERT REDDIT/DEV.TO POST URL]
- **Technical Contribution:** [INSERT STACKOVERFLOW/GITHUB URL]
- **Bonus - X Platform Post:** [INSERT TWITTER POST URL]

---

## Licensing

Licensed under Apache 2.0: https://github.com/Joestarsan/market-witness/blob/main/LICENSE

---

## Eligibility Confirmation

- [x] 18+ years old
- [x] Not in OFAC-sanctioned jurisdiction
- [x] Original work created during hackathon
- [x] Agree to Terms & Conditions
