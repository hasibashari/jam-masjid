'use client';

import { format } from 'date-fns';

interface FullscreenIqomahProps {
  prayerName: string;
  currentTime: Date;
  secondsLeft: number;
}

export default function FullscreenIqomah({ prayerName, currentTime, secondsLeft }: FullscreenIqomahProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#041a1a] text-white flex flex-col items-center justify-between p-12 select-none animate-fade-in">
      
      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-sky-500 to-[#D4AF37]"></div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-7xl border-b border-zinc-800 pb-6">
        <div>
          <span className="text-emerald-400 text-sm font-black tracking-[0.3em] uppercase block mb-1">Status Masjid</span>
          <span className="text-3xl font-black text-white tracking-tight">HITUNG MUNDUR IQOMAH</span>
        </div>
        <div className="text-right">
          <span className="text-emerald-400 text-sm font-black tracking-[0.3em] uppercase block mb-1">Current Time</span>
          <span className="text-3xl font-bold font-mono tracking-tight text-emerald-400">{format(currentTime, 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Center Countdown Hero */}
      <div className="flex flex-col items-center text-center max-w-4xl px-6 relative w-full">
        <span className="text-emerald-500 text-lg font-bold tracking-[0.4em] uppercase mb-4">IQOMAH {prayerName} DALAM</span>
        
        {/* Giant Timer Display */}
        <div className="text-[12rem] md:text-[14rem] font-mono font-black text-[#D4AF37] leading-none tracking-tight tabular-nums drop-shadow-[0_10px_30px_rgba(212,175,55,0.2)]">
          {timerStr}
        </div>

        {/* Progress bar simulation based on a standard 10-minute maximum bar or purely display bar */}
        <div className="w-96 h-1.5 bg-zinc-800 rounded-full mt-8 overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000" 
            style={{ width: `${Math.min(100, (secondsLeft / 600) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Adab Reminders cards */}
      <div className="w-full max-w-6xl grid grid-cols-3 gap-6">
        
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl flex flex-col text-left">
          <span className="text-emerald-500 text-xs font-black tracking-widest uppercase mb-2">01. RAPATKAN SHAF</span>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Harap meluruskan dan merapatkan shaf demi kesempurnaan sholat berjamaah.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl flex flex-col text-left">
          <span className="text-emerald-500 text-xs font-black tracking-widest uppercase mb-2">02. SILENCE PRIVATE PHONES</span>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Mohon me-nonaktifkan suara HP Anda agar tidak mengganggu kekhusyukan jamaah lain.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl flex flex-col text-left">
          <span className="text-emerald-500 text-xs font-black tracking-widest uppercase mb-2">03. ADAB MASJID</span>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Menempati baris terdepan yang masih kosong dan memperbanyak dzikir/doa sebelum Iqomah.
          </p>
        </div>

      </div>

    </div>
  );
}
