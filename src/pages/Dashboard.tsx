import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Flame, Zap, ChevronRight, Trophy, Target, Lock, CheckCircle2, Map, BookOpen, Bot, Heart, Diamond, ShoppingBag, AlertTriangle, Crown, MessageSquare, Shield, Play, Banknote, Landmark, CreditCard, TrendingUp, PiggyBank, Swords, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DailyChallenge from "@/components/learning-path/DailyChallenge";
import { modules } from "@/data/course-modules";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import FinancialAssessment from "@/components/onboarding/FinancialAssessment";
import OnboardingModal from "@/components/OnboardingModal";

const moduleIcons = [Banknote, Landmark, CreditCard, TrendingUp, PiggyBank, Swords, GraduationCap];

const motivationalQuotes = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { text: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
  { text: "The habit of saving is itself an education.", author: "T.T. Munger" },
  { text: "Wealth is not about having a lot of money; it's about having a lot of options.", author: "Chris Rock" },
  { text: "You must gain control over your money or the lack of it will forever control you.", author: "Dave Ramsey" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hearts, maxHearts, gems, streakFreezes } = useGameEconomy();
  const { hasAccess: isPlusUser } = usePremiumAccess();
  const [assessmentDone, setAssessmentDone] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: financialProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["financial-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("financial_profiles" as any).select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const needsAssessment = !financialProfile && !assessmentDone && !profileLoading;

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (user && profile) {
      const onboarded = localStorage.getItem(`finova_onboarded_${user.id}`);
      const profileOnboarded = (profile as any).onboarding_completed;
      if (!onboarded && !profileOnboarded && (!profile.display_name || profile.display_name === user.email?.split("@")[0])) {
        setShowOnboarding(true);
      }
    }
  }, [user, profile]);

  const { data: xpRecords } = useQuery({
    queryKey: ["user-xp", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: streak } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const totalXP = xpRecords?.reduce((sum, x) => sum + x.xp_amount, 0) ?? 0;
  const lessonsCompleted = xpRecords?.filter(x => x.source === "lesson").length ?? 0;
  const completedLessons = new Set(xpRecords?.filter(x => x.source === "lesson").map(x => x.source_id) ?? []);
  const completedQuizzes = new Set(xpRecords?.filter(x => x.source === "unit-quiz").map(x => x.source_id) ?? []);
  const currentStreak = streak?.current_streak ?? 0;

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const progressPercent = Math.round((lessonsCompleted / totalLessons) * 100);

  // Daily XP goal
  const today = new Date().toISOString().split("T")[0];
  const todayXP = xpRecords?.filter(x => x.earned_at.startsWith(today)).reduce((s, x) => s + x.xp_amount, 0) ?? 0;
  const dailyGoal = 50;
  const goalPercent = Math.min((todayXP / dailyGoal) * 100, 100);

  // Find next lesson
  const findNextLesson = () => {
    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi];
      for (let li = 0; li < mod.lessons.length; li++) {
        if (!completedLessons.has(mod.lessons[li].id)) return { module: mod, lesson: mod.lessons[li], mi };
      }
      if (!completedQuizzes.has(mod.id)) return { module: mod, lesson: null, mi, isQuiz: true };
    }
    return null;
  };
  const nextLesson = findNextLesson();
  const allComplete = !nextLesson;

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const dailyQuote = motivationalQuotes[dayOfYear % motivationalQuotes.length];

  // Streak days of week
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDayIdx = (new Date().getDay() + 6) % 7;

  if (needsAssessment) {
    return <FinancialAssessment isPlusUser={isPlusUser} onComplete={() => { setAssessmentDone(true); queryClient.invalidateQueries({ queryKey: ["financial-profile"] }); }} />;
  }

  return (
    <div className="space-y-5">
      <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Streak Card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-gradient-to-r from-duo-orange to-duo-red text-primary-foreground">
        <Flame className="w-7 h-7 fill-primary-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-base font-black font-display leading-tight">{currentStreak} Day Streak</p>
          <p className="text-[11px] font-semibold opacity-75">{currentStreak > 0 ? "Keep it going!" : "Start today!"}</p>
        </div>
        <div className="flex gap-1">
          {daysOfWeek.map((d, i) => (
            <div key={i} className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black",
              i <= todayDayIdx && currentStreak > todayDayIdx - i
                ? "bg-primary-foreground/30"
                : "bg-primary-foreground/10 opacity-50"
            )}>{d}</div>
          ))}
        </div>
      </motion.div>

      {/* Streak Freeze Warning */}
      {streakFreezes === 0 && currentStreak > 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl p-3 bg-duo-orange/10 border border-duo-orange/20 flex items-center gap-3">
          <Shield className="w-5 h-5 text-duo-orange shrink-0" />
          <p className="text-xs font-bold text-duo-orange">
            Protect your {currentStreak}-day streak! <Link to="/shop" className="text-primary underline font-extrabold">Get a Streak Freeze</Link>
          </p>
        </motion.div>
      )}

      {/* Daily Goal */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={cn("rounded-2xl p-4 border-2", goalPercent >= 100 ? "bg-primary/5 border-primary/30" : "bg-card border-border")}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-duo-gold" /> Today's Goal
          </p>
          <span className={cn("text-sm font-black", goalPercent >= 100 ? "text-primary" : "text-duo-gold")}>{todayXP}/{dailyGoal} XP</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${goalPercent}%` }} transition={{ duration: 0.8 }} />
        </div>
        {goalPercent >= 100 && <p className="text-xs font-bold text-primary mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Daily goal achieved!</p>}
      </motion.div>

      {/* Continue Learning */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Link to="/learning-path"
          className="block rounded-2xl p-5 bg-primary text-primary-foreground duo-btn active:translate-y-[2px] transition-transform">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Play className="w-6 h-6 fill-primary-foreground" />
              </div>
              <div>
                <p className="text-xs font-bold opacity-70">{allComplete ? "All Complete!" : "Continue"}</p>
                <p className="text-lg font-black font-display">
                  {allComplete ? "View Awards" : `${nextLesson?.module.title}`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 opacity-60" />
          </div>
          <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden mt-3">
            <div className="h-full rounded-full bg-primary-foreground/50" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-xs font-bold opacity-60 mt-1">{lessonsCompleted}/{totalLessons} lessons · {progressPercent}%</p>
        </Link>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <DailyChallenge />
      </motion.div>

      {/* Skill Path Preview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black font-display text-lg">Skill Path</h3>
          <Link to="/learning-path" className="text-xs font-bold text-primary">View all →</Link>
        </div>
        <div className="space-y-2">
          {modules.map((mod, mi) => {
            const completed = mod.lessons.filter(l => completedLessons.has(l.id)).length;
            const isComplete = completed === mod.lessons.length && completedQuizzes.has(mod.id);
            const isUnlocked = mi === 0 || (modules[mi - 1].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[mi - 1].id));
            const isCurrent = isUnlocked && !isComplete;
            const ModIcon = moduleIcons[mi] ?? BookOpen;

            return (
              <Link key={mod.id} to="/learning-path"
                className={cn("flex items-center gap-3 p-3 rounded-xl transition-all",
                  isCurrent ? "bg-primary/5 border-2 border-primary/20" : "hover:bg-muted",
                  !isUnlocked && "opacity-40"
                )}>
                <div className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                  isComplete ? "bg-primary text-primary-foreground" : isCurrent ? "bg-primary/10 ring-2 ring-primary/30" : "bg-muted"
                )}>
                  {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <ModIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold truncate", isCurrent && "text-primary")}>{mod.title}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{completed}/{mod.lessons.length} lessons</p>
                </div>
                {isCurrent && <ChevronRight className="w-4 h-4 text-primary shrink-0" />}
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="grid grid-cols-4 gap-2">
        {[
          { to: "/quests", icon: Target, title: "Quests", color: "text-duo-orange" },
          { to: "/rankings", icon: Trophy, title: "League", color: "text-duo-gold" },
          { to: "/games", icon: Zap, title: "Games", color: "text-duo-blue" },
          { to: "/shop", icon: ShoppingBag, title: "Shop", color: "text-duo-purple" },
        ].map(({ to, icon: Icon, title, color }) => (
          <Link key={to} to={to}
            className="rounded-xl border border-border p-2.5 text-center hover:bg-muted transition-all group">
            <Icon className={cn("w-5 h-5 mx-auto", color)} />
            <p className="text-[10px] font-bold mt-1">{title}</p>
          </Link>
        ))}
      </motion.div>

      {/* Motivational Quote */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-4">
        <div className="flex gap-3 items-start">
          <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm italic text-muted-foreground">"{dailyQuote.text}"</p>
            <p className="text-xs font-bold text-muted-foreground mt-1">— {dailyQuote.author}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
