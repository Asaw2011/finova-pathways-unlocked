import { useState, useEffect } from "react";
import { Gamepad2, TrendingUp, Wallet, Brain, Trophy, ArrowRight, ArrowLeft, RotateCcw, CreditCard, Banknote, Clock, AlertTriangle, DollarSign, Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import PaycheckBreakdown from "@/components/games/PaycheckBreakdown";
import SubscriptionTrap from "@/components/games/SubscriptionTrap";
import CreditScoreChallenge from "@/components/games/CreditScoreChallenge";
import EmergencyFundBuilder from "@/components/games/EmergencyFundBuilder";
import InvestingTimeMachine from "@/components/games/InvestingTimeMachine";

// ---- SHARED SCORING INFRASTRUCTURE ----
export const getGrade = (score: number): "S" | "A" | "B" | "C" | "F" => {
  if (score >= 95) return "S";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "F";
};

export const getGemsFromScore = (score: number): number => {
  if (score >= 95) return 30;
  if (score >= 80) return 20;
  if (score >= 65) return 12;
  if (score >= 50) return 6;
  return 2;
};

// ---- SIM TRADING GAME ----
const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 178.50 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.20 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 245.80 },
  { symbol: "AMZN", name: "Amazon.com", price: 185.60 },
  { symbol: "MSFT", name: "Microsoft", price: 415.30 },
];

const SimTrading = ({ earnGems }: { earnGems?: (n: number) => void }) => {
  const initialBalance = 10000;
  const [balance, setBalance] = useState(initialBalance);
  const [portfolio, setPortfolio] = useState<Record<string, { shares: number; avgPrice: number }>>({});
  const [prices, setPrices] = useState(stocks.map((s) => s.price));
  const [tradeHistory, setTradeHistory] = useState<{ action: string; symbol: string; price: number; pnl?: number }[]>([]);
  const [dayCount, setDayCount] = useState(0);

  const simulateMarket = () => {
    setDayCount(d => d + 1);
    setPrices((prev) => prev.map((p) => {
      const change = (Math.random() - 0.48) * p * 0.05;
      return Math.round((p + change) * 100) / 100;
    }));
  };

  const buy = (index: number) => {
    const stock = stocks[index]; const price = prices[index];
    if (balance < price) { toast.error("Not enough balance!"); return; }
    setBalance((b) => Math.round((b - price) * 100) / 100);
    setPortfolio((prev) => {
      const existing = prev[stock.symbol] || { shares: 0, avgPrice: 0 };
      const totalCost = existing.avgPrice * existing.shares + price;
      const newShares = existing.shares + 1;
      return { ...prev, [stock.symbol]: { shares: newShares, avgPrice: totalCost / newShares } };
    });
    toast.success(`Bought 1 share of ${stock.symbol}`);
    setTradeHistory(prev => [...prev, { action: "BUY", symbol: stock.symbol, price }]);
  };

  const sell = (index: number) => {
    const stock = stocks[index]; const price = prices[index];
    if (!portfolio[stock.symbol] || portfolio[stock.symbol].shares === 0) { toast.error("No shares to sell!"); return; }
    const pnl = price - portfolio[stock.symbol].avgPrice;
    setBalance((b) => Math.round((b + price) * 100) / 100);
    setPortfolio((prev) => {
      const existing = prev[stock.symbol];
      const newShares = existing.shares - 1;
      return { ...prev, [stock.symbol]: { shares: newShares, avgPrice: newShares > 0 ? existing.avgPrice : 0 } };
    });
    toast.success(`Sold 1 share of ${stock.symbol}`);
    setTradeHistory(prev => [...prev, { action: "SELL", symbol: stock.symbol, price, pnl: Math.round(pnl * 100) / 100 }]);
  };

  const portfolioValue = stocks.reduce((sum, s, i) => sum + (portfolio[s.symbol]?.shares ?? 0) * prices[i], 0);
  const totalValue = balance + portfolioValue;
  const totalReturn = ((totalValue - initialBalance) / initialBalance) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div><p className="text-xs text-muted-foreground font-medium">Cash</p><p className="text-xl font-extrabold font-display">${balance.toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground font-medium">Portfolio</p><p className="text-xl font-extrabold font-display text-primary">${Math.round(portfolioValue).toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground font-medium">Total Return</p><p className={cn("text-xl font-extrabold font-display", totalReturn >= 0 ? "text-emerald-600" : "text-destructive")}>{totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(1)}%</p></div>
      </div>
      <div className="flex gap-2 items-center">
        <Button size="sm" onClick={simulateMarket} className="rounded-xl"><TrendingUp className="w-4 h-4 mr-1" /> Simulate Day</Button>
        <span className="text-xs text-muted-foreground font-bold">Day {dayCount + 1}</span>
        <Button size="sm" variant="outline" className="rounded-xl ml-auto" onClick={() => { setBalance(initialBalance); setPortfolio({}); setPrices(stocks.map(s => s.price)); setTradeHistory([]); setDayCount(0); }}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
      </div>
      <div className="space-y-2">
        {stocks.map((stock, i) => {
          const change = prices[i] - stock.price;
          const pct = ((change / stock.price) * 100).toFixed(1);
          const holding = portfolio[stock.symbol];
          return (
            <div key={stock.symbol} className="bg-muted/50 rounded-xl p-3 flex items-center justify-between border border-border">
              <div><p className="font-display font-bold text-sm">{stock.symbol}</p><p className="text-xs text-muted-foreground">{stock.name}</p></div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-display font-bold text-sm">${prices[i].toFixed(2)}</p>
                  <p className={cn("text-xs font-medium", change >= 0 ? "text-emerald-600" : "text-destructive")}>{change >= 0 ? "+" : ""}{pct}%</p>
                </div>
                {holding && holding.shares > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-lg font-bold">{holding.shares}</span>}
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => buy(i)} className="h-7 px-2 text-xs rounded-lg">Buy</Button>
                  <Button size="sm" variant="ghost" onClick={() => sell(i)} className="h-7 px-2 text-xs rounded-lg">Sell</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {tradeHistory.length > 0 && (
        <div className="glass rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-muted-foreground">Recent Trades</p>
          {tradeHistory.slice(-5).reverse().map((t, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className={cn("font-bold px-1.5 py-0.5 rounded", t.action === "BUY" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>{t.action}</span>
              <span className="text-muted-foreground">{t.symbol} @ ${t.price.toFixed(2)}</span>
              {t.pnl !== undefined && (
                <span className={cn("font-bold", t.pnl >= 0 ? "text-emerald-600" : "text-destructive")}>
                  {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---- BUDGET CHALLENGE ----
const budgetScenarios = [
  { title: "First Job Budget", income: 2000, expenses: [{ name: "Rent", amount: 800, required: true }, { name: "Groceries", amount: 300, required: true }, { name: "Phone Bill", amount: 60, required: true }, { name: "Transportation", amount: 100, required: true }, { name: "Streaming Services", amount: 45, required: false }, { name: "Eating Out", amount: 200, required: false }, { name: "New Sneakers", amount: 150, required: false }, { name: "Savings", amount: 400, required: false }, { name: "Emergency Fund", amount: 200, required: false }] },
  { title: "College Student Budget", income: 1200, expenses: [{ name: "Tuition (monthly)", amount: 400, required: true }, { name: "Groceries", amount: 200, required: true }, { name: "Transportation", amount: 80, required: true }, { name: "Phone Bill", amount: 45, required: true }, { name: "Textbooks", amount: 100, required: false }, { name: "Eating Out", amount: 150, required: false }, { name: "Entertainment", amount: 80, required: false }, { name: "Savings", amount: 200, required: false }] },
  { title: "Side Hustle Budget", income: 3500, expenses: [{ name: "Rent", amount: 1100, required: true }, { name: "Car Payment", amount: 350, required: true }, { name: "Insurance", amount: 150, required: true }, { name: "Groceries", amount: 400, required: true }, { name: "Streaming x3", amount: 45, required: false }, { name: "Gym Membership", amount: 50, required: false }, { name: "Dining Out", amount: 300, required: false }, { name: "Clothing", amount: 150, required: false }, { name: "Investments", amount: 500, required: false }, { name: "Emergency Fund", amount: 200, required: false }] },
  { title: "Minimum Wage Challenge", income: 1400, expenses: [{ name: "Shared Rent", amount: 500, required: true }, { name: "Groceries", amount: 250, required: true }, { name: "Bus Pass", amount: 60, required: true }, { name: "Phone", amount: 40, required: true }, { name: "Utilities share", amount: 80, required: true }, { name: "Eating Out", amount: 120, required: false }, { name: "Savings", amount: 150, required: false }, { name: "Entertainment", amount: 60, required: false }, { name: "Clothing", amount: 80, required: false }] },
  { title: "Post-Graduation Budget", income: 4200, expenses: [{ name: "Rent", amount: 1400, required: true }, { name: "Student Loan Payment", amount: 350, required: true }, { name: "Groceries", amount: 350, required: true }, { name: "Car & Insurance", amount: 450, required: true }, { name: "Phone", amount: 70, required: true }, { name: "Gym", amount: 50, required: false }, { name: "Dining Out", amount: 250, required: false }, { name: "Streaming", amount: 40, required: false }, { name: "Savings", amount: 500, required: false }, { name: "401k Contribution", amount: 420, required: false }, { name: "Emergency Fund", amount: 200, required: false }] },
];

const BudgetGame = ({ earnGems }: { earnGems?: (n: number) => void }) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const scenario = budgetScenarios[scenarioIndex];
  const [selected, setSelected] = useState<Set<number>>(new Set(scenario.expenses.map((e, i) => e.required ? i : -1).filter(i => i >= 0)));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSelected(new Set(budgetScenarios[scenarioIndex].expenses.map((e, i) => e.required ? i : -1).filter(i => i >= 0)));
    setSubmitted(false);
  }, [scenarioIndex]);

  const totalSpent = scenario.expenses.reduce((sum, e, i) => sum + (selected.has(i) ? e.amount : 0), 0);
  const remaining = scenario.income - totalSpent;
  const toggle = (i: number) => { if (scenario.expenses[i].required || submitted) return; setSelected((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; }); };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-muted-foreground mb-1">{scenario.title} — Scenario {scenarioIndex + 1}/5</p>
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-muted-foreground font-medium">Monthly Income</p><p className="text-2xl font-extrabold font-display">${scenario.income.toLocaleString()}</p></div>
        <div className="text-right"><p className="text-xs text-muted-foreground font-medium">Remaining</p><p className={cn("text-2xl font-extrabold font-display", remaining >= 0 ? "text-emerald-600" : "text-destructive")}>${remaining.toLocaleString()}</p></div>
      </div>
      <p className="text-sm text-muted-foreground">Select expenses. Required ones can't be removed.</p>
      <div className="space-y-2">
        {scenario.expenses.map((expense, i) => (
          <button key={i} onClick={() => toggle(i)} className={cn("w-full bg-card rounded-xl border p-3 flex items-center justify-between transition-all text-left", selected.has(i) ? "border-primary/30 bg-primary/5" : "border-border opacity-60", (expense.required || submitted) && "cursor-default")}>
            <div className="flex items-center gap-2">
              <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center", selected.has(i) ? "bg-primary border-primary text-white" : "border-muted-foreground")}>
                {selected.has(i) && <span className="text-xs">✓</span>}
              </div>
              <span className="text-sm font-semibold">{expense.name}</span>
              {expense.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Required</span>}
            </div>
            <span className="font-display font-bold text-sm">${expense.amount}</span>
          </button>
        ))}
      </div>
      {!submitted && remaining >= 0 && remaining < 200 && <p className="text-xs text-amber-600 font-medium">Consider saving more from remaining funds.</p>}
      {!submitted && remaining < 0 && <p className="text-xs text-destructive font-medium">Over budget! Remove optional expenses.</p>}
      {!submitted && (
        <Button onClick={() => setSubmitted(true)} className="w-full rounded-xl font-bold" disabled={remaining < 0}>
          {remaining >= 0 ? "✓ Lock In Budget" : "Over Budget!"}
        </Button>
      )}
      {submitted && (
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center space-y-2">
          <p className="text-lg font-bold">✅ Budget Locked!</p>
          <p className="text-sm text-muted-foreground">You kept ${remaining.toLocaleString()} remaining from ${scenario.income.toLocaleString()} income.</p>
          <Button size="sm" variant="outline" onClick={() => setSubmitted(false)} className="rounded-xl"><RotateCcw className="w-3 h-3 mr-1" /> Try Again</Button>
          {scenarioIndex < budgetScenarios.length - 1 && (
            <Button size="sm" onClick={() => setScenarioIndex(i => i + 1)} className="rounded-xl mt-2 w-full font-bold">
              Next Scenario →
            </Button>
          )}
          {scenarioIndex === budgetScenarios.length - 1 && (
            <p className="text-xs text-emerald-600 font-bold mt-2 text-center">🎉 You completed all 5 scenarios!</p>
          )}
        </div>
      )}
    </div>
  );
};

// ---- QUIZ GAME ----
const quizQuestions = [
  { q: "What is compound interest?", options: ["Interest on original only", "Interest on interest + principal", "A bank fee", "A tax deduction"], answer: 1 },
  { q: "What does 'diversification' mean?", options: ["Buying one stock", "Spreading investments", "Selling everything", "Borrowing to invest"], answer: 1 },
  { q: "What is a credit score range?", options: ["0-500", "100-850", "300-850", "500-1000"], answer: 2 },
  { q: "What is the 50/30/20 rule?", options: ["Save 50%, spend 30%, invest 20%", "Needs 50%, wants 30%, savings 20%", "Taxes 50%, rent 30%, food 20%", "Invest 50%, save 30%, spend 20%"], answer: 1 },
  { q: "What is an ETF?", options: ["Electronic Transfer Fund", "Exchange-Traded Fund", "Extra Tax Filing", "Emergency Trust Fund"], answer: 1 },
  { q: "What is APR?", options: ["Annual Profit Rate", "Annual Percentage Rate", "Account Payment Ratio", "Average Premium Rate"], answer: 1 },
  { q: "FDIC insurance covers deposits up to:", options: ["$100,000", "$250,000", "$500,000", "$1,000,000"], answer: 1 },
  { q: "A Roth IRA is taxed:", options: ["When you withdraw", "When you contribute", "Never", "Twice"], answer: 1 },
  { q: "What is net worth?", options: ["Your salary", "Assets minus liabilities", "Total savings", "Monthly income"], answer: 1 },
  { q: "The 24-hour rule helps you avoid:", options: ["Paying bills late", "Impulse purchases", "Low credit scores", "Tax penalties"], answer: 1 },
  { q: "Which account typically earns higher interest?", options: ["Checking account", "High-yield savings account", "Student loan account", "Credit card account"], answer: 1 },
  { q: "What is an index fund?", options: ["A list of stocks", "A fund tracking a market index like the S&P 500", "A type of savings account", "A government bond"], answer: 1 },
  { q: "Lifestyle inflation means:", options: ["Prices rising over time", "Spending more as you earn more", "Investing your raises", "Reducing expenses"], answer: 1 },
  { q: "What does 'pay yourself first' mean?", options: ["Buy treats first", "Save before spending on wants", "Pay bills first", "Borrow money upfront"], answer: 1 },
  { q: "A credit score of 750 is considered:", options: ["Poor", "Fair", "Good to Excellent", "Not real"], answer: 2 },
  { q: "The biggest factor in your credit score is:", options: ["Length of history", "Payment history (35%)", "Credit mix", "New credit"], answer: 1 },
  { q: "What is an emergency fund?", options: ["Money for vacations", "3-6 months of expenses saved", "A type of investment", "A bank loan"], answer: 1 },
  { q: "Employer 401k matching is:", options: ["A tax penalty", "Free money you should always take", "A type of loan", "Optional for employers"], answer: 1 },
  { q: "What is opportunity cost?", options: ["The price of opportunities", "Money spent here can't grow elsewhere", "The cheapest option available", "A type of interest"], answer: 1 },
  { q: "Dollar-cost averaging means:", options: ["Always buying at the lowest price", "Investing a fixed amount regularly regardless of price", "Only buying when markets drop", "Splitting investments 50/50"], answer: 1 },
];

const QuizGame = ({ earnGems }: { earnGems?: (n: number) => Promise<void> }) => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [quizGemsClaimed, setQuizGemsClaimed] = useState(false);

  const quizGems = score >= 18 ? 30 : score >= 14 ? 20 : score >= 10 ? 12 : score >= 6 ? 6 : 2;

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === quizQuestions[current].answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (current + 1 >= quizQuestions.length) setFinished(true);
      else { setCurrent((c) => c + 1); setSelected(null); }
    }, 1000);
  };

  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100);
    const grade = getGrade(pct);

    return (
      <div className="text-center py-8 space-y-3">
        <Trophy className="w-12 h-12 text-duo-gold mx-auto mb-4" />
        <p className="text-4xl font-black font-display mb-1">{grade}</p>
        <p className="text-xl font-extrabold font-display mb-2">{score}/{quizQuestions.length} Correct</p>
        {earnGems && !quizGemsClaimed ? (
          <Button onClick={async () => { await earnGems(quizGems); setQuizGemsClaimed(true); toast.success(`+${quizGems} gems!`); }} className="rounded-xl font-bold bg-cyan-500 text-white w-full mb-2">
            <Diamond className="w-4 h-4 mr-2" /> Claim {quizGems} Gems
          </Button>
        ) : quizGemsClaimed ? (
          <p className="text-cyan-600 font-bold mb-2 text-center">✓ +{quizGems} gems!</p>
        ) : null}
        <Button className="rounded-xl w-full" variant="outline" onClick={() => { setCurrent(0); setScore(0); setSelected(null); setFinished(false); setQuizGemsClaimed(false); }}><RotateCcw className="w-4 h-4 mr-1" /> Play Again</Button>
      </div>
    );
  }

  const question = quizQuestions[current];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground font-medium"><span>Q{current + 1}/{quizQuestions.length}</span><span>Score: {score}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / quizQuestions.length) * 100}%` }} />
      </div>
      <h3 className="font-display font-bold text-lg">{question.q}</h3>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(i)} className={cn(
            "w-full text-left bg-card rounded-xl border-2 p-3 text-sm font-semibold transition-all",
            selected === null && "border-border hover:border-primary/30",
            selected === i && i === question.answer && "border-emerald-500 bg-emerald-50",
            selected === i && i !== question.answer && "border-red-400 bg-red-50",
            selected !== null && i === question.answer && selected !== i && "border-emerald-300"
          )}>{opt}</button>
        ))}
      </div>
    </div>
  );
};

// ---- MAIN GAMES PAGE ----
const gameColors = [
  "bg-blue-50 border-blue-200 text-blue-600",
  "bg-emerald-50 border-emerald-200 text-emerald-600",
  "bg-purple-50 border-purple-200 text-purple-600",
  "bg-amber-50 border-amber-200 text-amber-600",
  "bg-pink-50 border-pink-200 text-pink-600",
  "bg-teal-50 border-teal-200 text-teal-600",
  "bg-orange-50 border-orange-200 text-orange-600",
  "bg-indigo-50 border-indigo-200 text-indigo-600",
];

const games = [
  { id: "trading", title: "Sim Trading", desc: "Buy & sell real stocks in a simulated market. Build a portfolio and maximize returns.", icon: TrendingUp, component: SimTrading, learn: "How the stock market works", difficulty: "Intermediate", rounds: "Ongoing", maxGems: 30 },
  { id: "budget", title: "Budget Challenge", desc: "5 different life scenarios — stay under budget each round. Can you beat all 5?", icon: Wallet, component: BudgetGame, learn: "How to allocate income wisely", difficulty: "Beginner", rounds: "5 rounds", maxGems: 30 },
  { id: "quiz", title: "Finance Quiz", desc: "20 questions across all financial topics. Race against yourself to beat your score.", icon: Brain, component: QuizGame, learn: "Core financial concepts", difficulty: "Beginner", rounds: "20 questions", maxGems: 30 },
  { id: "paycheck", title: "Paycheck Breakdown", desc: "5 job scenarios — guess take-home pay before the timer runs out.", icon: Banknote, component: PaycheckBreakdown, learn: "How taxes reduce your paycheck", difficulty: "Beginner", rounds: "5 rounds", maxGems: 30 },
  { id: "subscription", title: "Subscription Trap", desc: "5 budgets, 30 subscriptions. Cut the right ones and stay under budget.", icon: DollarSign, component: SubscriptionTrap, learn: "How small costs add up", difficulty: "Beginner", rounds: "5 rounds", maxGems: 30 },
  { id: "credit", title: "Credit Life Sim", desc: "12 months of real credit decisions. Start at 580 — can you reach 750+?", icon: CreditCard, component: CreditScoreChallenge, learn: "How credit scores work", difficulty: "Intermediate", rounds: "12 months", maxGems: 30 },
  { id: "emergency", title: "Survive the Year", desc: "Build your emergency fund month by month. 4 real emergencies will test you.", icon: AlertTriangle, component: EmergencyFundBuilder, learn: "Why emergency funds matter", difficulty: "Beginner", rounds: "8 months", maxGems: 30 },
  { id: "timemachine", title: "Market Simulator", desc: "10 years of real market events. Hold, rebalance, or panic — your choices change everything.", icon: Clock, component: InvestingTimeMachine, learn: "The power of compound interest", difficulty: "Intermediate", rounds: "10 years", maxGems: 30 },
];

const GamesZone = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Beginner" | "Intermediate">("All");
  const { earnGems } = useGameEconomy();

  const filteredGames = difficultyFilter === "All" ? games : games.filter(g => g.difficulty === difficultyFilter);
  const ActiveComponent = games.find((g) => g.id === activeGame)?.component;
  const activeGameData = games.find((g) => g.id === activeGame);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Game Zone</h1>
        <p className="text-muted-foreground mt-1">8 interactive games — earn gems, learn by doing</p>
      </motion.div>

      {!activeGame ? (
        <>
          {/* Difficulty filter */}
          <div className="flex gap-2">
            {(["All", "Beginner", "Intermediate"] as const).map(d => (
              <button key={d} onClick={() => setDifficultyFilter(d)}
                className={cn("px-4 py-1.5 rounded-xl text-sm font-bold border-2 transition-all",
                  difficultyFilter === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
                {d}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredGames.map(({ id, title, desc, icon: Icon, learn, difficulty, rounds, maxGems }, i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveGame(id)}
                className="bg-card rounded-2xl border border-border p-5 text-left hover:shadow-md transition-all group"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 border", gameColors[i % gameColors.length])}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-muted text-muted-foreground">{difficulty}</span>
                  <span className="text-xs text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Play <ArrowRight className="w-3 h-3" /></span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">{rounds}</span>
                  <span className="text-xs font-bold text-duo-blue flex items-center gap-0.5">
                    <Diamond className="w-3 h-3 fill-current" /> Up to {maxGems} gems
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setActiveGame(null)} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to games
          </button>
          <div className="bg-card rounded-2xl border border-border p-6 card-shadow">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-display font-extrabold text-xl">{activeGameData?.title}</h2>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary">{activeGameData?.difficulty}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4 font-medium">What you'll learn: {activeGameData?.learn}</p>
            {ActiveComponent && <ActiveComponent earnGems={earnGems} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesZone;
