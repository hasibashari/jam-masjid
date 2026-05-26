import { prisma } from '@/shared/lib/db';
import { FALLBACK_ANNOUNCEMENTS, AnnouncementType } from '@/shared/types';

export async function getAnnouncementsService(): Promise<AnnouncementType[]> {
  try {
    const allAnnouncements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (allAnnouncements.length === 0) {
      return FALLBACK_ANNOUNCEMENTS;
    }
    
    return allAnnouncements.filter(a => a.active);
  } catch (error: any) {
    // P2021: Table does not exist in the current database
    // P1001: Can't reach database server
    if (error?.code === 'P2021' || error?.code === 'P1001') {
      return FALLBACK_ANNOUNCEMENTS;
    }
    console.error("Failed to fetch announcements from DB, using fallback", error);
    return FALLBACK_ANNOUNCEMENTS;
  }
}
