export interface AudioPreset {
  value: string;
  label: string;
}

export const ADZAN_AUDIO_PRESETS: AudioPreset[] = [
  {
    value: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    label: 'Preset 1. Adzan Mekkah (Suara Merdu Syahdu)',
  },
  {
    value: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
    label: 'Preset 2. Adzan Madinah (Suara Tenang & Khusyuk)',
  },
  {
    value: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
    label: 'Preset 3. Adzan Masjid Al-Aqsa (Tradisional)',
  },
];

export const ADZAN_PRESET_VALUES = ADZAN_AUDIO_PRESETS.map((p) => p.value);

export const TAHRIM_AUDIO_PRESETS: AudioPreset[] = [
  {
    value: 'https://archive.org/download/tarhim-subuh/tarhim-subuh.mp3',
    label: 'Preset 1. Tarhim Klasik (Shaykh Mahmoud Khalil al-Hussary)',
  },
];

export const TAHRIM_PRESET_VALUES = TAHRIM_AUDIO_PRESETS.map((p) => p.value);
