import { useState, useEffect } from 'react';

const DESKTOP_BREAKPOINT = 1280;

export function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= DESKTOP_BREAKPOINT;
    }
    return false;
  });

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isDesktop;
}
