import { useState, useMemo } from "react";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { useAvatar } from "@/contexts/AvatarContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Heart, Diamond, Snowflake, Play, Crown, Zap, Shield, BookOpen, ShoppingBag, Palette, Lock as LockIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { avatarItems, RARITY_COLORS } from "@/data/avatar-items";
import { toast } from "sonner";

const Shop = () => {
  const {
    hearts, maxHearts, gems, streakFreezes,
    buyHeartWithGems, buyFullRefillWithGems, buyStreakFreeze, watchAdForHeart,
    HEART_COST, REFILL_COST, FREEZE_COST,
  } = useGameEconomy();
  const { isItemUnlocked, purchaseItem, updateAvatar } = useAvatar();
  const { hasAccess: isPro } = usePremiumAccess();

  const [activeTab, setActiveTab] = useState<'avatar' | 'powerups'>('avatar');
  const [watchingAd, setWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rarity'>('price-asc');

  const handleWatchAd = () => {
    if (hearts >= maxHearts) return;
    setWatchingAd(true);
    setAdTimer(15);
    const interval = setInterval(() => {
      setAdTimer(t => {
        if (t <= 1) { clearInterval(interval); setWatchingAd(false); watchAdForHeart(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'hairStyle', label: 'Hair' },
    { key: 'eyes', label: 'Eyes' },
    { key: 'outfit', label: 'Outfits' },
    { key: 'accessory', label: 'Accessories' },
    { key: 'background', label: 'Backgrounds' },
    { key: 'frame', label: 'Frames' },
  ];

  const filteredItems = useMemo(() => {
    let items = avatarItems;
    if (categoryFilter !== 'all') items = items.filter(i => i.type === categoryFilter);
    if (sortBy === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
    else items = [...items].sort((a, b) => { const r = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }; return (r[b.rarity] || 0) - (r[a.rarity] || 0); });
    return items;
  }, [categoryFilter, sortBy]);

  const handleBuyItem = async (itemId: string) => {
    const item = avatarItems.find(i => i.id === itemId);
    if (!item) return;
    const ok = await purchaseItem(itemId);
    if (ok) updateAvatar({ [item.type]: item.value } as any);
  };

  const gemPacks = [
    { amount: 200, price: "$0.99", label: "Starter Pack", count: 1, best: false },
    { amount: 800, price: "$2.99", label: "Popular Pack", count: 2, best: false },
    { amount: 2000, price: "$4.99", label: "Best Value", count: 3, best: true },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold font-display flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" /> Shop
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
            <Diamond className="w-5 h-5 text-primary fill-primary" />
            <span className="font-extrabold text-primary">{gems}</span>
          </div>
          <Link to="/quests" className="text-xs font-bold text-primary hover:underline">Earn more →</Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        <button onClick={() => setActiveTab('avatar')}
          className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'avatar' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
          🛍️ Avatar Shop
        </button>
        <button onClick={() => setActiveTab('powerups')}
          className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'powerups' ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}>
          ⚡ Power-Ups
        </button>
      </div>

      {activeTab === 'avatar' ? (
        <div className="space-y-4">
          {/* Customize button */}
          <Link to="/avatar-builder" className="block">
            <Button variant="outline" className="w-full rounded-xl h-12 font-bold gap-2">
              <Palette className="w-4 h-4" /> Open Avatar Builder
            </Button>
          </Link>

          {/* Category filters */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map(c => (
              <button key={c.key} onClick={() => setCategoryFilter(c.key)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  categoryFilter === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1">
            {([['price-asc', 'Price ↑'], ['price-desc', 'Price ↓'], ['rarity', 'Rarity']] as const).map(([k, l]) => (
              <button key={k} onClick={() => setSortBy(k)}
                className={cn("text-[10px] font-bold px-2 py-1 rounded-md", sortBy === k ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
                {l}
              </button>
            ))}
          </div>

          {/* Items grid */}
          <div className="grid grid-cols-3 gap-2">
            {filteredItems.map(item => {
              const owned = isItemUnlocked(item.id);
              return (
                <button key={item.id} onClick={() => !owned && handleBuyItem(item.id)}
                  className={cn(
                    "relative rounded-xl border-2 p-3 text-center transition-all hover:shadow-sm",
                    owned ? "border-primary/30 bg-primary/5" : "border-border"
                  )}>
                  {owned && <Check className="absolute top-1 right-1 w-3 h-3 text-primary" />}
                  <span className="text-xl block mb-0.5">{item.emoji}</span>
                  <p className="text-[10px] font-bold truncate">{item.name}</p>
                  <span className={cn("text-[8px] font-bold px-1 py-0.5 rounded-full inline-block", RARITY_COLORS[item.rarity])}>
                    {item.rarity}
                  </span>
                  {owned ? (
                    <p className="text-[9px] text-primary font-bold mt-0.5">Owned</p>
                  ) : (
                    <p className="text-[9px] font-bold mt-0.5 flex items-center justify-center gap-0.5">
                      {item.isPremium ? <><Crown className="w-2.5 h-2.5 text-amber-500" /> Plus</> :
                        item.rarity === 'legendary' ? '🏆 Earn' :
                          <><Diamond className="w-2.5 h-2.5 text-primary fill-primary" /> {item.price}</>}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Plus Subscription */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-amber-400 p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <h2 className="font-extrabold font-display text-xl flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Crown className="w-6 h-6 text-amber-500" /> FinOva Plus
            </h2>
            <p className="text-sm text-amber-800 dark:text-amber-300">Unlock the full FinOva experience.</p>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-300">
              <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-destructive fill-destructive shrink-0" /><strong>Unlimited hearts</strong></li>
              <li className="flex items-center gap-2"><Diamond className="w-4 h-4 text-primary fill-primary shrink-0" /><strong>1,000 gems/month</strong></li>
              <li className="flex items-center gap-2"><Snowflake className="w-4 h-4 text-blue-500 shrink-0" /><strong>3 streak freezes/month</strong></li>
            </ul>
            {isPro ? (
              <div className="w-full rounded-xl h-12 font-bold bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" /> You're a Plus member!
              </div>
            ) : (
              <Link to="/plus"><Button className="w-full rounded-xl h-12 font-bold bg-amber-500 hover:bg-amber-600 text-white text-base">
                <Crown className="w-5 h-5 mr-2" /> Get Plus — $9.99/month
              </Button></Link>
            )}
          </motion.div>

          {/* Power-up cards */}
          <div className="space-y-3">
            {/* Heart Refill */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2"><Heart className="w-5 h-5 text-destructive fill-destructive" /> Heart Refill</h3>
              <p className="text-xs text-muted-foreground">Instantly refill all 5 hearts</p>
              <div className="flex gap-2">
                <Button onClick={handleWatchAd} disabled={hearts >= maxHearts || watchingAd} variant="outline" className="flex-1 rounded-xl font-bold text-xs h-10">
                  <Play className="w-3 h-3 mr-1" /> Watch Ad (FREE)
                </Button>
                <Button onClick={buyFullRefillWithGems} disabled={gems < REFILL_COST || hearts >= maxHearts}
                  className="flex-1 rounded-xl font-bold text-xs h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  <Diamond className="w-3 h-3 mr-1 fill-current" /> {REFILL_COST} Full Refill
                </Button>
              </div>
              {watchingAd && (
                <div className="rounded-xl bg-muted p-4 text-center space-y-2">
                  <span className="text-2xl font-extrabold text-primary">{adTimer}</span>
                  <div className="h-1.5 rounded-full bg-muted-foreground/20 overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${((15 - adTimer) / 15) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Streak Freeze */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2"><Snowflake className="w-5 h-5 text-blue-500" /> Streak Freeze</h3>
              <p className="text-xs text-muted-foreground">Protect your streak for 1 missed day. You have <strong>{streakFreezes}</strong>.</p>
              <Button onClick={buyStreakFreeze} disabled={gems < FREEZE_COST} variant="outline" className="w-full rounded-xl font-bold text-xs h-10 justify-between">
                <span className="flex items-center gap-1"><Snowflake className="w-3 h-3 text-blue-500" /> Buy Freeze</span>
                <span className="flex items-center gap-1 text-primary"><Diamond className="w-3 h-3 fill-current" /> {FREEZE_COST}</span>
              </Button>
            </div>

            {/* XP Boost */}
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> XP Boost</h3>
              <p className="text-xs text-muted-foreground">Earn 2x XP for 30 minutes</p>
              <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-10 justify-between"
                onClick={() => toast.info("XP Boost activated! 2x XP for 30 minutes ⚡")}>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Activate</span>
                <span className="flex items-center gap-1 text-primary"><Diamond className="w-3 h-3 fill-current" /> 75</span>
              </Button>
            </div>
          </div>

          {/* Gem Packs */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <h3 className="font-bold flex items-center gap-2"><Diamond className="w-5 h-5 text-primary fill-primary" /> Buy Gems</h3>
            <div className="space-y-2">
              {gemPacks.map(pack => (
                <button key={pack.amount}
                  className={cn(
                    "w-full rounded-xl p-3 border-2 text-left flex items-center justify-between transition-all hover:shadow-md",
                    pack.best ? "border-primary bg-primary/5" : "border-border"
                  )}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{Array.from({ length: pack.count }).map((_, i) => <Diamond key={i} className="w-4 h-4 text-primary fill-primary" />)}</div>
                    <div>
                      <p className="text-sm font-bold">{pack.label}</p>
                      <p className="text-xs text-primary font-semibold">{pack.amount} gems</p>
                    </div>
                  </div>
                  <div className={cn("px-3 py-1.5 rounded-lg font-bold text-xs", pack.best ? "bg-primary text-primary-foreground" : "bg-muted")}>{pack.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
