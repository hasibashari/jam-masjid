'use client';

import { useEffect, useState } from 'react';
import { BannerType } from '@/shared/types';
import Image from 'next/image';

interface FullscreenBannerProps {
  banner: BannerType;
  onComplete: () => void;
}

export default function FullscreenBanner({ banner, onComplete }: FullscreenBannerProps) {
  const [progress, setProgress] = useState(100);
  const duration = banner.autoHideAfter * 1000; // in milliseconds

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 50); // Tick every 50ms for buttery progression

    return () => clearInterval(interval);
  }, [banner, duration, onComplete]);

  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center select-none animate-fade-in overflow-hidden">
      {/* Background Ambience Blurred Poster */}
      <div className="absolute inset-0 scale-110 filter blur-xl opacity-40 pointer-events-none">
        <Image
          src={banner.imageUrl}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Main Fullscreen Poster Image */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center z-10 px-8 py-4">
        <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-zinc-950/20">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-contain"
            referrerPolicy="no-referrer"
            priority
          />
        </div>
      </div>

      {/* Bottom informational bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-32 pb-12 px-16 flex flex-col gap-4">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex-1 text-left">
            <span className="text-emerald-400 text-xs font-black tracking-[0.3em] uppercase block mb-2">PENGUMUMAN MASJID</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#D4AF37] tracking-tight uppercase leading-tight mb-3">
              {banner.title}
            </h1>
            {banner.description && (
              <p className="text-zinc-300 text-xl font-medium max-w-4xl line-clamp-2 leading-relaxed">
                {banner.description}
              </p>
            )}
          </div>
          <div className="text-right flex flex-col items-end gap-1 shrink-0">
            <span className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">AUTO NEXT</span>
            <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-emerald-500 transition-all duration-75" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
