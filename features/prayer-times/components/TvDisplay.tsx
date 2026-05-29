'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSettings, AnnouncementType, QuoteType, PRAYER_TRANSLATIONS } from '@/shared/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, Maximize, Minimize } from 'lucide-react';

// Feature-Based Absolute Imports
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
import { useBackgroundSlideshow } from '../hooks/useBackgroundSlideshow';

// Fullscreen Stage Screens
import FullscreenAdzan from './FullscreenAdzan';
import FullscreenIqomah from './FullscreenIqomah';
import FullscreenPraying from './FullscreenPraying';
import FullscreenBanner from '@/features/announcements/components/FullscreenBanner';

// Utilities
import { computeFastingAnnouncements } from '@/shared/utils/fasting-announcements';

interface TvDisplayProps {
  initialSettings: AppSettings;
  initialAnnouncements: AnnouncementType[];
  initialQuotes: QuoteType[];
}

export default function TvDisplay({ initialSettings, initialAnnouncements, initialQuotes }: TvDisplayProps) {
  // State to suspend polling during active prayer stages
  const [isSuspended, setIsSuspended] = useState(false);

  // 1. Data synchronization & polling hook (every 15s, suspended during active prayer stages)
  const {
    settings,
    setSettings,
    announcements,
    banners,
    quotes,
    bgError,
    setBgError,
  } = useTvDisplayData({
    initialSettings,
    initialAnnouncements,
    initialQuotes,
    suspended: isSuspended,
  });

  // 2. Background Slideshow Engine (extracted hook — replaces ~150 lines of state + effects)
  const {
    currentBgUrl,
    prevBgUrl,
    activeBgList,
    getTransitionClasses,
  } = useBackgroundSlideshow(settings, bgError, setBgError);

  // 3. Kiosk system optimization hooks
  useWakeLock();
  const mouseActive = useAutoHideCursor();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // 4. Banner rotation state
  const [viewMode, setViewMode] = useState<'CLOCK' | 'BANNER'>('CLOCK');
  const [bgBannerIndex, setBgBannerIndex] = useState(0);

  // 5. Core prayer calculation hook
  const {
    currentTime,
    prayerTimes,
    timezoneLabel,
    nextPrayer,
    timelineObj,
    countdownStr,
    hijriDate,
    hijriDayNum,
    prayerStage,
    activePrayerName,
    stageSecondsLeft,
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
    adjustIsha: settings.adjustIsha,
  });

  // Reactively suspend polling when transitioning to active prayer stages
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSuspended(prayerStage !== 'NORMAL');
    }, 0);
    return () => clearTimeout(timer);
  }, [prayerStage]);

  // 6. Audio, adzan alarm & Tahrim background audio hooks
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
    ? (activePrayerName === 'Dhuhr' && currentTime && currentTime.getDay() === 5
        ? "Jum'at"
        : PRAYER_TRANSLATIONS[activePrayerName] || activePrayerName)
    : '';

  // Automatically switch to BANNER mode when there are active banners
  useEffect(() => {
    const activeBanners = banners.filter(b => b.active);
    const timer = setTimeout(() => {
      if (activeBanners.length > 0) {
        setViewMode('BANNER');
      } else {
        setViewMode('CLOCK');
        setBgBannerIndex(0);
      }
    }, 0);
    return () => clearTimeout(timer);
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
      // Loop back to first poster
      setBgBannerIndex(0);
    }
  }, [banners, bgBannerIndex]);

  // --- Dynamic gradient based on next prayer ---
  const getDynamicGradientClass = (prayerName: string | null) => {
    if (!prayerName) return 'from-[#0c2419] via-[#06120c] to-[#020604]';
    switch (prayerName) {
      case 'Imsak':
      case 'Fajr':
        return 'from-[#0d2347] via-[#071328] to-[#030815]';
      case 'Sunrise':
      case 'Dhuhr':
        return 'from-[#073623] via-[#031d12] to-[#010b07]';
      case 'Asr':
        return 'from-[#2a230e] via-[#161307] to-[#090703]';
      case 'Maghrib':
        return 'from-[#3c170d] via-[#1a0b06] to-[#0a0402]';
      case 'Isha':
        return 'from-[#071d3d] via-[#030d1c] to-[#01040a]';
      default:
        return 'from-[#0c2419] via-[#06120c] to-[#020604]';
    }
  };

  // Fasting reminders — computed from extracted pure utility
  const currentDateStr = currentTime?.toDateString();
  const fastingAnnouncements = useMemo(
    () => {
      if (!currentTime || !timelineObj) return [];
      return computeFastingAnnouncements(currentTime, timelineObj, !!settings.fastingReminderActive, hijriDayNum);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDateStr, timelineObj, settings.fastingReminderActive, hijriDayNum],
  );

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
      case 'Fajr':    activeIqomahDuration = settings.iqomahFajr; break;
      case 'Dhuhr':   activeIqomahDuration = settings.iqomahDhuhr; break;
      case 'Asr':     activeIqomahDuration = settings.iqomahAsr; break;
      case 'Maghrib': activeIqomahDuration = settings.iqomahMaghrib; break;
      case 'Isha':    activeIqomahDuration = settings.iqomahIsha; break;
    }

    return (
      <FullscreenIqomah
        prayerName={translatedPrayerName}
        currentTime={currentTime}
        secondsLeft={stageSecondsLeft}
        iqomahDuration={activeIqomahDuration}
        isFriday={currentTime.getDay() === 5}
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

  // Banner Rotation
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

  // Default layout
  const hasValidBg = settings.backgroundActive &&
    (settings.backgroundSlideshowActive && activeBgList.length > 0
      ? !!currentBgUrl
      : !!settings.backgroundImage) &&
    !bgError;

  const activeGradient = getDynamicGradientClass(nextPrayer?.name || null);

  const combinedAnnouncements = [...fastingAnnouncements, ...announcements];

  return (
    <>
      <div className="h-screen w-screen flex flex-col text-[#F7F5F0] overflow-hidden select-none selection:bg-transparent animate-fade-in relative z-0 bg-[#0C1814]">

        {hasValidBg ? (
          <div className="absolute inset-0 -z-10 select-none pointer-events-none overflow-hidden">
            {settings.backgroundSlideshowActive && activeBgList.length > 1 ? (
              <>
                {/* Outgoing Background Image */}
                {prevBgUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={prevBgUrl}
                    alt="Outgoing Background"
                    className={`absolute inset-0 w-full h-full object-cover ${getTransitionClasses(false)}`}
                  />
                )}

                {/* Incoming Background Image */}
                {currentBgUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentBgUrl}
                    alt="Incoming Background"
                    className={`absolute inset-0 w-full h-full object-cover ${getTransitionClasses(true)}`}
                    onError={() => setBgError(true)}
                  />
                )}
              </>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentBgUrl || settings.backgroundImage!}
                alt="Background"
                className="w-full h-full object-cover opacity-75 brightness-95 transition-all duration-[1000ms]"
                onError={() => setBgError(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 z-10"></div>
          </div>
        ) : (
          /* Premium dynamic gradient background */
          <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${activeGradient} select-none pointer-events-none transition-all duration-1000`}>
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]"></div>
          </div>
        )}

        {/* Header Section */}
        <header className="flex-none h-[11vh] flex items-center justify-between px-[4vw] pt-[1.5vh] bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex flex-col text-left justify-center mb-1">
            <h1 className="text-[clamp(1.5rem,3.5vh,2.5rem)] font-extrabold tracking-tight uppercase leading-none text-[#F7F5F0]">
              {settings.mosqueName}
            </h1>
            {settings.mosqueAddress && (
              <p className="text-[clamp(0.75rem,1.6vh,1.1rem)] text-[#D4AF37]/95 font-extrabold tracking-wide mt-[clamp(0.2rem,0.4vh,0.4rem)] uppercase">
                {settings.mosqueAddress}
              </p>
            )}
          </div>

          <div className="text-right flex flex-col justify-center border-r-4 border-[#D4AF37]/40 pr-[1.5vw]">
            <div className="text-[clamp(1.1rem,2.5vh,1.7rem)] font-bold text-[#F7F5F0] tracking-tight leading-none">
              {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
            </div>
            <div className="text-[clamp(0.85rem,1.8vh,1.3rem)] text-[#D4AF37] font-serif font-black italic mt-[clamp(0.2rem,0.4vh,0.4rem)] tracking-widest leading-none">
              {hijriDate}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col justify-between relative z-10 overflow-hidden gap-[clamp(1rem,2vh,2rem)]">
          {/* Central Clock Display */}
          <ClockSection currentTime={currentTime} quotes={quotes} />

          {/* Next Prayer Countdown Widget */}
          <div className="flex justify-start px-[2vw] mb-[clamp(0.4rem,1vh,0.8rem)]">
            <div className="flex items-center gap-[clamp(1rem,1.5vw,2rem)] bg-[#11221D]/80 border border-emerald-500/20 px-[clamp(1.5rem,2vw,2.5rem)] py-[clamp(0.8rem,1.6vh,1.2rem)] rounded-2xl backdrop-blur-md shadow-xl transition-all duration-500">
              <div className="flex flex-col border-r border-emerald-500/20 pr-[clamp(1rem,1.5vw,2rem)] text-left">
                <span className="text-emerald-300/70 text-[clamp(0.6rem,1.1vh,0.8rem)] font-extrabold uppercase tracking-[0.2em] mb-[0.2vh]">Selanjutnya</span>
                <span className="text-[clamp(1.1rem,2.4vh,1.8rem)] font-bold text-emerald-50 tracking-tight leading-none">
                  {nextPrayer.name === 'Dhuhr' && currentTime.getDay() === 5
                    ? "Jum'at"
                    : PRAYER_TRANSLATIONS[nextPrayer.name] || nextPrayer.name}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-emerald-300/70 text-[clamp(0.6rem,1.1vh,0.8rem)] font-extrabold uppercase tracking-[0.2em] mb-[0.2vh]">Hitung Mundur ({timezoneLabel})</span>
                <span className="text-[clamp(1.4rem,3.2vh,2.5rem)] font-black text-[#D4AF37] tabular-nums tracking-tighter leading-none drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">{countdownStr}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Prayer Times Grid */}
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

      {/* Floating Fullscreen Control */}
      <button
        onClick={toggleFullscreen}
        className={`fixed bottom-24 right-8 z-50 p-4 bg-black/45 hover:bg-black/70 border border-white/10 rounded-full text-white/70 hover:text-white backdrop-blur shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
          !mouseActive ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        title="Toggle Fullscreen"
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>
    </>
  );
}
