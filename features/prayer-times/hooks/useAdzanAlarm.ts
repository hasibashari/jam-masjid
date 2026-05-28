'use client';

import { useEffect, useRef } from 'react';

interface UseAdzanAlarmProps {
  prayerStage: string;
  stageSecondsLeft: number | undefined;
  adzanAudioActive: boolean;
  adzanAudioUrl: string;
  adzanAudioVolume: number;
}

export function useAdzanAlarm({
  prayerStage,
  stageSecondsLeft,
  adzanAudioActive,
  adzanAudioUrl,
  adzanAudioVolume,
}: UseAdzanAlarmProps) {
  const adzanAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastBeepedSecondRef = useRef<number | null>(null);

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

  // 2. Web Audio API Offline Beep Synthesizer
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
