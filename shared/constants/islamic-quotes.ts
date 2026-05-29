import { QuoteType } from '@/shared/types';

/** Fallback Islamic quotes used by ClockSection when no DB quotes are loaded. */
export const FALLBACK_ISLAMIC_QUOTES: Pick<QuoteType, 'text' | 'source'>[] = [
  {
    text: "Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.",
    source: "QS. Al-Ankabut: 45",
  },
  {
    text: "Shalat berjamaah lebih utama daripada shalat sendirian sebanyak dua puluh tujuh derajat.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Jadikanlah sabar dan shalat sebagai penolongmu. Sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyu'.",
    source: "QS. Al-Baqarah: 45",
  },
  {
    text: "Siapa yang membangun masjid karena Allah, maka Allah akan membangunkan baginya rumah di surga.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Amalan yang paling dicintai oleh Allah adalah shalat pada waktunya.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Dekatnya seorang hamba dengan Tuhannya adalah ketika dia sedang sujud, maka perbanyaklah doa.",
    source: "HR. Muslim",
  },
  {
    text: "Apabila salah seorang di antara kalian masuk masjid, maka kerjakanlah shalat dua rakaat sebelum ia duduk.",
    source: "HR. Bukhari & Muslim",
  },
  {
    text: "Terangilah rumah-rumah kalian dengan shalat dan pembacaan Al-Qur'an.",
    source: "HR. Al-Baihaqi",
  },
];
