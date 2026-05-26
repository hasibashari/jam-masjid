import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/db';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string;

    const currentSettings = await prisma.settings.findFirst();
    if (!currentSettings) {
      return NextResponse.json({ error: "Settings not initialized" }, { status: 400 });
    }

    if (action === 'toggle') {
      const active = formData.get('active') === 'true';
      const saved = await prisma.settings.update({
        where: { id: currentSettings.id },
        data: { backgroundActive: active }
      });
      return NextResponse.json(saved);
    }

    if (action === 'upload' && file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: "File must be an image" }, { status: 400 });
      }
      
      // Validate file size (e.g. max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Max image size is 5MB" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Delete old file if exists
      if (currentSettings.backgroundImage) {
        if (currentSettings.backgroundImage.startsWith('/uploads/')) {
          const oldFilePath = join(process.cwd(), 'public', currentSettings.backgroundImage);
          if (existsSync(oldFilePath)) {
            try {
              await unlink(oldFilePath);
            } catch (e) {
              console.error("Failed to delete old background file:", e);
            }
          }
        }
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `bg-${randomUUID()}.${ext}`;
      const path = join(uploadsDir, filename);

      await writeFile(path, buffer);

      const fileUrl = `/uploads/${filename}`;

      const saved = await prisma.settings.update({
        where: { id: currentSettings.id },
        data: { 
          backgroundImage: fileUrl,
          backgroundActive: true
        }
      });

      return NextResponse.json(saved);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Background update error:", error);
    return NextResponse.json({ error: "Failed: " + error.message }, { status: 500 });
  }
}
