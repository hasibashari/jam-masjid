'use client';

import { AnnouncementType } from '@/shared/types';

interface RunningAnnouncementsProps {
  announcements: AnnouncementType[];
}

export default function RunningAnnouncements({ announcements }: RunningAnnouncementsProps) {
  return (
    <footer className="flex-none h-[80px] bg-black/40 border-t border-white/5 flex items-center overflow-hidden">
      <div className="bg-emerald-700 h-full flex items-center px-10 font-black text-sm tracking-widest text-white shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.3)] z-10">
        INFO & PENGUMUMAN
      </div>
      <div className="running-text-container h-full flex items-center px-6">
        <div className="animate-marquee running-text-content text-2xl font-medium text-white/90 leading-none flex gap-12 uppercase">
          {announcements.map(ann => (
            <span key={ann.id}>• {ann.text}</span>
          ))}
          {/* Duplicate for seamless infinite scrolling loop effect */}
          {announcements.map(ann => (
            <span key={`dup-${ann.id}`}>• {ann.text}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
