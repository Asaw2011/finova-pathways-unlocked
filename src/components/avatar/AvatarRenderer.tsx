import React from "react";
import { AvatarConfig, SKIN_TONE_COLORS, HAIR_COLORS, BG_COLORS } from "@/types/avatar";
import { cn } from "@/lib/utils";

interface Props {
  config: AvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFrame?: boolean;
  onClick?: () => void;
  className?: string;
}

const SIZES = { sm: 32, md: 48, lg: 96, xl: 160 };

const FRAME_COLORS: Record<string, string> = {
  'basic-silver': '#C0C0C0',
  'basic-gold': '#DAA520',
  'premium-gold': '#FFD700',
  'diamond': '#B9F2FF',
  'fire-ring': '#FF4500',
  'leaf-wreath': '#22C55E',
  'neon-glow': '#A855F7',
  'pixel-art': '#F59E0B',
  'achievement-ring': '#EAB308',
};

const OUTFIT_COLORS: Record<string, string> = {
  'default-tee': '#6366F1',
  'business-suit': '#1E293B',
  'hoodie': '#64748B',
  'polo': '#0EA5E9',
  'blazer': '#334155',
  'vest': '#92400E',
  'tank-top': '#F43F5E',
  'turtleneck': '#1E293B',
  'lab-coat': '#F1F5F9',
  'cape': '#DC2626',
};

const AvatarRenderer = React.memo(({ config, size = 'md', showFrame = true, onClick, className }: Props) => {
  const px = SIZES[size];
  const vb = 100;
  const skin = SKIN_TONE_COLORS[config.skinTone];
  const hair = HAIR_COLORS[config.hairColor];
  const bg = BG_COLORS[config.background];
  const outfitColor = OUTFIT_COLORS[config.outfit] || '#6366F1';
  const frameColor = FRAME_COLORS[config.frame];
  const hasFrame = showFrame && config.frame !== 'none' && frameColor;

  const clipId = `clip-${size}-${config.shape}`;
  const gradId = `bg-grad-${size}`;

  const getClipPath = () => {
    switch (config.shape) {
      case 'rounded-square': return <rect x="5" y="5" width="90" height="90" rx="18" />;
      case 'hexagon': return <polygon points="50,2 93,25 93,75 50,98 7,75 7,25" />;
      case 'shield': return <path d="M50 2 L93 20 L93 60 Q93 90 50 98 Q7 90 7 60 L7 20 Z" />;
      case 'diamond': return <polygon points="50,2 95,50 50,98 5,50" />;
      default: return <circle cx="50" cy="50" r="48" />;
    }
  };

  const renderBackground = () => {
    if (bg.type === 'solid') return <rect width="100" height="100" fill={bg.colors[0]} />;
    if (bg.type === 'gradient') {
      return (
        <>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              {bg.colors.map((c, i) => <stop key={i} offset={`${(i / (bg.colors.length - 1)) * 100}%`} stopColor={c} />)}
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill={`url(#${gradId})`} />
        </>
      );
    }
    // pattern
    return (
      <>
        <rect width="100" height="100" fill={bg.colors[0]} />
        {[20, 50, 80].map(x => [20, 50, 80].map(y => (
          <text key={`${x}-${y}`} x={x} y={y} fontSize="8" fill="rgba(255,255,255,0.15)" textAnchor="middle" dominantBaseline="middle">$</text>
        )))}
      </>
    );
  };

  const renderOutfit = () => {
    const baseY = 72;
    const isCape = config.outfit === 'cape';
    return (
      <g>
        {isCape && <path d="M25 68 L10 95 L50 88 L90 95 L75 68" fill="#DC2626" opacity="0.6" />}
        <ellipse cx="50" cy="92" rx="28" ry="16" fill={outfitColor} />
        <rect x="32" y={baseY} width="36" height="24" rx="8" fill={outfitColor} />
        {config.outfit === 'business-suit' && (
          <>
            <line x1="50" y1={baseY + 2} x2="50" y2={baseY + 22} stroke="#475569" strokeWidth="1.5" />
            <path d="M42 72 L50 78 L58 72" fill="none" stroke="#475569" strokeWidth="1.2" />
          </>
        )}
        {config.outfit === 'hoodie' && <path d="M38 72 Q50 66 62 72" fill="none" stroke="#94A3B8" strokeWidth="1.5" />}
        {config.outfit === 'polo' && (
          <>
            <rect x="46" y={baseY} width="8" height="6" rx="1" fill={outfitColor} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          </>
        )}
        {config.outfit === 'lab-coat' && <line x1="50" y1={baseY + 2} x2="50" y2={baseY + 22} stroke="#CBD5E1" strokeWidth="1" />}
      </g>
    );
  };

  const renderHead = () => <ellipse cx="50" cy="48" rx="20" ry="22" fill={skin} />;

  const renderEyes = () => {
    const ly = 44; const ry = 44; const lx = 42; const rx = 58;
    const s = size === 'sm' ? 1.8 : 2.5;
    switch (config.eyes) {
      case 'happy': return <g><path d={`M${lx - s} ${ly} Q${lx} ${ly - s * 1.5} ${lx + s} ${ly}`} fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" /><path d={`M${rx - s} ${ry} Q${rx} ${ry - s * 1.5} ${rx + s} ${ry}`} fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" /></g>;
      case 'determined': return <g><ellipse cx={lx} cy={ly} rx={s} ry={s * 0.9} fill="#1a1a2e" /><ellipse cx={rx} cy={ry} rx={s} ry={s * 0.9} fill="#1a1a2e" /><line x1={lx - s} y1={ly - s * 1.2} x2={lx + s} y2={ly - s * 0.8} stroke="#1a1a2e" strokeWidth="1" /><line x1={rx - s} y1={ry - s * 0.8} x2={rx + s} y2={ry - s * 1.2} stroke="#1a1a2e" strokeWidth="1" /></g>;
      case 'cool': return <g><ellipse cx={lx} cy={ly} rx={s} ry={s * 0.6} fill="#1a1a2e" /><ellipse cx={rx} cy={ry} rx={s} ry={s * 0.6} fill="#1a1a2e" /></g>;
      case 'sleepy': return <g><path d={`M${lx - s} ${ly} Q${lx} ${ly + s} ${lx + s} ${ly}`} fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" /><path d={`M${rx - s} ${ry} Q${rx} ${ry + s} ${rx + s} ${ry}`} fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" /></g>;
      case 'sparkle': return <g><circle cx={lx} cy={ly} r={s} fill="#1a1a2e" /><circle cx={lx - 0.5} cy={ly - 0.8} r={s * 0.35} fill="white" /><circle cx={rx} cy={ry} r={s} fill="#1a1a2e" /><circle cx={rx - 0.5} cy={ry - 0.8} r={s * 0.35} fill="white" /></g>;
      case 'wink': return <g><circle cx={lx} cy={ly} r={s} fill="#1a1a2e" /><circle cx={lx - 0.5} cy={ly - 0.5} r={s * 0.3} fill="white" /><path d={`M${rx - s} ${ry} Q${rx} ${ry - s * 1.5} ${rx + s} ${ry}`} fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" /></g>;
      default: return <g><circle cx={lx} cy={ly} r={s} fill="#1a1a2e" /><circle cx={rx} cy={ry} r={s} fill="#1a1a2e" /></g>;
    }
  };

  const renderMouth = () => {
    const mx = 50; const my = 54;
    switch (config.mouth) {
      case 'grin': return <path d="M43 53 Q50 60 57 53" fill="white" stroke="#1a1a2e" strokeWidth="1" />;
      case 'neutral': return <line x1="44" y1={my} x2="56" y2={my} stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />;
      case 'smirk': return <path d="M44 54 Q52 56 56 52" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />;
      case 'open-smile': return <g><ellipse cx={mx} cy={my + 1} rx="5" ry="4" fill="#1a1a2e" /><ellipse cx={mx} cy={my - 0.5} rx="4" ry="2" fill="white" /></g>;
      case 'tongue-out': return <g><path d="M43 53 Q50 59 57 53" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" /><ellipse cx={mx} cy="57" rx="2.5" ry="2" fill="#F472B6" /></g>;
      default: return <path d="M43 53 Q50 58 57 53" fill="none" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />;
    }
  };

  const renderHair = () => {
    if (config.hairStyle === 'none') return null;
    switch (config.hairStyle) {
      case 'short-classic': return <path d="M30 42 Q30 24 50 22 Q70 24 70 42 L68 38 Q65 26 50 25 Q35 26 32 38 Z" fill={hair} />;
      case 'short-curly': return <g><path d="M30 42 Q28 22 50 20 Q72 22 70 42 L68 36 Q64 24 50 23 Q36 24 32 36 Z" fill={hair} />{[34, 42, 50, 58, 66].map(x => <circle key={x} cx={x} cy="23" r="3.5" fill={hair} />)}</g>;
      case 'medium-wavy': return <path d="M28 48 Q26 22 50 19 Q74 22 72 48 L70 40 Q66 24 50 22 Q34 24 30 40 Z" fill={hair} />;
      case 'long-straight': return <g><path d="M28 50 Q26 20 50 17 Q74 20 72 50 L70 38 Q66 22 50 20 Q34 22 30 38 Z" fill={hair} /><rect x="28" y="42" width="6" height="28" rx="3" fill={hair} /><rect x="66" y="42" width="6" height="28" rx="3" fill={hair} /></g>;
      case 'long-curly': return <g><path d="M27 50 Q25 18 50 16 Q75 18 73 50" fill={hair} />{[28, 72].map(x => <g key={x}><circle cx={x} cy="50" r="5" fill={hair} /><circle cx={x} cy="60" r="4.5" fill={hair} /><circle cx={x} cy="68" r="4" fill={hair} /></g>)}</g>;
      case 'buzz': return <path d="M31 44 Q31 26 50 24 Q69 26 69 44 L67 40 Q65 28 50 27 Q35 28 33 40 Z" fill={hair} />;
      case 'afro': return <ellipse cx="50" cy="36" rx="28" ry="24" fill={hair} />;
      case 'braids': return <g><path d="M28 48 Q26 20 50 17 Q74 20 72 48" fill={hair} />{[30, 70].map(x => <g key={x}>{[48, 56, 64, 72].map(y => <circle key={y} cx={x} cy={y} r="3" fill={hair} />)}</g>)}</g>;
      case 'bun': return <g><path d="M30 42 Q30 24 50 22 Q70 24 70 42" fill={hair} /><circle cx="50" cy="18" r="9" fill={hair} /></g>;
      case 'mohawk': return <g><path d="M32 42 Q32 28 50 26 Q68 28 68 42" fill={hair} />{[38, 44, 50, 56, 62].map((x, i) => <rect key={x} x={x - 2} y={14 + i * 0.5} width="4" height={12 - i} rx="2" fill={hair} />)}</g>;
      case 'ponytail': return <g><path d="M30 42 Q30 24 50 22 Q70 24 70 42" fill={hair} /><path d="M62 30 Q72 28 74 40 Q75 55 68 65" stroke={hair} strokeWidth="5" fill="none" strokeLinecap="round" /></g>;
      default: return null;
    }
  };

  const renderAccessory = () => {
    if (config.accessory === 'none') return null;
    switch (config.accessory) {
      case 'glasses-round': return <g><circle cx="42" cy="44" r="5" fill="none" stroke="#1E293B" strokeWidth="1.5" /><circle cx="58" cy="44" r="5" fill="none" stroke="#1E293B" strokeWidth="1.5" /><line x1="47" y1="44" x2="53" y2="44" stroke="#1E293B" strokeWidth="1" /></g>;
      case 'glasses-square': return <g><rect x="37" y="40" width="10" height="8" rx="1" fill="none" stroke="#1E293B" strokeWidth="1.5" /><rect x="53" y="40" width="10" height="8" rx="1" fill="none" stroke="#1E293B" strokeWidth="1.5" /><line x1="47" y1="44" x2="53" y2="44" stroke="#1E293B" strokeWidth="1" /></g>;
      case 'sunglasses': return <g><rect x="35" y="40" width="12" height="8" rx="3" fill="#1E293B" /><rect x="53" y="40" width="12" height="8" rx="3" fill="#1E293B" /><line x1="47" y1="44" x2="53" y2="44" stroke="#1E293B" strokeWidth="1.5" /><line x1="35" y1="44" x2="28" y2="42" stroke="#1E293B" strokeWidth="1" /><line x1="65" y1="44" x2="72" y2="42" stroke="#1E293B" strokeWidth="1" /></g>;
      case 'cap-forward': return <g><ellipse cx="50" cy="28" rx="22" ry="5" fill="#3B82F6" /><path d="M28 28 Q28 18 50 16 Q72 18 72 28" fill="#3B82F6" /><path d="M28 28 L20 30 Q18 31 22 32 L32 30" fill="#2563EB" /></g>;
      case 'cap-backward': return <g><ellipse cx="50" cy="28" rx="22" ry="5" fill="#EF4444" /><path d="M28 28 Q28 18 50 16 Q72 18 72 28" fill="#EF4444" /><path d="M72 28 L80 30 Q82 31 78 32 L68 30" fill="#DC2626" /></g>;
      case 'beanie': return <g><path d="M28 36 Q28 14 50 12 Q72 14 72 36" fill="#8B5CF6" /><rect x="28" y="32" width="44" height="6" rx="3" fill="#7C3AED" /><circle cx="50" cy="10" r="3" fill="#8B5CF6" /></g>;
      case 'headband': return <rect x="28" y="32" width="44" height="4" rx="2" fill="#F43F5E" />;
      case 'crown': return <g><polygon points="36,28 40,18 44,24 50,14 56,24 60,18 64,28" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8" />{[42, 50, 58].map(x => <circle key={x} cx={x} cy={21} r="1.5" fill="#EF4444" />)}</g>;
      case 'top-hat': return <g><rect x="38" y="8" width="24" height="20" rx="2" fill="#1E293B" /><ellipse cx="50" cy="28" rx="18" ry="4" fill="#1E293B" /><rect x="38" y="22" width="24" height="2" fill="#DAA520" /></g>;
      case 'graduation-cap': return <g><polygon points="50,14 80,24 50,34 20,24" fill="#1E293B" /><rect x="48" y="14" width="4" height="12" fill="#1E293B" /><line x1="72" y1="24" x2="72" y2="36" stroke="#DAA520" strokeWidth="1" /><circle cx="72" cy="37" r="2" fill="#DAA520" /></g>;
      case 'headphones': return <g><path d="M28 44 Q28 22 50 20 Q72 22 72 44" fill="none" stroke="#475569" strokeWidth="3" /><rect x="24" y="40" width="8" height="12" rx="4" fill="#475569" /><rect x="68" y="40" width="8" height="12" rx="4" fill="#475569" /></g>;
      case 'bow-tie': return <g><polygon points="44,72 50,68 56,72 50,76" fill="#EF4444" /><circle cx="50" cy="72" r="2" fill="#DC2626" /></g>;
      case 'earrings': return <g><circle cx="30" cy="52" r="2" fill="#FFD700" /><circle cx="70" cy="52" r="2" fill="#FFD700" /></g>;
      case 'necklace': return <path d="M38 68 Q50 76 62 68" fill="none" stroke="#FFD700" strokeWidth="1.5" />;
      case 'monocle': return <g><circle cx="58" cy="44" r="6" fill="none" stroke="#DAA520" strokeWidth="1.5" /><line x1="64" y1="44" x2="72" y2="56" stroke="#DAA520" strokeWidth="0.8" /></g>;
      default: return null;
    }
  };

  const renderFrame = () => {
    if (!hasFrame) return null;
    const sw = 3;
    switch (config.shape) {
      case 'rounded-square': return <rect x="3" y="3" width="94" height="94" rx="20" fill="none" stroke={frameColor} strokeWidth={sw} />;
      case 'hexagon': return <polygon points="50,0 95,24 95,76 50,100 5,76 5,24" fill="none" stroke={frameColor} strokeWidth={sw} />;
      case 'shield': return <path d="M50 0 L95 19 L95 61 Q95 92 50 100 Q5 92 5 61 L5 19 Z" fill="none" stroke={frameColor} strokeWidth={sw} />;
      case 'diamond': return <polygon points="50,0 97,50 50,100 3,50" fill="none" stroke={frameColor} strokeWidth={sw} />;
      default: return <circle cx="50" cy="50" r="49" fill="none" stroke={frameColor} strokeWidth={sw} />;
    }
  };

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${vb} ${vb}`}
      onClick={onClick}
      className={cn("shrink-0", onClick && "cursor-pointer", className)}
      style={{ borderRadius: config.shape === 'circle' ? '50%' : undefined }}
    >
      <defs>
        <clipPath id={clipId}>{getClipPath()}</clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {renderBackground()}
        {renderOutfit()}
        {renderHead()}
        {renderEyes()}
        {renderMouth()}
        {renderHair()}
        {renderAccessory()}
      </g>
      {renderFrame()}
    </svg>
  );
});

AvatarRenderer.displayName = 'AvatarRenderer';
export default AvatarRenderer;
