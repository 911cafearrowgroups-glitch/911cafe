import React, { useEffect } from 'react';
import { Gift, CheckCircle, Sparkles, Coffee, Award, Calendar, QrCode, ArrowRight, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PunchCard({ customer, onRefresh }) {
  if (!customer) return null;

  const currentStamps = customer.stampsCount || 0;
  const isRewardReady = customer.rewardAvailable;
  const neededStamps = Math.max(0, 5 - currentStamps);

  useEffect(() => {
    if (isRewardReady) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isRewardReady]);

  // Generate 5 slots for stamps + 1 slot for 6th reward
  const slots = [1, 2, 3, 4, 5];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Physical-style Digital Loyalty Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 ${
        isRewardReady 
          ? 'bg-gradient-to-br from-[#2a1708] via-[#3a200e] to-[#1a0e05] border-2 border-amber-400 glow-gold'
          : 'bg-gradient-to-br from-[#1e1511] via-[#17100d] to-[#0f0a08] border border-amber-500/20'
      }`}>
        {/* Background decorative textures */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-amber-700/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                VIP Member Card • Round #{customer.cycleCount || 1}
              </span>
              {isRewardReady && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r from-amber-500 to-yellow-300 text-black flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Offer Ready!
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold font-serif text-white mt-1">
              {customer.name}
            </h3>
            <p className="text-xs text-amber-400/80 font-mono">
              📞 +91 {customer.phone}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-semibold">Program</span>
            <span className="text-xs font-bold text-amber-400 block">Buy 5, 6th FREE</span>
            <span className="text-[10px] text-zinc-500 font-mono">ID: {customer.id?.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Current Reward Status Banner */}
        <div className="my-5">
          {isRewardReady ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-400/50 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
                🎁
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  🎉 Congratulations! 6th Visit Offer Activated!
                </h4>
                <p className="text-xs text-amber-100/80 leading-relaxed">
                  You completed 5 visits! On your 6th order, show this card to the cashier for your choice of <strong>FREE Waffle, Pancake, or Brownie</strong>!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/15 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">
                    {neededStamps === 1 ? (
                      <span className="text-amber-300 font-bold">Only 1 more purchase away!</span>
                    ) : (
                      <span><strong>{neededStamps}</strong> more purchases needed for 6th visit offer</span>
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Current progress: {currentStamps} of 5 stamps collected
                  </p>
                </div>
              </div>

              {/* Progress pill */}
              <div className="text-right">
                <span className="text-base font-bold text-amber-400 font-mono">
                  {currentStamps}/5
                </span>
              </div>
            </div>
          )}
        </div>

        {/* The 6 Slots Punch Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 my-6">
          {/* Slots 1 through 5 */}
          {slots.map((num) => {
            const isStamped = num <= currentStamps;
            const stampData = customer.currentCycleStamps?.find(s => s.stampNumber === num);

            return (
              <div
                key={num}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-300 ${
                  isStamped
                    ? 'bg-gradient-to-b from-amber-500/25 to-amber-600/30 border-2 border-amber-400 shadow-md shadow-amber-500/20 scale-100'
                    : 'bg-black/40 border border-dashed border-amber-500/30 hover:border-amber-500/60'
                }`}
              >
                {isStamped ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center font-black text-xs shadow-inner">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-amber-300 mt-1 uppercase tracking-tighter">
                      Visit #{num}
                    </span>
                    <span className="text-[8px] text-amber-200/70 font-mono truncate max-w-full">
                      Stamped
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 text-xs font-semibold">
                      {num}
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-1 font-medium">
                      Visit {num}
                    </span>
                  </>
                )}
              </div>
            );
          })}

          {/* Slot 6: The Reward Slot */}
          <div
            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all duration-300 ${
              isRewardReady
                ? 'bg-gradient-to-b from-yellow-400 to-amber-600 text-black border-2 border-yellow-200 shadow-xl shadow-amber-500/40 animate-pulse'
                : 'bg-amber-500/5 border-2 border-amber-500/30 text-amber-500/60'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isRewardReady ? 'bg-black text-amber-400' : 'bg-black/40 border border-amber-500/30 text-amber-500/60'
            }`}>
              {isRewardReady ? '🎁' : '6th'}
            </div>
            <span className={`text-[10px] font-extrabold uppercase mt-1 tracking-tight leading-none ${
              isRewardReady ? 'text-black' : 'text-amber-400/90'
            }`}>
              {isRewardReady ? 'FREE TREAT!' : '6th Offer'}
            </span>
            <span className={`text-[8px] font-semibold mt-0.5 ${
              isRewardReady ? 'text-black/80' : 'text-zinc-500'
            }`}>
              {isRewardReady ? 'REDEEM' : 'Unlock'}
            </span>
          </div>
        </div>

        {/* Card Footer: Lifetime stats & QR code preview */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-amber-500/20 text-xs">
          <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
            <div>
              <span className="text-zinc-500 block">Total Visits:</span>
              <span className="font-bold text-white text-xs">{customer.totalVisits || 0}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Rewards Claimed:</span>
              <span className="font-bold text-amber-400 text-xs">{customer.totalRewardsRedeemed || 0}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Favorite:</span>
              <span className="font-medium text-white truncate max-w-[120px] block">{customer.favoriteItem || 'Waffles'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-amber-500/20">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-[10px] text-amber-300">
              911-{customer.phone?.slice(-4)}
            </span>
          </div>
        </div>
      </div>

      {/* Stamp History Drawer */}
      {customer.historyStamps && customer.historyStamps.length > 0 && (
        <div className="mt-4 p-4 rounded-2xl bg-[#140e0b]/70 border border-amber-500/10">
          <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Recent Visits & Purchases
          </h5>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {customer.historyStamps.slice(-5).reverse().map((st) => (
              <div key={st.id} className="text-[11px] flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[9px] font-bold">
                    #{st.stampNumber}
                  </span>
                  <span className="text-white font-medium">{st.note || 'Cafe Purchase'}</span>
                </div>
                <span className="text-zinc-400 text-[10px]">
                  {new Date(st.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
