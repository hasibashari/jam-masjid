import { NextRequest, NextResponse } from 'next/server';
import { bannersDb } from '@/shared/lib/db';
import { BannerType } from '@/shared/types';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const FALLBACK_BANNERS: BannerType[] = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const getAll = searchParams.get('all') === 'true';

  try {
    const banners = await bannersDb.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // If the database has no banners at all (unseeded), return the mock fallback banners
    if (banners.length === 0) {
      return NextResponse.json([]);
    }
    
    if (getAll) {
      return NextResponse.json(banners);
    }
    
    return NextResponse.json(banners.filter(b => b.active));
  } catch (error) {
    console.error("Failed to fetch banners", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const activeStr = formData.get('active') as string | null;
    const autoHideAfterStr = formData.get('autoHideAfter') as string | null;
    const remoteImageUrl = formData.get('imageUrl') as string | null;
    const file = formData.get('file') as File | null;

    const active = activeStr !== null ? activeStr === 'true' : undefined;
    const autoHideAfter = autoHideAfterStr !== null ? parseInt(autoHideAfterStr) : undefined;

    // Enforce required fields ONLY on creation
    if (!id && (!title || (!remoteImageUrl && (!file || file.size === 0)))) {
      return NextResponse.json({ error: "Title and either image file or URL are required for new banners" }, { status: 400 });
    }

    let finalImageUrl = remoteImageUrl || '';

    // Handle Image File Upload if present
    if (file && file.size > 0) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: "File must be an image" }, { status: 400 });
      }
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Max image size is 2MB" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `banner-${randomUUID()}.${ext}`;
      const path = join(uploadsDir, filename);

      await writeFile(path, buffer);
      finalImageUrl = `/uploads/${filename}`;
    }

    let result;
    if (id) {
      // Fetch existing banner details to clear previous local uploads if necessary
      const allBanners = await bannersDb.findMany();
      const existing = allBanners.find((b: any) => b.id === id);

      // If we uploaded a new file and the old one was local, delete the old file
      if (file && file.size > 0 && existing && existing.imageUrl && existing.imageUrl.startsWith('/uploads/')) {
        const oldFilePath = join(process.cwd(), 'public', existing.imageUrl);
        if (existsSync(oldFilePath)) {
          try {
            await unlink(oldFilePath);
          } catch (e) {
            console.error("Failed to delete old banner file:", e);
          }
        }
      }

      const data: any = {};
      if (title !== null) data.title = title;
      if (finalImageUrl !== '') data.imageUrl = finalImageUrl;
      if (description !== null) data.description = description;
      if (active !== undefined) data.active = active;
      if (autoHideAfter !== undefined) data.autoHideAfter = autoHideAfter;

      result = await bannersDb.update({
        where: { id },
        data
      });
    } else {
      // Create
      result = await bannersDb.create({
        data: {
          title: title || 'Poster',
          imageUrl: finalImageUrl,
          description: description ?? "",
          active: active !== undefined ? active : true,
          autoHideAfter: autoHideAfter !== undefined ? autoHideAfter : 15
        }
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error saving banner:", error);
    return NextResponse.json({ error: "Database operation failed: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Missing banner ID" }, { status: 400 });
    }

    // Delete local physical file if it exists
    const allBanners = await bannersDb.findMany();
    const existing = allBanners.find((b: any) => b.id === id);

    if (existing && existing.imageUrl && existing.imageUrl.startsWith('/uploads/')) {
      const filePath = join(process.cwd(), 'public', existing.imageUrl);
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
        } catch (e) {
          console.error("Failed to delete banner file:", e);
        }
      }
    }

    await bannersDb.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return NextResponse.json({ error: "Failed to delete: " + error.message }, { status: 500 });
  }
}
