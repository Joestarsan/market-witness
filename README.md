# The Market Witness

**Your trades will be judged.**

An interactive courtroom experience where your trading decisions are put on trial using real-time oracle data from [Pyth Network](https://pyth.network). Enter a trade, watch a dramatic prosecution vs defense battle unfold, and receive a verdict — all powered by live Pyth price feeds.

Built for the [Pyth Playground Community Hackathon](https://dev-forum.pyth.network/t/terms-conditions/527).

## How It Works

1. **Enter your trade** — Search any asset from Pyth's 500+ price feeds (crypto, forex, metals, equities). Select buy/sell, entry date, and exit date.
2. **Watch the trial** — An AI-powered courtroom drama plays out. The Prosecutor argues against your trade using real Pyth oracle evidence. The Defense fights back with counter-evidence. Each round reveals a different Pyth data point.
3. **Hear the verdict** — The Judge delivers a ruling based on all oracle evidence. Guilty or Not Guilty. View the full evidence breakdown.

## Pyth Network Integration

This project deeply integrates **3 Pyth products** as core mechanics, not just data display:

### Price Feeds (Core Evidence Engine)
- **Price + Confidence Intervals** — Confidence width at entry is used as prosecution evidence ("the oracle was uncertain!")
- **EMA Price** — Trend divergence between spot and EMA determines if the trade was with or against the trend
- **EMA Confidence** — Ratio of EMA conf to spot conf reveals shifting market conditions
- Historical price lookups via Hermes API for both trade open and close timestamps

### Pyth Pro / Benchmarks (Deep Analysis)
- Historical OHLC data for contextual analysis
- Minute-level granularity for precise entry/exit evaluation
- Supports all asset classes: crypto, forex, metals, equities

### AI Integration with Pyth Data
- All Pyth data points are fed to an AI model that generates dramatic courtroom dialogue
- Each prosecution/defense argument references specific Pyth metrics
- The verdict is computed from actual oracle data quality, not random

## Pyth Features Used as "Evidence"

| Evidence | Pyth Source | How It's Used |
|----------|-------------|---------------|
| Price at entry vs exit | Price Feeds | Core P&L calculation |
| Confidence interval width | Price Feeds — `conf` | Market uncertainty at trade time |
| EMA price divergence | Price Feeds — `ema_price` | Was trade with or against trend? |
| EMA confidence ratio | Price Feeds — `ema_conf` | Were conditions stable or shifting? |
| Exit timing analysis | Price Feeds (historical) | Closed too early? Too late? |
| Current market state | Price Feeds (latest) | How has the market moved since? |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Sound Effects | Web Audio API (synthesized, no external files) |
| AI Dialogue | OpenRouter API |
| Oracle Data | Pyth Hermes REST API + Pyth Pro Benchmarks API |
| Font | Press Start 2P (pixel aesthetic) |
| Deployment | Vercel |
| License | Apache 2.0 |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Joestarsan/market-witness.git
cd market-witness
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_key
PYTH_PRO_API_KEY=your_pyth_pro_key
```

- **OpenRouter API Key** — Get one at [openrouter.ai](https://openrouter.ai) (used for AI-generated trial dialogue)
- **Pyth Pro API Key** — Request from Pyth Network (used for historical benchmark data)

> The app works without API keys using mock trial generation and free Hermes API, but AI dialogue and Pyth Pro data require keys.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main orchestrator (input -> trial -> verdict)
│   ├── layout.tsx        # Root layout with pixel font
│   └── globals.css       # Pyth brand colors, animations, effects
├── components/
│   ├── AssetSearch.tsx    # Universal search across all Pyth feeds
│   ├── TradeInput.tsx     # Trade entry form (open/close dates)
│   ├── Trial.tsx          # Chat-style courtroom trial engine
│   ├── Verdict.tsx        # Verdict screen with stamp animation
│   └── EvidenceCard.tsx   # Pyth data evidence display card
├── lib/
│   ├── pyth.ts           # Pyth Hermes API client + evidence collection
│   ├── ai.ts             # OpenRouter AI trial generation
│   ├── mockTrial.ts      # Fallback trial generator (no AI needed)
│   └── sounds.ts         # Web Audio API sound effects engine
└── public/
    └── brand/            # Official Pyth Network logos
```

## Architecture

```
User inputs trade
       |
       v
  Pyth Hermes API
  - Historical price at open/close
  - Current price
  - Confidence intervals
  - EMA data
       |
       v
  Evidence Collection
  - P&L calculation
  - Confidence % of price
  - EMA divergence
  - Exit timing analysis
       |
       v
  AI Trial Generation (OpenRouter)
  or Mock Trial Fallback
  - 6-8 alternating rounds
  - Prosecution uses Pyth data against the trade
  - Defense uses Pyth data to justify the trade
  - Verdict + guilt score
       |
       v
  Interactive Courtroom UI
  - Chat-style prosecution (right) vs defense (left)
  - OBJECTION! / HOLD IT! animations + sounds
  - Pyth evidence cards per round
  - Verdict with judge stamp animation
  - Full evidence review
```

## What Makes It Creative

- **Pyth data as game mechanic** — Confidence intervals, EMA divergence, and publisher consensus are the evidence in a courtroom drama, not just numbers on a dashboard
- **Oracle metadata as narrative** — Each Pyth data point drives a round of prosecution vs defense arguments
- **Gamified education** — Users learn what confidence intervals and EMA actually mean through an engaging courtroom metaphor
- **Universal asset coverage** — Works with any of Pyth's 500+ price feeds across crypto, forex, metals, and equities
- **Full trade lifecycle** — Analyzes both entry AND exit, including "missed opportunity" after closing

## Answer Capsule

The Market Witness uses Pyth Price Feeds as courtroom evidence in an interactive trial. Confidence intervals become uncertainty evidence, EMA divergence reveals trend-fighting, and historical prices prove P&L. Each Pyth data point drives a prosecution/defense round, turning oracle data into dramatic narrative. AI generates unique dialogue from real Pyth metrics for every trade.

## License

Licensed under [Apache License 2.0](LICENSE).

## Links

- **GitHub:** [github.com/Joestarsan/market-witness](https://github.com/Joestarsan/market-witness)
- **Pyth Network:** [pyth.network](https://pyth.network)
- **Hackathon:** [Pyth Playground Community Hackathon](https://dev-forum.pyth.network/t/terms-conditions/527)
