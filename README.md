# The Market Witness

**Your trades will be judged.**

An interactive courtroom experience where your trading decisions are put on trial using real-time oracle data from [Pyth Network](https://pyth.network). Enter a trade, watch a dramatic prosecution vs defense battle unfold, and receive a verdict. All evidence sourced live from Pyth price feeds.

Built for the [Pyth Playground Community Hackathon](https://dev-forum.pyth.network/t/terms-conditions/527).

## How It Works

1. **Enter your trade** - Search any asset from Pyth's 500+ price feeds (crypto, forex, metals, equities). Select buy/sell, entry date, and exit date.
2. **Watch the trial** - An AI-powered courtroom drama plays out. The Prosecutor argues against your trade using real Pyth oracle evidence. The Defense fights back with counter-evidence. Each round reveals a different Pyth data point.
3. **Hear the verdict** - The Judge delivers a ruling based on all oracle evidence. Guilty or Not Guilty. View the full evidence breakdown.

## Pyth Network Integration

This project integrates **5 distinct Pyth features** as core game mechanics, not just data display:

### 1. Price Feeds
Real-time and historical price data via Hermes API. Used to calculate P&L, compare entry vs exit, and determine trade outcome. Supports all 500+ Pyth feeds across crypto, forex, metals, and equities.

### 2. Confidence Intervals
The width of `conf` at trade entry becomes prosecution evidence. A wide confidence interval means publishers disagreed on the true price, which the Prosecutor uses to argue the trade was reckless. A tight interval helps the Defense prove it was a quality entry.

### 3. EMA (Exponential Moving Average)
`ema_price` divergence from spot price reveals whether the trader entered with or against the prevailing trend. The Prosecutor uses counter-trend entries as evidence of poor judgment. The Defense uses trend-aligned entries as proof of skill.

### 4. EMA Confidence
The ratio of `ema_conf` to spot `conf` shows whether market conditions were stable or deteriorating. A growing ratio means uncertainty was increasing, which adds another layer of evidence to the trial.

### 5. Pyth Pro / Benchmarks API
Historical OHLC data with minute-level granularity for precise entry/exit evaluation. Provides deeper context around the trade: what happened before, during, and after.

## Pyth Features Used as "Evidence"

| Evidence | Pyth Source | Role in Trial |
|----------|-------------|---------------|
| Price at entry vs exit | Price Feeds | Core P&L calculation |
| Confidence interval width | `conf` field | Market uncertainty at trade time |
| EMA price divergence | `ema_price` field | With or against trend? |
| EMA confidence trend | `ema_conf` field | Stable or shifting conditions? |
| Exit timing analysis | Historical lookups | Closed too early? Too late? |
| Post-trade movement | Latest price | Missed opportunity analysis |
| Historical context | Pyth Pro Benchmarks | OHLC around trade timestamp |

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

- **OpenRouter API Key** - Get one at [openrouter.ai](https://openrouter.ai). Used for AI-generated trial dialogue.
- **Pyth Pro API Key** - Request from Pyth Network. Used for historical benchmark data.

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
  - EMA price + EMA confidence
       |
       v
  Evidence Collection
  - P&L calculation
  - Confidence as % of price
  - EMA divergence from spot
  - EMA conf ratio (stability)
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

- **Pyth data as game mechanic** - Confidence intervals, EMA divergence, and price history are the evidence in a courtroom drama, not just numbers on a dashboard
- **Oracle metadata as narrative** - Each Pyth data point drives a round of prosecution vs defense arguments
- **Gamified education** - Users learn what confidence intervals and EMA actually mean through an engaging courtroom format
- **Universal asset coverage** - Works with any of Pyth's 500+ price feeds across crypto, forex, metals, and equities
- **Full trade lifecycle** - Analyzes both entry AND exit, including missed opportunity after closing

## Answer Capsule

The Market Witness transforms Pyth oracle data into courtroom evidence. Confidence intervals become uncertainty proof, EMA divergence reveals trend-fighting, historical prices establish P&L, and EMA confidence ratios expose shifting conditions. Each of the 5 Pyth data points drives a prosecution/defense round, turning raw oracle feeds into interactive dramatic narrative with AI-generated dialogue.

## License

Licensed under [Apache License 2.0](LICENSE).

## Links

- **Live Demo:** [market-witness.vercel.app](https://market-witness.vercel.app)
- **GitHub:** [github.com/Joestarsan/market-witness](https://github.com/Joestarsan/market-witness)
- **Pyth Network:** [pyth.network](https://pyth.network)
- **Hackathon:** [Pyth Playground Community Hackathon](https://dev-forum.pyth.network/t/terms-conditions/527)
