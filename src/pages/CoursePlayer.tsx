import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, FileText, Gamepad2, HelpCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CourseQuiz from "@/components/courses/CourseQuiz";

const lessonIcons: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  reading: FileText,
  exercise: Gamepad2,
  quiz: HelpCircle,
};

const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeQuizLesson, setActiveQuizLesson] = useState<string | null>(null);

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
      const lessonIds = modules?.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
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
    mutationFn: async (lessonId: string) => {
      const { error } = await supabase.from("user_progress").upsert(
        { user_id: user!.id, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-progress"] });
      await queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      toast.success("Lesson completed! 🎉");

      // Check if all lessons complete → auto-certificate
      const allLessonIds = modules?.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
      const { data: latestProgress } = await supabase.from("user_progress").select("*").eq("user_id", user!.id).in("lesson_id", allLessonIds);
      const completedIds = new Set(latestProgress?.filter(p => p.completed).map(p => p.lesson_id) ?? []);

      if (allLessonIds.length > 0 && allLessonIds.every(id => completedIds.has(id)) && !existingCert) {
        const certNumber = `FIN-${courseId!.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        const { error: certError } = await supabase.from("certificates").insert({
          user_id: user!.id,
          course_id: courseId!,
          certificate_number: certNumber,
          score: 100,
        });
        if (!certError) {
          toast.success("🎓 Certificate earned! Check your Certificates page.", { duration: 5000 });
          queryClient.invalidateQueries({ queryKey: ["course-cert"] });
          queryClient.invalidateQueries({ queryKey: ["certificates"] });
        }
      }
    },
  });

  const allLessons = modules?.flatMap((m) => m.lessons) ?? [];
  const completedIds = new Set(progress?.filter((p) => p.completed).map((p) => p.lesson_id));
  const progressPercent = allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0;

  if (!course) {
    return <div className="animate-fade-in"><div className="glass rounded-xl p-8 text-center"><p className="text-muted-foreground">Loading course...</p></div></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">{course.category}</span>
              <span className="text-xs text-muted-foreground capitalize">{course.difficulty}</span>
            </div>
            <h1 className="text-3xl font-bold font-display">{course.title}</h1>
            <p className="text-muted-foreground mt-1">{course.description}</p>
          </div>
          {existingCert && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/10 border border-gold/20">
              <Award className="w-5 h-5 text-gold" />
              <span className="text-sm font-semibold text-gold">Certified ✓</span>
            </div>
          )}
        </div>

        <div className="mt-4 glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-primary font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%`, background: "var(--gradient-primary)" }} />
          </div>
          {progressPercent === 100 && !existingCert && (
            <p className="text-xs text-primary mt-2">🎓 All lessons complete — certificate awarded!</p>
          )}
        </div>
      </div>

      {/* Active Quiz */}
      {activeQuizLesson && (
        <CourseQuiz
          lessonTitle={allLessons.find(l => l.id === activeQuizLesson)?.title ?? ""}
          onComplete={() => {
            completeMutation.mutate(activeQuizLesson);
            setActiveQuizLesson(null);
          }}
          onCancel={() => setActiveQuizLesson(null)}
        />
      )}

      {/* Modules */}
      <div className="space-y-4">
        {modules?.map((module, mi) => (
          <div key={module.id} className="glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-semibold">Module {mi + 1}: {module.title}</h3>
              {module.description && <p className="text-sm text-muted-foreground mt-1">{module.description}</p>}
            </div>
            <div className="divide-y divide-border">
              {module.lessons.map((lesson) => {
                const Icon = lessonIcons[lesson.type] || FileText;
                const completed = completedIds.has(lesson.id);
                return (
                  <div key={lesson.id} className={cn("flex items-center justify-between p-4 transition-colors", completed ? "bg-primary/5" : "hover:bg-secondary/50")}>
                    <div className="flex items-center gap-3">
                      {completed ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{lesson.title}</span>
                        {lesson.duration_minutes && <span className="text-xs text-muted-foreground ml-2">{lesson.duration_minutes} min</span>}
                      </div>
                    </div>
                    {!completed && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setActiveQuizLesson(lesson.id)}>
                          <HelpCircle className="w-3 h-3 mr-1" /> Quiz
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => completeMutation.mutate(lesson.id)} disabled={completeMutation.isPending}>
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {(!modules || modules.length === 0) && (
          <div className="glass rounded-xl p-8 text-center"><p className="text-muted-foreground">No modules added yet.</p></div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
