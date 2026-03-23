import { createContext, useContext, useCallback, ReactNode, useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

// XP animation type
export interface XPGain {
  id: string;
  amount: number;
  reason: string;
  isBonus?: boolean;
}

interface GameEconomyContextType {
  // Existing
  hearts: number;
  maxHearts: number;
  gems: number;
  streakFreezes: number;
  isPro: boolean;
  loading: boolean;
  loseHeart: () => Promise<boolean>;
  earnGems: (amount: number) => Promise<void>;
  buyHeartWithGems: () => Promise<boolean>;
  buyFullRefillWithGems: () => Promise<boolean>;
  buyStreakFreeze: () => Promise<boolean>;
  watchAdForHeart: () => Promise<void>;
  canDoLessons: boolean;
  HEART_COST: number;
  REFILL_COST: number;
  FREEZE_COST: number;

  // New
  xp: number;
  weeklyXp: number;
  level: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastLessonDate: string | null;
  dailyChallengeCompletedToday: boolean;
  perfectLessonsCount: number;
  totalLessonsCompleted: number;
  heartsRegenTime: number | null;

  // New actions
  awardXP: (amount: number, reason: string) => Promise<void>;
  completeLesson: (isPerfect: boolean) => Promise<void>;
  completeDailyChallenge: () => Promise<void>;
  completeModule: () => Promise<void>;
  useStreakFreeze: () => Promise<boolean>;
  checkAndUpdateStreak: () => Promise<void>;

  // XP animation queue
  pendingXPGains: XPGain[];
  dismissXPGain: (id: string) => void;

  // Level up state
  showLevelUp: number | null;
  dismissLevelUp: () => void;
}

const GameEconomyContext = createContext<GameEconomyContextType | null>(null);

export const HEART_COST = 50;
export const REFILL_COST = 350;
export const FREEZE_COST = 200;
const MAX_HEARTS = 5;
const HEART_REGEN_MS = 30 * 60 * 1000; // 30 minutes

export const GameEconomyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { hasAccess: isPro } = usePremiumAccess();
  const maxHearts = isPro ? Infinity : MAX_HEARTS;

  const [pendingXPGains, setPendingXPGains] = useState<XPGain[]>([]);
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);
  const regenTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch hearts
  const { data: heartsData, isLoading: heartsLoading } = useQuery({
    queryKey: ["user-hearts", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_hearts").select("*").eq("user_id", user!.id).maybeSingle();
      if (!data) {
        const { data: newData } = await supabase.from("user_hearts")
          .insert({ user_id: user!.id, hearts_count: MAX_HEARTS, last_reset_date: new Date().toISOString().split("T")[0] })
          .select().single();
        return newData;
      }
      const today = new Date().toISOString().split("T")[0];
      if (data.last_reset_date !== today) {
        const { data: updated } = await supabase.from("user_hearts")
          .update({ hearts_count: MAX_HEARTS, last_reset_date: today, updated_at: new Date().toISOString() })
          .eq("user_id", user!.id).select().single();
        return updated;
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch gems
  const { data: gemsData, isLoading: gemsLoading } = useQuery({
    queryKey: ["user-gems", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_gems").select("*").eq("user_id", user!.id).maybeSingle();
      if (!data) {
        const { data: newData } = await supabase.from("user_gems")
          .insert({ user_id: user!.id, gems_count: 0 }).select().single();
        return newData;
      }
      return data;
    },
    enabled: !!user,
  });

  // Fetch streak freezes
  const { data: freezeData } = useQuery({
    queryKey: ["user-items", "streak_freeze", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_items").select("*")
        .eq("user_id", user!.id).eq("item_type", "streak_freeze").maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch XP
  const { data: xpRecords } = useQuery({
    queryKey: ["user-xp-total", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("xp_amount, earned_at").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  // Fetch streak
  const { data: streakData } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Fetch progress stats
  const { data: progressData } = useQuery({
    queryKey: ["user-progress-stats", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_xp").select("source, xp_amount").eq("user_id", user!.id).eq("source", "lesson");
      const totalLessons = data?.length ?? 0;
      const perfectCount = data?.filter(r => r.xp_amount >= 50).length ?? 0;
      return { totalLessons, perfectCount };
    },
    enabled: !!user,
  });

  // Compute values
  const hearts = isPro ? Infinity : (heartsData?.hearts_count ?? MAX_HEARTS);
  const gems = gemsData?.gems_count ?? 0;
  const streakFreezes = freezeData?.quantity ?? 0;
  const canDoLessons = isPro || hearts > 0;

  const totalXp = xpRecords?.reduce((s, r) => s + r.xp_amount, 0) ?? 0;
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const weeklyXp = xpRecords?.filter(r => new Date(r.earned_at) >= monday).reduce((s, r) => s + r.xp_amount, 0) ?? 0;

  const level = Math.floor(totalXp / 500) + 1;
  const xpToNextLevel = 500 - (totalXp % 500);
  const currentStreak = streakData?.current_streak ?? 0;
  const longestStreak = streakData?.longest_streak ?? 0;
  const lastLessonDate = streakData?.last_activity_date ?? null;
  const totalLessonsCompleted = progressData?.totalLessons ?? 0;
  const perfectLessonsCount = progressData?.perfectCount ?? 0;

  // Daily challenge check
  const { data: dailyChallengeData } = useQuery({
    queryKey: ["daily-challenge-today", user?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("daily_challenges").select("completed")
        .eq("user_id", user!.id).eq("challenge_date", today).eq("completed", true).maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });
  const dailyChallengeCompletedToday = dailyChallengeData ?? false;

  // Hearts regen timer
  const [heartsRegenTime, setHeartsRegenTime] = useState<number | null>(null);

  useEffect(() => {
    if (isPro || hearts >= MAX_HEARTS) {
      setHeartsRegenTime(null);
      if (regenTimerRef.current) clearInterval(regenTimerRef.current);
      return;
    }
    if (!heartsRegenTime) {
      setHeartsRegenTime(Date.now() + HEART_REGEN_MS);
    }
    regenTimerRef.current = setInterval(() => {
      setHeartsRegenTime(prev => {
        if (!prev || Date.now() >= prev) {
          regenerateHeart();
          if (hearts + 1 >= MAX_HEARTS) return null;
          return Date.now() + HEART_REGEN_MS;
        }
        return prev;
      });
    }, 10000);
    return () => { if (regenTimerRef.current) clearInterval(regenTimerRef.current); };
  }, [hearts, isPro]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["user-hearts"] });
    queryClient.invalidateQueries({ queryKey: ["user-gems"] });
    queryClient.invalidateQueries({ queryKey: ["user-items"] });
    queryClient.invalidateQueries({ queryKey: ["user-xp-total"] });
    queryClient.invalidateQueries({ queryKey: ["user-xp"] });
    queryClient.invalidateQueries({ queryKey: ["user-streak"] });
    queryClient.invalidateQueries({ queryKey: ["user-progress-stats"] });
    queryClient.invalidateQueries({ queryKey: ["daily-challenge-today"] });
  };

  const addXPGain = useCallback((amount: number, reason: string, isBonus = false) => {
    const id = `${Date.now()}-${Math.random()}`;
    setPendingXPGains(prev => [...prev, { id, amount, reason, isBonus }]);
    setTimeout(() => setPendingXPGains(prev => prev.filter(g => g.id !== id)), 2500);
  }, []);

  const dismissXPGain = useCallback((id: string) => {
    setPendingXPGains(prev => prev.filter(g => g.id !== id));
  }, []);

  const dismissLevelUp = useCallback(() => setShowLevelUp(null), []);

  const awardXP = useCallback(async (amount: number, reason: string) => {
    if (!user) return;
    const oldLevel = Math.floor(totalXp / 500) + 1;
    await supabase.from("user_xp").insert({ user_id: user.id, xp_amount: amount, source: reason });
    addXPGain(amount, reason);
    const newLevel = Math.floor((totalXp + amount) / 500) + 1;
    if (newLevel > oldLevel) {
      setShowLevelUp(newLevel);
    }
    invalidateAll();
  }, [user, totalXp, addXPGain]);

  const updateStreak = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { data: existingStreak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();
    if (existingStreak) {
      const lastDate = existingStreak.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let newStreak = existingStreak.current_streak;
      if (lastDate === yesterday) newStreak += 1;
      else if (lastDate !== today) newStreak = 1;
      await supabase.from("user_streaks").update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, existingStreak.longest_streak),
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);
    } else {
      await supabase.from("user_streaks").insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_activity_date: today });
    }
  }, [user]);

  const completeLesson = useCallback(async (isPerfect: boolean) => {
    if (!user) return;
    await awardXP(25, "lesson");
    if (isPerfect) {
      addXPGain(50, "Perfect bonus!", true);
      await supabase.from("user_xp").insert({ user_id: user.id, xp_amount: 50, source: "perfect-bonus" });
    }
    await updateStreak();
    invalidateAll();
  }, [user, awardXP, updateStreak, addXPGain]);

  const completeDailyChallenge = useCallback(async () => {
    if (!user) return;
    await awardXP(35, "daily-challenge");
    invalidateAll();
  }, [user, awardXP]);

  const completeModule = useCallback(async () => {
    if (!user) return;
    await awardXP(100, "module-complete");
    invalidateAll();
  }, [user, awardXP]);

  const loseHeart = useCallback(async (): Promise<boolean> => {
    if (!user || isPro) return true; // premium never loses hearts
    if (hearts <= 0) return false;
    const newCount = hearts - 1;
    await supabase.from("user_hearts")
      .update({ hearts_count: newCount, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    if (newCount < MAX_HEARTS && !heartsRegenTime) {
      setHeartsRegenTime(Date.now() + HEART_REGEN_MS);
    }
    invalidateAll();
    return newCount > 0;
  }, [user, hearts, isPro, heartsRegenTime]);

  const regenerateHeart = useCallback(async () => {
    if (!user || isPro || hearts >= MAX_HEARTS) return;
    await supabase.from("user_hearts")
      .update({ hearts_count: Math.min(hearts + 1, MAX_HEARTS), updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    invalidateAll();
  }, [user, hearts, isPro]);

  const earnGems = useCallback(async (amount: number) => {
    if (!user) return;
    await supabase.from("user_gems")
      .update({ gems_count: gems + amount, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    invalidateAll();
  }, [user, gems]);

  const buyHeartWithGems = useCallback(async (): Promise<boolean> => {
    if (!user || gems < HEART_COST || hearts >= MAX_HEARTS) return false;
    await supabase.from("user_gems").update({ gems_count: gems - HEART_COST, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.from("user_hearts").update({ hearts_count: Math.min(hearts + 1, MAX_HEARTS), updated_at: new Date().toISOString() }).eq("user_id", user.id);
    invalidateAll();
    toast.success("❤️ +1 Heart!");
    return true;
  }, [user, gems, hearts]);

  const buyFullRefillWithGems = useCallback(async (): Promise<boolean> => {
    if (!user || gems < REFILL_COST) return false;
    await supabase.from("user_gems").update({ gems_count: gems - REFILL_COST, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    await supabase.from("user_hearts").update({ hearts_count: MAX_HEARTS, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    invalidateAll();
    toast.success("❤️ Hearts fully refilled!");
    return true;
  }, [user, gems, hearts]);

  const buyStreakFreeze = useCallback(async (): Promise<boolean> => {
    if (!user || gems < FREEZE_COST) return false;
    await supabase.from("user_gems").update({ gems_count: gems - FREEZE_COST, updated_at: new Date().toISOString() }).eq("user_id", user.id);
    if (freezeData) {
      await supabase.from("user_items").update({ quantity: streakFreezes + 1, updated_at: new Date().toISOString() }).eq("user_id", user.id).eq("item_type", "streak_freeze");
    } else {
      await supabase.from("user_items").insert({ user_id: user.id, item_type: "streak_freeze", quantity: 1 });
    }
    invalidateAll();
    toast.success("🧊 Streak Freeze purchased!");
    return true;
  }, [user, gems, streakFreezes, freezeData]);

  const watchAdForHeart = useCallback(async () => {
    if (!user || hearts >= MAX_HEARTS) return;
    await supabase.from("user_hearts").update({ hearts_count: Math.min(hearts + 1, MAX_HEARTS), updated_at: new Date().toISOString() }).eq("user_id", user.id);
    invalidateAll();
    toast.success("❤️ +1 Heart from ad!");
  }, [user, hearts]);

  const useStreakFreezeAction = useCallback(async (): Promise<boolean> => {
    if (!user || streakFreezes <= 0) return false;
    await supabase.from("user_items")
      .update({ quantity: streakFreezes - 1, updated_at: new Date().toISOString() })
      .eq("user_id", user.id).eq("item_type", "streak_freeze");
    invalidateAll();
    toast.success("🧊 Streak Freeze used! Streak preserved.");
    return true;
  }, [user, streakFreezes]);

  const checkAndUpdateStreak = useCallback(async () => {
    if (!user) return;
    const { data: streak } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).maybeSingle();
    if (!streak || !streak.last_activity_date) return;
    const today = new Date().toISOString().split("T")[0];
    const lastDate = streak.last_activity_date;
    if (lastDate === today) return; // Already active today
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (lastDate === yesterday) return; // Will be continued on next lesson
    // Missed more than 1 day
    if (streakFreezes > 0) {
      await supabase.from("user_items")
        .update({ quantity: streakFreezes - 1, updated_at: new Date().toISOString() })
        .eq("user_id", user.id).eq("item_type", "streak_freeze");
      await supabase.from("user_streaks")
        .update({ last_activity_date: yesterday, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      toast.info("🧊 Streak Freeze auto-used to protect your streak!");
    } else if (streak.current_streak > 0) {
      await supabase.from("user_streaks")
        .update({ current_streak: 0, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      toast.error("😢 Your streak was reset. Start a new one today!");
    }
    invalidateAll();
  }, [user, streakFreezes]);

  // Check streak on mount
  useEffect(() => {
    if (user) checkAndUpdateStreak();
  }, [user]);

  return (
    <GameEconomyContext.Provider
      value={{
        hearts, maxHearts, gems, streakFreezes, isPro, loading: heartsLoading || gemsLoading,
        loseHeart, earnGems, buyHeartWithGems, buyFullRefillWithGems, buyStreakFreeze,
        watchAdForHeart, canDoLessons, HEART_COST, REFILL_COST, FREEZE_COST,
        xp: totalXp, weeklyXp, level, xpToNextLevel,
        currentStreak, longestStreak, lastLessonDate,
        dailyChallengeCompletedToday, perfectLessonsCount, totalLessonsCompleted,
        heartsRegenTime,
        awardXP, completeLesson, completeDailyChallenge, completeModule,
        useStreakFreeze: useStreakFreezeAction, checkAndUpdateStreak,
        pendingXPGains, dismissXPGain, showLevelUp, dismissLevelUp,
      }}
    >
      {children}
    </GameEconomyContext.Provider>
  );
};

export const useGameEconomy = () => {
  const ctx = useContext(GameEconomyContext);
  if (!ctx) throw new Error("useGameEconomy must be inside GameEconomyProvider");
  return ctx;
};
