'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppSettings, AnnouncementType, BannerType } from '@/shared/types';

interface UseTvDisplayDataProps {
  initialSettings: AppSettings;
  initialAnnouncements: AnnouncementType[];
}

export function useTvDisplayData({ initialSettings, initialAnnouncements }: UseTvDisplayDataProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>(initialAnnouncements);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [bgError, setBgError] = useState(false);
  const [prevBgImage, setPrevBgImage] = useState(initialSettings.backgroundImage);

  // Reset background error status if the image URL changes
  if (settings.backgroundImage !== prevBgImage) {
    setPrevBgImage(settings.backgroundImage);
    setBgError(false);
  }

  // Fetch settings, announcements, and banners from database
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

  // Poll for background data every 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLatestData();
    }, 0);
    const poller = setInterval(fetchLatestData, 2000);
    return () => {
      clearTimeout(timer);
      clearInterval(poller);
    };
  }, [fetchLatestData]);

  // Event listener for PWA online status reconnection
  useEffect(() => {
    const handleReconnectionSync = () => {
      console.log("[PWA] Online reconnection detected! Triggering instant data sync...");
      fetchLatestData();
    };

    window.addEventListener('app-sync-data', handleReconnectionSync);
    return () => window.removeEventListener('app-sync-data', handleReconnectionSync);
  }, [fetchLatestData]);

  return {
    settings,
    setSettings,
    announcements,
    setAnnouncements,
    banners,
    setBanners,
    bgError,
    setBgError,
  };
}
