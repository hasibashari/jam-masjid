'use client';

import { useEffect, useRef } from 'react';

export function useWakeLock() {
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('[WakeLock] Acquired successfully');
      }
    } catch (err) {
      console.warn('[WakeLock] Failed to acquire screen wake lock:', err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('[WakeLock] Released');
      }
    } catch (err) {
      console.error('[WakeLock] Failed to release screen wake lock:', err);
    }
  };

  useEffect(() => {
    requestWakeLock();
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, []);
}
