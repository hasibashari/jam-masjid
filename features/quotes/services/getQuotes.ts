import { quotesDb } from '@/shared/lib/db';
import { QuoteType } from '@/shared/types';

const FALLBACK_QUOTES: QuoteType[] = [
  { id: '1', text: "Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.", source: "QS. Al-Ankabut: 45", active: true },
  { id: '2', text: "Shalat berjamaah lebih utama daripada shalat sendirian sebanyak dua puluh tujuh derajat.", source: "HR. Bukhari & Muslim", active: true },
  { id: '3', text: "Jadikanlah sabar dan shalat sebagai penolongmu. Sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyu'.", source: "QS. Al-Baqarah: 45", active: true },
  { id: '4', text: "Siapa yang membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga.", source: "HR. Bukhari & Muslim", active: true },
  { id: '5', text: "Amalan yang paling dicintai oleh Allah adalah shalat pada waktunya.", source: "HR. Bukhari & Muslim", active: true },
  { id: '6', text: "Dekatnya seorang hamba dengan Tuhannya adalah ketika dia sedang sujud, maka perbanyaklah doa.", source: "HR. Muslim", active: true },
  { id: '7', text: "Apabila salah seorang di antara kalian masuk masjid, maka kerjakanlah shalat dua rakaat sebelum ia duduk.", source: "HR. Bukhari & Muslim", active: true },
  { id: '8', text: "Terangilah rumah-rumah kalian dengan shalat dan pembacaan Al-Qur'an.", source: "HR. Al-Baihaqi", active: true }
];

export async function getQuotesService(): Promise<QuoteType[]> {
  try {
    const activeQuotes = await quotesDb.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (activeQuotes.length === 0) {
      return FALLBACK_QUOTES;
    }
    
    return activeQuotes;
  } catch (error: any) {
    console.error("Failed to fetch quotes from DB, using fallback", error);
    return FALLBACK_QUOTES;
  }
}
