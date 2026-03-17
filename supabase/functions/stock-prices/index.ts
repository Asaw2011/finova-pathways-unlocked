import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type PriceQuote = {
  price: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  change: number;
  changePct: number;
  volume: number;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tickers } = await req.json();

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return new Response(JSON.stringify({ error: "tickers array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.allSettled(
      tickers.map(async (ticker: string) => {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=2d`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0",
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`Yahoo API error for ${ticker} [${response.status}]: ${body}`);
        }

        const data = await response.json();
        const result = data?.chart?.result?.[0];
        const meta = result?.meta;
        const quote = result?.indicators?.quote?.[0];

        if (!meta) {
          throw new Error(`Missing market data for ${ticker}`);
        }

        const currentPrice = Number(meta.regularMarketPrice ?? 0);
        const prevClose = Number(meta.previousClose ?? meta.chartPreviousClose ?? currentPrice);
        const opens = Array.isArray(quote?.open) ? quote.open : [];
        const highs = Array.isArray(quote?.high) ? quote.high : [];
        const lows = Array.isArray(quote?.low) ? quote.low : [];
        const volumes = Array.isArray(quote?.volume) ? quote.volume : [];
        const lastIndex = Math.max(opens.length, highs.length, lows.length, volumes.length) - 1;

        const parsed: PriceQuote = {
          price: currentPrice,
          open: Number(opens[lastIndex] ?? currentPrice),
          high: Number(highs[lastIndex] ?? currentPrice),
          low: Number(lows[lastIndex] ?? currentPrice),
          prevClose,
          change: currentPrice - prevClose,
          changePct: prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0,
          volume: Number(volumes[lastIndex] ?? 0),
        };

        return { ticker, parsed };
      }),
    );

    const prices: Record<string, PriceQuote> = {};

    for (const result of results) {
      if (result.status === "fulfilled") {
        prices[result.value.ticker] = result.value.parsed;
      } else {
        console.error("Quote fetch failed:", result.reason);
      }
    }

    return new Response(JSON.stringify({ prices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Stock prices error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
