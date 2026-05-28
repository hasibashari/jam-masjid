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
    <section className="flex-grow flex flex-col items-center justify-center relative w-full h-full">
      {/* 1. Centered Clock Container (Independent, perfectly stable height) */}
      <div className="z-10 flex flex-col items-center justify-center -mt-16 md:-mt-20 lg:-mt-24 select-none pointer-events-none">
        {/* Massive Digital Time Display - Highly scalable up to 75" TV screens */}
        <div className="flex items-end">
          <span className="text-[6.5rem] sm:text-[140px] md:text-[180px] lg:text-[230px] xl:text-[280px] 2xl:text-[330px] min-[1800px]:text-[370px] font-black leading-none tracking-tighter tabular-nums drop-shadow-2xl font-[family-name:var(--font-space)] transition-all duration-500">
            {format(currentTime, 'HH:mm')}
          </span>
          <span className="text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl text-emerald-400/55 font-medium tabular-nums tracking-wide mb-[0.6vw] sm:mb-[0.8vw] md:mb-[1vw] lg:mb-[1.4vw] xl:mb-[1.7vw] 2xl:mb-[2vw] ml-3 md:ml-4 lg:ml-6 xl:ml-8 transition-all duration-500">
            {format(currentTime, 'ss')}
          </span>
        </div>
      </div>

      {/* 2. Absolute Quotes Container at Bottom Center (Leaves the digital clock centered and completely stable) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl px-6 md:px-8 text-center z-10 select-none pointer-events-none transition-all duration-500">
        <div 
          className={`px-6 md:px-10 py-4 md:py-6 bg-black/25 border border-white/5 rounded-2xl backdrop-blur-sm transition-all duration-500 flex flex-col justify-center min-h-[140px] md:min-h-[120px] lg:min-h-[150px] xl:min-h-[180px] ${
            isFading ? 'opacity-0 scale-98 blur-[2px]' : 'opacity-100 scale-100 blur-none'
          }`}
        >
          <p className="text-zinc-200 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-medium italic leading-relaxed">
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
