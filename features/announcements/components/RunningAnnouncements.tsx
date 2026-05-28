'use client';

import { AnnouncementType } from '@/shared/types';

interface RunningAnnouncementsProps {
  announcements: AnnouncementType[];
}

export default function RunningAnnouncements({ announcements }: RunningAnnouncementsProps) {
  if (announcements.length === 0) return null;

  return (
    <footer className="flex-none h-[80px] bg-black/40 border-t border-white/5 flex items-center overflow-hidden w-full">
      <div className="bg-emerald-700 h-full flex items-center px-10 font-black text-sm tracking-widest text-white shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.3)] z-10">
        INFO & PENGUMUMAN
      </div>
      <div className="running-text-container h-full flex-grow flex items-center relative overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-12 text-2xl font-medium text-white/90 leading-none uppercase">
          {/* Original scrolling content */}
          <div className="flex gap-12 shrink-0">
            {announcements.map(ann => (
              <span key={ann.id}>• {ann.text}</span>
            ))}
          </div>
          {/* Exact duplicate for seamless infinite scrolling loop effect */}
          <div className="flex gap-12 shrink-0" aria-hidden="true">
            {announcements.map(ann => (
              <span key={`dup-${ann.id}`}>• {ann.text}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
