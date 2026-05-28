import { quotesDb } from '@/shared/lib/db';
import { QuoteType } from '@/shared/types';

export async function getQuotesService(): Promise<QuoteType[]> {
  try {
    const activeQuotes = await quotesDb.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return activeQuotes;
  } catch (error: any) {
    console.error("Failed to fetch quotes from DB, using fallback", error);
    return [];
  }
}
