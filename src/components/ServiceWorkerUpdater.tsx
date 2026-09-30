'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cacheCurrentDocument, reportPwaError } from '@/lib/pwa';

export function ServiceWorkerUpdater() {
  const [showReload, setShowReload] = useState(false);
  const [wb, setWb] = useState<Workbox | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' && 'serviceWorker' in navigator) {
      const wbInstance = new Workbox('/sw.js');
      setWb(wbInstance);
      let disposed = false;
      let registering = false;
      let registered = false;

      const showSkipWaitingPrompt = () => {
        setShowReload(true);
      };

      wbInstance.addEventListener('waiting', showSkipWaitingPrompt);

      const register = async () => {
        if (disposed || registering || registered || !navigator.onLine) return;
        registering = true;
        try {
          await wbInstance.register();
          registered = true;
        } catch (error) {
          if (!disposed) reportPwaError(error, 'pwa.register_service_worker');
        } finally {
          registering = false;
        }
      };

      void register();
      window.addEventListener('online', register);
      return () => {
        disposed = true;
        wbInstance.removeEventListener('waiting', showSkipWaitingPrompt);
        window.removeEventListener('online', register);
      };
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || !('serviceWorker' in navigator)) return;

    const controller = new AbortController();
    let caching = false;
    const cacheDocument = async () => {
      if (caching || controller.signal.aborted) return;
      caching = true;
      try {
        await cacheCurrentDocument(controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) reportPwaError(error, 'pwa.cache_document');
      } finally {
        caching = false;
      }
    };

    void cacheDocument();
    window.addEventListener('online', cacheDocument);
    return () => {
      controller.abort();
      window.removeEventListener('online', cacheDocument);
    };
  }, [pathname]);

  const reloadPage = () => {
    if (wb) {
      wb.addEventListener('controlling', () => {
        window.location.reload();
      });
      wb.messageSkipWaiting();
    }
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 rounded-lg bg-background p-4 shadow-lg border border-border">
      <p className="text-sm font-medium">New version available!</p>
      <Button size="sm" onClick={reloadPage}>
        Refresh
      </Button>
    </div>
  );
}
