'use client';

import { format } from 'date-fns';

interface FullscreenPrayingProps {
  prayerName: string;
  currentTime: Date;
  secondsLeft: number;
}

export default function FullscreenPraying({ prayerName, currentTime, secondsLeft }: FullscreenPrayingProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col items-center justify-between p-16 select-none animate-fade-in">
      
      {/* Absolute Dark Minimalist Styling for zero distraction in prayer hall */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900"></div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-7xl border-b border-zinc-900 pb-8">
        <div>
          <span className="text-zinc-600 text-xs font-black tracking-[0.3em] uppercase block mb-1">Status Masjid</span>
          <span className="text-2xl font-black text-rose-500 tracking-tight">SHOLAT BERLANGSUNG</span>
        </div>
        <div className="text-right">
          <span className="text-zinc-600 text-xs font-black tracking-[0.3em] uppercase block mb-1">Waktu</span>
          <span className="text-2xl font-bold font-mono text-zinc-500">{format(currentTime, 'HH:mm')}</span>
        </div>
      </div>

      {/* Central Serene Message */}
      <div className="flex flex-col items-center text-center max-w-5xl px-6">
        
        {/* Large Silent Motif */}
        <div className="w-24 h-24 mb-10 border border-zinc-800 rounded-full flex items-center justify-center relative">
          <div className="w-12 h-12 border-2 border-dashed border-rose-500 rounded-full animate-ping absolute"></div>
          <div className="w-6 h-6 bg-rose-500 rounded-full"></div>
        </div>

        <span className="text-[#D4AF37] text-lg font-bold tracking-[0.5em] uppercase mb-4">MOHON HARAP TENANG</span>
        <h1 className="text-[6vw] font-black tracking-tighter text-white uppercase mb-8 leading-none">
          SHOLAT BERKATA KHUSYUK
        </h1>

        <div className="h-0.5 w-40 bg-zinc-900 mb-8"></div>

        <p className="text-zinc-500 text-2xl font-medium tracking-wide uppercase">
           sedang melaksanakan ibadah sholat fardhu berjamaah <span className="text-emerald-500 font-extrabold">{prayerName}</span>
        </p>
      </div>

      {/* Bottom status indicator */}
      <div className="w-full max-w-md flex flex-col items-center select-none py-6 border-t border-zinc-950">
        <span className="text-zinc-600 text-[10px] font-black tracking-[0.3em] uppercase mb-2">Pemberitahuan Khusus</span>
        <div className="text-lg text-zinc-400 font-sans tracking-tight font-medium">
          MOHON NON-AKTIFKAN / SILENT HP
        </div>
        <div className="text-xs text-zinc-600 font-mono mt-3">
          Est. Durasi Utama Selesai: {timerStr}
        </div>
      </div>

    </div>
  );
}
