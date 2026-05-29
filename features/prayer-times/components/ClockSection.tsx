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
    <section className="flex-grow flex flex-col justify-center items-center gap-[clamp(1rem,3vh,2rem)] relative overflow-hidden w-full px-[4vw]">
      {/* Subtle Slow-Rotating Islamic Pattern Watermark */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none select-none">
        <svg
          className="w-[28vw] h-[28vw] text-[#D4AF37]/5 animate-[spin_240s_linear_infinite] max-w-[320px] max-h-[320px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          viewBox="0 0 100 100"
        >
          {/* Rub el Hizb / Islamic 8-Point Star */}
          <path d="M50 5 L63 20 L80 20 L80 37 L95 50 L80 63 L80 80 L63 80 L50 95 L37 80 L20 80 L20 63 L5 50 L20 37 L20 20 L37 20 Z" />
          {/* Concentric Decorative Rings */}
          <circle cx="50" cy="50" r="32" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="22" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="12" strokeDasharray="1 2" />
          {/* Delicate Cross Grid Lines */}
          <path d="M50 15 L50 85 M15 50 L85 50" strokeWidth="0.4" strokeDasharray="2 4" />
        </svg>
      </div>

      {/* Time Display (Floating Freely for Spacious Elegance) */}
      <div className="flex flex-col items-center justify-center z-10 select-none pointer-events-none">
        <div className="flex items-end relative">
          <span className="text-[clamp(5.5rem,10.5vh,8.5rem)] font-black leading-none tracking-tighter tabular-nums drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] font-[family-name:var(--font-space)]">
            {format(currentTime, 'HH:mm')}
          </span>

          <span className="text-[clamp(1.5rem,2.8vh,2.2rem)] text-[#9BB1A5] font-bold mb-[clamp(0.4rem,0.8vh,0.7rem)] ml-3">
            {format(currentTime, 'ss')}
          </span>
        </div>
      </div>

      {/* Elegant Golden Fading Divider with a Glowing Star-Dot */}
      <div className="w-[25vw] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent relative my-1 z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>
      </div>

      {/* Quotes Container - Relatif di bawah jam, menyusut secara dinamis mengikuti panjang teks */}
      <div className="w-fit max-w-[50vw] mx-auto z-10">
        <div
          className={`pt-[clamp(1rem,2vh,1.5rem)] pb-[clamp(0.8rem,1.5vh,1.1rem)] px-[clamp(1.5rem,2vw,2.5rem)] bg-emerald-950/30 border border-emerald-500/20 rounded-2xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 text-center ${isFading
            ? 'opacity-0 scale-98 blur-[2px]'
            : 'opacity-100 scale-100 blur-none'
            }`}
        >
          <p className="text-emerald-50/95 text-[clamp(0.95rem,1.9vh,1.25rem)] font-medium italic leading-relaxed line-clamp-3">
            &ldquo;{currentQuote.text}&rdquo;
          </p>

          <span className="block mt-[clamp(0.5rem,1vh,0.8rem)] text-emerald-300/80 text-[clamp(0.65rem,1.2vh,0.8rem)] font-extrabold uppercase tracking-[0.25em] truncate">
            — {currentQuote.source}
          </span>
        </div>
      </div>
    </section>
  );
}
