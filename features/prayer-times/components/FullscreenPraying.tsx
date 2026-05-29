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
    <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col items-center justify-between px-[3vw] py-[2.5vh] select-none animate-fade-in overflow-hidden">

      {/* Subtle top border — minimalis agar tidak mengganggu kekhusyukan */}
      <div className="absolute top-0 left-0 right-0 h-[0.3vh] bg-zinc-900"></div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-center border-b border-zinc-900 pb-[1.5vh]">
        <div>
          <span className="text-zinc-600 font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">Status Masjid</span>
          <span className="font-black text-rose-500 tracking-tight text-[1.6vw]">SHOLAT BERLANGSUNG</span>
        </div>
        <div className="text-right">
          <span className="text-zinc-600 font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">Waktu</span>
          <span className="font-bold font-mono text-zinc-500 text-[1.6vw]">{format(currentTime, 'HH:mm')}</span>
        </div>
      </div>

      {/* Central Serene Message */}
      <div className="flex flex-col items-center text-center flex-1 justify-center w-full px-[4vw]">

        {/* Large Silent Motif — diperbesar agar menjadi focal point */}
        <div
          className="mb-[3vh] border border-zinc-800 rounded-full flex items-center justify-center relative"
          style={{ width: '6vw', height: '6vw' }}
        >
          <div
            className="border-2 border-dashed border-rose-500 rounded-full animate-ping absolute"
            style={{ width: '3.5vw', height: '3.5vw' }}
          ></div>
          <div
            className="bg-rose-500 rounded-full"
            style={{ width: '1.8vw', height: '1.8vw' }}
          ></div>
        </div>

        {/* Label kecil di atas judul utama */}
        <span className="text-[#D4AF37] font-bold tracking-[0.5em] uppercase mb-[1.5vh] text-[1.4vw]">
          MOHON HARAP TENANG
        </span>

        {/* Judul utama — hero, terbaca dari 15 meter */}
        <h1
          className="font-black tracking-tighter text-white uppercase leading-none mb-[2vh]"
          style={{ fontSize: 'clamp(2rem, 5vw, 8rem)' }}
        >
          TEGAKKAN SHOLAT<br />DENGAN KHUSYUK
        </h1>

        {/* Divider */}
        <div className="bg-zinc-900 mb-[2vh]" style={{ height: '2px', width: '10vw' }}></div>

        {/* Keterangan nama sholat */}
        <p className="text-zinc-500 font-medium tracking-wide uppercase text-[1.2vw]">
          Sedang melaksanakan ibadah sholat fardhu berjamaah{' '}
          <span className="text-emerald-500 font-extrabold">{prayerName}</span>
        </p>
      </div>

      {/* Bottom Status — peringatan HP, cukup besar terbaca dari jauh */}
      <div className="w-full flex flex-col items-center border-t border-zinc-950 pt-[1.5vh]">
        <span className="text-zinc-600 font-black tracking-[0.3em] uppercase mb-[0.5vh] text-[0.85vw]">
          Pemberitahuan Khusus
        </span>
        <div className="text-zinc-400 font-sans tracking-tight font-medium text-[1.4vw]">
          MOHON NON-AKTIFKAN / SILENT HP
        </div>
        <div className="font-mono text-zinc-600 mt-[0.5vh] text-[1vw]">
          Estimasi Durasi Selesai: {timerStr}
        </div>
      </div>

    </div>
  );
}
