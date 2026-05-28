'use client';

import { useEffect, useState, useRef } from 'react';
import { BannerType } from '@/shared/types';
import { Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';

interface FullscreenBannerProps {
  banners: BannerType[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

// ─── Background preset registry ──────────────────────────────────────────────
// Returns { bgClass, isSolid } so the wrapper can use either a gradient or solid color
function getBgStyle(preset: string): { bgClass: string; isSolid: boolean } {
  switch (preset) {
    // Gradients (dark)
    case 'emerald':   return { bgClass: 'bg-gradient-to-br from-[#012a18] to-[#071f10]', isSolid: false };
    case 'sapphire':  return { bgClass: 'bg-gradient-to-br from-[#021838] to-[#040d20]', isSolid: false };
    case 'amber':     return { bgClass: 'bg-gradient-to-br from-[#2c1800] to-[#160d00]', isSolid: false };
    case 'purple':    return { bgClass: 'bg-gradient-to-br from-[#1e0230] to-[#0e0118]', isSolid: false };
    // Solid colors
    case 'solid-black':    return { bgClass: 'bg-[#0a0a0a]', isSolid: true };
    case 'solid-navy':     return { bgClass: 'bg-[#0d1b2a]', isSolid: true };
    case 'solid-forest':   return { bgClass: 'bg-[#071a10]', isSolid: true };
    case 'solid-slate':    return { bgClass: 'bg-[#0f172a]', isSolid: true };
    case 'solid-maroon':   return { bgClass: 'bg-[#1a0a00]', isSolid: true };
    default:          return { bgClass: 'bg-gradient-to-br from-[#012a18] to-[#071f10]', isSolid: false };
  }
}

export default function FullscreenBanner({ banners, activeIndex, onIndexChange }: FullscreenBannerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(100);
  const [imgError, setImgError] = useState(false);
  const [mouseActive, setMouseActive] = useState(true);

  const currentBanner = banners[activeIndex] || banners[0];
  const duration = (currentBanner?.autoHideAfter || 15) * 1000;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls
  useEffect(() => {
    const show = () => {
      setMouseActive(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => setMouseActive(false), 3000);
    };
    window.addEventListener('mousemove', show);
    show();
    return () => {
      window.removeEventListener('mousemove', show);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, []);

  // Reset on slide change
  useEffect(() => {
    setImgError(false);
    setProgress(100);
  }, [activeIndex]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) { if (timeoutRef.current) clearInterval(timeoutRef.current); return; }
    const startTime = Date.now();
    timeoutRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(timeoutRef.current!);
        handleNext();
      }
    }, 50);
    return () => { if (timeoutRef.current) clearInterval(timeoutRef.current); };
  }, [activeIndex, isPlaying, duration]);

  const handlePrev = () => {
    if (banners.length <= 1) return;
    onIndexChange(activeIndex === 0 ? banners.length - 1 : activeIndex - 1);
  };
  const handleNext = () => {
    if (banners.length <= 1) return;
    onIndexChange(activeIndex === banners.length - 1 ? 0 : activeIndex + 1);
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, banners.length]);

  if (!currentBanner) return null;

  const isText = currentBanner.contentMode === 'TEXT';
  const { bgClass } = getBgStyle(currentBanner.bgGradient || 'emerald');

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center select-none animate-fade-in overflow-hidden bg-black">

      {/* ── TEXT / INFO BOARD ──────────────────────────────────────────── */}
      {isText ? (
        <div className={`w-full h-full ${bgClass} flex flex-col z-20 relative overflow-hidden`}>

          {/* Very subtle noise texture overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.025] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]"></div>

          {/* ══ TOP ACCENT BAR ══ */}
          <div className="w-full h-1 bg-[#D4AF37] shrink-0 opacity-80"></div>

          {/* ══ HEADER (Centered, formal board title) ══ */}
          <div className="flex flex-col items-center justify-center px-10 py-5 shrink-0">
            <div className="flex items-center gap-3">
              <Megaphone className="w-6 h-6 text-[#D4AF37]" />
              <span
                className="text-[#D4AF37] font-black uppercase tracking-[0.35em]"
                style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1.25rem)' }}
              >
                Papan Informasi Masjid
              </span>
              <Megaphone className="w-6 h-6 text-[#D4AF37] scale-x-[-1]" />
            </div>
          </div>

          {/* ══ HORIZONTAL RULE ══ */}
          <div className="mx-10 h-px bg-white/8 shrink-0"></div>

          {/* ══ MAIN CONTENT ══ */}
          <div className="flex-1 flex flex-col items-center justify-center px-16 py-8 min-h-0 text-center">
            <h1
              className="font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-lg"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 5.5rem)' }}
            >
              {currentBanner.title}
            </h1>

            {currentBanner.description && (
              <>
                {/* Thin gold separator */}
                <div className="flex items-center gap-3 my-6 w-full max-w-2xl">
                  <div className="flex-1 h-px bg-[#D4AF37]/25"></div>
                  <div className="w-1 h-1 rounded-full bg-[#D4AF37]/50"></div>
                  <div className="flex-1 h-px bg-[#D4AF37]/25"></div>
                </div>

                <p
                  className="text-white/65 font-normal leading-relaxed max-w-4xl whitespace-pre-line"
                  style={{ fontSize: 'clamp(1rem, 2vw, 1.9rem)' }}
                >
                  {currentBanner.description}
                </p>
              </>
            )}
          </div>

          {/* ══ FOOTER ══ */}
          <div className="mx-10 h-px bg-white/8 shrink-0"></div>
          <div className="flex items-center justify-between px-10 py-4 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">Tayangan Otomatis</span>
            </div>
            <div className="flex items-center gap-4">
              {/* Slide counter moved to footer */}
              {banners.length > 1 && (
                <span className="text-white/20 text-xs font-mono tracking-widest">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
                </span>
              )}
              {/* Progress thin bar */}
              <div className="w-36 bg-white/10 h-0.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#D4AF37] h-full rounded-full transition-all duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* ══ BOTTOM ACCENT BAR ══ */}
          <div className="w-full h-1 bg-[#D4AF37] shrink-0 opacity-20"></div>
        </div>
      ) : (
        /* ── IMAGE POSTER ─────────────────────────────────────────────── */
        <>
          {!imgError ? (
            <div className="absolute inset-0 scale-110 filter blur-xl opacity-40 pointer-events-none">
              <img src={currentBanner.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#051109] to-zinc-950 opacity-80"></div>
          )}
          <div className="relative w-screen h-screen flex items-center justify-center z-10">
            {imgError ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-[#0c2415] via-[#051109] to-zinc-950 w-full h-full">
                <div className="w-24 h-24 rounded-full bg-emerald-950/80 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-inner animate-pulse">
                  <Megaphone className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight max-w-3xl mb-6 leading-tight">
                  Poster Informasi
                </h2>
              </div>
            ) : (
              <img src={currentBanner.imageUrl} alt="Poster" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={() => setImgError(true)} />
            )}
          </div>
        </>
      )}

      {/* ── CAROUSEL ARROWS ───────────────────────────────────────────── */}
      {banners.length > 1 && (
        <div className={`absolute inset-0 flex items-center justify-between px-6 z-30 pointer-events-none transition-opacity duration-500 ${mouseActive ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={handlePrev} className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer">
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button onClick={handleNext} className="w-14 h-14 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer">
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* ── SLIDE DOTS ────────────────────────────────────────────────── */}
      {banners.length > 1 && (
        <div className={`absolute bottom-6 left-0 right-0 flex justify-center z-35 transition-all duration-500 ${!mouseActive ? 'opacity-40' : 'opacity-100'}`}>
          <div className="flex items-center gap-2.5 pointer-events-auto">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`relative h-1.5 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                  activeIndex === idx ? 'w-7 bg-[#D4AF37]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
              >
                {activeIndex === idx && isPlaying && (
                  <div className="absolute inset-y-0 left-0 bg-white/40 transition-all duration-75 ease-out rounded-full" style={{ width: `${100 - progress}%` }}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
