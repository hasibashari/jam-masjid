import { NextRequest, NextResponse } from 'next/server';
import { getSettingsService } from '@/features/settings/services/getSettings';
import { prisma } from '@/shared/lib/db';
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
      latitude,
      longitude,
      calculationMethod,
      adzanDuration,
      iqomahDuration,
      prayerDuration,
      displayActive,
      displayStart,
      displayEnd,
      sandboxActive,
      sandboxTime,
      sandboxStage,
      sandboxSpeed,
    } = body;

    const currentSettings = await prisma.settings.findFirst();

    let savedSettings;
    if (currentSettings) {
      savedSettings = await prisma.settings.update({
        where: { id: currentSettings.id },
        data: {
          mosqueName: mosqueName ?? currentSettings.mosqueName,
          latitude: latitude !== undefined ? parseFloat(latitude) : currentSettings.latitude,
          longitude: longitude !== undefined ? parseFloat(longitude) : currentSettings.longitude,
          calculationMethod: calculationMethod !== undefined ? parseInt(calculationMethod) : currentSettings.calculationMethod,
          adzanDuration: adzanDuration !== undefined ? parseInt(adzanDuration) : currentSettings.adzanDuration,
          iqomahDuration: iqomahDuration !== undefined ? parseInt(iqomahDuration) : currentSettings.iqomahDuration,
          prayerDuration: prayerDuration !== undefined ? parseInt(prayerDuration) : currentSettings.prayerDuration,
          displayActive: displayActive !== undefined ? Boolean(displayActive) : currentSettings.displayActive,
          displayStart: displayStart ?? currentSettings.displayStart,
          displayEnd: displayEnd ?? currentSettings.displayEnd,
          sandboxActive: sandboxActive !== undefined ? Boolean(sandboxActive) : currentSettings.sandboxActive,
          sandboxTime: sandboxTime !== undefined ? sandboxTime : currentSettings.sandboxTime,
          sandboxStage: sandboxStage ?? currentSettings.sandboxStage,
          sandboxSpeed: sandboxSpeed !== undefined ? parseFloat(sandboxSpeed) : currentSettings.sandboxSpeed,
        },
      });
    } else {
      savedSettings = await prisma.settings.create({
        data: {
          mosqueName: mosqueName ?? FALLBACK_SETTINGS.mosqueName,
          latitude: latitude !== undefined ? parseFloat(latitude) : FALLBACK_SETTINGS.latitude,
          longitude: longitude !== undefined ? parseFloat(longitude) : FALLBACK_SETTINGS.longitude,
          calculationMethod: calculationMethod !== undefined ? parseInt(calculationMethod) : FALLBACK_SETTINGS.calculationMethod,
          adzanDuration: adzanDuration !== undefined ? parseInt(adzanDuration) : FALLBACK_SETTINGS.adzanDuration,
          iqomahDuration: iqomahDuration !== undefined ? parseInt(iqomahDuration) : FALLBACK_SETTINGS.iqomahDuration,
          prayerDuration: prayerDuration !== undefined ? parseInt(prayerDuration) : FALLBACK_SETTINGS.prayerDuration,
          displayActive: displayActive !== undefined ? Boolean(displayActive) : FALLBACK_SETTINGS.displayActive,
          displayStart: displayStart ?? FALLBACK_SETTINGS.displayStart,
          displayEnd: displayEnd ?? FALLBACK_SETTINGS.displayEnd,
          sandboxActive: sandboxActive !== undefined ? Boolean(sandboxActive) : false,
          sandboxTime: sandboxTime ?? null,
          sandboxStage: sandboxStage ?? 'AUTO',
          sandboxSpeed: sandboxSpeed !== undefined ? parseFloat(sandboxSpeed) : 1.0,
        },
      });
    }

    return NextResponse.json(savedSettings);
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Failed to save settings: " + error.message }, { status: 500 });
  }
}
