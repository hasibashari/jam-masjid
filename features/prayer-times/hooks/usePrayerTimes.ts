'use client';

import { useState, useEffect } from 'react';
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
}

export type PrayerStage = 'NORMAL' | 'ADZAN' | 'IQOMAH' | 'PRAYING';

export function usePrayerTimes({
  latitude,
  longitude,
  calculationMethod,
  adzanDuration,
  iqomahDuration,
  prayerDuration
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

  // Update clock every second, taking into account timezone
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (timezone) {
        setCurrentTime(toZonedTime(now, timezone));
      } else {
        setCurrentTime(now);
      }
    };
    updateTime();
    const clock = setInterval(updateTime, 1000);
    return () => clearInterval(clock);
  }, [timezone]);

  // If we haven't mounted or loaded the times yet, return default loaders values
  if (!currentTime || !prayerTimes) {
    return {
      currentTime: null,
      prayerTimes: null,
      timezone,
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

  // Format Hijri Date (using native Intl)
  const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const hijriDate = hijriFormatter.format(currentTime);

  return {
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
  };
}
