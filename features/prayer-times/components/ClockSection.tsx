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
    <section className="flex-grow flex flex-col justify-center items-center gap-[2vh] relative overflow-hidden w-full px-[4vw]">
      {/* Clock */}
      <div className="flex flex-col items-center justify-center z-10 select-none pointer-events-none">
        {/* Time */}
        <div className="flex items-end">
          <span className="text-[13vh] 2xl:text-[16vh] font-black leading-none tracking-tighter tabular-nums drop-shadow-2xl font-[family-name:var(--font-space)]">
            {format(currentTime, 'HH:mm')}
          </span>

          <span className="text-[3.5vh] 2xl:text-[4.5vh] text-emerald-400/55 font-medium mb-[0.8vh] lg:mb-[1.2vh] ml-3">
            {format(currentTime, 'ss')}
          </span>
        </div>
      </div>

      {/* Quotes Container - Relatif di bawah jam, menyusut secara dinamis mengikuti panjang teks */}
      <div className="w-fit max-w-[48vw] mx-auto z-10">
        <div
          className={`pt-[2.4vh] pb-[1.8vh] px-[2.5vw] bg-black/35 border border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-500 text-center ${isFading
            ? 'opacity-0 scale-98 blur-[2px]'
            : 'opacity-100 scale-100 blur-none'
            }`}
        >
          <p className="text-zinc-200 text-[1.8vh] 2xl:text-[2.2vh] font-medium italic leading-relaxed line-clamp-3">
            &ldquo;{currentQuote.text}&rdquo;
          </p>

          <span className="block mt-[1vh] text-emerald-400 text-[1.1vh] 2xl:text-[1.3vh] font-extrabold uppercase tracking-[0.2em] truncate">
            — {currentQuote.source}
          </span>
        </div>
      </div>
    </section>
  );
}
