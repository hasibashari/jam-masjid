'use client';

import { format } from 'date-fns';

interface PrayerTimesGridProps {
  timelineObj: {
    Imsak: Date;
    Fajr: Date;
    Sunrise: Date;
    Dhuhr: Date;
    Asr: Date;
    Maghrib: Date;
    Isha: Date;
  };
  nextPrayerName: string;
  hijriDate?: string;
  currentTime?: Date;
}

export default function PrayerTimesGrid({ timelineObj, nextPrayerName, hijriDate, currentTime }: PrayerTimesGridProps) {
  // Determine if we should display the Imsak column (Approaching Subuh within 60 minutes OR during Ramadan)
  const isRamadan = hijriDate?.toLowerCase().includes('ramadan') || hijriDate?.toLowerCase().includes('ramadhan');
  let showImsak = !!isRamadan;

  if (currentTime && timelineObj.Imsak && timelineObj.Fajr) {
    const msToFajr = timelineObj.Fajr.getTime() - currentTime.getTime();
    // Show Imsak if we are within 60 minutes before Fajr
    if (msToFajr > 0 && msToFajr <= 60 * 60 * 1000) {
      showImsak = true;
    }
  }

  // Build prayers grid array dynamically
  const prayers = [];
  
  if (showImsak) {
    prayers.push({ id: 'Imsak', label: 'Imsak', timeObj: timelineObj.Imsak });
  }
  
  prayers.push(
    { id: 'Fajr', label: 'Subuh', timeObj: timelineObj.Fajr },
    { id: 'Sunrise', label: 'Syuruq', timeObj: timelineObj.Sunrise },
    { id: 'Dhuhr', label: 'Dzuhur', timeObj: timelineObj.Dhuhr },
    { id: 'Asr', label: 'Ashar', timeObj: timelineObj.Asr },
    { id: 'Maghrib', label: 'Maghrib', timeObj: timelineObj.Maghrib },
    { id: 'Isha', label: 'Isya', timeObj: timelineObj.Isha }
  );

  return (
    <section className={`flex-none h-[240px] grid ${showImsak ? 'grid-cols-7' : 'grid-cols-6'} gap-4 px-8 pb-10 transition-all duration-500`}>
      {prayers.map((prayer) => {
        const isNext = prayer.id === nextPrayerName;
        const isSunrise = prayer.id === 'Sunrise';
        const isImsak = prayer.id === 'Imsak';
        
        return (
          <div 
            key={prayer.id}
            className={`
              flex flex-col items-center justify-center rounded-3xl transition-all duration-1000 shadow-sm
              ${isNext 
                ? 'p-6 bg-[#D4AF37] shadow-[0_20px_50px_rgba(212,175,55,0.15)] ring-4 ring-white/10 text-[#051109] transform scale-105 z-10' 
                : isImsak
                  ? 'p-4 bg-white/3 border border-white/5 opacity-60 scale-95 text-white' 
                  : 'p-6 bg-white/5 border border-white/10 text-white'}
            `}
          >
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 
              ${isNext 
                ? 'text-[#051109]/70' 
                : isImsak 
                  ? 'text-sky-400/50' 
                  : 'text-emerald-400/80'}`}
            >
              {prayer.label}
            </span>
            <p className={`
              ${isNext 
                ? 'text-6xl font-black text-[#051109]' 
                : isImsak 
                  ? 'text-4xl font-bold text-white/70' 
                  : 'text-5xl font-bold text-white'} 
              font-[family-name:var(--font-space)] tracking-tighter tabular-nums`}
            >
              {format(prayer.timeObj, 'HH:mm')}
            </p>
            {isNext ? (
              <span className="mt-4 text-[10px] font-black bg-[#051109] text-[#D4AF37] px-3 py-1 rounded-full font-sans">AKTIF</span>
            ) : (
              <div className={`mt-4 w-12 h-1 rounded-full ${isImsak ? 'bg-white/5' : 'bg-emerald-500/20'}`}></div>
            )}
          </div>
        );
      })}
    </section>
  );
}
