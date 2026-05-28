import { announcementsDb } from '@/shared/lib/db';
import { AnnouncementType } from '@/shared/types';

export async function getAnnouncementsService(): Promise<AnnouncementType[]> {
  try {
    // Fetch only active announcements directly from the PostgreSQL database
    const activeAnnouncements = await announcementsDb.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return activeAnnouncements;
  } catch (error: any) {
    console.error("Failed to fetch announcements from DB, using fallback", error);
    return [];
  }
}
