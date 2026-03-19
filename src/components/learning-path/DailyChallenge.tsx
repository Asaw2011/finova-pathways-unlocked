import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2, HelpCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { toast } from "sonner";

interface ReflectChallenge {
  text: string;
  type: "reflect";
  prompt: string;
  placeholder: string;
  minLength: number;
}

interface CalculateChallenge {
  text: string;
  type: "calculate";
  prompt: string;
  correctAnswer: string;
  acceptRange?: [number, number];
  hint: string;
}

interface QuizChallenge {
  text: string;
  type: "quiz";
  options: string[];
  correctIndex: number;
}

type Challenge = ReflectChallenge | CalculateChallenge | QuizChallenge;

const challengePool: Challenge[] = [
  {
    text: "What did you spend money on today?",
    type: "reflect",
    prompt: "Type at least one purchase below to complete this challenge.",
    placeholder: "e.g. coffee $3.50, lunch $12...",
    minLength: 10,
  },
  {
    text: "Calculate: If you save $25/week, how much will you have in 1 year?",
    type: "calculate",
    prompt: "Type your answer below.",
    correctAnswer: "1300",
    hint: "25 × 52 = ?",
  },
  {
    text: "Name one subscription you could cancel or share.",
    type: "reflect",
    prompt: "Type the subscription name below.",
    placeholder: "e.g. Netflix, Spotify...",
    minLength: 3,
  },
  {
    text: "Quick Quiz: What is the 50/30/20 rule?",
    type: "quiz",
    options: [
      "Save 50%, invest 30%, spend 20%",
      "Needs 50%, wants 30%, savings 20%",
      "Taxes 50%, food 30%, fun 20%",
    ],
    correctIndex: 1,
  },
  {
    text: "What is your current savings goal?",
    type: "reflect",
    prompt: "Write your goal and target amount.",
    placeholder: "e.g. Emergency fund – $500 by June...",
    minLength: 10,
  },
  {
    text: "Calculate: A $1,200 phone on a 24% APR card, paying $50/month. Roughly how many months to pay off?",
    type: "calculate",
    prompt: "Type your estimate in months.",
    correctAnswer: "30",
    acceptRange: [24, 36],
    hint: "Think about how interest compounds monthly.",
  },
  {
    text: "Quick Quiz: Which is a NEED, not a want?",
    type: "quiz",
    options: ["New sneakers", "Rent payment", "Netflix subscription", "Concert tickets"],
    correctIndex: 1,
  },
  {
    text: "Quick Quiz: What does FDIC insurance protect?",
    type: "quiz",
    options: ["Your investments", "Bank deposits up to $250,000", "Credit card debt", "Your crypto"],
    correctIndex: 1,
  },
  {
    text: "Calculate: $5 coffee every weekday for a year. What's the total?",
    type: "calculate",
    prompt: "Type the total amount.",
    correctAnswer: "1300",
    acceptRange: [1200, 1400],
    hint: "5 × 5 days × 52 weeks = ?",
  },
  {
    text: "Reflect: What's one money habit you want to improve this week?",
    type: "reflect",
    prompt: "Write your habit below.",
    placeholder: "e.g. I want to stop impulse buying on Amazon...",
    minLength: 15,
  },
];

const typeBadge: Record<string, { label: string; color: string }> = {
  reflect: { label: "💭 Reflect", color: "bg-blue-100 text-blue-700" },
  calculate: { label: "🧮 Calculate", color: "bg-amber-100 text-amber-700" },
  quiz: { label: "⚡ Quiz", color: "bg-purple-100 text-purple-700" },
};

const DailyChallenge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { earnGems } = useGameEconomy();
  const [reflectInput, setReflectInput] = useState("");
  const [calcInput, setCalcInput] = useState("");
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [calcFeedback, setCalcFeedback] = useState<"correct" | "wrong" | null>(null);
  const [verified, setVerified] = useState(false);

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
        // Pick deterministic challenge based on day
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const challenge = challengePool[dayOfYear % challengePool.length];
        const { data: newChallenge } = await supabase
          .from("daily_challenges")
          .insert({ user_id: user!.id, challenge_text: challenge.text, challenge_date: today })
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
      await earnGems(5);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
      toast.success("🎯 Daily Challenge Complete! +5 gems");
    },
  });

  if (!todayChallenge) return null;

  // Find the matching challenge from pool
  const activeChallenge = challengePool.find(c => c.text === todayChallenge.challenge_text) || challengePool[0];
  const badge = typeBadge[activeChallenge.type];
  const isCompleted = todayChallenge.completed;

  // Verify logic per type
  const handleQuizSelect = (idx: number) => {
    if (quizFeedback === "correct") return;
    setQuizSelected(idx);
    const challenge = activeChallenge as QuizChallenge;
    if (idx === challenge.correctIndex) {
      setQuizFeedback("correct");
      setVerified(true);
    } else {
      setQuizFeedback("wrong");
      setTimeout(() => { setQuizFeedback(null); setQuizSelected(null); }, 1200);
    }
  };

  const handleCalcCheck = () => {
    const challenge = activeChallenge as CalculateChallenge;
    const num = parseInt(calcInput.replace(/[^0-9]/g, ""));
    if (isNaN(num)) { setCalcFeedback("wrong"); return; }
    const correct = challenge.acceptRange
      ? num >= challenge.acceptRange[0] && num <= challenge.acceptRange[1]
      : num === parseInt(challenge.correctAnswer);
    setCalcFeedback(correct ? "correct" : "wrong");
    if (correct) setVerified(true);
  };

  const isReflectValid = activeChallenge.type === "reflect" && reflectInput.length >= (activeChallenge as ReflectChallenge).minLength;
  const canComplete = isCompleted || verified || isReflectValid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-5 border space-y-3",
        isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-card border-border"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Target className="w-5 h-5 text-amber-500 shrink-0" />
          )}
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Daily Challenge</p>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", badge.color)}>{badge.label}</span>
        </div>
      </div>

      <p className={cn("text-sm font-semibold", isCompleted ? "text-emerald-700" : "text-foreground")}>
        {todayChallenge.challenge_text}
      </p>

      {/* Interactive area */}
      {!isCompleted && (
        <>
          {activeChallenge.type === "reflect" && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{(activeChallenge as ReflectChallenge).prompt}</p>
              <textarea
                value={reflectInput}
                onChange={(e) => setReflectInput(e.target.value)}
                placeholder={(activeChallenge as ReflectChallenge).placeholder}
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={2}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {reflectInput.length}/{(activeChallenge as ReflectChallenge).minLength} characters needed
              </p>
            </div>
          )}

          {activeChallenge.type === "calculate" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{(activeChallenge as CalculateChallenge).prompt}</p>
              <div className="flex gap-2">
                <input
                  value={calcInput}
                  onChange={(e) => { setCalcInput(e.target.value); setCalcFeedback(null); }}
                  placeholder="Your answer..."
                  className={cn(
                    "flex-1 bg-background border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20",
                    calcFeedback === "correct" && "border-emerald-400 bg-emerald-50",
                    calcFeedback === "wrong" && "border-red-400 bg-red-50"
                  )}
                />
                <button onClick={handleCalcCheck} disabled={!calcInput || calcFeedback === "correct"}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-50">
                  Check
                </button>
              </div>
              {calcFeedback === "wrong" && <p className="text-xs text-red-500 font-medium">Not quite — try again!</p>}
              {calcFeedback === "correct" && <p className="text-xs text-emerald-500 font-bold">✓ Correct!</p>}
              <button onClick={() => setShowHint(!showHint)} className="text-[10px] text-primary font-bold flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> {showHint ? "Hide hint" : "Show hint"}
              </button>
              {showHint && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">{(activeChallenge as CalculateChallenge).hint}</p>}
            </div>
          )}

          {activeChallenge.type === "quiz" && (
            <div className="space-y-2">
              {(activeChallenge as QuizChallenge).options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuizSelect(idx)}
                  disabled={quizFeedback === "correct"}
                  className={cn(
                    "w-full text-left rounded-xl p-3 text-sm font-semibold border-2 transition-all",
                    quizSelected === idx && quizFeedback === "correct" && "border-emerald-500 bg-emerald-50 text-emerald-700",
                    quizSelected === idx && quizFeedback === "wrong" && "border-red-400 bg-red-50 text-red-700 animate-pulse",
                    quizSelected !== idx && "border-border hover:border-primary/30",
                    quizFeedback === "correct" && idx === (activeChallenge as QuizChallenge).correctIndex && "border-emerald-300"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {canComplete && !isCompleted && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              <button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
              >
                {completeMutation.isPending ? "Completing..." : "Complete Challenge 🎉"}
              </button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default DailyChallenge;
