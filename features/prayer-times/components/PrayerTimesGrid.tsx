'use client';

import { format } from 'date-fns';

interface PrayerTimesGridProps {
  timelineObj: {
    Fajr: Date;
    Sunrise: Date;
    Dhuhr: Date;
    Asr: Date;
    Maghrib: Date;
    Isha: Date;
  };
  nextPrayerName: string;
}

export default function PrayerTimesGrid({ timelineObj, nextPrayerName }: PrayerTimesGridProps) {
  const prayers = [
    { id: 'Fajr', label: 'Subuh', timeObj: timelineObj.Fajr },
    { id: 'Sunrise', label: 'Syuruq', timeObj: timelineObj.Sunrise },
    { id: 'Dhuhr', label: 'Dzuhur', timeObj: timelineObj.Dhuhr },
    { id: 'Asr', label: 'Ashar', timeObj: timelineObj.Asr },
    { id: 'Maghrib', label: 'Maghrib', timeObj: timelineObj.Maghrib },
    { id: 'Isha', label: 'Isya', timeObj: timelineObj.Isha }
  ];

  return (
    <section className="flex-none h-[240px] grid grid-cols-6 gap-4 px-8 pb-10">
      {prayers.map((prayer) => {
        const isNext = prayer.id === nextPrayerName;
        const isSunrise = prayer.id === 'Sunrise';
        
        return (
          <div 
            key={prayer.id}
            className={`
              flex flex-col items-center justify-center rounded-3xl transition-all duration-1000 p-6 shadow-sm
              ${isNext 
                ? 'bg-[#D4AF37] shadow-[0_20px_50px_rgba(212,175,55,0.15)] ring-4 ring-white/10 text-[#051109] transform scale-105 z-10' 
                : 'bg-white/5 border border-white/10 text-white'}
            `}
          >
            <span className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${isNext ? 'text-[#051109]/70' : isSunrise ? 'text-emerald-500/60' : 'text-emerald-500'}`}>
              {prayer.label}
            </span>
            <p className={`${isNext ? 'text-6xl font-black' : 'text-5xl font-bold'} font-[family-name:var(--font-space)] tracking-tighter tabular-nums ${isSunrise && !isNext ? 'opacity-50' : ''}`}>
              {format(prayer.timeObj, 'HH:mm')}
            </p>
            {isNext ? (
              <span className="mt-4 text-[10px] font-black bg-[#051109] text-[#D4AF37] px-3 py-1 rounded-full">AKTIF</span>
            ) : (
              <div className={`mt-4 w-12 h-1 rounded-full ${isSunrise ? 'bg-white/5' : 'bg-white/10'}`}></div>
            )}
          </div>
        );
      })}
    </section>
  );
}
