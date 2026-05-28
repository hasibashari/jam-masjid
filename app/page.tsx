import TvDisplay from '@/features/prayer-times/components/TvDisplay';
import { getSettingsService } from '@/features/settings/services/getSettings';
import { getAnnouncementsService } from '@/features/announcements/services/getAnnouncements';
import { getQuotesService } from '@/features/quotes/services/getQuotes';

export default async function Page() {
  const settings = await getSettingsService();
  const announcements = await getAnnouncementsService();
  const quotes = await getQuotesService();
  
  return (
    <TvDisplay 
      initialSettings={settings} 
      initialAnnouncements={announcements} 
      initialQuotes={quotes}
    />
  );
}
