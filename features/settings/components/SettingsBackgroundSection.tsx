'use client';

import React from 'react';
import { Image as ImageIcon, Loader2, Upload, Star, Trash2 } from 'lucide-react';
import { AppSettings } from '@/shared/types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  mainBgUploading: boolean;
  handleMainBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleToggleMainBg: () => void;
  handleDeleteBgImage: (id: string) => void;
  handleToggleBgImage: (id: string) => void;
  handleSelectBgImage: (id: string) => void;
  handleToggleSlideshow: () => void;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

/**
 * Section: TV background image selection, upload, and slideshow configuration.
 */
export default function SettingsBackgroundSection({
  settings,
  setSettings,
  mainBgUploading,
  handleMainBgUpload,
  handleToggleMainBg,
  handleDeleteBgImage,
  handleToggleBgImage,
  handleSelectBgImage,
  handleToggleSlideshow,
  showAlert,
}: Props) {
  const [customUrlInput, setCustomUrlInput] = React.useState('');

  const handleAddCustomUrl = () => {
    if (!customUrlInput) return;
    if (!customUrlInput.startsWith('http://') && !customUrlInput.startsWith('https://')) {
      showAlert('error', 'URL harus dimulai dengan http:// atau https://');
      return;
    }
    const newImgId = `bg-url-${Math.random().toString(36).substring(2, 10)}`;
    const currentImages = Array.isArray(settings.backgroundImages) ? [...settings.backgroundImages] : [];
    const newImageItem = {
      id: newImgId,
      url: customUrlInput,
      active: true,
    };
    const updatedImages = [...currentImages, newImageItem];
    const setAsMain = !settings.backgroundImage || currentImages.length === 0;

    setSettings(prev => ({
      ...prev,
      backgroundImages: updatedImages,
      backgroundImage: setAsMain ? customUrlInput : prev.backgroundImage,
      backgroundActive: true,
    }));
    setCustomUrlInput('');
    showAlert('success', 'URL background berhasil ditambahkan ke daftar!');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
      <h3 className="text-base font-bold text-[#D4AF37] flex items-center gap-2 mb-4">
        <ImageIcon className="w-5 h-5 text-emerald-500 shrink-0" /> Konfigurasi Background TV
      </h3>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl mb-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <span className="text-xs font-black uppercase text-zinc-300 tracking-wider">Aktifkan Background</span>
            <span className="text-[9px] text-zinc-500">Tampilkan wallpaper pada layar TV</span>
          </div>
          <button
            type="button"
            onClick={handleToggleMainBg}
            className={`w-12 h-6.5 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
              settings.backgroundActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
            }`}
          >
            <div className="w-4.5 h-4.5 bg-white rounded-full shadow-lg" />
          </button>
        </div>

        {settings.backgroundActive && (
          <div className="flex items-center justify-between border-t sm:border-t-0 sm:border-l border-zinc-800/80 pt-3 sm:pt-0 sm:pl-4">
            <div className="flex flex-col text-left">
              <span className="text-xs font-black uppercase text-zinc-300 tracking-wider">Slideshow Otomatis</span>
              <span className="text-[9px] text-zinc-500">Gilir beberapa gambar terpilih</span>
            </div>
            <button
              type="button"
              onClick={handleToggleSlideshow}
              className={`w-12 h-6.5 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                settings.backgroundSlideshowActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-4.5 h-4.5 bg-white rounded-full shadow-lg" />
            </button>
          </div>
        )}
      </div>

      {/* Slideshow Parameters */}
      {settings.backgroundActive && settings.backgroundSlideshowActive && (
        <div className="grid grid-cols-2 gap-4 bg-zinc-950/30 border border-zinc-800/50 p-3 rounded-2xl mb-5 animate-fade-in">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Interval Pergantian</label>
            <select
              value={settings.backgroundSlideshowInterval || 10}
              onChange={(e) => setSettings(prev => ({ ...prev, backgroundSlideshowInterval: parseInt(e.target.value) || 10 }))}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 outline-none text-white text-xs font-semibold focus:border-emerald-500 cursor-pointer"
            >
              <option value={5}>5 Detik</option>
              <option value={10}>10 Detik</option>
              <option value={15}>15 Detik</option>
              <option value={30}>30 Detik</option>
              <option value={60}>1 Menit</option>
              <option value={180}>3 Menit</option>
              <option value={300}>5 Menit</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Efek Transisi</label>
            <select
              value={settings.backgroundTransitionEffect || 'fade'}
              onChange={(e) => setSettings(prev => ({ ...prev, backgroundTransitionEffect: e.target.value as any }))}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 outline-none text-white text-xs font-semibold focus:border-emerald-500 cursor-pointer"
            >
              <option value="fade">Fade (Memudar)</option>
              <option value="zoom">Zoom Parallax</option>
              <option value="slide">Slide Carousel</option>
              <option value="blur">Blur Modern</option>
            </select>
          </div>
        </div>
      )}

      {/* Core Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Add Background Section */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-left">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Tambah Background</label>
            <div className="border border-dashed border-zinc-800 rounded-xl p-3 bg-zinc-950/40 flex flex-col items-center justify-center text-center gap-2 relative cursor-pointer hover:border-emerald-500/50 transition-colors h-24">
              <input
                type="file"
                accept="image/*"
                onChange={handleMainBgUpload}
                disabled={mainBgUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
              />
              {mainBgUploading ? (
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 text-zinc-500" />
                  <div>
                    <span className="text-[11px] font-bold text-emerald-500">Unggah Gambar Baru</span>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Rasio 16:9 disarankan (Maks 5MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Atau via Link URL Gambar</label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 outline-none text-white focus:border-emerald-500 text-[11px] font-mono flex-1"
                placeholder="https://images.unsplash.com/..."
              />
              <button
                type="button"
                onClick={handleAddCustomUrl}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl transition-all shrink-0"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Board Area */}
        <div className="md:col-span-7 flex flex-col gap-2 h-full">
          <div className="flex justify-between items-center mb-0.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Koleksi Background ({Array.isArray(settings.backgroundImages) ? settings.backgroundImages.length : 0})
            </label>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-2.5 flex flex-col gap-2 max-h-[220px] overflow-y-auto min-h-[160px]">
            {Array.isArray(settings.backgroundImages) && settings.backgroundImages.length > 0 ? (
              settings.backgroundImages.map((img: any) => {
                const isSelected = settings.backgroundImage === img.url;
                return (
                  <div
                    key={img.id}
                    className={`flex items-center justify-between gap-3 p-1.5 bg-zinc-900/40 border rounded-xl transition-all ${
                      isSelected ? 'border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.05)]' : 'border-zinc-800/60'
                    }`}
                  >
                    <div className="relative w-12 h-8 rounded-lg overflow-hidden shrink-0 border border-zinc-800/80 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="BG Thumbnail" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10px] text-zinc-400 truncate font-mono select-all" title={img.url}>
                        {img.url.substring(img.url.lastIndexOf('/') + 1)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 pr-1">
                      <label className="flex items-center gap-1 cursor-pointer select-none" title="Masukkan dalam slideshow">
                        <input
                          type="checkbox"
                          checked={img.active}
                          onChange={() => handleToggleBgImage(img.id)}
                          className="w-3.5 h-3.5 rounded border-zinc-800 text-emerald-600 focus:ring-emerald-600 accent-emerald-600 bg-zinc-950 cursor-pointer"
                        />
                        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Slideshow</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleSelectBgImage(img.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          isSelected
                            ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                            : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                        }`}
                        title={isSelected ? 'Background Utama Aktif' : 'Jadikan Background Utama Statis'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isSelected ? 'fill-[#D4AF37]' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBgImage(img.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
                        title="Hapus Gambar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
                <ImageIcon className="w-6 h-6 text-zinc-700 mb-1" />
                Belum ada background
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
