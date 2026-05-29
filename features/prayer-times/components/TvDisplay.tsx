'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppSettings, AnnouncementType, BannerType, QuoteType, PRAYER_TRANSLATIONS } from '@/shared/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, Moon, Maximize, Minimize } from 'lucide-react';

// Feature-Based Absolute Imports
import LocationPickerModal from '@/features/location/components/LocationPickerModal';
import RunningAnnouncements from '@/features/announcements/components/RunningAnnouncements';
import ClockSection from './ClockSection';
import PrayerTimesGrid from './PrayerTimesGrid';

// Custom Hooks
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { useWakeLock } from '../hooks/useWakeLock';
import { useAutoHideCursor } from '../hooks/useAutoHideCursor';
import { useFullscreen } from '../hooks/useFullscreen';
import { useTvDisplayData } from '../hooks/useTvDisplayData';
import { useAdzanAlarm } from '../hooks/useAdzanAlarm';

// Fullscreen Stage Screens
import FullscreenAdzan from './FullscreenAdzan';
import FullscreenIqomah from './FullscreenIqomah';
import FullscreenPraying from './FullscreenPraying';
import FullscreenBanner from '@/features/announcements/components/FullscreenBanner';

interface TvDisplayProps {
  initialSettings: AppSettings;
  initialAnnouncements: AnnouncementType[];
  initialQuotes: QuoteType[];
}

export default function TvDisplay({ initialSettings, initialAnnouncements, initialQuotes }: TvDisplayProps) {
  // 1. Data synchronization & polling hook (every 2s)
  const {
    settings,
    setSettings,
    announcements,
    banners,
    quotes,
    bgError,
    setBgError,
  } = useTvDisplayData({ initialSettings, initialAnnouncements, initialQuotes });

  // 2. Kiosk system optimization hooks
  useWakeLock();
  const mouseActive = useAutoHideCursor();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // 3. Modals and Display Stage States
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'CLOCK' | 'BANNER'>('CLOCK');
  const [bgBannerIndex, setBgBannerIndex] = useState(0);

  // 4. Core prayer calculation hook
  const {
    currentTime,
    prayerTimes,
    timezoneLabel,
    nextPrayer,
    timelineObj,
    countdownStr,
    hijriDate,
    prayerStage,
    activePrayerName,
    stageSecondsLeft
  } = usePrayerTimes({
    latitude: settings.latitude,
    longitude: settings.longitude,
    calculationMethod: settings.calculationMethod,
    adzanDuration: settings.adzanDuration,
    iqomahFajr: settings.iqomahFajr,
    iqomahDhuhr: settings.iqomahDhuhr,
    iqomahAsr: settings.iqomahAsr,
    iqomahMaghrib: settings.iqomahMaghrib,
    iqomahIsha: settings.iqomahIsha,
    prayerDuration: settings.prayerDuration,
    adjustImsak: settings.adjustImsak,
    adjustFajr: settings.adjustFajr,
    adjustSunrise: settings.adjustSunrise,
    adjustDhuhr: settings.adjustDhuhr,
    adjustAsr: settings.adjustAsr,
    adjustMaghrib: settings.adjustMaghrib,
    adjustIsha: settings.adjustIsha
  });

  // 5. Audio, adzan alarm & Tahrim background audio hooks
  useAdzanAlarm({
    prayerStage,
    stageSecondsLeft,
    adzanAudioActive: settings.adzanAudioActive,
    adzanAudioUrl: settings.adzanAudioUrl,
    adzanAudioVolume: settings.adzanAudioVolume,
    currentTime,
    fajrTime: timelineObj ? timelineObj.Fajr : null,
    tahrimAudioActive: settings.tahrimAudioActive,
    tahrimAudioUrl: settings.tahrimAudioUrl,
    tahrimDuration: settings.tahrimDuration,
  });

  const translatedPrayerName = activePrayerName
    ? (activePrayerName === 'Dhuhr' && currentTime && currentTime.getDay() === 5 ? "Jum'at" : PRAYER_TRANSLATIONS[activePrayerName] || activePrayerName)
    : '';

  // Automatically switch to BANNER mode if there are active banners, otherwise use CLOCK
  useEffect(() => {
    const activeBanners = banners.filter(b => b.active);
    if (activeBanners.length > 0) {
      setViewMode('BANNER');
    } else {
      setViewMode('CLOCK');
      setBgBannerIndex(0);
    }
  }, [banners]);

  const handleBannerComplete = useCallback(() => {
    const activeBanners = banners.filter(b => b.active);
    if (activeBanners.length === 0) {
      setViewMode('CLOCK');
      return;
    }
    if (bgBannerIndex + 1 < activeBanners.length) {
      setBgBannerIndex(prev => prev + 1);
    } else {
      // Loop back to the first poster instead of returning to the clock
      setBgBannerIndex(0);
    }
  }, [banners, bgBannerIndex]);

  // Handle location picker changes on local display layout context
  const handleSaveLocation = async (lat: number, lng: number, placeName: string) => {
    try {
      const merged = { ...settings, latitude: lat, longitude: lng };
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } catch (e) {
      console.error("Gagal menyimpan lokasi ke backend DB.", e);
    }
    setShowLocationPicker(false);
  };

  // --- DYNAMIC GRADIENT HELPER ---
  const getDynamicGradientClass = (prayerName: string | null) => {
    if (!prayerName) return 'from-[#051109] via-[#020b06] to-[#010502]';
    switch (prayerName) {
      case 'Imsak':
      case 'Fajr': // Subuh: Deep dawn navy blue-purple
        return 'from-[#0a182c] via-[#051109] to-[#030814]';
      case 'Sunrise':
      case 'Dhuhr': // Dzuhur: Morning golden-green
        return 'from-[#022416] via-[#051109] to-[#0e3321]';
      case 'Asr': // Ashar: Olive warm bronze-green
        return 'from-[#201c0c] via-[#051109] to-[#0a140f]';
      case 'Maghrib': // Maghrib: Sunset orange-rose
        return 'from-[#2c1208] via-[#051109] to-[#0d0914]';
      case 'Isha': // Isya: Starry space blue-black
        return 'from-[#030c1c] via-[#051109] to-[#010408]';
      default:
        return 'from-[#051109] via-[#020b06] to-[#010502]';
    }
  };

  if (!currentTime || !prayerTimes || !timelineObj || !nextPrayer) {
    return (
      <div className="h-screen w-screen bg-[#051109] flex flex-col items-center justify-center text-emerald-500 gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <span className="text-sm font-semibold uppercase tracking-wider font-mono">Memuat Jam Masjid...</span>
      </div>
    );
  }

  // Active Prayer Flow Renders
  if (prayerStage === 'ADZAN') {
    return (
      <FullscreenAdzan 
        prayerName={translatedPrayerName} 
        currentTime={currentTime} 
        secondsLeft={stageSecondsLeft} 
      />
    );
  }

  if (prayerStage === 'IQOMAH') {
    let activeIqomahDuration = 600;
    switch (activePrayerName) {
      case 'Fajr': activeIqomahDuration = settings.iqomahFajr; break;
      case 'Dhuhr': activeIqomahDuration = settings.iqomahDhuhr; break;
      case 'Asr': activeIqomahDuration = settings.iqomahAsr; break;
      case 'Maghrib': activeIqomahDuration = settings.iqomahMaghrib; break;
      case 'Isha': activeIqomahDuration = settings.iqomahIsha; break;
    }

    const isFriday = currentTime && currentTime.getDay() === 5;

    return (
      <FullscreenIqomah 
        prayerName={translatedPrayerName} 
        currentTime={currentTime} 
        secondsLeft={stageSecondsLeft} 
        iqomahDuration={activeIqomahDuration}
        isFriday={!!isFriday}
        mosqueName={settings.mosqueName}
      />
    );
  }

  if (prayerStage === 'PRAYING') {
    return (
      <FullscreenPraying 
        prayerName={translatedPrayerName} 
        currentTime={currentTime} 
        secondsLeft={stageSecondsLeft} 
      />
    );
  }

  // Render Full Banners Rotation if scheduled normal layout is toggled
  const activeBannersList = banners.filter(b => b.active);
  if (viewMode === 'BANNER' && activeBannersList.length > 0 && activeBannersList[bgBannerIndex]) {
    return (
      <FullscreenBanner 
        banners={activeBannersList} 
        activeIndex={bgBannerIndex}
        onIndexChange={setBgBannerIndex} 
      />
    );
  }

  // Otherwise, default layout
  const hasValidBg = settings.backgroundActive && settings.backgroundImage && !bgError;
  const activeGradient = getDynamicGradientClass(nextPrayer?.name || null);

  // Calculate dynamic fasting reminders (Monday/Thursday & Ayyamul Bidh)
  const fastingAnnouncements: AnnouncementType[] = [];
  if (settings.fastingReminderActive) {
    const dayOfWeek = currentTime.getDay();
    if (dayOfWeek === 0) { // Sunday
      fastingAnnouncements.push({
        id: 'fasting-mon-tomorrow',
        text: '🔔 Pengingat: Besok hari Senin, mari bersiap menjalankan ibadah Puasa Sunnah Senin.',
        active: true
      });
    } else if (dayOfWeek === 1) { // Monday
      fastingAnnouncements.push({
        id: 'fasting-mon-today',
        text: '✨ Hari ini: Puasa Sunnah Senin. Selamat menjalankan ibadah puasa, semoga berkah bagi kita semua.',
        active: true
      });
    } else if (dayOfWeek === 3) { // Wednesday
      fastingAnnouncements.push({
        id: 'fasting-thu-tomorrow',
        text: '🔔 Pengingat: Besok hari Kamis, mari bersiap menjalankan ibadah Puasa Sunnah Kamis.',
        active: true
      });
    } else if (dayOfWeek === 4) { // Thursday
      fastingAnnouncements.push({
        id: 'fasting-thu-today',
        text: '✨ Hari ini: Puasa Sunnah Kamis. Selamat menjalankan ibadah puasa, semoga berkah bagi kita semua.',
        active: true
      });
    }

    // Friday Sunnah reminders (Thursday evening/Malam Jum'at & Friday daytime)
    const isMalamJumat = dayOfWeek === 4 && timelineObj?.Maghrib && currentTime >= timelineObj.Maghrib;
    const isHariJumat = dayOfWeek === 5 && timelineObj?.Maghrib && currentTime < timelineObj.Maghrib;

    if (isMalamJumat) {
      fastingAnnouncements.push({
        id: 'friday-sunnah-eve',
        text: '✨ Malam Jum\'at: Disunnahkan memperbanyak sholawat kepada Rasulullah ﷺ dan membaca Surah Al-Kahfi.',
        active: true
      });
    } else if (isHariJumat) {
      fastingAnnouncements.push({
        id: 'friday-sunnah-day',
        text: '🕌 Hari Jum\'at Mubarak: Sunnah mandi Jum\'at, memakai wewangian, datang awal, dan menyimak khutbah dengan tenang.',
        active: true
      });
    }

    try {
      const hijriAdjusted = new Date(currentTime.getTime());
      if (timelineObj && timelineObj.Maghrib && currentTime < timelineObj.Maghrib) {
        hijriAdjusted.setDate(hijriAdjusted.getDate() - 1); // 1-day offset before Maghrib
      }
      const hijriDayFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', { day: 'numeric' });
      const formattedDay = hijriDayFormatter.format(hijriAdjusted);
      const hijriDayNum = parseInt(formattedDay.replace(/\D/g, ''), 10);

      if (hijriDayNum === 12) {
        fastingAnnouncements.push({
          id: 'fasting-bidh-tomorrow',
          text: '📅 Pengingat: Besok memasuki tanggal 13 Hijriah. Disunnahkan berpuasa Ayyamul Bidh (13, 14, 15 Hijriah).',
          active: true
        });
      } else if (hijriDayNum === 13 || hijriDayNum === 14 || hijriDayNum === 15) {
        fastingAnnouncements.push({
          id: `fasting-bidh-today-${hijriDayNum}`,
          text: `✨ Hari ini: Puasa Sunnah Ayyamul Bidh (${hijriDayNum} Hijriah). Selamat menjalankan ibadah puasa.`,
          active: true
        });
      }
    } catch (e) {
      console.error("Fasting reminder Hijri parser error:", e);
    }
  }

  const combinedAnnouncements = [...fastingAnnouncements, ...announcements];

  return (
    <>
      <div className="h-screen w-screen flex flex-col text-white overflow-hidden select-none selection:bg-transparent animate-fade-in relative z-0 bg-black">
        
        {hasValidBg ? (
          <div className="absolute inset-0 -z-10 select-none pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={settings.backgroundImage!} 
              alt="Background" 
              className="w-full h-full object-cover opacity-45 brightness-75"
              onError={() => setBgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
          </div>
        ) : (
          /* Premium dynamic gradient background based on time of day / next prayer */
          <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${activeGradient} select-none pointer-events-none transition-all duration-1000`}>
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]"></div>
          </div>
        )}

        {/* Header Section */}
        <header className="flex-none h-[180px] xl:h-[200px] 2xl:h-[220px] flex items-center justify-between px-16 pt-8 bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex flex-col text-left justify-center mb-1">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight uppercase leading-none">
              {settings.mosqueName}
            </h1>
            {settings.mosqueAddress && (
              <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-emerald-400 font-semibold tracking-wide mt-2 uppercase opacity-85">
                {settings.mosqueAddress}
              </p>
            )}
          </div>
          
          <div className="text-right flex flex-col justify-center">
            <div className="text-4xl lg:text-5xl xl:text-5xl font-bold text-white tracking-tight">
              {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
            </div>
            <div className="text-2xl lg:text-3xl xl:text-3xl text-emerald-400 font-serif italic mt-1.5 tracking-wider">
              {hijriDate}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col justify-between relative z-10">
          {/* Central Display Visualizer */}
          <ClockSection currentTime={currentTime} quotes={quotes} />

          {/* Next Prayer Countdown Widget above PrayerTimesGrid */}
          <div className="flex justify-start px-8 mb-6 lg:mb-8">
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 xl:gap-10 bg-emerald-900/30 border border-emerald-500/20 px-6 md:px-8 lg:px-10 xl:px-12 py-3 md:py-4 lg:py-5 xl:py-5 rounded-3xl backdrop-blur-md shadow-xl transition-all duration-500">
              <div className="flex flex-col border-r border-emerald-500/30 pr-4 md:pr-6 lg:pr-8 xl:pr-10 text-left">
                <span className="text-emerald-400 text-xs md:text-sm lg:text-base xl:text-base font-black uppercase tracking-[0.2em] mb-1">Selanjutnya</span>
                <span className="text-3xl md:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-bold text-white tracking-tight">
                  {nextPrayer.name === 'Dhuhr' && currentTime && currentTime.getDay() === 5 ? "Jum'at" : PRAYER_TRANSLATIONS[nextPrayer.name] || nextPrayer.name}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-emerald-400 text-xs md:text-sm lg:text-base xl:text-base font-black uppercase tracking-[0.2em] mb-1">Hitung Mundur ({timezoneLabel})</span>
                <span className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-[#D4AF37] tabular-nums tracking-tighter">{countdownStr}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Prayer Times Grid Bottom Sheet */}
          <PrayerTimesGrid 
            timelineObj={timelineObj} 
            nextPrayerName={nextPrayer.name} 
            hijriDate={hijriDate}
            currentTime={currentTime}
          />
        </main>

        {/* Running Announcement Banner */}
        <RunningAnnouncements announcements={combinedAnnouncements} />
      </div>

      {/* Floating Fullscreen Control Button */}
      <button
        onClick={toggleFullscreen}
        className={`fixed bottom-24 right-8 z-50 p-4 bg-black/45 hover:bg-black/70 border border-white/10 rounded-full text-white/70 hover:text-white backdrop-blur shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
          !mouseActive ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>

      {showLocationPicker && (
        <LocationPickerModal 
          onClose={() => setShowLocationPicker(false)} 
          onSave={handleSaveLocation} 
          initialLat={settings.latitude}
          initialLng={settings.longitude}
        />
      )}
    </>
  );
}
