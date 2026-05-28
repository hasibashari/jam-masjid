'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { QuoteType } from '@/shared/types';

const ISLAMIC_QUOTES = [
  {
    text: "Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.",
    source: "QS. Al-Ankabut: 45"
  },
  {
    text: "Shalat berjamaah lebih utama daripada shalat sendirian sebanyak dua puluh tujuh derajat.",
    source: "HR. Bukhari & Muslim"
  },
  {
    text: "Jadikanlah sabar dan shalat sebagai penolongmu. Sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyu'.",
    source: "QS. Al-Baqarah: 45"
  },
  {
    text: "Siapa yang membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga.",
    source: "HR. Bukhari & Muslim"
  },
  {
    text: "Amalan yang paling dicintai oleh Allah adalah shalat pada waktunya.",
    source: "HR. Bukhari & Muslim"
  },
  {
    text: "Dekatnya seorang hamba dengan Tuhannya adalah ketika dia sedang sujud, maka perbanyaklah doa.",
    source: "HR. Muslim"
  },
  {
    text: "Apabila salah seorang di antara kalian masuk masjid, maka kerjakanlah shalat dua rakaat sebelum ia duduk.",
    source: "HR. Bukhari & Muslim"
  },
  {
    text: "Terangilah rumah-rumah kalian dengan shalat dan pembacaan Al-Qur'an.",
    source: "HR. Al-Baihaqi"
  }
];

interface ClockSectionProps {
  currentTime: Date;
  quotes?: QuoteType[];
}

export default function ClockSection({ currentTime, quotes }: ClockSectionProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const activeQuotes = (quotes && quotes.length > 0)
    ? quotes.filter(q => q.active)
    : ISLAMIC_QUOTES;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => {
          const listLength = activeQuotes.length > 0 ? activeQuotes.length : 1;
          return (prev + 1) % listLength;
        });
        setIsFading(false);
      }, 500); // 500ms fade out duration before switching content
    }, 30000); // Rotate every 30 seconds

    return () => clearInterval(interval);
  }, [activeQuotes.length]);

  const currentQuote = activeQuotes[currentQuoteIndex] || ISLAMIC_QUOTES[0];

  return (
    <section className="relative w-full h-full grid grid-rows-[1fr_auto_1fr] overflow-hidden">
      {/* Clock */}
      <div className="row-start-2 flex flex-col items-center justify-center z-10 select-none pointer-events-none -translate-y-6 md:-translate-y-14 lg:-translate-y-20">

        {/* Time */}
        <div className="flex items-end">
          <span className="text-[4rem] sm:text-[80px] md:text-[110px] lg:text-[140px] xl:text-[180px] 2xl:text-[210px] min-[1800px]:text-[240px] font-black leading-none tracking-tighter tabular-nums drop-shadow-2xl font-[family-name:var(--font-space)]">
            {format(currentTime, 'HH:mm')}
          </span>

          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-emerald-400/55 font-medium mb-[0.5vw] ml-3">
            {format(currentTime, 'ss')}
          </span>
        </div>
      </div>

      {/* 2. Absolute Quotes Container at Bottom Center (Leaves the digital clock centered and completely stable) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl px-6 md:px-8 z-10">
        <div
          className={`px-6 md:px-10 py-4 md:py-6 bg-black/25 border border-white/5 rounded-2xl backdrop-blur-sm transition-all duration-500 text-center ${isFading
            ? 'opacity-0 scale-98 blur-[2px]'
            : 'opacity-100 scale-100 blur-none'
            }`}
        >
          <p className="text-zinc-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-medium italic leading-relaxed line-clamp-3">
            &ldquo;{currentQuote.text}&rdquo;
          </p>

          <span className="block mt-2.5 md:mt-3.5 text-emerald-400 text-[10px] sm:text-xs lg:text-sm xl:text-base font-extrabold uppercase tracking-[0.2em] truncate">
            — {currentQuote.source}
          </span>
        </div>
      </div>
    </section>
  );
}
