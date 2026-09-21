import React from 'react';
import { Home, UtensilsCrossed, Sparkles, ShoppingBag, Lock } from 'lucide-react';

export default function MobileBottomNav({
  cartItemCount = 0,
  onOpenCart,
  onOpenStaffLogin,
  waitingOrdersCount = 0
}) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom App Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0908]/95 backdrop-blur-xl border-t border-amber-500/25 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2"
    >
      <div className="max-w-md mx-auto px-3 flex items-center justify-around">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-amber-400 active:scale-95 transition-all cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* 2. Menu */}
        <button
          type="button"
          onClick={() => scrollTo('menu')}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-amber-400 active:scale-95 transition-all cursor-pointer"
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>

        {/* 3. Loyalty 911 Card */}
        <button
          type="button"
          onClick={() => scrollTo('loyalty-club')}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-amber-400 active:scale-95 transition-all relative cursor-pointer"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <span className="text-[10px] font-black tracking-tight text-amber-300">911 Card</span>
        </button>

        {/* 4. Cart with live badge */}
        <button
          type="button"
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-amber-400 active:scale-95 transition-all relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-zinc-300" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-black text-[10px] font-black font-mono flex items-center justify-center shadow-lg animate-bounce">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Cart</span>
        </button>

        {/* 5. POS Cashier Login */}
        <button
          type="button"
          onClick={onOpenStaffLogin}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl text-zinc-400 hover:text-white active:scale-95 transition-all relative cursor-pointer"
          title="Staff PIN Login"
        >
          <div className="relative">
            <Lock className="w-5 h-5 text-zinc-400" />
            {waitingOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {waitingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight text-zinc-400">Staff POS</span>
        </button>
      </div>
    </nav>
  );
}
