import { useState, useEffect } from "react";
import { Heart, Clock, Crown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

const OutOfHeartsModal = ({ open, onClose }: Props) => {
  const { heartsRegenTime } = useGameEconomy();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!heartsRegenTime) return;
    const tick = () => {
      const diff = Math.max(0, heartsRegenTime - Date.now());
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [heartsRegenTime]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl"
          >
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-destructive/10">
              <Heart className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-extrabold font-display">Out of Hearts! 💔</h2>
            <p className="text-sm text-muted-foreground">
              Hearts regenerate 1 every 30 minutes
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full rounded-xl font-bold gap-2"
                onClick={onClose}
              >
                <Clock className="w-4 h-4" />
                Wait for hearts {timeLeft && `(${timeLeft})`}
              </Button>

              <Button
                className="w-full rounded-xl font-bold gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-amber-950"
                onClick={() => { onClose(); navigate("/plus"); }}
              >
                <Crown className="w-4 h-4" />
                Go Premium — Unlimited Hearts
              </Button>

              <Button
                variant="secondary"
                className="w-full rounded-xl font-bold gap-2"
                onClick={() => { onClose(); navigate("/mistakes"); }}
              >
                <BookOpen className="w-4 h-4" />
                Review a lesson to earn a heart
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OutOfHeartsModal;
