'use client';

import { AppSettings } from '@/shared/types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

/**
 * Section: Mosque identity fields (name, address, fasting reminder toggle).
 */
export default function SettingsIdentitySection({ settings, setSettings }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
      <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
        <span className="w-5 h-5 text-emerald-500 shrink-0 text-lg leading-none">🕌</span>
        Identitas Masjid &amp; Jadwal Aktif
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

        <div className="flex flex-col gap-2 sm:col-span-2 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl mt-2">
          <label className="text-xs font-black uppercase text-emerald-400 tracking-wider">Pengingat Puasa Sunnah Otomatis</label>
          <span className="text-[10px] text-zinc-500 mb-2 leading-relaxed">
            Secara otomatis menyisipkan pengumuman puasa sunnah (Senin-Kamis &amp; Ayyamul Bidh 13, 14, 15 Hijriah) ke dalam baris teks berjalan di TV Display.
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSettings(prev => ({ ...prev, fastingReminderActive: !prev.fastingReminderActive }))}
              className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                settings.fastingReminderActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-6 h-6 bg-white rounded-full shadow-lg" />
            </button>
            <span className="text-xs text-zinc-300 font-semibold">
              {settings.fastingReminderActive ? 'Pengingat Aktif' : 'Non-aktif'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
