import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Target, CheckCircle2, Lightbulb, Clock, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { toast } from "sonner";

interface QuizChallenge {
  question: string;
  options: string[];
  correctIndex: number;
}

const challengePool: QuizChallenge[] = [
  { question: "What is the 50/30/20 rule?", options: ["Save 50%, invest 30%, spend 20%", "Needs 50%, wants 30%, savings 20%", "Taxes 50%, food 30%, fun 20%", "Rent 50%, food 30%, savings 20%"], correctIndex: 1 },
  { question: "What does FDIC insurance protect?", options: ["Your investments", "Bank deposits up to $250,000", "Credit card debt", "Your crypto"], correctIndex: 1 },
  { question: "A dollar bill has value because:", options: ["It's backed by gold", "The government and society agree it does", "The paper is rare", "Banks guarantee it"], correctIndex: 1 },
  { question: "What is compound interest?", options: ["Interest on your initial deposit only", "Interest earned on both principal and previously earned interest", "A type of bank fee", "Government tax on savings"], correctIndex: 1 },
  { question: "Which is a NEED, not a want?", options: ["New sneakers", "Rent payment", "Netflix subscription", "Concert tickets"], correctIndex: 1 },
  { question: "The best first step to build credit is:", options: ["Take out a large loan", "Get a secured credit card and pay it off monthly", "Apply for 10 credit cards", "Avoid all credit"], correctIndex: 1 },
  { question: "An emergency fund should cover:", options: ["1 week of expenses", "3-6 months of essential expenses", "1 year of income", "All your debts"], correctIndex: 1 },
  { question: "Gross pay minus deductions equals:", options: ["Total compensation", "Net pay (take-home pay)", "Taxable income", "Retirement savings"], correctIndex: 1 },
  { question: "Index funds are popular because they:", options: ["Guarantee profits", "Provide broad diversification at low cost", "Only go up in value", "Are government backed"], correctIndex: 1 },
  { question: "The biggest factor in your FICO score is:", options: ["Credit mix (10%)", "Payment history (35%)", "New credit (10%)", "Length of history (15%)"], correctIndex: 1 },
  { question: "If you save $25/week, how much in 1 year?", options: ["$500", "$1,000", "$1,300", "$1,500"], correctIndex: 2 },
  { question: "Why do online banks offer higher interest?", options: ["They're riskier", "No physical branch costs", "Not FDIC insured", "Government subsidies"], correctIndex: 1 },
  { question: "'Pay yourself first' means:", options: ["Buy treats as rewards", "Automate savings before spending", "Pay all bills first", "Earn more money"], correctIndex: 1 },
  { question: "A credit card grace period means:", options: ["Late payments forgiven", "No interest if paid in full by due date", "Free money period", "Waiting period before activation"], correctIndex: 1 },
  { question: "Lifestyle inflation is:", options: ["Prices going up", "Spending rising to match every income increase", "A type of economic metric", "Government monetary policy"], correctIndex: 1 },
];

const DailyChallenge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { earnGems } = useGameEconomy();
  const { isPremium } = usePremiumAccess();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Pick 5 deterministic questions for today
  const dayOfYear = Math.floor((Date.now() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const todayQuestions = useMemo(() => {
    const picked: QuizChallenge[] = [];
    for (let i = 0; i < 5; i++) {
      picked.push(challengePool[(dayOfYear + i * 7) % challengePool.length]);
    }
    return picked;
  }, [dayOfYear]);

  const { data: todayChallenge } = useQuery({
    queryKey: ["daily-challenge", user?.id, todayStr],
    queryFn: async () => {
      const { data } = await supabase.from("daily_challenges").select("*")
        .eq("user_id", user!.id).eq("challenge_date", todayStr).maybeSingle();
      if (!data) {
        const { data: newData } = await supabase.from("daily_challenges")
          .insert({ user_id: user!.id, challenge_text: "Daily Quiz Challenge", challenge_date: todayStr })
          .select().single();
        return newData;
      }
      return data;
    },
    enabled: !!user,
  });

  const isCompleted = todayChallenge?.completed ?? false;

  const completeMutation = useMutation({
    mutationFn: async (score: number) => {
      if (!todayChallenge) return;
      await supabase.from("daily_challenges").update({ completed: true, completed_at: new Date().toISOString() }).eq("id", todayChallenge.id);
      await earnGems(5);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-challenge"] });
      toast.success("🎯 Daily Challenge Complete! +5 gems");
    },
  });

  // Countdown to midnight
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const handleAnswer = (idx: number) => {
    if (feedback === "correct") return;
    setSelectedAnswer(idx);
    const correct = idx === todayQuestions[currentQ].correctIndex;
    setFeedback(correct ? "correct" : "wrong");

    if (correct) {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);
      setTimeout(() => {
        if (currentQ < todayQuestions.length - 1) {
          setCurrentQ(prev => prev + 1);
          setSelectedAnswer(null);
          setFeedback(null);
        } else {
          // Done — calculate score
          const score = newAnswers.filter((a, i) => a === todayQuestions[i].correctIndex).length;
          completeMutation.mutate(score);
        }
      }, 800);
    } else {
      setTimeout(() => { setFeedback(null); setSelectedAnswer(null); }, 1000);
    }
  };

  // Calendar data for current month
  const { data: monthChallenges } = useQuery({
    queryKey: ["monthly-challenges", user?.id, todayStr.slice(0, 7)],
    queryFn: async () => {
      const monthStart = `${todayStr.slice(0, 7)}-01`;
      const { data } = await supabase.from("daily_challenges").select("challenge_date, completed")
        .eq("user_id", user!.id).gte("challenge_date", monthStart);
      return data ?? [];
    },
    enabled: !!user,
  });

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

  const getDayStatus = (day: number) => {
    const dateStr = `${todayStr.slice(0, 8)}${String(day).padStart(2, "0")}`;
    if (day === today.getDate()) return "today";
    const challenge = monthChallenges?.find(c => c.challenge_date === dateStr);
    if (challenge?.completed) return "completed";
    if (day < today.getDate()) return "missed";
    return "future";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border space-y-4 bg-gradient-to-br from-[hsl(240,30%,15%)] to-[hsl(265,30%,20%)] border-[hsl(265,30%,30%)] text-white">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-extrabold">Daily Challenge</p>
            <p className="text-[10px] text-white/60">{today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/60">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">New in {timeLeft}</span>
        </div>
      </div>

      {/* Challenge Content */}
      {isCompleted ? (
        <div className="text-center py-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
          <p className="font-extrabold text-lg">Challenge Complete!</p>
          <p className="text-sm text-white/60">Come back tomorrow for a new challenge</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Progress dots */}
          <div className="flex items-center gap-2 justify-center">
            {todayQuestions.map((_, i) => (
              <div key={i} className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                i < currentQ ? "bg-emerald-400" : i === currentQ ? "bg-amber-400 scale-125" : "bg-white/20"
              )} />
            ))}
          </div>

          <p className="text-xs text-white/60 text-center">Question {currentQ + 1} of {todayQuestions.length}</p>

          <p className="text-sm font-bold text-center">{todayQuestions[currentQ].question}</p>

          <div className="space-y-2">
            {todayQuestions[currentQ].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={feedback === "correct"}
                className={cn(
                  "w-full text-left rounded-xl p-3 text-sm font-semibold border-2 transition-all",
                  selectedAnswer === idx && feedback === "correct" && "border-emerald-400 bg-emerald-400/20",
                  selectedAnswer === idx && feedback === "wrong" && "border-red-400 bg-red-400/20",
                  selectedAnswer !== idx && "border-white/10 hover:border-white/30 bg-white/5"
                )}
              >
                <span className="text-white/40 mr-2 font-bold">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Premium extra challenges */}
      {!isPremium && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[10px] text-white/50">
            <span className="font-bold text-amber-400">Plus members</span> get 3 daily challenges instead of 1
          </p>
          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        </div>
      )}

      {/* Calendar View */}
      <div className="pt-2 border-t border-white/10">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">
          {today.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 gap-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-[9px] text-white/30 font-bold text-center">{d}</div>
          ))}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getDayStatus(day);
            return (
              <div key={day} className={cn(
                "w-full aspect-square rounded-full flex items-center justify-center text-[9px] font-bold transition-all",
                status === "completed" && "bg-emerald-500 text-white",
                status === "today" && "bg-amber-500 text-white ring-2 ring-amber-300",
                status === "missed" && "bg-white/5 text-white/20",
                status === "future" && "text-white/15"
              )}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyChallenge;
