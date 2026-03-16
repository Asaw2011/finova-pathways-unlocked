import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Lock, ArrowUpRight, ArrowDownRight, RotateCcw, ShoppingCart, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Link } from "react-router-dom";

// --- Stock universe with realistic starting prices ---
const STOCK_UNIVERSE = [
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 178.50, volatility: 0.018 },
  { symbol: "GOOGL", name: "Alphabet Inc.", basePrice: 141.20, volatility: 0.02 },
  { symbol: "TSLA", name: "Tesla Inc.", basePrice: 245.80, volatility: 0.035 },
  { symbol: "AMZN", name: "Amazon.com", basePrice: 185.60, volatility: 0.022 },
  { symbol: "MSFT", name: "Microsoft", basePrice: 415.30, volatility: 0.015 },
  { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 875.40, volatility: 0.03 },
  { symbol: "META", name: "Meta Platforms", basePrice: 505.75, volatility: 0.025 },
  { symbol: "JPM", name: "JPMorgan Chase", basePrice: 198.20, volatility: 0.012 },
  { symbol: "V", name: "Visa Inc.", basePrice: 279.90, volatility: 0.01 },
  { symbol: "NFLX", name: "Netflix Inc.", basePrice: 628.50, volatility: 0.028 },
  { symbol: "AMD", name: "AMD Inc.", basePrice: 162.30, volatility: 0.032 },
  { symbol: "DIS", name: "Walt Disney Co.", basePrice: 112.40, volatility: 0.02 },
];

interface StockData {
  symbol: string;
  name: string;
  price: number;
  prevPrice: number;
  basePrice: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volatility: number;
}

interface Position {
  symbol: string;
  shares: number;
  avgPrice: number;
}

interface Trade {
  id: number;
  symbol: string;
  action: "BUY" | "SELL";
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}

// --- Access Gate ---
const PremiumGate = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-amber-500" />
      </div>
      <h1 className="text-2xl font-extrabold font-display mb-2">Paper Trading is Premium</h1>
      <p className="text-muted-foreground mb-6">
        Practice trading with virtual money using real-time market simulation.
        Upgrade to Premium to unlock this feature.
      </p>
      <Link to="/shop">
        <Button className="rounded-xl px-6">Upgrade to Premium</Button>
      </Link>
    </motion.div>
  </div>
);

// --- Main Trading Component ---
const PaperTrading = () => {
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const [stocks, setStocks] = useState<StockData[]>(() =>
    STOCK_UNIVERSE.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      price: s.basePrice,
      prevPrice: s.basePrice,
      basePrice: s.basePrice,
      change: 0,
      changePct: 0,
      high: s.basePrice,
      low: s.basePrice,
      volatility: s.volatility,
    }))
  );
  const [cash, setCash] = useState(100000);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [shareInput, setShareInput] = useState<Record<string, string>>({});
  const [paused, setPaused] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"market" | "portfolio" | "history">("market");
  const tradeIdRef = useRef(0);

  // Simulate market ticks
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setStocks((prev) =>
        prev.map((s) => {
          const drift = (Math.random() - 0.48) * s.volatility;
          const newPrice = Math.max(s.price * (1 + drift), 0.01);
          const rounded = Math.round(newPrice * 100) / 100;
          const change = rounded - s.basePrice;
          return {
            ...s,
            prevPrice: s.price,
            price: rounded,
            change,
            changePct: (change / s.basePrice) * 100,
            high: Math.max(s.high, rounded),
            low: Math.min(s.low, rounded),
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [paused]);

  const buy = useCallback((symbol: string) => {
    const shares = parseInt(shareInput[symbol] || "1");
    if (isNaN(shares) || shares <= 0) { toast.error("Enter a valid number of shares"); return; }
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return;
    const cost = stock.price * shares;
    if (cost > cash) { toast.error("Insufficient funds"); return; }

    setCash((c) => Math.round((c - cost) * 100) / 100);
    setPositions((prev) => {
      const existing = prev[symbol] || { symbol, shares: 0, avgPrice: 0 };
      const totalCost = existing.avgPrice * existing.shares + cost;
      const newShares = existing.shares + shares;
      return { ...prev, [symbol]: { symbol, shares: newShares, avgPrice: totalCost / newShares } };
    });
    setTrades((prev) => [{ id: ++tradeIdRef.current, symbol, action: "BUY", shares, price: stock.price, total: cost, timestamp: new Date() }, ...prev]);
    setShareInput((prev) => ({ ...prev, [symbol]: "" }));
    toast.success(`Bought ${shares} ${symbol} @ $${stock.price.toFixed(2)}`);
  }, [stocks, cash, shareInput]);

  const sell = useCallback((symbol: string) => {
    const shares = parseInt(shareInput[symbol] || "1");
    if (isNaN(shares) || shares <= 0) { toast.error("Enter a valid number of shares"); return; }
    const pos = positions[symbol];
    if (!pos || pos.shares < shares) { toast.error("Not enough shares"); return; }
    const stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) return;
    const revenue = stock.price * shares;

    setCash((c) => Math.round((c + revenue) * 100) / 100);
    setPositions((prev) => {
      const newShares = prev[symbol].shares - shares;
      if (newShares === 0) { const { [symbol]: _, ...rest } = prev; return rest; }
      return { ...prev, [symbol]: { ...prev[symbol], shares: newShares } };
    });
    setTrades((prev) => [{ id: ++tradeIdRef.current, symbol, action: "SELL", shares, price: stock.price, total: revenue, timestamp: new Date() }, ...prev]);
    setShareInput((prev) => ({ ...prev, [symbol]: "" }));
    toast.success(`Sold ${shares} ${symbol} @ $${stock.price.toFixed(2)}`);
  }, [stocks, positions, shareInput]);

  const resetAccount = () => {
    setCash(100000);
    setPositions({});
    setTrades([]);
    setStocks(STOCK_UNIVERSE.map((s) => ({
      symbol: s.symbol, name: s.name, price: s.basePrice, prevPrice: s.basePrice,
      basePrice: s.basePrice, change: 0, changePct: 0, high: s.basePrice, low: s.basePrice, volatility: s.volatility,
    })));
    toast.success("Account reset to $100,000");
  };

  const portfolioValue = Object.entries(positions).reduce((sum, [sym, pos]) => {
    const stock = stocks.find((s) => s.symbol === sym);
    return sum + (stock ? stock.price * pos.shares : 0);
  }, 0);

  const totalValue = cash + portfolioValue;
  const totalPnL = totalValue - 100000;
  const totalPnLPct = (totalPnL / 100000) * 100;

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground font-medium">Checking access...</p>
      </div>
    );
  }

  if (!hasAccess) return <PremiumGate />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-extrabold font-display">Paper Trading</h1>
        </div>
        <p className="text-muted-foreground text-sm">Practice trading with $100,000 virtual cash — prices update every 2s</p>
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
        <Button size="sm" variant={paused ? "default" : "outline"} className="rounded-xl text-xs" onClick={() => setPaused(!paused)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={resetAccount}>
          <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
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
            {tab}
          </button>
        ))}
      </div>

      {/* Market Tab */}
      {selectedTab === "market" && (
        <div className="space-y-2">
          {stocks.map((stock) => {
            const isUp = stock.price > stock.prevPrice;
            const isDown = stock.price < stock.prevPrice;
            const pos = positions[stock.symbol];
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "bg-card rounded-xl border border-border p-3 transition-colors",
                  isUp && "border-emerald-500/20",
                  isDown && "border-red-500/20"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold font-display text-primary">{stock.symbol}</span>
                      {pos && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold">{pos.shares} shares</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{stock.name}</p>
                  </div>
                  <div className="text-right mr-3">
                    <p className="text-base font-extrabold font-display">${stock.price.toFixed(2)}</p>
                    <p className={cn("text-[11px] font-bold", stock.change >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {stock.change >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={shareInput[stock.symbol] || ""}
                      onChange={(e) => setShareInput((prev) => ({ ...prev, [stock.symbol]: e.target.value }))}
                      className="w-16 h-8 text-xs rounded-lg text-center"
                    />
                    <Button size="sm" className="h-8 px-2.5 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700" onClick={() => buy(stock.symbol)}>
                      <ShoppingCart className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs rounded-lg text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => sell(stock.symbol)}>
                      <MinusCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {/* Mini bar showing day range */}
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", stock.change >= 0 ? "bg-emerald-500/50" : "bg-red-500/50")}
                    style={{ width: `${Math.min(Math.abs(stock.changePct) * 10, 100)}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Portfolio Tab */}
      {selectedTab === "portfolio" && (
        <div className="space-y-2">
          {Object.keys(positions).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No positions yet</p>
              <p className="text-xs mt-1">Buy stocks from the Market tab to build your portfolio</p>
            </div>
          ) : (
            Object.entries(positions).map(([symbol, pos]) => {
              const stock = stocks.find((s) => s.symbol === symbol);
              if (!stock) return null;
              const marketValue = stock.price * pos.shares;
              const costBasis = pos.avgPrice * pos.shares;
              const pnl = marketValue - costBasis;
              const pnlPct = (pnl / costBasis) * 100;
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
                    <div>Current: <span className="text-foreground font-bold">${stock.price.toFixed(2)}</span></div>
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
            trades.slice(0, 50).map((trade) => (
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
