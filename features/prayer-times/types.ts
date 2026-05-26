export interface PrayerTimesState {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerItem {
  name: string;
  time: Date;
}
