import { Crown, Lock, Flame, Gamepad2, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  variant: "soft_gate" | "hearts" | "streak" | "game_lock";
  open: boolean;
  onDismiss: () => void;
  // Optional context data
  lessonTitle?: string;
  streakCount?: number;
  lessonsInStreak?: number;
  gameName?: string;
  heartsPromptCount?: number;
}

const variantConfig = {
  soft_gate: {
    icon: Lock,
    title: "This lesson is part of Premium",
    iconBg: "bg-amber-100 dark:bg-amber-950/30",
    iconColor: "text-amber-500",
  },
  hearts: {
    icon: Heart,
    title: "Out of Hearts",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  streak: {
    icon: Flame,
    title: "Your streak is about to break!",
    iconBg: "bg-duo-orange/10",
    iconColor: "text-duo-orange",
  },
  game_lock: {
    icon: Gamepad2,
    title: "This game is Premium only",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
};

const PremiumUpgradePrompt = ({
  variant,
  open,
  onDismiss,
  lessonTitle,
  streakCount,
  lessonsInStreak,
  gameName,
  heartsPromptCount,
}: Props) => {
  const navigate = useNavigate();
  const config = variantConfig[variant];
  const Icon = config.icon;

  const goToPremium = () => {
    onDismiss();
    navigate("/plus");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="flex justify-end mb-2">
              <button onClick={onDismiss} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${config.iconBg}`}>
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
              </div>

              <h3 className="text-xl font-extrabold font-display">{config.title}</h3>

              {/* Variant-specific content */}
              {variant === "soft_gate" && (
                <div className="space-y-3">
                  {lessonTitle && (
                    <p className="text-sm text-muted-foreground">
                      <strong>"{lessonTitle}"</strong> is available with FinOva Plus.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Get unlimited access to all modules, lessons, and premium features.
                  </p>
                </div>
              )}

              {variant === "hearts" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Hearts regenerate 1 every 30 minutes, or go premium for unlimited.
                  </p>
                  {(heartsPromptCount ?? 0) >= 3 && (
                    <p className="text-xs font-bold text-amber-600">
                      Most learners upgrade at this point to keep their momentum 🚀
                    </p>
                  )}
                </div>
              )}

              {variant === "streak" && (
                <div className="space-y-3">
                  <p className="text-2xl font-extrabold text-duo-orange">😱</p>
                  <p className="text-sm text-muted-foreground">
                    Your <strong>{streakCount}-day streak</strong> is about to break!
                  </p>
                  {lessonsInStreak && lessonsInStreak > 0 && (
                    <p className="text-xs text-muted-foreground">
                      You've completed <strong>{lessonsInStreak} lessons</strong> in this streak.
                    </p>
                  )}
                </div>
              )}

              {variant === "game_lock" && (
                <div className="space-y-3">
                  {gameName && (
                    <p className="text-sm text-muted-foreground">
                      <strong>{gameName}</strong> is available with FinOva Plus.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Play all 13 financial games to master money skills.
                  </p>
                </div>
              )}

              <Button
                onClick={goToPremium}
                className="w-full rounded-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white shadow-md"
              >
                <Crown className="w-4 h-4 mr-2" />
                {variant === "soft_gate" ? "Unlock All Lessons" :
                 variant === "hearts" ? "Get Unlimited Hearts" :
                 variant === "streak" ? "Get Streak Freezes" :
                 "Play All 13 Games"}
              </Button>

              <button onClick={onDismiss} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumUpgradePrompt;
