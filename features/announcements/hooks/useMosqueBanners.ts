'use client';

import React, { useState } from 'react';
import { BannerType } from '@/shared/types';

interface UseMosqueBannersProps {
  banners: BannerType[];
  setBanners: React.Dispatch<React.SetStateAction<BannerType[]>>;
  showAlert: (type: 'success' | 'error', text: string) => void;
}

export function useMosqueBanners({
  banners,
  setBanners,
  showAlert,
}: UseMosqueBannersProps) {
  const [saveLoading, setSaveLoading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: 'Poster',
    description: '',
    imageUrl: '',
    active: true,
    autoHideAfter: 15,
    contentMode: 'IMAGE' as 'IMAGE' | 'TEXT',
    bgGradient: 'emerald'
  });
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(null);
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
    const isTextMode = newBanner.contentMode === 'TEXT';
    if (!newBanner.title || (!isTextMode && !newBanner.imageUrl && !selectedBannerFile)) {
      showAlert('error', isTextMode ? 'Judul/Pengumuman wajib disediakan.' : 'Judul dan Poster Gambar wajib disediakan.');
      return;
    }

    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', newBanner.title);
      if (newBanner.description) formData.append('description', newBanner.description);
      formData.append('active', String(newBanner.active));
      formData.append('autoHideAfter', String(newBanner.autoHideAfter));
      formData.append('contentMode', newBanner.contentMode);
      formData.append('bgGradient', newBanner.bgGradient);

      if (!isTextMode) {
        if (selectedBannerFile) {
          formData.append('file', selectedBannerFile);
        } else {
          formData.append('imageUrl', newBanner.imageUrl);
        }
      }

      const res = await fetch('/api/banners', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setNewBanner({ title: 'Poster', description: '', imageUrl: '', active: true, autoHideAfter: 15, contentMode: 'IMAGE', bgGradient: 'emerald' });
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
    if (!editingBanner || !editingBanner.title) return;
    const isTextMode = editingBanner.contentMode === 'TEXT';
    if (!isTextMode && !editingBanner.imageUrl) return;

    setSaveLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', editingBanner.id);
      formData.append('title', editingBanner.title);
      if (editingBanner.description) formData.append('description', editingBanner.description);
      formData.append('active', String(editingBanner.active));
      formData.append('autoHideAfter', String(editingBanner.autoHideAfter));
      formData.append('contentMode', editingBanner.contentMode || 'IMAGE');
      formData.append('bgGradient', editingBanner.bgGradient || 'emerald');
      if (editingBanner.imageUrl) {
        formData.append('imageUrl', editingBanner.imageUrl);
      }

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

  return {
    saveLoading,
    newBanner,
    setNewBanner,
    bannerUploadError,
    setBannerUploadError,
    selectedBannerFile,
    setSelectedBannerFile,
    editingBanner,
    setEditingBanner,
    handleFileUpload,
    handleAddBanner,
    handleToggleBanner,
    handleSaveEditBanner,
    handleDeleteBanner,
  };
}
