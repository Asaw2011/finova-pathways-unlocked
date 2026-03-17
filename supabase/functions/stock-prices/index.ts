import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tickers } = await req.json();

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(JSON.stringify({ error: "tickers array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prices: Record<string, {
      price: number;
      open: number;
      high: number;
      low: number;
      prevClose: number;
      change: number;
      changePct: number;
      volume: number;
    }> = {};

    // Fetch from Yahoo Finance v8 quote endpoint (no API key needed)
    const symbols = tickers.join(",");
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${tickers[0]}?symbol=${tickers[0]}&interval=1d&range=1d`;
    
    // Fetch all tickers in parallel
    const results = await Promise.allSettled(
      tickers.map(async (ticker: string) => {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0",
            },
          }
        );
        if (!res.ok) throw new Error(`Yahoo API error for ${ticker}: ${res.status}`);
        const data = await res.json();
        return { ticker, data };
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        const { ticker, data } = result.value;
        try {
          const meta = data.chart?.result?.[0]?.meta;
          const quote = data.chart?.result?.[0]?.indicators?.quote?.[0];
          
          if (meta) {
            const currentPrice = meta.regularMarketPrice ?? 0;
            const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? currentPrice;
            const change = currentPrice - prevClose;
            const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;
            
            // Get today's OHLCV from the last candle
            const lastIdx = (quote?.open?.length ?? 1) - 1;
            
            prices[ticker] = {
              price: currentPrice,
              open: quote?.open?.[lastIdx] ?? currentPrice,
              high: quote?.high?.[lastIdx] ?? currentPrice,
              low: quote?.low?.[lastIdx] ?? currentPrice,
              prevClose,
              change,
              changePct,
              volume: quote?.volume?.[lastIdx] ?? 0,
            };
          }
        } catch (parseErr) {
          console.error(`Failed to parse ${ticker}:`, parseErr);
        }
      } else {
        console.error(`Failed to fetch ${result.reason}`);
      }
    }

    return new Response(JSON.stringify({ prices }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Stock prices error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
