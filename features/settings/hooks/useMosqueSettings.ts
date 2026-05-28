'use client';

import React, { useState, useEffect } from 'react';
import { AppSettings } from '@/shared/types';

interface UseMosqueSettingsProps {
  initialSettings: AppSettings;
  setSettingsExternal: React.Dispatch<React.SetStateAction<AppSettings>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export function useMosqueSettings({
  initialSettings,
  setSettingsExternal,
  showAlert,
}: UseMosqueSettingsProps) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [mainBgUploading, setMainBgUploading] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: initialSettings.latitude,
    lng: initialSettings.longitude,
  });

  // Sync map center if external settings change
  useEffect(() => {
    setMapCenter({
      lat: initialSettings.latitude,
      lng: initialSettings.longitude,
    });
  }, [initialSettings.latitude, initialSettings.longitude]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialSettings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettingsExternal(updated);
        showAlert('success', 'Konfigurasi settings masjid berhasil disimpan!');
      } else {
        const errData = await res.json();
        showAlert('error', errData.error || 'Gagal menyimpan settings.');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Koneksi error ke server.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleMainBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('error', 'File harus berupa gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showAlert('error', 'Ukuran gambar maksimal 5MB.');
      return;
    }

    setMainBgUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'upload');

    try {
      const res = await fetch('/api/settings/background', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setSettingsExternal(updated);
        showAlert('success', 'Background utama berhasil diperbarui!');
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal mengunggah background.');
      }
    } catch (err) {
      showAlert('error', 'Error mengunggah gambar.');
    } finally {
      setMainBgUploading(false);
    }
  };

  const handleToggleMainBg = async () => {
    const newActive = !initialSettings.backgroundActive;
    setSettingsExternal(prev => ({ ...prev, backgroundActive: newActive }));

    const formData = new FormData();
    formData.append('action', 'toggle');
    formData.append('active', String(newActive));

    try {
      const res = await fetch('/api/settings/background', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        setSettingsExternal(prev => ({ ...prev, backgroundActive: !newActive }));
        showAlert('error', 'Gagal diperbarui status background.');
      } else {
        showAlert('success', 'Status background diperbarui.');
      }
    } catch {
      setSettingsExternal(prev => ({ ...prev, backgroundActive: !newActive }));
      showAlert('error', 'Error mengubah status.');
    }
  };

  const handlePlaceSelect = (lat: number, lng: number, placeName: string) => {
    setSettingsExternal(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      mosqueName: placeName || prev.mosqueName,
    }));
    setMapCenter({ lat, lng });
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSettingsExternal(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
    setMapCenter({ lat, lng });
  };

  return {
    saveLoading,
    mainBgUploading,
    mapCenter,
    handleSaveSettings,
    handleMainBgUpload,
    handleToggleMainBg,
    handlePlaceSelect,
    handleMapClick,
  };
}
