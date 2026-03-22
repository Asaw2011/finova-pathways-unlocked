import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const courseCatalog = [
  {
    category: "Fundamentals",
    courses: [
      { title: "Fundamentals of Money", level: "Beginner", hours: 8, modules: 5, desc: "Earning, budgeting, banking, credit — the essential financial foundation.", premium: false },
    ],
  },
  {
    category: "Personal Finance",
    courses: [
      { title: "Budgeting & Personal Finance", level: "Beginner", hours: 6, modules: 4, desc: "Zero-based budgeting, 50/30/20 rule, saving strategies, and goal-based planning.", premium: false },
    ],
  },
  {
    category: "Safety & Banking",
    courses: [
      { title: "Banking, Payments & Safety", level: "Beginner", hours: 5, modules: 3, desc: "Digital payments, fraud prevention, identity protection in the modern financial world.", premium: false },
    ],
  },
  {
    category: "Credit",
    courses: [
      { title: "Credit & Borrowing", level: "Intermediate", hours: 7, modules: 4, desc: "Credit scores, reports, loans, interest types, amortization, responsible credit card use.", premium: false },
    ],
  },
  {
    category: "Investing",
    courses: [
      { title: "Investing Basics", level: "Intermediate", hours: 10, modules: 5, desc: "Stocks, bonds, ETFs, mutual funds, risk, diversification, long-term strategies.", premium: false },
      { title: "Advanced Investing & Quant Strategy", level: "Advanced", hours: 15, modules: 6, desc: "Time-series analysis, factor investing, backtesting, quantitative methodology.", premium: true },
    ],
  },
  {
    category: "Business",
    courses: [
      { title: "Entrepreneurship & Business Basics", level: "Intermediate", hours: 8, modules: 4, desc: "Side hustles, business models, simple finance, taxes for small businesses.", premium: false },
    ],
  },
  {
    category: "Life Skills",
    courses: [
      { title: "Real-World Money Management", level: "Beginner", hours: 6, modules: 4, desc: "Filing taxes, renting, leases, student loans, insurance fundamentals.", premium: false },
    ],
  },
  {
    category: "Psychology",
    courses: [
      { title: "Financial Decision Making", level: "Intermediate", hours: 5, modules: 3, desc: "Behavioral biases, heuristics, decision frameworks, career & salary negotiation.", premium: false },
    ],
  },
];

const CoursesPreview = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Course <span className="gradient-text">Catalog</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              9+ expert-created courses covering every aspect of financial literacy. Each course includes 3-6 modules with interactive lessons, exercises, quizzes, and capstone projects.
            </p>
          </div>

          <div className="space-y-8">
            {courseCatalog.map(({ category, courses }) => (
              <div key={category}>
                <h2 className="text-lg font-bold font-display mb-3 text-primary">{category}</h2>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.title} className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold">{course.title}</h3>
                          {course.premium && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold/10 gradient-gold flex items-center gap-1">
                              <Lock className="w-3 h-3" /> ELITE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{course.desc}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{course.level}</span>
                          <span>{course.modules} modules</span>
                          <span>~{course.hours} hours</span>
                        </div>
                      </div>
                      <Link to="/auth">
                        <Button size="sm" variant="outline">
                          Start <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/auth">
              <Button size="lg" className="glow-primary">
                Start Learning Free <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default CoursesPreview;
