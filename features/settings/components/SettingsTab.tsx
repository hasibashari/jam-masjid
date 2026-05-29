'use client';

import React from 'react';
import { AppSettings } from '@/shared/types';
import { useMosqueSettings } from '../hooks/useMosqueSettings';

import SettingsIdentitySection from './SettingsIdentitySection';
import SettingsPrayerTimingSection from './SettingsPrayerTimingSection';
import SettingsAudioSection from './SettingsAudioSection';
import SettingsBackgroundSection from './SettingsBackgroundSection';
import SettingsLocationSection from './SettingsLocationSection';

interface SettingsTabProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export default function SettingsTab({ settings, setSettings, showAlert }: SettingsTabProps) {
  const {
    saveLoading,
    mainBgUploading,
    mapCenter,
    handleSaveSettings,
    handleMainBgUpload,
    handleToggleMainBg,
    handlePlaceSelect,
    handleMapClick,
    handleDeleteBgImage,
    handleToggleBgImage,
    handleSelectBgImage,
    handleToggleSlideshow,
  } = useMosqueSettings({
    initialSettings: settings,
    setSettingsExternal: setSettings,
    showAlert,
  });

  return (
    <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      
      {/* Left panels: Identity & Timings & Backgrounds */}
      <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
        
        <SettingsIdentitySection settings={settings} setSettings={setSettings} />
        
        <SettingsPrayerTimingSection settings={settings} setSettings={setSettings} />
        
        <SettingsAudioSection settings={settings} setSettings={setSettings} />

        <SettingsBackgroundSection
          settings={settings}
          setSettings={setSettings}
          mainBgUploading={mainBgUploading}
          handleMainBgUpload={handleMainBgUpload}
          handleToggleMainBg={handleToggleMainBg}
          handleDeleteBgImage={handleDeleteBgImage}
          handleToggleBgImage={handleToggleBgImage}
          handleSelectBgImage={handleSelectBgImage}
          handleToggleSlideshow={handleToggleSlideshow}
          showAlert={showAlert}
        />
        
      </div>

      {/* Right panel: Locations */}
      <div className="flex flex-col gap-4 md:gap-6">
        <SettingsLocationSection
          settings={settings}
          setSettings={setSettings}
          mapCenter={mapCenter}
          handlePlaceSelect={handlePlaceSelect}
          handleMapClick={handleMapClick}
          saveLoading={saveLoading}
        />
      </div>

    </form>
  );
}
