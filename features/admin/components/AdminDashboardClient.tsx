'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Megaphone, 
  Image as ImageIcon, 
  Clock, 
  Loader2, 
  Check, 
  AlertTriangle,
  ExternalLink,
  LogOut,
  Quote as QuoteIcon
} from 'lucide-react';
import { AppSettings, AnnouncementType, BannerType, QuoteType, FALLBACK_SETTINGS } from '@/shared/types';

import SettingsTab from '@/features/settings/components/SettingsTab';
import AnnouncementsTab from '@/features/announcements/components/AnnouncementsTab';
import BannersTab from '@/features/announcements/components/BannersTab';
import QuotesTab from '@/features/quotes/components/QuotesTab';

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<'settings' | 'announcements' | 'banners' | 'quotes'>('settings');
  const [loading, setLoading] = useState(true);

  // Consolidated global settings & data states
  const [settings, setSettings] = useState<AppSettings>(FALLBACK_SETTINGS);
  const [prayerTimings, setPrayerTimings] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [quotes, setQuotes] = useState<QuoteType[]>([]);

  // Toast status alert
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch all starting parameters on load
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [settingsRes, announcementsRes, bannersRes, quotesRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/announcements?all=true'),
          fetch('/api/banners?all=true'),
          fetch('/api/quotes?all=true')
        ]);

        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setSettings(s);
          try {
            const ptRes = await fetch(`/api/prayer-times?lat=${s.latitude}&lng=${s.longitude}&method=${s.calculationMethod}`);
            if (ptRes.ok) {
              const ptData = await ptRes.json();
              setPrayerTimings(ptData.timings);
            }
          } catch (e) {
            console.error("Failed to load prayer times", e);
          }
        }
        if (announcementsRes.ok) {
          const a = await announcementsRes.json();
          setAnnouncements(a);
        }
        if (bannersRes.ok) {
          const b = await bannersRes.json();
          setBanners(b);
        }
        if (quotesRes.ok) {
          const q = await quotesRes.json();
          setQuotes(q);
        }
      } catch (err) {
        console.error("Failed loading admin panel data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Reactively refetch prayer timings if coordinates or calculation method changes
  useEffect(() => {
    if (!settings.latitude || !settings.longitude) return;
    const fetchTimings = async () => {
      try {
        const ptRes = await fetch(`/api/prayer-times?lat=${settings.latitude}&lng=${settings.longitude}&method=${settings.calculationMethod}`);
        if (ptRes.ok) {
          const ptData = await ptRes.json();
          setPrayerTimings(ptData.timings);
        }
      } catch (e) {
        console.error("Failed to update prayer times", e);
      }
    };
    fetchTimings();
  }, [settings.latitude, settings.longitude, settings.calculationMethod]);

  // Set timeout helper for alerts
  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4000);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/admin/login';
      } else {
        showAlert('error', 'Gagal keluar dari sesi.');
      }
    } catch (e) {
      console.error("Logout failed:", e);
      showAlert('error', 'Terjadi kesalahan sistem saat mencoba keluar.');
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
      {/* Alert Banner floats - Centered at the top on mobile, right on desktop */}
      {alertMsg && (
        <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-8 md:top-8 z-50 flex items-center gap-3 px-5 md:px-6 py-3.5 md:py-4 rounded-xl shadow-2xl transition-all duration-300 animate-slide-in border ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950 border-rose-500/30 text-rose-400'
        }`}>
          {alertMsg.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span className="text-xs md:text-sm font-semibold leading-relaxed">{alertMsg.text}</span>
        </div>
      )}

      {/* Admin Navbar - Stacked on mobile, side-by-side on desktop */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-3 md:py-4 px-4 sm:px-8 md:px-12 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center shrink-0">
            <SettingsIcon className="w-5.5 h-5.5 md:w-6 md:h-6 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight font-sans leading-none uppercase">PANEL KONTROL DIGITAL</h1>
            <p className="text-[10px] md:text-xs text-zinc-400 mt-1 max-w-[280px] sm:max-w-md">Kelola informasi masjid, parameter hitung mundur adzan & iqomah, serta poster display TV.</p>
          </div>
        </div>
        
        <div className="flex gap-2 sm:gap-4 w-full md:w-auto justify-end">
          <a 
            href="/" 
            target="_blank" 
            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-xs md:text-sm font-bold transition-all flex-1 md:flex-initial"
          >
            <span>Buka TV</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-rose-950 hover:bg-rose-900 border border-rose-500/20 text-rose-400 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex-1 md:flex-initial"
          >
            <span>Keluar</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container - Optimized paddings for mobile */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 mt-4 md:mt-8">
        
        {/* Touch-Friendly horizontal scrollable navigation tab bar */}
        <div className="relative border-b border-zinc-900 mb-4 md:mb-6 select-none">
          <nav className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mb-[1px]">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 snap-start ${
                activeTab === 'settings' 
                  ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                  : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              <span>Settings Masjid & Durasi</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 snap-start ${
                activeTab === 'announcements' 
                  ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                  : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" />
              <span>Pengumuman Text Ticker</span>
            </button>

            <button 
              onClick={() => setActiveTab('banners')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 snap-start ${
                activeTab === 'banners' 
                  ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                  : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span>Full Poster Banners</span>
            </button>

            <button 
              onClick={() => setActiveTab('quotes')}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 snap-start ${
                activeTab === 'quotes' 
                  ? 'bg-emerald-900/30 text-[#D4AF37] border-b-2 border-[#D4AF37]' 
                  : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-white'
              }`}
            >
              <QuoteIcon className="w-4 h-4 shrink-0" />
              <span>Kata Motivasi / Quotes</span>
            </button>
          </nav>
        </div>

        {/* Render Active Tab Component */}
        <div className="transition-opacity duration-300">
          {activeTab === 'settings' && (
            <SettingsTab 
              settings={settings} 
              setSettings={setSettings} 
              showAlert={showAlert} 
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsTab 
              announcements={announcements} 
              setAnnouncements={setAnnouncements} 
              showAlert={showAlert} 
            />
          )}

          {activeTab === 'banners' && (
            <BannersTab 
              banners={banners} 
              setBanners={setBanners} 
              showAlert={showAlert} 
            />
          )}

          {activeTab === 'quotes' && (
            <QuotesTab 
              quotes={quotes} 
              setQuotes={setQuotes} 
              showAlert={showAlert} 
            />
          )}
        </div>

      </main>
    </div>
  );
}
