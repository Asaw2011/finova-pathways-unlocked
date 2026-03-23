import { useState, useEffect } from "react";
import { Crown, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const OFFER_EXPIRY_KEY = "finova_special_offer_expiry";
const OFFER_CLAIMED_KEY = "finova_special_offer_claimed";

interface Props {
  open: boolean;
  onDismiss: () => void;
  onMarkShown: () => void;
}

const SpecialOfferModal = ({ open, onDismiss, onMarkShown }: Props) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!open) return;
    onMarkShown();

    // Set expiry if not already set
    let expiry = localStorage.getItem(OFFER_EXPIRY_KEY);
    if (!expiry) {
      const exp = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      localStorage.setItem(OFFER_EXPIRY_KEY, String(exp));
      expiry = String(exp);
    }

    const tick = () => {
      const diff = Math.max(0, parseInt(expiry!, 10) - Date.now());
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [open, onMarkShown]);

  const handleClaim = () => {
    localStorage.setItem(OFFER_CLAIMED_KEY, "true");
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
          className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
            className="bg-card border-2 border-amber-400 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative overflow-hidden"
          >
            {/* Gold shimmer BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20 pointer-events-none" />

            <div className="relative">
              <button onClick={onDismiss} className="absolute -top-2 -right-2 p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-amber-100 dark:bg-amber-950/30 mb-4">
                <Gift className="w-8 h-8 text-amber-500" />
              </div>

              <h2 className="text-2xl font-extrabold font-display">
                🎁 Special Offer — Just For You
              </h2>

              <p className="text-sm text-muted-foreground mt-2">
                Get <strong className="text-amber-600">40% off</strong> your first year of Premium
              </p>

              <div className="mt-4">
                <span className="text-3xl font-extrabold font-display text-amber-600">$35.99</span>
                <span className="text-lg text-muted-foreground line-through ml-2">$59.99</span>
                <span className="text-sm text-muted-foreground">/year</span>
              </div>

              <div className="mt-3 text-xs text-muted-foreground font-bold">
                Offer expires in <span className="text-amber-600 font-extrabold tabular-nums">{timeLeft}</span>
              </div>

              <Button
                onClick={handleClaim}
                className="w-full mt-5 rounded-xl font-bold text-base py-3 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white shadow-lg animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
              >
                <Crown className="w-5 h-5 mr-2" />
                Claim Offer
              </Button>

              <button onClick={onDismiss} className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-3 block mx-auto">
                No thanks
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpecialOfferModal;
