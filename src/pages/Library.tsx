import { useState } from "react";
import { Play, Gamepad2, BookOpen, Bookmark, Heart, X, ArrowLeft, ChevronRight, TrendingUp, Wallet, Brain, Banknote, RefreshCw, CreditCard, Shield, Clock, BarChart3, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const tabs = [
  { id: "videos", label: "Videos", icon: Play },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "courses", label: "Courses", icon: BookOpen },
] as const;

const categories = ["All", "Budgeting", "Investing", "Credit", "Entrepreneurship", "Saving", "Taxes", "Mindset"];

const videos = [
  { id: "1", title: "How to Budget as a Teenager", category: "Budgeting", youtubeId: "sVKQn2I4HDM", source: "Practical Wisdom" },
  { id: "2", title: "What is a Credit Score?", category: "Credit", youtubeId: "jPLUsc5SWTE", source: "Investopedia" },
  { id: "3", title: "Start Investing with $100", category: "Investing", youtubeId: "gFQNPmLKj1k", source: "Ali Abdaal" },
  { id: "4", title: "5 Side Hustles for High Schoolers", category: "Entrepreneurship", youtubeId: "hv9dGWOG3bk", source: "NGPF" },
  { id: "5", title: "Emergency Fund: Why & How", category: "Saving", youtubeId: "fVToMS2Q3XQ", source: "Two Cents" },
  { id: "6", title: "Understanding Compound Interest", category: "Investing", youtubeId: "wf91rEGw88Q", source: "Organic Chemistry Tutor" },
  { id: "7", title: "How Taxes Work for Beginners", category: "Taxes", youtubeId: "ZJx3VNqJObs", source: "WhiteBoard Finance" },
  { id: "8", title: "Money Mindset: Think Like the Wealthy", category: "Mindset", youtubeId: "bfAzi6D5FpM", source: "Swedish Investor" },
  { id: "9", title: "Needs vs Wants Explained", category: "Budgeting", youtubeId: "zOnrKkGccDU", source: "Econ Plus" },
  { id: "10", title: "How to Open a Bank Account", category: "Saving", youtubeId: "1m6s2FnhECk", source: "Zions TV" },
  { id: "11", title: "What is an ETF?", category: "Investing", youtubeId: "OwpFBi-jRVg", source: "The Plain Bagel" },
  { id: "12", title: "Building Your First Business Plan", category: "Entrepreneurship", youtubeId: "Fqch5OrUPvA", source: "YEF" },
  { id: "13", title: "Credit Cards Explained", category: "Credit", youtubeId: "EJMEMaMtRto", source: "Two Cents" },
  { id: "14", title: "The 50/30/20 Budget Rule", category: "Budgeting", youtubeId: "HQzoZfc3GwQ", source: "Nischa" },
  { id: "15", title: "Stock Market for Beginners", category: "Investing", youtubeId: "ZCFkWDdmXG8", source: "Humphrey Yang" },
  { id: "16", title: "Why You Should Start Saving NOW", category: "Saving", youtubeId: "jHXfDc0YKfk", source: "Two Cents" },
  { id: "17", title: "Filing Taxes: A Beginner's Guide", category: "Taxes", youtubeId: "tY7tMW1Kmc4", source: "ClearValue Tax" },
  { id: "18", title: "How to Negotiate Your First Salary", category: "Mindset", youtubeId: "u-FBIOr0KTc", source: "Jeff Su" },
];

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
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("videos");
  const [filter, setFilter] = useState("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const filtered = filter === "All" ? videos : videos.filter((v) => v.category === filter);

  const toggleSave = (id: string) => setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleLike = (id: string) => setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Library</h1>
        <p className="text-muted-foreground mt-1">Videos, games, and courses — all in one place</p>
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

      {/* Videos Tab */}
      {tab === "videos" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  filter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(video => (
              <div key={video.id} className="rounded-xl overflow-hidden border border-border bg-card group hover:border-primary/30 transition-all">
                <div className="aspect-video relative bg-secondary">
                  {playingId === video.id ? (
                    <div className="relative w-full h-full">
                      <iframe src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`} title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen className="w-full h-full absolute inset-0" loading="lazy" />
                      <button onClick={() => setPlayingId(null)} className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background">
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setPlayingId(video.id)} className="w-full h-full relative cursor-pointer">
                      <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title}
                        className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-background/20 group-hover:bg-background/40 transition-colors flex items-center justify-center">
                        <div className="p-3 rounded-full bg-primary/90 shadow-lg">
                          <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{video.source}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleLike(video.id)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                        <Heart className={cn("w-4 h-4", liked.has(video.id) ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                      </button>
                      <button onClick={() => toggleSave(video.id)} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                        <Bookmark className={cn("w-4 h-4", saved.has(video.id) ? "fill-primary text-primary" : "text-muted-foreground")} />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded bg-primary/10 text-primary">{video.category}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Games Tab */}
      {tab === "games" && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Play interactive games to practice financial skills</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {gamesList.map((game, i) => (
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
                <div className="text-3xl mb-3">{course.emoji}</div>
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
