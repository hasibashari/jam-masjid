'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { differenceInMilliseconds, parse, addSeconds, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PrayerTimesState, PrayerItem } from '../types';

interface UsePrayerTimesProps {
  latitude: number;
  longitude: number;
  calculationMethod: number;
  adzanDuration: number; // in seconds
  iqomahFajr: number;
  iqomahDhuhr: number;
  iqomahAsr: number;
  iqomahMaghrib: number;
  iqomahIsha: number;
  prayerDuration: number; // in seconds
  adjustImsak: number;
  adjustFajr: number;
  adjustSunrise: number;
  adjustDhuhr: number;
  adjustAsr: number;
  adjustMaghrib: number;
  adjustIsha: number;
}

export type PrayerStage = 'NORMAL' | 'ADZAN' | 'IQOMAH' | 'PRAYING';

export function usePrayerTimes({
  latitude,
  longitude,
  calculationMethod,
  adzanDuration,
  iqomahFajr,
  iqomahDhuhr,
  iqomahAsr,
  iqomahMaghrib,
  iqomahIsha,
  prayerDuration,
  adjustImsak,
  adjustFajr,
  adjustSunrise,
  adjustDhuhr,
  adjustAsr,
  adjustMaghrib,
  adjustIsha
}: UsePrayerTimesProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesState | null>(null);
  const [timezone, setTimezone] = useState<string>('Asia/Jakarta');

  // Fetch prayer times for selected location
  useEffect(() => {
    const fetchPrayerTimesData = async () => {
      try {
        const res = await fetch(`/api/prayer-times?lat=${latitude}&lng=${longitude}&method=${calculationMethod}`);
        if (res.ok) {
          const data = await res.json();
          setPrayerTimes(data.timings);
          setTimezone(data.meta.timezone);
        }
      } catch (e) {
        console.error("Failed to fetch prayer times", e);
      }
    };
    fetchPrayerTimesData();
    
    // Refresh prayer times precisely after midnight (periodically check every hour)
    const refreshTimer = setInterval(fetchPrayerTimesData, 60 * 60 * 1000);
    return () => clearInterval(refreshTimer);
  }, [latitude, longitude, calculationMethod]);

  const [sandboxSettings, setSandboxSettings] = useState<{
    active: boolean;
    stage: 'AUTO' | 'NORMAL' | 'ADZAN' | 'IQOMAH' | 'PRAYING';
    speed: number;
    time: string | null;
  }>({
    active: false,
    stage: 'AUTO',
    speed: 1.0,
    time: null
  });

  // Sync sandbox settings with localStorage
  useEffect(() => {
    const loadSandbox = () => {
      try {
        const active = localStorage.getItem('jam_masjid_sandbox_active') === 'true';
        const stage = (localStorage.getItem('jam_masjid_sandbox_stage') as any) || 'AUTO';
        const speed = parseFloat(localStorage.getItem('jam_masjid_sandbox_speed') || '1.0');
        const time = localStorage.getItem('jam_masjid_sandbox_time');
        
        setSandboxSettings({ active, stage, speed, time });
      } catch (e) {
        console.error("Failed to load local sandbox settings", e);
      }
    };
    
    loadSandbox();
    
    // Sync across tabs/admin panel
    window.addEventListener('storage', loadSandbox);
    window.addEventListener('jam-masjid-sandbox-update', loadSandbox);
    
    return () => {
      window.removeEventListener('storage', loadSandbox);
      window.removeEventListener('jam-masjid-sandbox-update', loadSandbox);
    };
  }, []);

  // Local refs for virtual clock tracking in sandbox mode
  const virtualTimeBaseRef = useRef<Date | null>(null);
  const realTimeBaseRef = useRef<number | null>(null);

  useEffect(() => {
    if (sandboxSettings.active && sandboxSettings.time) {
      const parsed = new Date(sandboxSettings.time);
      if (!isNaN(parsed.getTime())) {
        virtualTimeBaseRef.current = parsed;
        realTimeBaseRef.current = Date.now();
      }
    } else {
      virtualTimeBaseRef.current = null;
      realTimeBaseRef.current = null;
    }
  }, [sandboxSettings.active, sandboxSettings.time]);

  // Update clock every second, taking into account timezone and sandbox settings
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let activeTime = now;

      if (sandboxSettings.active) {
        if (virtualTimeBaseRef.current && realTimeBaseRef.current) {
          const elapsedReal = Date.now() - realTimeBaseRef.current;
          const elapsedVirtual = elapsedReal * sandboxSettings.speed;
          activeTime = new Date(virtualTimeBaseRef.current.getTime() + elapsedVirtual);
        } else if (sandboxSettings.time) {
          const parsed = new Date(sandboxSettings.time);
          if (!isNaN(parsed.getTime())) {
            activeTime = parsed;
          }
        }
      }

      if (timezone) {
        setCurrentTime(toZonedTime(activeTime, timezone));
      } else {
        setCurrentTime(activeTime);
      }
    };
    updateTime();
    const clock = setInterval(updateTime, 1000);
    return () => clearInterval(clock);
  }, [timezone, sandboxSettings.active, sandboxSettings.time, sandboxSettings.speed]);

  // ---------------------------------------------------------------------------
  // Memoized timeline derivations
  // These are declared BEFORE the early return to comply with Rules of Hooks.
  // They safely return null/[] when inputs are not yet loaded.
  // ---------------------------------------------------------------------------
  const currentDateStr = currentTime?.toDateString();
  const timelineObj = useMemo(() => {
    if (!currentTime || !prayerTimes) return null;
    const parse_ = (timeStr: string) => parse(timeStr.split(" ")[0], "HH:mm", currentTime);
    return {
      Imsak: addMinutes(parse_(prayerTimes.Imsak || "04:10"), adjustImsak || 0),
      Fajr: addMinutes(parse_(prayerTimes.Fajr), adjustFajr || 0),
      Sunrise: addMinutes(parse_(prayerTimes.Sunrise), adjustSunrise || 0),
      Dhuhr: addMinutes(parse_(prayerTimes.Dhuhr), adjustDhuhr || 0),
      Asr: addMinutes(parse_(prayerTimes.Asr), adjustAsr || 0),
      Maghrib: addMinutes(parse_(prayerTimes.Maghrib), adjustMaghrib || 0),
      Isha: addMinutes(parse_(prayerTimes.Isha), adjustIsha || 0),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    prayerTimes,
    adjustImsak, adjustFajr, adjustSunrise, adjustDhuhr,
    adjustAsr, adjustMaghrib, adjustIsha,
    currentDateStr,
  ]);

  const timelineValid = useMemo(() => {
    if (!timelineObj) return [];
    return [
      { name: 'Fajr', time: timelineObj.Fajr },
      { name: 'Dhuhr', time: timelineObj.Dhuhr },
      { name: 'Asr', time: timelineObj.Asr },
      { name: 'Maghrib', time: timelineObj.Maghrib },
      { name: 'Isha', time: timelineObj.Isha },
    ];
  }, [timelineObj]);

  // If we haven't mounted or loaded the times yet, return default loaders values
  if (!currentTime || !prayerTimes) {
    return {
      currentTime: null,
      prayerTimes: null,
      timezone,
      timezoneLabel: timezone,
      nextPrayer: null,
      timelineObj: null,
      countdownStr: "00:00:00",
      hijriDate: "...",
      prayerStage: 'NORMAL' as PrayerStage,
      activePrayerName: null as string | null,
      stageSecondsLeft: 0
    };
  }

  // Below this line: currentTime, prayerTimes, and timelineObj are all guaranteed non-null.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tl = timelineObj!;

  // Let's determine if we are currently in an active special stage:
  // ADZAN, IQOMAH, or PRAYING.
  // We only run this for worship prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), NOT Sunrise.
  let prayerStage: PrayerStage = 'NORMAL';
  let activePrayerName: string | null = null;
  let stageSecondsLeft = 0;

  if (sandboxSettings.active && sandboxSettings.stage && sandboxSettings.stage !== 'AUTO') {
    prayerStage = sandboxSettings.stage;
    activePrayerName = 'Dhuhr'; // mock prayer name for sandbox visual testing
    stageSecondsLeft = 300; // mock time left (5 mins)
  } else {

  for (const item of timelineValid) {
    const prayerTime = item.time;
    
    // Determine active iqomah duration dynamically per sholat fardhu
    let activeIqomahDuration = 600;
    switch (item.name) {
      case 'Fajr': activeIqomahDuration = iqomahFajr; break;
      case 'Dhuhr': activeIqomahDuration = iqomahDhuhr; break;
      case 'Asr': activeIqomahDuration = iqomahAsr; break;
      case 'Maghrib': activeIqomahDuration = iqomahMaghrib; break;
      case 'Isha': activeIqomahDuration = iqomahIsha; break;
    }

    // End times calculations relative to start
    const adzanEndTime = addSeconds(prayerTime, adzanDuration);
    const iqomahEndTime = addSeconds(adzanEndTime, activeIqomahDuration);
    const prayerEndTime = addSeconds(iqomahEndTime, prayerDuration);

    if (currentTime >= prayerTime && currentTime < adzanEndTime) {
      prayerStage = 'ADZAN';
      activePrayerName = item.name;
      stageSecondsLeft = Math.max(0, Math.floor(differenceInMilliseconds(adzanEndTime, currentTime) / 1000));
      break;
    } else if (currentTime >= adzanEndTime && currentTime < iqomahEndTime) {
      prayerStage = 'IQOMAH';
      activePrayerName = item.name;
      stageSecondsLeft = Math.max(0, Math.floor(differenceInMilliseconds(iqomahEndTime, currentTime) / 1000));
      break;
    } else if (currentTime >= iqomahEndTime && currentTime < prayerEndTime) {
      prayerStage = 'PRAYING';
      activePrayerName = item.name;
      stageSecondsLeft = Math.max(0, Math.floor(differenceInMilliseconds(prayerEndTime, currentTime) / 1000));
      break;
    }
  }
  }

  // Countdown to next prayer (includes Imsak, Sunrise)
  const normalCountdownTimeline = [
    { name: 'Imsak', time: tl.Imsak },
    { name: 'Fajr', time: tl.Fajr },
    { name: 'Sunrise', time: tl.Sunrise },
    { name: 'Dhuhr', time: tl.Dhuhr },
    { name: 'Asr', time: tl.Asr },
    { name: 'Maghrib', time: tl.Maghrib },
    { name: 'Isha', time: tl.Isha },
  ];

  let nextPrayer = normalCountdownTimeline.find(p => p.time > currentTime);

  if (!nextPrayer) {
    const tomorrowImsak = new Date(tl.Imsak);
    tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);
    nextPrayer = { name: 'Imsak', time: tomorrowImsak };
  }

  const msToNext = differenceInMilliseconds(nextPrayer.time, currentTime);
  const hoursToNext = Math.max(0, Math.floor(msToNext / (1000 * 60 * 60)));
  const minsToNext = Math.max(0, Math.floor((msToNext % (1000 * 60 * 60)) / (1000 * 60)));
  const secsToNext = Math.max(0, Math.floor((msToNext % (1000 * 60)) / 1000));
  const countdownStr = `${String(hoursToNext).padStart(2, '0')}:${String(minsToNext).padStart(2, '0')}:${String(secsToNext).padStart(2, '0')}`;

  // Hijri date with Kemenag RI correction: before Maghrib, subtract 1 day
  const hijriAdjustedTime = new Date(currentTime.getTime());
  if (tl.Maghrib && currentTime < tl.Maghrib) {
    hijriAdjustedTime.setDate(hijriAdjustedTime.getDate() - 1);
  }

  const hijriFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const hijriDate = hijriFormatter.format(hijriAdjustedTime);

  const getIndonesianTimezoneLabel = (timezoneStr: string): string => {
    const tz = timezoneStr.toLowerCase();
    if (tz.includes('jakarta') || tz.includes('pontianak') || tz.includes('bangkok')) {
      return 'WIB';
    } else if (tz.includes('makassar') || tz.includes('singapore') || tz.includes('kuala_lumpur') || tz.includes('bali')) {
      return 'WITA';
    } else if (tz.includes('jayapura')) {
      return 'WIT';
    }
    return timezoneStr;
  };

  return {
    currentTime,
    prayerTimes,
    timezone,
    timezoneLabel: getIndonesianTimezoneLabel(timezone),
    nextPrayer,
    timelineObj: tl,
    countdownStr,
    hijriDate,
    prayerStage,
    activePrayerName,
    stageSecondsLeft,
  };
}
