'use client';

import { useEffect, useState, useRef } from 'react';
import { BannerType } from '@/shared/types';
import Image from 'next/image';
import { Megaphone } from 'lucide-react';

interface FullscreenBannerProps {
  banner: BannerType;
  onComplete: () => void;
}

export default function FullscreenBanner({ banner, onComplete }: FullscreenBannerProps) {
  const [progress, setProgress] = useState(100);
  const [imgError, setImgError] = useState(false);
  const [prevBannerId, setPrevBannerId] = useState(banner.id);
  const duration = banner.autoHideAfter * 1000; // in milliseconds

  // Reset image error state in render phase when banner changes to avoid cascading renders
  if (banner.id !== prevBannerId) {
    setPrevBannerId(banner.id);
    setImgError(false);
  }

  // Create a ref for the callback to prevent HMR and poller updates from resetting the timer
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, 50); // Tick every 50ms for buttery progression

    return () => clearInterval(interval);
  }, [banner.id, duration]); // Rely strictly on banner.id to avoid resetting when poller refreshes object reference

  return (
    <div className="fixed inset-0 z-40 bg-black flex items-center justify-center select-none animate-fade-in overflow-hidden">
      
      {/* Background Ambience Blurred Poster */}
      {!imgError ? (
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
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#051109] to-zinc-950 opacity-80"></div>
      )}

      {/* Main Fullscreen Poster Image (Zero padding, full viewport container) */}
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
          <Image
            src={banner.imageUrl}
            alt="Poster Banner"
            fill
            sizes="100vw"
            className="object-cover"
            referrerPolicy="no-referrer"
            priority
            onError={() => setImgError(true)}
          />
        )}
      </div>
      
    </div>
  );
}
