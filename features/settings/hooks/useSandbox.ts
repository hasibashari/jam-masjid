'use client';

import React, { useState, useEffect } from 'react';
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
  // Sync local React settings state with localStorage on mount
  useEffect(() => {
    try {
      const active = localStorage.getItem('jam_masjid_sandbox_active') === 'true';
      const stage = localStorage.getItem('jam_masjid_sandbox_stage') || 'AUTO';
      const speed = parseFloat(localStorage.getItem('jam_masjid_sandbox_speed') || '1.0');
      const time = localStorage.getItem('jam_masjid_sandbox_time');

      setSettings(prev => ({
        ...prev,
        sandboxActive: active,
        sandboxStage: stage as any,
        sandboxSpeed: speed,
        sandboxTime: time
      }));
    } catch (e) {
      console.error("Failed to load local sandbox storage", e);
    }
  }, [setSettings]);

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
    // Update local React state
    setSettings(prev => ({ ...prev, ...fields }));

    // Write to localStorage instead of API POST!
    try {
      if (fields.sandboxActive !== undefined) {
        localStorage.setItem('jam_masjid_sandbox_active', String(fields.sandboxActive));
      }
      if (fields.sandboxStage !== undefined) {
        localStorage.setItem('jam_masjid_sandbox_stage', String(fields.sandboxStage));
      }
      if (fields.sandboxSpeed !== undefined) {
        localStorage.setItem('jam_masjid_sandbox_speed', String(fields.sandboxSpeed));
      }
      if (fields.sandboxTime !== undefined) {
        if (fields.sandboxTime === null) {
          localStorage.removeItem('jam_masjid_sandbox_time');
        } else {
          localStorage.setItem('jam_masjid_sandbox_time', fields.sandboxTime);
        }
      }

      // Dispatch custom events to notify other same-tab listeners
      window.dispatchEvent(new Event('jam-masjid-sandbox-update'));
    } catch (err) {
      showAlert('error', 'Gagal memperbarui status sandbox lokal.');
    }
  };

  return {
    simTimes,
    handleUpdateSandboxField,
  };
}
