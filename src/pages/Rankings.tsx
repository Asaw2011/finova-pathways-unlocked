import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, ChevronUp, Crown, Shield, Flame, Star, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const TIERS = [
  { name: "Bronze", xp: 0, color: "bg-amber-700", textColor: "text-amber-700", bgLight: "bg-amber-100", icon: Shield },
  { name: "Silver", xp: 500, color: "bg-gray-400", textColor: "text-gray-500", bgLight: "bg-gray-100", icon: Shield },
  { name: "Gold", xp: 1500, color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-100", icon: Star },
  { name: "Diamond", xp: 4000, color: "bg-cyan-500", textColor: "text-cyan-600", bgLight: "bg-cyan-100", icon: Zap },
  { name: "Elite", xp: 8000, color: "bg-purple-600", textColor: "text-purple-600", bgLight: "bg-purple-100", icon: Flame },
  { name: "Titan", xp: 15000, color: "bg-red-600", textColor: "text-red-600", bgLight: "bg-red-100", icon: Trophy },
  { name: "Champion", xp: 30000, color: "bg-gradient-to-r from-amber-500 to-red-600", textColor: "text-amber-600", bgLight: "bg-amber-50", icon: Crown },
];

const getTier = (xp: number) => {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].xp) return { ...TIERS[i], index: i };
  }
  return { ...TIERS[0], index: 0 };
};

const getNextTier = (xp: number) => {
  for (let i = 0; i < TIERS.length; i++) {
    if (xp < TIERS[i].xp) return TIERS[i];
  }
  return null;
};

const Rankings = () => {
  const { user } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Get current user's monthly XP
  const { data: userXP } = useQuery({
    queryKey: ["user-xp-monthly", user?.id, currentMonth],
    queryFn: async () => {
      const startOfMonth = `${currentMonth}-01T00:00:00.000Z`;
      const { data } = await supabase
        .from("user_xp")
        .select("xp_amount")
        .eq("user_id", user!.id)
        .gte("earned_at", startOfMonth);
      return data?.reduce((sum, x) => sum + x.xp_amount, 0) ?? 0;
    },
    enabled: !!user,
  });

  // Get leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard", currentMonth],
    queryFn: async () => {
      const { data } = await supabase
        .from("monthly_rankings")
        .select("*")
        .eq("month", currentMonth)
        .order("xp_earned", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  // Get premium users for flair
  const { data: premiumUsers } = useQuery({
    queryKey: ["premium-users-rankings", leaderboard?.map(l => l.user_id)],
    queryFn: async () => {
      if (!leaderboard || leaderboard.length === 0) return new Set<string>();
      const userIds = leaderboard.map(l => l.user_id);
      const { data } = await supabase
        .from("user_subscriptions")
        .select("user_id")
        .in("user_id", userIds)
        .neq("plan", "free");
      return new Set(data?.map(s => s.user_id) ?? []);
    },
    enabled: !!leaderboard && leaderboard.length > 0,
  });

  // Get display names for leaderboard
  const { data: profiles } = useQuery({
    queryKey: ["leaderboard-profiles", leaderboard?.map(l => l.user_id)],
    queryFn: async () => {
      if (!leaderboard || leaderboard.length === 0) return [];
      const userIds = leaderboard.map(l => l.user_id);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      return data ?? [];
    },
    enabled: !!leaderboard && leaderboard.length > 0,
  });

  // Upsert current user's ranking
  useQuery({
    queryKey: ["upsert-ranking", user?.id, currentMonth, userXP],
    queryFn: async () => {
      if (userXP === undefined) return null;
      const tier = getTier(userXP);
      const existing = leaderboard?.find(r => r.user_id === user!.id);
      if (existing) {
        await supabase.from("monthly_rankings")
          .update({ xp_earned: userXP, tier: tier.name.toLowerCase(), updated_at: new Date().toISOString() })
          .eq("user_id", user!.id)
          .eq("month", currentMonth);
      } else {
        await supabase.from("monthly_rankings")
          .insert({ user_id: user!.id, month: currentMonth, xp_earned: userXP, tier: tier.name.toLowerCase() });
      }
      return null;
    },
    enabled: !!user && userXP !== undefined,
  });

  const monthlyXP = userXP ?? 0;
  const currentTier = getTier(monthlyXP);
  const nextTier = getNextTier(monthlyXP);
  const progressToNext = nextTier
    ? ((monthlyXP - currentTier.xp) / (nextTier.xp - currentTier.xp)) * 100
    : 100;

  const getProfileName = (userId: string) => {
    const p = profiles?.find(pr => pr.user_id === userId);
    return p?.display_name || "Anonymous Learner";
  };

  const userRank = leaderboard?.findIndex(r => r.user_id === user?.id);
  const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-foreground flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-500" />
          Rankings
        </h1>
        <p className="text-muted-foreground mt-1">Compete monthly — ranks reset each month. Climb the tiers!</p>
      </motion.div>

      {/* Current Tier Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{monthName}</p>
            <div className="flex items-center gap-3 mt-1">
              {(() => { const TierIcon = currentTier.icon; return <TierIcon className={cn("w-8 h-8", currentTier.textColor)} />; })()}
              <div>
                <h2 className={cn("text-2xl font-extrabold font-display", currentTier.textColor)}>{currentTier.name}</h2>
                <p className="text-sm text-muted-foreground font-semibold">{monthlyXP.toLocaleString()} XP this month</p>
              </div>
            </div>
          </div>
          {userRank !== undefined && userRank >= 0 && (
            <div className="text-center">
              <p className="text-3xl font-extrabold font-display">#{userRank + 1}</p>
              <p className="text-xs text-muted-foreground font-bold">Your Rank</p>
            </div>
          )}
        </div>

        {/* Progress to next tier */}
        {nextTier ? (
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className={currentTier.textColor}>{currentTier.name}</span>
              <span className="text-muted-foreground">{nextTier.xp - monthlyXP} XP to {nextTier.name}</span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="font-extrabold text-amber-600 font-display">👑 Maximum Rank Achieved!</p>
          </div>
        )}
      </motion.div>

      {/* All Tiers */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow">
        <h3 className="font-extrabold font-display flex items-center gap-2 mb-4">
          <ChevronUp className="w-5 h-5 text-primary" /> Tier Ladder
        </h3>
        <div className="space-y-2">
          {[...TIERS].reverse().map((tier, i) => {
            const isCurrentTier = tier.name === currentTier.name;
            const isReached = monthlyXP >= tier.xp;
            return (
              <div key={tier.name} className={cn(
                "rounded-xl p-3 flex items-center justify-between border transition-all",
                isCurrentTier ? `${tier.bgLight} border-current ring-2 ring-offset-1` : "",
                isReached && !isCurrentTier ? `${tier.bgLight} border-transparent opacity-70` : "",
                !isReached ? "bg-muted/30 border-border opacity-40" : ""
              )} style={isCurrentTier ? { borderColor: "currentColor" } : {}}>
                <div className="flex items-center gap-3">
                  {(() => { const TIcon = tier.icon; return <TIcon className={cn("w-5 h-5", isReached ? tier.textColor : "text-muted-foreground")} />; })()}
                  <div>
                    <p className={cn("font-extrabold font-display text-sm", isReached ? tier.textColor : "text-muted-foreground")}>{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{tier.xp.toLocaleString()} XP required</p>
                  </div>
                </div>
                {isCurrentTier && (
                  <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">YOU</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow">
        <h3 className="font-extrabold font-display flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-amber-500" /> Leaderboard — {monthName}
        </h3>
        {(!leaderboard || leaderboard.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-6">No rankings yet this month. Start earning XP!</p>
        ) : (
          <div className="space-y-1.5">
            {leaderboard.slice(0, 20).map((entry, i) => {
              const entryTier = getTier(entry.xp_earned);
              const isMe = entry.user_id === user?.id;
              return (
                <div key={entry.id} className={cn(
                  "rounded-xl p-3 flex items-center gap-3 transition-all",
                  isMe ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30",
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
                  {(() => { const EIcon = entryTier.icon; return <EIcon className={cn("w-5 h-5", entryTier.textColor)} />; })()}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold truncate flex items-center gap-1", isMe && "text-primary")}>
                      {isMe ? "You" : getProfileName(entry.user_id)}
                      {premiumUsers?.has(entry.user_id) && (
                        <span className="text-[8px] font-extrabold bg-amber-500 text-white px-1 rounded leading-tight">⭐</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{entry.xp_earned.toLocaleString()} XP</p>
                    <p className={cn("text-xs font-semibold", entryTier.textColor)}>{entryTier.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Rankings;
