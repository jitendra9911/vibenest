import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function DeepLinkHandler() {
  const { toast } = useToast();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      console.log('[DeepLinkHandler] Not running on native platform, skipping');
      return;
    }

    console.log('[DeepLinkHandler] Setting up deep link listener on native platform');
    let listener: any;

    const setupListener = async () => {
      listener = await CapacitorApp.addListener('appUrlOpen', async (event) => {
        const url = event.url;
        console.log('[DeepLinkHandler] Received deep link:', url);
        
        // Check if this is an OAuth callback
        if (url.includes('vibenest://auth/callback')) {
          console.log('[DeepLinkHandler] OAuth callback detected, closing browser');
          
          // Close the system browser
          await Browser.close().catch(err => {
            console.warn('[DeepLinkHandler] Failed to close browser:', err);
          });
          
          // Extract token from URL
          const urlObj = new URL(url);
          const token = urlObj.searchParams.get('token');
          console.log('[DeepLinkHandler] Extracted token:', token ? 'present' : 'missing');
          
          if (token) {
            try {
              console.log('[DeepLinkHandler] Exchanging token for session...');
              await apiRequest('POST', '/api/auth/mobile-exchange', { token });
              console.log('[DeepLinkHandler] Token exchange successful!');
              
              // Show success message
              toast({
                title: "Login Successful!",
                description: "Welcome to VibeNest",
              });
              
              // Invalidate auth query to trigger re-fetch and update UI
              await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
              console.log('[DeepLinkHandler] Auth query invalidated, UI should update');
            } catch (error) {
              console.error('[DeepLinkHandler] Failed to exchange token:', error);
              toast({
                title: "Login Failed",
                description: "Could not complete authentication. Please try again.",
                variant: "destructive",
              });
            }
          } else {
            console.error('[DeepLinkHandler] No token found in callback URL');
            toast({
              title: "Login Error",
              description: "Authentication token missing. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          console.log('[DeepLinkHandler] Deep link is not an auth callback:', url);
        }
      });
      console.log('[DeepLinkHandler] Listener registered successfully');
    };

    setupListener();

    return () => {
      if (listener) {
        console.log('[DeepLinkHandler] Removing deep link listener');
        listener.remove();
      }
    };
  }, [toast]);

  return null;
}
