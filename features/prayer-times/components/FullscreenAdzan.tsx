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
    <div className="fixed inset-0 z-50 bg-[#0C1814] text-[#F7F5F0] flex flex-col items-center justify-between px-[3vw] py-[2.5vh] select-none animate-fade-in overflow-hidden">

      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[0.5vh] bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-emerald-500"></div>

      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-emerald-950/20 blur-[8vw]"></div>
      </div>

      {/* Top Header — cukup besar dibaca dari jarak 10m */}
      <div className="w-full flex justify-between items-center border-b border-[#9BB1A5]/25 pb-[1.5vh]">
        <div>
          <span className="text-[#9BB1A5] font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">Status Masjid</span>
          <span className="font-black text-[#D4AF37] tracking-tight text-[1.6vw]">KUMANDANG ADZAN</span>
        </div>
        <div className="text-right">
          <span className="text-[#9BB1A5] font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">Waktu</span>
          <span className="font-bold font-mono text-[1.6vw]">{format(currentTime, 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Center Hero — dominasi layar, nama sholat sangat besar */}
      <div className="flex flex-col items-center text-center relative flex-1 justify-center w-full">

        {/* Background Geometric Motif */}
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none -z-10 animate-spin-slow">
          <div
            className="border-4 border-dashed border-emerald-500 rounded-full flex items-center justify-center"
            style={{ width: '35vw', height: '35vw' }}
          >
            <div
              className="border-4 border-emerald-500 rounded-full"
              style={{ width: '28vw', height: '28vw' }}
            ></div>
          </div>
        </div>

        {/* Sub-label "ADZAN SEDANG BERKUMANDANG" */}
        <span className="text-[#9BB1A5] font-black tracking-[0.4em] uppercase animate-pulse text-[1.3vw] mb-[1.5vh]">
          ADZAN SEDANG BERKUMANDANG
        </span>

        {/* Nama Sholat — hero utama, terbaca dari 15 meter */}
        <h1
          className="font-black text-[#D4AF37] tracking-tighter uppercase leading-none mb-[2vh]"
          style={{ fontSize: 'clamp(4rem, 10vw, 15rem)', textShadow: '0 0 4vw rgba(212,175,55,0.35)' }}
        >
          {prayerName}
        </h1>

        {/* Hadits Quote */}
        <p className="text-[#F7F5F0] font-serif italic leading-relaxed border-t border-b border-[#9BB1A5]/25 py-[1.5vh] text-[1.1vw] max-w-[60vw]">
          &quot;Apabila adzan dikumandangkan, maka setan berpaling sambil bersiul-siul hingga tidak mendengar adzan.&quot;
          <span className="block mt-[0.5vh] text-[#7E9086] not-italic text-[0.85vw]">(HR. Bukhari &amp; Muslim)</span>
        </p>
      </div>

      {/* Bottom Timer Card */}
      <div className="w-full max-w-[45vw] flex flex-col items-center bg-[#11221D]/90 border border-[#9BB1A5]/25 rounded-2xl px-[3vw] py-[1.5vh] backdrop-blur shadow-2xl">
        <span className="text-[#D4AF37] font-black tracking-[0.3em] uppercase mb-[0.5vh] text-[0.9vw]">
          DURASI ADZAN BERLANGSUNG
        </span>
        <div
          className="font-mono font-black text-[#9BB1A5] tracking-wider tabular-nums leading-none"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 9rem)' }}
        >
          {timerStr}
        </div>
        <div className="mt-[1vh] flex gap-[2vw] text-[#7E9086] font-sans tracking-wide text-[0.85vw]">
          <span>Harap tenang saat Adzan berkumandang</span>
          <span>•</span>
          <span>Siapkan diri untuk Sholat Berjamaah</span>
        </div>
      </div>

    </div>
  );
}
