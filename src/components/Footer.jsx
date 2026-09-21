import React from 'react';
import { MapPin, Phone, Mail, Clock, Heart, Lock } from 'lucide-react';
import LogoPlaceholder from './LogoPlaceholder';

export default function Footer({ onOpenStaffLogin }) {
  return (
    <footer id="contact" className="bg-[#0b0807] border-t border-amber-500/20 text-zinc-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Logo Placeholder */}
          <div className="space-y-4">
            <LogoPlaceholder size="normal" />
            <p className="text-zinc-400 text-xs leading-relaxed">
              911 Cafe (Arrow Groups) — Waffles that make every moment special! Handcrafted fresh to order with pure love.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenStaffLogin}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> Staff & POS Login
              </button>
            </div>
          </div>

          {/* Col 2: Specialty Menu */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider">
              Signature Treats
            </h4>
            <ul className="space-y-2 text-zinc-400">
              <li><a href="#menu" className="hover:text-amber-400 transition-colors">Belgian Classic Waffles</a></li>
              <li><a href="#menu" className="hover:text-amber-400 transition-colors">Nutella Lava Crunch Waffles</a></li>
              <li><a href="#menu" className="hover:text-amber-400 transition-colors">Triple Stack Golden Fluff Pancakes</a></li>
              <li><a href="#menu" className="hover:text-amber-400 transition-colors">Wild Blueberry Burst Pancakes</a></li>
              <li><a href="#menu" className="hover:text-amber-400 transition-colors">Sizzling Fudgy Brownie & Ice Cream</a></li>
              <li><a href="#menu" className="hover:text-amber-400 transition-colors">Salted Caramel Sea-Salt Brownies</a></li>
            </ul>
          </div>

          {/* Col 3: Loyalty & Offers */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider">
              911 Club Loyalty
            </h4>
            <p className="text-zinc-400 leading-relaxed text-xs">
              Every purchase earns you a digital punch! Buy 5 times, and your 6th purchase qualifies for a 100% free dessert or 50% discount.
            </p>
            <a
              href="#loyalty-club"
              className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-[11px] uppercase tracking-wide hover:bg-amber-500/20"
            >
              Enroll Mobile Number →
            </a>
          </div>

          {/* Col 4: Hours & Location */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-sm uppercase tracking-wider">
              Emergency Hours & Location
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Open Daily: 10:00 AM – 11:30 PM (Late Night Cravings)</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>911 Cafe, Main Gourmet Avenue, City Center</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Order Helpline: +91 911-CAFE-00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & Logo placement tip */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} 911 Cafe. All rights reserved. Handcrafted with love.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>✨ Buy 5, Get 6th FREE</span>
            <span>•</span>
            <span>To update logo: drop <code className="text-amber-400">logo.png</code> into the project's <code className="text-amber-400">public/</code> directory</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
