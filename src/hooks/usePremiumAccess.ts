import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PROMPT_COUNT_KEY = "finova_upgrade_prompt_count";
const SPECIAL_OFFER_SHOWN_KEY = "finova_special_offer_shown";

export const usePremiumAccess = () => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data, error } = await supabase.rpc("has_premium_access", {
        _user_id: user.id,
      });
      if (!error) setHasAccess(!!data);
      setLoading(false);
    };

    check();
  }, [user]);

  const getPromptCount = useCallback(() => {
    try {
      return parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || "0", 10);
    } catch { return 0; }
  }, []);

  const upgradePromptCount = getPromptCount();

  const showUpgradePrompt = useCallback((variant: "soft_gate" | "hearts" | "streak" | "game_lock") => {
    setActiveVariant(variant);
    try {
      const count = parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || "0", 10);
      localStorage.setItem(PROMPT_COUNT_KEY, String(count + 1));
    } catch {}
  }, []);

  const dismissUpgradePrompt = useCallback(() => {
    setActiveVariant(null);
  }, []);

  const specialOfferShown = (() => {
    try { return localStorage.getItem(SPECIAL_OFFER_SHOWN_KEY) === "true"; } catch { return false; }
  })();

  const shouldShowSpecialOffer = upgradePromptCount >= 5 && !hasAccess && !specialOfferShown;

  const markSpecialOfferShown = useCallback(() => {
    try { localStorage.setItem(SPECIAL_OFFER_SHOWN_KEY, "true"); } catch {}
  }, []);

  return {
    hasAccess,
    loading,
    isPremium: hasAccess,
    upgradePromptCount,
    showUpgradePrompt,
    dismissUpgradePrompt,
    activeVariant,
    shouldShowSpecialOffer,
    markSpecialOfferShown,
  };
};
