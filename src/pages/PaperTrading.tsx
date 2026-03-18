import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Lock, ArrowUpRight, ArrowDownRight, RotateCcw, ShoppingCart, MinusCircle, Wifi, WifiOff, RefreshCw, Search, Filter, CheckCircle2, Download, Upload, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NYSE_TICKERS, SECTORS, POPULAR_TICKERS } from "@/data/nyse-tickers";
import { useLocalPersistence, getStorageStats, getHistoryVersions } from "@/hooks/useLocalPersistence";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  prevPrice: number;
  change: number;
  changePct: number;
  volume: number;
}

interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
}

interface Trade {
  id: string;
  symbol: string;
  action: string;
  shares: number;
  price: number;
  total: number;
  created_at: string;
}

const PlusGate = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-extrabold font-display mb-2">Paper Trading is a Plus feature</h1>
      <p className="text-muted-foreground mb-6">Practice trading with virtual money using real-time market data.</p>
      <Link to="/shop"><Button className="rounded-xl px-6">Upgrade to Plus</Button></Link>
    </motion.div>
  </div>
);

const BATCH_SIZE = 30; // Yahoo API batch size

const PaperTrading = () => {
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const { user } = useAuth();
  const [stockPrices, setStockPrices] = useState<Record<string, StockData>>({});
  const [cash, setCash] = useState(100000);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [shareInput, setShareInput] = useState<Record<string, string>>({});
  const [selectedTab, setSelectedTab] = useState<"market" | "portfolio" | "history">("market");
  const [isLive, setIsLive] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("Popular");
  const [dbLoaded, setDbLoaded] = useState(false);

  // Get the tickers to display based on sector/search
  const visibleTickers = useMemo(() => {
    if (searchQuery.length >= 1) {
      const q = searchQuery.toUpperCase();
      return Object.entries(NYSE_TICKERS)
        .filter(([sym, name]) => sym.includes(q) || name.toUpperCase().includes(q))
        .map(([sym]) => sym)
        .slice(0, 50);
    }
    if (selectedSector === "Popular") return POPULAR_TICKERS;
    if (selectedSector === "My Holdings") return Object.keys(positions);
    return SECTORS[selectedSector]?.slice(0, 40) ?? POPULAR_TICKERS;
  }, [searchQuery, selectedSector, positions]);

  // Tickers we need prices for (visible + held positions)
  const tickersToFetch = useMemo(() => {
    const set = new Set([...visibleTickers, ...Object.keys(positions)]);
    return Array.from(set);
  }, [visibleTickers, positions]);

  // Load portfolio from DB
  useEffect(() => {
    if (!user || !hasAccess) return;
    const load = async () => {
      const [portfolioRes, positionsRes, tradesRes] = await Promise.all([
        supabase.from("paper_portfolios").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("paper_positions").select("*").eq("user_id", user.id),
        supabase.from("paper_trades").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      ]);

      if (portfolioRes.data) {
        setCash(Number(portfolioRes.data.cash));
      } else {
        // Create initial portfolio
        await supabase.from("paper_portfolios").insert({ user_id: user.id, cash: 100000 });
      }

      if (positionsRes.data && positionsRes.data.length > 0) {
        const posMap: Record<string, Position> = {};
        positionsRes.data.forEach(p => {
          posMap[p.symbol] = { symbol: p.symbol, shares: p.shares, avgPrice: Number(p.avg_price) };
        });
        setPositions(posMap);
      }

      if (tradesRes.data) {
        setTrades(tradesRes.data.map(t => ({
          id: t.id, symbol: t.symbol, action: t.action,
          shares: t.shares, price: Number(t.price), total: Number(t.total),
          created_at: t.created_at,
        })));
      }
      setDbLoaded(true);
    };
    load();
  }, [user, hasAccess]);

  // Fetch prices for visible tickers
  const fetchPrices = useCallback(async () => {
    if (tickersToFetch.length === 0) { setLoadingPrices(false); return; }
    try {
      // Batch into groups of BATCH_SIZE
      const batches: string[][] = [];
      for (let i = 0; i < tickersToFetch.length; i += BATCH_SIZE) {
        batches.push(tickersToFetch.slice(i, i + BATCH_SIZE));
      }

      const results = await Promise.all(
        batches.map(batch =>
          supabase.functions.invoke("stock-prices", { body: { tickers: batch } })
        )
      );

      const newPrices: Record<string, StockData> = { ...stockPrices };
      results.forEach(({ data, error }) => {
        if (error || !data?.prices) return;
        Object.entries(data.prices).forEach(([symbol, p]: [string, any]) => {
          const existing = newPrices[symbol];
          newPrices[symbol] = {
            symbol,
            name: NYSE_TICKERS[symbol] || symbol,
            price: p.price,
            prevPrice: existing?.price ?? p.prevClose,
            change: p.change,
            changePct: p.changePct,
            volume: p.volume,
          };
        });
      });

      setStockPrices(newPrices);
      setIsLive(true);
      setLastUpdate(new Date());
      setLoadingPrices(false);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setIsLive(false);
      setLoadingPrices(false);
    }
  }, [tickersToFetch, stockPrices]);

  useEffect(() => {
    if (!hasAccess || !dbLoaded) return;
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, [hasAccess, dbLoaded, tickersToFetch.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to DB helpers
  const saveCash = async (newCash: number) => {
    if (!user) return;
    await supabase.from("paper_portfolios").update({ cash: newCash }).eq("user_id", user.id);
  };

  const savePosition = async (symbol: string, shares: number, avgPrice: number) => {
    if (!user) return;
    if (shares <= 0) {
      await supabase.from("paper_positions").delete().eq("user_id", user.id).eq("symbol", symbol);
    } else {
      await supabase.from("paper_positions").upsert(
        { user_id: user.id, symbol, shares, avg_price: avgPrice },
        { onConflict: "user_id,symbol" }
      );
    }
  };

  const saveTrade = async (symbol: string, action: string, shares: number, price: number, total: number) => {
    if (!user) return;
    const { data } = await supabase.from("paper_trades").insert({
      user_id: user.id, symbol, action, shares, price, total,
    }).select().single();
    return data;
  };

  const buy = useCallback(async (symbol: string) => {
    const shares = parseInt(shareInput[symbol] || "1");
    if (isNaN(shares) || shares <= 0) { toast.error("Enter a valid number of shares"); return; }
    const stock = stockPrices[symbol];
    if (!stock || stock.price <= 0) { toast.error("Price not available"); return; }
    const cost = stock.price * shares;
    if (cost > cash) { toast.error("Insufficient funds"); return; }

    const newCash = Math.round((cash - cost) * 100) / 100;
    setCash(newCash);

    const existing = positions[symbol] || { symbol, shares: 0, avgPrice: 0 };
    const totalCost = existing.avgPrice * existing.shares + cost;
    const newShares = existing.shares + shares;
    const newAvg = totalCost / newShares;
    setPositions(prev => ({ ...prev, [symbol]: { symbol, shares: newShares, avgPrice: newAvg } }));

    setShareInput(prev => ({ ...prev, [symbol]: "" }));
    toast.success(`Bought ${shares} ${symbol} @ $${stock.price.toFixed(2)}`);

    // Persist
    await Promise.all([
      saveCash(newCash),
      savePosition(symbol, newShares, newAvg),
      saveTrade(symbol, "BUY", shares, stock.price, cost).then(data => {
        if (data) setTrades(prev => [{ id: data.id, symbol, action: "BUY", shares, price: stock.price, total: cost, created_at: data.created_at }, ...prev]);
      }),
    ]);
  }, [stockPrices, cash, shareInput, positions, user]);

  const sell = useCallback(async (symbol: string) => {
    const shares = parseInt(shareInput[symbol] || "1");
    if (isNaN(shares) || shares <= 0) { toast.error("Enter a valid number"); return; }
    const pos = positions[symbol];
    if (!pos || pos.shares < shares) { toast.error("Not enough shares"); return; }
    const stock = stockPrices[symbol];
    if (!stock || stock.price <= 0) { toast.error("Price not available"); return; }
    const revenue = stock.price * shares;

    const newCash = Math.round((cash + revenue) * 100) / 100;
    setCash(newCash);

    const newShares = pos.shares - shares;
    if (newShares === 0) {
      setPositions(prev => { const { [symbol]: _, ...rest } = prev; return rest; });
    } else {
      setPositions(prev => ({ ...prev, [symbol]: { ...prev[symbol], shares: newShares } }));
    }

    setShareInput(prev => ({ ...prev, [symbol]: "" }));
    toast.success(`Sold ${shares} ${symbol} @ $${stock.price.toFixed(2)}`);

    // Persist
    await Promise.all([
      saveCash(newCash),
      savePosition(symbol, newShares, newShares > 0 ? pos.avgPrice : 0),
      saveTrade(symbol, "SELL", shares, stock.price, revenue).then(data => {
        if (data) setTrades(prev => [{ id: data.id, symbol, action: "SELL", shares, price: stock.price, total: revenue, created_at: data.created_at }, ...prev]);
      }),
    ]);
  }, [stockPrices, positions, shareInput, cash, user]);

  const resetAccount = async () => {
    if (!user) return;
    setCash(100000);
    setPositions({});
    setTrades([]);
    await Promise.all([
      supabase.from("paper_portfolios").update({ cash: 100000 }).eq("user_id", user.id),
      supabase.from("paper_positions").delete().eq("user_id", user.id),
      supabase.from("paper_trades").delete().eq("user_id", user.id),
    ]);
    toast.success("Account reset to $100,000");
  };

  const portfolioValue = Object.entries(positions).reduce((sum, [sym, pos]) => {
    const stock = stockPrices[sym];
    return sum + (stock ? stock.price * pos.shares : pos.avgPrice * pos.shares);
  }, 0);

  const totalValue = cash + portfolioValue;
  const totalPnL = totalValue - 100000;
  const totalPnLPct = (totalPnL / 100000) * 100;

  const sectorKeys = ["Popular", "My Holdings", ...Object.keys(SECTORS)];

  if (accessLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground font-medium">Checking access...</p></div>;
  }
  if (!hasAccess) return <PlusGate />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-extrabold font-display">Paper Trading</h1>
          <div className={cn("flex items-center gap-1 ml-auto text-[10px] font-bold px-2 py-1 rounded-full", isLive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>
            {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isLive ? "LIVE" : "OFFLINE"}
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          {Object.keys(NYSE_TICKERS).length}+ stocks — Real market data
          {lastUpdate && <span className="ml-2 text-[10px] text-muted-foreground/60">Last: {lastUpdate.toLocaleTimeString()}</span>}
        </p>
      </motion.div>

      {/* Account Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Cash", value: `$${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Portfolio", value: `$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: BarChart3, color: "text-primary" },
          { label: "Total Value", value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-foreground" },
          { label: "P&L", value: `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${totalPnLPct.toFixed(2)}%)`, icon: totalPnL >= 0 ? ArrowUpRight : ArrowDownRight, color: totalPnL >= 0 ? "text-emerald-500" : "text-red-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={cn("w-3.5 h-3.5", color)} />
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className={cn("text-sm font-extrabold font-display", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={fetchPrices}>
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1", loadingPrices && "animate-spin")} /> Refresh
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={resetAccount}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Account
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
        {(["market", "portfolio", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={cn(
              "flex-1 text-xs font-bold py-2 rounded-lg transition-all capitalize",
              selectedTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab} {tab === "portfolio" && Object.keys(positions).length > 0 && `(${Object.keys(positions).length})`}
          </button>
        ))}
      </div>

      {/* Market Tab */}
      {selectedTab === "market" && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stocks by ticker or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          {/* Sector filter */}
          {!searchQuery && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {sectorKeys.map(sector => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                    selectedSector === sector ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {sector}
                </button>
              ))}
            </div>
          )}

          {/* Stock list */}
          <div className="space-y-2">
            {loadingPrices && Object.keys(stockPrices).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-30" />
                <p className="font-semibold">Loading live prices...</p>
              </div>
            ) : visibleTickers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-semibold">No stocks found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              visibleTickers.map((symbol) => {
                const stock = stockPrices[symbol];
                const pos = positions[symbol];
                const price = stock?.price ?? 0;
                const change = stock?.changePct ?? 0;
                const isUp = stock && stock.price > stock.prevPrice;
                const isDown = stock && stock.price < stock.prevPrice;
                return (
                  <div
                    key={symbol}
                    className={cn(
                      "bg-card rounded-xl border border-border p-3 transition-colors",
                      isUp && "border-emerald-500/20",
                      isDown && "border-red-500/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold font-display text-primary">{symbol}</span>
                          {pos && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">{pos.shares} shares</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{NYSE_TICKERS[symbol] || symbol}</p>
                      </div>
                      <div className="text-right mr-3">
                        {price > 0 ? (
                          <>
                            <p className="text-base font-extrabold font-display">${price.toFixed(2)}</p>
                            <p className={cn("text-[11px] font-bold", change >= 0 ? "text-emerald-500" : "text-red-500")}>
                              {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Loading...</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={shareInput[symbol] || ""}
                          onChange={(e) => setShareInput(prev => ({ ...prev, [symbol]: e.target.value }))}
                          className="w-16 h-8 text-xs rounded-lg text-center"
                        />
                        <Button size="sm" className="h-8 px-2.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700" onClick={() => buy(symbol)} disabled={price <= 0}>
                          <ShoppingCart className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs rounded-lg text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => sell(symbol)} disabled={!pos || price <= 0}>
                          <MinusCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {selectedTab === "portfolio" && (
        <div className="space-y-2">
          {Object.keys(positions).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No positions yet</p>
              <p className="text-xs mt-1">Buy stocks from the Market tab</p>
            </div>
          ) : (
            Object.entries(positions).map(([symbol, pos]) => {
              const stock = stockPrices[symbol];
              const currentPrice = stock?.price ?? pos.avgPrice;
              const marketValue = currentPrice * pos.shares;
              const costBasis = pos.avgPrice * pos.shares;
              const pnl = marketValue - costBasis;
              const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
              return (
                <div key={symbol} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-extrabold font-display text-primary">{symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">{pos.shares} shares</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">${marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className={cn("text-[11px] font-bold", pnl >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPct.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                    <div>Avg Cost: <span className="text-foreground font-bold">${pos.avgPrice.toFixed(2)}</span></div>
                    <div>Current: <span className="text-foreground font-bold">${currentPrice.toFixed(2)}</span></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* History Tab */}
      {selectedTab === "history" && (
        <div className="space-y-1.5">
          {trades.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-semibold">No trades yet</p>
              <p className="text-xs mt-1">Your trade history will appear here</p>
            </div>
          ) : (
            trades.slice(0, 100).map((trade) => (
              <div key={trade.id} className="bg-card rounded-lg border border-border px-3 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={cn("font-bold px-1.5 py-0.5 rounded text-[10px]", trade.action === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>{trade.action}</span>
                  <span className="font-bold">{trade.shares} {trade.symbol}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold">${trade.total.toFixed(2)}</span>
                  <span className="text-muted-foreground ml-2">@ ${trade.price.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PaperTrading;
