'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Loader2, 
  Upload, 
  X, 
  Edit, 
  Power, 
  Trash2 
} from 'lucide-react';
import { BannerType } from '@/shared/types';

interface BannersTabProps {
  banners: BannerType[];
  setBanners: React.Dispatch<React.SetStateAction<BannerType[]>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

const BANNER_PRESETS = [
  {
    title: 'Kajian Riyadhus Shalihin',
    description: 'Rutinitas membaca Kitab Riyadhus Shalihin bersama Ustadz Abdurrahman setelah Sholat Isya.',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800',
    autoHideAfter: 15
  },
  {
    title: 'Donasi Program Sosial Ramadhan',
    description: 'Bantu ringankan beban anak yatim dan dhuafa dengan berkontribusi dalam paket pangan Ramadhan.',
    imageUrl: 'https://images.unsplash.com/photo-1597935258735-e254c1839512?q=80&w=800',
    autoHideAfter: 15
  },
  {
    title: 'Kebersihan Adalah Sebagian Dari Iman',
    description: 'Mari jaga kebersihan area masjid dan letakkan kembali sendal/sepatu Anda di rak yang disiapkan.',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=800',
    autoHideAfter: 10
  }
];

export default function BannersTab({ 
  banners, 
  setBanners, 
  showAlert 
}: BannersTabProps) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states - New Banner
  const [newBanner, setNewBanner] = useState({
    title: 'Poster',
    description: '',
    imageUrl: '',
    active: true,
    autoHideAfter: 15
  });
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);

  // Editing state - Modal
  const [editingBanner, setEditingBanner] = useState<BannerType | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setBannerUploadError("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setBannerUploadError("Ukuran gambar terlalu besar. Maksimal 2MB untuk optimasi display.");
      return;
    }

    setBannerUploadError("");
    setSelectedBannerFile(file);
    const objectUrl = URL.createObjectURL(file);
    setNewBanner(prev => ({ ...prev, imageUrl: objectUrl }));
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || (!newBanner.imageUrl && !selectedBannerFile)) {
      showAlert('error', 'Judul dan Poster Gambar wajib disediakan.');
      return;
    }

    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBanner.title);
      if (newBanner.description) formData.append('description', newBanner.description);
      formData.append('active', String(newBanner.active));
      formData.append('autoHideAfter', String(newBanner.autoHideAfter));

      if (selectedBannerFile) {
        formData.append('file', selectedBannerFile);
      } else {
        formData.append('imageUrl', newBanner.imageUrl);
      }

      const res = await fetch('/api/banners', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setNewBanner({ title: 'Poster', description: '', imageUrl: '', active: true, autoHideAfter: 15 });
        setSelectedBannerFile(null);
        showAlert('success', 'Banner informasi berhasil ditambahkan!');
        
        // Reload list
        const bannersRes = await fetch('/api/banners?all=true');
        if (bannersRes.ok) {
          setBanners(await bannersRes.json());
        }
      } else {
        showAlert('error', 'Gagal menambahkan banner. Kemungkinan format file tidak valid.');
      }
    } catch (err) {
      showAlert('error', 'Error mengirim database.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleBanner = async (id: string, currentActive: boolean) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('active', String(!currentActive));

      const res = await fetch('/api/banners', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !currentActive } : b));
        showAlert('success', 'Status banner informasi berhasil diperbarui!');
      } else {
        showAlert('error', 'Gagal memperbarui status banner.');
      }
    } catch (err) {
      showAlert('error', 'Gagal memperbarui status banner.');
    }
  };

  const handleSaveEditBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title || !editingBanner.imageUrl) return;

    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', editingBanner.id);
      formData.append('title', editingBanner.title);
      if (editingBanner.description) formData.append('description', editingBanner.description);
      formData.append('active', String(editingBanner.active));
      formData.append('autoHideAfter', String(editingBanner.autoHideAfter));
      formData.append('imageUrl', editingBanner.imageUrl);

      const res = await fetch('/api/banners', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setBanners(prev => prev.map(b => b.id === editingBanner.id ? updated : b));
        setEditingBanner(null);
        showAlert('success', 'Banner informasi berhasil diperbarui!');
      } else {
        showAlert('error', 'Gagal memperbarui banner.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Hapus banner pengumuman ini?")) return;
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(prev => prev.filter(b => b.id !== id));
        showAlert('success', 'Banner berhasil dihapus.');
      }
    } catch (err) {
      showAlert('error', 'Gagal menghapus.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Create Banner Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-fit">
        <h3 className="text-lg font-bold mb-6 text-[#D4AF37] flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-500" /> Unggah Poster Banner Baru
        </h3>

        <form onSubmit={handleAddBanner} className="flex flex-col gap-5">
          
          {/* Upload Section */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Desain Poster Gambar</label>
            
            <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-950/40 flex flex-col items-center justify-center text-center gap-3 relative cursor-pointer hover:border-emerald-500/50 transition-colors">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-zinc-500" />
              <div>
                <span className="text-xs font-bold text-emerald-500">Klik / Seret File Gambar</span>
                <p className="text-[10px] text-zinc-500 mt-1">Saran aspek rasio: 16:9 Landscape (Maks. 2MB)</p>
              </div>
            </div>

            {bannerUploadError && (
              <span className="text-xs text-rose-500 font-semibold">{bannerUploadError}</span>
            )}
          </div>

          {/* Manual Link Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Atau Tempel URL Gambar</label>
            <input 
              type="url"
              value={newBanner.imageUrl}
              onChange={(e) => setNewBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-xs font-mono font-bold"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Preset shortcuts for quick setup */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pilih Preset Gambar Cepat:</span>
            <div className="flex flex-wrap gap-2">
              {BANNER_PRESETS.map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setNewBanner({
                    title: preset.title,
                    description: preset.description,
                    imageUrl: preset.imageUrl,
                    active: true,
                    autoHideAfter: preset.autoHideAfter
                  })}
                  className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1.5 rounded"
                >
                  {preset.title.substring(0, 18)}...
                </button>
              ))}
            </div>
          </div>

          {/* Render preview */}
          {newBanner.imageUrl && (
            <div className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">PREVIEW GAMBAR</span>
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={newBanner.imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover" 
                  onError={() => setBannerUploadError("URL gambar tidak dapat dimuat.")}
                />
                <button 
                  type="button" 
                  onClick={() => setNewBanner(prev => ({ ...prev, imageUrl: '' }))}
                  className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/90"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saveLoading || isUploading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-colors uppercase tracking-wider mt-4"
          >
            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Unggah Poster Informasi'}
          </button>

        </form>
      </div>

      {/* Existing Banners Grid List */}
      <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6 text-[#D4AF37]">Daftar Poster Informasi Aktif</h3>

        {banners.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 font-medium">
            Belum ada poster Fullscreen yang diunggah. Tambahkan di panel kiri untuk memulai!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((ban) => (
              <div 
                key={ban.id}
                className={`flex flex-col bg-zinc-950 border rounded-2xl overflow-hidden transition-all ${
                  ban.active ? 'border-emerald-500/20 shadow-lg' : 'border-zinc-800 opacity-60'
                }`}
              >
                <div className="relative aspect-video bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={ban.imageUrl} 
                    alt="Poster Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBanner(ban)}
                      className="p-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white backdrop-blur rounded-xl transition-colors"
                      title="Edit Poster Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleBanner(ban.id, ban.active)}
                      className={`p-2 rounded-xl backdrop-blur transition-colors border ${
                        ban.active 
                          ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/90' 
                          : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                      }`}
                      title={ban.active ? 'Nonaktifkan Banner' : 'Aktifkan Banner'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(ban.id)}
                      className="p-2 bg-rose-950/80 hover:bg-rose-900/90 border border-rose-500/30 text-rose-400 backdrop-blur rounded-xl transition-colors"
                      title="Hapus Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between text-left border-t border-zinc-800 bg-zinc-950/30">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">ID: {ban.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Banner Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
            
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold font-sans text-[#D4AF37]">Edit Poster Banner</h2>
              <button 
                type="button"
                onClick={() => setEditingBanner(null)} 
                className="p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBanner} className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Status Tampil</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingBanner(prev => prev ? ({ ...prev, active: !prev.active }) : null)}
                    className={`w-12 h-6 rounded-full transition-all relative flex items-center p-1 ${
                      editingBanner.active ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-lg"></div>
                  </button>
                  <span className="text-xs text-zinc-300 font-semibold">
                    {editingBanner.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">URL Gambar Poster</label>
                <input 
                  type="url"
                  value={editingBanner.imageUrl}
                  onChange={(e) => setEditingBanner(prev => prev ? ({ ...prev, imageUrl: e.target.value }) : null)}
                  required
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-xs font-mono font-bold"
                />
              </div>

              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-zinc-800 mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={editingBanner.imageUrl} 
                  alt="Edit Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800';
                  }}
                />
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 text-white transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={saveLoading}
                  className="px-8 py-3 bg-[#D4AF37] text-zinc-950 rounded-lg text-sm font-bold hover:bg-[#FBE18D] transition-colors"
                >
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-950" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
