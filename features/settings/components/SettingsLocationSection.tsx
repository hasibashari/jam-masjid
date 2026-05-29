'use client';

import React from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { AppSettings } from '@/shared/types';
import NominatimSearch from '@/features/location/components/NominatimSearch';

const DynamicMapPicker = dynamic(() => import('@/features/location/components/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 gap-2 rounded-xl">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <span className="text-sm font-medium">Memuat Peta...</span>
    </div>
  ),
});

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  mapCenter: { lat: number; lng: number };
  handlePlaceSelect: (lat: number, lon: number, name: string) => void;
  handleMapClick: (lat: number, lon: number) => void;
  saveLoading: boolean;
}

/**
 * Section: Location configuration (Map, lat/lon inputs, calculation method).
 */
export default function SettingsLocationSection({
  settings,
  setSettings,
  mapCenter,
  handlePlaceSelect,
  handleMapClick,
  saveLoading,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col h-full justify-between">
      <div>
        <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-500 shrink-0" /> Penyelaras Lokasi &amp; Kiblat
        </h3>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Pencarian Tempat / Kota</span>
            <NominatimSearch onPlaceSelect={handlePlaceSelect} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">Latitude</span>
              <input
                type="number"
                step="0.000001"
                value={settings.latitude}
                onChange={(e) => setSettings(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white text-xs font-mono font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">Longitude</span>
              <input
                type="number"
                step="0.000001"
                value={settings.longitude}
                onChange={(e) => setSettings(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Metode Perhitungan Adhan</span>
            <select
              value={settings.calculationMethod}
              onChange={(e) => setSettings(prev => ({ ...prev, calculationMethod: parseInt(e.target.value) || 4 }))}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white text-[13px] md:text-sm font-semibold"
            >
              <option value={20}>Kemenag RI (Kementerian Agama Indonesia)</option>
              <option value={4}>Umm Al-Qura (Makkah, Arab Saudi)</option>
              <option value={3}>Liga Dunia Islam (Muslim World League)</option>
              <option value={2}>Masyarakat Islam Amerika Utara (ISNA)</option>
              <option value={1}>Universitas Ilmu Islam, Karachi</option>
              <option value={5}>Oblast Mesir (Egyptian General Authority)</option>
            </select>
          </div>
        </div>

        <div className="w-full h-40 sm:h-48 md:h-64 border border-zinc-800 rounded-2xl overflow-hidden mb-6 z-0">
          <DynamicMapPicker
            center={mapCenter}
            onLocationSelect={handleMapClick}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saveLoading}
        className="w-full py-3 md:py-3.5 bg-[#D4AF37] hover:bg-[#ebd586] disabled:bg-zinc-700 text-zinc-950 rounded-xl text-[13px] md:text-sm font-black tracking-wider transition-colors uppercase mt-2"
      >
        {saveLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-950" /> : 'Simpan Semua Konfigurasi'}
      </button>
    </div>
  );
}
