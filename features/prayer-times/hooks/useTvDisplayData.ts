'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppSettings, AnnouncementType, BannerType, QuoteType } from '@/shared/types';

interface UseTvDisplayDataProps {
  initialSettings: AppSettings;
  initialAnnouncements: AnnouncementType[];
  initialQuotes: QuoteType[];
  suspended?: boolean;
}

export function useTvDisplayData({ initialSettings, initialAnnouncements, initialQuotes, suspended = false }: UseTvDisplayDataProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>(initialAnnouncements);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [quotes, setQuotes] = useState<QuoteType[]>(initialQuotes);
  const [bgError, setBgError] = useState(false);
  const [prevBgImage, setPrevBgImage] = useState(initialSettings.backgroundImage);

  // Reset background error status if the image URL changes
  if (settings.backgroundImage !== prevBgImage) {
    setPrevBgImage(settings.backgroundImage);
    setBgError(false);
  }

  // Fetch settings, announcements, banners, and quotes from database
  const fetchLatestData = useCallback(async () => {
    try {
      const [settingsRes, announcementsRes, bannersRes, quotesRes] = await Promise.all([
        fetch('/api/settings').catch(() => null),
        fetch('/api/announcements').catch(() => null),
        fetch('/api/banners').catch(() => null),
        fetch('/api/quotes').catch(() => null)
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
      if (quotesRes?.ok) {
        const remoteQuotes = await quotesRes.json();
        setQuotes(remoteQuotes);
      }
    } catch (e) {
      console.error("Failed background polling", e);
    }
  }, []);

  // Poll for background data every 15 seconds (suspended during active prayer phases)
  useEffect(() => {
    if (suspended) return;

    // Instant fetch immediately when coming out of suspension or mounting (wrapped to avoid synchronous setState lint errors)
    const timer = setTimeout(() => {
      fetchLatestData();
    }, 0);

    const poller = setInterval(fetchLatestData, 15000);
    return () => {
      clearTimeout(timer);
      clearInterval(poller);
    };
  }, [fetchLatestData, suspended]);

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
    quotes,
    setQuotes,
    bgError,
    setBgError,
  };
}
