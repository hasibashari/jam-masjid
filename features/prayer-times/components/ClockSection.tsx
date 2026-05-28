'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

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
}

export default function ClockSection({ currentTime }: ClockSectionProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
        setIsFading(false);
      }, 500); // 500ms fade out duration before switching content
    }, 30000); // Rotate every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex-grow flex flex-col items-center justify-center relative">
      <div className="z-10 flex flex-col items-center">
        {/* Massive Digital Time Display */}
        <div className="text-[14rem] md:text-[180px] font-black leading-none tracking-tighter tabular-nums drop-shadow-2xl mb-4 font-[family-name:var(--font-space)] relative">
          {format(currentTime, 'HH:mm')}
          <span className="text-5xl md:text-6xl text-emerald-500 font-medium absolute mt-auto bottom-8 ml-4 tabular-nums">
            {format(currentTime, 'ss')}
          </span>
        </div>

        {/* Islamic Daily Quotes Carousel */}
        <div 
          className={`mt-8 px-8 py-4 bg-black/25 border border-white/5 rounded-2xl max-w-2xl text-center backdrop-blur-sm transition-all duration-500 transform ${
            isFading ? 'opacity-0 scale-98 blur-[2px]' : 'opacity-100 scale-100 blur-none'
          }`}
        >
          <p className="text-zinc-200 text-lg md:text-xl font-medium italic leading-relaxed">
            "{ISLAMIC_QUOTES[currentQuoteIndex].text}"
          </p>
          <span className="block mt-2.5 text-emerald-400 text-xs font-extrabold uppercase tracking-[0.2em]">
            — {ISLAMIC_QUOTES[currentQuoteIndex].source}
          </span>
        </div>
      </div>
    </section>
  );
}
