import { prisma } from '@/shared/lib/db';
import { FALLBACK_ANNOUNCEMENTS, AnnouncementType } from '@/shared/types';

export async function getAnnouncementsService(): Promise<AnnouncementType[]> {
  if (!process.env.DATABASE_URL) {
    return FALLBACK_ANNOUNCEMENTS;
  }
  
  try {
    const announcements = await prisma.announcement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!announcements.length) return FALLBACK_ANNOUNCEMENTS;
    return announcements;
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
