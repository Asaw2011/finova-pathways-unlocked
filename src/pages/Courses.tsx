import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Lock, Crown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Button } from "@/components/ui/button";

const Courses = () => {
  const { user } = useAuth();
  const { hasAccess: isPremium } = usePremiumAccess();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*, modules(id, lessons(id))").order("sort_order");
      return data ?? [];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["all-progress", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_progress").select("lesson_id, completed").eq("user_id", user!.id).eq("completed", true);
      return new Set(data?.map(p => p.lesson_id) ?? []);
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Courses</h1>
        <p className="text-muted-foreground mt-1">Build your financial knowledge step by step</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse h-32" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {courses?.map((course, i) => {
            const totalLessons = course.modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length ?? 0), 0) ?? 0;
            const completedLessons = course.modules?.reduce((sum: number, m: any) => {
              return sum + (m.lessons?.filter((l: any) => progress?.has(l.id)).length ?? 0);
            }, 0) ?? 0;
            const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            // Plus users can access ALL courses — no lock
            const locked = course.is_premium && !isPremium;
            const unitCount = course.modules?.length ?? 0;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {locked ? (
                  <div className="relative bg-card rounded-2xl border border-border p-5 overflow-hidden">
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-2">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                      <Link to="/plus">
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-amber-500" /> Upgrade to Plus
                        </Button>
                      </Link>
                    </div>
                    <div className="opacity-50">
                      <CourseCardContent course={course} unitCount={unitCount} totalLessons={totalLessons} progressPct={0} />
                    </div>
                  </div>
                ) : (
                  <Link to={`/courses/${course.id}`} className="block bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all group">
                    <CourseCardContent course={course} unitCount={unitCount} totalLessons={totalLessons} progressPct={progressPct} />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CourseCardContent = ({ course, unitCount, totalLessons, progressPct }: { course: any; unitCount: number; totalLessons: number; progressPct: number }) => (
  <>
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{course.category}</span>
        {course.is_premium && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 flex items-center gap-1">
            <Crown className="w-3 h-3" /> Plus
          </span>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
    <h3 className="font-display font-extrabold text-lg mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{course.description}</p>
    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mb-2">
      <span>{unitCount} units</span>
      <span>{totalLessons} lessons</span>
      {course.estimated_hours && <span>~{course.estimated_hours}h</span>}
    </div>
    {progressPct > 0 && (
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 bg-primary" style={{ width: `${progressPct}%` }} />
      </div>
    )}
  </>
);

export default Courses;
