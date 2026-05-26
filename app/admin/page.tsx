'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Megaphone, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  Power, 
  Clock, 
  Volume2, 
  Loader2, 
  Search, 
  Upload, 
  X,
  AlertTriangle,
  ExternalLink,
  Edit
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AppSettings, AnnouncementType, BannerType, FALLBACK_SETTINGS } from '@/shared/types';
import NominatimSearch from '@/features/location/components/NominatimSearch';

const DynamicMapPicker = dynamic(() => import('@/features/location/components/MapPicker'), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 gap-2 rounded-xl">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      <span className="text-sm font-medium">Memuat Peta...</span>
    </div>
  )
});

// Stunning theme-appropriate banners that users can add with 1 click
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'settings' | 'announcements' | 'banners' | 'sandbox'>('settings');
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form states - Settings
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  
  // Location states
  const [mapCenter, setMapCenter] = useState({ lat: FALLBACK_SETTINGS.latitude, lng: FALLBACK_SETTINGS.longitude });

  // List states
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [banners, setBanners] = useState<BannerType[]>([]);

  // Form states - New Announcement
  const [newAnnouncementText, setNewAnnouncementText] = useState("");

  // Editing states
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [editingAnnText, setEditingAnnText] = useState("");
  const [editingBanner, setEditingBanner] = useState<BannerType | null>(null);

  // Form states - New Banner
  const [newBanner, setNewBanner] = useState({
    title: 'Poster',
    description: '',
    imageUrl: '',
    active: true,
    autoHideAfter: 15
  });
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Status prompt
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch all starting parameters
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [settingsRes, announcementsRes, bannersRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/announcements?all=true'),
          fetch('/api/banners?all=true')
        ]);

        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setSettings(s);
          setMapCenter({ lat: s.latitude, lng: s.longitude });
        }
        if (announcementsRes.ok) {
          const a = await announcementsRes.json();
          setAnnouncements(a);
        }
        if (bannersRes.ok) {
          const b = await bannersRes.json();
          setBanners(b);
        }
      } catch (err) {
        console.error("Failed loading admin panel data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Set timeout helper for alerts
  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  // Update Settings handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        showAlert('success', 'Konfigurasi settings masjid berhasil disimpan!');
      } else {
        const errData = await res.json();
        showAlert('error', errData.error || 'Gagal menyimpan settings.');
      }
    } catch (err: any) {
      showAlert('error', err.message || 'Koneksi error ke server.');
    } finally {
      setSaveLoading(false);
    }
  };

  const [mainBgUploading, setMainBgUploading] = useState(false);

  // Background Image Handlers
  const handleMainBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('error', 'File harus berupa gambar.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showAlert('error', 'Ukuran gambar maksimal 5MB.');
      return;
    }

    setMainBgUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'upload');

    try {
      const res = await fetch('/api/settings/background', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        showAlert('success', 'Background utama berhasil diperbarui!');
        // Refresh API route for next image if same name replaced (force cache invalidate visually with query param if needed, but not strictly required if we use UUID naming which we do)
      } else {
        const err = await res.json();
        showAlert('error', err.error || 'Gagal mengunggah background.');
      }
    } catch (err) {
      showAlert('error', 'Error mengunggah gambar.');
    } finally {
      setMainBgUploading(false);
    }
  };

  const handleToggleMainBg = async () => {
    const newActive = !settings.backgroundActive;
    setSettings(prev => ({ ...prev, backgroundActive: newActive }));
    
    const formData = new FormData();
    formData.append('action', 'toggle');
    formData.append('active', String(newActive));
    
    try {
      const res = await fetch('/api/settings/background', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        setSettings(prev => ({ ...prev, backgroundActive: !newActive }));
        showAlert('error', 'Gagal memperbarui status background.');
      } else {
        showAlert('success', 'Status background diperbarui.');
      }
    } catch {
      setSettings(prev => ({ ...prev, backgroundActive: !newActive }));
      showAlert('error', 'Error mengubah status.');
    }
  };

  const handlePlaceSelect = (lat: number, lng: number, placeName: string) => {
    setSettings(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      mosqueName: placeName || prev.mosqueName
    }));
    setMapCenter({ lat, lng });
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSettings(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setMapCenter({ lat, lng });
  };

  // Announcements Handlers
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

  // Banners Handlers (including Base64 Drag and Drop file uploading)
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
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBanner(prev => ({ ...prev, imageUrl: reader.result as string }));
      setIsUploading(false);
    };
    reader.onerror = () => {
      setBannerUploadError("Gagal membaca file gambar.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.imageUrl) {
      showAlert('error', 'Judul dan Poster Gambar wajib disediakan.');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner)
      });
      if (res.ok) {
        setNewBanner({ title: 'Poster', description: '', imageUrl: '', active: true, autoHideAfter: 15 });
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
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
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

  const handleSaveEditBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner || !editingBanner.title || !editingBanner.imageUrl) return;

    setSaveLoading(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4 select-none">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <span className="text-sm font-semibold uppercase tracking-wider font-mono">Memuat Panel Admin...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased pb-24">
      {/* Alert Banner floats */}
      {alertMsg && (
        <div className={`fixed top-8 right-8 z-55 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-slide-in border ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950 border-rose-500/30 text-rose-400'
        }`}>
          {alertMsg.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{alertMsg.text}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-6 px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight font-sans">PANEL KONTROL DIGITAL</h1>
            <p className="text-xs text-zinc-400">Kelola informasi masjid, parameter hitung mundur adzan & iqomah, serta poster display TV.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <a 
            href="/" 
            target="_blank" 
            className="flex items-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-bold transition-all"
          >
            <span>Buka Display TV</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-8 mt-10">
        
        {/* Nav tabs */}
        <div className="flex gap-2 border-b border-zinc-900 pb-3 mb-10 select-none">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'settings' 
                ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings Masjid & Durasi</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'announcements' 
                ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Pengumuman Text Ticker</span>
          </button>

          <button 
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'banners' 
                ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Full Poster Banners</span>
          </button>

          <button 
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'sandbox' 
                ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Dev Sandbox Simulator</span>
          </button>
        </div>

        {/* Tab Contet 1: Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left panels: Identity & Timings */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Card 1: Identity */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-6 text-[#D4AF37] flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-500" /> Identitas Masjid & Jadwal Aktif
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Nama Masjid</label>
                    <input 
                      type="text" 
                      value={settings.mosqueName}
                      onChange={(e) => setSettings(prev => ({ ...prev, mosqueName: e.target.value }))}
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-sm font-semibold"
                      placeholder="Masukkan nama masjid..."
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Status Tampilan Layar</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, displayActive: !prev.displayActive }))}
                        className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 ${
                          settings.displayActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                        }`}
                      >
                        <div className="w-6 h-6 bg-white rounded-full shadow-lg"></div>
                      </button>
                      <span className="text-sm text-zinc-300 font-semibold md:mb-0">
                        {settings.displayActive ? 'Layar Display Aktif' : 'Layar Display Non-Aktif / Standby'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Jam Mulai Operasi</label>
                    <input 
                      type="text" 
                      value={settings.displayStart}
                      onChange={(e) => setSettings(prev => ({ ...prev, displayStart: e.target.value }))}
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-sm font-mono"
                      placeholder="03:00"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Jam Akhir Operasi</label>
                    <input 
                      type="text" 
                      value={settings.displayEnd}
                      onChange={(e) => setSettings(prev => ({ ...prev, displayEnd: e.target.value }))}
                      required
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-sm font-mono"
                      placeholder="23:00"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Sholat state timing parameters */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-6 text-[#D4AF37] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-500" /> Konfigurasi Fase Durasi Ibadah
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Fose 1. Adzan</label>
                    </div>
                    <span className="text-[10px] text-zinc-500 mb-3 leading-relaxed">Durasi memutar audio/alert adzan berkumandang.</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={settings.adzanDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, adzanDuration: parseInt(e.target.value) || 0 }))}
                        required
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none text-white focus:border-emerald-500 text-sm w-24 text-center font-bold"
                      />
                      <span className="text-xs text-zinc-300 font-medium">detik</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Fose 2. Iqomah</label>
                    </div>
                    <span className="text-[10px] text-zinc-500 mb-3 leading-relaxed">Hitung mundur iqomah mempersiapkan shaf jamaah.</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={settings.iqomahDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, iqomahDuration: parseInt(e.target.value) || 0 }))}
                        required
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none text-white focus:border-emerald-500 text-sm w-24 text-center font-bold"
                      />
                      <span className="text-xs text-zinc-300 font-medium">detik</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Fose 3. Solat</label>
                    </div>
                    <span className="text-[10px] text-zinc-500 mb-3 leading-relaxed">Durasi ibadah silent shalat berjamaah berlangsung.</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={settings.prayerDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, prayerDuration: parseInt(e.target.value) || 0 }))}
                        required
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 outline-none text-white focus:border-emerald-500 text-sm w-24 text-center font-bold"
                      />
                      <span className="text-xs text-zinc-300 font-medium">detik</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Main Background Image */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-lg font-bold mb-6 text-[#D4AF37] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-500" /> Background Utama Layar TV
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  
                  {/* Upload & URL Input Area */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Unggah File Background</label>
                      <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-950/40 flex flex-col items-center justify-center text-center gap-3 relative cursor-pointer hover:border-emerald-500/50 transition-colors h-36">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleMainBgUpload}
                          disabled={mainBgUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                        />
                        {mainBgUploading ? (
                          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-zinc-500" />
                            <div>
                              <span className="text-xs font-bold text-emerald-500">Klik / Seret Gambar</span>
                              <p className="text-[10px] text-zinc-500 mt-1">Maks 5MB. Aspek rasio 16:9 disarankan.</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Atau Tempel URL Background Gambar</label>
                      <div className="flex gap-2">
                        <input 
                          type="url"
                          value={settings.backgroundImage || ''}
                          onChange={(e) => setSettings(prev => ({ ...prev, backgroundImage: e.target.value || null }))}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white focus:border-emerald-500 text-xs font-mono font-bold flex-1"
                          placeholder="https://images.unsplash.com/..."
                        />
                        {settings.backgroundImage && (
                          <button
                            type="button"
                            onClick={() => setSettings(prev => ({ ...prev, backgroundImage: null }))}
                            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all"
                            title="Hapus URL"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview Area */}
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Preview Background</label>
                       {settings.backgroundImage && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400">AKTIFKAN</span>
                            <button
                              type="button"
                              onClick={handleToggleMainBg}
                              className={`w-10 h-5 rounded-full transition-all relative flex items-center p-1 ${
                                settings.backgroundActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                              }`}
                            >
                              <div className="w-3.5 h-3.5 bg-white rounded-full shadow-lg"></div>
                            </button>
                          </div>
                       )}
                    </div>

                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                      {settings.backgroundImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={settings.backgroundImage} 
                          alt="Background" 
                          className={`w-full h-full object-cover transition-opacity ${settings.backgroundActive ? 'opacity-100' : 'opacity-40 grayscale'}`}
                        />
                      ) : (
                        <span className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Belum ada background</span>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>

            </div>

            {/* Right panel: Locations */}
            <div className="flex flex-col gap-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-6 text-[#D4AF37] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-500" /> Penyelaras Lokasi & Kiblat
                  </h3>

                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Pencarian Tempat / Kota</span>
                      <NominatimSearch onPlaceSelect={handlePlaceSelect} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">Latitude</span>
                        <input 
                          type="number" 
                          step="0.000001"
                          value={settings.latitude}
                          onChange={(e) => setSettings(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">Longitude</span>
                        <input 
                          type="number" 
                          step="0.000001"
                          value={settings.longitude}
                          onChange={(e) => setSettings(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                          className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Metode Perhitungan Adhan</span>
                      <select
                        value={settings.calculationMethod}
                        onChange={(e) => setSettings(prev => ({ ...prev, calculationMethod: parseInt(e.target.value) || 4 }))}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-sm font-semibold"
                      >
                        <option value={20}>Kemenag RI (Kementerian Agama Indonesia)</option>
                        <option value={4}>Umm Al-Qura (Makkah, Arab Saudi)</option>
                        <option value={3}>Liga Dunia Islam (Muslim World League)</option>
                        <option value={2}>Masyarakat Islam Amerika Utara (ISNA)</option>
                        <option value={1}>Universitas Ilmu Islam, Karachi</option>
                        <option value={5}>Oblast Mesir (Egyptian General Authority)</option>
                      </select>
                    </div>
                  </div>

                  {/* Leaflet Dynamic Picker map */}
                  <div className="w-full h-48 border border-zinc-800 rounded-2xl overflow-hidden mb-6 z-0">
                    <DynamicMapPicker 
                      center={mapCenter} 
                      onLocationSelect={handleMapClick} 
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full py-4 bg-[#D4AF37] hover:bg-[#ebd586] disabled:bg-zinc-700 text-zinc-950 rounded-xl text-sm font-black tracking-wider transition-colors uppercase cursor-pointer"
                >
                  {saveLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-950" /> : 'Simpan Semua Konfigurasi'}
                </button>
              </div>
            </div>

          </form>
        )}

        {/* Tab Content 2: Announcements */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Form to add */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-fit">
              <h3 className="text-lg font-bold mb-6 text-[#D4AF37] flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" /> Tulis Ticker Pengumuman
              </h3>
              
              <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">Isi Text Pengumuman</label>
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
        )}

        {/* Tab Content 3: Full Banners */}
        {activeTab === 'banners' && (
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
                  
                  {/* Drag drop mockup area converting to Base64 in standard react */}
                  <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-950/40 flex flex-col items-center justify-center text-center gap-3 relative cursor-pointer hover:border-emerald-500/50 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-zinc-500 animate-pulse" />
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

          </div>
        )}

        {/* Tab Content 4: Dev Sandbox */}
        {activeTab === 'sandbox' && (
          <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-left">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#D4AF37]">Dev Sandbox & Simulators</h3>
                <p className="text-xs text-zinc-400">Manipulasi waktu, simulasi percepatan, dan force override untuk menguji transisi fase Jam Masjid.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Sandbox Config */}
              <div className="flex flex-col gap-6">
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold text-white uppercase tracking-wide">Mode Sandbox</span>
                      <p className="text-[10px] text-zinc-500">Aktifkan manipulasi waktu virtual aplikasi.</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const nextActive = !settings.sandboxActive;
                        setSettings(prev => ({ ...prev, sandboxActive: nextActive }));
                        await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sandboxActive: nextActive })
                        });
                        showAlert('success', nextActive ? 'Mode Sandbox diaktifkan!' : 'Mode Sandbox dinonaktifkan.');
                      }}
                      className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 ${
                        settings.sandboxActive ? 'bg-emerald-600 justify-end' : 'bg-zinc-700 justify-start'
                      }`}
                    >
                      <div className="w-6 h-6 bg-white rounded-full shadow-lg"></div>
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Simulasi Force Stage</span>
                  <p className="text-[10px] text-zinc-500">Paksa tampilan TV Display untuk masuk ke fase tertentu secara instan.</p>
                  
                  <select
                    value={settings.sandboxStage || 'AUTO'}
                    disabled={!settings.sandboxActive}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setSettings(prev => ({ ...prev, sandboxStage: val as any }));
                      await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sandboxStage: val })
                      });
                      showAlert('success', `Simulasi fase diubah ke ${val}`);
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="AUTO">Otomatis (Ikuti Waktu)</option>
                    <option value="NORMAL">Normal (Tampilan Jam & Jadwal)</option>
                    <option value="ADZAN">Adzan (Hitung Mundur Adzan)</option>
                    <option value="IQOMAH">Iqomah (Hitung Mundur Iqomah)</option>
                    <option value="PRAYING">Praying (Fase Silent Ibadah)</option>
                  </select>
                </div>

                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Faktor Percepatan Waktu</span>
                  <p className="text-[10px] text-zinc-500">Mempercepat jalannya waktu virtual sholat (sangat berguna untuk menguji transisi countdown).</p>
                  
                  <select
                    value={settings.sandboxSpeed || 1.0}
                    disabled={!settings.sandboxActive}
                    onChange={async (e) => {
                      const val = parseFloat(e.target.value);
                      setSettings(prev => ({ ...prev, sandboxSpeed: val }));
                      await fetch('/api/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sandboxSpeed: val })
                      });
                      showAlert('success', `Percepatan waktu diubah ke ${val}x`);
                    }}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={1.0}>1x (Waktu Normal)</option>
                    <option value={5.0}>5x (5 Detik Virtual per Detik Nyata)</option>
                    <option value={10.0}>10x</option>
                    <option value={60.0}>60x (1 Menit Virtual per Detik Nyata)</option>
                    <option value={300.0}>300x (5 Menit Virtual per Detik Nyata)</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Time Travel Quick Presets */}
              <div className="flex flex-col gap-6">
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Time Travel / Set Waktu Virtual</span>
                  <p className="text-[10px] text-zinc-500">Atur waktu virtual ke jam, menit, dan detik tertentu.</p>
                  
                  <div className="flex gap-3">
                    <input
                      type="datetime-local"
                      disabled={!settings.sandboxActive}
                      value={settings.sandboxTime ? new Date(new Date(settings.sandboxTime).getTime() - new Date().getTimezoneOffset()*60*1000).toISOString().substring(0, 16) : ""}
                      onChange={async (e) => {
                        const isoStr = e.target.value ? new Date(e.target.value).toISOString() : null;
                        setSettings(prev => ({ ...prev, sandboxTime: isoStr }));
                        await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sandboxTime: isoStr })
                        });
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-white text-xs font-mono font-bold flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={!settings.sandboxActive}
                      onClick={async () => {
                        setSettings(prev => ({ ...prev, sandboxTime: null }));
                        await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sandboxTime: null })
                        });
                        showAlert('success', 'Waktu virtual direset ke waktu sekarang.');
                      }}
                      className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-4">
                  <span className="text-sm font-bold text-white uppercase tracking-wide">Aksi Cepat Simulasi Fase</span>
                  <p className="text-[10px] text-zinc-500">Atur waktu virtual secara otomatis mendekati fase sholat terdekat (misal sholat Zuhur jam 12:00).</p>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      type="button"
                      disabled={!settings.sandboxActive}
                      onClick={async () => {
                        // Let's travel virtual time to Zuhur minus 1 minute
                        const today = new Date();
                        today.setHours(11, 59, 0, 0);
                        const isoStr = today.toISOString();
                        
                        setSettings(prev => ({ ...prev, sandboxTime: isoStr, sandboxStage: 'AUTO' }));
                        await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sandboxTime: isoStr, sandboxStage: 'AUTO' })
                        });
                        showAlert('success', 'Waktu disetel ke 1 menit sebelum Zuhur (11:59). Sempurna untuk menguji transisi Adzan!');
                      }}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold text-left px-5 flex justify-between items-center transition-all animate-none"
                    >
                      <span>1 Menit Sebelum Adzan Zuhur (11:59)</span>
                      <span className="text-[#D4AF37] font-bold uppercase tracking-wider text-[10px]">Populer</span>
                    </button>

                    <button
                      type="button"
                      disabled={!settings.sandboxActive}
                      onClick={async () => {
                        // Zuhur is 12:00, Adzan is 180 seconds.
                        // Iqomah starts at 12:03:00.
                        // Travel to 12:03:10 for Iqomah countdown testing.
                        const today = new Date();
                        today.setHours(12, 3, 10, 0);
                        const isoStr = today.toISOString();
                        
                        setSettings(prev => ({ ...prev, sandboxTime: isoStr, sandboxStage: 'AUTO' }));
                        await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sandboxTime: isoStr, sandboxStage: 'AUTO' })
                        });
                        showAlert('success', 'Waktu disetel ke 12:03:10 (Awal Iqomah Zuhur). Sempurna untuk menguji Iqomah!');
                      }}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold text-left px-5 flex justify-between items-center transition-all animate-none"
                    >
                      <span>Simulasikan Hitung Mundur Iqomah Zuhur (12:03)</span>
                    </button>

                    <button
                      type="button"
                      disabled={!settings.sandboxActive}
                      onClick={async () => {
                        // Night time travel for sleep mode testing (e.g. 23:30)
                        const today = new Date();
                        today.setHours(23, 30, 0, 0);
                        const isoStr = today.toISOString();
                        
                        setSettings(prev => ({ ...prev, sandboxTime: isoStr, sandboxStage: 'AUTO' }));
                        await fetch('/api/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sandboxTime: isoStr, sandboxStage: 'AUTO' })
                        });
                        showAlert('success', 'Waktu disetel ke 23:30. Tampilan TV akan masuk ke Mode Hemat Energi / Istirahat.');
                      }}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold text-left px-5 flex justify-between items-center transition-all animate-none"
                    >
                      <span>Simulasikan Jam Istirahat Tampilan / Standby (23:30)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

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
