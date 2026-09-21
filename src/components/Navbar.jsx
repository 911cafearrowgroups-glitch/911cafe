import React, { useState } from 'react';
import { Menu, X, Lock, Sparkles, ShoppingBag } from 'lucide-react';
import LogoPlaceholder from './LogoPlaceholder';

export default function Navbar({ 
  onOpenStaffLogin,
  cartItemCount = 0, 
  onOpenCart
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0f0c0b]/95 border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Official 911 Cafe Logo */}
        <a href="#" className="flex items-center">
          <LogoPlaceholder />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
          <a href="#menu" className="hover:text-amber-400 transition-colors">
            Our Menu
          </a>
          <a href="#loyalty-club" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-amber-300 font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Buy 5, Get 6th FREE
          </a>
          <a href="#about" className="hover:text-amber-400 transition-colors">
            Our Story
          </a>
          <a href="#contact" className="hover:text-amber-400 transition-colors">
            Visit Us
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Cart / Basket Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d1410] hover:bg-[#281a14] border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Craving Cart</span>
            {cartItemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black font-mono">
                {cartItemCount}
              </span>
            )}
          </button>

          <a
            href="#loyalty-club"
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider transition-all"
          >
            Check My Card
          </a>

          {/* Discreet Staff POS Login Button */}
          <button
            type="button"
            onClick={onOpenStaffLogin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/40 hover:bg-black/80 border border-white/10 hover:border-amber-500/40 text-zinc-400 hover:text-amber-300 text-xs font-medium transition-all cursor-pointer"
            title="Staff & Cashier Login"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Login</span>
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[9px] font-mono font-bold">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#140e0b] border-b border-amber-500/20 px-6 py-5 space-y-4">
          <a
            href="#menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-zinc-300 hover:text-amber-400"
          >
            Our Menu
          </a>
          <a
            href="#loyalty-club"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Buy 5, Get 6th FREE Offer
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-zinc-300 hover:text-amber-400"
          >
            Our Story
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-zinc-300 hover:text-amber-400"
          >
            Visit Us
          </a>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCart();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart ({cartItemCount})</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStaffLogin();
              }}
              className="w-full py-2 rounded-xl bg-black/60 border border-white/10 text-zinc-400 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Staff / Cashier Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
