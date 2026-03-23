import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Trophy, Medal, Crown, Shield, Star, Zap, TrendingUp, ChevronUp, Flame, Lock, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const LEAGUES = [
  { name: "Bronze", minXp: 0, color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300", icon: Shield },
  { name: "Silver", minXp: 300, color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-300", icon: Shield },
  { name: "Gold", minXp: 800, color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-300", icon: Star },
  { name: "Diamond", minXp: 1500, color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-300", icon: Zap },
  { name: "Platinum", minXp: 3000, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-300", icon: Crown, premium: true },
];

const getLeague = (xp: number, isPremium: boolean) => {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].minXp) {
      if (LEAGUES[i].premium && !isPremium) continue;
      return { ...LEAGUES[i], index: i };
    }
  }
  return { ...LEAGUES[0], index: 0 };
};

const getNextLeague = (xp: number, isPremium: boolean) => {
  const current = getLeague(xp, isPremium);
  const nextIdx = current.index + 1;
  if (nextIdx >= LEAGUES.length) return null;
  if (LEAGUES[nextIdx].premium && !isPremium) return null;
  return LEAGUES[nextIdx];
};

const FAKE_USERS = [
  { name: "Jordan M.", xp: 2850 }, { name: "Priya K.", xp: 2400 }, { name: "Marcus W.", xp: 2100 },
  { name: "Sofia R.", xp: 1950 }, { name: "Tyler J.", xp: 1800 }, { name: "Aisha N.", xp: 1650 },
  { name: "Chris L.", xp: 1500 }, { name: "Emma D.", xp: 1350 }, { name: "Darius H.", xp: 1200 },
  { name: "Luna P.", xp: 1050 }, { name: "Jake F.", xp: 900 }, { name: "Mia C.", xp: 780 },
  { name: "Noah B.", xp: 650 }, { name: "Zara T.", xp: 520 }, { name: "Liam G.", xp: 410 },
  { name: "Chloe V.", xp: 330 }, { name: "Omar S.", xp: 250 }, { name: "Ava W.", xp: 180 },
  { name: "Ethan Q.", xp: 100 }, { name: "Ivy X.", xp: 45 },
];

const Rankings = () => {
  const { user } = useAuth();
  const { weeklyXp, currentStreak, level } = useGameEconomy();
  const { isPremium } = usePremiumAccess();

  const { data: profile } = useQuery({
    queryKey: ["profile-name", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("display_name").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const currentLeague = getLeague(weeklyXp, isPremium);
  const nextLeague = getNextLeague(weeklyXp, isPremium);
  const progressToNext = nextLeague
    ? ((weeklyXp - currentLeague.minXp) / (nextLeague.minXp - currentLeague.minXp)) * 100
    : 100;

  // Build leaderboard with user inserted
  const leaderboard = useMemo(() => {
    const userEntry = { name: "You", xp: weeklyXp, isUser: true, premium: isPremium };
    const entries = FAKE_USERS.map(u => ({ ...u, isUser: false, premium: Math.random() > 0.8 }));
    entries.push(userEntry);
    entries.sort((a, b) => b.xp - a.xp);
    return entries;
  }, [weeklyXp, isPremium]);

  const userRank = leaderboard.findIndex(e => e.isUser) + 1;
  const LeagueIcon = currentLeague.icon;

  // Monday check for weekly results
  const isMonday = new Date().getDay() === 1;
  const [showWeeklyResult, setShowWeeklyResult] = useState(isMonday);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-foreground flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-500" />
          Rankings
        </h1>
        <p className="text-muted-foreground mt-1">Compete weekly — climb the leagues!</p>
      </motion.div>

      {/* Weekly Result Banner (Monday) */}
      {showWeeklyResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20 p-5 text-center relative">
          <button onClick={() => setShowWeeklyResult(false)} className="absolute top-2 right-3 text-muted-foreground hover:text-foreground">×</button>
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-extrabold font-display text-lg">Last Week's Results</p>
          <p className="text-sm text-muted-foreground mt-1">You finished <span className="font-bold text-foreground">#{userRank}</span> in {currentLeague.name} League!</p>
          {userRank <= 10 && <p className="text-sm font-bold text-primary mt-1">🏆 Eligible for promotion!</p>}
        </motion.div>
      )}

      {/* Current League Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={cn("rounded-2xl border-2 p-6 card-shadow", currentLeague.border, currentLeague.bg)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", currentLeague.bg, "border-2", currentLeague.border)}>
              <LeagueIcon className={cn("w-8 h-8", currentLeague.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current League</p>
              <h2 className={cn("text-2xl font-extrabold font-display", currentLeague.color)}>{currentLeague.name}</h2>
              <p className="text-sm text-muted-foreground font-semibold">{weeklyXp.toLocaleString()} XP this week</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold font-display">#{userRank}</p>
            <p className="text-xs text-muted-foreground font-bold">Your Rank</p>
          </div>
        </div>
        {nextLeague ? (
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className={currentLeague.color}>{currentLeague.name}</span>
              <span className="text-muted-foreground">{nextLeague.minXp - weeklyXp} XP to {nextLeague.name}</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>
        ) : (
          <p className="font-extrabold text-center text-amber-600 font-display">👑 Highest League!</p>
        )}
      </motion.div>

      {/* League Ladder */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow">
        <h3 className="font-extrabold font-display flex items-center gap-2 mb-4">
          <ChevronUp className="w-5 h-5 text-primary" /> League Ladder
        </h3>
        <div className="space-y-2">
          {[...LEAGUES].reverse().map(league => {
            const isCurrent = league.name === currentLeague.name;
            const isReached = weeklyXp >= league.minXp && (!league.premium || isPremium);
            const LIcon = league.icon;
            return (
              <div key={league.name} className={cn(
                "rounded-xl p-3 flex items-center justify-between border transition-all",
                isCurrent ? cn(league.bg, "ring-2 ring-offset-1", league.border) :
                isReached ? cn(league.bg, "opacity-60") :
                "bg-muted/30 border-border opacity-40"
              )}>
                <div className="flex items-center gap-3">
                  <LIcon className={cn("w-5 h-5", isReached ? league.color : "text-muted-foreground")} />
                  <div>
                    <p className={cn("font-extrabold font-display text-sm flex items-center gap-1", isReached ? league.color : "text-muted-foreground")}>
                      {league.name}
                      {league.premium && <Lock className="w-3 h-3" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{league.minXp.toLocaleString()}+ XP/week</p>
                  </div>
                </div>
                {isCurrent && <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">YOU</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow">
        <h3 className="font-extrabold font-display flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-amber-500" /> This Week's Leaderboard
        </h3>
        <div className="space-y-1.5">
          {leaderboard.map((entry, i) => {
            const entryLeague = getLeague(entry.xp, entry.premium);
            return (
              <div key={i} className={cn(
                "rounded-xl p-3 flex items-center gap-3 transition-all",
                entry.isUser ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30",
                i < 3 ? "font-bold" : ""
              )}>
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0",
                  i === 0 ? "bg-yellow-400 text-yellow-900" :
                  i === 1 ? "bg-gray-300 text-gray-700" :
                  i === 2 ? "bg-amber-600 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </span>
                {(() => { const EIcon = entryLeague.icon; return <EIcon className={cn("w-5 h-5", entryLeague.color)} />; })()}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate flex items-center gap-1", entry.isUser && "text-primary")}>
                    {entry.isUser ? (profile?.display_name || "You") : entry.name}
                    {entry.premium && (
                      <span className="text-[8px] font-extrabold bg-amber-500 text-white px-1 rounded leading-tight">⭐</span>
                    )}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{entry.xp.toLocaleString()} XP</p>
                  <p className={cn("text-xs font-semibold", entryLeague.color)}>{entryLeague.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Promotion / Relegation info */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>Top 10 → <span className="font-bold text-primary">Promoted</span></span>
          </div>
          <div className="flex items-center gap-1">
            <span>Bottom 5 → <span className="font-bold text-destructive">Relegated</span></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Rankings;
