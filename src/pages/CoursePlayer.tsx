import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Lock, Target, Award, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import LessonExperience from "@/components/courses/LessonExperience";
import CourseQuiz from "@/components/courses/CourseQuiz";

const sectionNodeBg = [
  "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-amber-500",
  "bg-pink-500", "bg-teal-500", "bg-sky-500", "bg-violet-500",
];
const sectionNodeBgLight = [
  "bg-emerald-100", "bg-blue-100", "bg-purple-100", "bg-amber-100",
  "bg-pink-100", "bg-teal-100", "bg-sky-100", "bg-violet-100",
];
const sectionTextColors = [
  "text-emerald-600", "text-blue-600", "text-purple-600", "text-amber-600",
  "text-pink-600", "text-teal-600", "text-sky-600", "text-violet-600",
];
const sectionBgColors = [
  "bg-emerald-50 border-emerald-200", "bg-blue-50 border-blue-200",
  "bg-purple-50 border-purple-200", "bg-amber-50 border-amber-200",
  "bg-pink-50 border-pink-200", "bg-teal-50 border-teal-200",
  "bg-sky-50 border-sky-200", "bg-violet-50 border-violet-200",
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
          const colorIdx = mi % sectionNodeBg.length;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.08 }}
            >
              {/* Section Header */}
              <div className={cn(
                "rounded-2xl p-5 mb-4 border",
                sectionBgColors[colorIdx]
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-white text-lg",
                      unitCompleted ? "bg-emerald-500" : sectionNodeBg[colorIdx]
                    )}>
                      {unitCompleted ? <CheckCircle2 className="w-5 h-5" /> : mi + 1}
                    </div>
                    <div>
                      <h3 className={cn("font-extrabold font-display text-lg", sectionTextColors[colorIdx])}>
                        {module.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{unitLessonsCompleted}/{module.lessons.length} lessons</p>
                    </div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-white/60 overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", sectionNodeBg[colorIdx])}
                    initial={{ width: 0 }}
                    animate={{ width: `${(unitLessonsCompleted / module.lessons.length) * 100}%` }}
                    transition={{ duration: 0.8, delay: mi * 0.1 }}
                  />
                </div>
              </div>

              {/* Lesson Nodes - Ladder Style */}
              <div className="flex flex-col items-center gap-3 mb-4 px-4">
                {module.lessons.map((lesson: any, li: number) => {
                  const completed = completedIds.has(lesson.id);
                  const unlocked = isUnlocked(lesson.id);
                  const hasContent = !!lesson.content;
                  const offset = li % 2 === 0 ? -40 : 40;

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: mi * 0.08 + li * 0.05 }}
                      style={{ marginLeft: offset }}
                      className="relative"
                    >
                      {li > 0 && <div className="absolute -top-3 left-1/2 w-0.5 h-3 bg-border" />}
                      <button
                        onClick={() => {
                          if (unlocked && hasContent && !completed) setActiveLesson(lesson.id);
                        }}
                        disabled={!unlocked || !hasContent}
                        className={cn(
                          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
                          completed
                            ? cn(sectionNodeBg[colorIdx], "text-white shadow-lg")
                            : unlocked && hasContent
                              ? cn(sectionNodeBgLight[colorIdx], "border-4", sectionTextColors[colorIdx], "hover:scale-110 shadow-md cursor-pointer")
                              : "bg-muted border-2 border-border text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        {completed ? <CheckCircle2 className="w-7 h-7" /> : unlocked && hasContent ? <Target className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                      </button>
                      <p className={cn("text-xs font-semibold text-center mt-1.5 max-w-[100px]", !unlocked && "text-muted-foreground")}>
                        {lesson.title}
                      </p>
                      {lesson.duration_minutes && <p className="text-[10px] text-muted-foreground text-center">{lesson.duration_minutes}m</p>}
                    </motion.div>
                  );
                })}

                {/* Unit Quiz Node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: mi * 0.08 + module.lessons.length * 0.05 }}
                  className="relative mt-2"
                >
                  <div className="absolute -top-5 left-1/2 w-0.5 h-5 bg-border" />
                  <button
                    disabled={!quizUnlocked}
                    onClick={() => {
                      if (quizUnlocked) {
                        toast.info("Unit quiz coming soon! Complete all lessons first.");
                      }
                    }}
                    className={cn(
                      "relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2",
                      unitCompleted
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-lg"
                        : quizUnlocked
                          ? "bg-amber-50 border-amber-400 text-amber-600 hover:scale-105 shadow-md cursor-pointer"
                          : "bg-muted border-border text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {unitCompleted ? <Award className="w-6 h-6" /> : quizUnlocked ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    <span className="text-[9px] font-bold">QUIZ</span>
                  </button>
                  <p className="text-xs font-bold text-center mt-1.5 max-w-[100px]">
                    {unitCompleted ? "✓ Complete" : "Unit Quiz"}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursePlayer;
