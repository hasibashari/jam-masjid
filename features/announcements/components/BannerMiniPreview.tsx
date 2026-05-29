'use client';

import { Megaphone } from 'lucide-react';
import { getFullBannerBgClass } from '@/shared/constants/banner-colors';

interface BannerMiniPreviewProps {
  title: string;
  description?: string;
  bgGradient: string;
}

/**
 * Miniature 16:9 preview of the text-mode banner layout.
 * Used in both the Add and Edit banner forms.
 */
export default function BannerMiniPreview({ title, description, bgGradient }: BannerMiniPreviewProps) {
  const bgClass = getFullBannerBgClass(bgGradient);

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
      <span className="text-[10px] text-zinc-500 font-bold uppercase">Preview Papan Informasi</span>
      <div className={`relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/8 flex flex-col ${bgClass}`}>
        {/* Top accent line */}
        <div className="w-full h-[3px] bg-[#D4AF37] shrink-0 opacity-80" />
        {/* Header row */}
        <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <Megaphone className="w-2.5 h-2.5 text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-[6px] font-black uppercase tracking-[0.2em]">
              Papan Informasi Masjid
            </span>
          </div>
        </div>
        <div className="mx-3 h-px bg-white/10" />
        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 py-2 text-center">
          <h4 className="text-[9px] font-black text-white uppercase tracking-tight leading-tight line-clamp-2">
            {title || 'JUDUL PENGUMUMAN'}
          </h4>
          {description && (
            <p className="text-[6px] text-white/60 mt-1 line-clamp-2 leading-normal">{description}</p>
          )}
        </div>
        <div className="mx-3 h-px bg-white/10" />
        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="text-white/30 text-[5px] font-mono uppercase">Auto</span>
          </div>
          <div className="w-10 bg-white/10 h-0.5 rounded-full">
            <div className="bg-[#D4AF37] h-full w-4/5 rounded-full" />
          </div>
        </div>
        {/* Bottom accent line */}
        <div className="w-full h-[2px] bg-[#D4AF37] shrink-0 opacity-20" />
      </div>
    </div>
  );
}
