import { useState } from "react";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Heart, Diamond, Snowflake, Play, ShoppingBag, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Shop = () => {
  const {
    hearts, maxHearts, gems, streakFreezes,
    buyHeartWithGems, buyFullRefillWithGems, buyStreakFreeze, watchAdForHeart,
    HEART_COST, REFILL_COST, FREEZE_COST,
  } = useGameEconomy();

  const [watchingAd, setWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);

  const handleWatchAd = () => {
    if (hearts >= maxHearts) return;
    setWatchingAd(true);
    setAdTimer(15);
    const interval = setInterval(() => {
      setAdTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          setWatchingAd(false);
          watchAdForHeart();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const gemPacks = [
    { amount: 100, price: "$0.99", label: "Starter Pack", count: 1, best: false },
    { amount: 500, price: "$3.99", label: "Popular Pack", count: 2, best: false },
    { amount: 1200, price: "$7.99", label: "Best Value", count: 3, best: true },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header with balances */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold font-display flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> Shop
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-50 border border-red-200">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-extrabold text-red-600">{hearts}/{maxHearts}</span>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-cyan-50 border border-cyan-200">
            <Diamond className="w-5 h-5 text-cyan-500 fill-cyan-500" />
            <span className="font-extrabold text-cyan-600">{gems}</span>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-200">
            <Snowflake className="w-5 h-5 text-blue-500" />
            <span className="font-extrabold text-blue-600">{streakFreezes}</span>
          </div>
        </div>
      </motion.div>

      {/* Hearts Section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
        <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Hearts
        </h2>
        <p className="text-sm text-muted-foreground">You get 5 hearts daily. Lose one for every wrong answer. No hearts = no lessons!</p>

        <div className="flex gap-1.5">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart
              key={i}
              className={cn("w-8 h-8 transition-all", i < hearts ? "text-red-500 fill-red-500" : "text-muted-foreground/30")}
            />
          ))}
        </div>

        <div className="space-y-2">
          {/* Watch ad */}
          <AnimatePresence mode="wait">
            {watchingAd ? (
              <motion.div key="ad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-xl bg-muted p-6 text-center space-y-3">
                <p className="text-sm font-bold">Watching ad...</p>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-2xl font-extrabold text-primary">{adTimer}</span>
                </div>
                <div className="h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${((15 - adTimer) / 15) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Your heart is coming...</p>
              </motion.div>
            ) : (
              <motion.div key="buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  onClick={handleWatchAd}
                  disabled={hearts >= maxHearts}
                  variant="outline"
                  className="w-full rounded-xl h-12 font-bold justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" /> Watch Ad for 1 Heart
                  </span>
                  <span className="text-xs text-muted-foreground">FREE</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={buyHeartWithGems}
            disabled={gems < HEART_COST || hearts >= maxHearts}
            variant="outline"
            className="w-full rounded-xl h-12 font-bold justify-between"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Buy 1 Heart
            </span>
            <span className="flex items-center gap-1 text-cyan-600">
              <Diamond className="w-3.5 h-3.5 fill-cyan-500" /> {HEART_COST}
            </span>
          </Button>

          <Button
            onClick={buyFullRefillWithGems}
            disabled={gems < REFILL_COST || hearts >= maxHearts}
            className="w-full rounded-xl h-12 font-bold justify-between bg-red-500 hover:bg-red-600 text-white"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 fill-white" /> Full Heart Refill
            </span>
            <span className="flex items-center gap-1">
              <Diamond className="w-3.5 h-3.5 fill-white" /> {REFILL_COST}
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Streak Freeze */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
        <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-blue-500" /> Streak Freeze
        </h2>
        <p className="text-sm text-muted-foreground">Protect your streak on days you can't practice. You have <strong>{streakFreezes}</strong> freeze{streakFreezes !== 1 ? "s" : ""}.</p>

        <Button
          onClick={buyStreakFreeze}
          disabled={gems < FREEZE_COST}
          variant="outline"
          className="w-full rounded-xl h-12 font-bold justify-between"
        >
          <span className="flex items-center gap-2">
            <Snowflake className="w-4 h-4 text-blue-500" /> Buy Streak Freeze
          </span>
          <span className="flex items-center gap-1 text-cyan-600">
            <Diamond className="w-3.5 h-3.5 fill-cyan-500" /> {FREEZE_COST}
          </span>
        </Button>
      </motion.div>

      {/* Gem Packs (mock) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
        <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
          <Diamond className="w-5 h-5 text-cyan-500 fill-cyan-500" /> Buy Gems
        </h2>

        <div className="space-y-2">
          {gemPacks.map((pack) => (
            <button
              key={pack.amount}
              onClick={() => { /* Mock - no real payment */ }}
              className={cn(
                "w-full rounded-xl p-4 border-2 text-left flex items-center justify-between transition-all hover:shadow-md",
                pack.best ? "border-cyan-400 bg-cyan-50" : "border-border bg-card"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pack.icon}</span>
                <div>
                  <p className="font-bold">{pack.label}</p>
                  <p className="text-sm text-cyan-600 font-semibold flex items-center gap-1">
                    <Diamond className="w-3.5 h-3.5 fill-cyan-500" /> {pack.amount} gems
                  </p>
                </div>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl font-bold text-sm",
                pack.best ? "bg-cyan-500 text-white" : "bg-muted text-foreground"
              )}>
                {pack.price}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Pro Subscription (mock) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-5 card-shadow space-y-4">
        <h2 className="font-extrabold font-display text-lg flex items-center gap-2 text-amber-700">
          <Crown className="w-5 h-5 text-amber-500" /> Finova Pro
        </h2>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-red-500 fill-red-500" /> Unlimited hearts</li>
          <li className="flex items-center gap-2"><Diamond className="w-4 h-4 text-cyan-500 fill-cyan-500" /> 500 gems/month</li>
          <li className="flex items-center gap-2"><Snowflake className="w-4 h-4 text-blue-500" /> 1 free streak freeze/month</li>
          <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Ad-free experience</li>
        </ul>
        <Button className="w-full rounded-xl h-12 font-bold bg-amber-500 hover:bg-amber-600 text-white">
          <Crown className="w-5 h-5 mr-2" /> Get Pro — $9.99/month
        </Button>
        <p className="text-xs text-center text-amber-600">Coming soon!</p>
      </motion.div>
    </div>
  );
};

export default Shop;
