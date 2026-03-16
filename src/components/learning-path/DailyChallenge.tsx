import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const challengePool = [
  "Save $5 today",
  "Track one purchase you made today",
  "Learn one new financial concept",
  "Skip one unnecessary purchase",
  "Check your bank balance",
  "Review one subscription",
  "Set a savings goal for the week",
  "Read a financial tip article",
  "Calculate your daily spending",
  "Find one cheaper alternative today",
];

const DailyChallenge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: todayChallenge } = useQuery({
    queryKey: ["daily-challenge", user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("user_id", user!.id)
        .eq("challenge_date", today)
        .maybeSingle();

      if (!data) {
        const randomChallenge = challengePool[Math.floor(Math.random() * challengePool.length)];
        const { data: newChallenge } = await supabase
          .from("daily_challenges")
          .insert({ user_id: user!.id, challenge_text: randomChallenge, challenge_date: today })
          .select()
          .single();
        return newChallenge;
      }
      return data;
    },
    enabled: !!user,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!todayChallenge) return;
      await supabase.from("daily_challenges").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", todayChallenge.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
    },
  });

  if (!todayChallenge) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-4 border flex items-center justify-between",
        todayChallenge.completed
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200"
      )}
    >
      <div className="flex items-center gap-3">
        {todayChallenge.completed ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
        ) : (
          <Target className="w-6 h-6 text-amber-500 shrink-0" />
        )}
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Daily Challenge</p>
          <p className={cn("text-sm font-semibold", todayChallenge.completed ? "text-emerald-700" : "text-amber-800")}>
            {todayChallenge.challenge_text}
          </p>
        </div>
      </div>
      {!todayChallenge.completed && (
        <button
          onClick={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
          className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors shrink-0"
        >
          Done
        </button>
      )}
    </motion.div>
  );
};

export default DailyChallenge;
