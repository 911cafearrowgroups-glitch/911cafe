import React from 'react';
import { ArrowRight, Sparkles, Award, Star, Flame, Clock } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-bold tracking-wide uppercase mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Special 911 Club Loyalty Program Active
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-white leading-[1.1]">
            Waffles That Make <br />
            <span className="gold-gradient-text">Every Moment Special!</span>
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto font-light">
            Welcome to <strong className="text-white font-semibold">911 Cafe (Arrow Groups)</strong>. Freshly made on order with premium ingredients and pure love. Classic, Double Chocolate, and Special Waffles starting at just <span className="text-amber-400 font-bold">₹89</span>!
          </p>

          {/* Hero Loyalty Hook */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#1a110d]/90 border border-amber-500/30 max-w-xl mx-auto shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                ⭐ BUY 5 TIMES, GET YOUR 6TH VISIT WAFFLE FREE!
              </p>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Give your phone number whenever you order. On your 6th visit, your treat is 100% on the house!
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#menu"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Explore Official Menu</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="#loyalty-club"
              className="px-8 py-3.5 rounded-2xl bg-[#1a110d] hover:bg-[#251813] text-white border border-amber-500/30 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all"
            >
              Check My 5+1 Card
            </a>
          </div>

          {/* 3 Pillars from Menu Card */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-[#140e0b] border border-amber-500/15">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg mb-2">
                🧇
              </div>
              <h3 className="font-bold text-white text-xs font-serif uppercase tracking-wider">Classic & Double</h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Belgium Chocolate, Dark Chocolate, Triple Choc & Chocolate Overload (₹89 - ₹99).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#140e0b] border border-amber-500/15">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg mb-2">
                ⭐
              </div>
              <h3 className="font-bold text-white text-xs font-serif uppercase tracking-wider">Crunch Bites</h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Crispy waffle bites loaded with rich melted chocolates — a bite you'll never forget (₹99)!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#140e0b] border border-amber-500/15">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg mb-2">
                👑
              </div>
              <h3 className="font-bold text-white text-xs font-serif uppercase tracking-wider">Special Waffles</h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                Lotus Biscoff, Kunafa Pistachio, KitKat, Red Velvet, Rasmalai Pistachio (₹109 - ₹129).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
