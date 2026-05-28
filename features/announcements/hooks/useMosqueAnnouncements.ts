'use client';

import React, { useState } from 'react';
import { AnnouncementType } from '@/shared/types';

interface UseMosqueAnnouncementsProps {
  announcements: AnnouncementType[];
  setAnnouncements: React.Dispatch<React.SetStateAction<AnnouncementType[]>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export function useMosqueAnnouncements({
  announcements,
  setAnnouncements,
  showAlert,
}: UseMosqueAnnouncementsProps) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState("");
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [editingAnnText, setEditingAnnText] = useState("");

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementText.trim()) return;

    setSaveLoading(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newAnnouncementText, active: true })
      });
      if (res.ok) {
        setNewAnnouncementText("");
        showAlert('success', 'Pengumuman baru berhasil ditambahkan!');
        
        // Reload list
        const listRes = await fetch('/api/announcements?all=true');
        if (listRes.ok) {
          setAnnouncements(await listRes.json());
        }
      } else {
        showAlert('error', 'Gagal membuat pengumuman baru.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleAnnouncement = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
      });
      if (res.ok) {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !currentActive } : a));
        showAlert('success', 'Status pengumuman diperbarui!');
      }
    } catch (err) {
      showAlert('error', 'Gagal memperbarui status.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        showAlert('success', 'Pengumuman dihapus.');
      }
    } catch (err) {
      showAlert('error', 'Gagal menghapus.');
    }
  };

  const handleSaveEditAnnouncement = async (id: string) => {
    if (!editingAnnText.trim()) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: editingAnnText })
      });
      if (res.ok) {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, text: editingAnnText } : a));
        setEditingAnnId(null);
        showAlert('success', 'Pengumuman berhasil diperbarui!');
      } else {
        showAlert('error', 'Gagal memperbarui pengumuman.');
      }
    } catch (err) {
      showAlert('error', 'Koneksi gagal.');
    }
  };

  return {
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
  };
}
