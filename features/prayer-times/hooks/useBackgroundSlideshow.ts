'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { AppSettings, BackgroundTransitionEffect } from '@/shared/types';

interface UseBackgroundSlideshowReturn {
  currentBgUrl: string | null;
  prevBgUrl: string | null;
  activeBgList: { id: string; url: string; active: boolean }[];
  triggerTransition: boolean;
  getTransitionClasses: (isIncoming: boolean) => string;
  setBgError: (v: boolean) => void;
  bgError: boolean;
}

export function useBackgroundSlideshow(
  settings: AppSettings,
  externalBgError: boolean,
  setExternalBgError: (v: boolean) => void,
): UseBackgroundSlideshowReturn {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [currentBgUrl, setCurrentBgUrl] = useState<string | null>(
    settings.backgroundImage || null,
  );
  const [prevBgUrl, setPrevBgUrl] = useState<string | null>(null);
  const [triggerTransition, setTriggerTransition] = useState(false);

  const activeBgList = useMemo(() => {
    return Array.isArray(settings.backgroundImages)
      ? settings.backgroundImages.filter((img) => img.active)
      : [];
  }, [settings.backgroundImages]);

  // Reset when backgroundActive / slideshow / single image changes
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    if (!settings.backgroundActive) {
      setCurrentBgUrl(null);
      setPrevBgUrl(null);
      return;
    }

    if (settings.backgroundSlideshowActive && activeBgList.length > 0) {
      setCurrentBgUrl(activeBgList[0]?.url || null);
      setCurrentBgIndex(0);
      setPrevBgUrl(null);
    } else {
      setCurrentBgUrl(settings.backgroundImage || null);
      setPrevBgUrl(null);
    }
  }, [
    settings.backgroundActive,
    settings.backgroundSlideshowActive,
    settings.backgroundImage,
    activeBgList.length,
  ]);

  // Keep ref synced to avoid stale closure in slideshow interval
  const activeBgListRef = useRef(activeBgList);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    activeBgListRef.current = activeBgList;
  }, [activeBgList]);

  // Reset bgError when the current slide URL changes
  useEffect(() => {
    if (currentBgUrl) {
      setExternalBgError(false);
    }
  }, [currentBgUrl, setExternalBgError]);

  // Cycle slides on an interval (stable — does not restart on every poll)
  useEffect(() => {
    if (!settings.backgroundActive || !settings.backgroundSlideshowActive) return;
    if (activeBgListRef.current.length <= 1) return;

    const intervalSec = settings.backgroundSlideshowInterval || 10;

    const timer = setInterval(() => {
      const list = activeBgListRef.current;
      if (list.length <= 1) return;

      setCurrentBgIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % list.length;

        setPrevBgUrl(list[prevIndex]?.url || null);
        setCurrentBgUrl(list[nextIndex]?.url || null);
        setTriggerTransition(true);

        if (transitionTimerRef.current) {
          clearTimeout(transitionTimerRef.current);
        }

        transitionTimerRef.current = setTimeout(() => {
          setTriggerTransition(false);
          setPrevBgUrl(null);
          transitionTimerRef.current = null;
        }, 1000); // 1s transition duration

        return nextIndex;
      });
    }, intervalSec * 1000);

    return () => {
      clearInterval(timer);
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [
    settings.backgroundActive,
    settings.backgroundSlideshowActive,
    settings.backgroundSlideshowInterval,
  ]);

  // Transition CSS class resolver based on configured effect
  const getTransitionClasses = (isIncoming: boolean): string => {
    const effect: BackgroundTransitionEffect = settings.backgroundTransitionEffect || 'fade';

    if (effect === 'zoom') {
      return isIncoming
        ? triggerTransition
          ? 'scale-100 opacity-75 transition-all duration-[1000ms] ease-out brightness-95'
          : 'scale-100 opacity-75 brightness-95 transition-all duration-[1000ms]'
        : triggerTransition
          ? 'scale-105 opacity-0 transition-all duration-[1000ms] ease-in'
          : 'scale-100 opacity-0 transition-none';
    }

    if (effect === 'slide') {
      return isIncoming
        ? triggerTransition
          ? 'translate-x-0 opacity-75 transition-all duration-[1000ms] ease-out'
          : 'translate-x-0 opacity-75 brightness-95 transition-all duration-[1000ms]'
        : triggerTransition
          ? '-translate-x-full opacity-0 transition-all duration-[1000ms] ease-in'
          : 'translate-x-0 opacity-0 transition-none';
    }

    if (effect === 'blur') {
      return isIncoming
        ? triggerTransition
          ? 'blur-none opacity-75 transition-all duration-[1000ms] ease-out'
          : 'blur-none opacity-75 brightness-95 transition-all duration-[1000ms]'
        : triggerTransition
          ? 'blur-md opacity-0 transition-all duration-[1000ms] ease-in'
          : 'blur-none opacity-0 transition-none';
    }

    // Default: Fade
    return isIncoming
      ? triggerTransition
        ? 'opacity-75 transition-opacity duration-[1000ms] ease-out'
        : 'opacity-75 brightness-95 transition-all duration-[1000ms]'
      : triggerTransition
        ? 'opacity-0 transition-opacity duration-[1000ms] ease-in'
        : 'opacity-0 transition-none';
  };

  return {
    currentBgUrl,
    prevBgUrl,
    activeBgList,
    triggerTransition,
    getTransitionClasses,
    bgError: externalBgError,
    setBgError: setExternalBgError,
  };
}
