import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const goals = [
  { emoji: "💰", label: "Learn to budget & save", value: "save" },
  { emoji: "📈", label: "Understand investing", value: "invest" },
  { emoji: "💳", label: "Build my credit", value: "credit" },
  { emoji: "🏦", label: "Master all money skills", value: "all" },
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
  const [name, setName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");

  const handleStep1 = async () => {
    if (!name.trim() || !user) return;
    await supabase.from("profiles").update({ display_name: name.trim() }).eq("user_id", user.id);
    setStep(1);
  };

  const handleStep2 = async () => {
    if (!selectedGoal || !user) return;
    // Upsert financial profile with goal
    const { data: existing } = await supabase.from("financial_profiles").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("financial_profiles").update({ primary_goal: selectedGoal }).eq("user_id", user.id);
    } else {
      await supabase.from("financial_profiles").insert({ user_id: user.id, primary_goal: selectedGoal });
    }
    setStep(2);
  };

  const handleFinish = async () => {
    if (!user) return;
    await earnGems(100);
    await supabase.from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
    localStorage.setItem(`finova_onboarded_${user.id}`, "true");
    onClose();
    navigate("/learning-path");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="p-8 text-center space-y-5">
              <p className="text-4xl">🎉</p>
              <h2 className="text-2xl font-extrabold font-display">Welcome to FinOva!</h2>
              <p className="text-muted-foreground text-sm">You're about to learn money skills that schools don't teach. It takes 5 minutes a day.</p>
              <div className="space-y-2 text-left">
                <label className="text-sm font-bold">What's your name?</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name..." className="rounded-xl" />
              </div>
              <Button onClick={handleStep1} disabled={!name.trim()} className="w-full rounded-xl font-bold h-11">
                Let's go →
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="p-8 text-center space-y-5">
              <h2 className="text-2xl font-extrabold font-display">What's your main goal?</h2>
              <div className="grid grid-cols-2 gap-3">
                {goals.map(g => (
                  <button key={g.value} onClick={() => setSelectedGoal(g.value)}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-center transition-all hover:shadow-md",
                      selectedGoal === g.value ? "border-primary bg-primary/5" : "border-border"
                    )}>
                    <span className="text-3xl block mb-2">{g.emoji}</span>
                    <p className="text-xs font-bold">{g.label}</p>
                  </button>
                ))}
              </div>
              <Button onClick={handleStep2} disabled={!selectedGoal} className="w-full rounded-xl font-bold h-11">
                Next →
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              className="p-8 text-center space-y-5">
              <p className="text-4xl">🚀</p>
              <h2 className="text-2xl font-extrabold font-display">You're all set, {name}!</h2>
              <p className="text-muted-foreground text-sm">Your personalized learning path is ready. Start with Module 1 — Money Basics.</p>
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                <p className="text-sm font-bold text-cyan-700">🎁 You've been given 100 starter gems!</p>
              </div>
              <Button onClick={handleFinish} className="w-full rounded-xl font-bold h-11">
                Start Learning →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
