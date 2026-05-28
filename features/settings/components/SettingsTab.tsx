'use client';

import React from 'react';
import { 
  Volume2, 
  Clock, 
  Image as ImageIcon, 
  MapPin, 
  Loader2, 
  Upload, 
  X 
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AppSettings } from '@/shared/types';
import NominatimSearch from '@/features/location/components/NominatimSearch';
import { useMosqueSettings } from '../hooks/useMosqueSettings';

const DynamicMapPicker = dynamic(() => import('@/features/location/components/MapPicker'), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 gap-2 rounded-xl">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <span className="text-sm font-medium">Memuat Peta...</span>
    </div>
  )
});

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
  } = useMosqueSettings({
    initialSettings: settings,
    setSettingsExternal: setSettings,
    showAlert,
  });

  const adzanPresets = [
    'https://www.islamcan.com/audio/adhan/azan1.mp3',
    'https://www.islamcan.com/audio/adhan/azan2.mp3',
    'https://www.islamcan.com/audio/adhan/azan3.mp3'
  ];
  const [isCustomAdzan, setIsCustomAdzan] = React.useState(!adzanPresets.includes(settings.adzanAudioUrl));
  
  const tahrimPresets = [
    'https://archive.org/download/tarhim-subuh/tarhim-subuh.mp3'
  ];
  const [isCustomTahrim, setIsCustomTahrim] = React.useState(!tahrimPresets.includes(settings.tahrimAudioUrl));

  return (
    <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      
      {/* Left panels: Identity & Timings */}
      <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
        
        {/* Card 1: Identity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
          <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-500 shrink-0" /> Identitas Masjid & Jadwal Aktif
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Nama Masjid</label>
              <input 
                type="text" 
                value={settings.mosqueName}
                onChange={(e) => setSettings(prev => ({ ...prev, mosqueName: e.target.value }))}
                required
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-semibold"
                placeholder="Masukkan nama masjid..."
              />
            </div>
 
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Alamat Masjid</label>
              <input 
                type="text" 
                value={settings.mosqueAddress || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, mosqueAddress: e.target.value }))}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-semibold"
                placeholder="Masukkan alamat masjid..."
              />
            </div>
          </div>
        </div>
 
        {/* Card 2: Sholat state timing parameters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
          <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500 shrink-0" /> Konfigurasi Fase Durasi Ibadah
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-4 sm:mb-6">
            <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Fase 1. Adzan</label>
              <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">Durasi memutar audio/alert adzan berkumandang.</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={settings.adzanDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, adzanDuration: parseInt(e.target.value) || 0 }))}
                  required
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm w-20 text-center font-bold font-mono"
                />
                <span className="text-xs text-zinc-300 font-medium">detik</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Fase 3. Durasi Shalat</label>
              <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">Durasi ibadah hening shalat berjamaah berlangsung.</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={settings.prayerDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, prayerDuration: parseInt(e.target.value) || 0 }))}
                  required
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm w-20 text-center font-bold font-mono"
                />
                <span className="text-xs text-zinc-300 font-medium">detik</span>
              </div>
            </div>
          </div>
 
          <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6 rounded-2xl flex flex-col">
            <label className="text-xs font-black uppercase text-[#D4AF37] tracking-wider mb-2">Fase 2. Jeda Iqomah (Per Waktu Sholat)</label>
            <span className="text-[10px] text-zinc-500 mb-4 leading-relaxed">Atur jeda hitung mundur iqomah secara spesifik untuk masing-masing waktu sholat (dalam menit).</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {[
                { key: 'iqomahFajr', label: 'Subuh' },
                { key: 'iqomahDhuhr', label: 'Dzuhur' },
                { key: 'iqomahAsr', label: 'Ashar' },
                { key: 'iqomahMaghrib', label: 'Maghrib' },
                { key: 'iqomahIsha', label: 'Isya' }
              ].map((item) => (
                <div key={item.key} className="flex flex-col gap-2 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl items-center">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{item.label}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="number" 
                      value={Math.floor((settings[item.key as keyof AppSettings] as number || 0) / 60)}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value) || 0;
                        setSettings(prev => ({ ...prev, [item.key]: mins * 60 }));
                      }}
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1.5 outline-none text-white focus:border-emerald-500 text-xs w-12 text-center font-bold font-mono"
                    />
                    <span className="text-[10px] text-zinc-400 font-semibold">menit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2.2: Koreksi Manual Waktu Shalat */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
          <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500 shrink-0" /> Koreksi Manual Waktu Shalat
          </h3>
          <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6 rounded-2xl flex flex-col">
            <span className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
              Tambahkan atau kurangkan waktu shalat hasil perhitungan API secara manual (dalam menit). Berguna untuk menyesuaikan dengan ketentuan jadwal lokal/Kemenag daerah Anda.
            </span>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {[
                { key: 'adjustImsak', label: 'Imsak' },
                { key: 'adjustFajr', label: 'Subuh' },
                { key: 'adjustSunrise', label: 'Syuruq' },
                { key: 'adjustDhuhr', label: 'Dzuhur' },
                { key: 'adjustAsr', label: 'Ashar' },
                { key: 'adjustMaghrib', label: 'Maghrib' },
                { key: 'adjustIsha', label: 'Isya' }
              ].map((item) => (
                <div key={item.key} className="flex-1 min-w-[100px] sm:min-w-[110px] md:min-w-[120px] flex flex-col gap-2 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl items-center">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{item.label}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="number" 
                      value={settings[item.key as keyof AppSettings] as number || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setSettings(prev => ({ ...prev, [item.key]: val }));
                      }}
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1.5 outline-none text-white focus:border-emerald-500 text-xs w-12 text-center font-bold font-mono"
                    />
                    <span className="text-[10px] text-zinc-400 font-semibold">menit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* Card 2.5: Audio & Adzan Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
          <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-500 shrink-0" /> Pengaturan Audio & Alarm Adzan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start">
            
            <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl md:col-span-1">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Status Suara Adzan</label>
              <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">Putar rekaman suara adzan secara otomatis ketika waktu sholat masuk.</span>
              <div className="flex items-center gap-3 py-1">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, adzanAudioActive: !prev.adzanAudioActive }))}
                  className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                    settings.adzanAudioActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow-lg"></div>
                </button>
                <span className="text-xs sm:text-sm text-zinc-300 font-semibold">
                  {settings.adzanAudioActive ? 'Audio Aktif' : 'Mute / Hening'}
                </span>
              </div>
            </div>
 
            <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl md:col-span-2">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Pilih Suara Muadzin / URL Audio</label>
              <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">Pilih salah satu preset rekaman adzan berkualitas tinggi atau masukkan URL .mp3 kustom Anda sendiri.</span>
              <div className="flex flex-col gap-3">
                <select
                  value={isCustomAdzan ? 'custom' : settings.adzanAudioUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomAdzan(true);
                      setSettings(prev => ({ ...prev, adzanAudioUrl: '' }));
                    } else {
                      setIsCustomAdzan(false);
                      setSettings(prev => ({ ...prev, adzanAudioUrl: val }));
                    }
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white text-xs font-semibold focus:border-emerald-500"
                >
                  <option value="https://www.islamcan.com/audio/adhan/azan1.mp3">Preset 1. Adzan Mekkah (Suara Merdu Syahdu)</option>
                  <option value="https://www.islamcan.com/audio/adhan/azan2.mp3">Preset 2. Adzan Madinah (Suara Tenang & Khusyuk)</option>
                  <option value="https://www.islamcan.com/audio/adhan/azan3.mp3">Preset 3. Adzan Masjid Al-Aqsa (Tradisional)</option>
                  <option value="custom">-- Masukkan URL Audio Kustom (.mp3) --</option>
                </select>
 
                {isCustomAdzan && (
                  <input
                    type="url"
                    value={settings.adzanAudioUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, adzanAudioUrl: e.target.value }))}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 outline-none text-white text-xs font-mono focus:border-emerald-500"
                    placeholder="Tempel link URL file .mp3..."
                  />
                )}
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Volume Suara Adzan</span>
                    <span className="text-xs text-emerald-400 font-bold font-mono">{Math.round(settings.adzanAudioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.adzanAudioVolume}
                    onChange={(e) => setSettings(prev => ({ ...prev, adzanAudioVolume: parseFloat(e.target.value) }))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2.8: Pengaturan Tahrim / Tarhim */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
          <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-500 shrink-0" /> Pengaturan Tahrim / Tarhim
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start">
            
            <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl md:col-span-1">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Status Tahrim</label>
              <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">Putar selawat Tarhim otomatis sebelum adzan Subuh berkumandang.</span>
              <div className="flex items-center gap-3 py-1">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, tahrimAudioActive: !prev.tahrimAudioActive }))}
                  className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                    settings.tahrimAudioActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                  }`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow-lg"></div>
                </button>
                <span className="text-xs sm:text-sm text-zinc-300 font-semibold">
                  {settings.tahrimAudioActive ? 'Tahrim Aktif' : 'Non-aktif'}
                </span>
              </div>
            </div>
 
            <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Mulai Sebelum Subuh</label>
                  <span className="text-[10px] text-zinc-500 leading-relaxed">Berapa menit sebelum Subuh Tahrim diputar?</span>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="number" 
                      value={settings.tahrimDuration || 0}
                      onChange={(e) => setSettings(prev => ({ ...prev, tahrimDuration: parseInt(e.target.value) || 0 }))}
                      required
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 outline-none text-white focus:border-emerald-500 text-xs w-16 text-center font-bold font-mono"
                    />
                    <span className="text-xs text-zinc-300 font-medium">menit</span>
                  </div>
                </div>
              </div>
 
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Pilih Audio Tahrim / URL Audio</label>
                <select
                  value={isCustomTahrim ? 'custom' : settings.tahrimAudioUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomTahrim(true);
                      setSettings(prev => ({ ...prev, tahrimAudioUrl: '' }));
                    } else {
                      setIsCustomTahrim(false);
                      setSettings(prev => ({ ...prev, tahrimAudioUrl: val }));
                    }
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white text-xs font-semibold focus:border-emerald-500"
                >
                  <option value="https://archive.org/download/tarhim-subuh/tarhim-subuh.mp3">Preset 1. Tarhim Klasik (Shaykh Mahmoud Khalil al-Hussary)</option>
                  <option value="custom">-- Masukkan URL Audio Kustom (.mp3) --</option>
                </select>
 
                {isCustomTahrim && (
                  <input
                    type="url"
                    value={settings.tahrimAudioUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, tahrimAudioUrl: e.target.value }))}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 outline-none text-white text-xs font-mono focus:border-emerald-500 mt-2"
                    placeholder="Tempel link URL file .mp3..."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
 
        {/* Card 3: Main Background Image */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
          <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" /> Background Utama Layar TV
          </h3>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
            
            {/* Upload & URL Input Area */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Unggah File Background</label>
                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-4 sm:p-6 bg-zinc-950/40 flex flex-col items-center justify-center text-center gap-3 relative cursor-pointer hover:border-emerald-500/50 transition-colors h-36">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleMainBgUpload}
                    disabled={mainBgUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                  />
                  {mainBgUploading ? (
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-zinc-500" />
                      <div>
                        <span className="text-xs font-bold text-emerald-500">Klik / Seret Gambar</span>
                        <p className="text-[10px] text-zinc-500 mt-1">Maks 5MB. Aspek rasio 16:9 disarankan.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
 
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Atau Tempel URL Background Gambar</label>
                <div className="flex gap-2">
                  <input 
                    type="url"
                    value={settings.backgroundImage || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundImage: e.target.value || null }))}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-xs font-mono font-bold flex-1"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {settings.backgroundImage && (
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, backgroundImage: null }))}
                      className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all shrink-0"
                      title="Hapus URL"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
 
            {/* Preview Area */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                 <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Preview Background</label>
                 {settings.backgroundImage && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400">AKTIFKAN</span>
                      <button
                        type="button"
                        onClick={handleToggleMainBg}
                        className={`w-10 h-5 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                          settings.backgroundActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 bg-white rounded-full shadow-lg"></div>
                      </button>
                    </div>
                 )}
              </div>
 
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                {settings.backgroundImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={settings.backgroundImage} 
                    alt="Background" 
                    className={`w-full h-full object-cover transition-opacity ${settings.backgroundActive ? 'opacity-100' : 'opacity-40 grayscale'}`}
                  />
                ) : (
                  <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Belum ada background</span>
                )}
              </div>
            </div>
            
          </div>
        </div>
 
      </div>
 
      {/* Right panel: Locations */}
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0" /> Penyelaras Lokasi & Kiblat
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
 
            {/* Leaflet Dynamic Picker map with responsive heights */}
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
      </div>
 
    </form>
  );
}
