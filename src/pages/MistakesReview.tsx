import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, BookOpen, Lightbulb, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tipsByTopic: Record<string, string> = {
  "Money Basics": "Review the fundamentals: money is a medium of exchange. Focus on the 50/30/20 rule and tracking your spending habits daily.",
  "Banking & Saving": "Remember: APY = Annual Percentage Yield. FDIC insures up to $250K. Online banks typically offer higher rates than traditional ones.",
  "Budgeting & Spending": "Fixed expenses stay the same monthly; variable ones change. Use the 24-hour rule before impulse purchases over $20.",
  "Credit & Debt": "Credit scores range 300-850. Always pay at least the minimum. APR is the cost of borrowing — lower is better.",
  "Investing": "Diversification reduces risk. Index funds track market indices. Time in market beats timing the market.",
  "Taxes & Income": "W-2 = employed, 1099 = self-employed. Deductions reduce taxable income. File by April 15th each year.",
  "Insurance & Protection": "Insurance transfers risk. Deductible = what you pay first. Higher deductible = lower premium.",
  "Financial Planning": "Set SMART goals. Emergency fund = 3-6 months expenses. Start investing early for compound growth.",
};

const MistakesReview = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: mistakes, isLoading } = useQuery({
    queryKey: ["user-mistakes", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_mistakes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const markReviewed = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("user_mistakes").update({ reviewed: true }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-mistakes"] }),
  });

  const unreviewed = mistakes?.filter((m) => !m.reviewed) ?? [];
  const reviewed = mistakes?.filter((m) => m.reviewed) ?? [];

  // Group unreviewed by topic
  const byTopic: Record<string, typeof unreviewed> = {};
  unreviewed.forEach((m) => {
    const topic = m.topic || "General";
    if (!byTopic[topic]) byTopic[topic] = [];
    byTopic[topic].push(m);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading mistakes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display text-foreground flex items-center gap-3">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
          Mistakes Review
        </h1>
        <p className="text-muted-foreground mt-1">Learn from your mistakes and fill knowledge gaps.</p>
      </motion.div>

      {unreviewed.length === 0 && reviewed.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-card rounded-2xl border border-border p-12 text-center card-shadow">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-extrabold font-display">No Mistakes Yet!</h2>
          <p className="text-muted-foreground mt-2">Complete quizzes in the Learning Path — any wrong answers will appear here for review.</p>
        </motion.div>
      ) : (
        <>
          {/* Unreviewed mistakes by topic */}
          {Object.entries(byTopic).map(([topic, topicMistakes]) => (
            <motion.div key={topic} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold font-display flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {topic}
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{topicMistakes.length} to review</span>
                </h3>
              </div>

              {/* Learning tip */}
              {tipsByTopic[topic] && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Study Tip</p>
                    <p className="text-sm text-blue-800">{tipsByTopic[topic]}</p>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {topicMistakes.map((mistake) => (
                  <motion.div key={mistake.id} layout exit={{ opacity: 0, height: 0 }}
                    className="border border-border rounded-xl p-4 space-y-3 bg-background">
                    <p className="text-sm font-semibold">{mistake.question_text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-lg p-2.5 bg-red-50 border border-red-200">
                        <span className="text-xs font-bold text-red-600 uppercase">Your answer:</span>
                        <span className="text-sm text-red-700">{mistake.user_answer}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg p-2.5 bg-emerald-50 border border-emerald-200">
                        <span className="text-xs font-bold text-emerald-600 uppercase">Correct:</span>
                        <span className="text-sm text-emerald-700">{mistake.correct_answer}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold"
                      onClick={() => markReviewed.mutate(mistake.id)}
                      disabled={markReviewed.isPending}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark as Reviewed
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ))}

          {/* Reviewed section */}
          {reviewed.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-5 card-shadow">
              <h3 className="font-extrabold font-display flex items-center gap-2 mb-3 text-muted-foreground">
                <RotateCcw className="w-5 h-5" />
                Previously Reviewed ({reviewed.length})
              </h3>
              <div className="space-y-2">
                {reviewed.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg bg-muted/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{m.question_text}</span>
                  </div>
                ))}
                {reviewed.length > 5 && (
                  <p className="text-xs text-muted-foreground pl-7">...and {reviewed.length - 5} more</p>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default MistakesReview;
