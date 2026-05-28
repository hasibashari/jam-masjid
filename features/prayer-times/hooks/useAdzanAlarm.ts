'use client';

import { useEffect, useRef } from 'react';

interface UseAdzanAlarmProps {
  prayerStage: string;
  stageSecondsLeft: number | undefined;
  adzanAudioActive: boolean;
  adzanAudioUrl: string;
  adzanAudioVolume: number;
  currentTime: Date | null;
  fajrTime: Date | null;
  tahrimAudioActive: boolean;
  tahrimAudioUrl: string;
  tahrimDuration: number;
}

export function useAdzanAlarm({
  prayerStage,
  stageSecondsLeft,
  adzanAudioActive,
  adzanAudioUrl,
  adzanAudioVolume,
  currentTime,
  fajrTime,
  tahrimAudioActive,
  tahrimAudioUrl,
  tahrimDuration,
}: UseAdzanAlarmProps) {
  const adzanAudioRef = useRef<HTMLAudioElement | null>(null);
  const tahrimAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastBeepedSecondRef = useRef<number | null>(null);
  const hasPlayedAdzanAlarmRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (adzanAudioRef.current) {
        adzanAudioRef.current.pause();
      }
      if (tahrimAudioRef.current) {
        tahrimAudioRef.current.pause();
      }
    };
  }, []);

  // Tahrim Background Audio Player
  useEffect(() => {
    if (!tahrimAudioActive || !tahrimAudioUrl || !fajrTime || !currentTime || prayerStage === 'ADZAN') {
      if (tahrimAudioRef.current) {
        tahrimAudioRef.current.pause();
        tahrimAudioRef.current.currentTime = 0;
      }
      return;
    }

    // Calculate remaining milliseconds until Subuh (Fajr)
    const msToFajr = fajrTime.getTime() - currentTime.getTime();
    const tahrimWindowMs = tahrimDuration * 60 * 1000;

    // Play Tahrim within the configured pre-Fajr window (e.g. 10 minutes before)
    if (msToFajr > 0 && msToFajr <= tahrimWindowMs) {
      try {
        if (!tahrimAudioRef.current) {
          tahrimAudioRef.current = new Audio(tahrimAudioUrl);
        } else if (tahrimAudioRef.current.src !== tahrimAudioUrl) {
          tahrimAudioRef.current.pause();
          tahrimAudioRef.current = new Audio(tahrimAudioUrl);
        }

        // Soft background volume (comfortable volume levels)
        tahrimAudioRef.current.volume = Math.max(0.1, adzanAudioVolume - 0.2);
        tahrimAudioRef.current.loop = false;

        if (tahrimAudioRef.current.paused) {
          tahrimAudioRef.current.play().catch((err) => {
            console.warn("Autoplay blocked or Tahrim audio failed to load:", err);
          });
        }
      } catch (err) {
        console.error("Tahrim audio player error:", err);
      }
    } else {
      if (tahrimAudioRef.current) {
        tahrimAudioRef.current.pause();
        tahrimAudioRef.current.currentTime = 0;
      }
    }
  }, [currentTime, fajrTime, tahrimAudioActive, tahrimAudioUrl, tahrimDuration, adzanAudioVolume, prayerStage]);

  // 1. Adzan Player Trigger
  useEffect(() => {
    if (prayerStage === 'ADZAN' && adzanAudioActive && adzanAudioUrl) {
      try {
        if (!adzanAudioRef.current) {
          adzanAudioRef.current = new Audio(adzanAudioUrl);
        } else if (adzanAudioRef.current.src !== adzanAudioUrl) {
          adzanAudioRef.current.pause();
          adzanAudioRef.current = new Audio(adzanAudioUrl);
        }
        
        adzanAudioRef.current.volume = adzanAudioVolume;
        adzanAudioRef.current.play().catch((err) => {
          console.warn("Autoplay blocked or adzan audio failed to load:", err);
        });
      } catch (err) {
        console.error("Adzan audio player error:", err);
      }
    } else {
      // Clean stop & mute when leaving ADZAN stage
      if (adzanAudioRef.current) {
        adzanAudioRef.current.pause();
        adzanAudioRef.current.currentTime = 0;
      }
    }
  }, [prayerStage, adzanAudioActive, adzanAudioUrl, adzanAudioVolume]);

  // 2. Fallback beep alarm for ADZAN stage (when adzan audio is disabled/inactive)
  useEffect(() => {
    if (prayerStage !== 'ADZAN') {
      hasPlayedAdzanAlarmRef.current = false;
      return;
    }

    if (adzanAudioActive || hasPlayedAdzanAlarmRef.current) {
      return;
    }

    hasPlayedAdzanAlarmRef.current = true;

    // Play a premium synthetic "beep-beep-chime" alarm using Web Audio API
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      
      const playBeep = (delay: number, duration: number, frequency: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        const startTime = audioCtx.currentTime + delay;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Play a neat double-beep followed by a higher resolved tone
      playBeep(0, 0.22, 987.77);      // B5 note
      playBeep(0.3, 0.22, 987.77);    // B5 note
      playBeep(0.6, 0.45, 1318.51);   // E6 note
    } catch (e) {
      console.warn("Failed to play synthetic adzan warning alarm:", e);
    }
  }, [prayerStage, adzanAudioActive]);

  // 3. Web Audio API Offline Beep Synthesizer for IQOMAH
  useEffect(() => {
    if (prayerStage !== 'IQOMAH' || stageSecondsLeft === undefined || stageSecondsLeft > 10 || stageSecondsLeft < 0) {
      lastBeepedSecondRef.current = null;
      return;
    }

    // Protect: ensure beep rings only once per second
    if (lastBeepedSecondRef.current === stageSecondsLeft) {
      return;
    }
    lastBeepedSecondRef.current = stageSecondsLeft;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';

      if (stageSecondsLeft > 0) {
        // High pitched short warning beep (880Hz, 120ms)
        oscillator.frequency.value = 880;
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.12);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
      } else if (stageSecondsLeft === 0) {
        // Deep long alarm double-pitch for prayer start (1000Hz, 500ms)
        oscillator.frequency.value = 1000;
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn("Failed to play synthetic warning beep:", e);
    }
  }, [prayerStage, stageSecondsLeft]);
}
