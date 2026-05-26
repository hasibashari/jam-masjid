export interface AppSettings {
  id?: string;
  mosqueName: string;
  latitude: number;
  longitude: number;
  calculationMethod: number;
  adzanDuration: number;
  iqomahDuration: number;
  prayerDuration: number;
  displayActive: boolean;
  displayStart: string;
  displayEnd: string;
  backgroundImage?: string | null;
  backgroundActive?: boolean;
}

export interface AnnouncementType {
  id: string;
  text: string;
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
  latitude: -6.2088, // Default Jakarta (more suitable for ID user context)
  longitude: 106.8456,
  calculationMethod: 20, // Kemenag (Kementerian Agama RI) Indonesian default
  adzanDuration: 180, // 3 minutes
  iqomahDuration: 600, // 10 minutes
  prayerDuration: 900, // 15 minutes
  displayActive: true,
  displayStart: "03:00",
  displayEnd: "23:00",
  backgroundImage: null,
  backgroundActive: false
};

export const FALLBACK_ANNOUNCEMENTS: AnnouncementType[] = [
  { id: '1', text: 'Selamat Datang di Jam Masjid Digital. Silakan kelola pengumuman melalui Panel Admin.', active: true },
  { id: '2', text: 'Mohon menonaktifkan atau menyamarkan suara HP Anda selama ibadah sholat berlangsung.', active: true },
  { id: '3', text: 'Mari luruskan dan rapatkan shof sholat demi kesempurnaan sholat berjamaah.', active: true }
];
