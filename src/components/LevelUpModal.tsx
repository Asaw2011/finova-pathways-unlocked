import { useEffect } from "react";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const LevelUpModal = () => {
  const { showLevelUp, dismissLevelUp, xp } = useGameEconomy();

  useEffect(() => {
    if (showLevelUp) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 }, colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ec4899"] });
    }
  }, [showLevelUp]);

  return (
    <AnimatePresence>
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl"
          >
            <div className="text-5xl">🎉</div>

            <h2 className="text-3xl font-extrabold font-display">Level Up!</h2>

            <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center bg-primary/10 border-4 border-primary">
              <span className="text-4xl font-black text-primary">{showLevelUp}</span>
            </div>

            <p className="text-sm text-muted-foreground">
              You've reached <strong>{xp.toLocaleString()} XP</strong> — keep going!
            </p>

            <Button onClick={dismissLevelUp} className="w-full rounded-xl font-bold">
              Keep Learning! 🚀
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;
