import React, { useState } from 'react';

export default function LogoPlaceholder({ className = '', size = 'normal' }) {
  const [imgError, setImgError] = useState(false);
  const logoSrc = '/logo.png';

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {!imgError ? (
        <div className="flex items-center gap-3 group">
          <div className="relative rounded-full overflow-hidden shadow-lg shadow-black/60 border-2 border-amber-500/50 group-hover:border-amber-400 transition-all duration-300">
            <img
              src={logoSrc}
              alt="911 Cafe Official Logo"
              className={`${isSmall ? 'w-10 h-10' : isLarge ? 'w-16 h-16' : 'w-12 h-12'} object-cover`}
              onError={() => setImgError(true)}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`font-serif font-black tracking-wide text-white ${isSmall ? 'text-base' : isLarge ? 'text-2xl' : 'text-xl'}`}>
                911 <span className="text-amber-400">CAFE</span>
              </span>
            </div>
            <span className={`text-[9px] tracking-[0.18em] uppercase font-bold text-amber-500/90 ${isSmall ? 'hidden sm:block text-[8px]' : ''}`}>
              Arrow Groups • Waffles
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-black font-black flex items-center justify-center text-sm shadow-md">
            911
          </div>
          <span className="font-serif font-black text-lg text-white">
            911 <span className="text-amber-400">CAFE</span>
          </span>
        </div>
      )}
    </div>
  );
}
