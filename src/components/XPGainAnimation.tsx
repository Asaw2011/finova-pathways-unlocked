import { AnimatePresence, motion } from "framer-motion";
import { useGameEconomy } from "@/contexts/GameEconomyContext";

const XPGainAnimation = () => {
  const { pendingXPGains } = useGameEconomy();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center gap-2">
      <AnimatePresence>
        {pendingXPGains.map((gain) => (
          <motion.div
            key={gain.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.6 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`px-5 py-2 rounded-full font-extrabold text-sm shadow-lg ${
              gain.isBonus
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950"
                : "bg-gradient-to-r from-emerald-500 to-green-600 text-white"
            }`}
          >
            +{gain.amount} {gain.isBonus ? "BONUS" : "XP"}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default XPGainAnimation;
