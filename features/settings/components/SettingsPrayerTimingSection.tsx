'use client';

import { Clock } from 'lucide-react';
import { AppSettings } from '@/shared/types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const IQOMAH_PRAYERS = [
  { key: 'iqomahFajr',    label: 'Subuh' },
  { key: 'iqomahDhuhr',   label: 'Dzuhur' },
  { key: 'iqomahAsr',     label: 'Ashar' },
  { key: 'iqomahMaghrib', label: 'Maghrib' },
  { key: 'iqomahIsha',    label: 'Isya' },
] as const;

const ADJUST_PRAYERS = [
  { key: 'adjustImsak',   label: 'Imsak' },
  { key: 'adjustFajr',    label: 'Subuh' },
  { key: 'adjustSunrise', label: 'Syuruq' },
  { key: 'adjustDhuhr',   label: 'Dzuhur' },
  { key: 'adjustAsr',     label: 'Ashar' },
  { key: 'adjustMaghrib', label: 'Maghrib' },
  { key: 'adjustIsha',    label: 'Isya' },
] as const;

/**
 * Section: Prayer phase durations (adzan, iqomah per prayer, shalat) and
 * manual correction offsets per prayer time.
 */
export default function SettingsPrayerTimingSection({ settings, setSettings }: Props) {
  return (
    <>
      {/* Card: Phase Durations */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500 shrink-0" /> Konfigurasi Fase Durasi Ibadah
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-4 sm:mb-6">
          {[
            { key: 'adzanDuration',  label: 'Fase 1. Adzan', desc: 'Durasi memutar audio/alert adzan berkumandang.' },
            { key: 'prayerDuration', label: 'Fase 3. Durasi Shalat', desc: 'Durasi ibadah hening shalat berjamaah berlangsung.' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-4 sm:p-5 rounded-2xl">
              <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">{label}</label>
              <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">{desc}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings[key as keyof AppSettings] as number}
                  onChange={(e) => setSettings(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                  required
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm w-20 text-center font-bold font-mono"
                />
                <span className="text-xs text-zinc-300 font-medium">detik</span>
              </div>
            </div>
          ))}
        </div>

        {/* Iqomah per prayer */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6 rounded-2xl flex flex-col">
          <label className="text-xs font-black uppercase text-[#D4AF37] tracking-wider mb-2">
            Fase 2. Jeda Iqomah (Per Waktu Sholat)
          </label>
          <span className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
            Atur jeda hitung mundur iqomah secara spesifik untuk masing-masing waktu sholat (dalam menit).
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {IQOMAH_PRAYERS.map(({ key, label }) => (
              <div key={key} className="flex flex-col gap-2 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl items-center">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    value={Math.floor((settings[key] || 0) / 60)}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value) || 0;
                      setSettings(prev => ({ ...prev, [key]: mins * 60 }));
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

      {/* Card: Manual prayer time corrections */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500 shrink-0" /> Koreksi Manual Waktu Shalat
        </h3>
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6 rounded-2xl flex flex-col">
          <span className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
            Tambahkan atau kurangkan waktu shalat hasil perhitungan API secara manual (dalam menit). Berguna untuk menyesuaikan dengan ketentuan jadwal lokal/Kemenag daerah Anda.
          </span>
          <div className="flex flex-wrap gap-3 md:gap-4">
            {ADJUST_PRAYERS.map(({ key, label }) => (
              <div key={key} className="flex-1 min-w-[100px] sm:min-w-[110px] md:min-w-[120px] flex flex-col gap-2 bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl items-center">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="number"
                    value={settings[key as keyof AppSettings] as number || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSettings(prev => ({ ...prev, [key]: val }));
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
    </>
  );
}
