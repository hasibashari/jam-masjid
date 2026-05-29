'use client';

import { AnnouncementType } from '@/shared/types';

interface RunningAnnouncementsProps {
  announcements: AnnouncementType[];
}

export default function RunningAnnouncements({ announcements }: RunningAnnouncementsProps) {
  if (announcements.length === 0) return null;

  return (
    <footer className="flex-none h-[6vh] bg-[#0C1814] border-t border-[#9BB1A5]/25 flex items-center overflow-hidden w-full shadow-2xl relative z-20">
      <div className="bg-[#D4AF37] h-full flex items-center px-[2vw] font-black text-[clamp(0.8rem,1.5vh,1.1rem)] tracking-widest text-zinc-950 shrink-0 shadow-[8px_0_24px_rgba(0,0,0,0.4)] z-10 uppercase">
        ⚡ INFO & PENGUMUMAN
      </div>
      <div className="running-text-container h-full flex-grow flex items-center relative overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12 lg:gap-16 xl:gap-24 text-[clamp(0.9rem,1.8vh,1.3rem)] font-bold text-emerald-50 leading-none uppercase tracking-wide">
          {/* Original scrolling content */}
          <div className="flex gap-12 lg:gap-16 xl:gap-24 shrink-0 items-center">
            {announcements.map(ann => (
              <span key={ann.id} className="flex items-center gap-4">
                <span className="text-[#D4AF37] text-[clamp(1rem,2vh,1.4rem)] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">✦</span>
                <span>{ann.text}</span>
              </span>
            ))}
          </div>
          {/* Exact duplicate for seamless infinite scrolling loop effect */}
          <div className="flex gap-12 lg:gap-16 xl:gap-24 shrink-0 items-center" aria-hidden="true">
            {announcements.map(ann => (
              <span key={`dup-${ann.id}`} className="flex items-center gap-4">
                <span className="text-[#D4AF37] text-[clamp(1rem,2vh,1.4rem)] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">✦</span>
                <span>{ann.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
