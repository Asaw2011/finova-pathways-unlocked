import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2, Star, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// 3 harder monthly quests — all completable in-app
const monthlyQuests = [
  { text: "Complete an entire course unit (all lessons in one section)", reward: 75 },
  { text: "Achieve a 14-day learning streak", reward: 100 },
  { text: "Score 100% on 5 different lesson quizzes", reward: 80 },
];

const Quests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { earnGems } = useGameEconomy();

  const currentMonth = new Date().toISOString().slice(0, 7);

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

  // Generate monthly quests if none exist for this month
  const { data: monthQuests } = useQuery({
    queryKey: ["monthly-quests", user?.id, currentMonth],
    queryFn: async () => {
      const existing = quests?.filter(
        (q) => q.quest_type === "monthly" && q.quest_date?.startsWith(currentMonth)
      );
      if (existing && existing.length > 0) return existing;

      const firstOfMonth = `${currentMonth}-01`;
      const inserts = monthlyQuests.map((mq) => ({
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

  // Auto-check quest completion against real data
  const { data: questProgress } = useQuery({
    queryKey: ["quest-progress", user?.id, currentMonth],
    queryFn: async () => {
      // Check streak
      const { data: streak } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user!.id)
        .maybeSingle();

      // Check perfect quiz scores
      const { data: progress } = await supabase
        .from("user_progress")
        .select("score, lesson_id")
        .eq("user_id", user!.id)
        .eq("completed", true);

      // Check unit completions (all lessons in a module completed)
      const { data: modules } = await supabase
        .from("modules")
        .select("id, lessons(id)");

      const completedLessonIds = new Set(progress?.map(p => p.lesson_id) ?? []);
      const completedUnits = modules?.filter(m => 
        m.lessons.length > 0 && m.lessons.every((l: any) => completedLessonIds.has(l.id))
      ).length ?? 0;

      const perfectScores = progress?.filter(p => {
        // Check if score represents 100% (5/5 quiz = score of 5)
        return p.score !== null && p.score >= 5;
      }).length ?? 0;

      const longestStreak = Math.max(streak?.current_streak ?? 0, streak?.longest_streak ?? 0);

      return { completedUnits, longestStreak, perfectScores };
    },
    enabled: !!user,
  });

  const completeQuest = useMutation({
    mutationFn: async (questId: string) => {
      const quest = monthQuests?.find((q) => q.id === questId);
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

  // Determine which quests are achievable based on progress
  const isQuestAchieved = (questText: string): boolean => {
    if (!questProgress) return false;
    if (questText.includes("entire course unit")) return questProgress.completedUnits >= 1;
    if (questText.includes("14-day")) return questProgress.longestStreak >= 14;
    if (questText.includes("100% on 5")) return questProgress.perfectScores >= 5;
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading quests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-foreground flex items-center gap-3">
          <Target className="w-7 h-7 text-primary" />
          Monthly Quests
        </h1>
        <p className="text-muted-foreground mt-1">Complete all 3 quests this month for a rare badge!</p>
      </motion.div>

      {/* Monthly Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            {new Date().toLocaleString("default", { month: "long" })} Challenges
          </h2>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
            {monthQuests?.filter(q => q.completed).length ?? 0}/{monthQuests?.length ?? 3} done
          </Badge>
        </div>

        <div className="space-y-3">
          {monthQuests?.map((quest) => {
            const achieved = isQuestAchieved(quest.quest_text);
            return (
              <div key={quest.id} className={cn(
                "rounded-xl p-4 border-2 transition-all",
                quest.completed
                  ? "bg-purple-50 border-purple-200"
                  : achieved
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-background border-border"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {quest.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                    ) : achieved ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-bold">{quest.quest_text}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Diamond className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500" />
                        <span className="text-xs font-bold text-cyan-600">+{quest.reward_gems} gems</span>
                      </div>
                    </div>
                  </div>
                  {!quest.completed && achieved && (
                    <Button size="sm" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                      onClick={() => completeQuest.mutate(quest.id)}
                      disabled={completeQuest.isPending}>
                      Claim
                    </Button>
                  )}
                  {quest.completed && (
                    <span className="text-xs font-bold text-purple-500 bg-purple-100 px-2 py-1 rounded-lg">Claimed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Monthly completion badge */}
        {monthQuests && monthQuests.length > 0 && monthQuests.every((q) => q.completed) && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
            <p className="text-2xl mb-1">🏅</p>
            <p className="font-extrabold font-display">Monthly Quest Champion!</p>
            <p className="text-xs opacity-80">You completed all quests for {new Date().toLocaleString("default", { month: "long" })}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Progress hints */}
      {questProgress && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border p-5 card-shadow">
          <h3 className="font-bold text-sm mb-3">Your Progress</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{questProgress.completedUnits}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Units Done</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{questProgress.longestStreak}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Best Streak</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-lg font-extrabold font-display">{questProgress.perfectScores}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">Perfect Quizzes</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Quests;
