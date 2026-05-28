'use client';

import React, { useState } from 'react';
import { QuoteType } from '@/shared/types';

interface UseMosqueQuotesProps {
  quotes: QuoteType[];
  setQuotes: React.Dispatch<React.SetStateAction<QuoteType[]>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export function useMosqueQuotes({
  quotes,
  setQuotes,
  showAlert,
}: UseMosqueQuotesProps) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteSource, setNewQuoteSource] = useState("");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingQuoteText, setEditingQuoteText] = useState("");
  const [editingQuoteSource, setEditingQuoteSource] = useState("");

  const handleAddQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteText.trim()) return;

    setSaveLoading(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: newQuoteText, 
          source: newQuoteSource.trim() || 'Hamba Allah', 
          active: true 
        })
      });
      if (res.ok) {
        setNewQuoteText("");
        setNewQuoteSource("");
        showAlert('success', 'Kata motivasi baru berhasil ditambahkan!');
        
        // Reload list
        const listRes = await fetch('/api/quotes?all=true');
        if (listRes.ok) {
          setQuotes(await listRes.json());
        }
      } else {
        showAlert('error', 'Gagal menambahkan kata motivasi.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleQuote = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
      });
      if (res.ok) {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, active: !currentActive } : q));
        showAlert('success', 'Status kata motivasi diperbarui!');
      }
    } catch (err) {
      showAlert('error', 'Gagal memperbarui status.');
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kata motivasi ini?")) return;
    try {
      const res = await fetch(`/api/quotes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuotes(prev => prev.filter(q => q.id !== id));
        showAlert('success', 'Kata motivasi berhasil dihapus.');
      }
    } catch (err) {
      showAlert('error', 'Gagal menghapus.');
    }
  };

  const handleSaveEditQuote = async (id: string) => {
    if (!editingQuoteText.trim()) return;
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          text: editingQuoteText, 
          source: editingQuoteSource.trim() || 'Hamba Allah' 
        })
      });
      if (res.ok) {
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, text: editingQuoteText, source: editingQuoteSource } : q));
        setEditingQuoteId(null);
        showAlert('success', 'Kata motivasi berhasil diperbarui!');
      } else {
        showAlert('error', 'Gagal memperbarui kata motivasi.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    }
  };

  return {
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
  };
}
