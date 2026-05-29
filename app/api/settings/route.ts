import { NextRequest, NextResponse } from 'next/server';
import { getSettingsService } from '@/features/settings/services/getSettings';
import { settingsDb } from '@/shared/lib/db';
import { FALLBACK_SETTINGS } from '@/shared/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getSettingsService();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mosqueName,
      mosqueAddress,
      latitude,
      longitude,
      calculationMethod,
      adzanDuration,
      iqomahDuration,
      prayerDuration,
      backgroundImage,
      backgroundActive,
      backgroundImages,
      backgroundSlideshowActive,
      backgroundSlideshowInterval,
      backgroundTransitionEffect,
      iqomahFajr,
      iqomahDhuhr,
      iqomahAsr,
      iqomahMaghrib,
      iqomahIsha,
      adzanAudioActive,
      adzanAudioUrl,
      adzanAudioVolume,
      adjustImsak,
      adjustFajr,
      adjustSunrise,
      adjustDhuhr,
      adjustAsr,
      adjustMaghrib,
      adjustIsha,
      tahrimAudioActive,
      tahrimAudioUrl,
      tahrimDuration,
      fastingReminderActive,
    } = body;

    const currentSettings = await settingsDb.findFirst();

    let savedSettings;
    if (currentSettings) {
      savedSettings = await settingsDb.update({
        where: { id: currentSettings.id },
        data: {
          mosqueName: mosqueName ?? currentSettings.mosqueName,
          mosqueAddress: mosqueAddress ?? currentSettings.mosqueAddress,
          latitude: latitude !== undefined ? parseFloat(latitude) : currentSettings.latitude,
          longitude: longitude !== undefined ? parseFloat(longitude) : currentSettings.longitude,
          calculationMethod: calculationMethod !== undefined ? parseInt(calculationMethod) : currentSettings.calculationMethod,
          adzanDuration: adzanDuration !== undefined ? parseInt(adzanDuration) : currentSettings.adzanDuration,
          iqomahDuration: iqomahDuration !== undefined ? parseInt(iqomahDuration) : currentSettings.iqomahDuration,
          prayerDuration: prayerDuration !== undefined ? parseInt(prayerDuration) : currentSettings.prayerDuration,
          backgroundImage: backgroundImage !== undefined ? backgroundImage : undefined,
          backgroundActive: backgroundActive !== undefined ? Boolean(backgroundActive) : undefined,
          backgroundImages: backgroundImages !== undefined ? backgroundImages : undefined,
          backgroundSlideshowActive: backgroundSlideshowActive !== undefined ? Boolean(backgroundSlideshowActive) : undefined,
          backgroundSlideshowInterval: backgroundSlideshowInterval !== undefined ? parseInt(backgroundSlideshowInterval) : undefined,
          backgroundTransitionEffect: backgroundTransitionEffect !== undefined ? backgroundTransitionEffect : undefined,
          iqomahFajr: iqomahFajr !== undefined ? parseInt(iqomahFajr) : currentSettings.iqomahFajr,
          iqomahDhuhr: iqomahDhuhr !== undefined ? parseInt(iqomahDhuhr) : currentSettings.iqomahDhuhr,
          iqomahAsr: iqomahAsr !== undefined ? parseInt(iqomahAsr) : currentSettings.iqomahAsr,
          iqomahMaghrib: iqomahMaghrib !== undefined ? parseInt(iqomahMaghrib) : currentSettings.iqomahMaghrib,
          iqomahIsha: iqomahIsha !== undefined ? parseInt(iqomahIsha) : currentSettings.iqomahIsha,
          adzanAudioActive: adzanAudioActive !== undefined ? Boolean(adzanAudioActive) : currentSettings.adzanAudioActive,
          adzanAudioUrl: adzanAudioUrl ?? currentSettings.adzanAudioUrl,
          adzanAudioVolume: adzanAudioVolume !== undefined ? parseFloat(adzanAudioVolume) : currentSettings.adzanAudioVolume,
          adjustImsak: adjustImsak !== undefined ? parseInt(adjustImsak) : currentSettings.adjustImsak,
          adjustFajr: adjustFajr !== undefined ? parseInt(adjustFajr) : currentSettings.adjustFajr,
          adjustSunrise: adjustSunrise !== undefined ? parseInt(adjustSunrise) : currentSettings.adjustSunrise,
          adjustDhuhr: adjustDhuhr !== undefined ? parseInt(adjustDhuhr) : currentSettings.adjustDhuhr,
          adjustAsr: adjustAsr !== undefined ? parseInt(adjustAsr) : currentSettings.adjustAsr,
          adjustMaghrib: adjustMaghrib !== undefined ? parseInt(adjustMaghrib) : currentSettings.adjustMaghrib,
          adjustIsha: adjustIsha !== undefined ? parseInt(adjustIsha) : currentSettings.adjustIsha,
          tahrimAudioActive: tahrimAudioActive !== undefined ? Boolean(tahrimAudioActive) : currentSettings.tahrimAudioActive,
          tahrimAudioUrl: tahrimAudioUrl ?? currentSettings.tahrimAudioUrl,
          tahrimDuration: tahrimDuration !== undefined ? parseInt(tahrimDuration) : currentSettings.tahrimDuration,
          fastingReminderActive: fastingReminderActive !== undefined ? Boolean(fastingReminderActive) : currentSettings.fastingReminderActive,
        },
      });
    } else {
      savedSettings = await settingsDb.create({
        data: {
          mosqueName: mosqueName ?? FALLBACK_SETTINGS.mosqueName,
          mosqueAddress: mosqueAddress ?? FALLBACK_SETTINGS.mosqueAddress,
          latitude: latitude !== undefined ? parseFloat(latitude) : FALLBACK_SETTINGS.latitude,
          longitude: longitude !== undefined ? parseFloat(longitude) : FALLBACK_SETTINGS.longitude,
          calculationMethod: calculationMethod !== undefined ? parseInt(calculationMethod) : FALLBACK_SETTINGS.calculationMethod,
          adzanDuration: adzanDuration !== undefined ? parseInt(adzanDuration) : FALLBACK_SETTINGS.adzanDuration,
          iqomahDuration: iqomahDuration !== undefined ? parseInt(iqomahDuration) : FALLBACK_SETTINGS.iqomahDuration,
          prayerDuration: prayerDuration !== undefined ? parseInt(prayerDuration) : FALLBACK_SETTINGS.prayerDuration,
          backgroundImage: backgroundImage ?? null,
          backgroundActive: backgroundActive !== undefined ? Boolean(backgroundActive) : false,
          backgroundImages: backgroundImages ?? [],
          backgroundSlideshowActive: backgroundSlideshowActive !== undefined ? Boolean(backgroundSlideshowActive) : false,
          backgroundSlideshowInterval: backgroundSlideshowInterval !== undefined ? parseInt(backgroundSlideshowInterval) : 10,
          backgroundTransitionEffect: backgroundTransitionEffect ?? 'fade',
          iqomahFajr: iqomahFajr !== undefined ? parseInt(iqomahFajr) : FALLBACK_SETTINGS.iqomahFajr,
          iqomahDhuhr: iqomahDhuhr !== undefined ? parseInt(iqomahDhuhr) : FALLBACK_SETTINGS.iqomahDhuhr,
          iqomahAsr: iqomahAsr !== undefined ? parseInt(iqomahAsr) : FALLBACK_SETTINGS.iqomahAsr,
          iqomahMaghrib: iqomahMaghrib !== undefined ? parseInt(iqomahMaghrib) : FALLBACK_SETTINGS.iqomahMaghrib,
          iqomahIsha: iqomahIsha !== undefined ? parseInt(iqomahIsha) : FALLBACK_SETTINGS.iqomahIsha,
          adzanAudioActive: adzanAudioActive !== undefined ? Boolean(adzanAudioActive) : FALLBACK_SETTINGS.adzanAudioActive,
          adzanAudioUrl: adzanAudioUrl ?? FALLBACK_SETTINGS.adzanAudioUrl,
          adzanAudioVolume: adzanAudioVolume !== undefined ? parseFloat(adzanAudioVolume) : FALLBACK_SETTINGS.adzanAudioVolume,
          adjustImsak: adjustImsak !== undefined ? parseInt(adjustImsak) : FALLBACK_SETTINGS.adjustImsak,
          adjustFajr: adjustFajr !== undefined ? parseInt(adjustFajr) : FALLBACK_SETTINGS.adjustFajr,
          adjustSunrise: adjustSunrise !== undefined ? parseInt(adjustSunrise) : FALLBACK_SETTINGS.adjustSunrise,
          adjustDhuhr: adjustDhuhr !== undefined ? parseInt(adjustDhuhr) : FALLBACK_SETTINGS.adjustDhuhr,
          adjustAsr: adjustAsr !== undefined ? parseInt(adjustAsr) : FALLBACK_SETTINGS.adjustAsr,
          adjustMaghrib: adjustMaghrib !== undefined ? parseInt(adjustMaghrib) : FALLBACK_SETTINGS.adjustMaghrib,
          adjustIsha: adjustIsha !== undefined ? parseInt(adjustIsha) : FALLBACK_SETTINGS.adjustIsha,
          tahrimAudioActive: tahrimAudioActive !== undefined ? Boolean(tahrimAudioActive) : FALLBACK_SETTINGS.tahrimAudioActive,
          tahrimAudioUrl: tahrimAudioUrl ?? FALLBACK_SETTINGS.tahrimAudioUrl,
          tahrimDuration: tahrimDuration !== undefined ? parseInt(tahrimDuration) : FALLBACK_SETTINGS.tahrimDuration,
          fastingReminderActive: fastingReminderActive !== undefined ? Boolean(fastingReminderActive) : FALLBACK_SETTINGS.fastingReminderActive,
        },
      });
    }

    return NextResponse.json(savedSettings);
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings: " + error.message }, { status: 500 });
  }
}
