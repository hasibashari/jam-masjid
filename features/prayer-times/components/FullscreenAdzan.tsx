'use client';

import { format } from 'date-fns';

interface FullscreenAdzanProps {
  prayerName: string;
  currentTime: Date;
  secondsLeft: number;
}

export default function FullscreenAdzan({ prayerName, currentTime, secondsLeft }: FullscreenAdzanProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#051c0f] text-white flex flex-col items-center justify-between p-12 select-none animate-fade-in">
      
      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-emerald-500"></div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-center max-w-7xl border-b border-emerald-500/20 pb-6">
        <div>
          <span className="text-emerald-400 text-sm font-black tracking-[0.3em] uppercase block mb-1">Status Masjid</span>
          <span className="text-3xl font-black text-[#D4AF37] tracking-tight">KUMANDANG ADZAN</span>
        </div>
        <div className="text-right">
          <span className="text-emerald-400 text-sm font-black tracking-[0.3em] uppercase block mb-1">Waktu</span>
          <span className="text-3xl font-bold font-mono">{format(currentTime, 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Center Hero Information */}
      <div className="flex flex-col items-center text-center max-w-4xl px-6 relative">
        {/* Background Islamic Geometric Centerpiece */}
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none -z-10 animate-spin-slow">
          <div className="w-96 h-96 border-4 border-dashed border-emerald-500 rounded-full flex items-center justify-center">
            <div className="w-80 h-80 border-4 border-emerald-500 rounded-full"></div>
          </div>
        </div>

        <span className="text-emerald-400 text-2xl font-black tracking-[0.4em] uppercase mb-4 animate-pulse">ADZAN SEDANG BERKUMANDANG</span>
        <h1 className="text-8xl md:text-9xl font-black text-[#D4AF37] tracking-tighter uppercase drop-shadow-[0_5px_15px_rgba(3,78,38,0.5)] mb-8">
          {prayerName}
        </h1>

        <p className="text-zinc-300 text-xl font-serif italic max-w-2xl leading-relaxed border-t border-b border-white/5 py-4">
          &quot;Apabila adzan dikumandangkan, maka setan berpaling sambil bersiul-siul hingga tidak mendengar adzan.&quot; (HR. Bukhari & Muslim)
        </p>
      </div>

      {/* Bottom timer / Next stage */}
      <div className="w-full max-w-3xl flex flex-col items-center select-none bg-emerald-950/40 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur shadow-2xl">
        <span className="text-emerald-400 text-xs font-black tracking-[0.3em] uppercase mb-2">DURASI ADZAN BERLANGSUNG</span>
        <div className="text-7xl font-mono font-black text-emerald-400 tracking-wider tabular-nums">
          {timerStr}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-zinc-400 font-sans tracking-wide">
          <span>Harap tenang during Adzan</span>
          <span>•</span>
          <span>Siapkan diri untuk Sholat Berjamaah</span>
        </div>
      </div>

    </div>
  );
}
