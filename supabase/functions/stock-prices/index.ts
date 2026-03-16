import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STOCK_API_BASE = "https://api.massive.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("STOCK_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "STOCK_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { tickers } = await req.json();

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return new Response(JSON.stringify({ error: "tickers array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch previous close for each ticker using grouped daily bars
    const tickerStr = tickers.join(",");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Go back a few extra days to handle weekends
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const from = fiveDaysAgo.toISOString().split("T")[0];
    const to = yesterday.toISOString().split("T")[0];

    // Use snapshot endpoint for latest prices
    const snapshotUrl = `${STOCK_API_BASE}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickerStr}&apiKey=${apiKey}`;
    const snapshotRes = await fetch(snapshotUrl);
    const snapshotData = await snapshotRes.json();

    if (!snapshotRes.ok) {
      throw new Error(`Snapshot API error [${snapshotRes.status}]: ${JSON.stringify(snapshotData)}`);
    }

    // Map the data
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

    if (snapshotData.tickers) {
      for (const t of snapshotData.tickers) {
        const lastTrade = t.lastTrade?.p ?? t.day?.c ?? 0;
        const prevClose = t.prevDay?.c ?? lastTrade;
        const change = lastTrade - prevClose;
        const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

        prices[t.ticker] = {
          price: lastTrade,
          open: t.day?.o ?? lastTrade,
          high: t.day?.h ?? lastTrade,
          low: t.day?.l ?? lastTrade,
          prevClose,
          change,
          changePct,
          volume: t.day?.v ?? 0,
        };
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
