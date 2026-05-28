'use client';

import { format } from 'date-fns';

interface ClockSectionProps {
  currentTime: Date;
  nextPrayerName: string;
  countdownStr: string;
  timezone: string;
}

export default function ClockSection({ currentTime, nextPrayerName, countdownStr, timezone }: ClockSectionProps) {
  const PRAYER_TRANSLATIONS: Record<string, string> = {
    Fajr: 'Subuh',
    Sunrise: 'Syuruq',
    Dhuhr: 'Dzuhur',
    Asr: 'Ashar',
    Maghrib: 'Maghrib',
    Isha: 'Isya'
  };
  const translatedNextPrayerName = PRAYER_TRANSLATIONS[nextPrayerName] || nextPrayerName;

  return (
    <main className="flex-grow flex flex-col items-center justify-center relative">
      {/* Background aesthetic circular shapes */}
      <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] border-[40px] border-white rounded-full"></div>
      </div>
      
      <div className="z-10 flex flex-col items-center">
        {/* Massive Digital Time Display */}
        <div className="text-[14rem] md:text-[180px] font-black leading-none tracking-tighter tabular-nums drop-shadow-2xl mb-4 font-[family-name:var(--font-space)] relative">
          {format(currentTime, 'HH:mm')}
          <span className="text-5xl md:text-6xl text-emerald-500 font-medium absolute mt-auto bottom-8 ml-4 tabular-nums">
            {format(currentTime, 'ss')}
          </span>
        </div>
        
        {/* Next Prayer Countdown Widget */}
        <div className="flex items-center gap-6 bg-emerald-900/30 border border-emerald-500/20 px-10 py-5 rounded-3xl backdrop-blur-md shadow-xl">
          <div className="flex flex-col border-r border-emerald-500/30 pr-6 text-left">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Selanjutnya</span>
            <span className="text-3xl font-bold text-white tracking-tight">{translatedNextPrayerName}</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Hitung Mundur ({timezone})</span>
            <span className="text-4xl font-black text-[#D4AF37] tabular-nums tracking-tighter">{countdownStr}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
