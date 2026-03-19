import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Diamond, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

interface Choice { label: string; scoreImpact: number; debtImpact?: number; cashImpact?: number; narrative: string; }
interface MonthEvent { month: number; title: string; description: string; choices: Choice[]; }

const monthEvents: MonthEvent[] = [
  { month: 1, title: "January: First Credit Card", description: "You're approved for your first credit card. Which do you choose?", choices: [
    { label: "Secured card — $200 limit, 18% APR", scoreImpact: 5, cashImpact: -200, narrative: "Smart start! Low limit keeps spending in check. Deposit builds discipline." },
    { label: "Student card — $500 limit, 22% APR", scoreImpact: 3, narrative: "Decent choice. Higher limit means more temptation but more flexibility." },
    { label: "Store card — $1000 limit, 28% APR", scoreImpact: -2, narrative: "Risky. Store cards have the highest APRs. That 28% rate will hurt if you carry a balance." },
  ]},
  { month: 2, title: "February: Shopping Spree Temptation", description: "Big sale! Your friends are buying new clothes. You have $340 on your card.", choices: [
    { label: "Skip the sale — you don't need anything", scoreImpact: 8, narrative: "Self-control! Your utilization stays low and your future self thanks you." },
    { label: "Buy one thing for $60", scoreImpact: 3, cashImpact: -60, narrative: "Moderate spending. You enjoyed a small treat without going overboard." },
    { label: "Go all in — $400 shopping spree", scoreImpact: -10, debtImpact: 400, narrative: "Your card is almost maxed. High utilization tanks your score. The clothes won't feel worth it in 2 months." },
  ]},
  { month: 3, title: "March: First Bill Arrives", description: "Your credit card bill is $340. How do you pay?", choices: [
    { label: "Pay full balance — $340", scoreImpact: 22, cashImpact: -340, narrative: "Perfect! No interest charged. Payment history: excellent. This is how you build credit." },
    { label: "Pay half — $170", scoreImpact: 8, cashImpact: -170, debtImpact: 170, narrative: "OK, but you'll pay interest on the remaining $170. At 22% APR that's $3.12 this month." },
    { label: "Pay minimum — $25", scoreImpact: -5, cashImpact: -25, debtImpact: 315, narrative: "Danger! At minimum payments, this $340 takes 18 months to pay off and costs $89 in interest." },
  ]},
  { month: 4, title: "April: Unexpected Car Repair", description: "Your car needs a $800 repair. You need it to get to work.", choices: [
    { label: "Use emergency savings", scoreImpact: 5, cashImpact: -800, narrative: "Your emergency fund saved you. No debt, no stress. This is exactly what it's for." },
    { label: "Put it on credit card", scoreImpact: -12, debtImpact: 800, narrative: "Your utilization just spiked. At 22% APR, this $800 becomes $976 if it takes a year to pay." },
    { label: "Take a payday loan", scoreImpact: -20, debtImpact: 1160, narrative: "Payday loans charge 400%+ APR. That $800 becomes $1,160 in just 2 weeks. Devastating." },
  ]},
  { month: 5, title: "May: Credit Limit Increase Offer", description: "Your bank offers to triple your credit limit. Accept?", choices: [
    { label: "Accept — more limit, lower utilization", scoreImpact: 12, narrative: "Smart! Higher limit with same spending = lower utilization ratio. Score jumps up." },
    { label: "Decline — worried about temptation", scoreImpact: 0, narrative: "Conservative choice. Your utilization stays the same. No harm, but missed opportunity." },
    { label: "Accept and spend more to match", scoreImpact: -15, debtImpact: 500, narrative: "This is exactly the trap. More credit doesn't mean more money. Your debt just grew." },
  ]},
  { month: 6, title: "June: Side Hustle Income", description: "You earned $600 extra from freelancing this month. What do you do?", choices: [
    { label: "Pay off all credit card debt", scoreImpact: 18, cashImpact: -600, narrative: "Debt-free! Your utilization drops to 0%. Score improvement is dramatic." },
    { label: "Half to debt, half to savings", scoreImpact: 10, cashImpact: -300, narrative: "Balanced approach. Reduced debt AND built emergency cushion. Solid financial thinking." },
    { label: "Treat yourself — you earned it", scoreImpact: -3, cashImpact: -600, narrative: "The dopamine fades fast. Your debt is still there. Your future self is disappointed." },
  ]},
  { month: 7, title: "July: Laptop for School — $1,200", description: "You need a laptop. A store offers 0% interest for 12 months.", choices: [
    { label: "Save 3 months and buy with cash", scoreImpact: 8, narrative: "Patient and disciplined. No debt created. Your score stays clean." },
    { label: "Take 0% financing — pay monthly", scoreImpact: 2, debtImpact: 1200, narrative: "Careful! The fine print says if NOT paid in full by month 12, ALL back interest (26%) is charged. That's $312 surprise." },
    { label: "Put it all on credit card", scoreImpact: -14, debtImpact: 1200, narrative: "At 22% APR, this $1,200 laptop costs $1,464 over a year. That's a $264 premium for impatience." },
  ]},
  { month: 8, title: "August: Credit Report Check", description: "You check your credit report and find an error — an account marked late that was paid on time.", choices: [
    { label: "File a dispute with the bureau", scoreImpact: 20, narrative: "Correct! The error is removed after 30 days. Your score jumps. Always check your report!" },
    { label: "Ignore it — probably doesn't matter", scoreImpact: -8, narrative: "It DOES matter. That false late payment is dragging your score down by 50+ points. Always dispute errors." },
    { label: "Panic and close the account", scoreImpact: -15, narrative: "Closing the account made it worse. You lost credit history length AND still have the error." },
  ]},
  { month: 9, title: "September: Friend Asks to Co-sign", description: "Your friend with bad credit needs you to co-sign a $3,000 loan.", choices: [
    { label: "Decline — too risky for your credit", scoreImpact: 5, narrative: "Smart boundary. If they default, YOUR credit gets destroyed. 73% of co-signers end up paying." },
    { label: "Co-sign — they promise to pay", scoreImpact: -25, debtImpact: 3000, narrative: "They miss payments in month 11. The lender comes after YOU. Your score drops 80 points." },
    { label: "Offer to help them find alternatives", scoreImpact: 3, narrative: "You help them find a secured card instead. Friendship preserved, your credit protected." },
  ]},
  { month: 10, title: "October: Reward Points Offer", description: "A premium card offers 50,000 bonus points ($500 value) with a $95 annual fee.", choices: [
    { label: "Apply — the bonus is worth it", scoreImpact: -5, cashImpact: -95, narrative: "Hard inquiry hits your score temporarily. But the $500 in points minus $95 fee = $405 net value. Worth it if you pay in full." },
    { label: "Skip — not worth the hard inquiry", scoreImpact: 2, narrative: "Conservative. You avoided the inquiry but missed $405 in net value. Sometimes caution costs money." },
    { label: "Apply for 3 cards to maximize points", scoreImpact: -18, narrative: "3 hard inquiries in one day! Each one drops your score. Looks desperate to lenders. Bad strategy." },
  ]},
  { month: 11, title: "November: Holiday Spending Pressure", description: "Holiday season. Social pressure to buy expensive gifts. Budget is tight.", choices: [
    { label: "Set a $200 gift budget and stick to it", scoreImpact: 8, cashImpact: -200, narrative: "Thoughtful gifts don't need to be expensive. Your budget stays healthy, credit stays clean." },
    { label: "Charge $800 in gifts — worry later", scoreImpact: -12, debtImpact: 800, narrative: "January regret is real. That $800 at 22% APR becomes $976 if paid over a year. Holiday debt trap." },
    { label: "Make handmade gifts instead", scoreImpact: 10, narrative: "Creative and financially savvy! No debt, genuine thoughtfulness. People love handmade gifts." },
  ]},
  { month: 12, title: "December: Year-End Financial Review", description: "Time to look at your financial health and set goals for next year.", choices: [
    { label: "Set up autopay for all bills", scoreImpact: 15, narrative: "Autopay eliminates the risk of missed payments. This alone will keep your score climbing year after year." },
    { label: "Consolidate debt with a personal loan", scoreImpact: 5, narrative: "Lower interest rate than credit cards. One payment instead of many. Smart debt management." },
    { label: "Close unused cards to simplify", scoreImpact: -10, narrative: "Closing old cards reduces your total credit limit and shortens credit history. Both hurt your score." },
  ]},
];

const STARTING_SCORE = 580;

const CreditLifeSim = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [monthIndex, setMonthIndex] = useState(0);
  const [score, setScore] = useState(STARTING_SCORE);
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<{ month: number; choice: string; impact: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gemsClaimed, setGemsClaimed] = useState(false);
  const [debt, setDebt] = useState(0);

  const event = monthEvents[monthIndex];

  const handleChoice = (choiceIdx: number) => {
    if (selected !== null) return;
    setSelected(choiceIdx);
    const choice = event.choices[choiceIdx];
    const newScore = Math.max(300, Math.min(850, score + choice.scoreImpact));
    setScore(newScore);
    if (choice.debtImpact) setDebt(d => d + choice.debtImpact!);
    setHistory(prev => [...prev, { month: event.month, choice: choice.label, impact: choice.scoreImpact }]);
  };

  const nextMonth = () => {
    if (monthIndex + 1 >= monthEvents.length) {
      setGameOver(true);
    } else {
      setMonthIndex(m => m + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setMonthIndex(0); setScore(STARTING_SCORE); setSelected(null);
    setHistory([]); setGameOver(false); setGemsClaimed(false); setDebt(0);
  };

  const scorePct = ((score - 300) / 550) * 100;
  const scoreLabel = score >= 750 ? "Excellent" : score >= 700 ? "Good" : score >= 650 ? "Fair" : score >= 580 ? "Below Average" : "Poor";
  const scoreColor = score >= 750 ? "text-emerald-600" : score >= 700 ? "text-primary" : score >= 650 ? "text-amber-600" : "text-destructive";

  // Convert credit score to game score (0-100)
  const gameScore = Math.round(Math.max(0, Math.min(100, ((score - 580) / (780 - 580)) * 100)));

  if (gameOver) {
    const grade = getGrade(gameScore);
    const gems = getGemsFromScore(gameScore);
    const meaning = score >= 750 ? "Mortgage rate: 6.2% — you save $87,000 over 30 years!" :
      score >= 700 ? "Car loan approved at 7.1% — solid rate!" :
      score >= 650 ? "Credit card approved, but at higher APR." :
      "Apartment application denied. Extra deposit required.";
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="text-center space-y-3">
          <p className="text-5xl">{score >= 750 ? "🏆" : score >= 700 ? "⭐" : score >= 650 ? "📊" : "⚠️"}</p>
          <p className={cn("text-5xl font-black font-display", scoreColor)}>{score}</p>
          <p className={cn("font-bold", scoreColor)}>{scoreLabel}</p>
          <p className="text-sm text-muted-foreground">{meaning}</p>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Game Score</p>
            <p className="text-3xl font-black font-display">{grade}</p>
            <p className="font-bold">{gameScore}/100</p>
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

  return (
    <div className="space-y-4">
      {/* Credit Score Meter */}
      <div className="bg-card rounded-xl border border-border p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">Your Credit Score</p>
        <p className={cn("text-4xl font-black font-display", scoreColor)}>{score}</p>
        <p className={cn("text-sm font-medium", scoreColor)}>{scoreLabel}</p>
        <div className="mt-3 h-3 bg-secondary rounded-full overflow-hidden relative">
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-destructive/40" />
            <div className="flex-1 bg-amber-400/40" />
            <div className="flex-1 bg-emerald-400/40" />
          </div>
          <motion.div animate={{ left: `${scorePct}%` }} className="absolute top-0 bottom-0 w-1.5 bg-foreground rounded-full shadow-lg" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>300</span><span>580</span><span>670</span><span>750</span><span>850</span>
        </div>
        {debt > 0 && <p className="text-xs text-destructive font-bold mt-2">Outstanding debt: ${debt.toLocaleString()}</p>}
      </div>

      {/* Month progress */}
      <div className="flex gap-1">
        {monthEvents.map((_, i) => (
          <div key={i} className={cn("flex-1 h-2 rounded-full", i < monthIndex ? "bg-primary" : i === monthIndex ? "bg-primary/50 animate-pulse" : "bg-muted")} />
        ))}
      </div>

      {/* Current Event */}
      <motion.div key={monthIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
        <h3 className="font-display font-extrabold text-lg">{event.title}</h3>
        <p className="text-sm text-muted-foreground">{event.description}</p>

        <div className="space-y-2">
          {event.choices.map((choice, i) => (
            <button key={i} onClick={() => handleChoice(i)}
              className={cn(
                "w-full text-left rounded-xl border-2 p-3.5 text-sm font-medium transition-all",
                selected === null && "border-border hover:border-primary/30 bg-card",
                selected === i && choice.scoreImpact > 0 && "border-emerald-400 bg-emerald-50",
                selected === i && choice.scoreImpact <= 0 && "border-red-400 bg-red-50",
                selected !== null && selected !== i && "opacity-40"
              )}>
              {choice.label}
            </button>
          ))}
        </div>

        {/* Result */}
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-xl p-4 border text-center space-y-2",
              event.choices[selected].scoreImpact > 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
            <p className={cn("font-bold font-display", event.choices[selected].scoreImpact > 0 ? "text-emerald-700" : "text-destructive")}>
              {event.choices[selected].scoreImpact > 0 ? "+" : ""}{event.choices[selected].scoreImpact} points
            </p>
            <p className="text-sm text-muted-foreground">{event.choices[selected].narrative}</p>
            <Button onClick={nextMonth} className="rounded-xl font-bold mt-2">
              {monthIndex + 1 >= monthEvents.length ? "See Final Score 🏁" : "Next Month →"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CreditLifeSim;
