import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AvatarConfig, DEFAULT_AVATAR } from "@/types/avatar";
import { avatarItems } from "@/data/avatar-items";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { toast } from "sonner";

interface AvatarContextType {
  avatarConfig: AvatarConfig;
  unlockedItems: string[];
  updateAvatar: (partial: Partial<AvatarConfig>) => void;
  purchaseItem: (itemId: string) => Promise<boolean>;
  isItemUnlocked: (itemId: string) => boolean;
}

const AvatarContext = createContext<AvatarContextType | null>(null);

// Free defaults that don't need purchasing
const FREE_VALUES: Record<string, string[]> = {
  hairStyle: ['none', 'short-classic', 'medium-wavy', 'buzz'],
  hairColor: ['black', 'brown'],
  eyes: ['default', 'happy'],
  mouth: ['smile', 'neutral'],
  accessory: ['none'],
  outfit: ['default-tee'],
  background: ['solid-green', 'solid-blue'],
  frame: ['none'],
};

export const AvatarProvider = ({ children }: { children: ReactNode }) => {
  const { gems, earnGems } = useGameEconomy();
  const { hasAccess: isPro } = usePremiumAccess();

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem('finova_avatar_config');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR;
    } catch { return DEFAULT_AVATAR; }
  });

  const [unlockedItems, setUnlockedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('finova_avatar_unlocked');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const updateAvatar = useCallback((partial: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('finova_avatar_config', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isItemUnlocked = useCallback((itemId: string) => {
    if (unlockedItems.includes(itemId)) return true;
    const item = avatarItems.find(i => i.id === itemId);
    if (!item) return false;
    // Check if it's a free default
    const freeVals = FREE_VALUES[item.type];
    if (freeVals?.includes(item.value)) return true;
    return false;
  }, [unlockedItems]);

  const purchaseItem = useCallback(async (itemId: string) => {
    const item = avatarItems.find(i => i.id === itemId);
    if (!item) return false;
    if (isItemUnlocked(itemId)) return true;
    if (item.isPremium && !isPro) {
      toast.error("This item requires FinOva Plus!");
      return false;
    }
    if (item.rarity === 'legendary') {
      toast.error("This item can only be unlocked through achievements!");
      return false;
    }
    if (gems < item.price) {
      toast.error(`Not enough gems! Need ${item.price}, have ${gems}.`);
      return false;
    }
    // Deduct gems (negative amount)
    await earnGems(-item.price);
    const updated = [...unlockedItems, itemId];
    setUnlockedItems(updated);
    localStorage.setItem('finova_avatar_unlocked', JSON.stringify(updated));
    toast.success(`Unlocked ${item.name}! 🎉`);
    return true;
  }, [gems, isPro, unlockedItems, isItemUnlocked, earnGems]);

  return (
    <AvatarContext.Provider value={{ avatarConfig, unlockedItems, updateAvatar, purchaseItem, isItemUnlocked }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error("useAvatar must be used within AvatarProvider");
  return ctx;
};
