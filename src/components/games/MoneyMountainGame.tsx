import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Diamond, RotateCcw, Mountain } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

// AI opponent personalities
const opponents = [
  { name: "Conservative Carl", emoji: "🧓", strategy: "safe" as const },
  { name: "Risk-Taking Rachel", emoji: "🎲", strategy: "risky" as const },
  { name: "Balanced Ben", emoji: "📊", strategy: "balanced" as const },
];

interface SpaceEvent {
  type: "income" | "expense" | "investment" | "shortcut" | "setback";
  title: string;
  description: string;
  choices: { label: string; advance: number; savings?: number; investment?: number; narrative: string; }[];
}

const mountainSpaces: SpaceEvent[] = [
  { type: "income", title: "💰 Overtime Pay", description: "You earned $800 extra this month. How do you allocate it?",
    choices: [
      { label: "Invest in index fund", advance: 3, investment: 800, narrative: "Smart! This $800 grows to $5,700 over 25 years at 8% returns." },
      { label: "Build emergency fund", advance: 2, savings: 800, narrative: "Solid foundation. Emergency funds prevent 90% of financial crises." },
      { label: "Treat yourself — new gadget", advance: 1, narrative: "Fun now, but that gadget loses 50% value in a year. The invested version grows forever." },
    ]},
  { type: "expense", title: "🔧 Car Registration Due", description: "Unavoidable: $450 car registration + inspection. Must pay.",
    choices: [
      { label: "Pay from emergency fund", advance: 2, savings: -450, narrative: "Emergency fund absorbed it. No stress, no debt. This is why you save." },
      { label: "Credit card — pay over time", advance: 0, narrative: "At 22% APR, this $450 becomes $549 over a year. Avoidable cost." },
      { label: "Skip meals for 2 weeks", advance: 1, narrative: "You saved money but at what cost? Health suffers, productivity drops. False economy." },
    ]},
  { type: "investment", title: "📈 Market Dip", description: "Stocks dropped 15% this month. Your investments are down.",
    choices: [
      { label: "Buy more — stocks are on sale", advance: 4, investment: 500, narrative: "Buying during dips is how wealth is built. Warren Buffett: 'Be greedy when others are fearful.'" },
      { label: "Hold steady — don't panic", advance: 2, narrative: "Patience is a virtue. Markets recover 100% of the time historically. Good composure." },
      { label: "Sell everything — protect what's left", advance: 0, investment: -500, narrative: "You locked in losses! The market recovered next month. Panic selling is the #1 wealth destroyer." },
    ]},
  { type: "income", title: "🎁 Tax Refund: $1,200", description: "Uncle Sam is sending money. How do you use it?",
    choices: [
      { label: "Split: half invest, half emergency fund", advance: 3, savings: 600, investment: 600, narrative: "Perfect balance. You're building wealth AND safety net simultaneously." },
      { label: "All into investments", advance: 3, investment: 1200, narrative: "Aggressive but smart if your emergency fund is solid. Time in market beats timing the market." },
      { label: "Vacation fund — you deserve it", advance: 1, narrative: "Memories are priceless, but so is compound interest. This $1,200 invested becomes $8,600 in 25 years." },
    ]},
  { type: "expense", title: "🏥 Medical Bill: $1,800", description: "Unexpected ER visit. Insurance covered part, but you owe $1,800.",
    choices: [
      { label: "Emergency fund covers it", advance: 3, savings: -1800, narrative: "This is the EXACT scenario emergency funds are for. Paid, done, no drama." },
      { label: "Negotiate a payment plan", advance: 2, narrative: "Most hospitals offer 0% interest plans. You asked and got 12 monthly payments of $150." },
      { label: "Ignore it — maybe it goes away", advance: -2, narrative: "Medical debt goes to collections. Your credit score drops 100+ points. It NEVER goes away." },
    ]},
  { type: "investment", title: "🎰 Friend's 'Sure Thing' Stock Tip", description: "Your friend swears this penny stock will 10x. $500 to invest.",
    choices: [
      { label: "Hard pass — stick to index funds", advance: 3, narrative: "Smart. 90% of penny stock tips lead to losses. Your boring index fund beats 80% of traders." },
      { label: "Small bet — $100 only", advance: 1, investment: -100, narrative: "The stock dropped 80%. You lost $80 but learned a $80 lesson about speculation vs investing." },
      { label: "All in — YOLO $500", advance: -3, investment: -500, narrative: "The stock was a pump-and-dump scheme. $500 gone in 2 days. Your friend lost money too." },
    ]},
  { type: "income", title: "💼 Freelance Project: $2,000", description: "A side project paid $2,000. You have options.",
    choices: [
      { label: "Pay down high-interest debt", advance: 4, narrative: "Eliminating 22% APR debt is like earning a guaranteed 22% return. Mathematically the best move." },
      { label: "Invest in yourself — take a course", advance: 3, narrative: "A $500 course leads to a $5,000/year raise. ROI: 900%. Best investment is always in yourself." },
      { label: "Upgrade your phone", advance: 1, narrative: "Your old phone worked fine. This $2,000 phone will be worth $400 in 2 years. Depreciating 'asset.'" },
    ]},
  { type: "setback", title: "⚡ Job Layoff Warning", description: "Your company is doing layoffs. You might be next. 3 months runway needed.",
    choices: [
      { label: "3+ months emergency fund? You're safe.", advance: 3, narrative: "You sleep well at night. While coworkers panic, you calmly update your resume. Financial security = mental security." },
      { label: "1 month saved — scramble mode", advance: 1, narrative: "Tight. You cut all discretionary spending and start job hunting immediately. Stressful but survivable." },
      { label: "No savings — full panic", advance: -2, narrative: "Credit cards for rent. Payday loans for groceries. The debt spiral begins. This is why emergency funds aren't optional." },
    ]},
  { type: "investment", title: "🏠 Real Estate Opportunity", description: "A rental property is available for $20,000 down payment.",
    choices: [
      { label: "Invest if you have stable income + savings", advance: 4, investment: 5000, narrative: "Rental income $1,200/mo, mortgage $900/mo. $300/mo passive income. Real estate builds generational wealth." },
      { label: "Not ready — keep building foundation", advance: 2, narrative: "Wise if your emergency fund isn't full. Real estate without reserves is a foreclosure waiting to happen." },
      { label: "Use retirement savings for down payment", advance: -1, investment: -5000, narrative: "You paid 10% early withdrawal penalty + taxes. That $20,000 from retirement was worth $140,000 at 65." },
    ]},
  { type: "income", title: "🎓 Inheritance: $5,000", description: "A relative left you $5,000. An emotional and financial decision.",
    choices: [
      { label: "Honor them — invest for the long term", advance: 4, investment: 5000, narrative: "In 30 years at 8%, this becomes $50,300. Your relative's gift keeps giving across generations." },
      { label: "Split between savings and one memorial item", advance: 3, savings: 3000, narrative: "A $2,000 memorial purchase and $3,000 saved. Balanced tribute to their memory." },
      { label: "Spend it all — life is short", advance: 1, narrative: "The items are forgotten in months. The invested version would have funded your child's first semester of college." },
    ]},
];

const SUMMIT = 30;

const MoneyMountainGame = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [position, setPosition] = useState(0);
  const [spaceIdx, setSpaceIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [savings, setSavings] = useState(2000);
  const [investments, setInvestments] = useState(0);
  const [opponentPositions, setOpponentPositions] = useState([0, 0, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [gemsClaimed, setGemsClaimed] = useState(false);

  const space = mountainSpaces[spaceIdx % mountainSpaces.length];

  const handleChoice = (choiceIdx: number) => {
    if (selected !== null) return;
    setSelected(choiceIdx);
    const choice = space.choices[choiceIdx];
    const newPos = Math.max(0, Math.min(SUMMIT, position + choice.advance));
    setPosition(newPos);
    if (choice.savings) setSavings(s => s + choice.savings!);
    if (choice.investment) setInvestments(inv => inv + choice.investment!);

    // Move opponents
    setOpponentPositions(prev => prev.map((p, i) => {
      const strat = opponents[i].strategy;
      const advance = strat === "safe" ? 1 + Math.floor(Math.random() * 2) :
        strat === "risky" ? Math.floor(Math.random() * 5) - 1 :
        1 + Math.floor(Math.random() * 3);
      return Math.max(0, Math.min(SUMMIT, p + advance));
    }));
  };

  const nextSpace = () => {
    if (position >= SUMMIT) { setGameOver(true); return; }
    setSpaceIdx(s => s + 1);
    setSelected(null);
    setInvestments(inv => Math.round(inv * 1.03));
  };

  const reset = () => {
    setPosition(0); setSpaceIdx(0); setSelected(null);
    setSavings(2000); setInvestments(0); setOpponentPositions([0, 0, 0]);
    setGameOver(false); setGemsClaimed(false);
  };

  const gameScore = (() => {
    const posScore = Math.min(50, (position / SUMMIT) * 50);
    const wealthScore = Math.min(30, ((savings + investments) / 10000) * 30);
    const speedBonus = position >= SUMMIT ? 20 : 0;
    return Math.round(posScore + wealthScore + speedBonus);
  })();

  if (gameOver) {
    const grade = getGrade(gameScore);
    const gems = getGemsFromScore(gameScore);
    const rank = [position, ...opponentPositions].sort((a, b) => b - a).indexOf(position) + 1;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
        <p className="text-5xl">⛰️</p>
        <p className="text-4xl font-black font-display">{grade}</p>
        <p className="text-2xl font-bold">{gameScore}/100</p>
        <p className="text-sm text-muted-foreground">You finished #{rank} on the mountain!</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200"><p className="text-xs text-emerald-700">Savings</p><p className="font-bold text-emerald-700">${savings.toLocaleString()}</p></div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200"><p className="text-xs text-blue-700">Investments</p><p className="font-bold text-blue-700">${investments.toLocaleString()}</p></div>
        </div>
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

  const allPositions = [{ name: "You", emoji: "🧗", pos: position }, ...opponents.map((o, i) => ({ name: o.name, emoji: o.emoji, pos: opponentPositions[i] }))];
  allPositions.sort((a, b) => b.pos - a.pos);

  return (
    <div className="space-y-4">
      {/* Mountain visualization */}
      <div className="bg-gradient-to-b from-blue-50 to-emerald-50 rounded-2xl p-4 border relative overflow-hidden">
        <div className="flex justify-between items-end h-32">
          {allPositions.map((p, i) => (
            <div key={p.name} className="flex flex-col items-center gap-1 flex-1">
              <motion.div animate={{ y: -(p.pos / SUMMIT) * 80 }} className="text-2xl">{p.emoji}</motion.div>
              <p className="text-[9px] font-bold text-muted-foreground">{p.name}</p>
              <p className="text-[9px] text-muted-foreground">{p.pos}/{SUMMIT}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">⛰️ Summit: {SUMMIT} spaces</p>
      </div>

      {/* Status */}
      <div className="flex gap-2 text-xs">
        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg font-bold">💰 ${savings.toLocaleString()}</span>
        <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-bold">📈 ${investments.toLocaleString()}</span>
        <span className="bg-muted text-muted-foreground px-2 py-1 rounded-lg font-bold ml-auto">Space {spaceIdx + 1}</span>
      </div>

      {/* Current space */}
      <motion.div key={spaceIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
        <h3 className="font-display font-extrabold text-lg">{space.title}</h3>
        <p className="text-sm text-muted-foreground">{space.description}</p>
        <div className="space-y-2">
          {space.choices.map((choice, i) => (
            <button key={i} onClick={() => handleChoice(i)}
              className={cn(
                "w-full text-left rounded-xl border-2 p-3.5 text-sm font-medium transition-all",
                selected === null && "border-border hover:border-primary/30 bg-card",
                selected === i && "border-primary bg-primary/5",
                selected !== null && selected !== i && "opacity-40"
              )}>
              {choice.label}
            </button>
          ))}
        </div>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 bg-muted/50 border space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-bold", space.choices[selected].advance > 0 ? "text-emerald-600" : space.choices[selected].advance < 0 ? "text-destructive" : "text-muted-foreground")}>
                {space.choices[selected].advance > 0 ? "⬆️" : space.choices[selected].advance < 0 ? "⬇️" : "➡️"} {space.choices[selected].advance > 0 ? "+" : ""}{space.choices[selected].advance} spaces
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{space.choices[selected].narrative}</p>
            <Button onClick={nextSpace} className="w-full rounded-xl font-bold mt-2">
              {position >= SUMMIT ? "Reach the Summit! 🏔️" : "Continue Climbing →"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MoneyMountainGame;
