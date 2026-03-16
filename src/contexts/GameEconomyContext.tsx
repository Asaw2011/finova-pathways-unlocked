import { createContext, useContext, useCallback, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface GameEconomyContextType {
  hearts: number;
  maxHearts: number;
  gems: number;
  streakFreezes: number;
  isPro: boolean;
  loading: boolean;
  loseHeart: () => Promise<void>;
  earnGems: (amount: number) => Promise<void>;
  buyHeartWithGems: () => Promise<boolean>;
  buyFullRefillWithGems: () => Promise<boolean>;
  buyStreakFreeze: () => Promise<boolean>;
  watchAdForHeart: () => Promise<void>;
  canDoLessons: boolean;
  HEART_COST: number;
  REFILL_COST: number;
  FREEZE_COST: number;
}

const GameEconomyContext = createContext<GameEconomyContextType | null>(null);

export const HEART_COST = 50;
export const REFILL_COST = 350;
export const FREEZE_COST = 200;
const MAX_HEARTS = 5;
const GEMS_PER_LESSON = 10;

export const GameEconomyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch hearts
  const { data: heartsData, isLoading: heartsLoading } = useQuery({
    queryKey: ["user-hearts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_hearts")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!data) {
        // Create initial hearts record
        const { data: newData } = await supabase
          .from("user_hearts")
          .insert({ user_id: user!.id, hearts_count: MAX_HEARTS, last_reset_date: new Date().toISOString().split("T")[0] })
          .select()
          .single();
        return newData;
      }

      // Check if hearts need daily reset
      const today = new Date().toISOString().split("T")[0];
      if (data.last_reset_date !== today) {
        const { data: updated } = await supabase
          .from("user_hearts")
          .update({ hearts_count: MAX_HEARTS, last_reset_date: today, updated_at: new Date().toISOString() })
          .eq("user_id", user!.id)
          .select()
          .single();
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
      const { data } = await supabase
        .from("user_gems")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!data) {
        const { data: newData } = await supabase
          .from("user_gems")
          .insert({ user_id: user!.id, gems_count: 0 })
          .select()
          .single();
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
      const { data } = await supabase
        .from("user_items")
        .select("*")
        .eq("user_id", user!.id)
        .eq("item_type", "streak_freeze")
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const hearts = heartsData?.hearts_count ?? MAX_HEARTS;
  const gems = gemsData?.gems_count ?? 0;
  const streakFreezes = freezeData?.quantity ?? 0;
  const canDoLessons = hearts > 0;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["user-hearts"] });
    queryClient.invalidateQueries({ queryKey: ["user-gems"] });
    queryClient.invalidateQueries({ queryKey: ["user-items"] });
  };

  const loseHeart = useCallback(async () => {
    if (!user || hearts <= 0) return;
    await supabase
      .from("user_hearts")
      .update({ hearts_count: hearts - 1, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    invalidateAll();
  }, [user, hearts]);

  const earnGems = useCallback(async (amount: number) => {
    if (!user) return;
    await supabase
      .from("user_gems")
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
    // Fake ad - the Shop page handles the timer UI
    await supabase.from("user_hearts").update({ hearts_count: Math.min(hearts + 1, MAX_HEARTS), updated_at: new Date().toISOString() }).eq("user_id", user.id);
    invalidateAll();
    toast.success("❤️ +1 Heart from ad!");
  }, [user, hearts]);

  return (
    <GameEconomyContext.Provider
      value={{
        hearts,
        maxHearts: MAX_HEARTS,
        gems,
        streakFreezes,
        isPro: false,
        loading: heartsLoading || gemsLoading,
        loseHeart,
        earnGems,
        buyHeartWithGems,
        buyFullRefillWithGems,
        buyStreakFreeze,
        watchAdForHeart,
        canDoLessons,
        HEART_COST,
        REFILL_COST,
        FREEZE_COST,
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
