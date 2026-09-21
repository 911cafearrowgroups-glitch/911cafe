import React from 'react';
import { Clock, CheckCircle2, ShieldAlert, HeartHandshake, MapPin, Phone } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-amber-500/15">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        {/* Story */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Born From Late-Night Sweet Emergencies
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white leading-tight">
            Why We Are Called <br />
            <span className="gold-gradient-text">911 Cafe</span>
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            We believe that an intense dessert craving isn't just a snack — it's an emergency! Founded by passionate bakers, <strong>911 Cafe</strong> was created with a single mission: to serve the world's most irresistible waffles, cloud-soft pancakes, and bubbling hot fudge brownies.
          </p>
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Whether it's an afternoon pick-me-up or a post-dinner celebration, our ovens and waffle irons stay fired up with fresh batters prepared daily with premium cocoa, real butter, and fresh seasonal berries.
          </p>

          {/* Quality Badges */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#17100d] border border-amber-500/15 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fresh Batters Daily</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Never frozen, always poured fresh onto hot irons.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#17100d] border border-amber-500/15 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Belgian Callebaut Cocoa</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Silky smooth chocolate sauces and lava brownies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* How the 5+1 Loyalty Rule Works */}
        <div className="lg:col-span-6 bg-[#160f0c] p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 shadow-2xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
            ⭐ The 911 Customer Guarantee
          </span>
          <h3 className="text-2xl font-serif font-black text-white mb-6">
            How The 5-to-6th Offer Rule Works
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Enroll in Seconds</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Sign up with your mobile number online or directly with our cashier. No plastic card or physical stamp cards to lose!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-black font-black text-xs flex items-center justify-center shrink-0">
                2-5
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Earn a Stamp on Every Purchase</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Every time you buy any waffle, pancake stack, or brownie, give your phone number at the counter. 1 purchase = 1 digital stamp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-black font-black text-xs flex items-center justify-center shrink-0 animate-pulse">
                6th
              </div>
              <div>
                <h4 className="text-sm font-bold text-yellow-300">Unlock Your 6th Visit Free Offer!</h4>
                <p className="text-xs text-zinc-300 mt-0.5">
                  On your 6th visit, your free offer is instantly unlocked. Enjoy your favorite dessert on the house or 50% off your entire bill!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-white/10 text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0">
                ↺
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Continuous Loyalty Cycles</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Once redeemed, your card automatically rolls over to Round #2. Your lifetime visits and rewards earned keep growing!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
