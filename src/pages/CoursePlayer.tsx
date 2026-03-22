import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Lock, Target, Award, Trophy, Crown, Loader2, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import PremiumLessonShell from "@/components/courses/PremiumLessonShell";
import CourseQuiz from "@/components/courses/CourseQuiz";
import StepConnector from "@/components/learning-path/StepConnector";
import LessonTooltip from "@/components/learning-path/LessonTooltip";

const moduleColors = [
  { bg: "bg-primary", text: "text-primary", light: "bg-primary/10", border: "border-primary/30", hex: "hsl(152, 60%, 42%)" },
  { bg: "bg-[hsl(205,70%,50%)]", text: "text-[hsl(205,70%,50%)]", light: "bg-[hsl(205,70%,50%)]/10", border: "border-[hsl(205,70%,50%)]/30", hex: "hsl(205, 70%, 50%)" },
  { bg: "bg-[hsl(265,55%,60%)]", text: "text-[hsl(265,55%,60%)]", light: "bg-[hsl(265,55%,60%)]/10", border: "border-[hsl(265,55%,60%)]/30", hex: "hsl(265, 55%, 60%)" },
  { bg: "bg-[hsl(25,85%,55%)]", text: "text-[hsl(25,85%,55%)]", light: "bg-[hsl(25,85%,55%)]/10", border: "border-[hsl(25,85%,55%)]/30", hex: "hsl(25, 85%, 55%)" },
  { bg: "bg-destructive", text: "text-destructive", light: "bg-destructive/10", border: "border-destructive/30", hex: "hsl(4, 80%, 58%)" },
  { bg: "bg-[hsl(38,90%,50%)]", text: "text-[hsl(38,90%,50%)]", light: "bg-[hsl(38,90%,50%)]/10", border: "border-[hsl(38,90%,50%)]/30", hex: "hsl(38, 90%, 50%)" },
  { bg: "bg-primary", text: "text-primary", light: "bg-primary/10", border: "border-primary/30", hex: "hsl(152, 60%, 42%)" },
  { bg: "bg-[hsl(205,70%,50%)]", text: "text-[hsl(205,70%,50%)]", light: "bg-[hsl(205,70%,50%)]/10", border: "border-[hsl(205,70%,50%)]/30", hex: "hsl(205, 70%, 50%)" },
];

// SVG circular progress ring
const ProgressRing = ({ percent, size = 64 }: { percent: number; size?: number }) => {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(152, 60%, 42%)" strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground text-xs font-bold" transform={`rotate(90, ${size / 2}, ${size / 2})`}>
        {percent}%
      </text>
    </svg>
  );
};

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showUnitQuiz, setShowUnitQuiz] = useState<string | null>(null);
  const [generatingLesson, setGeneratingLesson] = useState<string | null>(null);

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").eq("id", courseId!).single();
      return data;
    },
    enabled: !!courseId,
  });

  const { data: modules } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from("modules")
        .select("*, lessons(*)")
        .eq("course_id", courseId!)
        .order("sort_order")
        .order("sort_order", { referencedTable: "lessons" });
      return data ?? [];
    },
    enabled: !!courseId,
  });

  const { data: progress } = useQuery({
    queryKey: ["course-progress", courseId, user?.id],
    queryFn: async () => {
      const lessonIds = modules?.flatMap(m => m.lessons.map(l => l.id)) ?? [];
      if (lessonIds.length === 0) return [];
      const { data } = await supabase.from("user_progress").select("*").eq("user_id", user!.id).in("lesson_id", lessonIds);
      return data ?? [];
    },
    enabled: !!user && !!modules,
  });

  const { data: existingCert } = useQuery({
    queryKey: ["course-cert", courseId, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("*").eq("user_id", user!.id).eq("course_id", courseId!).maybeSingle();
      return data;
    },
    enabled: !!user && !!courseId,
  });

  const completeMutation = useMutation({
    mutationFn: async ({ lessonId, score }: { lessonId: string; score: number }) => {
      const { error } = await supabase.from("user_progress").upsert(
        { user_id: user!.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString(), score },
        { onConflict: "user_id,lesson_id" }
      );
      if (error) throw error;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["course-progress"] });
      await queryClient.invalidateQueries({ queryKey: ["all-progress"] });
      toast.success("Lesson completed! 🎉");
      setActiveLesson(null);

      // Award XP for premium lesson completion
      try {
        await supabase.from("user_xp").insert({
          user_id: user!.id,
          xp_amount: 20,
          source: "course-lesson",
          source_id: variables.lessonId
        });
        await queryClient.invalidateQueries({ queryKey: ["user-xp"] });
      } catch {}

      // Update streak
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data: streak } = await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle();
        if (streak) {
          const lastDate = streak.last_activity_date;
          const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
          const newStreak = lastDate === yesterday ? streak.current_streak + 1 : lastDate === today ? streak.current_streak : 1;
          await supabase.from("user_streaks").update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, streak.longest_streak),
            last_activity_date: today,
          }).eq("user_id", user!.id);
        } else {
          await supabase.from("user_streaks").insert({
            user_id: user!.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
          });
        }
        await queryClient.invalidateQueries({ queryKey: ["user-streak"] });
      } catch {}

      // Check course completion
      const allLessonIds = modules?.flatMap(m => m.lessons.map(l => l.id)) ?? [];
      const { data: latestProgress } = await supabase.from("user_progress").select("*").eq("user_id", user!.id).in("lesson_id", allLessonIds);
      const completedIds2 = new Set(latestProgress?.filter(p => p.completed).map(p => p.lesson_id) ?? []);
      if (allLessonIds.length > 0 && allLessonIds.every(id => completedIds2.has(id)) && !existingCert) {
        const certNumber = `FIN-${courseId!.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        await supabase.from("certificates").insert({ user_id: user!.id, course_id: courseId!, certificate_number: certNumber, score: 100 });
        toast.success("🎓 Certificate earned!", { duration: 5000 });
        queryClient.invalidateQueries({ queryKey: ["course-cert"] });
      }
    },
  });

  const completedIds = new Set(progress?.filter(p => p.completed).map(p => p.lesson_id));
  const allLessonsOrdered = modules?.flatMap(m => m.lessons) ?? [];
  const isUnlocked = (lessonId: string) => {
    const idx = allLessonsOrdered.findIndex(l => l.id === lessonId);
    if (idx === 0) return true;
    return completedIds.has(allLessonsOrdered[idx - 1]?.id);
  };

  const allLessons = allLessonsOrdered;
  const progressPercent = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0;
  const activeLessonData = allLessons.find(l => l.id === activeLesson);
  const totalLessons = allLessons.length;
  const totalUnits = modules?.length ?? 0;

  const generateContent = async (lesson: any, module: any) => {
    setGeneratingLesson(lesson.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-lesson-content", {
        body: { lessonTitle: lesson.title, moduleTitle: module.title, courseTitle: course?.title ?? "" }
      });
      if (error) throw error;
      await supabase.from("lessons").update({ content: data.content }).eq("id", lesson.id);
      await queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
      toast.success("Lesson ready! ✨");
    } catch {
      toast.error("Couldn't generate lesson. Try again.");
    } finally {
      setGeneratingLesson(null);
    }
  };

  const isUnitQuizUnlocked = (moduleIndex: number) => {
    const mod = modules?.[moduleIndex];
    if (!mod) return false;
    return mod.lessons.every((l: any) => completedIds.has(l.id));
  };

  if (!course) {
    return <div className="animate-fade-in"><div className="rounded-2xl border border-border bg-card p-8 text-center"><p className="text-muted-foreground">Loading course...</p></div></div>;
  }

  // Unit quiz view
  if (showUnitQuiz) {
    const quizModule = modules?.find(m => m.id === showUnitQuiz);
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setShowUnitQuiz(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>
        <CourseQuiz
          lessonTitle={quizModule?.title ?? "Unit Quiz"}
          onComplete={() => { setShowUnitQuiz(null); toast.success("Unit quiz complete! 🎉"); }}
          onCancel={() => setShowUnitQuiz(null)}
        />
      </div>
    );
  }

  // Active lesson view — use PremiumLessonShell
  if (activeLesson && activeLessonData?.content) {
    const lessonModule = modules?.find(m => m.lessons.some((l: any) => l.id === activeLesson));
    const lessonIdx = lessonModule?.lessons.findIndex((l: any) => l.id === activeLesson) ?? 0;
    return (
      <PremiumLessonShell
        lessonTitle={activeLessonData.title}
        moduleTitle={lessonModule?.title ?? ""}
        courseTitle={course.title}
        lessonNumber={lessonIdx + 1}
        totalLessons={lessonModule?.lessons.length ?? 0}
        content={activeLessonData.content as any}
        lessonId={activeLesson}
        userId={user?.id}
        onComplete={(passed, score) => {
          if (passed) completeMutation.mutate({ lessonId: activeLesson, score });
        }}
        onCancel={() => setActiveLesson(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Premium badge */}
      {course.is_premium && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">FinOva Plus Course</span>
        </div>
      )}

      <div>
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>

        {/* Course Hero */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold font-display">{course.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm line-clamp-2">{course.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {totalLessons} lessons</span>
              <span className="flex items-center gap-1">📚 {totalUnits} units</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{course.estimated_hours || Math.ceil(totalLessons * 8 / 60)}h</span>
              {existingCert && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold">
                  <Award className="w-3.5 h-3.5" /> Certified
                </span>
              )}
            </div>
          </div>
          <div className="hidden sm:block shrink-0">
            <ProgressRing percent={progressPercent} />
          </div>
        </div>

        {/* Mobile progress ring */}
        <div className="sm:hidden mt-4 flex items-center gap-3">
          <ProgressRing percent={progressPercent} size={48} />
          <span className="text-sm font-bold text-primary">{progressPercent}% complete</span>
        </div>
      </div>

      {/* Module ladder */}
      <div className="space-y-0">
        {modules?.map((module, mi) => {
          const unitCompleted = module.lessons.every((l: any) => completedIds.has(l.id));
          const unitLessonsCompleted = module.lessons.filter((l: any) => completedIds.has(l.id)).length;
          const quizUnlocked = isUnitQuizUnlocked(mi);
          const colors = moduleColors[mi % moduleColors.length];
          const estMinutes = module.lessons.length * 8;

          return (
            <motion.div key={module.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.08 }}>
              {/* Unit header */}
              <div className={cn("rounded-2xl p-5 mb-4 border-2 relative overflow-hidden", colors.border, colors.light)}>
                {/* Large background number */}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[80px] font-extrabold opacity-[0.04] leading-none select-none">
                  {String(mi + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-primary-foreground text-lg",
                      unitCompleted ? "bg-primary" : colors.bg
                    )}>
                      {unitCompleted ? <CheckCircle2 className="w-5 h-5" /> : mi + 1}
                    </div>
                    <div>
                      <h3 className={cn("font-extrabold font-display text-lg", colors.text)}>{module.title}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{unitLessonsCompleted}/{module.lessons.length} lessons</p>
                        <span className="text-xs text-muted-foreground">· ~{estMinutes} min</span>
                      </div>
                    </div>
                  </div>
                  {unitCompleted && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden relative z-10">
                  <motion.div
                    className={cn("h-full rounded-full", colors.bg)}
                    initial={{ width: 0 }}
                    animate={{ width: `${(unitLessonsCompleted / module.lessons.length) * 100}%` }}
                    transition={{ duration: 0.8, delay: mi * 0.1 }}
                  />
                </div>
              </div>

              {/* Lesson nodes — premium rounded rectangles */}
              <div className="relative flex flex-col items-center mb-6 max-w-sm mx-auto">
                {module.lessons.map((lesson: any, li: number) => {
                  const completed = completedIds.has(lesson.id);
                  const unlocked = isUnlocked(lesson.id);
                  const hasContent = !!lesson.content;
                  const isCurrent = unlocked && !completed;
                  const isGenerating = generatingLesson === lesson.id;
                  const offset = li === 0 ? 0 : li % 2 === 1 ? 50 : -50;

                  let connectorType: "completed" | "active" | "locked" | "far-locked" | null = null;
                  if (li > 0) {
                    const prevLesson = module.lessons[li - 1] as any;
                    const prevCompleted = completedIds.has(prevLesson.id);
                    if (prevCompleted && completed) connectorType = "completed";
                    else if (prevCompleted && isCurrent) connectorType = "active";
                    else if (prevCompleted && !unlocked) connectorType = "locked";
                    else if (!prevCompleted) connectorType = "far-locked";
                    else connectorType = "locked";
                  }

                  const tooltipStatus = completed ? "completed" as const : isCurrent ? "current" as const : "locked" as const;

                  return (
                    <div key={lesson.id} className="flex flex-col items-center" style={{ marginLeft: offset }}>
                      {li > 0 && connectorType && (
                        <div style={{ marginLeft: -offset / 2 }}>
                          <StepConnector type={connectorType} stepNumber={li + 1} delay={mi * 0.08 + li * 0.05} />
                        </div>
                      )}
                      <LessonTooltip lessonTitle={lesson.title} status={tooltipStatus}>
                        <motion.button
                          onClick={() => {
                            if (unlocked && !completed) {
                              if (hasContent) {
                                setActiveLesson(lesson.id);
                              } else {
                                generateContent(lesson, module);
                              }
                            }
                          }}
                          disabled={!unlocked || completed}
                          whileTap={unlocked && !completed ? { scale: 0.95 } : {}}
                          className={cn(
                            "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all z-10",
                            completed
                              ? cn(colors.bg, "text-primary-foreground shadow-lg")
                              : isCurrent
                                ? cn("bg-background border-[3px] shadow-lg cursor-pointer", hasContent ? "duo-pulse" : "border-dashed", colors.border)
                                : "bg-muted border-2 border-border text-muted-foreground cursor-not-allowed"
                          )}
                          style={completed ? { boxShadow: `0 3px 0 ${colors.hex}80` } : isCurrent ? { borderColor: colors.hex } : {}}
                        >
                          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.hex }} />
                            : completed ? <CheckCircle2 className="w-6 h-6" />
                            : isCurrent ? <Target className="w-5 h-5" style={{ color: colors.hex }} />
                            : <Lock className="w-4 h-4" />}
                          {unlocked && (
                            <span className={cn(
                              "absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-primary-foreground",
                              completed ? "bg-primary" : colors.bg
                            )}>{li + 1}</span>
                          )}
                        </motion.button>
                      </LessonTooltip>
                      {/* Lesson title below node */}
                      <p className="text-[10px] font-semibold text-center max-w-[80px] mt-1.5 text-muted-foreground leading-tight">
                        {lesson.title}
                      </p>
                      {isCurrent && !hasContent && !isGenerating && (
                        <span className="text-[9px] font-bold text-amber-600 mt-0.5">⚡ Tap to generate</span>
                      )}
                    </div>
                  );
                })}

                {/* Unit Quiz Node */}
                <div className="flex flex-col items-center">
                  <StepConnector
                    type={unitCompleted ? "completed" : quizUnlocked ? "active" : "locked"}
                    stepNumber={module.lessons.length + 1}
                    delay={mi * 0.08 + module.lessons.length * 0.05}
                  />
                  <motion.button
                    disabled={!quizUnlocked}
                    onClick={() => { if (quizUnlocked) setShowUnitQuiz(module.id); }}
                    whileTap={quizUnlocked ? { scale: 0.95 } : {}}
                    className={cn(
                      "relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2",
                      unitCompleted
                        ? "bg-[hsl(38,90%,50%)] text-primary-foreground border-[hsl(38,90%,50%)] shadow-lg"
                        : quizUnlocked
                          ? "bg-background border-[hsl(38,90%,50%)] text-[hsl(38,90%,50%)] cursor-pointer duo-pulse shadow-md"
                          : "bg-muted border-border text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {unitCompleted ? <Trophy className="w-7 h-7" /> : quizUnlocked ? <Award className="w-7 h-7" /> : <Lock className="w-5 h-5" />}
                    <span className="text-[9px] font-black uppercase">Quiz</span>
                  </motion.button>
                  <p className="text-xs font-bold text-center mt-1.5 text-muted-foreground">
                    {unitCompleted ? "✓ Complete" : "Unit Quiz"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursePlayer;
