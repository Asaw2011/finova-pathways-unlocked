import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const roles = [
  { emoji: "🎓", label: "Student (high school or college)", value: "student" },
  { emoji: "💼", label: "Working professional", value: "professional" },
  { emoji: "🏠", label: "Managing a household", value: "household" },
  { emoji: "🔄", label: "Career changer", value: "career_changer" },
  { emoji: "🧓", label: "Planning for retirement", value: "retirement" },
];

const interests = [
  { emoji: "💰", label: "Budgeting & saving", value: "budgeting" },
  { emoji: "💳", label: "Credit & debt management", value: "credit" },
  { emoji: "📈", label: "Investing basics", value: "investing" },
  { emoji: "🏠", label: "Buying a home", value: "home" },
  { emoji: "💵", label: "Understanding taxes", value: "taxes" },
  { emoji: "🎮", label: "Just exploring — surprise me!", value: "explore" },
];

const levels = [
  { emoji: "🌱", label: "Total beginner", desc: "\"What's an APR?\"", value: "beginner" },
  { emoji: "🌿", label: "Some basics", desc: "\"I have a budget... sometimes\"", value: "basics" },
  { emoji: "🌳", label: "Intermediate", desc: "\"I invest but want to learn more\"", value: "intermediate" },
  { emoji: "🌲", label: "Advanced", desc: "\"I want to master the details\"", value: "advanced" },
];

const dailyGoals = [
  { emoji: "🐢", label: "Casual", desc: "1 lesson/day (5 min)", value: "casual", lessons: 1 },
  { emoji: "🐇", label: "Regular", desc: "2 lessons/day (10 min)", value: "regular", lessons: 2 },
  { emoji: "🐆", label: "Serious", desc: "3 lessons/day (15 min)", value: "serious", lessons: 3 },
  { emoji: "🦅", label: "Intense", desc: "5 lessons/day (25 min)", value: "intense", lessons: 5 },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const OnboardingModal = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const { earnGems } = useGameEconomy();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [finishing, setFinishing] = useState(false);

  const toggleInterest = (v: string) => {
    setSelectedInterests(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 5 ? [...prev, v] : prev
    );
  };

  const handleFinish = async () => {
    if (!user || finishing) return;
    setFinishing(true);

    // Save profile to localStorage
    const profile = { role, interests: selectedInterests, level, dailyGoal };
    localStorage.setItem(`finova_user_profile_${user.id}`, JSON.stringify(profile));

    // Update Supabase
    const { data: existing } = await supabase.from("financial_profiles").select("id").eq("user_id", user.id).maybeSingle();
    const fpData = {
      primary_goal: selectedInterests[0] || "explore",
      knowledge_level: level,
      learning_pace: dailyGoal,
      life_stage: role,
    };
    if (existing) {
      await supabase.from("financial_profiles").update(fpData).eq("user_id", user.id);
    } else {
      await supabase.from("financial_profiles").insert({ user_id: user.id, ...fpData });
    }

    await earnGems(100);
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
    localStorage.setItem(`finova_onboarded_${user.id}`, "true");

    // Show ready animation briefly
    setStep(4);
    setTimeout(() => {
      onClose();
      navigate("/learning-path");
    }, 2000);
  };

  if (!open) return null;

  const stepIndicator = (
    <div className="flex items-center gap-2 justify-center mb-8">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={cn(
          "h-1.5 rounded-full transition-all duration-300",
          i === step ? "w-8 bg-primary" : i < step ? "w-6 bg-primary/50" : "w-6 bg-muted"
        )} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-lg px-6 py-10">
        <AnimatePresence mode="wait">
          {/* STEP 0 — Role */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6">
              {stepIndicator}
              <div className="text-center">
                <p className="text-4xl mb-3">🎉</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Welcome to FinOva!</h1>
                <p className="text-muted-foreground text-sm mt-2">Let's personalize your journey</p>
              </div>
              <div>
                <p className="text-sm font-bold mb-3">What best describes you?</p>
                <div className="space-y-2">
                  {roles.map(r => (
                    <button key={r.value} onClick={() => setRole(r.value)}
                      className={cn(
                        "w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-sm flex items-center gap-3",
                        role === r.value ? "border-primary bg-primary/5" : "border-border"
                      )}>
                      <span className="text-2xl">{r.emoji}</span>
                      <span className="text-sm font-semibold">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={() => setStep(1)} disabled={!role} className="w-full rounded-xl font-bold h-12 text-sm">
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 1 — Interests */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6">
              {stepIndicator}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">What do you want to learn?</h1>
                <p className="text-muted-foreground text-sm mt-2">Pick 1–5 topics that interest you</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {interests.map(i => {
                  const selected = selectedInterests.includes(i.value);
                  return (
                    <button key={i.value} onClick={() => toggleInterest(i.value)}
                      className={cn(
                        "rounded-2xl border-2 p-4 text-center transition-all hover:shadow-sm relative",
                        selected ? "border-primary bg-primary/5" : "border-border"
                      )}>
                      {selected && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />}
                      <span className="text-2xl block mb-1">{i.emoji}</span>
                      <p className="text-xs font-bold">{i.label}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl font-bold flex-1">Back</Button>
                <Button onClick={() => setStep(2)} disabled={selectedInterests.length === 0} className="rounded-xl font-bold flex-[2] h-12">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Level */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6">
              {stepIndicator}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">How much do you know?</h1>
                <p className="text-muted-foreground text-sm mt-2">We'll tailor content to your level</p>
              </div>
              <div className="space-y-2">
                {levels.map(l => (
                  <button key={l.value} onClick={() => setLevel(l.value)}
                    className={cn(
                      "w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-sm",
                      level === l.value ? "border-primary bg-primary/5" : "border-border"
                    )}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{l.emoji}</span>
                      <div>
                        <p className="text-sm font-bold">{l.label}</p>
                        <p className="text-xs text-muted-foreground">{l.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl font-bold flex-1">Back</Button>
                <Button onClick={() => setStep(3)} disabled={!level} className="rounded-xl font-bold flex-[2] h-12">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Daily Goal */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6">
              {stepIndicator}
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">Set your daily goal</h1>
                <p className="text-muted-foreground text-sm mt-2">Consistency beats intensity — pick what works for you</p>
              </div>
              <div className="space-y-2">
                {dailyGoals.map(g => (
                  <button key={g.value} onClick={() => setDailyGoal(g.value)}
                    className={cn(
                      "w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-sm",
                      dailyGoal === g.value ? "border-primary bg-primary/5" : "border-border"
                    )}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{g.emoji}</span>
                      <div>
                        <p className="text-sm font-bold">{g.label}</p>
                        <p className="text-xs text-muted-foreground">{g.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl font-bold flex-1">Back</Button>
                <Button onClick={handleFinish} disabled={!dailyGoal || finishing} className="rounded-xl font-bold flex-[2] h-12">
                  {finishing ? "Setting up..." : "Start Learning →"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Ready */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                <Sparkles className="w-16 h-16 text-primary mx-auto" />
              </motion.div>
              <h1 className="text-3xl font-extrabold font-display">Your path is ready! 🚀</h1>
              <p className="text-muted-foreground text-sm">Loading your personalized experience...</p>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 max-w-xs mx-auto">
                <p className="text-sm font-bold text-primary">🎁 100 starter gems earned!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingModal;
