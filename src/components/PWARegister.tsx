'use client';

import { useEffect } from 'react';

// Registers the service worker so the app is installable (Add to Home Screen).
export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const onLoad = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
      window.addEventListener('load', onLoad);
      return () => window.removeEventListener('load', onLoad);
    }
  }, []);
  return null;
}
