import { useState, useMemo } from "react";
import { useAvatar } from "@/contexts/AvatarContext";
import { useGameEconomy } from "@/contexts/GameEconomyContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import { avatarItems, RARITY_COLORS } from "@/data/avatar-items";
import { AvatarConfig, AvatarSkinTone, SKIN_TONE_COLORS, DEFAULT_AVATAR } from "@/types/avatar";
import { Diamond, Lock as LockIcon, Check, ArrowLeft, RotateCcw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TABS = [
  { key: 'skin', label: '🎨 Skin', type: null as string | null },
  { key: 'hair', label: '💇 Hair', type: 'hairStyle' },
  { key: 'hairColor', label: '🎨 Color', type: 'hairColor' },
  { key: 'face', label: '👁️ Face', type: 'eyes' },
  { key: 'mouth', label: '😊 Mouth', type: 'mouth' },
  { key: 'outfit', label: '👕 Outfit', type: 'outfit' },
  { key: 'accessory', label: '🎒 Accessories', type: 'accessory' },
  { key: 'background', label: '🖼️ Background', type: 'background' },
  { key: 'frame', label: '🖼️ Frame', type: 'frame' },
];

const SKIN_TONES: AvatarSkinTone[] = ['light', 'fair', 'medium', 'olive', 'tan', 'brown', 'dark'];

const AvatarBuilder = () => {
  const { avatarConfig, updateAvatar, purchaseItem, isItemUnlocked } = useAvatar();
  const { gems } = useGameEconomy();
  const { hasAccess: isPro } = usePremiumAccess();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('skin');
  const [purchaseDialog, setPurchaseDialog] = useState<string | null>(null);
  const [previewConfig, setPreviewConfig] = useState<AvatarConfig>(avatarConfig);

  const currentTabItems = useMemo(() => {
    const tab = TABS.find(t => t.key === activeTab);
    if (!tab?.type) return [];
    return avatarItems.filter(i => i.type === tab.type);
  }, [activeTab]);

  const handleItemTap = (item: typeof avatarItems[0]) => {
    if (isItemUnlocked(item.id)) {
      // Equip immediately
      const update = { [item.type]: item.value } as Partial<AvatarConfig>;
      setPreviewConfig(prev => ({ ...prev, ...update }));
      updateAvatar(update);
    } else {
      setPurchaseDialog(item.id);
    }
  };

  const handlePurchaseConfirm = async () => {
    if (!purchaseDialog) return;
    const item = avatarItems.find(i => i.id === purchaseDialog);
    if (!item) return;
    const success = await purchaseItem(purchaseDialog);
    if (success) {
      const update = { [item.type]: item.value } as Partial<AvatarConfig>;
      setPreviewConfig(prev => ({ ...prev, ...update }));
      updateAvatar(update);
    }
    setPurchaseDialog(null);
  };

  const purchaseItem_ = purchaseDialog ? avatarItems.find(i => i.id === purchaseDialog) : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10">
          <Diamond className="w-4 h-4 text-primary fill-primary" />
          <span className="text-sm font-extrabold text-primary">{gems}</span>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold font-display">Customize Avatar</h1>

      {/* Preview */}
      <div className="flex justify-center py-4">
        <AvatarRenderer config={previewConfig} size="xl" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              "shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'skin' ? (
        <div className="space-y-3">
          <p className="text-sm font-bold">Skin Tone</p>
          <div className="flex gap-2 flex-wrap">
            {SKIN_TONES.map(tone => (
              <button key={tone} onClick={() => { setPreviewConfig(p => ({ ...p, skinTone: tone })); updateAvatar({ skinTone: tone }); }}
                className={cn(
                  "w-10 h-10 rounded-full border-2 transition-all",
                  previewConfig.skinTone === tone ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border"
                )}
                style={{ backgroundColor: SKIN_TONE_COLORS[tone] }}
                title={tone}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {currentTabItems.map(item => {
            const unlocked = isItemUnlocked(item.id);
            const equipped = previewConfig[item.type as keyof AvatarConfig] === item.value;
            return (
              <button key={item.id} onClick={() => handleItemTap(item)}
                className={cn(
                  "relative rounded-xl border-2 p-3 text-center transition-all hover:shadow-sm",
                  equipped ? "border-primary bg-primary/5" : unlocked ? "border-border" : "border-border opacity-70"
                )}>
                {equipped && <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-primary" />}
                {!unlocked && <LockIcon className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-muted-foreground" />}
                <span className="text-2xl block mb-1">{item.emoji}</span>
                <p className="text-[10px] font-bold truncate">{item.name}</p>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5", RARITY_COLORS[item.rarity])}>
                  {item.rarity}
                </span>
                {!unlocked && (
                  <p className="text-[10px] font-bold mt-0.5 flex items-center justify-center gap-0.5">
                    {item.isPremium ? <><Crown className="w-2.5 h-2.5 text-amber-500" /> Plus</> :
                      item.rarity === 'legendary' ? '🏆' :
                        <><Diamond className="w-2.5 h-2.5 text-primary fill-primary" /> {item.price}</>}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => { setPreviewConfig(DEFAULT_AVATAR); updateAvatar(DEFAULT_AVATAR); }}
          className="gap-1.5 text-xs">
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
        <Button className="flex-1 rounded-xl font-bold" onClick={() => navigate(-1)}>
          Save & Close
        </Button>
      </div>

      {/* Purchase dialog */}
      <AlertDialog open={!!purchaseDialog} onOpenChange={() => setPurchaseDialog(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock {purchaseItem_?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {purchaseItem_?.isPremium && !isPro ? (
                "This item requires FinOva Plus membership."
              ) : purchaseItem_?.rarity === 'legendary' ? (
                "This item can only be earned through achievements!"
              ) : (
                <span className="flex items-center gap-1">
                  Cost: <Diamond className="w-3.5 h-3.5 text-primary fill-primary" />
                  <strong>{purchaseItem_?.price} gems</strong>
                  <span className="text-muted-foreground ml-2">(You have {gems})</span>
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {purchaseItem_?.isPremium && !isPro ? (
              <AlertDialogAction onClick={() => { setPurchaseDialog(null); navigate('/plus'); }}
                className="bg-amber-500 hover:bg-amber-600">Go Premium</AlertDialogAction>
            ) : purchaseItem_?.rarity !== 'legendary' ? (
              <AlertDialogAction onClick={handlePurchaseConfirm}
                disabled={gems < (purchaseItem_?.price ?? 0)}>Purchase</AlertDialogAction>
            ) : null}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AvatarBuilder;
