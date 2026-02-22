"use client";

import { useEffect, useState } from "react";
import { Workbox } from "workbox-window";
import { Button } from "@/components/ui/button";

export function ServiceWorkerUpdater() {
  const [showReload, setShowReload] = useState(false);
  const [wb, setWb] = useState<Workbox | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const wbInstance = new Workbox("/sw.js");
      setWb(wbInstance);

      const showSkipWaitingPrompt = () => {
        setShowReload(true);
      };

      // Add event listeners to handle any of these events.
      wbInstance.addEventListener("waiting", showSkipWaitingPrompt);
      // @ts-expect-error - externalwaiting is a valid event but TS definitions might be incomplete
      wbInstance.addEventListener("externalwaiting", showSkipWaitingPrompt);

      wbInstance.register();
    }
  }, []);

  const reloadPage = () => {
    if (wb) {
      wb.addEventListener("controlling", () => {
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
