import { useState } from "react";
import { BookOpen, Bookmark, ChevronRight, TrendingUp, Wallet, Brain, Banknote, RefreshCw, CreditCard, Shield, Clock, BarChart3, Lightbulb, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const tabs = [
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "courses", label: "Courses", icon: BookOpen },
] as const;

const gamesList = [
  { title: "Sim Trading", desc: "Buy & sell stocks in a simulated market", difficulty: "Intermediate", icon: TrendingUp },
  { title: "Budget Challenge", desc: "Build a balanced budget under constraints", difficulty: "Beginner", icon: Wallet },
  { title: "Finance Quiz", desc: "Test your financial knowledge", difficulty: "Beginner", icon: Brain },
  { title: "Paycheck Breakdown", desc: "Estimate your take-home pay after taxes", difficulty: "Beginner", icon: Banknote },
  { title: "Subscription Trap", desc: "Manage subscriptions within a budget", difficulty: "Beginner", icon: RefreshCw },
  { title: "Credit Score Challenge", desc: "Make choices that affect your credit score", difficulty: "Intermediate", icon: CreditCard },
  { title: "Emergency Fund Builder", desc: "Handle unexpected expenses wisely", difficulty: "Beginner", icon: Shield },
  { title: "Investing Time Machine", desc: "See how starting age affects wealth", difficulty: "Beginner", icon: Clock },
];

const Library = () => {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("games");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Library</h1>
        <p className="text-muted-foreground mt-1">Games and courses — all in one place</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all",
              tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Games Tab */}
      {tab === "games" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Play interactive games to practice financial skills</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {gamesList.map((game) => (
              <Link
                key={game.title}
                to="/games"
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">{(() => { const GIcon = game.icon; return <GIcon className="w-5 h-5 text-primary" />; })()}</div>
                <div className="flex-1">
                  <h3 className="font-display font-extrabold text-sm">{game.title}</h3>
                  <p className="text-xs text-muted-foreground">{game.desc}</p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-muted text-muted-foreground mt-1 inline-block">{game.difficulty}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {tab === "courses" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Structured courses with modules, quizzes, and certificates</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Budgeting Basics", desc: "Create and sustain a budget that works", icon: BarChart3, modules: 6 },
              { title: "Investing Basics", desc: "Stocks, bonds, ETFs, and long-term thinking", icon: TrendingUp, modules: 6 },
              { title: "Credit & Borrowing", desc: "Credit scores, cards, and responsible borrowing", icon: CreditCard, modules: 4 },
              { title: "Entrepreneurship & Side-Hustles", desc: "From idea to first sale", icon: Lightbulb, modules: 4 },
            ].map(course => (
              <Link
                key={course.title}
                to="/courses"
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">{(() => { const CIcon = course.icon; return <CIcon className="w-5 h-5 text-primary" />; })()}</div>
                <h3 className="font-display font-extrabold">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-primary">{course.modules} modules</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
