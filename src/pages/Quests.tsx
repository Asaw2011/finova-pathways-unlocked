import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2, Star, Diamond, Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const dailyQuestSets = [
  [
    { text: "Complete 1 lesson today", reward: 15, type: "lesson_count", target: 1 },
    { text: "Score 100% on any quiz", reward: 20, type: "perfect_quiz", target: 1 },
    { text: "Complete your daily challenge", reward: 10, type: "daily_challenge", target: 1 },
  ],
  [
    { text: "Complete 2 lessons today", reward: 25, type: "lesson_count", target: 2 },
    { text: "Earn at least 20 XP today", reward: 15, type: "xp_today", target: 20 },
    { text: "Play any game in the Game Zone", reward: 10, type: "game_played", target: 1 },
  ],
  [
    { text: "Complete 1 lesson without losing a heart", reward: 20, type: "lesson_no_mistake", target: 1 },
    { text: "Complete your daily challenge", reward: 10, type: "daily_challenge", target: 1 },
    { text: "Earn 30 XP today", reward: 20, type: "xp_today", target: 30 },
  ],
  [
    { text: "Complete 3 lessons today", reward: 35, type: "lesson_count", target: 3 },
    { text: "Score 100% on any quiz", reward: 20, type: "perfect_quiz", target: 1 },
    { text: "Check your progress on the Rankings page", reward: 5, type: "page_visit", target: 1 },
  ],
  [
    { text: "Complete 2 lessons today", reward: 25, type: "lesson_count", target: 2 },
    { text: "Play 2 different games", reward: 20, type: "game_played", target: 2 },
    { text: "Earn 50 XP today", reward: 30, type: "xp_today", target: 50 },
  ],
  [
    { text: "Complete a full unit (all lessons + quiz)", reward: 75, type: "unit_complete", target: 1 },
    { text: "Complete your daily challenge", reward: 10, type: "daily_challenge", target: 1 },
    { text: "Score 100% on 2 quizzes", reward: 30, type: "perfect_quiz", target: 2 },
  ],
  [
    { text: "Review any lesson you've completed", reward: 10, type: "lesson_count", target: 1 },
    { text: "Earn any amount of XP today", reward: 10, type: "xp_today", target: 10 },
    { text: "Complete your daily challenge", reward: 15, type: "daily_challenge", target: 1 },
  ],
];

const weeklyQuests = [
  { text: "Complete 10 lessons this week", reward: 50, type: "lesson_count_week", target: 10 },
  { text: "Maintain a 5-day learning streak", reward: 60, type: "streak_week", target: 5 },
  { text: "Earn 100 XP this week", reward: 40, type: "xp_week", target: 100 },
];

const monthlyQuestDefs = [
  { text: "Complete an entire course unit (all lessons in one section)", reward: 75 },
  { text: "Achieve a 14-day learning streak", reward: 100 },
  { text: "Score 100% on 5 different lesson quizzes", reward: 80 },
];

const Quests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { earnGems } = useGameEconomy();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date().getDay(); // 0=Sun...6=Sat
  const todayDailyQuests = dailyQuestSets[dayOfWeek];

  // Get start of current week (Monday)
  const getWeekStart = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };
  const weekStart = getWeekStart();

  const { data: quests, isLoading } = useQuery({
    queryKey: ["quests", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("quests")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  // Ensure monthly quests exist
  const { data: monthQuests } = useQuery({
    queryKey: ["monthly-quests", user?.id, currentMonth],
    queryFn: async () => {
      const existing = quests?.filter(q => q.quest_type === "monthly" && q.quest_date?.startsWith(currentMonth));
      if (existing && existing.length > 0) return existing;

      const firstOfMonth = `${currentMonth}-01`;
      const inserts = monthlyQuestDefs.map(mq => ({
        user_id: user!.id,
        quest_type: "monthly" as const,
        quest_text: mq.text,
        quest_date: firstOfMonth,
        reward_gems: mq.reward,
      }));
      const { data } = await supabase.from("quests").insert(inserts).select();
      return data ?? [];
    },
    enabled: !!user && !!quests,
  });

  // Progress data
  const { data: progressData } = useQuery({
    queryKey: ["quest-progress", user?.id, today],
    queryFn: async () => {
      const startOfDay = `${today}T00:00:00.000Z`;
      const [xpToday, xpWeek, streak, dailyChallenge, progress] = await Promise.all([
        supabase.from("user_xp").select("xp_amount, source").eq("user_id", user!.id).gte("earned_at", startOfDay),
        supabase.from("user_xp").select("xp_amount, source").eq("user_id", user!.id).gte("earned_at", `${weekStart}T00:00:00.000Z`),
        supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user!.id).maybeSingle(),
        supabase.from("daily_challenges").select("completed").eq("user_id", user!.id).eq("challenge_date", today).maybeSingle(),
        supabase.from("user_progress").select("score, lesson_id").eq("user_id", user!.id).eq("completed", true),
      ]);

      const todayXpRecords = xpToday.data ?? [];
      const weekXpRecords = xpWeek.data ?? [];

      const lessonsToday = todayXpRecords.filter(x => x.source === "lesson").length;
      const xpTodayTotal = todayXpRecords.reduce((s, x) => s + x.xp_amount, 0);
      const lessonsWeek = weekXpRecords.filter(x => x.source === "lesson").length;
      const xpWeekTotal = weekXpRecords.reduce((s, x) => s + x.xp_amount, 0);
      const currentStreak = streak.data?.current_streak ?? 0;
      const longestStreak = Math.max(currentStreak, streak.data?.longest_streak ?? 0);
      const dailyChallengeComplete = dailyChallenge.data?.completed ?? false;
      const perfectScores = progress.data?.filter(p => p.score !== null && p.score >= 5).length ?? 0;

      return {
        lessonsToday,
        xpTodayTotal,
        lessonsWeek,
        xpWeekTotal,
        currentStreak,
        longestStreak,
        dailyChallengeComplete,
        perfectScores,
      };
    },
    enabled: !!user,
  });

  const getProgress = (type: string, target: number): number => {
    if (!progressData) return 0;
    switch (type) {
      case "lesson_count": return Math.min(progressData.lessonsToday, target);
      case "xp_today": return Math.min(progressData.xpTodayTotal, target);
      case "daily_challenge": return progressData.dailyChallengeComplete ? 1 : 0;
      case "perfect_quiz": return Math.min(progressData.perfectScores, target);
      case "game_played": return 0; // Would need games_played table query
      case "lesson_no_mistake": return Math.min(progressData.lessonsToday, target);
      case "page_visit": return 1; // They're on quests page
      case "unit_complete": return 0;
      case "lesson_count_week": return Math.min(progressData.lessonsWeek, target);
      case "streak_week": return Math.min(progressData.currentStreak, target);
      case "xp_week": return Math.min(progressData.xpWeekTotal, target);
      default: return 0;
    }
  };

  const isMonthlyAchieved = (questText: string): boolean => {
    if (!progressData) return false;
    if (questText.includes("entire course unit")) return false; // complex check
    if (questText.includes("14-day")) return progressData.longestStreak >= 14;
    if (questText.includes("100% on 5")) return progressData.perfectScores >= 5;
    return false;
  };

  // Track claimed daily/weekly quests in localStorage
  const getClaimedKey = (questText: string, period: string) => `monucate_quest_${period}_${questText}`;
  const isClaimed = (questText: string, period: string) => localStorage.getItem(getClaimedKey(questText, period)) === "true";
  const markClaimed = (questText: string, period: string) => localStorage.setItem(getClaimedKey(questText, period), "true");

  const claimDailyQuest = async (quest: typeof todayDailyQuests[0]) => {
    await earnGems(quest.reward);
    markClaimed(quest.text, today);
    toast.success(`Quest completed! +${quest.reward} gems 💎`);
    queryClient.invalidateQueries({ queryKey: ["quest-progress"] });
  };

  const completeMonthlyQuest = useMutation({
    mutationFn: async (questId: string) => {
      const quest = monthQuests?.find(q => q.id === questId);
      if (!quest || quest.completed) return;
      await supabase.from("quests").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", questId);
      await earnGems(quest.reward_gems);
      toast.success(`Quest completed! +${quest.reward_gems} gems 💎`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-quests"] });
    },
  });

  const claimWeeklyQuest = async (quest: typeof weeklyQuests[0]) => {
    await earnGems(quest.reward);
    markClaimed(quest.text, weekStart);
    toast.success(`Quest completed! +${quest.reward} gems 💎`);
    queryClient.invalidateQueries({ queryKey: ["quest-progress"] });
  };

  // Count completed
  const dailyCompleted = todayDailyQuests.filter(q => {
    const prog = getProgress(q.type, q.target);
    return (prog >= q.target && isClaimed(q.text, today));
  }).length;

  const weeklyCompleted = weeklyQuests.filter(q => {
    const prog = getProgress(q.type, q.target);
    return (prog >= q.target && isClaimed(q.text, weekStart));
  }).length;

  const monthlyCompleted = monthQuests?.filter(q => q.completed).length ?? 0;
  const totalQuests = todayDailyQuests.length + weeklyQuests.length + (monthQuests?.length ?? 3);
  const totalCompleted = dailyCompleted + weeklyCompleted + monthlyCompleted;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading quests...</div></div>;
  }

  const renderQuestItem = (
    questText: string,
    reward: number,
    type: string,
    target: number,
    claimed: boolean,
    canClaim: boolean,
    onClaim: () => void,
    color: string
  ) => {
    const prog = getProgress(type, target);
    const progressPct = Math.min((prog / target) * 100, 100);
    const achieved = prog >= target;

    return (
      <div key={questText} className={cn(
        "rounded-xl p-4 border-2 transition-all",
        claimed ? `bg-${color}-50 border-${color}-200` : achieved ? "bg-emerald-50 border-emerald-300" : "bg-background border-border"
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            {claimed ? (
              <CheckCircle2 className={`w-5 h-5 text-${color}-500 shrink-0`} />
            ) : achieved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{questText}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Diamond className="w-3 h-3 text-cyan-500 fill-cyan-500" />
                <span className="text-xs font-bold text-cyan-600">+{reward} gems</span>
              </div>
            </div>
          </div>
          {!claimed && achieved && canClaim && (
            <Button size="sm" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0" onClick={onClaim}>
              Claim
            </Button>
          )}
          {claimed && (
            <span className={`text-xs font-bold text-${color}-500 bg-${color}-100 px-2 py-1 rounded-lg`}>Claimed ✓</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progressPct} className="h-2 flex-1" />
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{prog}/{target}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-foreground flex items-center gap-3">
          <Target className="w-7 h-7 text-primary" />
          Quests
        </h1>
        <p className="text-muted-foreground mt-1">Complete quests to earn gems and rewards!</p>
      </motion.div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card rounded-2xl border border-border p-4 card-shadow flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Today's Progress</p>
          <p className="text-xs text-muted-foreground">You've completed {totalCompleted}/{totalQuests} quests</p>
        </div>
        <div className="text-2xl font-extrabold font-display text-primary">{totalCompleted}/{totalQuests}</div>
      </motion.div>

      {/* Daily Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Daily Quests
          </h2>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
            {dailyCompleted}/{todayDailyQuests.length} done
          </Badge>
        </div>
        {todayDailyQuests.map(q => {
          const claimed = isClaimed(q.text, today);
          const prog = getProgress(q.type, q.target);
          return renderQuestItem(q.text, q.reward, q.type, q.target, claimed, prog >= q.target, () => claimDailyQuest(q), "amber");
        })}
      </motion.div>

      {/* Weekly Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Weekly Quests
          </h2>
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
            {weeklyCompleted}/{weeklyQuests.length} done
          </Badge>
        </div>
        {weeklyQuests.map(q => {
          const claimed = isClaimed(q.text, weekStart);
          const prog = getProgress(q.type, q.target);
          return renderQuestItem(q.text, q.reward, q.type, q.target, claimed, prog >= q.target, () => claimWeeklyQuest(q), "blue");
        })}
      </motion.div>

      {/* Monthly Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            {new Date().toLocaleString("default", { month: "long" })} Challenges
          </h2>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
            {monthlyCompleted}/{monthQuests?.length ?? 3} done
          </Badge>
        </div>
        {monthQuests?.map(quest => {
          const achieved = isMonthlyAchieved(quest.quest_text);
          return (
            <div key={quest.id} className={cn(
              "rounded-xl p-4 border-2 transition-all",
              quest.completed ? "bg-purple-50 border-purple-200" : achieved ? "bg-emerald-50 border-emerald-300" : "bg-background border-border"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {quest.completed ? <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> :
                   achieved ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> :
                   <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                  <div>
                    <p className="text-sm font-bold">{quest.quest_text}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Diamond className="w-3 h-3 text-cyan-500 fill-cyan-500" />
                      <span className="text-xs font-bold text-cyan-600">+{quest.reward_gems} gems</span>
                    </div>
                  </div>
                </div>
                {!quest.completed && achieved && (
                  <Button size="sm" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    onClick={() => completeMonthlyQuest.mutate(quest.id)} disabled={completeMonthlyQuest.isPending}>
                    Claim
                  </Button>
                )}
                {quest.completed && <span className="text-xs font-bold text-purple-500 bg-purple-100 px-2 py-1 rounded-lg">Claimed ✓</span>}
              </div>
            </div>
          );
        })}

        {monthQuests && monthQuests.length > 0 && monthQuests.every(q => q.completed) && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
            <p className="text-2xl mb-1">🏅</p>
            <p className="font-extrabold font-display">Monthly Quest Champion!</p>
            <p className="text-xs opacity-80">You completed all quests for {new Date().toLocaleString("default", { month: "long" })}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Progress hints */}
      {progressData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl border border-border p-5 card-shadow">
          <h3 className="font-bold text-sm mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{progressData.lessonsToday}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Lessons Today</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{progressData.xpTodayTotal}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">XP Today</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{progressData.currentStreak}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Current Streak</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{progressData.perfectScores}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Perfect Quizzes</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Quests;
