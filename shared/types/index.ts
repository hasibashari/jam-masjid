export interface AppSettings {
  id?: string;
  mosqueName: string;
  mosqueAddress: string;
  latitude: number;
  longitude: number;
  calculationMethod: number;
  adzanDuration: number;
  iqomahDuration: number;
  prayerDuration: number;
  backgroundImage?: string | null;
  backgroundActive?: boolean;
  // display sleep configuration removed
  iqomahFajr: number;
  iqomahDhuhr: number;
  iqomahAsr: number;
  iqomahMaghrib: number;
  iqomahIsha: number;
  adzanAudioActive: boolean;
  adzanAudioUrl: string;
  adzanAudioVolume: number;
  adjustImsak: number;
  adjustFajr: number;
  adjustSunrise: number;
  adjustDhuhr: number;
  adjustAsr: number;
  adjustMaghrib: number;
  adjustIsha: number;
  tahrimAudioActive: boolean;
  tahrimAudioUrl: string;
  tahrimDuration: number; // in minutes before Fajr
}

export interface AnnouncementType {
  id: string;
  text: string;
  active: boolean;
}

export interface QuoteType {
  id: string;
  text: string;
  source: string;
  active: boolean;
}

export interface BannerType {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  active: boolean;
  autoHideAfter: number; // in seconds
  createdAt?: string | Date;
}

export const FALLBACK_SETTINGS: AppSettings = {
  mosqueName: "Jam Masjid Al-Hikmah",
  mosqueAddress: "Jl. Jenderal Sudirman No. 1, Jakarta",
  latitude: -6.2088, // Default Jakarta (more suitable for ID user context)
  longitude: 106.8456,
  calculationMethod: 20, // Kemenag (Kementerian Agama RI) Indonesian default
  adzanDuration: 180, // 3 minutes
  iqomahDuration: 600, // 10 minutes
  prayerDuration: 900, // 15 minutes
  backgroundImage: null,
  backgroundActive: false,
  iqomahFajr: 600,
  iqomahDhuhr: 480,
  iqomahAsr: 480,
  iqomahMaghrib: 420,
  iqomahIsha: 600,
  adzanAudioActive: true,
  adzanAudioUrl: "https://www.islamcan.com/audio/adhan/azan1.mp3",
  adzanAudioVolume: 0.8,
  adjustImsak: 0,
  adjustFajr: 0,
  adjustSunrise: 0,
  adjustDhuhr: 0,
  adjustAsr: 0,
  adjustMaghrib: 0,
  adjustIsha: 0,
  tahrimAudioActive: false,
  tahrimAudioUrl: "https://archive.org/download/tarhim-subuh/tarhim-subuh.mp3",
  tahrimDuration: 10
};

export const FALLBACK_ANNOUNCEMENTS: AnnouncementType[] = [
  { id: '1', text: 'Selamat Datang di Jam Masjid Digital. Silakan kelola pengumuman melalui Panel Admin.', active: true },
  { id: '2', text: 'Mohon menonaktifkan atau menyamarkan suara HP Anda selama ibadah sholat berlangsung.', active: true },
  { id: '3', text: 'Mari luruskan dan rapatkan shof sholat demi kesempurnaan sholat berjamaah.', active: true }
];

export const PRAYER_TRANSLATIONS: Record<string, string> = {
  Imsak: 'Imsak',
  Fajr: 'Subuh',
  Sunrise: 'Syuruq',
  Dhuhr: 'Dzuhur',
  Asr: 'Ashar',
  Maghrib: 'Maghrib',
  Isha: 'Isya'
};
