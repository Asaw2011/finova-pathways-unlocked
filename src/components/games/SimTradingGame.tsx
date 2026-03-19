import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Diamond, RotateCcw, TrendingUp, TrendingDown, Newspaper, Timer, BarChart3, Zap } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

// ---- COMPANIES ----
const companies = [
  { name: "TechVault Inc", ticker: "TVLT", color: "bg-blue-500", sector: "AI/Tech", basePrice: 84, volatility: 0.12 },
  { name: "GreenLeaf Energy", ticker: "GLEF", color: "bg-emerald-500", sector: "Solar", basePrice: 42, volatility: 0.05 },
  { name: "FastBite Foods", ticker: "FBIT", color: "bg-orange-500", sector: "Consumer", basePrice: 31, volatility: 0.07 },
  { name: "MediCore Health", ticker: "MEDI", color: "bg-purple-500", sector: "Healthcare", basePrice: 68, volatility: 0.04 },
  { name: "RocketShip Travel", ticker: "RSHT", color: "bg-red-500", sector: "Airline", basePrice: 22, volatility: 0.15 },
  { name: "DataStream Corp", ticker: "DSTR", color: "bg-teal-500", sector: "Cloud", basePrice: 96, volatility: 0.10 },
  { name: "OldRock Mining", ticker: "OLRK", color: "bg-amber-700", sector: "Commodities", basePrice: 38, volatility: 0.08 },
  { name: "SafeHaven Bank", ticker: "SHVN", color: "bg-blue-900", sector: "Banking", basePrice: 55, volatility: 0.03, dividend: 0.02 },
  { name: "PixelPlay Games", ticker: "PXPL", color: "bg-pink-500", sector: "Gaming", basePrice: 28, volatility: 0.13 },
  { name: "GlobalShip Trade", ticker: "GSHP", color: "bg-gray-500", sector: "Shipping", basePrice: 45, volatility: 0.06 },
  { name: "BioSpark Labs", ticker: "BSPK", color: "bg-yellow-500", sector: "Biotech", basePrice: 15, volatility: 0.18 },
  { name: "PowerGrid Utils", ticker: "PGRD", color: "bg-green-800", sector: "Utilities", basePrice: 72, volatility: 0.02, dividend: 0.03 },
];

// ---- NEWS EVENTS ----
const newsPool = [
  { headline: "Federal Reserve Raises Interest Rates", hint: "Banks benefit, growth stocks suffer", effects: { SHVN: 0.08, PGRD: 0.04, TVLT: -0.10, DSTR: -0.08, RSHT: -0.06 } },
  { headline: "TechVault Announces Revolutionary AI Product", hint: "Tech sector could surge", effects: { TVLT: 0.25, DSTR: 0.12, PXPL: 0.08 } },
  { headline: "Oil Prices Surge on Supply Shortage", hint: "Energy and commodities up, airlines down", effects: { OLRK: 0.15, GLEF: 0.10, RSHT: -0.18, GSHP: -0.08 } },
  { headline: "Consumer Spending Hits Record High", hint: "Consumer & entertainment sectors rally", effects: { FBIT: 0.14, PXPL: 0.12, RSHT: 0.08 } },
  { headline: "Recession Fears Growing Among Economists", hint: "Defensive stocks hold, growth crashes", effects: { MEDI: 0.05, PGRD: 0.03, SHVN: 0.02, TVLT: -0.15, RSHT: -0.20, BSPK: -0.12 } },
  { headline: "Government Announces Solar Energy Subsidies", hint: "Green energy gets a massive boost", effects: { GLEF: 0.22, PGRD: 0.06, OLRK: -0.10 } },
  { headline: "BioSpark Gets FDA Approval for New Drug", hint: "Biotech could skyrocket on event", effects: { BSPK: 0.45, MEDI: 0.08 } },
  { headline: "Major Cyberattack Disrupts Cloud Services", hint: "Cloud and tech stocks may drop", effects: { DSTR: -0.18, TVLT: -0.08, PXPL: -0.06 } },
  { headline: "Global Shipping Routes Disrupted", hint: "Shipping costs soar, trade slows", effects: { GSHP: 0.20, FBIT: -0.08, OLRK: -0.05 } },
  { headline: "New Gaming Console Launches to Record Sales", hint: "Gaming sector set to boom", effects: { PXPL: 0.28, TVLT: 0.06 } },
  { headline: "Inflation Report Worse Than Expected", hint: "Cash loses value, real assets win", effects: { OLRK: 0.10, GLEF: 0.05, SHVN: -0.06, allCash: -0.02 } },
  { headline: "Airline Industry Recovery Accelerates", hint: "Travel stocks may rally big", effects: { RSHT: 0.30, FBIT: 0.06 } },
  { headline: "Tech Earnings Disappoint Wall Street", hint: "Tech pullback incoming", effects: { TVLT: -0.12, DSTR: -0.10, PXPL: -0.08 } },
  { headline: "Healthcare Reform Bill Passes Senate", hint: "Healthcare gets a boost", effects: { MEDI: 0.15, BSPK: 0.10 } },
  { headline: "Massive Gold Discovery in Alaska", hint: "Mining sector explodes", effects: { OLRK: 0.25, GLEF: -0.04 } },
  { headline: "Electric Vehicle Sales Surge 40%", hint: "Green energy and tech benefit", effects: { GLEF: 0.18, TVLT: 0.08, OLRK: -0.08 } },
];

const specialEvents = [
  { type: "crash", title: "🔴 MARKET CRASH", desc: "Global panic! All stocks drop 20-40%.", lesson: "Always keep cash for buying opportunities." },
  { type: "dividend", title: "💰 DIVIDEND PAYMENT", desc: "Dividend stocks pay out to holders!", lesson: "Passive income from dividends compounds over time." },
  { type: "ipo", title: "🚀 IPO OPPORTUNITY", desc: "New company NovaTech listing at $12/share!", lesson: "IPOs are risky but can be transformative." },
  { type: "inflation", title: "📈 INFLATION SURGE", desc: "Prices up, cash purchasing power down.", lesson: "Inflation erodes cash savings over time." },
];

const STARTING_CASH = 10000;
const TOTAL_ROUNDS = 8;

interface Position { shares: number; avgPrice: number; }
type Portfolio = Record<string, Position>;
type Phase = "news" | "trading" | "events" | "review" | "gameover";

const SimTradingGame = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("news");
  const [cash, setCash] = useState(STARTING_CASH);
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [prices, setPrices] = useState(() => companies.map(c => c.basePrice));
  const [prevPrices, setPrevPrices] = useState(() => companies.map(c => c.basePrice));
  const [currentNews, setCurrentNews] = useState(() => newsPool[Math.floor(Math.random() * newsPool.length)]);
  const [roundEvents, setRoundEvents] = useState<{ ticker: string; change: number; reason: string }[]>([]);
  const [specialEvent, setSpecialEvent] = useState<typeof specialEvents[0] | null>(null);
  const [timer, setTimer] = useState(60);
  const [bestDecision, setBestDecision] = useState("");
  const [worstDecision, setWorstDecision] = useState("");
  const [gemsClaimed, setGemsClaimed] = useState(false);
  const [tradesMade, setTradesMade] = useState(0);
  const [ipoAvailable, setIpoAvailable] = useState(false);
  const [ipoPrice, setIpoPrice] = useState(12);
  const [ipoShares, setIpoShares] = useState(0);
  const [roundHistory, setRoundHistory] = useState<number[]>([]);
  const [buyAmount, setBuyAmount] = useState<Record<string, number>>({});

  // Timer for trading phase
  useEffect(() => {
    if (phase !== "trading") return;
    if (timer <= 0) { resolveRound(); return; }
    const t = setTimeout(() => setTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase]);

  const portfolioValue = companies.reduce((sum, c, i) => sum + (portfolio[c.ticker]?.shares ?? 0) * prices[i], 0) + ipoShares * ipoPrice;
  const totalValue = cash + portfolioValue;
  const totalReturn = ((totalValue - STARTING_CASH) / STARTING_CASH) * 100;

  const buyStock = (idx: number, qty: number) => {
    const c = companies[idx];
    const cost = prices[idx] * qty;
    if (cash < cost) { toast.error("Not enough cash!"); return; }
    setCash(prev => Math.round((prev - cost) * 100) / 100);
    setPortfolio(prev => {
      const existing = prev[c.ticker] || { shares: 0, avgPrice: 0 };
      const totalCost = existing.avgPrice * existing.shares + cost;
      const newShares = existing.shares + qty;
      return { ...prev, [c.ticker]: { shares: newShares, avgPrice: totalCost / newShares } };
    });
    setTradesMade(t => t + 1);
    toast.success(`Bought ${qty} ${c.ticker} @ $${prices[idx].toFixed(2)}`);
  };

  const sellStock = (idx: number, qty: number) => {
    const c = companies[idx];
    const pos = portfolio[c.ticker];
    if (!pos || pos.shares < qty) { toast.error("Not enough shares!"); return; }
    const revenue = prices[idx] * qty;
    setCash(prev => Math.round((prev + revenue) * 100) / 100);
    setPortfolio(prev => {
      const newShares = prev[c.ticker].shares - qty;
      return { ...prev, [c.ticker]: { shares: newShares, avgPrice: newShares > 0 ? prev[c.ticker].avgPrice : 0 } };
    });
    setTradesMade(t => t + 1);
    toast.success(`Sold ${qty} ${c.ticker} @ $${prices[idx].toFixed(2)}`);
  };

  const resolveRound = () => {
    setPrevPrices([...prices]);
    const news = currentNews;
    const events: { ticker: string; change: number; reason: string }[] = [];
    const newPrices = [...prices];

    // Apply news effects
    companies.forEach((c, i) => {
      const effect = (news.effects as any)[c.ticker] ?? 0;
      const noise = (Math.random() - 0.5) * c.volatility * 0.5;
      const totalChange = effect + noise;
      newPrices[i] = Math.max(1, Math.round((newPrices[i] * (1 + totalChange)) * 100) / 100);
      if (Math.abs(effect) > 0.01) {
        events.push({
          ticker: c.ticker,
          change: Math.round(totalChange * 100),
          reason: effect > 0 ? `${c.name} benefits from: ${news.headline}` : `${c.name} hurt by: ${news.headline}`
        });
      }
    });

    // Special event check (rounds 3, 5, 7)
    let sEvent: typeof specialEvents[0] | null = null;
    if ([3, 5, 7].includes(round)) {
      sEvent = specialEvents[Math.floor(Math.random() * specialEvents.length)];
      if (sEvent.type === "crash") {
        companies.forEach((_, i) => {
          const drop = 0.2 + Math.random() * 0.2;
          newPrices[i] = Math.max(1, Math.round(newPrices[i] * (1 - drop) * 100) / 100);
        });
      } else if (sEvent.type === "dividend") {
        let dividendPay = 0;
        companies.forEach((c, i) => {
          if (c.dividend && portfolio[c.ticker]?.shares) {
            const payout = Math.round(portfolio[c.ticker].shares * newPrices[i] * c.dividend * 100) / 100;
            dividendPay += payout;
          }
        });
        if (dividendPay > 0) setCash(prev => prev + dividendPay);
      } else if (sEvent.type === "ipo") {
        setIpoAvailable(true);
        setIpoPrice(12);
      } else if (sEvent.type === "inflation") {
        setCash(prev => Math.round(prev * 0.98 * 100) / 100);
      }
      setSpecialEvent(sEvent);
    }

    setPrices(newPrices);
    setRoundEvents(events.sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 6));

    // Calculate best/worst decision
    let bestTicker = "", bestPct = -Infinity, worstTicker = "", worstPct = Infinity;
    companies.forEach((c, i) => {
      if (portfolio[c.ticker]?.shares > 0) {
        const pct = ((newPrices[i] - prevPrices[i]) / prevPrices[i]) * 100;
        if (pct > bestPct) { bestPct = pct; bestTicker = c.ticker; }
        if (pct < worstPct) { worstPct = pct; worstTicker = c.ticker; }
      }
    });
    setBestDecision(bestTicker ? `${bestTicker} ${bestPct >= 0 ? "+" : ""}${bestPct.toFixed(1)}%` : "No positions held");
    setWorstDecision(worstTicker && worstPct < 0 ? `${worstTicker} ${worstPct.toFixed(1)}%` : "No losses this round");
    
    setRoundHistory(prev => [...prev, totalValue]);
    setPhase("events");
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setPhase("gameover");
      return;
    }
    setRound(r => r + 1);
    setCurrentNews(newsPool[Math.floor(Math.random() * newsPool.length)]);
    setTimer(60);
    setSpecialEvent(null);
    setPhase("news");
  };

  // Score calculation
  const finalScore = (() => {
    const returnPct = totalReturn;
    let score = 50; // baseline
    if (returnPct >= 80) score = 100;
    else if (returnPct >= 50) score = 90;
    else if (returnPct >= 30) score = 80;
    else if (returnPct >= 15) score = 70;
    else if (returnPct >= 5) score = 60;
    else if (returnPct >= 0) score = 50;
    else if (returnPct >= -10) score = 35;
    else score = 15;
    // Diversification bonus
    const held = companies.filter(c => (portfolio[c.ticker]?.shares ?? 0) > 0).length;
    if (held >= 5) score = Math.min(100, score + 5);
    return Math.round(score);
  })();

  const reset = () => {
    setRound(1); setPhase("news"); setCash(STARTING_CASH); setPortfolio({});
    setPrices(companies.map(c => c.basePrice)); setPrevPrices(companies.map(c => c.basePrice));
    setCurrentNews(newsPool[Math.floor(Math.random() * newsPool.length)]);
    setRoundEvents([]); setSpecialEvent(null); setTimer(60);
    setBestDecision(""); setWorstDecision(""); setGemsClaimed(false);
    setTradesMade(0); setIpoAvailable(false); setIpoShares(0);
    setRoundHistory([]); setBuyAmount({});
  };

  // ---- GAME OVER ----
  if (phase === "gameover") {
    const grade = getGrade(finalScore);
    const gems = getGemsFromScore(finalScore);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="text-center space-y-2">
          <p className="text-5xl">🏆</p>
          <p className="text-4xl font-black font-display">{grade}</p>
          <p className="text-2xl font-bold">{finalScore}/100</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-xl p-3"><p className="text-muted-foreground text-xs">Final Value</p><p className="font-bold font-display text-lg">${Math.round(totalValue).toLocaleString()}</p></div>
            <div className="bg-muted/50 rounded-xl p-3"><p className="text-muted-foreground text-xs">Total Return</p><p className={cn("font-bold font-display text-lg", totalReturn >= 0 ? "text-emerald-600" : "text-destructive")}>{totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%</p></div>
          </div>
          {personalBest !== null && personalBest !== undefined && finalScore > personalBest && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-yellow-400 text-yellow-900 rounded-xl p-3 font-extrabold text-sm">
              🎉 NEW PERSONAL BEST! {finalScore} beats {personalBest}!
            </motion.div>
          )}
          {!gemsClaimed ? (
            <Button onClick={async () => { await earnGems(gems * gemsMultiplier); onComplete?.(finalScore); setGemsClaimed(true); toast.success(`+${gems * gemsMultiplier} gems!`); }}
              className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white">
              <Diamond className="w-4 h-4 mr-1" /> Claim {gems * gemsMultiplier} Gems
              {gemsMultiplier === 2 && <span className="ml-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">2× DAILY</span>}
            </Button>
          ) : <p className="text-cyan-600 font-bold text-sm">✓ +{gems * gemsMultiplier} gems claimed!</p>}
          <Button variant="outline" onClick={reset} className="w-full rounded-xl font-bold"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
        </div>
      </motion.div>
    );
  }

  // ---- NEWS PHASE ----
  if (phase === "news") {
    return (
      <motion.div initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.5 }} className="space-y-5">
        {/* Round indicator */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div key={i} className={cn("w-8 h-2 rounded-full", i < round - 1 ? "bg-primary" : i === round - 1 ? "bg-primary/50 animate-pulse" : "bg-muted")} />
            ))}
          </div>
          <span className="text-sm font-bold text-muted-foreground">Year {round}/{TOTAL_ROUNDS}</span>
        </div>

        {/* Portfolio summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/50 rounded-xl p-2"><p className="text-[10px] text-muted-foreground">Cash</p><p className="font-bold font-display text-sm">${Math.round(cash).toLocaleString()}</p></div>
          <div className="bg-muted/50 rounded-xl p-2"><p className="text-[10px] text-muted-foreground">Portfolio</p><p className="font-bold font-display text-sm text-primary">${Math.round(portfolioValue).toLocaleString()}</p></div>
          <div className="bg-muted/50 rounded-xl p-2"><p className="text-[10px] text-muted-foreground">Return</p><p className={cn("font-bold font-display text-sm", totalReturn >= 0 ? "text-emerald-600" : "text-destructive")}>{totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%</p></div>
        </div>

        {/* Newspaper */}
        <motion.div initial={{ scale: 0.8, rotate: -5 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 10 }}
          className="bg-card border-2 border-border rounded-2xl p-6 text-center space-y-3 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Newspaper className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Morning Financial Times</span>
          </div>
          <div className="border-t border-b border-border py-4">
            <h2 className="text-xl font-black font-display leading-tight">{currentNews.headline}</h2>
          </div>
          <p className="text-sm text-muted-foreground italic">💡 {currentNews.hint}</p>
        </motion.div>

        <Button onClick={() => setPhase("trading")} className="w-full rounded-xl font-bold text-base py-3">
          Open Trading Floor →
        </Button>
      </motion.div>
    );
  }

  // ---- TRADING PHASE ----
  if (phase === "trading") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-2 flex-1">
            <div><p className="text-[10px] text-muted-foreground">Cash</p><p className="font-bold font-display text-sm">${Math.round(cash).toLocaleString()}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Portfolio</p><p className="font-bold font-display text-sm text-primary">${Math.round(portfolioValue).toLocaleString()}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Return</p><p className={cn("font-bold font-display text-sm", totalReturn >= 0 ? "text-emerald-600" : "text-destructive")}>{totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%</p></div>
          </div>
          <div className={cn("flex items-center gap-1 font-mono font-bold text-sm px-3 py-1.5 rounded-full", timer <= 10 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-muted-foreground")}>
            <Timer className="w-3.5 h-3.5" /> {timer}s
          </div>
        </div>

        {/* News reminder */}
        <div className="bg-muted/30 rounded-lg p-2 text-xs text-muted-foreground text-center italic">
          📰 "{currentNews.headline}"
        </div>

        {/* Stock list */}
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
          {companies.map((c, i) => {
            const pos = portfolio[c.ticker];
            const held = pos?.shares ?? 0;
            const pctFromBase = ((prices[i] - c.basePrice) / c.basePrice * 100);
            const qty = buyAmount[c.ticker] ?? 1;
            return (
              <div key={c.ticker} className="bg-card rounded-xl border border-border p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", c.color)} />
                    <div>
                      <span className="font-bold text-sm font-display">{c.ticker}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5">{c.sector}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-display text-sm">${prices[i].toFixed(2)}</span>
                    {c.dividend && <span className="text-[9px] text-emerald-600 ml-1">DIV</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {held > 0 && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{held} shares (${Math.round(held * prices[i])})</span>}
                  <div className="flex items-center gap-1 ml-auto">
                    <select value={qty} onChange={e => setBuyAmount(prev => ({...prev, [c.ticker]: parseInt(e.target.value)}))}
                      className="h-7 rounded-lg border text-xs px-1 bg-background">
                      {[1, 5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <Button size="sm" variant="outline" onClick={() => buyStock(i, qty)} className="h-7 px-2 text-xs rounded-lg" disabled={cash < prices[i] * qty}>Buy</Button>
                    <Button size="sm" variant="ghost" onClick={() => sellStock(i, Math.min(qty, held))} className="h-7 px-2 text-xs rounded-lg" disabled={held === 0}>Sell</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={resolveRound} className="w-full rounded-xl font-bold py-3">
          ⏰ End Trading & See Results
        </Button>
      </div>
    );
  }

  // ---- EVENTS PHASE ----
  if (phase === "events") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <p className="text-center font-bold font-display text-lg">Year {round} Results</p>

        {/* Special event */}
        {specialEvent && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className={cn("rounded-xl p-4 border-2 text-center", specialEvent.type === "crash" ? "bg-destructive/10 border-destructive/30" : specialEvent.type === "dividend" ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300")}>
            <p className="text-2xl mb-1">{specialEvent.title}</p>
            <p className="text-sm text-muted-foreground">{specialEvent.desc}</p>
            <p className="text-xs text-primary font-medium mt-2">💡 {specialEvent.lesson}</p>
          </motion.div>
        )}

        {/* Stock movements */}
        <div className="space-y-1.5">
          {roundEvents.map((evt, i) => (
            <motion.div key={evt.ticker} initial={{ opacity: 0, x: evt.change > 0 ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
              className={cn("flex items-center justify-between rounded-lg p-2.5 border", evt.change > 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
              <div className="flex items-center gap-2">
                {evt.change > 0 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                <span className="text-sm font-bold">{evt.ticker}</span>
              </div>
              <span className={cn("font-bold font-display", evt.change > 0 ? "text-emerald-600" : "text-destructive")}>
                {evt.change > 0 ? "+" : ""}{evt.change}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* Round review */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Portfolio Value:</span><span className="font-bold">${Math.round(totalValue).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Best Position:</span><span className="font-bold text-emerald-600">{bestDecision}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Worst Position:</span><span className="font-bold text-destructive">{worstDecision}</span></div>
        </div>

        <Button onClick={nextRound} className="w-full rounded-xl font-bold py-3">
          {round >= TOTAL_ROUNDS ? "See Final Results 🏁" : "Next Year →"}
        </Button>
      </motion.div>
    );
  }

  return null;
};

export default SimTradingGame;
