'use client';

import React from 'react';
import { 
  Plus, 
  Loader2, 
  Edit, 
  Power, 
  Trash2 
} from 'lucide-react';
import { QuoteType } from '@/shared/types';
import { useMosqueQuotes } from '../hooks/useMosqueQuotes';

interface QuotesTabProps {
  quotes: QuoteType[];
  setQuotes: React.Dispatch<React.SetStateAction<QuoteType[]>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export default function QuotesTab({ 
  quotes, 
  setQuotes, 
  showAlert 
}: QuotesTabProps) {
  const {
    saveLoading,
    newQuoteText,
    setNewQuoteText,
    newQuoteSource,
    setNewQuoteSource,
    editingQuoteId,
    setEditingQuoteId,
    editingQuoteText,
    setEditingQuoteText,
    editingQuoteSource,
    setEditingQuoteSource,
    handleAddQuote,
    handleToggleQuote,
    handleDeleteQuote,
    handleSaveEditQuote,
  } = useMosqueQuotes({
    quotes,
    setQuotes,
    showAlert,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      
      {/* Form to add Quote */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 h-fit">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37] flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-500 shrink-0" /> Tulis Kata Motivasi / Quotes
        </h3>
        
        <form onSubmit={handleAddQuote} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Isi Kutipan / Kata Motivasi</label>
            <textarea 
              value={newQuoteText}
              onChange={(e) => setNewQuoteText(e.target.value)}
              required
              rows={4}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-semibold leading-relaxed"
              placeholder="Contoh: Bersabarlah, sesungguhnya pertolongan Allah itu sangat dekat..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Sumber / Perawi / Penulis</label>
            <input 
              type="text"
              value={newQuoteSource}
              onChange={(e) => setNewQuoteSource(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-semibold"
              placeholder="Contoh: HR. Bukhari, QS. Al-Baqarah: 153"
            />
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="w-full py-3 md:py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white rounded-xl text-[13px] md:text-sm font-bold transition-colors uppercase tracking-wider"
          >
            {saveLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Tambahkan Quote'}
          </button>
        </form>
      </div>

      {/* List Quotes */}
      <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6">
        <h3 className="text-base font-bold mb-4 text-[#D4AF37]">Daftar Kata Motivasi / Quotes Aktif</h3>
        
        {quotes.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-medium">
            Belum ada kata motivasi yang dimuat. Buat satu untuk memulai display!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {quotes.map((q) => (
              <div 
                key={q.id} 
                className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                  q.active ? 'bg-zinc-950/40 border-emerald-500/20' : 'bg-transparent border-zinc-800 opacity-60'
                }`}
              >
                {editingQuoteId === q.id ? (
                  <div className="flex-1 flex flex-col gap-3 w-full">
                    <textarea
                      value={editingQuoteText}
                      onChange={(e) => setEditingQuoteText(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 outline-none text-white focus:border-emerald-500 text-[13px] md:text-sm font-semibold leading-relaxed w-full"
                      rows={2}
                    />
                    <input
                      type="text"
                      value={editingQuoteSource}
                      onChange={(e) => setEditingQuoteSource(e.target.value)}
                      className="bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 outline-none text-white focus:border-emerald-500 text-xs font-semibold w-full"
                      placeholder="Sumber..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingQuoteId(null)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditQuote(q.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium leading-relaxed">&ldquo;{q.text}&rdquo;</p>
                      <span className="text-xs text-emerald-400 font-extrabold uppercase mt-2 block tracking-wider">— {q.source}</span>
                      <span className="text-[10px] text-zinc-500 mt-1 block font-mono">ID: {q.id}</span>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2.5 sm:gap-3 shrink-0 mt-2 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuoteId(q.id);
                          setEditingQuoteText(q.text);
                          setEditingQuoteSource(q.source);
                        }}
                        title="Edit Quote"
                        className="p-3 sm:p-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleQuote(q.id, q.active)}
                        title={`${q.active ? 'Nonaktifkan' : 'Aktifkan'}`}
                        className={`p-3 sm:p-2.5 rounded-lg border transition-colors cursor-pointer ${
                          q.active 
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50' 
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuote(q.id)}
                        title="Hapus Quote"
                        className="p-3 sm:p-2.5 bg-rose-950/40 border border-rose-500/20 text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
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
