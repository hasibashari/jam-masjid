'use client';

import { format } from 'date-fns';

interface FullscreenIqomahProps {
  prayerName: string;
  currentTime: Date;
  secondsLeft: number;
  iqomahDuration: number;
}

export default function FullscreenIqomah({ prayerName, currentTime, secondsLeft, iqomahDuration }: FullscreenIqomahProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = Math.min(100, (secondsLeft / Math.max(1, iqomahDuration)) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-[#041a1a] text-white flex flex-col items-center justify-between px-[3vw] py-[2.5vh] select-none animate-fade-in overflow-hidden">

      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[0.5vh] bg-gradient-to-r from-emerald-500 via-sky-500 to-[#D4AF37]"></div>

      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] rounded-full bg-[#D4AF37]/5 blur-[10vw]"></div>
      </div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-center border-b border-zinc-800 pb-[1.5vh]">
        <div>
          <span className="text-emerald-400 font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[1.4vw]">Status Masjid</span>
          <span className="font-black text-white tracking-tight text-[3vw]">HITUNG MUNDUR IQOMAH</span>
        </div>
        <div className="text-right">
          <span className="text-emerald-400 font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[1.4vw]">Waktu Saat Ini</span>
          <span className="font-bold font-mono tracking-tight text-emerald-400 text-[3vw]">{format(currentTime, 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Center Countdown Hero */}
      <div className="flex flex-col items-center text-center relative flex-1 justify-center w-full">

        {/* Sub-label "IQOMAH ... DALAM" */}
        <span className="text-emerald-500 font-bold tracking-[0.4em] uppercase mb-[1vh] text-[2vw]">
          IQOMAH {prayerName} DALAM
        </span>

        {/* Giant Timer — hero utama, terbaca dari 15 meter */}
        <div
          className="font-mono font-black text-[#D4AF37] leading-none tracking-tight tabular-nums"
          style={{
            fontSize: 'clamp(6rem, 22vw, 34rem)',
            textShadow: '0 0 8vw rgba(212,175,55,0.25)',
          }}
        >
          {timerStr}
        </div>

        {/* Dynamic Progress Bar — lebih tebal & lebar agar terlihat di TV besar */}
        <div className="mt-[2vh] rounded-full overflow-hidden bg-zinc-800" style={{ width: '55vw', height: '1.2vh' }}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Adab Reminders — 3 card grid, teks cukup besar */}
      <div className="w-full grid grid-cols-3 gap-[2vw]">

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[1.5vw] flex flex-col text-left px-[2vw] py-[2vh]">
          <span className="text-emerald-500 font-black tracking-widest uppercase mb-[0.7vh] text-[1.1vw]">01. RAPATKAN SHAF</span>
          <p className="text-zinc-400 leading-relaxed text-[1.4vw]">
            Harap meluruskan dan merapatkan shaf demi kesempurnaan sholat berjamaah.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[1.5vw] flex flex-col text-left px-[2vw] py-[2vh]">
          <span className="text-emerald-500 font-black tracking-widest uppercase mb-[0.7vh] text-[1.1vw]">02. SENYAPKAN HP</span>
          <p className="text-zinc-400 leading-relaxed text-[1.4vw]">
            Mohon me-nonaktifkan suara HP Anda agar tidak mengganggu kekhusyukan jamaah lain.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-[1.5vw] flex flex-col text-left px-[2vw] py-[2vh]">
          <span className="text-emerald-500 font-black tracking-widest uppercase mb-[0.7vh] text-[1.1vw]">03. ADAB MASJID</span>
          <p className="text-zinc-400 leading-relaxed text-[1.4vw]">
            Menempati baris terdepan yang masih kosong dan memperbanyak dzikir/doa sebelum Iqomah.
          </p>
        </div>

      </div>

    </div>
  );
}
