"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import appIcon from "@/app/icon.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const inStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(inStandaloneMode);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[PWA] Service Worker registration error:", err);
      });
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

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

  // Don't show if already running as installed app or dismissed
  if (isStandalone || isDismissed) return null;

  // Show prompt if beforeinstallprompt event captured OR if on iOS device
  if (!deferredPrompt && !isIos) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl border border-amber-300 bg-slate-950 p-4 text-white shadow-2xl backdrop-blur-md sm:left-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-xl border border-amber-400/40 shadow-sm shrink-0">
            <Image
              src={appIcon}
              alt="Prado Fleet App Icon"
              width={44}
              height={44}
              className="h-11 w-11 object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">Install Prado Fleet App</p>
            <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
              Add to home screen for 1-tap access &amp; live mobile GPS tracking.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1"
          aria-label="Close install prompt"
        >
          <X size={16} />
        </button>
      </div>

      {isIos ? (
        <div className="mt-3 rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-amber-300 flex items-center gap-2">
          <Share size={16} className="text-amber-400 shrink-0" />
          <span>
            Tap <strong>Share</strong> and select <strong>&quot;Add to Home Screen&quot;</strong> to install app.
          </span>
        </div>
      ) : (
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-500 shadow-sm"
          >
            <Download size={14} />
            Install App
          </button>
        </div>
      )}
    </div>
  );
}
