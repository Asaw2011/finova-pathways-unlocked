import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Diamond, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";
import { getGrade, getGemsFromScore } from "@/pages/GamesZone";

interface PaycheckScenario {
  job: string; state: string; grossMonthly: number; icon: string;
  deductions: { name: string; amount: number }[];
  bills: { name: string; amount: number; required: boolean }[];
  wants: { name: string; cost: number; satisfaction: number; desc: string }[];
}

const scenarios: PaycheckScenario[] = [
  { job: "Part-Time Barista", state: "California", grossMonthly: 2400, icon: "☕",
    deductions: [{ name: "Federal Tax (10%)", amount: 240 }, { name: "CA State Tax (6%)", amount: 144 }, { name: "Social Security", amount: 149 }, { name: "Medicare", amount: 35 }],
    bills: [{ name: "Shared Rent", amount: 700, required: true }, { name: "Utilities Share", amount: 60, required: true }, { name: "Groceries", amount: 200, required: true }, { name: "Phone", amount: 40, required: true }, { name: "Bus Pass", amount: 50, required: false }],
    wants: [{ name: "Concert Tickets", cost: 80, satisfaction: 7, desc: "Great memories with friends" }, { name: "New Headphones", cost: 120, satisfaction: 4, desc: "One-time purchase, joy fades fast" }, { name: "Streaming Bundle", cost: 25, satisfaction: 6, desc: "Daily entertainment value" }, { name: "Gym Membership", cost: 30, satisfaction: 8, desc: "Health is wealth" }]
  },
  { job: "Entry-Level Developer", state: "Texas", grossMonthly: 5800, icon: "💻",
    deductions: [{ name: "Federal Tax (22%)", amount: 1276 }, { name: "TX State Tax", amount: 0 }, { name: "Social Security", amount: 360 }, { name: "Medicare", amount: 84 }, { name: "401k (6%)", amount: 348 }, { name: "Health Insurance", amount: 180 }],
    bills: [{ name: "Apartment Rent", amount: 1400, required: true }, { name: "Utilities", amount: 120, required: true }, { name: "Groceries", amount: 350, required: true }, { name: "Car Payment", amount: 300, required: true }, { name: "Car Insurance", amount: 90, required: true }, { name: "Phone", amount: 70, required: true }, { name: "Student Loan", amount: 250, required: false }],
    wants: [{ name: "Dining Out (4x)", cost: 200, satisfaction: 6, desc: "Social life boost" }, { name: "Gaming Subscription", cost: 15, satisfaction: 7, desc: "Cheap daily entertainment" }, { name: "Weekend Trip", cost: 300, satisfaction: 5, desc: "Big spend, brief happiness" }, { name: "Online Course", cost: 50, satisfaction: 9, desc: "Invest in your career" }]
  },
  { job: "Nurse", state: "New York", grossMonthly: 5200, icon: "🏥",
    deductions: [{ name: "Federal Tax (22%)", amount: 1144 }, { name: "NY State Tax (6.85%)", amount: 356 }, { name: "Social Security", amount: 322 }, { name: "Medicare", amount: 75 }, { name: "Health Insurance", amount: 150 }],
    bills: [{ name: "Apartment", amount: 1600, required: true }, { name: "Utilities", amount: 130, required: true }, { name: "Groceries", amount: 320, required: true }, { name: "Metro Card", amount: 127, required: true }, { name: "Phone", amount: 60, required: true }, { name: "Renter's Insurance", amount: 25, required: false }],
    wants: [{ name: "Spa Day", cost: 150, satisfaction: 5, desc: "You work hard, you deserve it" }, { name: "Gym + Yoga", cost: 80, satisfaction: 8, desc: "Stress relief + fitness" }, { name: "New Scrubs", cost: 100, satisfaction: 3, desc: "Do you really need new ones?" }, { name: "Savings Challenge", cost: 200, satisfaction: 9, desc: "Future you thanks present you" }]
  },
];

const TIMER_SECONDS = 90;

const PaycheckLifeSim = ({ earnGems, onComplete, personalBest, gemsMultiplier = 1 }: {
  earnGems: (n: number) => Promise<void>; onComplete?: (score: number) => void; personalBest?: number | null; gemsMultiplier?: number;
}) => {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<"paycheck" | "budget" | "wants" | "result" | "gameover">("paycheck");
  const [deductionIdx, setDeductionIdx] = useState(0);
  const [netPay, setNetPay] = useState(0);
  const [selectedBills, setSelectedBills] = useState<Set<number>>(new Set());
  const [selectedWant, setSelectedWant] = useState<number | null>(null);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [gemsClaimed, setGemsClaimed] = useState(false);

  const scenario = scenarios[scenarioIdx];

  // Animate deductions one by one
  useEffect(() => {
    if (phase !== "paycheck") return;
    if (deductionIdx >= scenario.deductions.length) {
      setTimeout(() => {
        const net = scenario.grossMonthly - scenario.deductions.reduce((s, d) => s + d.amount, 0);
        setNetPay(net);
        // Auto-select required bills
        const required = new Set<number>();
        scenario.bills.forEach((b, i) => { if (b.required) required.add(i); });
        setSelectedBills(required);
        setPhase("budget");
      }, 800);
      return;
    }
    const t = setTimeout(() => setDeductionIdx(i => i + 1), 600);
    return () => clearTimeout(t);
  }, [phase, deductionIdx, scenario]);

  // Timer for budget phase
  useEffect(() => {
    if (phase !== "budget" && phase !== "wants") return;
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase]);

  const totalBills = scenario.bills.reduce((s, b, i) => s + (selectedBills.has(i) ? b.amount : 0), 0);
  const wantCost = selectedWant !== null ? scenario.wants[selectedWant].cost : 0;
  const remaining = netPay - totalBills - wantCost;

  const toggleBill = (i: number) => {
    if (scenario.bills[i].required) return;
    setSelectedBills(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const submitBudget = () => setPhase("wants");

  const submitWant = () => {
    // Score: how much saved + smart want choice
    const savingsPct = remaining / netPay;
    const wantSatisfaction = selectedWant !== null ? scenario.wants[selectedWant].satisfaction : 5;
    const score = Math.round(Math.min(100, savingsPct * 200 + wantSatisfaction * 3));
    setRoundScores(prev => [...prev, Math.max(0, Math.min(100, score))]);
    setPhase("result");
  };

  const nextScenario = () => {
    if (scenarioIdx + 1 >= scenarios.length) {
      setPhase("gameover");
    } else {
      setScenarioIdx(s => s + 1);
      setPhase("paycheck");
      setDeductionIdx(0);
      setNetPay(0);
      setSelectedWant(null);
      setTimer(TIMER_SECONDS);
    }
  };

  const reset = () => {
    setScenarioIdx(0); setPhase("paycheck"); setDeductionIdx(0);
    setNetPay(0); setSelectedBills(new Set()); setSelectedWant(null);
    setTimer(TIMER_SECONDS); setRoundScores([]); setGemsClaimed(false);
  };

  const totalScore = roundScores.length > 0 ? Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length) : 0;

  if (phase === "gameover") {
    const grade = getGrade(totalScore);
    const gems = getGemsFromScore(totalScore);
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
        <p className="text-5xl">💵</p>
        <p className="text-4xl font-black font-display">{grade}</p>
        <p className="text-2xl font-bold">{totalScore}/100</p>
        <div className="flex gap-2 justify-center">
          {roundScores.map((s, i) => (
            <span key={i} className={cn("px-3 py-1 rounded-full text-xs font-bold", s >= 80 ? "bg-emerald-100 text-emerald-700" : s >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>R{i+1}: {s}</span>
          ))}
        </div>
        {personalBest !== null && personalBest !== undefined && totalScore > personalBest && (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-yellow-400 text-yellow-900 rounded-xl p-3 font-extrabold text-sm">🎉 NEW PERSONAL BEST!</motion.div>
        )}
        {!gemsClaimed ? (
          <Button onClick={async () => { await earnGems(gems * gemsMultiplier); onComplete?.(totalScore); setGemsClaimed(true); toast.success(`+${gems * gemsMultiplier} gems!`); }}
            className="w-full rounded-xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white"><Diamond className="w-4 h-4 mr-1" /> Claim {gems * gemsMultiplier} Gems</Button>
        ) : <p className="text-cyan-600 font-bold text-sm">✓ Gems claimed!</p>}
        <Button variant="outline" onClick={reset} className="w-full rounded-xl"><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
      </motion.div>
    );
  }

  // PAYCHECK REVEAL
  if (phase === "paycheck") {
    const runningTotal = scenario.grossMonthly - scenario.deductions.slice(0, deductionIdx).reduce((s, d) => s + d.amount, 0);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex gap-1 mb-2">
          {scenarios.map((_, i) => <div key={i} className={cn("flex-1 h-2 rounded-full", i < scenarioIdx ? "bg-primary" : i === scenarioIdx ? "bg-primary/50" : "bg-muted")} />)}
        </div>
        <div className="bg-card rounded-2xl border-2 border-border p-5 space-y-3">
          <div className="text-center">
            <p className="text-3xl">{scenario.icon}</p>
            <p className="font-display font-extrabold text-lg">{scenario.job}</p>
            <p className="text-xs text-muted-foreground">{scenario.state}</p>
          </div>
          <div className="flex justify-between items-center border-b border-border pb-2">
            <span className="text-sm text-muted-foreground">Gross Monthly Pay</span>
            <span className="font-display font-black text-xl">${scenario.grossMonthly.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            {scenario.deductions.slice(0, deductionIdx).map((d, i) => (
              <motion.div key={d.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="flex justify-between text-sm">
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-bold text-destructive">-${d.amount}</span>
              </motion.div>
            ))}
          </div>
          {deductionIdx >= scenario.deductions.length && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-bold text-sm">Take-Home Pay</span>
              <span className="font-display font-black text-2xl text-primary">${runningTotal.toLocaleString()}</span>
            </motion.div>
          )}
          {deductionIdx < scenario.deductions.length && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-bold">${runningTotal.toLocaleString()}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // BUDGET PHASE
  if (phase === "budget") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div><p className="text-xs text-muted-foreground">Take-Home</p><p className="font-bold font-display">${netPay.toLocaleString()}</p></div>
          <div className="text-right"><p className="text-xs text-muted-foreground">Remaining</p><p className={cn("font-bold font-display", remaining >= 0 ? "text-emerald-600" : "text-destructive")}>${remaining.toLocaleString()}</p></div>
        </div>
        <p className="text-sm font-bold">Pay your bills:</p>
        <div className="space-y-1.5">
          {scenario.bills.map((bill, i) => (
            <button key={i} onClick={() => toggleBill(i)}
              className={cn("w-full flex items-center justify-between rounded-xl border-2 p-3 text-sm transition-all",
                selectedBills.has(i) ? "border-primary/30 bg-primary/5" : "border-border opacity-60",
                bill.required && "cursor-default")}>
              <div className="flex items-center gap-2">
                <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center", selectedBills.has(i) ? "bg-primary border-primary" : "border-muted-foreground")}>
                  {selectedBills.has(i) && <span className="text-primary-foreground text-[10px]">✓</span>}
                </div>
                <span className="font-medium">{bill.name}</span>
                {bill.required && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded font-bold">Required</span>}
              </div>
              <span className="font-display font-bold">${bill.amount}</span>
            </button>
          ))}
        </div>
        <Button onClick={submitBudget} className="w-full rounded-xl font-bold" disabled={remaining < 0}>Choose Your Want →</Button>
      </div>
    );
  }

  // WANTS PHASE
  if (phase === "wants") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div><p className="text-xs text-muted-foreground">After Bills</p><p className="font-bold font-display">${(netPay - totalBills).toLocaleString()}</p></div>
          <div className="text-right"><p className="text-xs text-muted-foreground">After Want</p><p className={cn("font-bold font-display", remaining >= 0 ? "text-emerald-600" : "text-destructive")}>${remaining.toLocaleString()}</p></div>
        </div>
        <p className="text-sm font-bold">Pick ONE want (or skip to save everything):</p>
        <div className="space-y-2">
          {scenario.wants.map((want, i) => (
            <button key={i} onClick={() => setSelectedWant(selectedWant === i ? null : i)}
              className={cn("w-full text-left rounded-xl border-2 p-3 transition-all",
                selectedWant === i ? "border-primary bg-primary/5" : "border-border")}>
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{want.name}</span>
                <span className="font-display font-bold text-sm">${want.cost}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{want.desc}</p>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className={cn("w-2 h-2 rounded-full", j < want.satisfaction ? "bg-primary" : "bg-muted")} />
                ))}
                <span className="text-[9px] text-muted-foreground ml-1">satisfaction</span>
              </div>
            </button>
          ))}
        </div>
        <Button onClick={submitWant} className="w-full rounded-xl font-bold">Lock In Choices</Button>
      </div>
    );
  }

  // RESULT
  if (phase === "result") {
    const investedIn10Years = Math.round(remaining * 12 * Math.pow(1.08, 10));
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className={cn("rounded-xl p-5 text-center border-2 space-y-3", remaining >= netPay * 0.2 ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300")}>
        <p className="text-3xl">{remaining >= netPay * 0.2 ? "🎯" : "📊"}</p>
        <p className="font-bold font-display text-lg">{remaining >= netPay * 0.2 ? "Great budgeting!" : "Room for improvement"}</p>
        <p className="text-sm text-muted-foreground">Saved ${remaining.toLocaleString()}/month ({Math.round(remaining / netPay * 100)}% savings rate)</p>
        <p className="text-xs text-muted-foreground">If invested, your monthly savings become <span className="font-bold text-primary">${investedIn10Years.toLocaleString()}</span> in 10 years</p>
        {selectedWant !== null && (
          <p className="text-xs text-muted-foreground">
            Want chosen: {scenario.wants[selectedWant].name} (satisfaction: {scenario.wants[selectedWant].satisfaction}/10)
          </p>
        )}
        <p className="text-sm font-bold">Round score: {roundScores[roundScores.length - 1]}/100</p>
        <Button onClick={nextScenario} className="w-full rounded-xl font-bold">{scenarioIdx + 1 >= scenarios.length ? "See Results 🏁" : "Next Paycheck →"}</Button>
      </motion.div>
    );
  }

  return null;
};

export default PaycheckLifeSim;
