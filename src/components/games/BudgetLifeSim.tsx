import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Diamond, RotateCcw, Heart, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

// ---- CHARACTER JOBS ----
const jobs = [
  { title: "Teacher", salary: 38000, icon: "📚" },
  { title: "Engineer", salary: 72000, icon: "⚙️" },
  { title: "Artist", salary: 28000, icon: "🎨" },
  { title: "Nurse", salary: 52000, icon: "🏥" },
];

const cities = [
  { name: "Small Town", costMult: 0.7, icon: "🏘️" },
  { name: "Big City", costMult: 1.4, icon: "🏙️" },
  { name: "Suburb", costMult: 1.0, icon: "🏡" },
];

// ---- LIFE EVENT SPACES ----
interface LifeChoice { label: string; savings?: number; debt?: number; investment?: number; stress?: number; narrative: string; }
interface LifeSpace { age: number; title: string; description: string; choices: LifeChoice[]; }

const lifeSpaces: LifeSpace[] = [
  { age: 22, title: "🏠 Rent or Buy?", description: "You need a place to live. Rent is $1,400/mo. A starter home costs $220,000 with a $44,000 down payment.",
    choices: [
      { label: "Rent — stay flexible", savings: -16800, stress: -5, narrative: "Renting preserves flexibility. No maintenance costs, but no equity building either. In 5 years you'll have spent $84,000 with nothing to show." },
      { label: "Buy — build equity", savings: -44000, investment: 15000, stress: 10, narrative: "Homeownership builds equity! Your $44k down payment is steep, but in 5 years you'll have ~$15k in equity. Maintenance costs are real though." },
      { label: "Roommates — split costs", savings: -8400, stress: 5, narrative: "Smart move early on. $700/mo with roommates saves you $8,400/year vs solo renting. Use the savings to invest!" },
    ]},
  { age: 24, title: "🚗 Car Decision", description: "You need reliable transportation to get to work.",
    choices: [
      { label: "Beater — $3,000 cash", savings: -3000, stress: 10, narrative: "Cheap upfront! But 40% chance of $800+ repairs per year. No car payment though — that's powerful for your budget." },
      { label: "Used — $15,000 financed", savings: -3000, debt: 12000, stress: 5, narrative: "Reliable with warranty. $250/mo payment for 4 years. Total cost: $15,000 + $1,800 interest = $16,800." },
      { label: "New — $32,000 financed", savings: -5000, debt: 27000, stress: 15, narrative: "That new car smell costs you $450/mo for 5 years. It loses 20% value ($6,400) the moment you drive off the lot." },
    ]},
  { age: 25, title: "💰 Emergency Fund Check", description: "Your car transmission fails: $2,200 repair bill. Right now.",
    choices: [
      { label: "Emergency fund covers it", savings: -2200, stress: -10, narrative: "Your emergency fund absorbed the hit. No debt, no drama. This is exactly why financial advisors scream about emergency funds." },
      { label: "Credit card at 22% APR", debt: 2200, stress: 15, narrative: "That $2,200 at 22% APR becomes $2,684 if paid over a year. Minimum payments? It takes 3 years and costs $3,300 total." },
      { label: "Borrow from family", savings: 0, stress: 20, narrative: "Money and family don't mix well. 48% of people who borrow from family report damaged relationships." },
    ]},
  { age: 27, title: "📈 First Investment Choice", description: "You have $5,000 saved. A friend says 'invest it!' Where?",
    choices: [
      { label: "Index fund — S&P 500", investment: 5000, stress: -5, narrative: "Historical average: 10% annually. In 20 years, this $5,000 becomes $33,600. Boring? Yes. Effective? Extremely." },
      { label: "Friend's startup", investment: -5000, stress: 15, narrative: "70% of startups fail. Your friend's idea sounded great... but 2 years later the company folds. $5,000 gone." },
      { label: "High-yield savings — 4.5%", savings: 5000, stress: -10, narrative: "Safe and liquid. In 20 years this becomes $12,100. Less than index funds but zero risk. Good for emergency fund." },
    ]},
  { age: 28, title: "💼 Salary Negotiation", description: "Annual review. Boss offers 3% raise. National average for your role is 12% higher.",
    choices: [
      { label: "Accept the 3% — don't rock the boat", savings: 500, stress: -5, narrative: "You left money on the table. Over 10 years, that gap compounds to $45,000+ in lost earnings." },
      { label: "Counter with 10% — back it with data", savings: 4000, stress: 5, narrative: "You presented market data and your achievements. Boss agreed to 8%. That's $4,000 more per year FOREVER. Negotiation is a superpower." },
      { label: "Counter with 20% — swing for the fences", savings: 0, stress: 15, narrative: "Too aggressive. Boss felt insulted and offered only the original 3%. Sometimes overplaying your hand backfires." },
    ]},
  { age: 29, title: "💍 Major Life Event", description: "Wedding planning! Average wedding costs $30,000. Your partner wants 'the dream wedding.'",
    choices: [
      { label: "Beautiful but budget — $8,000", savings: -8000, stress: -5, narrative: "Intimate ceremony with close friends. You started married life debt-free. Studies show expensive weddings correlate with higher divorce rates!" },
      { label: "Nice wedding — $18,000", savings: -18000, stress: 5, narrative: "Lovely event everyone enjoyed. You dipped into savings but didn't take on debt. Reasonable compromise." },
      { label: "Dream wedding — $35,000 (financed)", savings: -10000, debt: 25000, stress: 20, narrative: "Instagram-perfect. But you're starting marriage $25,000 in debt. That's 3 years of payments at $750/month." },
    ]},
  { age: 30, title: "🎉 Lifestyle Inflation Alert", description: "Raise! Your income just jumped 25%. How do you adjust?",
    choices: [
      { label: "Keep same lifestyle — invest the difference", investment: 8000, stress: -10, narrative: "In 10 years, investing that extra income grows to $124,000. You didn't feel deprived because you were already comfortable." },
      { label: "Small upgrade — nicer apartment, one treat", savings: -3000, investment: 3000, stress: 0, narrative: "Balanced approach. You enjoyed the raise a little but saved most of it. Net worth still growing." },
      { label: "Full upgrade — match spending to income", savings: -8000, stress: 10, narrative: "New car, bigger apartment, designer clothes. In 10 years you have NOTHING extra to show for 25% more income. This is the silent wealth killer." },
    ]},
  { age: 32, title: "👶 Growing Family", description: "Baby on the way! Childcare costs $1,500/month. Your budget needs restructuring.",
    choices: [
      { label: "Adjust budget — cut wants aggressively", savings: -12000, stress: 10, narrative: "You cut streaming, dining out, and gym. Tight but manageable. Emergency fund stays intact." },
      { label: "One parent stays home — lose an income", savings: -30000, stress: 15, narrative: "Huge sacrifice but saves on childcare. Long-term career impact is real though — re-entering workforce is hard." },
      { label: "Finance everything — credit cards", debt: 18000, stress: 25, narrative: "Diapers on credit? Formula on credit? The debt snowballs. In 2 years you owe $18,000 at 22% APR." },
    ]},
  { age: 35, title: "🏦 Retirement Reality Check", description: "You're 35. A financial calculator shows you need $1.2M to retire at 65. How much are you contributing?",
    choices: [
      { label: "Max out 401k — 15% of salary + employer match", investment: 25000, stress: 5, narrative: "At 15% + 6% match, you're on track. Employer match is FREE MONEY. $1 invested at 35 becomes $7.60 by 65." },
      { label: "Contribute to employer match — 6%", investment: 10000, stress: 0, narrative: "You're getting the free money but cutting it close. You'll need to increase contributions by 40 to hit your goal." },
      { label: "Skip it — retirement is 30 years away", investment: 0, stress: -5, narrative: "Every year you delay costs $50,000+ in lost compound growth. At 45 you'll need to save 3x as much monthly to catch up." },
    ]},
  { age: 38, title: "📊 Side Hustle Opportunity", description: "A friend offers a partnership in a business. Requires $10,000 investment and 10 hours/week.",
    choices: [
      { label: "Go for it — diversify income streams", investment: -10000, savings: 8000, stress: 10, narrative: "The business takes off slowly. After 2 years, it generates $800/month passive income. Risk paid off." },
      { label: "Keep focus on career — negotiate for promotion", savings: 6000, stress: 5, narrative: "You focus your energy on your day job and land a VP role with $15k raise. Sometimes the best investment is in yourself." },
      { label: "Start smaller — freelance on the side", savings: 4000, stress: 5, narrative: "Low risk, immediate income. You earn $400/month extra with skills you already have. Smart and practical." },
    ]},
];

const BudgetLifeSim = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [phase, setPhase] = useState<"setup" | "play" | "gameover">("setup");
  const [jobIndex, setJobIndex] = useState(0);
  const [cityIndex, setCityIndex] = useState(0);
  const [spaceIndex, setSpaceIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [savings, setSavings] = useState(0);
  const [debt, setDebt] = useState(0);
  const [investments, setInvestments] = useState(0);
  const [stress, setStress] = useState(30);
  const [gemsClaimed, setGemsClaimed] = useState(false);
  const [history, setHistory] = useState<{ age: number; choice: string; }[]>([]);

  const job = jobs[jobIndex];
  const city = cities[cityIndex];
  const monthlySalary = Math.round(job.salary / 12);
  const netWorth = savings + investments - debt;

  const startGame = () => {
    // Initial savings based on job (3 months of basic expenses)
    const initialSavings = Math.round(monthlySalary * 0.3 * 3);
    setSavings(initialSavings);
    setPhase("play");
  };

  const handleChoice = (choiceIdx: number) => {
    if (selected !== null) return;
    setSelected(choiceIdx);
    const choice = lifeSpaces[spaceIndex].choices[choiceIdx];
    if (choice.savings) setSavings(s => s + choice.savings!);
    if (choice.debt) setDebt(d => d + choice.debt!);
    if (choice.investment) setInvestments(inv => inv + choice.investment!);
    if (choice.stress) setStress(s => Math.max(0, Math.min(100, s + choice.stress!)));
    setHistory(prev => [...prev, { age: lifeSpaces[spaceIndex].age, choice: choice.label }]);
  };

  const nextSpace = () => {
    // Apply compound growth to investments each space
    setInvestments(inv => Math.round(inv * 1.08)); // ~8% growth per "period"
    if (spaceIndex + 1 >= lifeSpaces.length) {
      setPhase("gameover");
    } else {
      setSpaceIndex(s => s + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setPhase("setup"); setSpaceIndex(0); setSelected(null);
    setSavings(0); setDebt(0); setInvestments(0); setStress(30);
    setGemsClaimed(false); setHistory([]);
  };

  // Score: weighted combination of net worth, stress, and decisions
  const gameScore = (() => {
    const nwScore = Math.min(40, Math.max(0, (netWorth / 50000) * 40));
    const stressScore = Math.max(0, 30 - (stress / 100) * 30);
    const debtScore = Math.max(0, 30 - (debt / 30000) * 30);
    return Math.round(nwScore + stressScore + debtScore);
  })();

  // ---- SETUP ----
  if (phase === "setup") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <h3 className="font-display font-extrabold text-lg text-center">Create Your Character</h3>
        
        <div>
          <p className="text-sm font-bold mb-2">Choose your starting job:</p>
          <div className="grid grid-cols-2 gap-2">
            {jobs.map((j, i) => (
              <button key={j.title} onClick={() => setJobIndex(i)}
                className={cn("rounded-xl border-2 p-3 text-center transition-all", jobIndex === i ? "border-primary bg-primary/5" : "border-border")}>
                <p className="text-2xl">{j.icon}</p>
                <p className="font-bold text-sm">{j.title}</p>
                <p className="text-xs text-muted-foreground">${(j.salary / 1000).toFixed(0)}k/year</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold mb-2">Choose your city:</p>
          <div className="grid grid-cols-3 gap-2">
            {cities.map((c, i) => (
              <button key={c.name} onClick={() => setCityIndex(i)}
                className={cn("rounded-xl border-2 p-3 text-center transition-all", cityIndex === i ? "border-primary bg-primary/5" : "border-border")}>
                <p className="text-2xl">{c.icon}</p>
                <p className="font-bold text-xs">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.costMult > 1 ? "High cost" : c.costMult < 1 ? "Low cost" : "Average"}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-sm text-muted-foreground">Starting as a <span className="font-bold text-foreground">{job.title}</span> in <span className="font-bold text-foreground">{city.name}</span></p>
          <p className="text-xs text-muted-foreground">Monthly income: <span className="font-bold text-primary">${monthlySalary.toLocaleString()}</span></p>
        </div>

        <Button onClick={startGame} className="w-full rounded-xl font-bold py-3 text-base">
          Start Your Life Journey →
        </Button>
      </motion.div>
    );
  }

  // ---- GAME OVER ----
  if (phase === "gameover") {
    const grade = getGrade(gameScore);
    const gems = getGemsFromScore(gameScore);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="text-center space-y-3">
          <p className="text-5xl">{gameScore >= 80 ? "🏆" : gameScore >= 50 ? "⭐" : "📊"}</p>
          <p className="text-4xl font-black font-display">{grade}</p>
          <p className="text-2xl font-bold">{gameScore}/100</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200"><p className="text-xs text-emerald-700">Savings</p><p className="font-bold text-emerald-700">${savings.toLocaleString()}</p></div>
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200"><p className="text-xs text-blue-700">Investments</p><p className="font-bold text-blue-700">${investments.toLocaleString()}</p></div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-200"><p className="text-xs text-red-700">Debt</p><p className="font-bold text-red-700">${debt.toLocaleString()}</p></div>
            <div className={cn("rounded-xl p-3 border", netWorth >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20")}>
              <p className="text-xs text-muted-foreground">Net Worth</p>
              <p className={cn("font-bold font-display", netWorth >= 0 ? "text-primary" : "text-destructive")}>${netWorth.toLocaleString()}</p>
            </div>
          </div>

          {personalBest !== null && personalBest !== undefined && gameScore > personalBest && (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-yellow-400 text-yellow-900 rounded-xl p-3 font-extrabold text-sm">
              🎉 NEW PERSONAL BEST!
            </motion.div>
          )}
          {!gemsClaimed ? (
            <Button onClick={async () => { await earnGems(gems * gemsMultiplier); onComplete?.(gameScore); setGemsClaimed(true); toast.success(`+${gems * gemsMultiplier} gems!`); }}
              className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white">
              <Diamond className="w-4 h-4 mr-1" /> Claim {gems * gemsMultiplier} Gems
            </Button>
          ) : <p className="text-cyan-600 font-bold text-sm">✓ Gems claimed!</p>}
          <Button variant="outline" onClick={reset} className="w-full rounded-xl"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
        </div>
      </motion.div>
    );
  }

  // ---- PLAY PHASE ----
  const space = lifeSpaces[spaceIndex];
  const stressColor = stress <= 30 ? "bg-emerald-500" : stress <= 60 ? "bg-amber-500" : "bg-destructive";

  return (
    <div className="space-y-4">
      {/* Status bars */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-card rounded-lg border p-2 text-center">
          <p className="text-[9px] text-muted-foreground">Savings</p>
          <p className="font-bold font-display text-xs text-emerald-600">${savings > 0 ? savings.toLocaleString() : 0}</p>
        </div>
        <div className="bg-card rounded-lg border p-2 text-center">
          <p className="text-[9px] text-muted-foreground">Invested</p>
          <p className="font-bold font-display text-xs text-blue-600">${investments > 0 ? investments.toLocaleString() : 0}</p>
        </div>
        <div className="bg-card rounded-lg border p-2 text-center">
          <p className="text-[9px] text-muted-foreground">Debt</p>
          <p className="font-bold font-display text-xs text-destructive">${debt.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-lg border p-2 text-center">
          <p className="text-[9px] text-muted-foreground">Stress</p>
          <div className="h-1.5 bg-muted rounded-full mt-1"><div className={cn("h-full rounded-full transition-all", stressColor)} style={{ width: `${stress}%` }} /></div>
        </div>
      </div>

      {/* Life path progress */}
      <div className="flex gap-0.5">
        {lifeSpaces.map((s, i) => (
          <div key={i} className={cn("flex-1 h-2 rounded-full", i < spaceIndex ? "bg-primary" : i === spaceIndex ? "bg-primary/50 animate-pulse" : "bg-muted")} />
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground font-medium">Age {space.age} • {job.title} in {city.name}</p>

      {/* Current space */}
      <motion.div key={spaceIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
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
            <p className="text-sm text-muted-foreground">{space.choices[selected].narrative}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {space.choices[selected].savings && (
                <span className={cn("px-2 py-0.5 rounded-full font-bold", space.choices[selected].savings! > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                  {space.choices[selected].savings! > 0 ? "+" : ""}${space.choices[selected].savings!.toLocaleString()} savings
                </span>
              )}
              {space.choices[selected].debt && <span className="px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700">+${space.choices[selected].debt!.toLocaleString()} debt</span>}
              {space.choices[selected].investment && (
                <span className={cn("px-2 py-0.5 rounded-full font-bold", space.choices[selected].investment! > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}>
                  {space.choices[selected].investment! > 0 ? "+" : ""}${space.choices[selected].investment!.toLocaleString()} invested
                </span>
              )}
            </div>
            <Button onClick={nextSpace} className="w-full rounded-xl font-bold mt-2">
              {spaceIndex + 1 >= lifeSpaces.length ? "See Final Results 🏁" : "Continue Life Journey →"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BudgetLifeSim;
