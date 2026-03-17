import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Flame, Zap, ChevronRight, Trophy, Target, Lock, CheckCircle2, Map, BookOpen, Bot, Heart, Diamond, ShoppingBag, AlertTriangle, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import DailyChallenge from "@/components/learning-path/DailyChallenge";
import { modules } from "@/pages/LearningPath";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import FinancialAssessment from "@/components/onboarding/FinancialAssessment";

// Badge definitions for achievements
const achievementBadges = [
  { id: "first-lesson", name: "First Step", desc: "Complete your first lesson", icon: "🎯", check: (lessons: number) => lessons >= 1 },
  { id: "five-lessons", name: "Getting Started", desc: "Complete 5 lessons", icon: "📚", check: (lessons: number) => lessons >= 5 },
  { id: "ten-lessons", name: "Dedicated Learner", desc: "Complete 10 lessons", icon: "🔥", check: (lessons: number) => lessons >= 10 },
  { id: "twenty-lessons", name: "Knowledge Seeker", desc: "Complete 20 lessons", icon: "🧠", check: (lessons: number) => lessons >= 20 },
  { id: "all-lessons", name: "Financial Scholar", desc: "Complete all lessons", icon: "🏆", check: (lessons: number) => lessons >= 43 },
];

const streakBadges = [
  { id: "streak-3", name: "3-Day Streak", desc: "Learn 3 days in a row", icon: "⚡", check: (streak: number) => streak >= 3 },
  { id: "streak-7", name: "Week Warrior", desc: "7-day learning streak", icon: "🌟", check: (streak: number) => streak >= 7 },
  { id: "streak-30", name: "Monthly Master", desc: "30-day learning streak", icon: "💎", check: (streak: number) => streak >= 30 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hearts, maxHearts, gems, streakFreezes } = useGameEconomy();
  const { hasAccess: isPlusUser } = usePremiumAccess();
  const [assessmentDone, setAssessmentDone] = useState(false);

  // Check if user has completed financial assessment (for ALL users)
  const { data: financialProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["financial-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("financial_profiles" as any)
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
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

  const { data: badges } = useQuery({
    queryKey: ["user-badges", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_badges").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: certificates } = useQuery({
    queryKey: ["certificates", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const totalXP = xpRecords?.reduce((sum, x) => sum + x.xp_amount, 0) ?? 0;
  const lessonsCompleted = xpRecords?.filter(x => x.source === "lesson").length ?? 0;
  const completedLessons = new Set(xpRecords?.filter(x => x.source === "lesson").map(x => x.source_id) ?? []);
  const completedQuizzes = new Set(xpRecords?.filter(x => x.source === "unit-quiz").map(x => x.source_id) ?? []);
  const currentStreak = streak?.current_streak ?? 0;

  const earnedAchievements = achievementBadges.filter(b => b.check(lessonsCompleted));
  const earnedStreaks = streakBadges.filter(b => b.check(currentStreak));
  const allEarnedBadges = [...earnedAchievements, ...earnedStreaks];

  const awardBadgeMutation = useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon: string }) => {
      if (!user) return;
      const existing = badges?.find(b => b.badge_name === name);
      if (!existing) {
        try { await supabase.from("user_badges").insert({ user_id: user.id, badge_name: name, badge_icon: icon }); } catch (_) {}
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-badges"] }),
  });

  if (badges) {
    allEarnedBadges.forEach(ab => {
      if (!badges.find(b => b.badge_name === ab.name)) {
        awardBadgeMutation.mutate({ name: ab.name, icon: ab.icon });
      }
    });
  }

  const findNextLesson = () => {
    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi];
      for (let li = 0; li < mod.lessons.length; li++) {
        if (!completedLessons.has(mod.lessons[li].id)) {
          return { module: mod, lesson: mod.lessons[li], moduleIndex: mi, lessonIndex: li };
        }
      }
      if (!completedQuizzes.has(mod.id)) {
        return { module: mod, lesson: null, moduleIndex: mi, lessonIndex: -1, isQuiz: true };
      }
    }
    return null;
  };

  const nextLesson = findNextLesson();

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const progressPercent = Math.round((lessonsCompleted / totalLessons) * 100);

  const currentModule = nextLesson?.module ?? modules[modules.length - 1];
  const currentModuleIndex = nextLesson?.moduleIndex ?? modules.length - 1;

  const stats = [
    { label: "Hearts", value: `${hearts}/${maxHearts}`, icon: Heart, color: "bg-red-100 text-red-500" },
    { label: "Gems", value: gems, icon: Diamond, color: "bg-cyan-100 text-cyan-500" },
    { label: "Total XP", value: totalXP, icon: Zap, color: "bg-primary/10 text-primary" },
    { label: "Day Streak", value: currentStreak, icon: Flame, color: "bg-orange-100 text-orange-500" },
  ];

  const sectionColors = ["bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-pink-500", "bg-teal-500", "bg-sky-500", "bg-violet-500"];
  const sectionTextColors = ["text-emerald-600", "text-blue-600", "text-purple-600", "text-amber-600", "text-pink-600", "text-teal-600", "text-sky-600", "text-violet-600"];

  if (needsAssessment) {
    return (
      <FinancialAssessment
        isPlusUser={isPlusUser}
        onComplete={() => {
          setAssessmentDone(true);
          queryClient.invalidateQueries({ queryKey: ["financial-profile"] });
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome + Streak */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-display text-foreground">
            Welcome back, {profile?.display_name || "Learner"}!
          </h1>
          <p className="text-muted-foreground mt-1">Ready to level up your financial skills?</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-orange-600">{currentStreak} day streak</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-4 card-shadow">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold font-display">{value}</p>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Daily Challenge */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <DailyChallenge />
      </motion.div>

      {/* Continue Learning CTA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Link to="/learning-path" className="block bg-primary rounded-2xl p-6 text-primary-foreground hover:opacity-95 transition-opacity card-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold opacity-80">Continue Learning</p>
              <h2 className="text-xl font-extrabold font-display mt-1">
                {nextLesson ? `${currentModule.title}: ${nextLesson.isQuiz ? "Unit Quiz" : nextLesson.lesson?.title}` : "All lessons complete! 🎉"}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm opacity-80">{lessonsCompleted}/{totalLessons} lessons · {progressPercent}% complete</p>
              </div>
              <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden mt-3 max-w-xs">
                <motion.div className="h-full rounded-full bg-primary-foreground/60" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1 }} />
              </div>
            </div>
            <ChevronRight className="w-8 h-8 opacity-60" />
          </div>
        </Link>
      </motion.div>

      {/* Learning Path Sections Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" /> Learning Sections
          </h3>
          <Link to="/learning-path" className="text-xs font-bold text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {modules.map((mod, mi) => {
            const modCompleted = mod.lessons.filter(l => completedLessons.has(l.id)).length;
            const isComplete = modCompleted === mod.lessons.length && completedQuizzes.has(mod.id);
            const isUnlocked = mi === 0 || (modules[mi - 1].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[mi - 1].id));
            const progress = Math.round((modCompleted / mod.lessons.length) * 100);

            return (
              <Link
                key={mod.id}
                to="/learning-path"
                className={cn(
                  "bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-all flex items-center gap-4",
                  !isUnlocked && "opacity-50"
                )}
              >
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0",
                  isComplete ? "bg-emerald-500" : isUnlocked ? sectionColors[mi % sectionColors.length] : "bg-muted-foreground/30"
                )}>
                  {isComplete ? <CheckCircle2 className="w-5 h-5" /> : isUnlocked ? mi + 1 : <Lock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn("font-bold font-display text-sm truncate", sectionTextColors[mi % sectionTextColors.length])}>{mod.title}</h4>
                  <p className="text-xs text-muted-foreground">{modCompleted}/{mod.lessons.length} lessons{isComplete ? " · ✓ Certified" : ""}</p>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
                    <div className={cn("h-full rounded-full transition-all", sectionColors[mi % sectionColors.length])} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { to: "/quests", icon: Target, title: "Quests", desc: "Daily & monthly challenges", color: "text-primary bg-primary/10" },
          { to: "/rankings", icon: Crown, title: "Rankings", desc: "Compete & climb tiers", color: "text-amber-500 bg-amber-50" },
          { to: "/mistakes", icon: AlertTriangle, title: "Review", desc: "Learn from mistakes", color: "text-red-500 bg-red-50" },
          { to: "/shop", icon: ShoppingBag, title: "Shop", desc: "Hearts, gems & more", color: "text-pink-500 bg-pink-50" },
          { to: "/library", icon: BookOpen, title: "Library", desc: "Videos, games & courses", color: "text-blue-500 bg-blue-50" },
          { to: "/awards", icon: Award, title: "Awards", desc: "Badges & certificates", color: "text-purple-500 bg-purple-50" },
        ].map(({ to, icon: Icon, title, desc, color }) => (
          <Link key={to} to={to} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold font-display">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Achievement Badges */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow">
        <h3 className="font-bold font-display flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" /> Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...achievementBadges, ...streakBadges].map(badge => {
            const earned = badge.id.startsWith("streak-")
              ? streakBadges.find(b => b.id === badge.id)?.check(currentStreak)
              : achievementBadges.find(b => b.id === badge.id)?.check(lessonsCompleted);
            return (
              <div key={badge.id} className={cn(
                "rounded-xl p-3 text-center border transition-all",
                earned ? "bg-amber-50 border-amber-200" : "bg-muted/50 border-border opacity-50"
              )}>
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <p className="text-xs font-bold">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Unit Badges */}
      {badges && badges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-5 card-shadow">
          <h3 className="font-bold font-display flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-emerald-500" /> Unit Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.filter(b => !achievementBadges.find(ab => ab.name === b.badge_name) && !streakBadges.find(sb => sb.name === b.badge_name)).map(b => (
              <div key={b.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <Trophy className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">{b.badge_name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
