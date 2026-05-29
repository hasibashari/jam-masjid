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
    <section className={`flex-none h-[21vh] grid ${showImsak ? 'grid-cols-7' : 'grid-cols-6'} gap-[0.8vw] px-[2vw] pb-[1.5vh] transition-all duration-500`}>
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
                ? 'py-[1vh] px-[0.8vw] bg-[#D4AF37] shadow-[0_10px_20px_rgba(212,175,55,0.15)] ring-2 ring-white/10 text-[#051109] transform scale-105 z-10' 
                : isImsak
                  ? 'py-[0.8vh] px-[0.6vw] bg-white/5 border border-white/8 opacity-65 scale-95 text-white' 
                  : 'py-[1vh] px-[0.8vw] bg-white/8 border border-white/15 text-white'}
            `}
          >
            <span className={`text-[1.2vh] 2xl:text-[1.4vh] font-black uppercase tracking-[0.2em] mb-[0.5vh]
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
                ? 'text-[3.8vh] 2xl:text-[4.5vh] font-black text-[#051109]' 
                : isImsak 
                  ? 'text-[2.8vh] 2xl:text-[3.2vh] font-bold text-white/70' 
                  : 'text-[3.4vh] 2xl:text-[4vh] font-bold text-white'} 
              font-[family-name:var(--font-space)] tracking-tighter tabular-nums leading-none`}
            >
              {format(prayer.timeObj, 'HH:mm')}
            </p>
            {isNext ? (
              <span className="mt-[0.6vh] text-[1.1vh] font-black bg-[#051109] text-[#D4AF37] px-[0.8vw] py-[0.3vh] rounded-full font-sans tracking-wider">AKTIF</span>
            ) : (
              <div className={`mt-[0.8vh] w-5 h-[0.3vh] rounded-full ${isImsak ? 'bg-white/5' : 'bg-emerald-500/20'}`}></div>
            )}
          </div>
        );
      })}
    </section>
  );
}
