import { NextRequest, NextResponse } from 'next/server';
import { settingsDb } from '@/shared/lib/db';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string;

    const currentSettings = await settingsDb.findFirst();
    if (!currentSettings) {
      return NextResponse.json({ error: "Settings not initialized" }, { status: 400 });
    }

    // Toggle entire background visibility
    if (action === 'toggle') {
      const active = formData.get('active') === 'true';
      const saved = await settingsDb.update({
        where: { id: currentSettings.id },
        data: { backgroundActive: active }
      });
      return NextResponse.json(saved);
    }

    // Toggle entire slideshow active status
    if (action === 'toggle-slideshow') {
      const active = formData.get('active') === 'true';
      const saved = await settingsDb.update({
        where: { id: currentSettings.id },
        data: { backgroundSlideshowActive: active }
      });
      return NextResponse.json(saved);
    }

    // Toggle check status of a specific image for slideshow inclusion
    if (action === 'toggle-image') {
      const imgId = formData.get('id') as string;
      const images = Array.isArray(currentSettings.backgroundImages) 
        ? [...currentSettings.backgroundImages] 
        : [];
      
      const updatedImages = images.map((img: any) => {
        if (img.id === imgId) {
          return { ...img, active: !img.active };
        }
        return img;
      });

      const saved = await settingsDb.update({
        where: { id: currentSettings.id },
        data: { backgroundImages: updatedImages }
      });
      return NextResponse.json(saved);
    }

    // Select an image as static background
    if (action === 'select-image') {
      const imgId = formData.get('id') as string;
      const images = Array.isArray(currentSettings.backgroundImages) 
        ? currentSettings.backgroundImages 
        : [];
      
      const selectedImg = images.find((img: any) => img.id === imgId);
      if (!selectedImg) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      const saved = await settingsDb.update({
        where: { id: currentSettings.id },
        data: { 
          backgroundImage: selectedImg.url,
          backgroundActive: true
        }
      });
      return NextResponse.json(saved);
    }

    // Delete a specific background image
    if (action === 'delete-image') {
      const imgId = formData.get('id') as string;
      const images = Array.isArray(currentSettings.backgroundImages) 
        ? [...currentSettings.backgroundImages] 
        : [];
      
      const targetImg = images.find((img: any) => img.id === imgId);
      if (!targetImg) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
      }

      // If it is a local file, delete it from disk
      if (targetImg.url.startsWith('/uploads/')) {
        const filePath = join(process.cwd(), 'public', targetImg.url);
        if (existsSync(filePath)) {
          try {
            await unlink(filePath);
          } catch (e) {
            console.error("Failed to delete physical file:", e);
          }
        }
      }

      const updatedImages = images.filter((img: any) => img.id !== imgId);
      
      // If deleted image was the current background, set it to the first available image or null
      let newBgImage = currentSettings.backgroundImage;
      if (currentSettings.backgroundImage === targetImg.url) {
        newBgImage = updatedImages.length > 0 ? updatedImages[0].url : null;
      }

      const saved = await settingsDb.update({
        where: { id: currentSettings.id },
        data: { 
          backgroundImages: updatedImages,
          backgroundImage: newBgImage
        }
      });
      return NextResponse.json(saved);
    }

    // Upload a new image to the collection
    if (action === 'upload-multiple' && file) {
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

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `bg-${randomUUID()}.${ext}`;
      const path = join(uploadsDir, filename);

      await writeFile(path, buffer);

      const fileUrl = `/uploads/${filename}`;
      const newImgId = `bg-img-${randomUUID().substring(0, 8)}`;

      const currentImages = Array.isArray(currentSettings.backgroundImages) 
        ? [...currentSettings.backgroundImages] 
        : [];
      
      const newImageItem = {
        id: newImgId,
        url: fileUrl,
        active: true
      };
      
      const updatedImages = [...currentImages, newImageItem];

      // Auto-set as active static background if none was selected
      const setAsMain = !currentSettings.backgroundImage || currentImages.length === 0;

      const saved = await settingsDb.update({
        where: { id: currentSettings.id },
        data: { 
          backgroundImages: updatedImages,
          backgroundImage: setAsMain ? fileUrl : currentSettings.backgroundImage,
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
