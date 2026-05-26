'use client';

import { useEffect, useState, useCallback } from 'react';
import { AppSettings, AnnouncementType, BannerType } from '@/shared/types';
import { format, parse } from 'date-fns';
import { Settings as SettingsIcon, Loader2, Moon } from 'lucide-react';

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

  // Signage Layout States which toggles between normal Clocks and dynamic Poster Banners
  const [viewMode, setViewMode] = useState<'CLOCK' | 'BANNER'>('CLOCK');
  const [bgBannerIndex, setBgBannerIndex] = useState(0);

  // Poll for background settings, announcements, and poster banners (high reactivity: 10s sync)
  useEffect(() => {
    const fetchLatestData = async () => {
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
    };

    fetchLatestData(); // immediate load triggers
    const poller = setInterval(fetchLatestData, 10 * 1000); // Poll every 10 seconds for real-time responsiveness
    return () => clearInterval(poller);
  }, []);

  // Delegate core clock ticking, next prayer calculation, timing difference, Hijri computation and active Stage (Adzan/Iqomah/Praying) state machine to domain hook
  const {
    currentTime,
    prayerTimes,
    timezone,
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
    iqomahDuration: settings.iqomahDuration,
    prayerDuration: settings.prayerDuration,
    sandboxActive: settings.sandboxActive,
    sandboxTime: settings.sandboxTime,
    sandboxStage: settings.sandboxStage,
    sandboxSpeed: settings.sandboxSpeed
  });

  // Schedule alternation between CLOCK layout and BANNERS layout when in normal mode
  useEffect(() => {
    if (prayerStage !== 'NORMAL' || viewMode !== 'CLOCK') return;

    const activeBanners = banners.filter(b => b.active);
    if (activeBanners.length === 0) return;

    // Show clock for 45 seconds, then trigger banner rotation
    const clockTimer = setTimeout(() => {
      setBgBannerIndex(0);
      setViewMode('BANNER');
    }, 45 * 1000);

    return () => clearTimeout(clockTimer);
  }, [prayerStage, viewMode, banners]);

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
        <span className="text-sm font-semibold uppercase tracking-wider font-mono">Menuat Jam Masjid...</span>
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
        prayerName={activePrayerName!} 
        currentTime={currentTime} 
        secondsLeft={stageSecondsLeft} 
      />
    );
  }

  if (prayerStage === 'IQOMAH') {
    return (
      <FullscreenIqomah 
        prayerName={activePrayerName!} 
        currentTime={currentTime} 
        secondsLeft={stageSecondsLeft} 
      />
    );
  }

  if (prayerStage === 'PRAYING') {
    return (
      <FullscreenPraying 
        prayerName={activePrayerName!} 
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
  return (
    <>
      <div className={`h-screen w-screen flex flex-col text-white overflow-hidden select-none selection:bg-transparent animate-fade-in relative z-0 ${settings.backgroundActive && settings.backgroundImage ? 'bg-black' : 'bg-[#051109]'}`}>
        
        {settings.backgroundActive && settings.backgroundImage && (
          <div className="absolute inset-0 -z-10 select-none pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={settings.backgroundImage} 
              alt="Background" 
              className="w-full h-full object-cover opacity-45 brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#051109]/80 via-transparent to-[#051109]/90"></div>
          </div>
        )}

        {/* Header Section */}
        <header className="flex-none h-[140px] flex items-center justify-between px-16 border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent">
          <div className="flex items-center gap-4 mb-1 relative group cursor-pointer" onClick={() => setShowLocationPicker(true)}>
            <div className="w-10 h-10 bg-[#D4AF37] rounded-lg flex items-center justify-center relative">
              <div className="w-6 h-6 border-2 border-[#051109]"></div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                 <SettingsIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight uppercase group-hover:text-emerald-400 transition-colors">
              {settings.mosqueName}
            </h1>
          </div>
          
          <div className="text-right flex flex-col justify-center">
            <div className="text-3xl font-bold text-white tracking-tight">
              {format(currentTime, 'EEEE, dd MMMM yyyy')}
            </div>
            <div className="text-xl text-emerald-400 font-serif italic mt-1 tracking-wider">
              {hijriDate}
            </div>
          </div>
        </header>

        {/* Central Display Visualizer */}
        <ClockSection 
          currentTime={currentTime} 
          nextPrayerName={nextPrayer.name} 
          countdownStr={countdownStr} 
          timezone={timezone} 
        />

        {/* Dynamic Prayer Times Grid Bottom Sheet */}
        <PrayerTimesGrid 
          timelineObj={timelineObj} 
          nextPrayerName={nextPrayer.name} 
        />

        {/* Running Announcement Banner */}
        <RunningAnnouncements announcements={announcements} />
      </div>

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
