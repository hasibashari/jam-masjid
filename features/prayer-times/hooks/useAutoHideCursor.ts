'use client';

import { useEffect, useState } from 'react';

export function useAutoHideCursor() {
  const [mouseActive, setMouseActive] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = () => {
      setMouseActive(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMouseActive(false);
      }, 3000); // 3 seconds timeout
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial trigger
    timeoutId = setTimeout(() => {
      setMouseActive(false);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!mouseActive) {
      document.body.classList.add('cursor-none');
    } else {
      document.body.classList.remove('cursor-none');
    }
    return () => {
      document.body.classList.remove('cursor-none');
    };
  }, [mouseActive]);

  return mouseActive;
}
