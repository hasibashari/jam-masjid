'use client';

import { format } from 'date-fns';

interface FullscreenIqomahProps {
  prayerName: string;
  currentTime: Date;
  secondsLeft: number;
  iqomahDuration: number;
  isFriday?: boolean;
  mosqueName?: string;
}

export default function FullscreenIqomah({ 
  prayerName, 
  currentTime, 
  secondsLeft, 
  iqomahDuration, 
  isFriday,
  mosqueName = "Jam Masjid"
}: FullscreenIqomahProps) {
  const isFridayKhutbah = isFriday && prayerName === "Jum'at";

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timerStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = Math.min(100, (secondsLeft / Math.max(1, iqomahDuration)) * 100);

  if (isFridayKhutbah) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0C1814] text-[#F7F5F0] flex flex-col items-center justify-between px-[3vw] py-[2.5vh] select-none animate-fade-in overflow-hidden">
        
        {/* Decorative top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[0.5vh] bg-gradient-to-r from-emerald-500 via-amber-500 to-[#D4AF37]"></div>

        {/* Ambient Background Gold/Green Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-emerald-500/5 blur-[12vw]"></div>
          <div className="absolute top-1/3 left-1/4 w-[40vw] h-[40vh] rounded-full bg-[#D4AF37]/5 blur-[10vw]"></div>
        </div>

        {/* Top Header */}
        <div className="w-full flex justify-between items-center border-b border-[#9BB1A5]/25 pb-[1.5vh]">
          <div>
            <span className="text-[#9BB1A5] font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">{mosqueName}</span>
            <span className="font-black text-[#D4AF37] tracking-tight text-[1.6vw]">KHUTBAH JUM&apos;AT</span>
          </div>
          <div className="text-right">
            <span className="text-[#9BB1A5] font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">Waktu Saat Ini</span>
            <span className="font-bold font-mono tracking-tight text-[#F7F5F0] text-[1.6vw]">{format(currentTime, 'HH:mm:ss')}</span>
          </div>
        </div>

        {/* Center Panel - Serene and Grand Design */}
        <div className="flex flex-col items-center text-center relative flex-1 justify-center w-[75vw] max-w-5xl mx-auto gap-[3vh]">
          
          <div className="flex items-center justify-center bg-[#11221D]/90 border border-[#9BB1A5]/25 rounded-full px-6 py-2 backdrop-blur">
            <span className="text-[#D4AF37] font-black tracking-[0.3em] uppercase text-[0.9vw]">
              🔊 KHUTBAH SEDANG BERLANGSUNG
            </span>
          </div>

          <h2 className="font-black tracking-tight text-[#F7F5F0] leading-tight font-serif text-[2.6vw]">
            Harap Tenang & Menyimak Khutbah
          </h2>

          <div className="bg-[#11221D]/55 border border-[#9BB1A5]/20 rounded-3xl p-[1.8vw] backdrop-blur shadow-2xl relative">
            {/* Elegant Quotation Mark Decor */}
            <div className="absolute -top-6 left-8 text-emerald-500/20 font-serif text-8xl pointer-events-none select-none">“</div>
            
            <p className="text-[#F7F5F0] font-serif font-semibold italic leading-relaxed text-[1.1vw] px-4">
              “Jika kamu berkata kepada temanmu pada hari Jumat, ‘Diamlah!’ sewaktu imam berkhotbah, berarti kamu telah berbuat sia-sia.”
            </p>
            <div className="mt-[1.5vh] text-[#D4AF37] font-bold tracking-wider text-[0.85vw] uppercase">
              — HR. Bukhari & Muslim
            </div>
          </div>
        </div>

        {/* Adab Reminders for Friday Khutbah */}
        <div className="w-full grid grid-cols-3 gap-[2vw]">
          <div className="bg-[#11221D]/80 border border-[#9BB1A5]/25 rounded-xl flex flex-col text-left px-[1.5vw] py-[1.5vh] backdrop-blur">
            <span className="text-[#D4AF37] font-black tracking-widest uppercase mb-[0.7vh] text-[0.85vw]">01. DIAM & MENYIMAK</span>
            <p className="text-[#7E9086] leading-relaxed text-[0.95vw]">
              Dilarang berbicara, berbisik, atau menegur orang lain saat khatib berkhutbah agar pahala Jum&apos;at sempurna.
            </p>
          </div>

          <div className="bg-[#11221D]/80 border border-[#9BB1A5]/25 rounded-xl flex flex-col text-left px-[1.5vw] py-[1.5vh] backdrop-blur">
            <span className="text-[#D4AF37] font-black tracking-widest uppercase mb-[0.7vh] text-[0.85vw]">02. SENYAPKAN HP</span>
            <p className="text-[#7E9086] leading-relaxed text-[0.95vw]">
              Pastikan suara gawai/HP dinonaktifkan sepenuhnya agar tidak mengalihkan kekhusyukan jamaah.
            </p>
          </div>

          <div className="bg-[#11221D]/80 border border-[#9BB1A5]/25 rounded-xl flex flex-col text-left px-[1.5vw] py-[1.5vh] backdrop-blur">
            <span className="text-[#D4AF37] font-black tracking-widest uppercase mb-[0.7vh] text-[0.85vw]">03. TETAP FOKUS</span>
            <p className="text-[#7E9086] leading-relaxed text-[0.95vw]">
              Hindari melakukan perbuatan sia-sia seperti memainkan sajadah, tasbih, atau barang lainnya.
            </p>
          </div>
        </div>

      </div>
    );
  }

  // Fallback to standard Iqomah screen for other sholat/days
  return (
    <div className="fixed inset-0 z-50 bg-[#0C1814] text-[#F7F5F0] flex flex-col items-center justify-between px-[3vw] py-[2.5vh] select-none animate-fade-in overflow-hidden">

      {/* Decorative top border glow */}
      <div className="absolute top-0 left-0 right-0 h-[0.5vh] bg-gradient-to-r from-emerald-500 via-sky-500 to-[#D4AF37]"></div>

      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vh] rounded-full bg-[#D4AF37]/5 blur-[10vw]"></div>
      </div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-center border-b border-[#9BB1A5]/25 pb-[1.5vh]">
        <div>
          <span className="text-[#9BB1A5] font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">Status Masjid</span>
          <span className="font-black text-white tracking-tight text-[1.6vw]">HITUNG MUNDUR IQOMAH</span>
        </div>
        <div className="text-right">
          <span className="text-[#9BB1A5] font-black tracking-[0.3em] uppercase block mb-[0.3vh] text-[0.75vw]">Waktu Saat Ini</span>
          <span className="font-bold font-mono tracking-tight text-[#9BB1A5] text-[1.6vw]">{format(currentTime, 'HH:mm:ss')}</span>
        </div>
      </div>

      {/* Center Countdown Hero */}
      <div className="flex flex-col items-center text-center relative flex-1 justify-center w-full">

        {/* Sub-label "IQOMAH ... DALAM" */}
        <span className="text-[#9BB1A5] font-black tracking-[0.4em] uppercase mb-[1vh] text-[1.4vw]">
          IQOMAH {prayerName} DALAM
        </span>

        {/* Giant Timer — hero utama, terbaca dari 15 meter */}
        <div
          className="font-mono font-black text-[#D4AF37] leading-none tracking-tight tabular-nums"
          style={{
            fontSize: 'clamp(5rem, 14vw, 20rem)',
            textShadow: '0 0 5vw rgba(212,175,55,0.2)',
          }}
        >
          {timerStr}
        </div>

        {/* Dynamic Progress Bar — lebih tebal & lebar agar terlihat di TV besar */}
        <div className="mt-[2vh] rounded-full overflow-hidden bg-zinc-800" style={{ width: '45vw', height: '1.2vh' }}>
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>
      </div>

      {/* Adab Reminders — 3 card grid, teks cukup besar */}
      <div className="w-full grid grid-cols-3 gap-[2vw]">

        <div className="bg-[#11221D]/80 border border-[#9BB1A5]/25 rounded-xl flex flex-col text-left px-[1.5vw] py-[1.5vh]">
          <span className="text-[#9BB1A5] font-black tracking-widest uppercase mb-[0.7vh] text-[0.85vw]">01. RAPATKAN SHAF</span>
          <p className="text-[#7E9086] leading-relaxed text-[1vw]">
            Harap meluruskan dan merapatkan shaf demi kesempurnaan sholat berjamaah.
          </p>
        </div>

        <div className="bg-[#11221D]/80 border border-[#9BB1A5]/25 rounded-xl flex flex-col text-left px-[1.5vw] py-[1.5vh]">
          <span className="text-[#9BB1A5] font-black tracking-widest uppercase mb-[0.7vh] text-[0.85vw]">02. SENYAPKAN HP</span>
          <p className="text-[#7E9086] leading-relaxed text-[1vw]">
            Mohon me-nonaktifkan suara HP Anda agar tidak mengganggu kekhusyukan jamaah lain.
          </p>
        </div>

        <div className="bg-[#11221D]/80 border border-[#9BB1A5]/25 rounded-xl flex flex-col text-left px-[1.5vw] py-[1.5vh]">
          <span className="text-[#9BB1A5] font-black tracking-widest uppercase mb-[0.7vh] text-[0.85vw]">03. ADAB MASJID</span>
          <p className="text-[#7E9086] leading-relaxed text-[1vw]">
            Menempati baris terdepan yang masih kosong dan memperbanyak dzikir/doa sebelum Iqomah.
          </p>
        </div>

      </div>

    </div>
  );
}
