import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, RotateCcw, Briefcase, Diamond } from "lucide-react";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";
import { toast } from "sonner";

const scenarios = [
  { job: "Part-Time Barista", grossMonthly: 1200, state: "California", deductions: [{ name: "Federal Tax (10%)", rate: 0.10 }, { name: "CA State Tax (6%)", rate: 0.06 }, { name: "Social Security (6.2%)", rate: 0.062 }, { name: "Medicare (1.45%)", rate: 0.0145 }], hint: "California has one of the highest state tax rates." },
  { job: "Retail Associate", grossMonthly: 2200, state: "Texas", deductions: [{ name: "Federal Tax (12%)", rate: 0.12 }, { name: "TX State Tax (0%)", rate: 0 }, { name: "Social Security (6.2%)", rate: 0.062 }, { name: "Medicare (1.45%)", rate: 0.0145 }], hint: "Texas has NO state income tax!" },
  { job: "Entry-Level Developer", grossMonthly: 5800, state: "New York", deductions: [{ name: "Federal Tax (22%)", rate: 0.22 }, { name: "NY State Tax (6.85%)", rate: 0.0685 }, { name: "Social Security (6.2%)", rate: 0.062 }, { name: "Medicare (1.45%)", rate: 0.0145 }, { name: "Health Insurance", rate: 0.025 }], hint: "NY taxes hit hard. Health insurance also reduces take-home." },
  { job: "Nurse", grossMonthly: 4800, state: "Florida", deductions: [{ name: "Federal Tax (22%)", rate: 0.22 }, { name: "FL State Tax (0%)", rate: 0 }, { name: "Social Security (6.2%)", rate: 0.062 }, { name: "Medicare (1.45%)", rate: 0.0145 }, { name: "401k Contribution (5%)", rate: 0.05 }], hint: "Florida has no state tax. 401k reduces taxable income." },
  { job: "Freelance Designer", grossMonthly: 3500, state: "Illinois", deductions: [{ name: "Federal Tax (22%)", rate: 0.22 }, { name: "IL State Tax (4.95%)", rate: 0.0495 }, { name: "Self-Employment Tax (15.3%)", rate: 0.153 }], hint: "Freelancers pay BOTH halves of Social Security + Medicare — 15.3% self-employment tax!" },
];

const TIMER_SECONDS = 20;

const PaycheckBreakdown = ({ earnGems }: { earnGems: (n: number) => Promise<void> }) => {
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gemsClaimed, setGemsClaimed] = useState(false);

  const scenario = scenarios[round];
  const totalDeductionRate = scenario.deductions.reduce((s, d) => s + d.rate, 0);
  const actualTakeHome = Math.round(scenario.grossMonthly * (1 - totalDeductionRate));

  useEffect(() => {
    if (!timerActive || submitted) return;
    if (timer === 0) { handleSubmit(true); return; }
    const t = setTimeout(() => setTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, timerActive, submitted]);

  const handleSubmit = (timedOut = false) => {
    setTimerActive(false);
    setSubmitted(true);
    const guessNum = parseInt(guess) || 0;
    const diff = Math.abs(guessNum - actualTakeHome);
    const pctOff = diff / actualTakeHome;
    const accuracyScore = Math.max(0, Math.round((1 - pctOff * 3) * 80));
    const timerBonus = timedOut ? 0 : Math.round((timer / TIMER_SECONDS) * 20);
    setRoundScores(prev => [...prev, Math.min(100, accuracyScore + timerBonus)]);
  };

  const nextRound = () => {
    if (round + 1 >= scenarios.length) setGameOver(true);
    else { setRound(r => r + 1); setGuess(""); setSubmitted(false); setShowHint(false); setTimer(TIMER_SECONDS); setTimerActive(true); }
  };

  const resetGame = () => { setRound(0); setGuess(""); setSubmitted(false); setRoundScores([]); setShowHint(false); setTimer(TIMER_SECONDS); setTimerActive(true); setGameOver(false); setGemsClaimed(false); };

  if (gameOver) {
    const totalScore = Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length);
    const gems = getGemsFromScore(totalScore);
    const grade = getGrade(totalScore);
    const summary = grade === "S" ? "Paycheck genius! You nailed every scenario." : grade === "A" ? "Great work — you really understand how taxes work!" : grade === "B" ? "Solid effort. A bit more tax knowledge will help." : grade === "C" ? "Keep learning — taxes are trickier than they look." : "Tax math is hard. Review the Banking module and try again!";
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex gap-2 flex-wrap justify-center">
          {roundScores.map((s, i) => (
            <span key={i} className={cn("px-3 py-1 rounded-full text-xs font-bold", s >= 80 ? "bg-emerald-100 text-emerald-700" : s >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>R{i+1}: {s}</span>
          ))}
        </div>

        <div className="text-center space-y-3">
          <p className="text-5xl font-black font-display">{grade}</p>
          <p className="text-2xl font-bold">{totalScore}/100</p>
          <p className="text-sm text-muted-foreground">{summary}</p>
          {!gemsClaimed ? (
            <Button onClick={async () => { await earnGems(gems); setGemsClaimed(true); toast.success(`+${gems} gems earned!`); }} className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white mb-3">
              <Diamond className="w-4 h-4 mr-1" /> Claim {gems} Gems
            </Button>
          ) : <p className="text-sm font-bold text-cyan-600">✓ +{gems} gems claimed!</p>}
          <Button variant="outline" onClick={resetGame} className="w-full rounded-xl font-bold"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
        </div>
      </motion.div>
    );
  }

  const guessNum = parseInt(guess) || 0;
  const diff = submitted ? Math.abs(guessNum - actualTakeHome) : 0;
  const accuracy = submitted ? Math.max(0, Math.round((1 - (diff / actualTakeHome) * 3) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {scenarios.map((_, i) => (
            <div key={i} className={cn("w-8 h-2 rounded-full transition-all", i < round ? "bg-primary" : i === round ? "bg-primary/50" : "bg-muted")} />
          ))}
        </div>

        <div className={cn("flex items-center gap-1 font-mono font-bold text-sm px-3 py-1 rounded-full", timer <= 5 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-muted-foreground")}>
          <Clock className="w-3.5 h-3.5" /> {timer}s
        </div>
      </div>

      <div className="glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-primary" />
          <div>
            <p className="font-bold font-display text-lg">{scenario.job}</p>
            <p className="text-xs text-muted-foreground">{scenario.state} • Round {round + 1}/5</p>
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Gross Monthly Pay:</span>
          <span className="text-2xl font-black font-display">${scenario.grossMonthly.toLocaleString()}</span>
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          {scenario.deductions.filter(d => d.rate > 0).map(d => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-medium text-destructive">-${Math.round(scenario.grossMonthly * d.rate).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {!submitted && <button onClick={() => setShowHint(v => !v)} className="mt-3 text-xs text-primary font-bold hover:underline">{showHint ? "Hide hint ↑" : "💡 Need a hint?"}</button>}
        {showHint && !submitted && <p className="text-xs text-muted-foreground italic bg-muted/50 rounded-lg p-2">{scenario.hint}</p>}
      </div>

      {!submitted ? (
        <div className="space-y-3">
          <p className="text-sm font-bold">What is the monthly take-home pay?</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input type="number" value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && guess && handleSubmit()} className="pl-7 h-12 text-lg font-bold" autoFocus />
            </div>
            <Button onClick={() => handleSubmit()} disabled={!guess} className="h-12 px-6 rounded-xl font-bold">Submit</Button>
          </div>
          <Progress value={(timer / TIMER_SECONDS) * 100} className="h-1.5" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("rounded-xl p-5 text-center border-2 space-y-2", accuracy >= 80 ? "bg-emerald-50 border-emerald-300" : accuracy >= 50 ? "bg-amber-50 border-amber-300" : "bg-red-50 border-red-300")}>
          <p className="text-3xl">{accuracy >= 80 ? "🎯" : accuracy >= 50 ? "📊" : "💸"}</p>
          <p className="font-bold font-display text-lg">{accuracy >= 80 ? "Spot on!" : accuracy >= 50 ? "Close enough!" : "Way off!"}</p>
          <p className="text-sm text-muted-foreground">Your guess: <span className="font-bold text-foreground">${guessNum.toLocaleString()}</span></p>
          <p className="text-sm text-muted-foreground">Actual take-home: <span className="font-bold text-foreground">${actualTakeHome.toLocaleString()}</span></p>
          <p className="text-xs text-muted-foreground">That's {Math.round((1 - actualTakeHome / scenario.grossMonthly) * 100)}% lost to deductions every month.</p>
          <p className="text-sm font-bold">Round score: {roundScores[roundScores.length - 1]}/100</p>
          <Button onClick={nextRound} className="w-full rounded-xl font-bold mt-2">{round + 1 >= scenarios.length ? "See Results 🏁" : "Next Scenario →"}</Button>
        </motion.div>
      )}
    </div>
  );
};

export default PaycheckBreakdown;
