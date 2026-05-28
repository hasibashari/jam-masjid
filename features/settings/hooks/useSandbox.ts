'use client';

import React from 'react';
import { AppSettings } from '@/shared/types';

interface UseSandboxProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  prayerTimings: any;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export function useSandbox({
  settings,
  setSettings,
  prayerTimings,
  showAlert,
}: UseSandboxProps) {
  // Calculate dynamic simulation times relative to computed Dhuhr prayer time
  const getSimulatedTimes = () => {
    const dhuhrStr = (prayerTimings?.Dhuhr || "12:00").split(" ")[0];
    const [hours, minutes] = dhuhrStr.split(":").map(Number);

    // Adzan simulation: 1 minute before Dhuhr
    const adzanSimDate = new Date();
    adzanSimDate.setHours(hours, minutes, 0, 0);
    adzanSimDate.setMinutes(adzanSimDate.getMinutes() - 1);

    // Iqomah simulation: Dhuhr + adzanDuration + 10 seconds
    const iqomahSimDate = new Date();
    iqomahSimDate.setHours(hours, minutes, 0, 0);
    iqomahSimDate.setSeconds(iqomahSimDate.getSeconds() + (settings.adzanDuration || 180) + 10);

    // Sholat simulation: Dhuhr + adzanDuration + iqomahDuration + 10 seconds
    const sholatSimDate = new Date();
    sholatSimDate.setHours(hours, minutes, 0, 0);
    sholatSimDate.setSeconds(
      sholatSimDate.getSeconds() +
        (settings.adzanDuration || 180) +
        (settings.iqomahDuration || 600) +
        10
    );

    const formatTimeStr = (d: Date) => {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    };

    return {
      adzan: { date: adzanSimDate, str: formatTimeStr(adzanSimDate) },
      iqomah: { date: iqomahSimDate, str: formatTimeStr(iqomahSimDate) },
      sholat: { date: sholatSimDate, str: formatTimeStr(sholatSimDate) },
    };
  };

  const simTimes = getSimulatedTimes();

  const handleUpdateSandboxField = async (fields: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...fields }));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, ...fields }),
      });
    } catch (err) {
      showAlert('error', 'Gagal memperbarui status sandbox.');
    }
  };

  return {
    simTimes,
    handleUpdateSandboxField,
  };
}
