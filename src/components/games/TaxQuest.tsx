import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Diamond, RotateCcw, Scroll, Shield, Gem } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

interface QuestSpace {
  location: string; emoji: string; description: string;
  choices: { label: string; taxReduction: number; narrative: string; type: "deduction" | "credit" | "mistake"; }[];
}

const questSpaces: QuestSpace[] = [
  { location: "Work Castle", emoji: "🏰", description: "You arrive at your employer's fortress. Your W-2 scroll awaits.",
    choices: [
      { label: "Collect W-2 and review it carefully", taxReduction: 0, narrative: "Your W-2 shows $52,000 in wages. You notice $8,200 already withheld. Always verify your W-2 matches your records!", type: "deduction" },
      { label: "Ignore the details — just file", taxReduction: -200, narrative: "You missed a $1,000 error in reported income. That's $200 extra in taxes you didn't owe!", type: "mistake" },
      { label: "Ask HR about missing deductions", taxReduction: 150, narrative: "Good catch! HR confirms your commuter benefits weren't applied. You save $150 in taxes.", type: "deduction" },
    ]},
  { location: "Education Dungeon", emoji: "🎓", description: "Deep in the Education Dungeon, student loan interest forms glow on ancient shelves.",
    choices: [
      { label: "Claim student loan interest deduction", taxReduction: 500, narrative: "You paid $2,500 in student loan interest. That's up to $500 in tax savings! This deduction has a $2,500 cap.", type: "deduction" },
      { label: "Skip it — seems complicated", taxReduction: 0, narrative: "You left $500 on the table! Student loan interest is one of the easiest deductions to claim.", type: "mistake" },
      { label: "Also check for education credits", taxReduction: 1000, narrative: "The Lifetime Learning Credit gives you up to $2,000! Credits reduce tax dollar-for-dollar — way better than deductions.", type: "credit" },
    ]},
  { location: "Charity Village", emoji: "🏘️", description: "The generous villagers of Charity remind you of your donations this year.",
    choices: [
      { label: "Gather all donation receipts", taxReduction: 400, narrative: "You donated $2,000 to qualified charities. At 22% bracket, that's $440 in tax savings. Always keep receipts!", type: "deduction" },
      { label: "Estimate donations — close enough", taxReduction: 100, narrative: "Without records, you can only claim $500 safely. Keep digital receipts for every donation!", type: "deduction" },
      { label: "Donate appreciated stock instead", taxReduction: 800, narrative: "Genius move! Donating stock avoids capital gains tax AND gives you the full deduction. Double savings!", type: "deduction" },
    ]},
  { location: "Marketplace of Choices", emoji: "⚔️", description: "Two powerful tax weapons appear before you. Choose wisely.",
    choices: [
      { label: "Deduction Shield — reduce taxable income", taxReduction: 600, narrative: "The Standard Deduction reduces your taxable income by $13,850. At 22%, that saves you $3,047.", type: "deduction" },
      { label: "Credit Gem — reduce tax directly", taxReduction: 1000, narrative: "Tax credits are more powerful! A $1,000 credit saves exactly $1,000 regardless of bracket. Credits > Deductions.", type: "credit" },
      { label: "Take both — I deserve it all", taxReduction: -500, narrative: "You can't always stack them! The IRS flagged your return. Audit risk increased. Know the rules before claiming.", type: "mistake" },
    ]},
  { location: "Tax Bracket Mountain", emoji: "🗻", description: "The Tax Kingdom's mountain reveals how your income is taxed in layers.",
    choices: [
      { label: "Understand marginal rates — optimize", taxReduction: 400, narrative: "First $11k: 0% tax, next $33k: 12%, remaining: 22%. Your effective rate is only 14% — way less than your bracket!", type: "deduction" },
      { label: "Assume all income taxed at 22%", taxReduction: 0, narrative: "Common mistake! You're not paying 22% on everything. Only income above $44,725 is at 22%. Understanding this saves stress.", type: "mistake" },
      { label: "Contribute to 401k to lower bracket", taxReduction: 800, narrative: "Brilliant! $5,000 to 401k reduces taxable income. At 22% bracket, that's $1,100 in tax savings PLUS retirement growth.", type: "deduction" },
    ]},
  { location: "Freelance Tower", emoji: "🗼", description: "You did some freelance work. 1099 income has different rules.",
    choices: [
      { label: "Report all income, claim business expenses", taxReduction: 600, narrative: "You earned $5,000 freelancing and had $2,000 in expenses. You only owe tax on $3,000 net profit. Home office deduction included!", type: "deduction" },
      { label: "Hope they don't notice the 1099", taxReduction: -1000, narrative: "The IRS receives a copy of every 1099. They WILL notice. Now you owe taxes plus penalties plus interest. Never hide income.", type: "mistake" },
      { label: "Set aside estimated taxes quarterly", taxReduction: 300, narrative: "Smart planning! Quarterly estimates avoid the underpayment penalty. Freelancers who don't face a surprise bill every April.", type: "deduction" },
    ]},
  { location: "Healthcare Haven", emoji: "🏥", description: "Medical expenses from this year could be tax-deductible.",
    choices: [
      { label: "HSA contribution — triple tax advantage", taxReduction: 800, narrative: "HSA is the only triple-tax-advantaged account: tax-free in, tax-free growth, tax-free out for medical expenses. Max it!", type: "deduction" },
      { label: "Claim medical expenses over 7.5% of AGI", taxReduction: 300, narrative: "Your medical bills exceeded the threshold. Every dollar above 7.5% of income is deductible. Save all medical receipts.", type: "deduction" },
      { label: "Skip it — I'm healthy", taxReduction: 0, narrative: "Even healthy people can benefit from HSA contributions. It's a retirement account in disguise after age 65.", type: "mistake" },
    ]},
  { location: "Treasury Castle", emoji: "👑", description: "Final stop. The Tax King reviews your return and calculates your refund.",
    choices: [
      { label: "File early and direct deposit", taxReduction: 200, narrative: "Filing early means refund arrives in 10-14 days. Direct deposit is fastest. You get your money back sooner to invest!", type: "credit" },
      { label: "Wait until April 15th deadline", taxReduction: 0, narrative: "No penalty for filing on time, but you gave the government a free loan of your refund for months. Time value of money!", type: "deduction" },
      { label: "Adjust withholding for next year", taxReduction: 300, narrative: "If your refund is large, you're overwithholding. Adjust W-4 to get more in each paycheck and invest the difference all year.", type: "deduction" },
    ]},
];

const TaxQuest = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [spaceIdx, setSpaceIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [totalSavings, setTotalSavings] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [credits, setCredits] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gemsClaimed, setGemsClaimed] = useState(false);
  const [history, setHistory] = useState<{ location: string; savings: number }[]>([]);

  const space = questSpaces[spaceIdx];

  const handleChoice = (choiceIdx: number) => {
    if (selected !== null) return;
    setSelected(choiceIdx);
    const choice = space.choices[choiceIdx];
    setTotalSavings(s => s + choice.taxReduction);
    if (choice.type === "credit") setCredits(c => c + 1);
    else if (choice.type === "deduction") setDeductions(d => d + 1);
    else setMistakes(m => m + 1);
    setHistory(prev => [...prev, { location: space.location, savings: choice.taxReduction }]);
  };

  const nextSpace = () => {
    if (spaceIdx + 1 >= questSpaces.length) {
      setGameOver(true);
    } else {
      setSpaceIdx(s => s + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setSpaceIdx(0); setSelected(null); setTotalSavings(0);
    setMistakes(0); setCredits(0); setDeductions(0);
    setGameOver(false); setGemsClaimed(false); setHistory([]);
  };

  const gameScore = Math.round(Math.max(0, Math.min(100, 50 + (totalSavings / 50) - mistakes * 15 + credits * 5)));

  if (gameOver) {
    const grade = getGrade(gameScore);
    const gems = getGemsFromScore(gameScore);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
        <p className="text-5xl">👑</p>
        <p className="text-4xl font-black font-display">{grade}</p>
        <p className="text-2xl font-bold">{gameScore}/100</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200"><p className="text-xs text-emerald-700">Tax Savings</p><p className="font-bold text-emerald-700">${totalSavings.toLocaleString()}</p></div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200"><p className="text-xs text-blue-700">Credits Used</p><p className="font-bold text-blue-700">{credits}</p></div>
          <div className="bg-red-50 rounded-xl p-3 border border-red-200"><p className="text-xs text-red-700">Mistakes</p><p className="font-bold text-red-700">{mistakes}</p></div>
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

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex gap-1">
        {questSpaces.map((_, i) => (
          <div key={i} className={cn("flex-1 h-2 rounded-full", i < spaceIdx ? "bg-primary" : i === spaceIdx ? "bg-primary/50 animate-pulse" : "bg-muted")} />
        ))}
      </div>

      {/* Status */}
      <div className="flex gap-2 text-xs justify-center">
        <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg font-bold">💰 ${totalSavings > 0 ? "+" : ""}${totalSavings}</span>
        <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-lg font-bold">💎 {credits} credits</span>
        <span className="bg-muted text-muted-foreground px-2 py-1 rounded-lg font-bold">🛡️ {deductions} deductions</span>
      </div>

      {/* Location card */}
      <motion.div key={spaceIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
        <div className="bg-card rounded-2xl border-2 p-5 text-center">
          <p className="text-4xl mb-2">{space.emoji}</p>
          <h3 className="font-display font-extrabold text-lg">{space.location}</h3>
          <p className="text-sm text-muted-foreground mt-1">{space.description}</p>
        </div>

        <div className="space-y-2">
          {space.choices.map((choice, i) => (
            <button key={i} onClick={() => handleChoice(i)}
              className={cn(
                "w-full text-left rounded-xl border-2 p-3.5 text-sm font-medium transition-all",
                selected === null && "border-border hover:border-primary/30 bg-card",
                selected === i && choice.type !== "mistake" && "border-emerald-400 bg-emerald-50",
                selected === i && choice.type === "mistake" && "border-red-400 bg-red-50",
                selected !== null && selected !== i && "opacity-40"
              )}>
              <div className="flex items-center gap-2">
                {choice.type === "credit" && <Gem className="w-4 h-4 text-blue-500 shrink-0" />}
                {choice.type === "deduction" && <Shield className="w-4 h-4 text-emerald-500 shrink-0" />}
                {choice.type === "mistake" && <span className="text-red-500 shrink-0">⚠️</span>}
                <span>{choice.label}</span>
              </div>
            </button>
          ))}
        </div>

        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-xl p-4 border text-center space-y-2",
              space.choices[selected].taxReduction > 0 ? "bg-emerald-50 border-emerald-200" :
              space.choices[selected].taxReduction < 0 ? "bg-red-50 border-red-200" : "bg-muted/50 border-border")}>
            <p className={cn("font-bold font-display",
              space.choices[selected].taxReduction > 0 ? "text-emerald-700" : space.choices[selected].taxReduction < 0 ? "text-destructive" : "text-muted-foreground")}>
              {space.choices[selected].taxReduction > 0 ? "+" : ""}${space.choices[selected].taxReduction} tax savings
            </p>
            <p className="text-sm text-muted-foreground">{space.choices[selected].narrative}</p>
            <Button onClick={nextSpace} className="rounded-xl font-bold mt-2">
              {spaceIdx + 1 >= questSpaces.length ? "Meet the Tax King 👑" : "Continue Quest →"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TaxQuest;
