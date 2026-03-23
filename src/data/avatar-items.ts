import { AvatarItem } from "@/types/avatar";

export const avatarItems: AvatarItem[] = [
  // === HAIR STYLES ===
  // Common
  { id: 'hair-short-curly', type: 'hairStyle', name: 'Short Curly', value: 'short-curly', price: 30, isPremium: false, rarity: 'common', emoji: '💇' },
  { id: 'hair-long-straight', type: 'hairStyle', name: 'Long Straight', value: 'long-straight', price: 35, isPremium: false, rarity: 'common', emoji: '💇‍♀️' },
  { id: 'hair-ponytail', type: 'hairStyle', name: 'Ponytail', value: 'ponytail', price: 30, isPremium: false, rarity: 'common', emoji: '🎀' },
  { id: 'hair-bun', type: 'hairStyle', name: 'Bun', value: 'bun', price: 35, isPremium: false, rarity: 'common', emoji: '💇‍♀️' },
  // Uncommon
  { id: 'hair-long-curly', type: 'hairStyle', name: 'Long Curly', value: 'long-curly', price: 80, isPremium: false, rarity: 'uncommon', emoji: '🌀' },
  { id: 'hair-braids', type: 'hairStyle', name: 'Braids', value: 'braids', price: 100, isPremium: false, rarity: 'uncommon', emoji: '✨' },
  { id: 'hair-afro', type: 'hairStyle', name: 'Afro', value: 'afro', price: 90, isPremium: false, rarity: 'uncommon', emoji: '🌟' },
  // Rare
  { id: 'hair-mohawk', type: 'hairStyle', name: 'Mohawk', value: 'mohawk', price: 175, isPremium: false, rarity: 'rare', emoji: '🤘' },

  // === HAIR COLORS ===
  // Common
  { id: 'hc-blonde', type: 'hairColor', name: 'Blonde', value: 'blonde', price: 25, isPremium: false, rarity: 'common', emoji: '🟡' },
  { id: 'hc-red', type: 'hairColor', name: 'Red', value: 'red', price: 30, isPremium: false, rarity: 'common', emoji: '🔴' },
  { id: 'hc-gray', type: 'hairColor', name: 'Gray', value: 'gray', price: 25, isPremium: false, rarity: 'common', emoji: '⚪' },
  // Uncommon
  { id: 'hc-blue', type: 'hairColor', name: 'Blue', value: 'blue', price: 75, isPremium: false, rarity: 'uncommon', emoji: '🔵' },
  { id: 'hc-purple', type: 'hairColor', name: 'Purple', value: 'purple', price: 80, isPremium: false, rarity: 'uncommon', emoji: '🟣' },
  // Rare
  { id: 'hc-pink', type: 'hairColor', name: 'Pink', value: 'pink', price: 150, isPremium: false, rarity: 'rare', emoji: '🩷' },
  { id: 'hc-green', type: 'hairColor', name: 'Green', value: 'green', price: 160, isPremium: false, rarity: 'rare', emoji: '🟢' },
  { id: 'hc-teal', type: 'hairColor', name: 'Teal', value: 'teal', price: 165, isPremium: false, rarity: 'rare', emoji: '💎' },

  // === EYES ===
  { id: 'eyes-determined', type: 'eyes', name: 'Determined', value: 'determined', price: 30, isPremium: false, rarity: 'common', emoji: '😤' },
  { id: 'eyes-sleepy', type: 'eyes', name: 'Sleepy', value: 'sleepy', price: 30, isPremium: false, rarity: 'common', emoji: '😴' },
  { id: 'eyes-cool', type: 'eyes', name: 'Cool', value: 'cool', price: 80, isPremium: false, rarity: 'uncommon', emoji: '😎' },
  { id: 'eyes-sparkle', type: 'eyes', name: 'Sparkle', value: 'sparkle', price: 175, isPremium: false, rarity: 'rare', emoji: '✨' },
  { id: 'eyes-wink', type: 'eyes', name: 'Wink', value: 'wink', price: 350, isPremium: true, rarity: 'epic', emoji: '😉' },

  // === MOUTH ===
  { id: 'mouth-grin', type: 'mouth', name: 'Grin', value: 'grin', price: 25, isPremium: false, rarity: 'common', emoji: '😁' },
  { id: 'mouth-smirk', type: 'mouth', name: 'Smirk', value: 'smirk', price: 30, isPremium: false, rarity: 'common', emoji: '😏' },
  { id: 'mouth-open-smile', type: 'mouth', name: 'Open Smile', value: 'open-smile', price: 85, isPremium: false, rarity: 'uncommon', emoji: '😃' },
  { id: 'mouth-tongue-out', type: 'mouth', name: 'Tongue Out', value: 'tongue-out', price: 160, isPremium: false, rarity: 'rare', emoji: '😛' },

  // === OUTFITS ===
  { id: 'outfit-hoodie', type: 'outfit', name: 'Hoodie', value: 'hoodie', price: 40, isPremium: false, rarity: 'common', emoji: '🧥' },
  { id: 'outfit-polo', type: 'outfit', name: 'Polo', value: 'polo', price: 45, isPremium: false, rarity: 'common', emoji: '👔' },
  { id: 'outfit-blazer', type: 'outfit', name: 'Blazer', value: 'blazer', price: 100, isPremium: false, rarity: 'uncommon', emoji: '🧑‍💼' },
  { id: 'outfit-vest', type: 'outfit', name: 'Vest', value: 'vest', price: 85, isPremium: false, rarity: 'uncommon', emoji: '🦺' },
  { id: 'outfit-turtleneck', type: 'outfit', name: 'Turtleneck', value: 'turtleneck', price: 90, isPremium: false, rarity: 'uncommon', emoji: '🧣' },
  { id: 'outfit-lab-coat', type: 'outfit', name: 'Lab Coat', value: 'lab-coat', price: 200, isPremium: false, rarity: 'rare', emoji: '🥼' },
  { id: 'outfit-business-suit', type: 'outfit', name: 'Business Suit', value: 'business-suit', price: 400, isPremium: true, rarity: 'epic', emoji: '💼' },
  { id: 'outfit-cape', type: 'outfit', name: 'Cape', value: 'cape', price: 450, isPremium: true, rarity: 'epic', emoji: '🦸' },

  // === ACCESSORIES ===
  { id: 'acc-glasses-round', type: 'accessory', name: 'Round Glasses', value: 'glasses-round', price: 80, isPremium: false, rarity: 'uncommon', emoji: '🤓' },
  { id: 'acc-glasses-square', type: 'accessory', name: 'Square Glasses', value: 'glasses-square', price: 80, isPremium: false, rarity: 'uncommon', emoji: '👓' },
  { id: 'acc-cap-forward', type: 'accessory', name: 'Cap (Forward)', value: 'cap-forward', price: 90, isPremium: false, rarity: 'uncommon', emoji: '🧢' },
  { id: 'acc-headband', type: 'accessory', name: 'Headband', value: 'headband', price: 75, isPremium: false, rarity: 'uncommon', emoji: '🎽' },
  { id: 'acc-sunglasses', type: 'accessory', name: 'Sunglasses', value: 'sunglasses', price: 175, isPremium: false, rarity: 'rare', emoji: '🕶️' },
  { id: 'acc-cap-backward', type: 'accessory', name: 'Cap (Backward)', value: 'cap-backward', price: 160, isPremium: false, rarity: 'rare', emoji: '🧢' },
  { id: 'acc-beanie', type: 'accessory', name: 'Beanie', value: 'beanie', price: 150, isPremium: false, rarity: 'rare', emoji: '🎿' },
  { id: 'acc-headphones', type: 'accessory', name: 'Headphones', value: 'headphones', price: 200, isPremium: false, rarity: 'rare', emoji: '🎧' },
  { id: 'acc-earrings', type: 'accessory', name: 'Earrings', value: 'earrings', price: 180, isPremium: false, rarity: 'rare', emoji: '💍' },
  { id: 'acc-bow-tie', type: 'accessory', name: 'Bow Tie', value: 'bow-tie', price: 170, isPremium: false, rarity: 'rare', emoji: '🎀' },
  { id: 'acc-monocle', type: 'accessory', name: 'Monocle', value: 'monocle', price: 350, isPremium: true, rarity: 'epic', emoji: '🧐' },
  { id: 'acc-crown', type: 'accessory', name: 'Crown', value: 'crown', price: 500, isPremium: true, rarity: 'epic', emoji: '👑' },
  { id: 'acc-graduation-cap', type: 'accessory', name: 'Graduation Cap', value: 'graduation-cap', price: 400, isPremium: true, rarity: 'epic', emoji: '🎓' },
  { id: 'acc-necklace', type: 'accessory', name: 'Necklace', value: 'necklace', price: 300, isPremium: true, rarity: 'epic', emoji: '📿' },
  { id: 'acc-top-hat', type: 'accessory', name: 'Top Hat', value: 'top-hat', price: 450, isPremium: true, rarity: 'epic', emoji: '🎩' },

  // === BACKGROUNDS ===
  { id: 'bg-purple', type: 'background', name: 'Purple', value: 'solid-purple', price: 30, isPremium: false, rarity: 'common', emoji: '🟣' },
  { id: 'bg-orange', type: 'background', name: 'Orange', value: 'solid-orange', price: 30, isPremium: false, rarity: 'common', emoji: '🟠' },
  { id: 'bg-pink', type: 'background', name: 'Pink', value: 'solid-pink', price: 30, isPremium: false, rarity: 'common', emoji: '🩷' },
  { id: 'bg-sunset', type: 'background', name: 'Sunset', value: 'gradient-sunset', price: 100, isPremium: false, rarity: 'uncommon', emoji: '🌅' },
  { id: 'bg-ocean', type: 'background', name: 'Ocean', value: 'gradient-ocean', price: 100, isPremium: false, rarity: 'uncommon', emoji: '🌊' },
  { id: 'bg-forest', type: 'background', name: 'Forest', value: 'gradient-forest', price: 100, isPremium: false, rarity: 'uncommon', emoji: '🌲' },
  { id: 'bg-gold', type: 'background', name: 'Gold', value: 'gradient-gold', price: 200, isPremium: false, rarity: 'rare', emoji: '✨' },
  { id: 'bg-money', type: 'background', name: 'Money', value: 'pattern-money', price: 175, isPremium: false, rarity: 'rare', emoji: '💵' },
  { id: 'bg-charts', type: 'background', name: 'Charts', value: 'pattern-charts', price: 180, isPremium: false, rarity: 'rare', emoji: '📊' },
  { id: 'bg-aurora', type: 'background', name: 'Aurora', value: 'gradient-aurora', price: 400, isPremium: true, rarity: 'epic', emoji: '🌌' },
  { id: 'bg-coins', type: 'background', name: 'Coins', value: 'pattern-coins', price: 350, isPremium: true, rarity: 'epic', emoji: '🪙' },
  { id: 'bg-city', type: 'background', name: 'City Skyline', value: 'city-skyline', price: 450, isPremium: true, rarity: 'epic', emoji: '🏙️' },
  // Legendary
  { id: 'bg-mountain', type: 'background', name: 'Mountain Top', value: 'mountain-top', price: 0, isPremium: false, rarity: 'legendary', emoji: '🏔️', unlockedBy: 'all-modules' },
  { id: 'bg-space', type: 'background', name: 'Space', value: 'space', price: 0, isPremium: false, rarity: 'legendary', emoji: '🚀', unlockedBy: 'level-20' },

  // === FRAMES ===
  { id: 'frame-silver', type: 'frame', name: 'Silver', value: 'basic-silver', price: 40, isPremium: false, rarity: 'common', emoji: '⬜' },
  { id: 'frame-gold', type: 'frame', name: 'Gold', value: 'basic-gold', price: 100, isPremium: false, rarity: 'uncommon', emoji: '🟨' },
  { id: 'frame-premium-gold', type: 'frame', name: 'Premium Gold', value: 'premium-gold', price: 200, isPremium: false, rarity: 'rare', emoji: '🏆' },
  { id: 'frame-leaf', type: 'frame', name: 'Leaf Wreath', value: 'leaf-wreath', price: 225, isPremium: false, rarity: 'rare', emoji: '🍃' },
  { id: 'frame-diamond', type: 'frame', name: 'Diamond', value: 'diamond', price: 400, isPremium: true, rarity: 'epic', emoji: '💎' },
  { id: 'frame-fire', type: 'frame', name: 'Fire Ring', value: 'fire-ring', price: 450, isPremium: true, rarity: 'epic', emoji: '🔥' },
  { id: 'frame-neon', type: 'frame', name: 'Neon Glow', value: 'neon-glow', price: 400, isPremium: true, rarity: 'epic', emoji: '💡' },
  // Legendary
  { id: 'frame-achievement', type: 'frame', name: 'Achievement Ring', value: 'achievement-ring', price: 0, isPremium: false, rarity: 'legendary', emoji: '⭐', unlockedBy: '15-badges' },
  { id: 'frame-pixel', type: 'frame', name: 'Pixel Art', value: 'pixel-art', price: 0, isPremium: false, rarity: 'legendary', emoji: '👾', unlockedBy: 'all-games' },
];

export const RARITY_COLORS: Record<string, string> = {
  common: 'text-muted-foreground bg-muted',
  uncommon: 'text-emerald-600 bg-emerald-500/10',
  rare: 'text-blue-600 bg-blue-500/10',
  epic: 'text-violet-600 bg-violet-500/10',
  legendary: 'text-amber-600 bg-amber-500/10',
};
