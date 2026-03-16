import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2, Calendar, Star, Lock, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Badge } from "@/components/ui/badge";

const dailyQuestPool = [
  { text: "Complete 1 lesson today", reward: 5 },
  { text: "Get 3 quiz questions right in a row", reward: 10 },
  { text: "Review 2 mistakes from the Mistakes section", reward: 5 },
  { text: "Spend less than 5 minutes deciding on a purchase", reward: 5 },
  { text: "Learn what APY stands for", reward: 5 },
  { text: "Name 3 differences between needs and wants", reward: 5 },
  { text: "Calculate your weekly spending", reward: 10 },
  { text: "Explain the 50/30/20 rule to someone", reward: 10 },
];

const monthlyQuests = [
  { text: "Complete all lessons in a section", reward: 50 },
  { text: "Maintain a 7-day streak", reward: 30 },
  { text: "Earn 500 XP this month", reward: 40 },
  { text: "Review all your mistakes", reward: 25 },
  { text: "Complete 3 unit quizzes", reward: 60 },
];

const Quests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { earnGems, isPro } = useGameEconomy();

  const today = new Date().toISOString().split("T")[0];
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

  // Generate daily quest if none exists for today
  const { data: todayQuest } = useQuery({
    queryKey: ["daily-quest", user?.id, today],
    queryFn: async () => {
      const existing = quests?.find((q) => q.quest_type === "daily" && q.quest_date === today);
      if (existing) return existing;

      const randomQuest = dailyQuestPool[Math.floor(Math.random() * dailyQuestPool.length)];
      const { data } = await supabase
        .from("quests")
        .insert({
          user_id: user!.id,
          quest_type: "daily",
          quest_text: randomQuest.text,
          quest_date: today,
          reward_gems: randomQuest.reward,
        })
        .select()
        .single();
      return data;
    },
    enabled: !!user && !!quests,
  });

  // Generate monthly quests if none exist
  const { data: monthQuests } = useQuery({
    queryKey: ["monthly-quests", user?.id, currentMonth],
    queryFn: async () => {
      const existing = quests?.filter(
        (q) => q.quest_type === "monthly" && q.quest_date?.startsWith(currentMonth.slice(0, 7))
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

  const completeQuest = useMutation({
    mutationFn: async (questId: string) => {
      const quest = [...(quests ?? []), todayQuest, ...(monthQuests ?? [])].find((q) => q?.id === questId);
      if (!quest || quest.completed) return;
      await supabase.from("quests").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", questId);
      await earnGems(quest.reward_gems);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quests"] });
      queryClient.invalidateQueries({ queryKey: ["daily-quest"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-quests"] });
    },
  });

  // Extra daily quests (subscription only)
  const extraDailyQuests = quests?.filter(
    (q) => q.quest_type === "daily" && q.quest_date === today && q.id !== todayQuest?.id
  ) ?? [];

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
          Quests
        </h1>
        <p className="text-muted-foreground mt-1">Complete quests to earn gems and rare badges!</p>
      </motion.div>

      {/* Daily Quest */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Daily Quest
          </h2>
          <Badge variant="secondary" className="text-xs">Resets daily</Badge>
        </div>

        {todayQuest && (
          <div className={cn(
            "rounded-xl p-4 border-2 flex items-center justify-between transition-all",
            todayQuest.completed
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          )}>
            <div className="flex items-center gap-3">
              {todayQuest.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              ) : (
                <Target className="w-6 h-6 text-amber-500 shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold">{todayQuest.quest_text}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Diamond className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500" />
                  <span className="text-xs font-bold text-cyan-600">+{todayQuest.reward_gems} gems</span>
                </div>
              </div>
            </div>
            {!todayQuest.completed && (
              <Button size="sm" className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                onClick={() => completeQuest.mutate(todayQuest.id)}
                disabled={completeQuest.isPending}>
                Complete
              </Button>
            )}
          </div>
        )}

        {/* Unlimited quests (Pro only) */}
        {!isPro && (
          <div className="rounded-xl p-4 border-2 border-dashed border-muted-foreground/20 flex items-center gap-3 opacity-60">
            <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-bold text-muted-foreground">Unlimited Daily Quests</p>
              <p className="text-xs text-muted-foreground">Subscribe to Pro for unlimited quests each day</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Monthly Quests */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            Monthly Quests
          </h2>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
            {currentMonth}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">Complete all monthly quests to earn a <strong className="text-purple-600">rare badge</strong>! 🏅</p>

        <div className="space-y-2">
          {monthQuests?.map((quest) => (
            <div key={quest.id} className={cn(
              "rounded-xl p-4 border flex items-center justify-between transition-all",
              quest.completed
                ? "bg-purple-50 border-purple-200"
                : "bg-background border-border"
            )}>
              <div className="flex items-center gap-3">
                {quest.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold">{quest.quest_text}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Diamond className="w-3 h-3 text-cyan-500 fill-cyan-500" />
                    <span className="text-xs font-bold text-cyan-600">+{quest.reward_gems}</span>
                  </div>
                </div>
              </div>
              {!quest.completed && (
                <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold shrink-0"
                  onClick={() => completeQuest.mutate(quest.id)}
                  disabled={completeQuest.isPending}>
                  Done
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Monthly completion badge */}
        {monthQuests && monthQuests.length > 0 && monthQuests.every((q) => q.completed) && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
            <p className="text-2xl mb-1">🏅</p>
            <p className="font-extrabold font-display">Monthly Quest Champion!</p>
            <p className="text-xs opacity-80">You completed all quests for {currentMonth}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Quests;
