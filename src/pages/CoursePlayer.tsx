import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Lock, Circle, ChevronDown, ChevronRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import LessonExperience from "@/components/courses/LessonExperience";

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

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

  // Build ordered flat list for unlock logic
  const allLessonsOrdered = modules?.flatMap(m => m.lessons) ?? [];
  const isUnlocked = (lessonId: string) => {
    const idx = allLessonsOrdered.findIndex(l => l.id === lessonId);
    if (idx === 0) return true;
    return completedIds.has(allLessonsOrdered[idx - 1]?.id);
  };

  const allLessons = allLessonsOrdered;
  const progressPercent = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0;

  const toggleUnit = (id: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Active lesson content
  const activeLessonData = allLessons.find(l => l.id === activeLesson);

  if (!course) {
    return <div className="animate-fade-in"><div className="glass rounded-xl p-8 text-center"><p className="text-muted-foreground">Loading course...</p></div></div>;
  }

  if (activeLesson && activeLessonData?.content) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setActiveLesson(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to course
        </button>
        <LessonExperience
          content={activeLessonData.content as any}
          lessonTitle={activeLessonData.title}
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

      {/* Units accordion */}
      <div className="space-y-3">
        {modules?.map((module, mi) => {
          const unitCompleted = module.lessons.every(l => completedIds.has(l.id));
          const unitLessonsCompleted = module.lessons.filter(l => completedIds.has(l.id)).length;
          const isExpanded = expandedUnits.has(module.id) || module.lessons.some(l => !completedIds.has(l.id) && isUnlocked(l.id));

          return (
            <div key={module.id} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => toggleUnit(module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                    unitCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {unitCompleted ? <CheckCircle2 className="w-4 h-4" /> : mi + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-semibold text-sm">{module.title}</h3>
                    <p className="text-xs text-muted-foreground">{unitLessonsCompleted}/{module.lessons.length} lessons</p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {module.lessons.map((lesson) => {
                    const completed = completedIds.has(lesson.id);
                    const unlocked = isUnlocked(lesson.id);
                    const hasContent = !!lesson.content;

                    return (
                      <button
                        key={lesson.id}
                        disabled={!unlocked || completed}
                        onClick={() => hasContent && unlocked && !completed ? setActiveLesson(lesson.id) : undefined}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 px-4 text-left transition-colors text-sm",
                          completed ? "bg-primary/5" : unlocked && hasContent ? "hover:bg-secondary/50 cursor-pointer" : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : unlocked ? (
                          <Circle className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={cn("font-medium", completed && "text-muted-foreground line-through")}>{lesson.title}</span>
                        {lesson.duration_minutes && <span className="ml-auto text-xs text-muted-foreground">{lesson.duration_minutes}m</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursePlayer;
