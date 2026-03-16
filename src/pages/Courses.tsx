import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Courses = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const categories = [...new Set(courses?.map((c) => c.category) ?? [])];

  const filtered = courses?.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-extrabold font-display">Courses</h1>
        <p className="text-muted-foreground mt-1">Build your financial knowledge step by step</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter(null)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              !categoryFilter ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                categoryFilter === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-muted-foreground hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6 animate-pulse h-44" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/courses/${course.id}`}
                className="block bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary">
                    {course.category}
                  </span>
                  {course.is_premium && (
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-100 text-amber-700">
                      Premium
                    </span>
                  )}
                </div>
                <h3 className="font-display font-extrabold text-lg mb-1 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                    <span className="capitalize px-2 py-1 rounded-md bg-muted">{course.difficulty}</span>
                    {course.estimated_hours && <span>{course.estimated_hours}h</span>}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">
            {search ? "No courses match your search" : "No courses available yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Courses;
