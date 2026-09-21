import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, Sparkles, Check } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      alert('To install 911 Cafe on your phone, open your browser menu (⋮ or Share) and select "Install app" or "Add to Home Screen".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (installed || isDismissed) return null;

  return (
    <>
      {/* Discreet Sticky App Install Bar */}
      <aside 
        aria-label="App Installation Prompt" 
        className="fixed top-20 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-40 bg-gradient-to-r from-[#1f140e] via-[#2a1b13] to-[#1a100a] border border-amber-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-300"
      >
        <div className="flex items-center gap-3">
          <img 
            src="/icons/icon-192.png" 
            alt="911 Cafe App Icon" 
            className="w-10 h-10 rounded-xl shadow-md border border-amber-500/30 object-contain bg-black p-0.5 shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white text-xs font-black tracking-tight truncate">911 Cafe App</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase">
                Install
              </span>
            </div>
            <p className="text-zinc-300 text-[11px] leading-tight truncate">
              Install app on your phone for 1-tap orders!
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#160f0c] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/icons/icon-192.png" alt="911 Cafe" className="w-8 h-8 rounded-lg bg-black object-contain" />
                <h3 className="text-base font-bold text-white font-serif">Install 911 Cafe App</h3>
              </div>
              <button 
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-full bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Add 911 Cafe directly to your iPhone / iPad Home Screen for quick access anytime:
            </p>

            <ol className="space-y-3 text-xs text-zinc-200">
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <span>1. Tap the <strong>Share</strong> button at bottom of Safari</span>
              </li>
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <span>2. Scroll down & select <strong>"Add to Home Screen"</strong></span>
              </li>
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-black/40 border border-white/5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>3. Tap <strong>"Add"</strong> in top right corner</span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
