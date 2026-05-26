import TvDisplay from '@/features/prayer-times/components/TvDisplay';
import { getSettingsService } from '@/features/settings/services/getSettings';
import { getAnnouncementsService } from '@/features/announcements/services/getAnnouncements';

export default async function Page() {
  const settings = await getSettingsService();
  const announcements = await getAnnouncementsService();
  
  return (
    <TvDisplay 
      initialSettings={settings} 
      initialAnnouncements={announcements} 
    />
  );
}
