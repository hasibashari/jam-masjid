'use client';

import { useEffect, useState, useRef } from 'react';
import { BannerType } from '@/shared/types';
import { Megaphone, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface FullscreenBannerProps {
  banners: BannerType[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
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

  // Auto-hide controls when mouse is inactive
  useEffect(() => {
    const handleMouseMove = () => {
      setMouseActive(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        setMouseActive(false);
      }, 3000); // Hide controls after 3 seconds of inactivity
    };

    window.addEventListener('mousemove', handleMouseMove);
    handleMouseMove();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, []);

  // Reset image error state when active index changes
  useEffect(() => {
    setImgError(false);
    setProgress(100);
  }, [activeIndex]);

  // Handle auto-advance timing
  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
      return;
    }

    const startTime = Date.now();
    const tickInterval = 50;

    timeoutRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration) {
        if (timeoutRef.current) clearInterval(timeoutRef.current);
        handleNext();
      }
    }, tickInterval);

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [activeIndex, isPlaying, duration]);

  // Navigation handlers
  const handlePrev = () => {
    if (banners.length <= 1) return;
    const nextIdx = activeIndex === 0 ? banners.length - 1 : activeIndex - 1;
    onIndexChange(nextIdx);
  };

  const handleNext = () => {
    if (banners.length <= 1) return;
    const nextIdx = activeIndex === banners.length - 1 ? 0 : activeIndex + 1;
    onIndexChange(nextIdx);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, banners.length]);

  if (!currentBanner) return null;

  const isText = currentBanner.contentMode === 'TEXT';

  const getGradientClass = (preset: string) => {
    switch (preset) {
      case 'emerald': return 'from-[#022416] via-[#051109] to-[#0e3321]';
      case 'sapphire': return 'from-[#031d44] via-[#020b1e] to-[#010814]';
      case 'amber': return 'from-[#2d1a04] via-[#0c0902] to-[#1e1102]';
      case 'purple': return 'from-[#24032c] via-[#0f0214] to-[#12011b]';
      case 'charcoal': return 'from-[#1c1c1c] via-[#0d0d0d] to-[#111111]';
      default: return 'from-[#022416] via-[#051109] to-[#0e3321]';
    }
  };

  const gradient = getGradientClass(currentBanner.bgGradient || 'emerald');

  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center select-none animate-fade-in overflow-hidden">
      
      {/* 1. Background Content Layer */}
      {isText ? (
        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center p-8 sm:p-12 md:p-16 z-20`}>
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none"></div>
          
          <div className="relative w-full max-w-5xl aspect-[16/9] max-h-[80vh] bg-black/35 border border-white/10 rounded-[40px] p-8 md:p-12 lg:p-16 flex flex-col justify-between items-center text-center backdrop-blur-md shadow-2xl transition-all duration-1000 transform hover:scale-[1.01]">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center mb-4 md:mb-6 shadow-inner shadow-emerald-500/20 animate-pulse shrink-0">
              <Megaphone className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37]" />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-4xl gap-4 md:gap-6 lg:gap-8">
              <h1 className="text-[3rem] sm:text-[4rem] md:text-[4.5rem] lg:text-[5rem] font-black text-white uppercase tracking-tight leading-none font-sans drop-shadow-lg text-pretty">
                {currentBanner.title}
              </h1>
              
              {currentBanner.description && (
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-zinc-300 font-medium leading-relaxed max-w-3xl mx-auto text-pretty">
                  {currentBanner.description}
                </p>
              )}
            </div>
            
            {/* Tiny spacer to accommodate dots indicators beautifully at the bottom */}
            <div className="h-4"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Background Blurred Poster */}
          {!imgError ? (
            <div className="absolute inset-0 scale-110 filter blur-xl opacity-40 pointer-events-none">
              <img
                src={currentBanner.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#051109] to-zinc-950 opacity-80"></div>
          )}

          {/* Main Fullscreen Poster Image */}
          <div className="relative w-screen h-screen flex items-center justify-center z-10">
            {imgError ? (
              <div className="flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-[#0c2415] via-[#051109] to-zinc-950 w-full h-full border border-emerald-500/20">
                <div className="w-24 h-24 rounded-full bg-emerald-950/80 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-inner animate-pulse">
                  <Megaphone className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight max-w-3xl mb-6 leading-tight font-sans">
                  Poster Informasi
                </h2>
              </div>
            ) : (
              <img
                src={currentBanner.imageUrl}
                alt="Poster Banner"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            )}
          </div>
        </>
      )}

      {/* 2. Interactive Carousel Controls Layer (Arrows & Play/Pause) */}
      {banners.length > 1 && (
        <div className={`absolute inset-0 flex items-center justify-between px-6 z-30 pointer-events-none transition-opacity duration-500 ${
          mouseActive ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="w-16 h-16 rounded-full bg-black/40 hover:bg-emerald-600/70 border border-white/10 text-white flex items-center justify-center backdrop-blur shadow-2xl transition-all duration-300 transform hover:scale-115 active:scale-95 pointer-events-auto cursor-pointer"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="w-16 h-16 rounded-full bg-black/40 hover:bg-emerald-600/70 border border-white/10 text-white flex items-center justify-center backdrop-blur shadow-2xl transition-all duration-300 transform hover:scale-115 active:scale-95 pointer-events-auto cursor-pointer"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}

      {/* 3. Bottom Carousel Status & Pagination Indicators */}
      <div className={`absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center gap-4 z-35 transition-all duration-500 ${
        banners.length > 1 && !mouseActive ? 'translate-y-2 opacity-60' : 'translate-y-0 opacity-100'
      }`}>
        
        {/* Pagination Dots Capsule (Fully Transparent & Minimalist) */}
        {banners.length > 1 && (
          <div className="flex items-center gap-3 pointer-events-auto">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`relative h-2 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                  activeIndex === idx 
                    ? 'w-8 bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Buka Slide ${idx + 1}`}
              >
                {/* Visual smooth progress bar overlay inside the active indicator pill itself! */}
                {activeIndex === idx && isPlaying && (
                  <div 
                    className="absolute inset-y-0 left-0 bg-white/40 transition-all duration-75 ease-out rounded-full"
                    style={{ width: `${100 - progress}%` }}
                  ></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
