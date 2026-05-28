'use client';

import { useState, useEffect, useRef } from 'react';
import { differenceInMilliseconds, parse, addSeconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PrayerTimesState, PrayerItem } from '../types';

interface UsePrayerTimesProps {
  latitude: number;
  longitude: number;
  calculationMethod: number;
  adzanDuration: number; // in seconds
  iqomahDuration: number; // in seconds
  prayerDuration: number; // in seconds
  sandboxActive?: boolean;
  sandboxTime?: string | null;
  sandboxStage?: 'AUTO' | 'NORMAL' | 'ADZAN' | 'IQOMAH' | 'PRAYING';
  sandboxSpeed?: number;
}

export type PrayerStage = 'NORMAL' | 'ADZAN' | 'IQOMAH' | 'PRAYING';

export function usePrayerTimes({
  latitude,
  longitude,
  calculationMethod,
  adzanDuration,
  iqomahDuration,
  prayerDuration,
  sandboxActive,
  sandboxTime,
  sandboxStage,
  sandboxSpeed
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

  // Local ref for virtual clock tracking
  const virtualTimeBaseRef = useRef<Date | null>(null);
  const realTimeBaseRef = useRef<number | null>(null);

  useEffect(() => {
    if (sandboxActive && sandboxTime) {
      const parsed = new Date(sandboxTime);
      if (!isNaN(parsed.getTime())) {
        virtualTimeBaseRef.current = parsed;
        realTimeBaseRef.current = Date.now();
      }
    } else {
      virtualTimeBaseRef.current = null;
      realTimeBaseRef.current = null;
    }
  }, [sandboxActive, sandboxTime]);

  // Update clock every second, taking into account timezone and sandbox settings
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let activeTime = now;

      if (sandboxActive) {
        if (virtualTimeBaseRef.current && realTimeBaseRef.current) {
          const elapsedReal = Date.now() - realTimeBaseRef.current;
          const elapsedVirtual = elapsedReal * (sandboxSpeed || 1.0);
          activeTime = new Date(virtualTimeBaseRef.current.getTime() + elapsedVirtual);
        } else if (sandboxTime) {
          const parsed = new Date(sandboxTime);
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
  }, [timezone, sandboxActive, sandboxTime, sandboxSpeed]);

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

  // Convert prayer times strings (e.g. "04:30") to correct Dates for today
  const parseTime = (timeStr: string) => parse(timeStr.split(" ")[0], "HH:mm", currentTime);

  const timelineObj = {
    Fajr: parseTime(prayerTimes.Fajr),
    Sunrise: parseTime(prayerTimes.Sunrise),
    Dhuhr: parseTime(prayerTimes.Dhuhr),
    Asr: parseTime(prayerTimes.Asr),
    Maghrib: parseTime(prayerTimes.Maghrib),
    Isha: parseTime(prayerTimes.Isha)
  };

  const timelineValid: PrayerItem[] = [
    { name: 'Fajr', time: timelineObj.Fajr },
    { name: 'Dhuhr', time: timelineObj.Dhuhr },
    { name: 'Asr', time: timelineObj.Asr },
    { name: 'Maghrib', time: timelineObj.Maghrib },
    { name: 'Isha', time: timelineObj.Isha }
  ];

  // Let's determine if we are currently in an active special stage:
  // ADZAN, IQOMAH, or PRAYING.
  // We only run this for worship prayers (Fajr, Dhuhr, Asr, Maghrib, Isha), NOT Sunrise.
  let prayerStage: PrayerStage = 'NORMAL';
  let activePrayerName: string | null = null;
  let stageSecondsLeft = 0;

  if (sandboxActive && sandboxStage && sandboxStage !== 'AUTO') {
    prayerStage = sandboxStage;
    activePrayerName = 'Dhuhr'; // mock prayer name for sandbox visual testing
    stageSecondsLeft = 300; // mock time left (5 mins)
  } else {
    for (const item of timelineValid) {
      const prayerTime = item.time;
      // End times calculations relative to start
      const adzanEndTime = addSeconds(prayerTime, adzanDuration);
      const iqomahEndTime = addSeconds(adzanEndTime, iqomahDuration);
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

  // Regular next prayer countdown logic (excluding sunrise for calculation of NEXT, or we can include Sunrise if it's there but typically we only count down to standard workflow)
  // Let's count down to any active schedule
  const normalCountdownTimeline = [
    { name: 'Fajr', time: timelineObj.Fajr },
    { name: 'Sunrise', time: timelineObj.Sunrise },
    { name: 'Dhuhr', time: timelineObj.Dhuhr },
    { name: 'Asr', time: timelineObj.Asr },
    { name: 'Maghrib', time: timelineObj.Maghrib },
    { name: 'Isha', time: timelineObj.Isha }
  ];

  let nextPrayer = normalCountdownTimeline.find(p => p.time > currentTime);
  
  if (!nextPrayer) {
    const tomorrowFajr = new Date(timelineObj.Fajr);
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    nextPrayer = { name: 'Fajr', time: tomorrowFajr };
  }

  const msToNext = differenceInMilliseconds(nextPrayer.time, currentTime);
  const hoursToNext = Math.max(0, Math.floor(msToNext / (1000 * 60 * 60)));
  const minsToNext = Math.max(0, Math.floor((msToNext % (1000 * 60 * 60)) / (1000 * 60)));
  const secsToNext = Math.max(0, Math.floor((msToNext % (1000 * 60)) / 1000));
  const countdownStr = `${String(hoursToNext).padStart(2, '0')}:${String(minsToNext).padStart(2, '0')}:${String(secsToNext).padStart(2, '0')}`;

  // Format Hijri Date (using native Intl in Indonesian)
  // Dilakukan penyesuaian koreksi -1 hari agar selaras dengan kalender Hijriah resmi Kemenag RI
  const hijriAdjustedTime = new Date(currentTime.getTime());
  hijriAdjustedTime.setDate(hijriAdjustedTime.getDate() - 1);

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
    timelineObj,
    countdownStr,
    hijriDate,
    prayerStage,
    activePrayerName,
    stageSecondsLeft
  };
}
