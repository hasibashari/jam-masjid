'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { AppSettings } from '@/shared/types';
import { ADZAN_AUDIO_PRESETS, TAHRIM_AUDIO_PRESETS } from '@/shared/constants/audio';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

/**
 * Section: Adzan audio configuration and Tahrim/Tarhim audio configuration.
 */
export default function SettingsAudioSection({ settings, setSettings }: Props) {
  const [isCustomAdzan, setIsCustomAdzan] = React.useState(
    !ADZAN_AUDIO_PRESETS.some(p => p.value === settings.adzanAudioUrl),
  );
  const [isCustomTahrim, setIsCustomTahrim] = React.useState(
    !TAHRIM_AUDIO_PRESETS.some(p => p.value === settings.tahrimAudioUrl),
  );

  return (
    <>
      {/* Card: Adzan Audio */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-emerald-500 shrink-0" /> Pengaturan Audio &amp; Alarm Adzan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start">
          {/* Toggle */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl md:col-span-1">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Status Suara Adzan</label>
            <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">
              Putar rekaman suara adzan secara otomatis ketika waktu sholat masuk.
            </span>
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, adzanAudioActive: !prev.adzanAudioActive }))}
                className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                  settings.adzanAudioActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                }`}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
              </button>
              <span className="text-xs sm:text-sm text-zinc-300 font-semibold">
                {settings.adzanAudioActive ? 'Audio Aktif' : 'Mute / Hening'}
              </span>
            </div>
          </div>

          {/* Preset selector + volume */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl md:col-span-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Pilih Suara Muadzin / URL Audio</label>
            <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">
              Pilih salah satu preset rekaman adzan berkualitas tinggi atau masukkan URL .mp3 kustom Anda sendiri.
            </span>
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
                {ADZAN_AUDIO_PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
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

      {/* Card: Tahrim Audio */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-emerald-500 shrink-0" /> Pengaturan Tahrim / Tarhim
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-start">
          {/* Toggle */}
          <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl md:col-span-1">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Status Tahrim</label>
            <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">
              Putar selawat Tarhim otomatis sebelum adzan Subuh berkumandang.
            </span>
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, tahrimAudioActive: !prev.tahrimAudioActive }))}
                className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                  settings.tahrimAudioActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                }`}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
              </button>
              <span className="text-xs sm:text-sm text-zinc-300 font-semibold">
                {settings.tahrimAudioActive ? 'Tahrim Aktif' : 'Non-aktif'}
              </span>
            </div>
          </div>

          {/* Preset selector + duration */}
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
                {TAHRIM_AUDIO_PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
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
    </>
  );
}
