import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AssessmentStep {
  id: string;
  question: string;
  options: { value: string; label: string; emoji: string }[];
  plusOnly?: boolean;
}

const baseSteps: AssessmentStep[] = [
  {
    id: "life_stage",
    question: "Which best describes you?",
    options: [
      { value: "teen", label: "Teen (13–17)", emoji: "🎒" },
      { value: "young_adult", label: "Young Adult (18–24)", emoji: "🎓" },
      { value: "mid_career", label: "Working Adult (25–44)", emoji: "💼" },
      { value: "established", label: "Established (45+)", emoji: "🏠" },
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

const plusSteps: AssessmentStep[] = [
  {
    id: "income_range",
    question: "What's your approximate annual income?",
    plusOnly: true,
    options: [
      { value: "under_25k", label: "Under $25,000", emoji: "💵" },
      { value: "25k_50k", label: "$25,000–$50,000", emoji: "💰" },
      { value: "50k_100k", label: "$50,000–$100,000", emoji: "💎" },
      { value: "over_100k", label: "Over $100,000", emoji: "🏆" },
    ],
  },
  {
    id: "debt_level",
    question: "How would you describe your current debt?",
    plusOnly: true,
    options: [
      { value: "none", label: "Debt-free", emoji: "✅" },
      { value: "low", label: "Manageable debt", emoji: "📊" },
      { value: "moderate", label: "Struggling a bit", emoji: "⚠️" },
      { value: "high", label: "Overwhelmed by debt", emoji: "🆘" },
    ],
  },
  {
    id: "investing_experience",
    question: "What's your investing experience?",
    plusOnly: true,
    options: [
      { value: "none", label: "Never invested", emoji: "🌱" },
      { value: "beginner", label: "Just started", emoji: "📈" },
      { value: "some", label: "A few years", emoji: "📊" },
      { value: "experienced", label: "Seasoned investor", emoji: "🧠" },
    ],
  },
  {
    id: "risk_tolerance",
    question: "How do you feel about financial risk?",
    plusOnly: true,
    options: [
      { value: "conservative", label: "Play it safe", emoji: "🛡️" },
      { value: "moderate", label: "Balanced approach", emoji: "⚖️" },
      { value: "aggressive", label: "Higher risk, higher reward", emoji: "🚀" },
    ],
  },
];

interface FinancialAssessmentProps {
  onComplete: () => void;
  isPlusUser?: boolean;
  isRedo?: boolean;
}

const FinancialAssessment = ({ onComplete, isPlusUser = false, isRedo = false }: FinancialAssessmentProps) => {
  const { user } = useAuth();
  const steps = isPlusUser ? [...baseSteps, ...plusSteps] : baseSteps;
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
        toast.success(isRedo ? "Profile updated! Your learning path is now personalized." : "Profile saved! Your learning path is personalized.");
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
        {/* Header */}
        {!isRedo && (
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-extrabold font-display">Let's personalize your experience</h1>
            <p className="text-sm text-muted-foreground mt-1">Answer a few questions so we can tailor your learning path</p>
          </div>
        )}

        {isRedo && (
          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold font-display">Update Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Let us know if anything has changed</p>
          </div>
        )}

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((s, i) => (
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
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-2xl font-extrabold font-display">{step.question}</h2>
              {step.plusOnly && (
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Plus
                </span>
              )}
            </div>

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
          {saving ? "Saving..." : isLastStep ? (isRedo ? "Update Profile" : "Start Learning") : "Continue"}
          {!saving && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
};

export default FinancialAssessment;
