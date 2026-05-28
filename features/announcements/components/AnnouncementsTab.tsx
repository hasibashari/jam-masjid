'use client';

import React from 'react';
import { 
  Plus, 
  Loader2, 
  Edit, 
  Power, 
  Trash2 
} from 'lucide-react';
import { AnnouncementType } from '@/shared/types';
import { useMosqueAnnouncements } from '../hooks/useMosqueAnnouncements';

interface AnnouncementsTabProps {
  announcements: AnnouncementType[];
  setAnnouncements: React.Dispatch<React.SetStateAction<AnnouncementType[]>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export default function AnnouncementsTab({ 
  announcements, 
  setAnnouncements, 
  showAlert 
}: AnnouncementsTabProps) {
  const {
    saveLoading,
    newAnnouncementText,
    setNewAnnouncementText,
    editingAnnId,
    setEditingAnnId,
    editingAnnText,
    setEditingAnnText,
    handleAddAnnouncement,
    handleToggleAnnouncement,
    handleDeleteAnnouncement,
    handleSaveEditAnnouncement,
  } = useMosqueAnnouncements({
    announcements,
    setAnnouncements,
    showAlert,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Form to add */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-fit">
        <h3 className="text-lg font-bold mb-6 text-[#D4AF37] flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-500" /> Tulis Ticker Pengumuman
        </h3>
        
        <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Isi Teks Pengumuman</label>
            <textarea 
              value={newAnnouncementText}
              onChange={(e) => setNewAnnouncementText(e.target.value)}
              required
              rows={4}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-sm font-semibold leading-relaxed"
              placeholder="Contoh: Silakan merapatkan shaf shalat... atau Batas akhir pengumpulan Zakat Fitrah..."
            />
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white rounded-xl text-sm font-bold transition-colors uppercase tracking-wider"
          >
            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Tambahkan Pengumuman'}
          </button>
        </form>
      </div>

      {/* List announcements */}
      <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-6 text-[#D4AF37]">Daftar Pengumuman Aktif</h3>
        
        {announcements.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-medium">
            Belum ada pengumuman yang dimuat. Buat satu untuk memulai ticker berjalan!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {announcements.map((ann) => (
              <div 
                key={ann.id} 
                className={`flex justify-between items-center gap-6 p-5 rounded-2xl border transition-all ${
                  ann.active ? 'bg-zinc-950/40 border-emerald-500/20' : 'bg-transparent border-zinc-800 opacity-60'
                }`}
              >
                {editingAnnId === ann.id ? (
                  <div className="flex-1 flex flex-col gap-3">
                    <textarea
                      value={editingAnnText}
                      onChange={(e) => setEditingAnnText(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-sm font-semibold leading-relaxed w-full"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingAnnId(null)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditAnnouncement(ann.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium leading-relaxed">{ann.text}</p>
                      <span className="text-[10px] text-zinc-500 mt-2 block font-mono">ID: {ann.id}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAnnId(ann.id);
                          setEditingAnnText(ann.text);
                        }}
                        title="Edit Pengumuman"
                        className="p-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleAnnouncement(ann.id, ann.active)}
                        title={`${ann.active ? 'Nonaktifkan' : 'Aktifkan'}`}
                        className={`p-2.5 rounded-lg border transition-colors ${
                          ann.active 
                            ? 'bg-emerald-900/30 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/50' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        title="Hapus Pengumuman"
                        className="p-2.5 bg-rose-950/40 border border-rose-500/20 text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
