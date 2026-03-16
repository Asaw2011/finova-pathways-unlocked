import { useState } from "react";
import { Gamepad2, TrendingUp, Wallet, Brain, Trophy, ArrowRight, ArrowLeft, RotateCcw, CreditCard, Banknote, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PaycheckBreakdown from "@/components/games/PaycheckBreakdown";
import SubscriptionTrap from "@/components/games/SubscriptionTrap";
import CreditScoreChallenge from "@/components/games/CreditScoreChallenge";
import EmergencyFundBuilder from "@/components/games/EmergencyFundBuilder";
import InvestingTimeMachine from "@/components/games/InvestingTimeMachine";

// ---- SIM TRADING GAME ----
const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 178.50 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.20 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 245.80 },
  { symbol: "AMZN", name: "Amazon.com", price: 185.60 },
  { symbol: "MSFT", name: "Microsoft", price: 415.30 },
];

const SimTrading = () => {
  const [balance, setBalance] = useState(10000);
  const [portfolio, setPortfolio] = useState<Record<string, { shares: number; avgPrice: number }>>({});
  const [prices, setPrices] = useState(stocks.map((s) => s.price));

  const simulateMarket = () => {
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
  };

  const sell = (index: number) => {
    const stock = stocks[index]; const price = prices[index];
    if (!portfolio[stock.symbol] || portfolio[stock.symbol].shares === 0) { toast.error("No shares to sell!"); return; }
    setBalance((b) => Math.round((b + price) * 100) / 100);
    setPortfolio((prev) => {
      const existing = prev[stock.symbol];
      const newShares = existing.shares - 1;
      return { ...prev, [stock.symbol]: { shares: newShares, avgPrice: newShares > 0 ? existing.avgPrice : 0 } };
    });
    toast.success(`Sold 1 share of ${stock.symbol}`);
  };

  const portfolioValue = stocks.reduce((sum, s, i) => sum + (portfolio[s.symbol]?.shares ?? 0) * prices[i], 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-muted-foreground font-medium">Cash</p><p className="text-2xl font-extrabold font-display">${balance.toLocaleString()}</p></div>
        <div className="text-right"><p className="text-xs text-muted-foreground font-medium">Portfolio</p><p className="text-2xl font-extrabold font-display text-primary">${Math.round(portfolioValue).toLocaleString()}</p></div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={simulateMarket} className="rounded-xl"><TrendingUp className="w-4 h-4 mr-1" /> Simulate Day</Button>
        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setBalance(10000); setPortfolio({}); setPrices(stocks.map(s => s.price)); }}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
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
                  <p className={cn("text-xs font-medium", change >= 0 ? "text-emerald-600" : "text-red-500")}>{change >= 0 ? "+" : ""}{pct}%</p>
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
    </div>
  );
};

// ---- BUDGET CHALLENGE ----
const budgetScenarios = [{ income: 2000, expenses: [
  { name: "Rent", amount: 800, required: true },
  { name: "Groceries", amount: 300, required: true },
  { name: "Phone Bill", amount: 60, required: true },
  { name: "Streaming Services", amount: 45, required: false },
  { name: "Eating Out", amount: 200, required: false },
  { name: "New Sneakers", amount: 150, required: false },
  { name: "Savings", amount: 400, required: false },
  { name: "Transportation", amount: 100, required: true },
  { name: "Emergency Fund", amount: 200, required: false },
]}];

const BudgetGame = () => {
  const scenario = budgetScenarios[0];
  const [selected, setSelected] = useState<Set<number>>(new Set(scenario.expenses.map((e, i) => e.required ? i : -1).filter(i => i >= 0)));
  const totalSpent = scenario.expenses.reduce((sum, e, i) => sum + (selected.has(i) ? e.amount : 0), 0);
  const remaining = scenario.income - totalSpent;
  const toggle = (i: number) => { if (scenario.expenses[i].required) return; setSelected((prev) => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-muted-foreground font-medium">Monthly Income</p><p className="text-2xl font-extrabold font-display">${scenario.income.toLocaleString()}</p></div>
        <div className="text-right"><p className="text-xs text-muted-foreground font-medium">Remaining</p><p className={cn("text-2xl font-extrabold font-display", remaining >= 0 ? "text-emerald-600" : "text-red-500")}>${remaining.toLocaleString()}</p></div>
      </div>
      <p className="text-sm text-muted-foreground">Select expenses. Required ones can't be removed.</p>
      <div className="space-y-2">
        {scenario.expenses.map((expense, i) => (
          <button key={i} onClick={() => toggle(i)} className={cn("w-full bg-card rounded-xl border p-3 flex items-center justify-between transition-all text-left", selected.has(i) ? "border-primary/30 bg-primary/5" : "border-border opacity-60", expense.required && "cursor-default")}>
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
      {remaining >= 0 && remaining < 200 && <p className="text-xs text-amber-600 font-medium">Consider saving more from remaining funds.</p>}
      {remaining < 0 && <p className="text-xs text-red-500 font-medium">Over budget! Remove optional expenses.</p>}
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
];

const QuizGame = () => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === quizQuestions[current].answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (current + 1 >= quizQuestions.length) setFinished(true);
      else { setCurrent((c) => c + 1); setSelected(null); }
    }, 1000);
  };

  if (finished) return (
    <div className="text-center py-8">
      <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <p className="text-2xl font-extrabold font-display mb-2">{score}/{quizQuestions.length} Correct!</p>
      <p className="text-muted-foreground mb-4">{score >= 4 ? "Amazing!" : score >= 2 ? "Good effort!" : "Keep learning!"}</p>
      <Button className="rounded-xl" onClick={() => { setCurrent(0); setScore(0); setSelected(null); setFinished(false); }}>Play Again</Button>
    </div>
  );

  const question = quizQuestions[current];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground font-medium"><span>Q{current + 1}/{quizQuestions.length}</span><span>Score: {score}</span></div>
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
  { id: "trading", title: "Sim Trading", desc: "Buy & sell stocks in a simulated market", icon: TrendingUp, component: SimTrading, learn: "How the stock market works", difficulty: "Intermediate" },
  { id: "budget", title: "Budget Challenge", desc: "Build a balanced budget under constraints", icon: Wallet, component: BudgetGame, learn: "How to allocate income wisely", difficulty: "Beginner" },
  { id: "quiz", title: "Finance Quiz", desc: "Test your financial knowledge", icon: Brain, component: QuizGame, learn: "Core financial concepts", difficulty: "Beginner" },
  { id: "paycheck", title: "Paycheck Breakdown", desc: "Estimate your take-home pay after taxes", icon: Banknote, component: PaycheckBreakdown, learn: "How taxes reduce your paycheck", difficulty: "Beginner" },
  { id: "subscription", title: "Subscription Trap", desc: "Manage subscriptions within a budget", icon: DollarSign, component: SubscriptionTrap, learn: "How small costs add up", difficulty: "Beginner" },
  { id: "credit", title: "Credit Score Challenge", desc: "Make choices that affect your credit score", icon: CreditCard, component: CreditScoreChallenge, learn: "How credit scores work", difficulty: "Intermediate" },
  { id: "emergency", title: "Emergency Fund Builder", desc: "Handle an unexpected expense wisely", icon: AlertTriangle, component: EmergencyFundBuilder, learn: "Why emergency funds matter", difficulty: "Beginner" },
  { id: "timemachine", title: "Investing Time Machine", desc: "See how starting age affects wealth", icon: Clock, component: InvestingTimeMachine, learn: "The power of compound interest", difficulty: "Beginner" },
];

const GamesZone = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const ActiveComponent = games.find((g) => g.id === activeGame)?.component;
  const activeGameData = games.find((g) => g.id === activeGame);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Game Zone</h1>
        <p className="text-muted-foreground mt-1">Learn by playing — {games.length} interactive financial games</p>
      </motion.div>

      {!activeGame ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {games.map(({ id, title, desc, icon: Icon, learn, difficulty }, i) => (
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
              <p className="text-sm text-muted-foreground mb-3">{desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-muted text-muted-foreground">{difficulty}</span>
                <span className="text-xs text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Play <ArrowRight className="w-3 h-3" /></span>
              </div>
            </motion.button>
          ))}
        </div>
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
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesZone;
