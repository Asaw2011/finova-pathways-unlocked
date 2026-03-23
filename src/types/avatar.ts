export type AvatarShape = 'circle' | 'rounded-square' | 'hexagon' | 'shield' | 'diamond';
export type AvatarSkinTone = 'light' | 'fair' | 'medium' | 'olive' | 'tan' | 'brown' | 'dark';
export type AvatarHairStyle = 'none' | 'short-classic' | 'short-curly' | 'medium-wavy' | 'long-straight' | 'long-curly' | 'buzz' | 'afro' | 'braids' | 'bun' | 'mohawk' | 'ponytail';
export type AvatarHairColor = 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'blue' | 'purple' | 'pink' | 'green' | 'teal';
export type AvatarEyes = 'default' | 'happy' | 'determined' | 'cool' | 'sleepy' | 'sparkle' | 'wink';
export type AvatarMouth = 'smile' | 'grin' | 'neutral' | 'smirk' | 'open-smile' | 'tongue-out';
export type AvatarAccessory = 'none' | 'glasses-round' | 'glasses-square' | 'sunglasses' | 'monocle' | 'headband' | 'cap-forward' | 'cap-backward' | 'beanie' | 'crown' | 'top-hat' | 'graduation-cap' | 'headphones' | 'bow-tie' | 'earrings' | 'necklace';
export type AvatarOutfit = 'default-tee' | 'business-suit' | 'hoodie' | 'polo' | 'blazer' | 'vest' | 'tank-top' | 'turtleneck' | 'lab-coat' | 'cape';
export type AvatarBackground = 'solid-green' | 'solid-blue' | 'solid-purple' | 'solid-orange' | 'solid-pink' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-forest' | 'gradient-gold' | 'gradient-aurora' | 'pattern-money' | 'pattern-charts' | 'pattern-coins' | 'city-skyline' | 'mountain-top' | 'space';
export type AvatarFrame = 'none' | 'basic-silver' | 'basic-gold' | 'premium-gold' | 'diamond' | 'fire-ring' | 'leaf-wreath' | 'neon-glow' | 'pixel-art' | 'achievement-ring';
export type AvatarExpression = 'neutral' | 'happy' | 'excited' | 'determined' | 'thinking' | 'celebrating';

export interface AvatarConfig {
  shape: AvatarShape;
  skinTone: AvatarSkinTone;
  hairStyle: AvatarHairStyle;
  hairColor: AvatarHairColor;
  eyes: AvatarEyes;
  mouth: AvatarMouth;
  accessory: AvatarAccessory;
  outfit: AvatarOutfit;
  background: AvatarBackground;
  frame: AvatarFrame;
  expression: AvatarExpression;
}

export interface AvatarItem {
  id: string;
  type: 'hairStyle' | 'hairColor' | 'eyes' | 'mouth' | 'accessory' | 'outfit' | 'background' | 'frame';
  name: string;
  value: string;
  price: number;
  isPremium: boolean;
  unlockedBy?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  emoji: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  shape: 'circle',
  skinTone: 'medium',
  hairStyle: 'short-classic',
  hairColor: 'black',
  eyes: 'default',
  mouth: 'smile',
  accessory: 'none',
  outfit: 'default-tee',
  background: 'solid-green',
  frame: 'none',
  expression: 'neutral',
};

export const SKIN_TONE_COLORS: Record<AvatarSkinTone, string> = {
  light: '#FDDCB5',
  fair: '#F5C9A0',
  medium: '#D8A67A',
  olive: '#C49358',
  tan: '#A67843',
  brown: '#7B5636',
  dark: '#4A3222',
};

export const HAIR_COLORS: Record<AvatarHairColor, string> = {
  black: '#1a1a2e',
  brown: '#6B3A2A',
  blonde: '#D4A843',
  red: '#B83A21',
  gray: '#9CA3AF',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  green: '#10B981',
  teal: '#14B8A6',
};

export const BG_COLORS: Record<AvatarBackground, { type: 'solid' | 'gradient' | 'pattern'; colors: string[] }> = {
  'solid-green': { type: 'solid', colors: ['#34D399'] },
  'solid-blue': { type: 'solid', colors: ['#60A5FA'] },
  'solid-purple': { type: 'solid', colors: ['#A78BFA'] },
  'solid-orange': { type: 'solid', colors: ['#FB923C'] },
  'solid-pink': { type: 'solid', colors: ['#F472B6'] },
  'gradient-sunset': { type: 'gradient', colors: ['#F97316', '#EC4899'] },
  'gradient-ocean': { type: 'gradient', colors: ['#06B6D4', '#3B82F6'] },
  'gradient-forest': { type: 'gradient', colors: ['#059669', '#14B8A6'] },
  'gradient-gold': { type: 'gradient', colors: ['#F59E0B', '#D97706'] },
  'gradient-aurora': { type: 'gradient', colors: ['#8B5CF6', '#06B6D4', '#10B981'] },
  'pattern-money': { type: 'pattern', colors: ['#059669'] },
  'pattern-charts': { type: 'pattern', colors: ['#3B82F6'] },
  'pattern-coins': { type: 'pattern', colors: ['#F59E0B'] },
  'city-skyline': { type: 'pattern', colors: ['#1E293B', '#334155'] },
  'mountain-top': { type: 'gradient', colors: ['#7C3AED', '#EC4899', '#F97316'] },
  'space': { type: 'gradient', colors: ['#0F172A', '#1E1B4B', '#312E81'] },
};
