import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Lock, Target, Award, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import LessonExperience from "@/components/courses/LessonExperience";
import CourseQuiz from "@/components/courses/CourseQuiz";
import StepConnector from "@/components/learning-path/StepConnector";
import LessonTooltip from "@/components/learning-path/LessonTooltip";

// Standardized color system matching LearningPath
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

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showUnitQuiz, setShowUnitQuiz] = useState<string | null>(null);

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-progress"] });
      await queryClient.invalidateQueries({ queryKey: ["all-progress"] });
      toast.success("Lesson completed! 🎉");
      setActiveLesson(null);

      // Check course completion
      const allLessonIds = modules?.flatMap(m => m.lessons.map(l => l.id)) ?? [];
      const { data: latestProgress } = await supabase.from("user_progress").select("*").eq("user_id", user!.id).in("lesson_id", allLessonIds);
      const completedIds = new Set(latestProgress?.filter(p => p.completed).map(p => p.lesson_id) ?? []);
      if (allLessonIds.length > 0 && allLessonIds.every(id => completedIds.has(id)) && !existingCert) {
        const certNumber = `FIN-${courseId!.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        await supabase.from("certificates").insert({ user_id: user!.id, course_id: courseId!, certificate_number: certNumber, score: 100 });
        toast.success("🎓 Certificate earned!", { duration: 5000 });
        queryClient.invalidateQueries({ queryKey: ["course-cert"] });
      }
    },
  });

  const completedIds = new Set(progress?.filter(p => p.completed).map(p => p.lesson_id));

  // Build ordered flat list for unlock logic (sequential within course)
  const allLessonsOrdered = modules?.flatMap(m => m.lessons) ?? [];
  const isUnlocked = (lessonId: string) => {
    const idx = allLessonsOrdered.findIndex(l => l.id === lessonId);
    if (idx === 0) return true;
    return completedIds.has(allLessonsOrdered[idx - 1]?.id);
  };

  const allLessons = allLessonsOrdered;
  const progressPercent = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0;

  // Active lesson content
  const activeLessonData = allLessons.find(l => l.id === activeLesson);

  if (!course) {
    return <div className="animate-fade-in"><div className="glass rounded-xl p-8 text-center"><p className="text-muted-foreground">Loading course...</p></div></div>;
  }

  // Show lesson experience
  if (activeLesson && activeLessonData?.content) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setActiveLesson(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>
        <LessonExperience
          content={activeLessonData.content as any}
          lessonTitle={activeLessonData.title}
          lessonId={activeLesson}
          userId={user?.id}
          onComplete={(passed, score) => {
            if (passed) {
              completeMutation.mutate({ lessonId: activeLesson, score });
            }
          }}
          onCancel={() => setActiveLesson(null)}
        />
      </div>
    );
  }

  // Check if unit quiz is unlocked (all lessons in unit completed)
  const isUnitQuizUnlocked = (moduleIndex: number) => {
    const mod = modules?.[moduleIndex];
    if (!mod) return false;
    return mod.lessons.every((l: any) => completedIds.has(l.id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display">{course.title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{course.description}</p>
          </div>
          {existingCert && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 shrink-0">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Certified</span>
            </div>
          )}
        </div>

        <div className="mt-4 glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-primary font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 bg-primary" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Ladder-style units */}
      <div className="space-y-0">
        {modules?.map((module, mi) => {
          const unitCompleted = module.lessons.every((l: any) => completedIds.has(l.id));
          const unitLessonsCompleted = module.lessons.filter((l: any) => completedIds.has(l.id)).length;
          const quizUnlocked = isUnitQuizUnlocked(mi);
          const colors = moduleColors[mi % moduleColors.length];

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.08 }}
            >
              {/* Section Header */}
              <div className={cn("rounded-2xl p-5 mb-4 border-2", colors.border, colors.light)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-primary-foreground text-lg",
                      unitCompleted ? "bg-primary" : colors.bg
                    )}>
                      {unitCompleted ? <CheckCircle2 className="w-5 h-5" /> : mi + 1}
                    </div>
                    <div>
                      <h3 className={cn("font-extrabold font-display text-lg", colors.text)}>
                        {module.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{unitLessonsCompleted}/{module.lessons.length} lessons</p>
                    </div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", colors.bg)}
                    initial={{ width: 0 }}
                    animate={{ width: `${(unitLessonsCompleted / module.lessons.length) * 100}%` }}
                    transition={{ duration: 0.8, delay: mi * 0.1 }}
                  />
                </div>
              </div>

              {/* Lesson Nodes - Zigzag Ladder (standardized) */}
              <div className="relative flex flex-col items-center mb-6 max-w-sm mx-auto">
                {module.lessons.map((lesson: any, li: number) => {
                  const completed = completedIds.has(lesson.id);
                  const unlocked = isUnlocked(lesson.id);
                  const hasContent = !!lesson.content;
                  const isCurrent = unlocked && hasContent && !completed;
                  const offset = li === 0 ? 0 : li % 2 === 1 ? 50 : -50;

                  // Connector type
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
                            if (unlocked && hasContent && !completed) setActiveLesson(lesson.id);
                          }}
                          disabled={!unlocked || !hasContent}
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
                          {completed ? <CheckCircle2 className="w-7 h-7" /> : isCurrent ? <Target className="w-6 h-6" style={{ color: colors.hex }} /> : <Lock className="w-5 h-5" />}
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

                {/* Unit Quiz Node */}
                <div className="flex flex-col items-center">
                  <StepConnector
                    type={unitCompleted ? "completed" : quizUnlocked ? "active" : "locked"}
                    stepNumber={module.lessons.length + 1}
                    delay={mi * 0.08 + module.lessons.length * 0.05}
                  />
                  <motion.button
                    disabled={!quizUnlocked}
                    onClick={() => {
                      if (quizUnlocked) {
                        toast.info("Unit quiz coming soon! Complete all lessons first.");
                      }
                    }}
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
