import { Sparkles, BookOpen, Gamepad2, GraduationCap, Users, Target } from "lucide-react";

const steps = [
  { icon: BookOpen, label: "Learn the Basics", desc: "Watch videos and understand core financial concepts." },
  { icon: Gamepad2, label: "Play Money Games", desc: "Practice budgeting, sorting needs vs wants, and investing." },
  { icon: GraduationCap, label: "Take Short Courses", desc: "Complete structured 4-lesson tracks on key topics." },
  { icon: Users, label: "Join Workshops", desc: "Attend FFI live workshops and community events." },
  { icon: Target, label: "Build Real Skills", desc: "Apply what you've learned to real-life money decisions." },
];

const FFILearningPath = () => (
  <section className="mb-16">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <h2 className="text-2xl font-bold font-display">
        Your Financial <span className="gradient-text">Literacy Path</span>
      </h2>
    </div>
    <p className="text-muted-foreground mb-8 max-w-2xl">
      Follow this step-by-step path to go from financial beginner to confident money manager.
    </p>

    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

      <div className="space-y-6">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-start gap-4 relative">
              <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center z-10 relative">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="glass rounded-xl p-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary">STEP {i + 1}</span>
                </div>
                <h3 className="font-display font-bold">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default FFILearningPath;
