'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppSettings, AnnouncementType, BannerType, PRAYER_TRANSLATIONS } from '@/shared/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Loader2, Moon, Maximize, Minimize } from 'lucide-react';

// Feature-Based Absolute Imports
import LocationPickerModal from '@/features/location/components/LocationPickerModal';
import RunningAnnouncements from '@/features/announcements/components/RunningAnnouncements';
import ClockSection from './ClockSection';
import PrayerTimesGrid from './PrayerTimesGrid';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

// Fullscreen Stage Screens
import FullscreenAdzan from './FullscreenAdzan';
import FullscreenIqomah from './FullscreenIqomah';
import FullscreenPraying from './FullscreenPraying';
import FullscreenBanner from '@/features/announcements/components/FullscreenBanner';

interface TvDisplayProps {
  initialSettings: AppSettings;
  initialAnnouncements: AnnouncementType[];
}

export default function TvDisplay({ initialSettings, initialAnnouncements }: TvDisplayProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>(initialAnnouncements);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [prevBgImage, setPrevBgImage] = useState(settings.backgroundImage);

  // Reset background error status in render phase if the image URL changes to avoid cascading renders
  if (settings.backgroundImage !== prevBgImage) {
    setPrevBgImage(settings.backgroundImage);
    setBgError(false);
  }

  // Signage Layout States which toggles between normal Clocks and dynamic Poster Banners
  const [viewMode, setViewMode] = useState<'CLOCK' | 'BANNER'>('CLOCK');
  const [bgBannerIndex, setBgBannerIndex] = useState(0);

  // --- KIOSK TV OPTIMIZATIONS ---
  const [mouseActive, setMouseActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // 1. Screen Wake Lock API
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock acquired successfully');
      }
    } catch (err) {
      console.warn('Failed to acquire Screen Wake Lock:', err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen Wake Lock released');
      }
    } catch (err) {
      console.error('Failed to release Screen Wake Lock:', err);
    }
  };

  useEffect(() => {
    requestWakeLock();
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);

  // 2. Global Auto-Hide Cursor
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = () => {
      setMouseActive(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMouseActive(false);
      }, 3000); // 3 seconds timeout
    };

    window.addEventListener('mousemove', handleMouseMove);
    // Initial trigger
    timeoutId = setTimeout(() => {
      setMouseActive(false);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!mouseActive) {
      document.body.classList.add('cursor-none');
    } else {
      document.body.classList.remove('cursor-none');
    }
    return () => {
      document.body.classList.remove('cursor-none');
    };
  }, [mouseActive]);

  // 3. Fullscreen Tracking
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // --- DATA POLLING & SYNCHRONIZATION ---
  // Memoized fetch operation to allow reuse in both standard polling and instant PWA reconnection events
  const fetchLatestData = useCallback(async () => {
    try {
      const [settingsRes, announcementsRes, bannersRes] = await Promise.all([
        fetch('/api/settings').catch(() => null),
        fetch('/api/announcements').catch(() => null),
        fetch('/api/banners').catch(() => null)
      ]);

      if (settingsRes?.ok) {
        const remoteSettings = await settingsRes.json();
        setSettings(remoteSettings);
      }
      if (announcementsRes?.ok) {
        const remoteAnnouncements = await announcementsRes.json();
        setAnnouncements(remoteAnnouncements);
      }
      if (bannersRes?.ok) {
        const remoteBanners = await bannersRes.json();
        setBanners(remoteBanners);
      }
    } catch (e) {
      console.error("Failed background polling", e);
    }
  }, []);

  // Poll for background settings, announcements, and poster banners (high reactivity: 2s sync)
  useEffect(() => {
    fetchLatestData(); // immediate load triggers
    const poller = setInterval(fetchLatestData, 2 * 1000); // Poll every 2 seconds for real-time responsiveness
    return () => clearInterval(poller);
  }, [fetchLatestData]);

  // Event listener for PWA online status reconnection to trigger instant sync
  useEffect(() => {
    const handleReconnectionSync = () => {
      console.log("[PWA] Online reconnection detected! Triggering instant data sync...");
      fetchLatestData();
    };

    window.addEventListener('app-sync-data', handleReconnectionSync);
    return () => window.removeEventListener('app-sync-data', handleReconnectionSync);
  }, [fetchLatestData]);

  // Instantly transition to BANNER mode when new active banners are added/activated
  const activeBannersCount = banners.filter(b => b.active).length;
  const [prevActiveCount, setPrevActiveCount] = useState(0);

  useEffect(() => {
    if (activeBannersCount > prevActiveCount) {
      setViewMode('BANNER');
      setBgBannerIndex(activeBannersCount - 1); // Show the latest activated/added banner
    }
    setPrevActiveCount(activeBannersCount);
  }, [activeBannersCount, prevActiveCount]);

  // Delegate core clock ticking, next prayer calculation, timing difference, Hijri computation and active Stage (Adzan/Iqomah/Praying) state machine to domain hook
  const {
    currentTime,
    prayerTimes,
    timezone,
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
    sandboxActive: settings.sandboxActive,
    sandboxTime: settings.sandboxTime,
    sandboxStage: settings.sandboxStage,
    sandboxSpeed: settings.sandboxSpeed
  });

  const translatedPrayerName = activePrayerName ? (PRAYER_TRANSLATIONS[activePrayerName] || activePrayerName) : '';

  // --- AUDIO & ALARM AUTOMATION ---
  const adzanAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastBeepedSecondRef = useRef<number | null>(null);

  // 1. Adzan Player Trigger
  useEffect(() => {
    if (prayerStage === 'ADZAN' && settings.adzanAudioActive && settings.adzanAudioUrl) {
      try {
        if (!adzanAudioRef.current) {
          adzanAudioRef.current = new Audio(settings.adzanAudioUrl);
        } else if (adzanAudioRef.current.src !== settings.adzanAudioUrl) {
          adzanAudioRef.current.pause();
          adzanAudioRef.current = new Audio(settings.adzanAudioUrl);
        }
        
        adzanAudioRef.current.volume = settings.adzanAudioVolume;
        adzanAudioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked or adzan audio failed to load:", err);
        });
      } catch (err) {
        console.error("Adzan audio player error:", err);
      }
    } else {
      // Clean stop & mute when leaving ADZAN stage (includes PRAYING fail-safe)
      if (adzanAudioRef.current) {
        adzanAudioRef.current.pause();
        adzanAudioRef.current.currentTime = 0;
      }
    }
  }, [prayerStage, settings.adzanAudioActive, settings.adzanAudioUrl, settings.adzanAudioVolume]);

  // 2. Web Audio API Offline Beep Synthesizer
  useEffect(() => {
    if (prayerStage !== 'IQOMAH' || stageSecondsLeft === undefined || stageSecondsLeft > 10 || stageSecondsLeft < 0) {
      lastBeepedSecondRef.current = null;
      return;
    }

    // Protect: ensure beep rings only once per second
    if (lastBeepedSecondRef.current === stageSecondsLeft) {
      return;
    }
    lastBeepedSecondRef.current = stageSecondsLeft;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';

      if (stageSecondsLeft > 0) {
        // High pitched short warning beep (880Hz, 120ms)
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.12);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } else if (stageSecondsLeft === 0) {
        // Deep long alarm double-pitch for prayer start (1000Hz, 500ms)
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Failed to play synthetic warning beep:", e);
    }
  }, [prayerStage, stageSecondsLeft]);

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

  const activeGradient = getDynamicGradientClass(nextPrayer?.name || null);


  // Schedule alternation between CLOCK layout and BANNERS layout when in normal mode
  useEffect(() => {
    console.log("TvDisplay clock-to-banner timer effect triggered!", { 
      prayerStage, 
      viewMode, 
      activeBannersCount: banners.filter(b => b.active).length 
    });

    if (prayerStage !== 'NORMAL' || viewMode !== 'CLOCK') return;

    const activeBanners = banners.filter(b => b.active);
    if (activeBanners.length === 0) return;

    // Show clock for 15 seconds, then trigger banner rotation (shorter duration for high-reactivity digital signage)
    const clockTimer = setTimeout(() => {
      console.log("TvDisplay clockTimer FIRED! Toggling to BANNER mode.");
      setBgBannerIndex(0);
      setViewMode('BANNER');
    }, 15 * 1000);

    return () => {
      console.log("TvDisplay clock-to-banner timer effect CLEANED UP!");
      clearTimeout(clockTimer);
    };
  }, [prayerStage, viewMode, banners.filter(b => b.active).length]);

  const handleBannerComplete = useCallback(() => {
    const activeBanners = banners.filter(b => b.active);
    if (bgBannerIndex + 1 < activeBanners.length) {
      setBgBannerIndex(prev => prev + 1);
    } else {
      // Returned back to standard Clock
      setViewMode('CLOCK');
    }
  }, [banners, bgBannerIndex]);

  // Handle location picker changes on local display layout context
  const handleSaveLocation = async (lat: number, lng: number, placeName: string) => {
    try {
      const merged = { ...settings, latitude: lat, longitude: lng, mosqueName: placeName };
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

  if (!currentTime || !prayerTimes || !timelineObj || !nextPrayer) {
    return (
      <div className="h-screen w-screen bg-[#051109] flex flex-col items-center justify-center text-emerald-500 gap-3">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <span className="text-sm font-semibold uppercase tracking-wider font-mono">Memuat Jam Masjid...</span>
      </div>
    );
  }

  // Evaluate Active/Inactive operating hour schedule
  // e.g. Start at 03:00, End at 23:00.
  const isDisplayScheduledSleep = () => {
    if (!settings.displayActive) return true;

    try {
      const currentFormatted = format(currentTime, 'HH:mm');
      const [currH, currM] = currentFormatted.split(':').map(Number);
      const [startH, startM] = settings.displayStart.split(':').map(Number);
      const [endH, endM] = settings.displayEnd.split(':').map(Number);

      const currMin = currH * 60 + currM;
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      if (startMin <= endMin) {
        return currMin < startMin || currMin > endMin;
      } else {
        // Over midnight wrap
        return currMin < startMin && currMin > endMin;
      }
    } catch (e) {
      return false; // Fail safe show layout
    }
  };

  // Determine sleep state. Worship trigger override schedules to ensure display handles early Subuh alerts, etc!
  const isSleep = isDisplayScheduledSleep();
  const shouldEnterStandby = isSleep && prayerStage === 'NORMAL';

  // Standby screen renders
  if (shouldEnterStandby) {
    return (
      <div className="h-screen w-screen bg-[#020604] text-zinc-650 flex flex-col items-center justify-center select-none animate-fade-in relative">
        <div className="flex flex-col items-center text-center gap-4">
          <Moon className="w-16 h-16 text-zinc-800 animate-pulse mb-2" />
          <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-700">{settings.mosqueName}</h2>
          <p className="text-sm text-zinc-800 max-w-sm">Tampilan Berada Dalam Jadwal Istirahat / Mode Hemat Energi.</p>
        </div>
        <div className="absolute bottom-8 right-12 text-zinc-800 font-mono text-xl tracking-wider font-bold">
          {format(currentTime, 'HH:mm:ss')}
        </div>
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

    return (
      <FullscreenIqomah 
        prayerName={translatedPrayerName} 
        currentTime={currentTime} 
        secondsLeft={stageSecondsLeft} 
        iqomahDuration={activeIqomahDuration}
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
        banner={activeBannersList[bgBannerIndex]} 
        onComplete={handleBannerComplete} 
      />
    );
  }

  // Otherwise, default layout
  const hasValidBg = settings.backgroundActive && settings.backgroundImage && !bgError;

  return (
    <>
      <div className={`h-screen w-screen flex flex-col text-white overflow-hidden select-none selection:bg-transparent animate-fade-in relative z-0 bg-black`}>
        
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
        <header className="flex-none h-[160px] flex items-center justify-between px-16 pt-8 bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex flex-col text-left justify-center mb-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase">
              {settings.mosqueName}
            </h1>
            {settings.mosqueAddress && (
              <p className="text-sm md:text-base text-emerald-400 font-semibold tracking-wide mt-1 uppercase opacity-85">
                {settings.mosqueAddress}
              </p>
            )}
          </div>
          
          <div className="text-right flex flex-col justify-center">
            <div className="text-3xl font-bold text-white tracking-tight">
              {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
            </div>
            <div className="text-xl text-emerald-400 font-serif italic mt-1 tracking-wider">
              {hijriDate}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col justify-between relative z-10">
          {/* Central Display Visualizer */}
          <ClockSection currentTime={currentTime} />

          {/* Next Prayer Countdown Widget above PrayerTimesGrid */}
          <div className="flex justify-start px-8 mb-2">
            <div className="flex items-center gap-6 bg-emerald-900/30 border border-emerald-500/20 px-8 py-4 rounded-3xl backdrop-blur-md shadow-xl transition-all duration-500">
              <div className="flex flex-col border-r border-emerald-500/30 pr-6 text-left">
                <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Selanjutnya</span>
                <span className="text-3xl font-bold text-white tracking-tight">
                  {PRAYER_TRANSLATIONS[nextPrayer.name] || nextPrayer.name}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Hitung Mundur ({timezoneLabel})</span>
                <span className="text-4xl font-black text-[#D4AF37] tabular-nums tracking-tighter">{countdownStr}</span>
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
        <RunningAnnouncements announcements={announcements} />
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
