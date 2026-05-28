'use client';

import { useState, useEffect, useRef } from 'react';
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

  // Update clock every second, taking into account timezone
  useEffect(() => {
    const updateTime = () => {
      const activeTime = new Date();

      if (timezone) {
        setCurrentTime(toZonedTime(activeTime, timezone));
      } else {
        setCurrentTime(activeTime);
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
    Imsak: addMinutes(parseTime(prayerTimes.Imsak || "04:10"), adjustImsak || 0),
    Fajr: addMinutes(parseTime(prayerTimes.Fajr), adjustFajr || 0),
    Sunrise: addMinutes(parseTime(prayerTimes.Sunrise), adjustSunrise || 0),
    Dhuhr: addMinutes(parseTime(prayerTimes.Dhuhr), adjustDhuhr || 0),
    Asr: addMinutes(parseTime(prayerTimes.Asr), adjustAsr || 0),
    Maghrib: addMinutes(parseTime(prayerTimes.Maghrib), adjustMaghrib || 0),
    Isha: addMinutes(parseTime(prayerTimes.Isha), adjustIsha || 0)
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

  // Regular next prayer countdown logic (excluding sunrise for calculation of NEXT, or we can include Sunrise if it's there but typically we only count down to standard workflow)
  // Let's count down to any active schedule, including Imsak
  const normalCountdownTimeline = [
    { name: 'Imsak', time: timelineObj.Imsak },
    { name: 'Fajr', time: timelineObj.Fajr },
    { name: 'Sunrise', time: timelineObj.Sunrise },
    { name: 'Dhuhr', time: timelineObj.Dhuhr },
    { name: 'Asr', time: timelineObj.Asr },
    { name: 'Maghrib', time: timelineObj.Maghrib },
    { name: 'Isha', time: timelineObj.Isha }
  ];

  let nextPrayer = normalCountdownTimeline.find(p => p.time > currentTime);
  
  if (!nextPrayer) {
    const tomorrowImsak = new Date(timelineObj.Imsak);
    tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);
    nextPrayer = { name: 'Imsak', time: tomorrowImsak };
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
