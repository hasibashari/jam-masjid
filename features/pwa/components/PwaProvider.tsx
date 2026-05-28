'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    
    // Set initial state
    setIsOnline(navigator.onLine);

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }

    // 2. Network Status Event Listeners
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      console.log('[PWA] App is online. Dispatching sync event...');
      
      // Dispatch custom event to trigger instant data synchronization in components
      window.dispatchEvent(new CustomEvent('app-sync-data'));

      // Dismiss the "Back Online" toast after 4 seconds
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
      console.log('[PWA] App went offline. Running on cached assets.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      <AnimatePresence>
        {/* 1. Offline Mode Banner Status */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-8 z-50 flex items-center gap-4 bg-zinc-950/80 border border-amber-500/30 rounded-3xl p-4 md:p-5 backdrop-blur-md shadow-2xl max-w-sm"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-500">
              <WifiOff className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 border border-zinc-950 rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 border border-zinc-950 rounded-full"></span>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-white text-sm font-bold tracking-tight">
                Mode Offline Aktif
              </span>
              <span className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                Koneksi terputus. Menampilkan data cache. Waktu sholat tetap akurat.
              </span>
            </div>
          </motion.div>
        )}

        {/* 2. Reconnected Syncing Toast */}
        {isOnline && showOnlineToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 left-8 z-50 flex items-center gap-4 bg-zinc-950/80 border border-emerald-500/30 rounded-3xl p-4 md:p-5 backdrop-blur-md shadow-2xl max-w-sm"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400">
              <Wifi className="w-5 h-5 animate-pulse" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border border-zinc-950 rounded-full animate-ping"></span>
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border border-zinc-950 rounded-full"></span>
            </div>
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-sm font-bold tracking-tight">
                  Kembali Online
                </span>
                <div className="flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded-full p-0.5">
                  <Check className="w-3. h-3" />
                </div>
              </div>
              <span className="text-zinc-400 text-xs mt-0.5 leading-relaxed">
                Koneksi pulih. Data terbaru berhasil disinkronkan secara otomatis.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
