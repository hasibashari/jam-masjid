'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { AppSettings } from '@/shared/types';

interface SandboxTabProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  prayerTimings: any;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export default function SandboxTab({ 
  settings, 
  setSettings, 
  prayerTimings, 
  showAlert 
}: SandboxTabProps) {

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
    sholatSimDate.setSeconds(sholatSimDate.getSeconds() + (settings.adzanDuration || 180) + (settings.iqomahDuration || 600) + 10);
    
    const formatTimeStr = (d: Date) => {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${hh}:${mm}:${ss}`;
    };
    
    return {
      adzan: { date: adzanSimDate, str: formatTimeStr(adzanSimDate) },
      iqomah: { date: iqomahSimDate, str: formatTimeStr(iqomahSimDate) },
      sholat: { date: sholatSimDate, str: formatTimeStr(sholatSimDate) }
    };
  };

  const simTimes = getSimulatedTimes();

  const handleUpdateSandboxField = async (fields: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...fields }));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, ...fields })
      });
    } catch (err) {
      showAlert('error', 'Gagal memperbarui status sandbox.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-left">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#D4AF37]">Dev Sandbox & Simulators</h3>
          <p className="text-xs text-zinc-400">Manipulasi waktu, simulasi percepatan, dan force override untuk menguji transisi fase Jam Masjid.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Sandbox Config */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-bold text-white uppercase tracking-wide">Mode Sandbox</span>
                <p className="text-[10px] text-zinc-500">Aktifkan manipulasi waktu virtual aplikasi.</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const nextActive = !settings.sandboxActive;
                  await handleUpdateSandboxField({ sandboxActive: nextActive });
                  showAlert('success', nextActive ? 'Mode Sandbox diaktifkan!' : 'Mode Sandbox dinonaktifkan.');
                }}
                className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 ${
                  settings.sandboxActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                }`}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow-lg"></div>
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
            <span className="text-sm font-bold text-white uppercase tracking-wide">Simulasi Force Stage</span>
            <p className="text-[10px] text-zinc-500">Paksa tampilan TV Display untuk masuk ke fase tertentu secara instan.</p>
            
            <select
              value={settings.sandboxStage || 'AUTO'}
              disabled={!settings.sandboxActive}
              onChange={async (e) => {
                const val = e.target.value;
                await handleUpdateSandboxField({ sandboxStage: val as any });
                showAlert('success', `Simulasi fase diubah ke ${val}`);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="AUTO">Otomatis (Ikuti Waktu)</option>
              <option value="NORMAL">Normal (Tampilan Jam & Jadwal)</option>
              <option value="ADZAN">Adzan (Hitung Mundur Adzan)</option>
              <option value="IQOMAH">Iqomah (Hitung Mundur Iqomah)</option>
              <option value="PRAYING">Sholat (Fase Silent Ibadah)</option>
            </select>
          </div>

          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
            <span className="text-sm font-bold text-white uppercase tracking-wide">Faktor Percepatan Waktu</span>
            <p className="text-[10px] text-zinc-500">Mempercepat jalannya waktu virtual sholat (sangat berguna untuk menguji transisi countdown).</p>
            
            <select
              value={settings.sandboxSpeed || 1.0}
              disabled={!settings.sandboxActive}
              onChange={async (e) => {
                const val = parseFloat(e.target.value);
                await handleUpdateSandboxField({ sandboxSpeed: val });
                showAlert('success', `Percepatan waktu diubah ke ${val}x`);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={1.0}>1x (Waktu Normal)</option>
              <option value={5.0}>5x (5 Detik Virtual per Detik Nyata)</option>
              <option value={10.0}>10x</option>
              <option value={60.0}>60x (1 Menit Virtual per Detik Nyata)</option>
              <option value={300.0}>300x (5 Menit Virtual per Detik Nyata)</option>
            </select>
          </div>
        </div>

        {/* Right Column: Time Travel Quick Presets */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
            <span className="text-sm font-bold text-white uppercase tracking-wide">Time Travel / Set Waktu Virtual</span>
            <p className="text-[10px] text-zinc-500">Atur waktu virtual ke jam, menit, dan detik tertentu.</p>
            
            <div className="flex gap-3">
              <input
                type="datetime-local"
                disabled={!settings.sandboxActive}
                value={settings.sandboxTime ? new Date(new Date(settings.sandboxTime).getTime() - new Date().getTimezoneOffset()*60*1000).toISOString().substring(0, 16) : ""}
                onChange={async (e) => {
                  const isoStr = e.target.value ? new Date(e.target.value).toISOString() : null;
                  await handleUpdateSandboxField({ sandboxTime: isoStr });
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-xs font-mono font-bold flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled={!settings.sandboxActive}
                onClick={async () => {
                  await handleUpdateSandboxField({ sandboxTime: null });
                  showAlert('success', 'Waktu virtual direset ke waktu sekarang.');
                }}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
            <span className="text-sm font-bold text-white uppercase tracking-wide">Aksi Cepat Simulasi Fase</span>
            <p className="text-[10px] text-zinc-500">Atur waktu virtual secara otomatis mendekati fase sholat terdekat (misal sholat Zuhur jam 12:00).</p>
            
            <div className="flex flex-col gap-2 mt-2">
              <button
                type="button"
                disabled={!settings.sandboxActive}
                onClick={async () => {
                  const isoStr = simTimes.adzan.date.toISOString();
                  await handleUpdateSandboxField({ sandboxTime: isoStr, sandboxStage: 'AUTO' });
                  showAlert('success', `Waktu disetel ke 1 menit sebelum Zuhur (${simTimes.adzan.str.substring(0, 5)}). Sempurna untuk menguji transisi Adzan!`);
                }}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold text-left px-5 transition-all animate-none"
              >
                <span>Simulasikan Fase Adzan Zuhur ({simTimes.adzan.str.substring(0, 5)} - Menjelang Adzan)</span>
              </button>

              <button
                type="button"
                disabled={!settings.sandboxActive}
                onClick={async () => {
                  const isoStr = simTimes.iqomah.date.toISOString();
                  await handleUpdateSandboxField({ sandboxTime: isoStr, sandboxStage: 'AUTO' });
                  showAlert('success', `Waktu disetel ke ${simTimes.iqomah.str} (Awal Iqomah Zuhur). Sempurna untuk menguji hitung mundur Iqomah!`);
                }}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold text-left px-5 transition-all animate-none"
              >
                <span>Simulasikan Hitung Mundur Iqomah Zuhur ({simTimes.iqomah.str} - Adzan Selesai)</span>
              </button>

              <button
                type="button"
                disabled={!settings.sandboxActive}
                onClick={async () => {
                  const isoStr = simTimes.sholat.date.toISOString();
                  await handleUpdateSandboxField({ sandboxTime: isoStr, sandboxStage: 'AUTO' });
                  showAlert('success', `Waktu disetel ke ${simTimes.sholat.str} (Awal Fase Shalat Zuhur). Sempurna untuk menguji Fase Shalat!`);
                }}
                className="w-full py-3 bg-[#0d2e1a] border border-emerald-500/20 hover:bg-[#124225] disabled:opacity-50 text-emerald-400 rounded-xl text-xs font-bold text-left px-5 transition-all animate-none"
              >
                <span>Simulasikan Fase Shalat Zuhur ({simTimes.sholat.str} - Shalat Berjamaah)</span>
              </button>

              <button
                type="button"
                disabled={!settings.sandboxActive}
                onClick={async () => {
                  const today = new Date();
                  today.setHours(23, 30, 0, 0);
                  const isoStr = today.toISOString();
                  await handleUpdateSandboxField({ sandboxTime: isoStr, sandboxStage: 'AUTO' });
                  showAlert('success', 'Waktu disetel ke 23:30. Tampilan TV akan masuk ke Mode Hemat Energi / Istirahat.');
                }}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold text-left px-5 transition-all animate-none"
              >
                <span>Simulasikan Jam Istirahat Tampilan / Standby (23:30)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
