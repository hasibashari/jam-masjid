import { AnnouncementType } from '@/shared/types';

interface TimelineObj {
  Maghrib: Date;
  [key: string]: Date;
}

/**
 * Computes dynamic fasting-related announcements based on the current
 * Gregorian day-of-week and Hijri date.
 *
 * Pure utility — no side effects, no React state.
 *
 * @param currentTime  - The active (possibly timezone-adjusted) Date
 * @param timelineObj  - Prayer time Date objects for the current day
 * @param active       - Whether fasting reminder is enabled in settings
 */
export function computeFastingAnnouncements(
  currentTime: Date,
  timelineObj: TimelineObj,
  active: boolean,
): AnnouncementType[] {
  if (!active) return [];

  const announcements: AnnouncementType[] = [];
  const dayOfWeek = currentTime.getDay();

  // --- Monday / Thursday sunnah fasting reminders ---
  if (dayOfWeek === 0) {
    // Sunday: remind about tomorrow (Monday)
    announcements.push({
      id: 'fasting-mon-tomorrow',
      text: '🔔 Pengingat: Besok hari Senin, mari bersiap menjalankan ibadah Puasa Sunnah Senin.',
      active: true,
    });
  } else if (dayOfWeek === 1) {
    // Monday
    announcements.push({
      id: 'fasting-mon-today',
      text: '✨ Hari ini: Puasa Sunnah Senin. Selamat menjalankan ibadah puasa, semoga berkah bagi kita semua.',
      active: true,
    });
  } else if (dayOfWeek === 3) {
    // Wednesday: remind about tomorrow (Thursday)
    announcements.push({
      id: 'fasting-thu-tomorrow',
      text: '🔔 Pengingat: Besok hari Kamis, mari bersiap menjalankan ibadah Puasa Sunnah Kamis.',
      active: true,
    });
  } else if (dayOfWeek === 4) {
    // Thursday
    announcements.push({
      id: 'fasting-thu-today',
      text: '✨ Hari ini: Puasa Sunnah Kamis. Selamat menjalankan ibadah puasa, semoga berkah bagi kita semua.',
      active: true,
    });
  }

  // --- Friday sunnah reminders ---
  const isMalamJumat =
    dayOfWeek === 4 && timelineObj?.Maghrib && currentTime >= timelineObj.Maghrib;
  const isHariJumat =
    dayOfWeek === 5 && timelineObj?.Maghrib && currentTime < timelineObj.Maghrib;

  if (isMalamJumat) {
    announcements.push({
      id: 'friday-sunnah-eve',
      text: "✨ Malam Jum'at: Disunnahkan memperbanyak sholawat kepada Rasulullah ﷺ dan membaca Surah Al-Kahfi.",
      active: true,
    });
  } else if (isHariJumat) {
    announcements.push({
      id: 'friday-sunnah-day',
      text: "🕌 Hari Jum'at Mubarak: Sunnah mandi Jum'at, memakai wewangian, datang awal, dan menyimak khutbah dengan tenang.",
      active: true,
    });
  }

  // --- Ayyamul Bidh (13, 14, 15 Hijriah) reminders ---
  try {
    const hijriAdjusted = new Date(currentTime.getTime());
    if (timelineObj?.Maghrib && currentTime < timelineObj.Maghrib) {
      // Before Maghrib: Hijri day hasn't changed yet
      hijriAdjusted.setDate(hijriAdjusted.getDate() - 1);
    }
    const hijriDayFormatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: 'numeric',
    });
    const formattedDay = hijriDayFormatter.format(hijriAdjusted);
    const hijriDayNum = parseInt(formattedDay.replace(/\D/g, ''), 10);

    if (hijriDayNum === 12) {
      announcements.push({
        id: 'fasting-bidh-tomorrow',
        text: '📅 Pengingat: Besok memasuki tanggal 13 Hijriah. Disunnahkan berpuasa Ayyamul Bidh (13, 14, 15 Hijriah).',
        active: true,
      });
    } else if (hijriDayNum === 13 || hijriDayNum === 14 || hijriDayNum === 15) {
      announcements.push({
        id: `fasting-bidh-today-${hijriDayNum}`,
        text: `✨ Hari ini: Puasa Sunnah Ayyamul Bidh (${hijriDayNum} Hijriah). Selamat menjalankan ibadah puasa.`,
        active: true,
      });
    }
  } catch (e) {
    console.error('Fasting reminder Hijri parser error:', e);
  }

  return announcements;
}
