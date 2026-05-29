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
  
  const isFriday = currentTime ? currentTime.getDay() === 5 : new Date().getDay() === 5;

  prayers.push(
    { id: 'Fajr', label: 'Subuh', timeObj: timelineObj.Fajr },
    { id: 'Sunrise', label: 'Syuruq', timeObj: timelineObj.Sunrise },
    { id: 'Dhuhr', label: isFriday ? "Jum'at" : 'Dzuhur', timeObj: timelineObj.Dhuhr },
    { id: 'Asr', label: 'Ashar', timeObj: timelineObj.Asr },
    { id: 'Maghrib', label: 'Maghrib', timeObj: timelineObj.Maghrib },
    { id: 'Isha', label: 'Isya', timeObj: timelineObj.Isha }
  );

  return (
    <section className={`flex-none h-[18vh] grid ${showImsak ? 'grid-cols-7' : 'grid-cols-6'} gap-[clamp(0.5rem,0.8vw,1.2rem)] px-[2vw] pb-[clamp(1rem,2.5vh,2rem)] transition-all duration-500`}>
      {prayers.map((prayer) => {
        const isNext = prayer.id === nextPrayerName;
        const isSunrise = prayer.id === 'Sunrise';
        const isImsak = prayer.id === 'Imsak';
        
        return (
          <div 
            key={prayer.id}
            className={`
              flex flex-col items-center justify-center rounded-2xl transition-all duration-1000 shadow-sm text-center backdrop-blur-md
              ${isNext 
                ? 'py-[clamp(0.6rem,1.2vh,1rem)] px-[clamp(0.4rem,0.8vw,1rem)] bg-gradient-to-b from-[#D4AF37]/20 to-[#D4AF37]/5 border-2 border-[#D4AF37]/75 shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-102 z-10 text-white' 
                : isImsak
                  ? 'py-[clamp(0.5rem,1vh,0.8rem)] px-[clamp(0.3rem,0.6vw,0.8rem)] bg-white/5 border border-white/10 scale-98 text-white' 
                  : 'py-[clamp(0.6rem,1.2vh,1rem)] px-[clamp(0.4rem,0.8vw,1rem)] bg-emerald-950/10 border border-emerald-500/10 hover:border-emerald-500/20 text-white'}
            `}
          >
            <span className={`text-[clamp(0.7rem,1.3vh,0.9rem)] font-extrabold uppercase tracking-[0.2em] mb-[clamp(0.2rem,0.5vh,0.4rem)]
              ${isNext 
                ? 'text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' 
                : isImsak 
                  ? 'text-sky-300/80' 
                  : 'text-emerald-300/70'}`}
            >
              {prayer.label}
            </span>
            <p className={`
              ${isNext 
                ? 'text-white text-[clamp(1.8rem,3.8vh,3rem)] font-black drop-shadow-[0_2px_8px_rgba(212,175,55,0.5)]' 
                : isImsak 
                  ? 'text-[clamp(1.3rem,2.8vh,2.2rem)] font-bold text-sky-100/90' 
                  : 'text-[clamp(1.5rem,3.2vh,2.5rem)] font-bold text-emerald-50/90'} 
              font-[family-name:var(--font-space)] tracking-tighter tabular-nums leading-none`}
            >
              {format(prayer.timeObj, 'HH:mm')}
            </p>
            {isNext ? (
              <span className="mt-[clamp(0.4rem,0.8vh,0.8rem)] text-[clamp(0.6rem,1.1vh,0.8rem)] font-black bg-[#D4AF37] text-zinc-950 px-[0.6vw] py-[0.2vh] rounded-md font-sans tracking-widest shadow-md uppercase">AKTIF</span>
            ) : (
              <div className={`mt-[clamp(0.4rem,0.8vh,0.8rem)] w-4 h-[0.2vh] rounded-full ${isImsak ? 'bg-sky-400/40' : 'bg-emerald-500/30'}`}></div>
            )}
          </div>
        );
      })}
    </section>
  );
}
