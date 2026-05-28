'use client';

import { format } from 'date-fns';
import { AppSettings } from '@/shared/types';

interface UseDisplayScheduleProps {
  currentTime: Date | null;
  settings: AppSettings;
  prayerStage: string;
}

export function useDisplaySchedule({
  currentTime,
  settings,
  prayerStage,
}: UseDisplayScheduleProps) {
  const isDisplayScheduledSleep = (): boolean => {
    if (!currentTime) return false;
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

  const isSleep = isDisplayScheduledSleep();
  const shouldEnterStandby = isSleep && prayerStage === 'NORMAL';

  return shouldEnterStandby;
}
