import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AssessmentStep {
  id: string;
  question: string;
  options: { value: string; label: string; emoji: string }[];
}

const steps: AssessmentStep[] = [
  {
    id: "life_stage",
    question: "Which best describes you?",
    options: [
      { value: "teen", label: "Teen (13–17)", emoji: "🎒" },
      { value: "young_adult", label: "Young Adult (18–24)", emoji: "🎓" },
      { value: "mid_career", label: "Working Adult (25+)", emoji: "💼" },
      { value: "parent", label: "Parent", emoji: "👨‍👧" },
    ],
  },
  {
    id: "primary_goal",
    question: "What's your #1 money goal?",
    options: [
      { value: "save", label: "Build savings", emoji: "🏦" },
      { value: "invest", label: "Start investing", emoji: "📈" },
      { value: "debt", label: "Get out of debt", emoji: "💳" },
      { value: "earn", label: "Earn more money", emoji: "💰" },
    ],
  },
  {
    id: "knowledge",
    question: "How much do you know about money?",
    options: [
      { value: "beginner", label: "Total beginner", emoji: "🌱" },
      { value: "some", label: "Know the basics", emoji: "📚" },
      { value: "intermediate", label: "Pretty comfortable", emoji: "🧠" },
      { value: "advanced", label: "I want the hard stuff", emoji: "🚀" },
    ],
  },
  {
    id: "pace",
    question: "How do you want to learn?",
    options: [
      { value: "quick", label: "5 min daily bites", emoji: "⚡" },
      { value: "moderate", label: "10–15 min sessions", emoji: "☕" },
      { value: "deep", label: "20+ min deep dives", emoji: "🏊" },
    ],
  },
];

interface FinancialAssessmentProps {
  onComplete: () => void;
}

const FinancialAssessment = ({ onComplete }: FinancialAssessmentProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const selectedValue = answers[step.id];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  const handleNext = async () => {
    if (!selectedValue) return;

    if (isLastStep) {
      setSaving(true);
      try {
        if (user) {
          await supabase.from("financial_profiles" as any).upsert({
            user_id: user.id,
            life_stage: answers.life_stage,
            primary_goal: answers.primary_goal,
            knowledge_level: answers.knowledge,
            learning_pace: answers.pace,
          } as any, { onConflict: "user_id" });
        }
        toast.success("Profile saved! Your learning path is personalized.");
        onComplete();
      } catch {
        toast.error("Couldn't save profile. You can update it later.");
        onComplete();
      } finally {
        setSaving(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all",
                i <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-extrabold font-display mb-6">{step.question}</h2>

            <div className="space-y-3">
              {step.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all",
                    selectedValue === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 bg-card"
                  )}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-bold text-sm flex-1">{option.label}</span>
                  {selectedValue === option.value && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <Button
          onClick={handleNext}
          disabled={!selectedValue || saving}
          className="w-full mt-8 py-6 text-base font-bold rounded-2xl"
          size="lg"
        >
          {saving ? "Saving..." : isLastStep ? "Start Learning" : "Continue"}
          {!saving && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Step {currentStep + 1} of {steps.length} · Takes about 1 minute
        </p>
      </div>
    </div>
  );
};

export default FinancialAssessment;
