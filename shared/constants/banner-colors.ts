export type BannerGradientId =
  | 'emerald'
  | 'sapphire'
  | 'amber'
  | 'purple'
  | 'solid-black'
  | 'solid-navy'
  | 'solid-forest'
  | 'solid-slate'
  | 'solid-maroon';

export interface BannerColorOption {
  id: BannerGradientId;
  cls: string;
  name: string;
}

export const BANNER_GRADIENT_COLORS: BannerColorOption[] = [
  { id: 'emerald',  cls: 'bg-gradient-to-br from-[#012a18] to-[#071f10]', name: 'Hijau Tua' },
  { id: 'sapphire', cls: 'bg-gradient-to-br from-[#021838] to-[#040d20]', name: 'Biru Tua' },
  { id: 'amber',    cls: 'bg-gradient-to-br from-[#2c1800] to-[#160d00]', name: 'Amber' },
  { id: 'purple',   cls: 'bg-gradient-to-br from-[#1e0230] to-[#0e0118]', name: 'Ungu' },
];

export const BANNER_SOLID_COLORS: BannerColorOption[] = [
  { id: 'solid-black',  cls: 'bg-[#0a0a0a]', name: 'Hitam' },
  { id: 'solid-navy',   cls: 'bg-[#0d1b2a]', name: 'Navy' },
  { id: 'solid-forest', cls: 'bg-[#071a10]', name: 'Hutan' },
  { id: 'solid-slate',  cls: 'bg-[#0f172a]', name: 'Slate' },
  { id: 'solid-maroon', cls: 'bg-[#1a0a00]', name: 'Maroon' },
];

export const ALL_BANNER_COLORS: BannerColorOption[] = [
  ...BANNER_GRADIENT_COLORS,
  ...BANNER_SOLID_COLORS,
];

/**
 * Resolves a BannerGradientId to its TailwindCSS background className.
 * Falls back to the default 'emerald' gradient.
 */
export function getBannerBgClass(id: string | undefined): string {
  const found = ALL_BANNER_COLORS.find((c) => c.id === id);
  return found?.cls ?? BANNER_GRADIENT_COLORS[0].cls;
}

/**
 * Returns the full background class string for use in the preview panel
 * and the live display component (FullscreenBanner).
 */
export function getFullBannerBgClass(id: string | undefined): string {
  if (id === 'solid-black')  return 'bg-[#0a0a0a]';
  if (id === 'solid-navy')   return 'bg-[#0d1b2a]';
  if (id === 'solid-forest') return 'bg-[#071a10]';
  if (id === 'solid-slate')  return 'bg-[#0f172a]';
  if (id === 'solid-maroon') return 'bg-[#1a0a00]';
  if (id === 'sapphire')     return 'bg-gradient-to-br from-[#021838] to-[#040d20]';
  if (id === 'amber')        return 'bg-gradient-to-br from-[#2c1800] to-[#160d00]';
  if (id === 'purple')       return 'bg-gradient-to-br from-[#1e0230] to-[#0e0118]';
  return 'bg-gradient-to-br from-[#012a18] to-[#071f10]'; // default: emerald
}
