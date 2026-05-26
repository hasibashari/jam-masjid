import { prisma } from '@/shared/lib/db';
import { FALLBACK_SETTINGS, AppSettings } from '@/shared/types';

export async function getSettingsService(): Promise<AppSettings> {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return FALLBACK_SETTINGS;
    return settings;
  } catch (error: any) {
    // P2021: Table does not exist in the current database
    // P1001: Can't reach database server
    if (error?.code === 'P2021' || error?.code === 'P1001') {
      return FALLBACK_SETTINGS;
    }
    console.error("Failed to fetch settings from DB, using fallback", error);
    return FALLBACK_SETTINGS;
  }
}
