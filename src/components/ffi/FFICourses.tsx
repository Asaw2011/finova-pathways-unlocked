import { BookOpen, Wallet, Landmark, PiggyBank, ChevronRight } from "lucide-react";
import { useState } from "react";

const courses = [
  {
    icon: Wallet,
    title: "Money Basics",
    color: "text-primary",
    lessons: [
      { title: "Where Your Money Goes", desc: "Track spending habits and understand cash flow in your daily life." },
      { title: "Budgeting Made Simple", desc: "Create a simple budget using the 50/30/20 rule." },
      { title: "Needs vs Wants", desc: "Learn to prioritize essential expenses over impulse buys." },
      { title: "Building an Emergency Fund", desc: "Why every teen needs a rainy-day fund and how to start one." },
    ],
  },
  {
    icon: Landmark,
    title: "Banking & Credit",
    color: "text-primary",
    lessons: [
      { title: "Debit vs Credit Cards", desc: "Understand the difference and when to use each one." },
      { title: "How Credit Scores Work", desc: "What makes up your score and why it matters for your future." },
      { title: "Avoiding Debt Traps", desc: "Recognize predatory lending, payday loans, and minimum payment traps." },
      { title: "Using Credit Responsibly", desc: "Build credit early without getting into trouble." },
    ],
  },
  {
    icon: BookOpen,
    title: "Taxes & Income",
    color: "text-primary",
    lessons: [
      { title: "Gross vs Net Income", desc: "Why your paycheck is smaller than you expected." },
      { title: "Understanding Your Paycheck", desc: "Read pay stubs and know where deductions go." },
      { title: "W-2s and Tax Basics", desc: "Key tax forms you'll encounter at your first job." },
      { title: "Filing Taxes for the First Time", desc: "Step-by-step walkthrough of filing a simple tax return." },
    ],
  },
  {
    icon: PiggyBank,
    title: "Saving & Investing",
    color: "text-primary",
    lessons: [
      { title: "Saving vs Investing", desc: "When to save in a bank and when to invest for growth." },
      { title: "What Are Stocks and ETFs", desc: "Simple explanations of the most common investment types." },
      { title: "Compound Interest", desc: "The 'eighth wonder of the world' and how it builds wealth." },
      { title: "Long-Term Wealth Building", desc: "Strategies for growing money over decades, not days." },
    ],
  },
];

const FFICourses = () => {
  const [openCourse, setOpenCourse] = useState<number | null>(0);

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display">
          Course <span className="gradient-text">Tracks</span>
        </h2>
      </div>
      <p className="text-muted-foreground mb-8 max-w-2xl">
        Four structured tracks covering everything from basic money skills to investing. Each course has 4 lessons with real-world examples.
      </p>

      <div className="space-y-4">
        {courses.map((course, ci) => {
          const Icon = course.icon;
          const isOpen = openCourse === ci;
          return (
            <div key={course.title} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenCourse(isOpen ? null : ci)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.lessons.length} lessons</p>
                </div>
                {/* Progress placeholder */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 rounded-full" style={{ width: "0%" }} />
                  </div>
                  <span className="text-xs text-muted-foreground">0%</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 pb-5 pt-3 space-y-2">
                  {course.lessons.map((lesson, li) => (
                    <div key={lesson.title} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {li + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FFICourses;
