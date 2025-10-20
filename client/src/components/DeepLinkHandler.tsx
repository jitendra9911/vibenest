import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { queryClient } from '@/lib/queryClient';

export function DeepLinkHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let listener: any;

    const setupListener = async () => {
      listener = await CapacitorApp.addListener('appUrlOpen', async (event) => {
        const url = event.url;
        
        // Check if this is an OAuth callback
        if (url.includes('vibenest://auth/callback')) {
          // Close the system browser
          await Browser.close();
          
          // Invalidate auth query to trigger re-fetch
          queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        }
      });
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  return null;
}
