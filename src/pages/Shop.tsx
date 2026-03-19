import { useState } from "react";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { Heart, Diamond, Snowflake, Play, Crown, Zap, Shield, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

const XP_LEVELS = [
  { name: "Penny", min: 0 },
  { name: "Nickel", min: 100 },
  { name: "Dime", min: 300 },
  { name: "Quarter", min: 600 },
  { name: "Dollar", min: 1000 },
  { name: "Investor", min: 2000 },
  { name: "Trader", min: 4000 },
  { name: "Banker", min: 7000 },
  { name: "Tycoon", min: 12000 },
  { name: "Quant", min: 20000 },
];

const getRank = (xp: number) => {
  let rank = XP_LEVELS[0];
  let nextRank = XP_LEVELS[1];
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].min) {
      rank = XP_LEVELS[i];
      nextRank = XP_LEVELS[i + 1] || null;
      break;
    }
  }
  return { rank, nextRank };
};

const Shop = () => {
  const {
    hearts, maxHearts, gems, streakFreezes,
    buyHeartWithGems, buyFullRefillWithGems, buyStreakFreeze, watchAdForHeart,
    HEART_COST, REFILL_COST, FREEZE_COST,
  } = useGameEconomy();
  const { user } = useAuth();
  const { hasAccess: isPro } = usePremiumAccess();

  const [watchingAd, setWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);

  const { data: totalXp } = useQuery({
    queryKey: ["total-xp", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("xp_amount").eq("user_id", user!.id);
      return data?.reduce((s, r) => s + r.xp_amount, 0) ?? 0;
    },
    enabled: !!user,
  });

  const { data: dailyQuests } = useQuery({
    queryKey: ["daily-quests-sidebar", user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("quests").select("*").eq("user_id", user!.id).eq("quest_date", today).eq("quest_type", "daily");
      return data ?? [];
    },
    enabled: !!user,
  });

  const xp = totalXp ?? 0;
  const { rank, nextRank } = getRank(xp);
  const progress = nextRank ? ((xp - rank.min) / (nextRank.min - rank.min)) * 100 : 100;

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
    { amount: 200, price: "$0.99", label: "Starter Pack", count: 1, best: false },
    { amount: 800, price: "$2.99", label: "Popular Pack", count: 2, best: false },
    { amount: 2000, price: "$4.99", label: "Best Value", count: 3, best: true },
  ];

  return (
    <div className="flex gap-6">
      {/* Main shop content */}
      <div className="flex-1 space-y-6 max-w-lg mx-auto">
        {/* Header with balances */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold font-display flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" /> Shop
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-destructive/10 border border-destructive/20">
              <Heart className="w-5 h-5 text-destructive fill-destructive" />
              <span className="font-extrabold text-destructive">{hearts}/{maxHearts}</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
              <Diamond className="w-5 h-5 text-primary fill-primary" />
              <span className="font-extrabold text-primary">{gems}</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <Snowflake className="w-5 h-5 text-blue-500" />
              <span className="font-extrabold text-blue-600">{streakFreezes}</span>
            </div>
          </div>
        </motion.div>

        {/* Plus Subscription - TOP PRIORITY */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-amber-400 p-6 card-shadow space-y-4 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <h2 className="font-extrabold font-display text-xl flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Crown className="w-6 h-6 text-amber-500" /> Finova Plus
          </h2>
          <p className="text-sm text-amber-800 dark:text-amber-300">Unlock the full Finova experience and learn without limits.</p>
          <ul className="space-y-2.5 text-sm text-amber-800 dark:text-amber-300">
            <li className="flex items-center gap-2.5">
              <Heart className="w-4 h-4 text-destructive fill-destructive shrink-0" />
              <span><strong>Unlimited hearts</strong> — never stop learning</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Diamond className="w-4 h-4 text-primary fill-primary shrink-0" />
              <span><strong>1,000 gems/month</strong> — spend on what you want</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Snowflake className="w-4 h-4 text-blue-500 shrink-0" />
              <span><strong>3 streak freezes/month</strong> — protect your streak</span>
            </li>
            <li className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-primary shrink-0" />
              <span><strong>All premium courses</strong> — full access</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <span><strong>Special Review</strong> — learn from your mistakes</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span><strong>Ad-free</strong> experience</span>
            </li>
          </ul>
          {isPro ? (
            <div className="w-full rounded-xl h-12 font-bold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" /> You're a Plus member!
            </div>
          ) : (
            <Button className="w-full rounded-xl h-12 font-bold bg-amber-500 hover:bg-amber-600 text-white text-base">
              <Crown className="w-5 h-5 mr-2" /> Get Plus — $9.99/month
            </Button>
          )}
        </motion.div>

        {/* Hearts Section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive fill-destructive" /> Hearts
          </h2>
          <p className="text-sm text-muted-foreground">
            Get full hearts so you can worry less about making mistakes in a lesson.
            {!isPro && <span className="ml-1 text-amber-600 font-semibold">Plus members get unlimited hearts!</span>}
          </p>

          <div className="flex gap-1.5">
            {isPro ? (
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Heart className="w-6 h-6 text-destructive fill-destructive" />
                <span>∞ Unlimited</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
            ) : (
              Array.from({ length: maxHearts }).map((_, i) => (
                <Heart
                  key={i}
                  className={cn("w-8 h-8 transition-all", i < hearts ? "text-destructive fill-destructive" : "text-muted-foreground/30")}
                />
              ))
            )}
          </div>

          {!isPro && (
            <div className="space-y-2">
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
                  <Heart className="w-4 h-4 text-destructive" /> Buy 1 Heart
                </span>
                <span className="flex items-center gap-1 text-primary">
                  <Diamond className="w-3.5 h-3.5 fill-current" /> {HEART_COST}
                </span>
              </Button>

              <Button
                onClick={buyFullRefillWithGems}
                disabled={gems < REFILL_COST || hearts >= maxHearts}
                className="w-full rounded-xl h-12 font-bold justify-between bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-current" /> Full Heart Refill
                </span>
                <span className="flex items-center gap-1">
                  <Diamond className="w-3.5 h-3.5 fill-current" /> {REFILL_COST}
                </span>
              </Button>
            </div>
          )}
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
            <span className="flex items-center gap-1 text-primary">
              <Diamond className="w-3.5 h-3.5 fill-current" /> {FREEZE_COST}
            </span>
          </Button>
        </motion.div>

        {/* Gem Packs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-5 card-shadow space-y-4">
          <h2 className="font-extrabold font-display text-lg flex items-center gap-2">
            <Diamond className="w-5 h-5 text-primary fill-primary" /> Buy Gems
          </h2>

          <div className="space-y-2">
            {gemPacks.map((pack) => (
              <button
                key={pack.amount}
                onClick={() => { /* Mock - no real payment */ }}
                className={cn(
                  "w-full rounded-xl p-4 border-2 text-left flex items-center justify-between transition-all hover:shadow-md",
                  pack.best ? "border-primary bg-primary/5" : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: pack.count }).map((_, i) => (
                      <Diamond key={i} className="w-5 h-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold">{pack.label}</p>
                    <p className="text-sm text-primary font-semibold flex items-center gap-1">
                      <Diamond className="w-3.5 h-3.5 fill-current" /> {pack.amount} gems
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-xl font-bold text-sm",
                  pack.best ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}>
                  {pack.price}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Sidebar - desktop only */}
      <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0 sticky top-20 self-start">
        {/* Upgrade to Plus */}
        {!isPro && (
          <Link to="#" className="block rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-sm text-amber-700 dark:text-amber-400">Upgrade to Plus</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">Unlimited hearts, 1,000 gems/mo, 3 streak freezes & more</p>
            <div className="bg-amber-500 text-white text-xs font-bold text-center py-1.5 rounded-lg">$9.99/month</div>
          </Link>
        )}

        {/* Your Rank */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="font-extrabold text-sm">Your Rank</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-primary">{rank.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{xp.toLocaleString()} XP total</p>
          </div>
          {nextRank && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>{rank.name}</span>
                <span>{nextRank.name}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground text-center">{nextRank.min - xp} XP to next rank</p>
            </div>
          )}
        </div>

        {/* Daily Quests */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-sm">Daily Quests</span>
            </div>
            <Link to="/quests" className="text-[10px] font-bold text-primary hover:underline">View all</Link>
          </div>
          {dailyQuests && dailyQuests.length > 0 ? (
            <div className="space-y-2">
              {dailyQuests.slice(0, 3).map((q: any) => (
                <div key={q.id} className={cn(
                  "flex items-start gap-2 p-2 rounded-lg text-xs",
                  q.completed ? "bg-primary/5" : "bg-muted"
                )}>
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center",
                    q.completed ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {q.completed && <span className="text-primary-foreground text-[8px]">✓</span>}
                  </div>
                  <div className="flex-1">
                    <p className={cn("font-semibold", q.completed && "line-through text-muted-foreground")}>{q.quest_text}</p>
                    <p className="text-muted-foreground flex items-center gap-0.5 mt-0.5">
                      <Diamond className="w-2.5 h-2.5 fill-current text-primary" /> +{q.reward_gems}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Visit the Quests page to start today's quests!</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Shop;
