import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2, Star, Diamond, Zap, Calendar, Trophy, ChevronDown, ChevronUp, Crown, Flame, Gamepad2, Brain, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

interface QuestDef {
  text: string;
  xpReward: number;
  coinReward: number;
  type: string;
  target: number;
  icon: typeof Target;
  premium?: boolean;
  bonusReward?: string;
}

const dailyQuests: QuestDef[] = [
  { text: "Complete 1 lesson", xpReward: 25, coinReward: 10, type: "lesson_count", target: 1, icon: CheckCircle2 },
  { text: "Score 80%+ on a quiz", xpReward: 30, coinReward: 15, type: "quiz_80", target: 1, icon: Star },
  { text: "Complete the Daily Challenge", xpReward: 35, coinReward: 20, type: "daily_challenge", target: 1, icon: Brain },
  { text: "Play 1 financial game", xpReward: 20, coinReward: 10, type: "game_played", target: 1, icon: Gamepad2 },
];

const weeklyQuests: QuestDef[] = [
  { text: "Complete 5 lessons", xpReward: 150, coinReward: 50, type: "lesson_count_week", target: 5, icon: CheckCircle2, premium: true, bonusReward: "1 Streak Freeze" },
  { text: "Maintain a 7-day streak", xpReward: 200, coinReward: 100, type: "streak_week", target: 7, icon: Flame },
  { text: "Score 90%+ on 3 quizzes", xpReward: 100, coinReward: 75, type: "quiz_90_week", target: 3, icon: Star },
  { text: "Complete 1 full module", xpReward: 300, coinReward: 150, type: "module_complete_week", target: 1, icon: Trophy, premium: true, bonusReward: "Exclusive badge" },
];

const monthlyQuests: QuestDef[] = [
  { text: "Complete 3 modules", xpReward: 1000, coinReward: 500, type: "modules_month", target: 3, icon: Crown, bonusReward: "3-day Premium trial" },
];

const Quests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { earnGems, awardXP } = useGameEconomy();
  const { isPremium } = usePremiumAccess();
  const [dailyOpen, setDailyOpen] = useState(true);
  const [weeklyOpen, setWeeklyOpen] = useState(true);
  const [monthlyOpen, setMonthlyOpen] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const getWeekStart = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split("T")[0];
  };
  const weekStart = getWeekStart();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["quest-progress-v2", user?.id, today],
    queryFn: async () => {
      const startOfDay = `${today}T00:00:00.000Z`;
      const startOfWeek = `${weekStart}T00:00:00.000Z`;
      const startOfMonth = `${currentMonth}-01T00:00:00.000Z`;
      const [xpToday, xpWeek, streak, dailyChallenge, progress, gamesPlayed, xpMonth] = await Promise.all([
        supabase.from("user_xp").select("xp_amount, source").eq("user_id", user!.id).gte("earned_at", startOfDay),
        supabase.from("user_xp").select("xp_amount, source, source_id").eq("user_id", user!.id).gte("earned_at", startOfWeek),
        supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user!.id).maybeSingle(),
        supabase.from("daily_challenges").select("completed").eq("user_id", user!.id).eq("challenge_date", today).maybeSingle(),
        supabase.from("user_progress").select("score, lesson_id").eq("user_id", user!.id).eq("completed", true),
        supabase.from("games_played").select("id").eq("user_id", user!.id).gte("played_at", startOfDay),
        supabase.from("user_xp").select("xp_amount, source, source_id").eq("user_id", user!.id).gte("earned_at", startOfMonth),
      ]);

      const todayXp = xpToday.data ?? [];
      const weekXp = xpWeek.data ?? [];
      const monthXp = xpMonth.data ?? [];

      return {
        lessonsToday: todayXp.filter(x => x.source === "lesson").length,
        lessonsWeek: weekXp.filter(x => x.source === "lesson").length,
        currentStreak: streak.data?.current_streak ?? 0,
        dailyChallengeComplete: dailyChallenge.data?.completed ?? false,
        gamesPlayedToday: gamesPlayed.data?.length ?? 0,
        // Count quiz scores >=80% today
        quiz80Today: (progress.data ?? []).filter(p => p.score !== null && p.score >= 4).length > 0 ? 1 : 0,
        // Count quiz scores >=90% this week
        quiz90Week: (progress.data ?? []).filter(p => p.score !== null && p.score >= 5).length,
        // Module completions this week
        moduleCompleteWeek: weekXp.filter(x => x.source === "unit-quiz").length,
        // Module completions this month
        moduleCompleteMonth: monthXp.filter(x => x.source === "unit-quiz").length,
      };
    },
    enabled: !!user,
  });

  const getProgress = (type: string, target: number): number => {
    if (!progressData) return 0;
    switch (type) {
      case "lesson_count": return Math.min(progressData.lessonsToday, target);
      case "quiz_80": return Math.min(progressData.quiz80Today, target);
      case "daily_challenge": return progressData.dailyChallengeComplete ? 1 : 0;
      case "game_played": return Math.min(progressData.gamesPlayedToday, target);
      case "lesson_count_week": return Math.min(progressData.lessonsWeek, target);
      case "streak_week": return Math.min(progressData.currentStreak, target);
      case "quiz_90_week": return Math.min(progressData.quiz90Week, target);
      case "module_complete_week": return Math.min(progressData.moduleCompleteWeek, target);
      case "modules_month": return Math.min(progressData.moduleCompleteMonth, target);
      default: return 0;
    }
  };

  const getClaimedKey = (text: string, period: string) => `finova_quest_v2_${period}_${text}`;
  const isClaimed = (text: string, period: string) => localStorage.getItem(getClaimedKey(text, period)) === "true";
  const markClaimed = (text: string, period: string) => localStorage.setItem(getClaimedKey(text, period), "true");

  const claimQuest = async (quest: QuestDef, period: string) => {
    await earnGems(quest.coinReward);
    await awardXP(quest.xpReward, "quest");
    markClaimed(quest.text, period);
    toast.success(`Quest completed! +${quest.xpReward} XP, +${quest.coinReward} gems 💎`);
    queryClient.invalidateQueries({ queryKey: ["quest-progress-v2"] });
  };

  const countCompleted = (quests: QuestDef[], period: string) =>
    quests.filter(q => isClaimed(q.text, period)).length;

  const dailyCompleted = countCompleted(dailyQuests, today);
  const weeklyCompleted = countCompleted(weeklyQuests, weekStart);
  const monthlyCompleted = countCompleted(monthlyQuests, currentMonth);
  const totalCompleted = dailyCompleted + weeklyCompleted + monthlyCompleted;
  const totalQuests = dailyQuests.length + weeklyQuests.length + monthlyQuests.length;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-pulse text-muted-foreground">Loading quests...</div></div>;
  }

  const renderQuest = (quest: QuestDef, period: string, accentClass: string) => {
    const prog = getProgress(quest.type, quest.target);
    const pct = Math.min((prog / quest.target) * 100, 100);
    const achieved = prog >= quest.target;
    const claimed = isClaimed(quest.text, period);
    const QIcon = quest.icon;

    return (
      <motion.div
        key={quest.text}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "rounded-2xl p-4 border-2 transition-all",
          claimed ? "bg-muted/50 border-primary/20 opacity-70" :
          achieved ? "bg-primary/5 border-primary/30 shadow-sm" :
          "bg-card border-border"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            claimed ? "bg-primary/20" : achieved ? "bg-primary/10" : "bg-muted"
          )}>
            {claimed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <QIcon className={cn("w-5 h-5", achieved ? "text-primary" : "text-muted-foreground")} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("text-sm font-bold", claimed && "line-through text-muted-foreground")}>{quest.text}</p>
              {quest.premium && (
                <span className="text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5" /> PLUS
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Zap className="w-3 h-3" /> +{quest.xpReward} XP
              </span>
              <span className="text-xs font-bold text-cyan-600 flex items-center gap-1">
                <Diamond className="w-3 h-3 fill-cyan-500 text-cyan-500" /> +{quest.coinReward}
              </span>
              {quest.bonusReward && (
                <span className="text-[10px] font-bold text-amber-600">+{quest.bonusReward}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={pct} className="h-2 flex-1" />
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{prog}/{quest.target}</span>
            </div>
          </div>
          {!claimed && achieved && (
            <Button size="sm" className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 mt-1"
              onClick={() => claimQuest(quest, period)}>
              Claim
            </Button>
          )}
          {claimed && (
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-2" />
          )}
        </div>
      </motion.div>
    );
  };

  const SectionHeader = ({
    icon: Icon, title, count, total, open, onToggle, iconColor, badgeBg, badgeText
  }: {
    icon: any; title: string; count: number; total: number; open: boolean; onToggle: () => void;
    iconColor: string; badgeBg: string; badgeText: string;
  }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-1 group">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-5 h-5", iconColor)} />
        <h2 className="font-extrabold font-display text-lg">{title}</h2>
        <Badge className={cn("text-xs", badgeBg, badgeText, "border-0")}>
          {count}/{total}
        </Badge>
      </div>
      {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-foreground flex items-center gap-3">
          <Target className="w-7 h-7 text-primary" />
          Quests
        </h1>
        <p className="text-muted-foreground mt-1">Complete missions to earn XP, gems, and rewards!</p>
      </motion.div>

      {/* Summary Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold">Quests Completed</p>
            <p className="text-xs text-muted-foreground">Keep pushing to unlock all rewards</p>
          </div>
          <div className="text-3xl font-extrabold font-display text-primary">{totalCompleted}<span className="text-lg text-muted-foreground">/{totalQuests}</span></div>
        </div>
        <Progress value={(totalCompleted / totalQuests) * 100} className="h-3" />
      </motion.div>

      {/* Daily Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-3">
        <SectionHeader
          icon={Zap} title="Daily" count={dailyCompleted} total={dailyQuests.length}
          open={dailyOpen} onToggle={() => setDailyOpen(!dailyOpen)}
          iconColor="text-amber-500" badgeBg="bg-amber-100" badgeText="text-amber-700"
        />
        <AnimatePresence>
          {dailyOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden">
              {dailyQuests.map(q => renderQuest(q, today, "amber"))}
              <p className="text-[10px] text-muted-foreground text-center">Resets at midnight</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Weekly Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-3">
        <SectionHeader
          icon={Calendar} title="Weekly" count={weeklyCompleted} total={weeklyQuests.length}
          open={weeklyOpen} onToggle={() => setWeeklyOpen(!weeklyOpen)}
          iconColor="text-blue-500" badgeBg="bg-blue-100" badgeText="text-blue-700"
        />
        <AnimatePresence>
          {weeklyOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden">
              {weeklyQuests.map(q => renderQuest(q, weekStart, "blue"))}
              <p className="text-[10px] text-muted-foreground text-center">Resets every Monday</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Monthly Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-3">
        <SectionHeader
          icon={Trophy} title="Monthly" count={monthlyCompleted} total={monthlyQuests.length}
          open={monthlyOpen} onToggle={() => setMonthlyOpen(!monthlyOpen)}
          iconColor="text-purple-500" badgeBg="bg-purple-100" badgeText="text-purple-700"
        />
        <AnimatePresence>
          {monthlyOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden">
              {monthlyQuests.map(q => renderQuest(q, currentMonth, "purple"))}
              <p className="text-[10px] text-muted-foreground text-center">Resets on the 1st of each month</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats */}
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
              <p className="text-lg font-extrabold font-display">{progressData.lessonsWeek}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Lessons This Week</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{progressData.currentStreak}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Current Streak</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{progressData.gamesPlayedToday}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Games Today</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Quests;
