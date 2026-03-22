import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameEconomyProvider, useGameEconomy } from "@/contexts/GameEconomyContext";
import {
  BookOpen,
  User,
  LogOut,
  TrendingUp,
  Bot,
  Heart,
  Diamond,
  ShoppingBag,
  Target,
  ChevronDown,
  Flame,
  Gamepad2,
  Users,
  Play,
  Snowflake,
  Crown,
  Star,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import MoneyCoachWidget from "@/components/MoneyCoachWidget";



const HeartPopup = ({ onClose }: { onClose: () => void }) => {
  const { hearts, maxHearts, gems, buyHeartWithGems, buyFullRefillWithGems, watchAdForHeart, HEART_COST, REFILL_COST } = useGameEconomy();
  return (
    <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-lg p-4 space-y-3 z-[60]">
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">Hearts</span>
        <div className="flex gap-0.5">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <Heart key={i} className={cn("w-4 h-4", i < hearts ? "text-duo-red fill-duo-red" : "text-muted-foreground/30")} />
          ))}
        </div>
      </div>
      <button onClick={() => { watchAdForHeart(); }} disabled={hearts >= maxHearts}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50">
        <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Watch Ad</span>
        <span className="text-xs text-muted-foreground">FREE</span>
      </button>
      <button onClick={() => { buyHeartWithGems(); }} disabled={gems < HEART_COST || hearts >= maxHearts}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50">
        <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-duo-red" /> +1 Heart</span>
        <span className="flex items-center gap-1 text-duo-blue text-xs"><Diamond className="w-3 h-3 fill-current" />{HEART_COST}</span>
      </button>
      <button onClick={() => { buyFullRefillWithGems(); }} disabled={gems < REFILL_COST || hearts >= maxHearts}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold bg-duo-red/10 text-duo-red hover:bg-duo-red/20 transition-colors disabled:opacity-50">
        <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 fill-current" /> Full Refill</span>
        <span className="flex items-center gap-1 text-xs"><Diamond className="w-3 h-3" />{REFILL_COST}</span>
      </button>
      <Link to="/shop" onClick={onClose} className="block text-center text-xs font-semibold text-primary hover:underline">
        Go to Shop →
      </Link>
    </div>
  );
};

const GemPopup = ({ onClose }: { onClose: () => void }) => {
  const { gems, streakFreezes, buyStreakFreeze, FREEZE_COST } = useGameEconomy();
  const gemPacks = [
    { amount: 100, price: "$0.99", label: "Starter" },
    { amount: 500, price: "$3.99", label: "Popular" },
    { amount: 1200, price: "$7.99", label: "Best Value" },
  ];
  return (
    <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-lg p-4 space-y-3 z-[60]">
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">Gems</span>
        <span className="flex items-center gap-1 text-duo-blue font-extrabold text-sm"><Diamond className="w-4 h-4 fill-current" />{gems}</span>
      </div>
      <button onClick={() => { buyStreakFreeze(); }} disabled={gems < FREEZE_COST}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50">
        <span className="flex items-center gap-1.5"><Snowflake className="w-3.5 h-3.5 text-blue-500" /> Streak Freeze ({streakFreezes})</span>
        <span className="flex items-center gap-1 text-duo-blue text-xs"><Diamond className="w-3 h-3 fill-current" />{FREEZE_COST}</span>
      </button>
      {gemPacks.map(p => (
        <button key={p.amount}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors">
          <span className="flex items-center gap-1.5"><Diamond className="w-3.5 h-3.5 text-duo-blue fill-duo-blue" /> {p.amount} gems</span>
          <span className="text-xs font-bold text-muted-foreground">{p.price}</span>
        </button>
      ))}
      <Link to="/shop" onClick={onClose} className="block text-center text-xs font-semibold text-primary hover:underline">
        Go to Shop →
      </Link>
    </div>
  );
};

const TopBar = () => {
  const { hearts, gems } = useGameEconomy();
  const { user } = useAuth();
  const [showHeartPopup, setShowHeartPopup] = useState(false);
  const [showGemPopup, setShowGemPopup] = useState(false);
  const heartRef = useRef<HTMLButtonElement>(null);
  const gemRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (heartRef.current && !heartRef.current.parentElement?.contains(e.target as Node)) setShowHeartPopup(false);
      if (gemRef.current && !gemRef.current.parentElement?.contains(e.target as Node)) setShowGemPopup(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: streak } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-sm border-b border-border px-4 flex items-center justify-between md:justify-end md:left-[200px]">
      {/* Mobile logo */}
      <Link to="/learning-path" className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-black font-display text-foreground">Monucate</span>
      </Link>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-duo-orange/10">
          <Flame className="w-4 h-4 text-duo-orange" />
          <span className="text-sm font-extrabold text-duo-orange">{streak?.current_streak ?? 0}</span>
        </div>

        <div className="relative">
          <button ref={heartRef} onClick={() => { setShowHeartPopup(!showHeartPopup); setShowGemPopup(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors">
            <Heart className="w-4 h-4 text-duo-red fill-duo-red" />
            <span className="text-sm font-extrabold text-duo-red">{hearts}</span>
          </button>
          {showHeartPopup && <HeartPopup onClose={() => setShowHeartPopup(false)} />}
        </div>

        <div className="relative">
          <button ref={gemRef} onClick={() => { setShowGemPopup(!showGemPopup); setShowHeartPopup(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-muted transition-colors">
            <Diamond className="w-4 h-4 text-duo-blue fill-duo-blue" />
            <span className="text-sm font-extrabold text-duo-blue">{gems}</span>
          </button>
          {showGemPopup && <GemPopup onClose={() => setShowGemPopup(false)} />}
        </div>
      </div>
    </div>
  );
};

const bottomNavItems = [
  { to: "/learning-path", label: "Learn", icon: BookOpen },
  { to: "/paper-trading", label: "Trade", icon: TrendingUp },
  { to: "/quests", label: "Quests", icon: Target },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];
const XP_LEVELS = [
  { name: "Bronze", min: 0 }, { name: "Silver", min: 200 }, { name: "Gold", min: 500 },
  { name: "Platinum", min: 1000 }, { name: "Diamond", min: 2000 }, { name: "Master", min: 4000 },
  { name: "Grandmaster", min: 7000 }, { name: "Champion", min: 12000 }, { name: "Legend", min: 20000 },
];

const getRank = (xp: number) => {
  let rank = XP_LEVELS[0]; let nextRank: typeof XP_LEVELS[0] | null = XP_LEVELS[1];
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].min) { rank = XP_LEVELS[i]; nextRank = XP_LEVELS[i + 1] || null; break; }
  }
  return { rank, nextRank };
};

const RightSidebar = () => {
  const { user } = useAuth();
  const { hasAccess: isPro } = usePremiumAccess();

  const { data: totalXp } = useQuery({
    queryKey: ["total-xp-sidebar", user?.id],
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

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0 sticky top-20 self-start pt-14 pr-4">
      {/* Upgrade to Plus */}
      {!isPro && (
        <Link to="/shop" className="block rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 space-y-2 hover:shadow-md transition-shadow">
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
          <Link to="/quests" className="block text-xs text-muted-foreground text-center py-2 hover:text-primary transition-colors">
            Start today's quests →
          </Link>
        )}
      </div>
    </aside>
  );
};

type NavItem = {
  to: string;
  label: string;
  icon: any;
  sub?: { to: string; label: string }[];
};

const sideNavItems: NavItem[] = [
  { to: "/learning-path", label: "Learn", icon: BookOpen, sub: [
    { to: "/courses", label: "Courses" },
    { to: "/mistakes", label: "Review" },
  ]},
  { to: "/paper-trading", label: "Trade", icon: TrendingUp },
  { to: "/quests", label: "Quests", icon: Target },
  { to: "/money-coach", label: "Coach", icon: Bot },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/profile", label: "Profile", icon: User, sub: [
    { to: "/awards", label: "Awards" },
    { to: "/rankings", label: "Rankings" },
  ]},
  { to: "/settings", label: "Settings", icon: Settings },
];

const AppLayoutInner = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <GameEconomyProvider>
      <div className="flex min-h-screen bg-background">
        {/* Persistent top bar */}
        <TopBar />

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[200px] flex-col border-r border-border bg-background py-3 px-2 fixed left-0 top-14 bottom-0 z-40">
          <Link to="/learning-path" className="flex items-center gap-2 px-1.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-black font-display text-foreground whitespace-nowrap">Monucate</span>
          </Link>

          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {sideNavItems.map(({ to, label, icon: Icon, sub }) => {
              const active = location.pathname === to || (location.pathname.startsWith(to) && to !== "/profile");
              const subActive = sub?.some(s => location.pathname === s.to || location.pathname.startsWith(s.to));
              const expanded = active || subActive;
              return (
                <div key={to}>
                  <Link
                    to={to}
                    title={label}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm font-bold transition-all",
                      active || subActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="whitespace-nowrap flex-1">{label}</span>
                    {sub && (
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 shrink-0 transition-all duration-200",
                        expanded ? "rotate-180 text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </Link>
                  {sub && expanded && (
                    <div className="space-y-0.5 mt-0.5">
                      {sub.map(s => (
                        <Link key={s.to} to={s.to}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                            location.pathname === s.to ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            location.pathname === s.to ? "bg-primary" : "bg-border"
                          )} />
                          <span>{s.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">Sign Out</span>
          </button>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background px-2 py-1.5 flex justify-around safe-area-bottom">
          {bottomNavItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (location.pathname.startsWith(to) && to !== "/profile");
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 text-[10px] font-bold transition-colors rounded-xl",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", active && "scale-110")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Main content + Right sidebar */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0 pt-14 md:ml-[200px]">
          <div className="flex justify-center">
            <div className="flex-1 min-w-0 p-4 md:p-8 max-w-2xl">
              <Outlet />
            </div>
            <RightSidebar />
          </div>
        </main>

        {/* Floating Money Coach */}
        <MoneyCoachWidget />
      </div>
    </GameEconomyProvider>
  );
};

const AppLayout = () => <AppLayoutInner />;

export default AppLayout;
