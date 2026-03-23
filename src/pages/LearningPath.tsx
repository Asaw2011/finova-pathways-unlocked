import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flame, Zap, Award, Trophy, Lock, CheckCircle2, ChevronRight, Target, Heart, Diamond, Banknote, Landmark, CreditCard, TrendingUp, PiggyBank, Shield, GraduationCap, Crown, ChevronLeft, BookOpen } from "lucide-react";
import LessonTooltip from "@/components/learning-path/LessonTooltip";
import StepConnector from "@/components/learning-path/StepConnector";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LearningPathModule from "@/components/learning-path/LearningPathModule";
import UnitQuiz from "@/components/learning-path/UnitQuiz";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const moduleIcons = [Banknote, Landmark, CreditCard, TrendingUp, PiggyBank, Shield, GraduationCap];
const moduleColors = [
  { bg: "bg-primary", text: "text-primary", light: "bg-primary/10", border: "border-primary/30", hex: "hsl(152, 60%, 42%)" },
  { bg: "bg-[hsl(205,70%,50%)]", text: "text-[hsl(205,70%,50%)]", light: "bg-[hsl(205,70%,50%)]/10", border: "border-[hsl(205,70%,50%)]/30", hex: "hsl(205, 70%, 50%)" },
  { bg: "bg-[hsl(265,55%,60%)]", text: "text-[hsl(265,55%,60%)]", light: "bg-[hsl(265,55%,60%)]/10", border: "border-[hsl(265,55%,60%)]/30", hex: "hsl(265, 55%, 60%)" },
  { bg: "bg-[hsl(25,85%,55%)]", text: "text-[hsl(25,85%,55%)]", light: "bg-[hsl(25,85%,55%)]/10", border: "border-[hsl(25,85%,55%)]/30", hex: "hsl(25, 85%, 55%)" },
  { bg: "bg-destructive", text: "text-destructive", light: "bg-destructive/10", border: "border-destructive/30", hex: "hsl(4, 80%, 58%)" },
  { bg: "bg-[hsl(38,90%,50%)]", text: "text-[hsl(38,90%,50%)]", light: "bg-[hsl(38,90%,50%)]/10", border: "border-[hsl(38,90%,50%)]/30", hex: "hsl(38, 90%, 50%)" },
  { bg: "bg-primary", text: "text-primary", light: "bg-primary/10", border: "border-primary/30", hex: "hsl(152, 60%, 42%)" },
];

import { modules } from "@/data/course-modules";

const LearningPath = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hearts, gems, canDoLessons, currentStreak, lastLessonDate } = useGameEconomy();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showUnitQuiz, setShowUnitQuiz] = useState<string | null>(null);
  const [streakBannerDismissed, setStreakBannerDismissed] = useState(false);

  const { data: xpRecords } = useQuery({
    queryKey: ["user-xp", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const completedLessons = new Set(xpRecords?.filter(x => x.source === "lesson").map(x => x.source_id) ?? []);
  const completedQuizzes = new Set(xpRecords?.filter(x => x.source === "unit-quiz").map(x => x.source_id) ?? []);

  const completeLessonMutation = useMutation({
    mutationFn: async ({ lessonId, xp, moduleId, badgeName }: { lessonId: string; xp: number; moduleId: string; badgeName: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("user_xp").insert({ user_id: user.id, xp_amount: xp, source: "lesson", source_id: lessonId });
      const today = new Date().toISOString().split("T")[0];
      const { data: existingStreak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();
      if (existingStreak) {
        const lastDate = existingStreak.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        let newStreak = existingStreak.current_streak;
        if (lastDate === yesterday) newStreak += 1;
        else if (lastDate !== today) newStreak = 1;
        await supabase.from("user_streaks").update({
          current_streak: newStreak, longest_streak: Math.max(newStreak, existingStreak.longest_streak),
          last_activity_date: today, updated_at: new Date().toISOString(),
        }).eq("user_id", user.id);
      } else {
        await supabase.from("user_streaks").insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_activity_date: today });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-xp"] });
      queryClient.invalidateQueries({ queryKey: ["user-streak"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    },
  });

  const completeUnitQuizMutation = useMutation({
    mutationFn: async ({ moduleId, badgeName, badgeIcon }: { moduleId: string; badgeName: string; badgeIcon: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("user_xp").insert({ user_id: user.id, xp_amount: 50, source: "unit-quiz", source_id: moduleId });
      try { await supabase.from("user_badges").insert({ user_id: user.id, badge_name: badgeName, badge_icon: badgeIcon }); } catch (_) {}
      const certNumber = `FINOVA-${moduleId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      try { await supabase.from("certificates").insert({ user_id: user.id, course_id: moduleId, certificate_number: certNumber, score: 100 }); } catch (_) {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-xp"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast.success("Certificate earned! 🎓");
    },
  });

  const isLessonUnlocked = (moduleIndex: number, lessonIndex: number) => {
    if (moduleIndex === 0 && lessonIndex === 0) return true;
    if (lessonIndex > 0) {
      const prevLesson = modules[moduleIndex].lessons[lessonIndex - 1];
      return completedLessons.has(prevLesson.id);
    }
    const prevModule = modules[moduleIndex - 1];
    return prevModule.lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(prevModule.id);
  };

  const isUnitQuizUnlocked = (moduleIndex: number) => {
    return modules[moduleIndex].lessons.every(l => completedLessons.has(l.id));
  };

  // Find the active course (first incomplete module)
  const activeModuleIndex = useMemo(() => {
    for (let i = 0; i < modules.length; i++) {
      const allDone = modules[i].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[i].id);
      if (!allDone) return i;
    }
    return modules.length - 1;
  }, [completedLessons, completedQuizzes]);

  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number | null>(null);
  const viewingModuleIndex = selectedModuleIndex ?? activeModuleIndex;

  const activeModuleData = modules.find(m => m.id === activeModule);
  const activeLessonData = activeModuleData?.lessons.find(l => l.id === activeLesson);

  if (showUnitQuiz) {
    const mod = modules.find(m => m.id === showUnitQuiz);
    const mi = modules.findIndex(m => m.id === showUnitQuiz);
    if (mod) {
      return (
        <UnitQuiz unitTitle={mod.title} questions={mod.unitQuiz} sectionColor={moduleColors[mi % moduleColors.length].hex}
          isCompleted={completedQuizzes.has(mod.id)}
          onComplete={() => { completeUnitQuizMutation.mutate({ moduleId: mod.id, badgeName: mod.badge, badgeIcon: mod.badgeIcon }); }}
          onBack={() => setShowUnitQuiz(null)} />
      );
    }
  }

  if (activeLessonData && activeModuleData) {
    const mi = modules.findIndex(m => m.id === activeModule);
    return (
      <LearningPathModule lesson={activeLessonData} moduleName={activeModuleData.title}
        sectionColor={moduleColors[mi % moduleColors.length].hex}
        isCompleted={completedLessons.has(activeLessonData.id)}
        onComplete={() => {
          completeLessonMutation.mutate({ lessonId: activeLessonData.id, xp: activeLessonData.xp, moduleId: activeModuleData.id, badgeName: activeModuleData.badge });
        }}
        onBack={() => { setActiveLesson(null); setActiveModule(null); }}
        isPending={completeLessonMutation.isPending} />
    );
  }

  const totalModules = modules.length;
  const completedModules = modules.filter((m) => m.lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(m.id)).length;

  // Current viewing module
  const mod = modules[viewingModuleIndex];
  const modLessons = mod.lessons;
  const completedCount = modLessons.filter(l => completedLessons.has(l.id)).length;
  const isModuleComplete = completedCount === modLessons.length;
  const isModuleUnlocked = viewingModuleIndex === 0 || (modules[viewingModuleIndex - 1].lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(modules[viewingModuleIndex - 1].id));
  const quizUnlocked = isUnitQuizUnlocked(viewingModuleIndex);
  const quizCompleted = completedQuizzes.has(mod.id);
  const colors = moduleColors[viewingModuleIndex % moduleColors.length];
  const ModIcon = moduleIcons[viewingModuleIndex % moduleIcons.length];

  const today = new Date().toISOString().split("T")[0];
  const hasLessonToday = lastLessonDate === today;

  return (
    <div className="space-y-6">
      {/* Streak banner */}
      {!streakBannerDismissed && currentStreak > 0 && !hasLessonToday && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-duo-orange/30 bg-duo-orange/5 p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Flame className="w-5 h-5 text-duo-orange shrink-0" />
            <p className="text-sm font-bold truncate">
              Your {currentStreak}-day streak is at risk! Complete a lesson to keep it going.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="rounded-xl font-bold text-xs" onClick={() => {
              const firstMod = modules[activeModuleIndex];
              const firstLesson = firstMod?.lessons.find((l: any) => !completedLessons.has(l.id));
              if (firstLesson) { setActiveModule(firstMod.id); setActiveLesson(firstLesson.id); }
            }}>Start Lesson</Button>
            <button onClick={() => setStreakBannerDismissed(true)} className="text-muted-foreground hover:text-foreground text-lg">×</button>
          </div>
        </motion.div>
      )}
      {!streakBannerDismissed && currentStreak > 0 && hasLessonToday && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-primary/5 p-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-bold">Streak secured! You're on a {currentStreak}-day streak. 🔥</p>
        </motion.div>
      )}

      {/* Recommended Next */}
      {(() => {
        const recs: { icon: React.ReactNode; title: string; desc: string; action: () => void }[] = [];
        // Recommend next module
        const nextMod = modules[activeModuleIndex];
        const nextLesson = nextMod?.lessons.find((l: any) => !completedLessons.has(l.id));
        if (nextLesson) {
          recs.push({ icon: <BookOpen className="w-4 h-4 text-primary" />, title: `Continue: ${nextMod.title}`, desc: nextLesson.title, action: () => { setActiveModule(nextMod.id); setActiveLesson(nextLesson.id); } });
        }
        // Daily challenge
        if (!hasLessonToday) {
          recs.push({ icon: <Target className="w-4 h-4 text-amber-500" />, title: "Daily Challenge", desc: "Test yourself with today's challenge", action: () => {} });
        }
        // Onboarding-based interests
        const stored = user ? localStorage.getItem(`finova_user_profile_${user.id}`) : null;
        if (stored) {
          try {
            const prefs = JSON.parse(stored);
            const interestMap: Record<string, number> = { credit: 2, investing: 4, budgeting: 0, taxes: 1, home: 6 };
            (prefs.interests || []).slice(0, 2).forEach((interest: string) => {
              const mi = interestMap[interest];
              if (mi !== undefined && mi !== activeModuleIndex && !modules[mi]?.lessons.every((l: any) => completedLessons.has(l.id))) {
                recs.push({ icon: <Zap className="w-4 h-4 text-violet-500" />, title: `For You: ${modules[mi].title}`, desc: "Based on your interests", action: () => setSelectedModuleIndex(mi) });
              }
            });
          } catch {}
        }
        if (recs.length === 0) return null;
        return (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recommended Next</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {recs.slice(0, 3).map((r, i) => (
                <button key={i} onClick={r.action}
                  className="shrink-0 w-48 rounded-xl border border-border bg-card p-3 text-left hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-1">{r.icon}<span className="text-xs font-bold truncate">{r.title}</span></div>
                  <p className="text-[10px] text-muted-foreground truncate">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black font-display">Your Learning Journey</h1>

        {/* Overall journey progress */}
        <div className="mt-3 glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">Journey Progress</span>
            <span className="text-sm font-extrabold text-primary">{completedModules}/{totalModules} Modules</span>
          </div>
          <div className="flex gap-1.5">
            {modules.map((m, i) => {
              const done = m.lessons.every(l => completedLessons.has(l.id)) && completedQuizzes.has(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModuleIndex(i)}
                  className={cn(
                    "h-3 flex-1 rounded-full transition-all cursor-pointer hover:opacity-80",
                    done ? moduleColors[i % moduleColors.length].bg : i === viewingModuleIndex ? "bg-muted ring-2 ring-primary" : "bg-muted"
                  )}
                  title={m.title}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Module selector */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setSelectedModuleIndex(Math.max(0, viewingModuleIndex - 1))}
          disabled={viewingModuleIndex === 0}
          className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className={cn("flex-1 rounded-2xl p-4 text-center border-2 transition-all", isModuleUnlocked ? colors.border : "border-border opacity-60")}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <ModIcon className={cn("w-6 h-6", isModuleUnlocked ? colors.text : "text-muted-foreground")} />
            <h3 className={cn("font-black font-display text-lg", isModuleUnlocked ? colors.text : "text-muted-foreground")}>{mod.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-semibold">
            Module {viewingModuleIndex + 1} of {totalModules} · {completedCount}/{modLessons.length} lessons{quizCompleted ? " · ✓ Certified" : ""}
          </p>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mt-2 max-w-xs mx-auto">
            <motion.div
              className={cn("h-full rounded-full", colors.bg)}
              initial={{ width: 0 }}
              animate={{ width: `${((completedCount + (quizCompleted ? 1 : 0)) / (modLessons.length + 1)) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <button
          onClick={() => setSelectedModuleIndex(Math.min(totalModules - 1, viewingModuleIndex + 1))}
          disabled={viewingModuleIndex === totalModules - 1}
          className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Lesson ladder — zigzag winding path */}
      <div className="relative flex flex-col items-center pb-8 max-w-sm mx-auto">
        {modLessons.map((lesson, li) => {
          const unlocked = isLessonUnlocked(viewingModuleIndex, li);
          const completed = completedLessons.has(lesson.id);
          const isCurrent = unlocked && !completed && isModuleUnlocked;

          let connectorType: "completed" | "active" | "locked" | "far-locked" | null = null;
          if (li > 0) {
            const prevCompleted = completedLessons.has(modLessons[li - 1].id);
            if (prevCompleted && completed) connectorType = "completed";
            else if (prevCompleted && isCurrent) connectorType = "active";
            else if (prevCompleted && !unlocked) connectorType = "locked";
            else if (!prevCompleted && !completed) {
              const prevUnlocked = isLessonUnlocked(viewingModuleIndex, li - 1);
              const prevIsCurrent = prevUnlocked && !completedLessons.has(modLessons[li - 1].id) && isModuleUnlocked;
              connectorType = prevIsCurrent ? "locked" : "far-locked";
            } else connectorType = "locked";
          }

          const tooltipStatus = completed ? "completed" : isCurrent ? "current" : "locked";
          // Zigzag offset: alternate left and right, first one centered
          const offset = li === 0 ? 0 : li % 2 === 1 ? 50 : -50;

          return (
            <div key={lesson.id} className="flex flex-col items-center" style={{ marginLeft: offset }}>
              {li > 0 && connectorType && (
                <div style={{ marginLeft: -offset / 2 }}>
                  <StepConnector type={connectorType} stepNumber={li + 1} delay={li * 0.06} />
                </div>
              )}
              <LessonTooltip lessonTitle={lesson.title} status={tooltipStatus}>
                <motion.button
                  onClick={() => { if (unlocked) { setActiveModule(mod.id); setActiveLesson(lesson.id); } }}
                  disabled={!unlocked}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  className={cn(
                    "relative w-16 h-16 rounded-full flex items-center justify-center transition-all z-10",
                    completed
                      ? cn(colors.bg, "text-primary-foreground shadow-lg")
                      : isCurrent
                        ? cn("bg-background border-[4px] shadow-lg cursor-pointer duo-pulse", colors.border)
                        : "bg-muted border-2 border-border text-muted-foreground cursor-not-allowed"
                  )}
                  style={completed ? { boxShadow: `0 4px 0 ${colors.hex}80` } : isCurrent ? { borderColor: colors.hex } : {}}
                >
                  {completed ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : isCurrent ? (
                    <ModIcon className="w-6 h-6" style={{ color: colors.hex }} />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                  {unlocked && (
                    <span className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-primary-foreground",
                      completed ? "bg-primary" : colors.bg
                    )}>{li + 1}</span>
                  )}
                </motion.button>
              </LessonTooltip>
            </div>
          );
        })}

        {/* Quiz node */}
        <div className="flex flex-col items-center">
          <StepConnector
            type={quizCompleted ? "completed" : quizUnlocked ? "active" : "locked"}
            stepNumber={modLessons.length + 1}
            delay={modLessons.length * 0.06}
          />
          <motion.button
            onClick={() => { if (quizUnlocked) setShowUnitQuiz(mod.id); }}
            disabled={!quizUnlocked}
            whileTap={quizUnlocked ? { scale: 0.95 } : {}}
            className={cn(
              "relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2",
              quizCompleted
                ? "bg-[hsl(38,90%,50%)] text-primary-foreground border-[hsl(38,90%,50%)] shadow-lg"
                : quizUnlocked
                  ? "bg-background border-[hsl(38,90%,50%)] text-[hsl(38,90%,50%)] cursor-pointer duo-pulse shadow-md"
                  : "bg-muted border-border text-muted-foreground cursor-not-allowed"
            )}
          >
            {quizCompleted ? <Trophy className="w-7 h-7" /> : quizUnlocked ? <Award className="w-7 h-7" /> : <Lock className="w-5 h-5" />}
            <span className="text-[9px] font-black uppercase">Quiz</span>
          </motion.button>
          <p className="text-xs font-bold text-center mt-1.5 text-muted-foreground">{quizCompleted ? "✓ Certified" : "Unit Quiz"}</p>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
