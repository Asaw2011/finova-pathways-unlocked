import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Diamond, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

const resources = [
  { name: "Coconut Farm", emoji: "🥥", type: "dividend", baseReturn: 0.06, volatility: 0.03, desc: "Steady income like a dividend stock" },
  { name: "Gold Mine", emoji: "⛏️", type: "volatile", baseReturn: 0.12, volatility: 0.25, desc: "High risk, high reward" },
  { name: "Trading Post", emoji: "🏪", type: "etf", baseReturn: 0.08, volatility: 0.08, desc: "Earns from island commerce" },
  { name: "Research Lab", emoji: "🔬", type: "growth", baseReturn: 0.15, volatility: 0.15, desc: "High growth, takes time" },
  { name: "Fish Market", emoji: "🐟", type: "staple", baseReturn: 0.05, volatility: 0.02, desc: "Consumer staple, reliable" },
  { name: "Shipwreck Salvage", emoji: "🚢", type: "speculative", baseReturn: 0.20, volatility: 0.35, desc: "Speculative like a startup" },
];

const islandEvents = [
  { title: "🌊 Storm hits the island!", effects: { "Coconut Farm": -0.3, "Fish Market": -0.2, "Trading Post": -0.1 }, narrative: "Storms destroy farms and disrupt fishing. Diversified portfolios survive better." },
  { title: "💎 Gold discovered in the hills!", effects: { "Gold Mine": 0.5, "Trading Post": 0.1 }, narrative: "Commodity booms are unpredictable. Lucky miners get rich, but it doesn't last forever." },
  { title: "👥 New survivors arrive!", effects: { "Trading Post": 0.3, "Fish Market": 0.15, "Coconut Farm": 0.1 }, narrative: "More people = more commerce. Consumer businesses thrive with growing populations." },
  { title: "🔬 Research breakthrough!", effects: { "Research Lab": 0.6, "Trading Post": 0.05 }, narrative: "Innovation pays off for patient investors. Growth takes time but can be massive." },
  { title: "☀️ Drought! Water scarce.", effects: { "Fish Market": -0.3, "Coconut Farm": -0.2 }, narrative: "Environmental risk affects multiple sectors. This is why you don't put all eggs in one basket." },
  { title: "🏴‍☠️ Pirates spotted nearby!", effects: { "Shipwreck Salvage": 0.4, "Trading Post": -0.2, "Gold Mine": -0.1 }, narrative: "Risk creates opportunity for some and losses for others." },
  { title: "🎉 Festival boosts morale!", effects: { "Fish Market": 0.2, "Coconut Farm": 0.15, "Trading Post": 0.2 }, narrative: "Consumer spending during good times lifts all boats." },
  { title: "🌋 Volcano warning issued!", effects: { "Gold Mine": -0.4, "Research Lab": -0.2, "Shipwreck Salvage": -0.3 }, narrative: "Systemic risk can't be diversified away. But prepared investors recover faster." },
];

const STARTING_CASH = 10000;
const RESCUE_TARGET = 50000;
const TOTAL_ROUNDS = 10;
const REBALANCE_FEE = 0.05;

const InvestingIsland = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [phase, setPhase] = useState<"allocate" | "event" | "review" | "gameover">("allocate");
  const [round, setRound] = useState(1);
  const [cash, setCash] = useState(STARTING_CASH);
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [values, setValues] = useState<Record<string, number>>({});
  const [currentEvent, setCurrentEvent] = useState(islandEvents[0]);
  const [gemsClaimed, setGemsClaimed] = useState(false);
  const [roundReturns, setRoundReturns] = useState<number[]>([]);

  const totalValue = cash + Object.values(values).reduce((s, v) => s + v, 0);
  const investedCount = Object.values(values).filter(v => v > 0).length;
  const rescued = totalValue >= RESCUE_TARGET;

  const allocate = (resourceName: string, amount: number) => {
    if (amount > cash) return;
    setCash(c => c - amount);
    setAllocations(prev => ({ ...prev, [resourceName]: (prev[resourceName] || 0) + amount }));
    setValues(prev => ({ ...prev, [resourceName]: (prev[resourceName] || 0) + amount }));
  };

  const confirmAllocations = () => {
    const event = islandEvents[Math.floor(Math.random() * islandEvents.length)];
    setCurrentEvent(event);

    // Apply returns
    const newValues = { ...values };
    let roundReturn = 0;
    resources.forEach(r => {
      if (!newValues[r.name] || newValues[r.name] <= 0) return;
      const eventEffect = (event.effects as any)[r.name] ?? 0;
      const baseReturn = r.baseReturn + (Math.random() - 0.5) * r.volatility;
      const totalReturn = baseReturn + eventEffect;
      const change = Math.round(newValues[r.name] * totalReturn);
      newValues[r.name] = Math.max(0, newValues[r.name] + change);
      roundReturn += change;
    });

    // Diversification bonus
    if (investedCount >= 3) {
      const bonus = Math.round(totalValue * 0.02);
      setCash(c => c + bonus);
      roundReturn += bonus;
    }

    setValues(newValues);
    setRoundReturns(prev => [...prev, roundReturn]);
    setPhase("event");
  };

  const nextRound = () => {
    if (rescued || round >= TOTAL_ROUNDS) {
      setPhase("gameover");
      return;
    }
    setRound(r => r + 1);
    setAllocations({});
    setPhase("allocate");
  };

  const reset = () => {
    setPhase("allocate"); setRound(1); setCash(STARTING_CASH);
    setAllocations({}); setValues({}); setGemsClaimed(false); setRoundReturns([]);
  };

  const gameScore = (() => {
    const wealthScore = Math.min(60, (totalValue / RESCUE_TARGET) * 60);
    const rescueBonus = rescued ? 20 : 0;
    const speedBonus = rescued ? Math.max(0, (TOTAL_ROUNDS - round) * 2) : 0;
    const diverseBonus = investedCount >= 3 ? 10 : investedCount >= 2 ? 5 : 0;
    return Math.round(Math.min(100, wealthScore + rescueBonus + speedBonus + diverseBonus));
  })();

  if (phase === "gameover") {
    const grade = getGrade(gameScore);
    const gems = getGemsFromScore(gameScore);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
        <p className="text-5xl">{rescued ? "🚢" : "🏝️"}</p>
        <p className="text-2xl font-black font-display">{rescued ? "RESCUED!" : "Stranded..."}</p>
        <p className="text-4xl font-black font-display">{grade}</p>
        <p className="text-xl font-bold">{gameScore}/100</p>
        <p className="text-sm text-muted-foreground">Final wealth: <span className="font-bold">${Math.round(totalValue).toLocaleString()}</span> / ${RESCUE_TARGET.toLocaleString()} target</p>
        {personalBest !== null && personalBest !== undefined && gameScore > personalBest && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-yellow-400 text-yellow-900 rounded-xl p-3 font-extrabold text-sm">🎉 NEW PERSONAL BEST!</motion.div>
        )}
        {!gemsClaimed ? (
          <Button onClick={async () => { await earnGems(gems * gemsMultiplier); onComplete?.(gameScore); setGemsClaimed(true); toast.success(`+${gems * gemsMultiplier} gems!`); }}
            className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white"><Diamond className="w-4 h-4 mr-1" /> Claim {gems * gemsMultiplier} Gems</Button>
        ) : <p className="text-cyan-600 font-bold text-sm">✓ Gems claimed!</p>}
        <Button variant="outline" onClick={reset} className="w-full rounded-xl"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
      </motion.div>
    );
  }

  if (phase === "allocate") {
    const quickAmounts = [500, 1000, 2000, 5000];
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div key={i} className={cn("w-6 h-2 rounded-full", i < round - 1 ? "bg-primary" : i === round - 1 ? "bg-primary/50 animate-pulse" : "bg-muted")} />
            ))}
          </div>
          <span className="text-sm font-bold text-muted-foreground">Round {round}/{TOTAL_ROUNDS}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Cash</p>
            <p className="font-bold font-display text-lg">${Math.round(cash).toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border p-3 text-center">
            <p className="text-xs text-muted-foreground">Total Wealth</p>
            <p className={cn("font-bold font-display text-lg", totalValue >= RESCUE_TARGET ? "text-emerald-600" : "text-primary")}>${Math.round(totalValue).toLocaleString()}</p>
          </div>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (totalValue / RESCUE_TARGET) * 100)}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground text-center">🚢 Rescue at ${RESCUE_TARGET.toLocaleString()}</p>

        <div className="space-y-2">
          {resources.map(r => {
            const currentValue = values[r.name] || 0;
            return (
              <div key={r.name} className="bg-card rounded-xl border p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{r.emoji}</span>
                    <div>
                      <p className="font-bold text-sm">{r.name}</p>
                      <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                    </div>
                  </div>
                  {currentValue > 0 && <span className="text-xs font-bold text-primary">${Math.round(currentValue).toLocaleString()}</span>}
                </div>
                <div className="flex gap-1 mt-1">
                  {quickAmounts.filter(a => a <= cash).map(amt => (
                    <button key={amt} onClick={() => allocate(r.name, amt)}
                      className="text-[10px] bg-muted hover:bg-primary/10 px-2 py-1 rounded-lg font-bold transition-colors">+${amt >= 1000 ? `${amt/1000}k` : amt}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {investedCount >= 3 && <p className="text-xs text-emerald-600 font-bold text-center">🛡️ Diversification bonus active! (+2% cash per round)</p>}
        <Button onClick={confirmAllocations} className="w-full rounded-xl font-bold py-3" disabled={Object.values(values).every(v => v === 0)}>
          End Round — See Events ⚡
        </Button>
      </div>
    );
  }

  // EVENT PHASE
  if (phase === "event") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <motion.div initial={{ scale: 0.9, rotate: -2 }} animate={{ scale: 1, rotate: 0 }}
          className="bg-card border-2 rounded-2xl p-5 text-center space-y-3">
          <p className="text-2xl font-black font-display">{currentEvent.title}</p>
          <p className="text-sm text-muted-foreground">{currentEvent.narrative}</p>
          <div className="space-y-1">
            {Object.entries(currentEvent.effects).map(([name, effect]) => (
              <div key={name} className="flex justify-between text-sm">
                <span>{resources.find(r => r.name === name)?.emoji} {name}</span>
                <span className={cn("font-bold", (effect as number) > 0 ? "text-emerald-600" : "text-destructive")}>
                  {(effect as number) > 0 ? "+" : ""}{Math.round((effect as number) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="bg-muted/50 rounded-xl p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Round Return:</span>
            <span className={cn("font-bold", roundReturns[roundReturns.length - 1] >= 0 ? "text-emerald-600" : "text-destructive")}>
              {roundReturns[roundReturns.length - 1] >= 0 ? "+" : ""}${roundReturns[roundReturns.length - 1]?.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Wealth:</span>
            <span className="font-bold">${Math.round(totalValue).toLocaleString()}</span>
          </div>
        </div>

        <Button onClick={nextRound} className="w-full rounded-xl font-bold py-3">
          {rescued ? "You're Rescued! 🚢" : round >= TOTAL_ROUNDS ? "See Final Results 🏁" : "Next Round →"}
        </Button>
      </motion.div>
    );
  }

  return null;
};

export default InvestingIsland;
