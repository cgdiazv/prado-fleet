"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Register Service Worker for PWA capabilities
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[PWA] Service Worker registration error:", err);
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("[PWA] User accepted the install prompt");
    }
    setDeferredPrompt(null);
  };

  if (!deferredPrompt || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-amber-300 bg-slate-950 p-4 text-white shadow-2xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-amber-400/40 shadow-sm shrink-0">
            <Image
              src="/icon.png"
              alt="Prado Fleet App Icon"
              width={40}
              height={40}
              className="h-10 w-10 object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">Install Prado Fleet App</p>
            <p className="text-[11px] text-slate-300">
              Add to home screen for 1-tap access & live mobile GPS tracking.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white"
          aria-label="Close install prompt"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800"
        >
          Later
        </button>
        <button
          type="button"
          onClick={handleInstall}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-500"
        >
          <Download size={14} />
          Install App
        </button>
      </div>
    </div>
  );
}
