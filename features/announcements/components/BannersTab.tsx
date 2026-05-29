'use client';

import React from 'react';
import {
  Plus,
  Loader2,
  Upload,
  X,
  Edit,
  Power,
  Trash2,
  Megaphone,
  Layout,
  Clock,
} from 'lucide-react';
import { BannerType } from '@/shared/types';
import { useMosqueBanners } from '../hooks/useMosqueBanners';
import BannerColorPicker from './BannerColorPicker';
import BannerMiniPreview from './BannerMiniPreview';

interface BannersTabProps {
  banners: BannerType[];
  setBanners: React.Dispatch<React.SetStateAction<BannerType[]>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export default function BannersTab({ banners, setBanners, showAlert }: BannersTabProps) {
  const {
    saveLoading,
    newBanner,
    setNewBanner,
    bannerUploadError,
    setBannerUploadError,
    editingBanner,
    setEditingBanner,
    handleFileUpload,
    handleAddBanner,
    handleToggleBanner,
    handleSaveEditBanner,
    handleDeleteBanner,
  } = useMosqueBanners({ banners, setBanners, showAlert });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

      {/* ── Create Banner Form ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 h-fit">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-500 shrink-0" /> Tambah Banner Informasi
        </h3>

        <form onSubmit={handleAddBanner} className="flex flex-col gap-5">

          {/* Layout type toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Tipe Layout Banner</label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['IMAGE', 'TEXT'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setNewBanner(prev => ({ ...prev, contentMode: mode }))}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    newBanner.contentMode === mode
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {mode === 'IMAGE' ? 'Poster Gambar' : 'Teks Manual (Gradasi)'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">
              {newBanner.contentMode === 'TEXT' ? 'Judul Utama Pengumuman' : 'Judul Poster'}
            </label>
            <input
              type="text"
              value={newBanner.title}
              onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder={newBanner.contentMode === 'TEXT' ? 'Contoh: KAJIAN RUTIN AHAD SUBUH' : 'Contoh: Poster Kajian Ahad'}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-bold"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">
              {newBanner.contentMode === 'TEXT' ? 'Isi Detail Pengumuman (Opsional)' : 'Deskripsi / Catatan (Opsional)'}
            </label>
            <textarea
              value={newBanner.description}
              onChange={(e) => setNewBanner(prev => ({ ...prev, description: e.target.value }))}
              placeholder={newBanner.contentMode === 'TEXT'
                ? 'Contoh: Bersama Ustadz Adi Hidayat, Lc., M.A. di Ruang Utama Masjid.'
                : 'Keterangan tambahan...'}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm h-20 resize-none"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Durasi Tampil (Detik)</label>
            <input
              type="number"
              min="5"
              max="300"
              value={newBanner.autoHideAfter}
              onChange={(e) => setNewBanner(prev => ({ ...prev, autoHideAfter: parseInt(e.target.value) || 15 }))}
              required
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-mono"
            />
          </div>

          {/* Conditional: IMAGE vs TEXT */}
          {newBanner.contentMode === 'IMAGE' ? (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Desain Poster Gambar</label>
                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-4 sm:p-6 bg-zinc-950/40 flex flex-col items-center justify-center text-center gap-3 relative cursor-pointer hover:border-emerald-500/50 transition-colors">
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

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Atau Tempel URL Gambar</label>
                <input
                  type="url"
                  value={newBanner.imageUrl}
                  onChange={(e) => setNewBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-mono font-bold"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

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
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/90 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Shared colour picker — replaces duplicated inline arrays */}
              <BannerColorPicker
                value={newBanner.bgGradient}
                onChange={(id) => setNewBanner(prev => ({ ...prev, bgGradient: id }))}
              />
              {/* Shared mini preview */}
              <BannerMiniPreview
                title={newBanner.title}
                description={newBanner.description}
                bgGradient={newBanner.bgGradient}
              />
            </>
          )}

          <button
            type="submit"
            disabled={saveLoading}
            className="w-full py-3 md:py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white rounded-xl text-[13px] md:text-sm font-bold transition-colors uppercase tracking-wider mt-4"
          >
            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan Banner Informasi'}
          </button>
        </form>
      </div>

      {/* ── Banners List ── */}
      <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37]">Daftar Poster Informasi Aktif</h3>

        {banners.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 font-medium">
            Belum ada poster Fullscreen yang diunggah. Tambahkan di panel kiri untuk memulai!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {banners.map((ban) => (
              <div
                key={ban.id}
                className={`flex flex-col bg-zinc-950 border rounded-2xl overflow-hidden transition-all ${
                  ban.active ? 'border-emerald-500/20 shadow-lg' : 'border-zinc-800 opacity-60'
                }`}
              >
                <div className="relative aspect-video bg-black">
                  {ban.contentMode === 'TEXT' ? (
                    <div className={`w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-br text-center border-b border-zinc-800 relative overflow-hidden ${
                      ban.bgGradient === 'emerald'  ? 'from-[#022416] via-[#051109] to-[#0e3321]' :
                      ban.bgGradient === 'sapphire' ? 'from-[#031d44] via-[#020b1e] to-[#010814]' :
                      ban.bgGradient === 'amber'    ? 'from-[#2d1a04] via-[#0c0902] to-[#1e1102]' :
                      ban.bgGradient === 'purple'   ? 'from-[#24032c] via-[#0f0214] to-[#12011b]' :
                      'from-[#1c1c1c] via-[#0d0d0d] to-[#111111]'
                    }`}>
                      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] pointer-events-none" />
                      <Megaphone className="w-6 h-6 text-[#D4AF37] shrink-0" />
                      <div className="flex-1 flex flex-col items-center justify-center w-full my-1">
                        <span className="text-xs font-black text-white uppercase tracking-tight text-center line-clamp-2 px-1">
                          {ban.title}
                        </span>
                        {ban.description && (
                          <span className="text-[10px] text-zinc-400 text-center line-clamp-2 px-2 mt-0.5">
                            {ban.description}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-white/10 h-0.5 rounded-full overflow-hidden shrink-0" />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={ban.imageUrl}
                      alt="Poster Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => setEditingBanner(ban)}
                      className="p-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white backdrop-blur rounded-xl transition-colors cursor-pointer"
                      title="Edit Poster Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleBanner(ban.id, ban.active)}
                      className={`p-2 rounded-xl backdrop-blur transition-colors border cursor-pointer ${
                        ban.active
                          ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/90'
                          : 'bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                      }`}
                      title={ban.active ? 'Nonaktifkan Banner' : 'Aktifkan Banner'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(ban.id)}
                      className="p-2 bg-rose-950/90 hover:bg-rose-900/90 border border-rose-500/30 text-rose-400 backdrop-blur rounded-xl transition-colors cursor-pointer"
                      title="Hapus Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between text-left border-t border-zinc-800 bg-zinc-950/30">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">ID: {ban.id}</span>
                      <div className="flex gap-1">
                        <span className="text-[9px] bg-zinc-900 text-zinc-400 font-bold px-1.5 py-0.5 rounded border border-zinc-800 flex items-center gap-1 font-sans">
                          <Layout className="w-2.5 h-2.5" /> {ban.contentMode === 'TEXT' ? 'Teks' : 'Poster'}
                        </span>
                        <span className="text-[9px] bg-zinc-900 text-zinc-400 font-bold px-1.5 py-0.5 rounded border border-zinc-800 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" /> {ban.autoHideAfter}s
                        </span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2 line-clamp-1">{ban.title}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{ban.description || 'Tidak ada deskripsi'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Banner Modal ── */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">

            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800">
              <h2 className="text-lg sm:text-xl font-bold font-sans text-[#D4AF37]">Edit Poster Banner</h2>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBanner} className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-4 sm:gap-5 text-left">

              {/* Layout toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Tipe Layout Banner</label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                  {(['IMAGE', 'TEXT'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setEditingBanner(prev => prev ? ({ ...prev, contentMode: mode }) : null)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        editingBanner.contentMode === mode
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode === 'IMAGE' ? 'Poster Gambar' : 'Teks Manual (Gradasi)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  {editingBanner.contentMode === 'TEXT' ? 'Judul Utama Pengumuman' : 'Judul Poster'}
                </label>
                <input
                  type="text"
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  required
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-sm font-bold"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                  {editingBanner.contentMode === 'TEXT' ? 'Isi Detail Pengumuman (Opsional)' : 'Deskripsi (Opsional)'}
                </label>
                <textarea
                  value={editingBanner.description || ''}
                  onChange={(e) => setEditingBanner(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-sm h-20 resize-none"
                />
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Durasi Tampil (Detik)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={editingBanner.autoHideAfter || 15}
                  onChange={(e) => setEditingBanner(prev => prev ? ({ ...prev, autoHideAfter: parseInt(e.target.value) || 15 }) : null)}
                  required
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-sm font-mono"
                />
              </div>

              {/* Active toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Status Tampil</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingBanner(prev => prev ? ({ ...prev, active: !prev.active }) : null)}
                    className={`w-12 h-6 rounded-full transition-all relative flex items-center p-1 shrink-0 ${
                      editingBanner.active ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                  </button>
                  <span className="text-xs text-zinc-300 font-semibold">
                    {editingBanner.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {/* Conditional: IMAGE vs TEXT */}
              {editingBanner.contentMode === 'IMAGE' ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">URL Gambar Poster</label>
                    <input
                      type="url"
                      value={editingBanner.imageUrl || ''}
                      onChange={(e) => setEditingBanner(prev => prev ? ({ ...prev, imageUrl: e.target.value }) : null)}
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-xs font-mono font-bold"
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
                </>
              ) : (
                <>
                  {/* Shared colour picker */}
                  <BannerColorPicker
                    value={editingBanner.bgGradient || 'emerald'}
                    onChange={(id) => setEditingBanner(prev => prev ? ({ ...prev, bgGradient: id }) : null)}
                  />
                  {/* Shared mini preview */}
                  <BannerMiniPreview
                    title={editingBanner.title}
                    description={editingBanner.description}
                    bgGradient={editingBanner.bgGradient || 'emerald'}
                  />
                </>
              )}

              <div className="flex justify-end gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-zinc-800 text-white transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#D4AF37] text-zinc-950 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#FBE18D] transition-colors cursor-pointer"
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
