const HERMES_BASE = "https://hermes.pyth.network";
const BENCHMARKS_BASE = "https://benchmarks.pyth.network";

export interface PythPriceFeed {
  id: string;
  attributes: {
    asset_type: string;
    base: string;
    quote_currency: string;
    symbol: string;
    description: string;
  };
}

export interface PythPriceData {
  price: string;
  conf: string;
  expo: number;
  publish_time: number;
  ema_price: string;
  ema_conf: string;
}

export interface PythPriceUpdate {
  id: string;
  price: PythPriceData;
}

export async function fetchPriceFeedList(): Promise<PythPriceFeed[]> {
  const res = await fetch(`${HERMES_BASE}/v2/price_feeds`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch price feeds");
  return res.json();
}

export interface AssetGroup {
  label: string;
  assets: PythPriceFeed[];
}

export function getCuratedAssets(feeds: PythPriceFeed[]): AssetGroup[] {
  const categories: { label: string; symbols: string[] }[] = [
    {
      label: "Crypto — Top",
      symbols: [
        "Crypto.BTC/USD",
        "Crypto.ETH/USD",
        "Crypto.SOL/USD",
        "Crypto.BNB/USD",
        "Crypto.XRP/USD",
        "Crypto.ADA/USD",
        "Crypto.AVAX/USD",
        "Crypto.DOT/USD",
        "Crypto.LINK/USD",
        "Crypto.MATIC/USD",
      ],
    },
    {
      label: "Crypto — DeFi & L2",
      symbols: [
        "Crypto.UNI/USD",
        "Crypto.ARB/USD",
        "Crypto.OP/USD",
        "Crypto.NEAR/USD",
        "Crypto.APT/USD",
        "Crypto.SUI/USD",
        "Crypto.JUP/USD",
        "Crypto.PYTH/USD",
      ],
    },
    {
      label: "Crypto — Memes",
      symbols: [
        "Crypto.DOGE/USD",
        "Crypto.WIF/USD",
        "Crypto.BONK/USD",
        "Crypto.PEPE/USD",
        "Crypto.SHIB/USD",
        "Crypto.FLOKI/USD",
      ],
    },
    {
      label: "Forex",
      symbols: [
        "FX.EUR/USD",
        "FX.GBP/USD",
        "FX.USD/JPY",
        "FX.AUD/USD",
        "FX.USD/CHF",
        "FX.USD/CAD",
      ],
    },
    {
      label: "Metals",
      symbols: [
        "Metal.XAU/USD",
        "Metal.XAG/USD",
      ],
    },
    {
      label: "Equities",
      symbols: [
        "Equity.US.AAPL/USD",
        "Equity.US.TSLA/USD",
        "Equity.US.AMZN/USD",
        "Equity.US.GOOGL/USD",
        "Equity.US.MSFT/USD",
        "Equity.US.NVDA/USD",
        "Equity.US.META/USD",
      ],
    },
  ];

  const feedMap = new Map(feeds.map((f) => [f.attributes.symbol, f]));

  return categories
    .map((cat) => ({
      label: cat.label,
      assets: cat.symbols.filter((s) => feedMap.has(s)).map((s) => feedMap.get(s)!),
    }))
    .filter((g) => g.assets.length > 0);
}

export async function fetchCurrentPrice(feedId: string): Promise<PythPriceUpdate> {
  const res = await fetch(
    `${HERMES_BASE}/v2/updates/price/latest?ids[]=${feedId}&parsed=true`
  );
  if (!res.ok) throw new Error("Failed to fetch price");
  const data = await res.json();
  return data.parsed[0];
}

export async function fetchHistoricalPrice(
  feedId: string,
  timestamp: number
): Promise<PythPriceUpdate> {
  const url = `${HERMES_BASE}/v2/updates/price/${timestamp}?ids[]=${feedId}&parsed=true`;
  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error(`Hermes error ${res.status} for ts=${timestamp}: ${errText}`);
    throw new Error(`Failed to fetch historical price (${res.status})`);
  }
  const data = await res.json();
  if (!data.parsed || data.parsed.length === 0) {
    throw new Error("No price data returned for this timestamp");
  }
  return data.parsed[0];
}

export function parsePythPrice(price: string, expo: number): number {
  return Number(price) * Math.pow(10, expo);
}

// Pyth Pro Benchmarks - OHLC context around a timestamp
export interface BenchmarkContext {
  periodHigh: number;
  periodLow: number;
  periodOpen: number;
  periodClose: number;
  volatilityPct: number;
  preTradeTrend: number; // % change in the hour before trade
  candles: number;
}

export async function fetchBenchmarkContext(
  symbol: string,
  timestamp: number
): Promise<BenchmarkContext | null> {
  try {
    const res = await fetch(
      `/api/benchmark?symbol=${encodeURIComponent(symbol)}&timestamp=${timestamp}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.benchmark || null;
  } catch (err) {
    console.warn("Benchmarks API failed:", err);
    return null;
  }
}

// Collect evidence for open + optional close
export async function collectTradeEvidence(
  feedId: string,
  openTimestamp: number,
  closeTimestamp: number | null,
  symbol?: string
) {
  console.log("Collecting evidence:", { feedId, openTimestamp, closeTimestamp, symbol });

  const fetches: Promise<PythPriceUpdate>[] = [
    fetchHistoricalPrice(feedId, openTimestamp),
    fetchCurrentPrice(feedId),
  ];
  if (closeTimestamp) {
    fetches.push(fetchHistoricalPrice(feedId, closeTimestamp));
  }

  const results = await Promise.all(fetches);
  const priceAtOpen = results[0];
  const currentPrice = results[1];
  const priceAtClose = closeTimestamp ? results[2] : null;

  const entryPrice = parsePythPrice(priceAtOpen.price.price, priceAtOpen.price.expo);
  const entryConf = parsePythPrice(priceAtOpen.price.conf, priceAtOpen.price.expo);
  const entryEma = parsePythPrice(priceAtOpen.price.ema_price, priceAtOpen.price.expo);
  const entryEmaConf = parsePythPrice(priceAtOpen.price.ema_conf, priceAtOpen.price.expo);

  const nowPrice = parsePythPrice(currentPrice.price.price, currentPrice.price.expo);
  const nowConf = parsePythPrice(currentPrice.price.conf, currentPrice.price.expo);

  let closePrice: number | null = null;
  let closeConf: number | null = null;
  let closeEma: number | null = null;
  let closePnl: number | null = null;
  let missedPnl: number | null = null;

  if (priceAtClose) {
    closePrice = parsePythPrice(priceAtClose.price.price, priceAtClose.price.expo);
    closeConf = parsePythPrice(priceAtClose.price.conf, priceAtClose.price.expo);
    closeEma = parsePythPrice(priceAtClose.price.ema_price, priceAtClose.price.expo);
    // PnL at close
    closePnl = ((closePrice - entryPrice) / entryPrice) * 100;
    // What would PnL be if held until now
    missedPnl = ((nowPrice - closePrice) / closePrice) * 100;
  }

  const pricePctChange = closePrice
    ? ((closePrice - entryPrice) / entryPrice) * 100
    : ((nowPrice - entryPrice) / entryPrice) * 100;
  const confPctOfPrice = entryPrice > 0 ? (entryConf / entryPrice) * 100 : 0;
  const emaDivergence = entryEma > 0 ? ((entryPrice - entryEma) / entryEma) * 100 : 0;
  const emaConfRatio = entryConf > 0 && entryEmaConf > 0 ? entryEmaConf / entryConf : 1;

  // Fetch Pyth Pro Benchmarks context (non-blocking)
  let benchmark: BenchmarkContext | null = null;
  if (symbol) {
    benchmark = await fetchBenchmarkContext(symbol, openTimestamp);
  }

  return {
    entryPrice,
    entryConf,
    entryEma,
    entryEmaConf,
    nowPrice,
    nowConf,
    closePrice,
    closeConf,
    closeEma,
    closePnl,
    missedPnl,
    pricePctChange,
    confPctOfPrice,
    emaDivergence,
    emaConfRatio,
    isClosed: !!closeTimestamp,
    openTimestamp,
    closeTimestamp,
    currentTimestamp: Math.floor(Date.now() / 1000),
    benchmark,
  };
}
