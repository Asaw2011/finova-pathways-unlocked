import { useState, useEffect } from "react";
import { Gamepad2, TrendingUp, Wallet, Brain, Trophy, ArrowRight, ArrowLeft, RotateCcw, CreditCard, Banknote, Clock, AlertTriangle, DollarSign, Diamond, CheckCircle2, Palmtree, ScrollText, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// New game components
import SimTradingGame from "@/components/games/SimTradingGame";
import BudgetLifeSim from "@/components/games/BudgetLifeSim";
import MoneyMountainGame from "@/components/games/MoneyMountainGame";
import PaycheckLifeSim from "@/components/games/PaycheckLifeSim";
import SubscriptionDetective from "@/components/games/SubscriptionDetective";
import CreditLifeSim from "@/components/games/CreditLifeSim";
import InvestingIsland from "@/components/games/InvestingIsland";
import TaxQuest from "@/components/games/TaxQuest";

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

// ---- XP AWARDING ----
const awardGameXP = async (userId: string, gameId: string, score: number) => {
  const xpAmount = score >= 95 ? 50 : score >= 80 ? 35 : score >= 65 ? 20 : score >= 50 ? 10 : 5;
  await supabase.from("user_xp").insert({ user_id: userId, xp_amount: xpAmount, source: "game", source_id: gameId });
  await supabase.from("games_played").insert({ user_id: userId, game_id: gameId, score });
};

// ---- GAME COLORS ----
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
  { id: "trading", title: "Sim Trading", desc: "12 companies, 8 years of market events. Buy, sell, and survive crashes to build wealth.", icon: TrendingUp, component: SimTradingGame, learn: "Stock market investing", difficulty: "Intermediate", rounds: "8 rounds", maxGems: 30 },
  { id: "budget", title: "Life Simulator", desc: "Live ages 22-40 making real financial decisions. Rent vs buy, career, investments, family.", icon: Wallet, component: BudgetLifeSim, learn: "Life financial planning", difficulty: "Beginner", rounds: "10 spaces", maxGems: 30 },
  { id: "mountain", title: "Money Mountain", desc: "Race AI opponents up the mountain. Smart financial choices advance you faster.", icon: Mountain, component: MoneyMountainGame, learn: "Financial decision-making", difficulty: "Beginner", rounds: "30 spaces", maxGems: 30 },
  { id: "paycheck", title: "Paycheck Life", desc: "Watch deductions eat your paycheck, then budget what's left. Wants vs needs tension.", icon: Banknote, component: PaycheckLifeSim, learn: "Tax deductions & budgeting", difficulty: "Beginner", rounds: "3 scenarios", maxGems: 30 },
  { id: "subscription", title: "Subscription Detective", desc: "Hunt hidden subscriptions, eliminate duplicates, negotiate deals. Hit $80/mo target.", icon: DollarSign, component: SubscriptionDetective, learn: "Subscription management", difficulty: "Beginner", rounds: "3 phases", maxGems: 30 },
  { id: "credit", title: "Credit Life Sim", desc: "12 months of credit decisions. Start at 580 — bills, emergencies, temptations test you.", icon: CreditCard, component: CreditLifeSim, learn: "Credit score management", difficulty: "Intermediate", rounds: "12 months", maxGems: 30 },
  { id: "island", title: "Investing Island", desc: "Stranded with $10k. Invest in island resources to reach $50k and get rescued.", icon: Palmtree, component: InvestingIsland, learn: "Portfolio diversification", difficulty: "Intermediate", rounds: "10 rounds", maxGems: 30 },
  { id: "taxquest", title: "Tax Quest", desc: "Journey through the Tax Kingdom collecting deductions and credits. Maximize your refund.", icon: ScrollText, component: TaxQuest, learn: "Tax optimization", difficulty: "Beginner", rounds: "8 locations", maxGems: 30 },
];

// ---- DAILY FEATURED GAME ----
const getDailyFeaturedGame = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return games[dayOfYear % games.length].id;
};

// ---- BADGE CHECKING ----
const checkAndAwardGameBadges = async (userId: string, gameId: string, score: number) => {
  const { data: allGamesPlayed } = await supabase.from("games_played").select("game_id, score").eq("user_id", userId);
  const uniqueGames = new Set(allGamesPlayed?.map(g => g.game_id)).size;
  const totalGames = allGamesPlayed?.length ?? 0;
  const topScore = Math.max(...(allGamesPlayed?.map(g => g.score ?? 0) ?? [0]));
  const aRankGames = new Set(allGamesPlayed?.filter(g => (g.score ?? 0) >= 80).map(g => g.game_id)).size;

  const { data: existingBadges } = await supabase.from("user_badges").select("badge_name").eq("user_id", userId);
  const earned = new Set(existingBadges?.map(b => b.badge_name) ?? []);

  const toAward: { name: string; icon: string }[] = [];
  if (!earned.has("Game On") && totalGames >= 1) toAward.push({ name: "Game On", icon: "🎮" });
  if (!earned.has("Game Master") && uniqueGames >= 8) toAward.push({ name: "Game Master", icon: "🕹️" });
  if (!earned.has("S-Rank") && topScore >= 95) toAward.push({ name: "S-Rank", icon: "⭐" });
  if (!earned.has("Straight A's") && aRankGames >= 5) toAward.push({ name: "Straight A's", icon: "📊" });

  for (const badge of toAward) {
    await supabase.from("user_badges").insert({ user_id: userId, badge_name: badge.name, badge_icon: badge.icon });
    toast.success(`🏅 Badge unlocked: ${badge.icon} ${badge.name}!`, { duration: 4000 });
  }
};

const GamesZone = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | "Beginner" | "Intermediate">("All");
  const { earnGems } = useGameEconomy();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const dailyFeaturedGameId = getDailyFeaturedGame();

  const { data: personalBests } = useQuery({
    queryKey: ["personal-bests", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("games_played").select("game_id, score").eq("user_id", user!.id).order("score", { ascending: false });
      const bests: Record<string, number> = {};
      data?.forEach(row => {
        if (!bests[row.game_id] || (row.score ?? 0) > bests[row.game_id]) {
          bests[row.game_id] = row.score ?? 0;
        }
      });
      return bests;
    },
    enabled: !!user,
  });

  const { data: playedTodayData } = useQuery({
    queryKey: ["played-today", user?.id, dailyFeaturedGameId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("games_played").select("id").eq("user_id", user!.id).eq("game_id", dailyFeaturedGameId).gte("played_at", `${today}T00:00:00.000Z`);
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user,
  });
  const dailyGameCompleted = playedTodayData ?? false;

  const handleGameComplete = async (score: number) => {
    if (!user || !activeGame) return;
    await awardGameXP(user.id, activeGame, score);
    await checkAndAwardGameBadges(user.id, activeGame, score);
    queryClient.invalidateQueries({ queryKey: ["user-xp"] });
    queryClient.invalidateQueries({ queryKey: ["personal-bests"] });
    queryClient.invalidateQueries({ queryKey: ["played-today"] });
  };

  const isDaily = activeGame === dailyFeaturedGameId && !dailyGameCompleted;
  const gemsMultiplier = isDaily ? 2 : 1;

  const filteredGames = difficultyFilter === "All" ? games : games.filter(g => g.difficulty === difficultyFilter);
  const activeGameData = games.find((g) => g.id === activeGame);
  const ActiveComponent = activeGameData?.component;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Game Zone</h1>
        <p className="text-muted-foreground mt-1">8 interactive simulations — learn by making decisions, not answering quizzes</p>
      </motion.div>

      {!activeGame ? (
        <>
          {personalBests && Object.keys(personalBests).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <h3 className="font-extrabold font-display flex items-center gap-2 mb-4 text-base">
                <Trophy className="w-5 h-5 text-amber-500" /> My Game Stats
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold font-display text-primary">{Object.keys(personalBests).length}/8</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Games Played</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold font-display text-amber-500">{Math.max(...Object.values(personalBests))}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Top Score</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold font-display text-emerald-500">{Object.values(personalBests).filter(s => s >= 80).length}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">A+ Ranks</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-muted-foreground">Game Collection</span>
                  <span className="text-primary">{Object.keys(personalBests).length}/8 played</span>
                </div>
                <div className="flex gap-1">
                  {games.map(g => (
                    <div key={g.id} className={cn(
                      "flex-1 h-2.5 rounded-full transition-all",
                      personalBests[g.id] !== undefined
                        ? personalBests[g.id] >= 95 ? "bg-yellow-400"
                          : personalBests[g.id] >= 80 ? "bg-emerald-500"
                            : personalBests[g.id] >= 65 ? "bg-blue-400"
                              : "bg-amber-400"
                        : "bg-muted"
                    )} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {!dailyGameCompleted && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setActiveGame(dailyFeaturedGameId)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold opacity-80 uppercase tracking-wide mb-0.5">⚡ Daily Featured Game</p>
                  <p className="font-extrabold font-display text-lg">{games.find(g => g.id === dailyFeaturedGameId)?.title}</p>
                  <p className="text-xs opacity-80 mt-0.5">Play today for 2× gems bonus!</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
                    <Diamond className="w-5 h-5 fill-white mx-auto mb-0.5" />
                    <p className="text-xs font-extrabold">2× GEMS</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {dailyGameCompleted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-700">Daily game completed!</p>
                <p className="text-xs text-emerald-600">Come back tomorrow for a new featured game and 2× gems.</p>
              </div>
            </div>
          )}

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
                {personalBests?.[id] !== undefined ? (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      🏆 Best: {personalBests[id]}/100
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      personalBests[id] >= 95 ? "bg-yellow-100 text-yellow-700"
                        : personalBests[id] >= 80 ? "bg-emerald-100 text-emerald-700"
                          : personalBests[id] >= 65 ? "bg-blue-100 text-blue-700"
                            : "bg-muted text-muted-foreground"
                    )}>
                      {getGrade(personalBests[id])}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2 italic">No score yet — be the first!</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">{rounds}</span>
                  <span className="text-xs font-bold text-cyan-600 flex items-center gap-0.5">
                    <Diamond className="w-3 h-3 fill-current" /> Up to {maxGems} gems
                  </span>
                  {id === dailyFeaturedGameId && !dailyGameCompleted && (
                    <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-lg">2× TODAY</span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => { setActiveGame(null); }} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to games
          </button>
          <div className="bg-card rounded-2xl border border-border p-6 card-shadow">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-display font-extrabold text-xl">{activeGameData?.title}</h2>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary">{activeGameData?.difficulty}</span>
              {isDaily && <span className="text-[10px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-lg">2× GEMS TODAY</span>}
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground font-medium">What you'll learn: {activeGameData?.learn}</p>
              <span className="text-xs font-bold text-cyan-600 flex items-center gap-0.5">
                <Diamond className="w-3 h-3 fill-cyan-500" /> Up to {(activeGameData?.maxGems ?? 30) * gemsMultiplier} gems
              </span>
            </div>
            {ActiveComponent && <ActiveComponent earnGems={earnGems} onComplete={handleGameComplete} personalBest={personalBests?.[activeGame ?? ""] ?? null} gemsMultiplier={gemsMultiplier} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default GamesZone;
