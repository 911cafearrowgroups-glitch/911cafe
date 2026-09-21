import React, { useState } from 'react';
import { UserPlus, Search, Sparkles, CheckCircle2, AlertCircle, Phone, Mail, User, Heart } from 'lucide-react';
import PunchCard from './PunchCard';

export default function LoyaltyEnrollment({ onCustomerLoaded }) {
  const [mode, setMode] = useState('enroll'); // 'enroll' | 'lookup'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    favoriteItem: 'Nutella Lava Crunch Waffle'
  });
  const [lookupPhone, setLookupPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleEnroll = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/customers/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll');
      }

      setActiveCustomer(data.data);
      setSuccessMsg('🎉 Welcome to the 911 Cafe Loyalty Club! Your digital punch card is active.');
      if (onCustomerLoaded) onCustomerLoaded(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!lookupPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${encodeURIComponent(lookupPhone.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Customer not found. Have you enrolled yet?');
      }

      setActiveCustomer(data.data);
      if (onCustomerLoaded) onCustomerLoaded(data.data);
    } catch (err) {
      setError(err.message);
      setActiveCustomer(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshCustomer = async () => {
    if (!activeCustomer) return;
    try {
      const res = await fetch(`/api/customers/${activeCustomer.id}`);
      const data = await res.json();
      if (res.ok) {
        setActiveCustomer(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section id="loyalty-club" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> 911 Sweet Emergency Rewards
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight">
          Buy 5 Times, Get <span className="gold-gradient-text">6th Treat FREE</span>
        </h2>
        <p className="text-zinc-400 mt-3 text-sm sm:text-base leading-relaxed">
          Enroll in seconds. Every time you order your favorite waffle, pancake stack, or sizzling brownie, get a digital punch. On your 6th order, dessert is on us!
        </p>
      </div>

      {/* Tabs for Enroll vs Lookup */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#19110d] p-1.5 rounded-2xl border border-amber-500/20 flex gap-1">
          <button
            onClick={() => { setMode('enroll'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === 'enroll'
                ? 'bg-amber-500 text-black shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Enroll New Member
          </button>
          <button
            onClick={() => { setMode('lookup'); setError(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mode === 'lookup'
                ? 'bg-amber-500 text-black shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" /> Check My Card Balance
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Left Form Area */}
        <div className="lg:col-span-6 bg-[#160f0c] p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-xl">
          {mode === 'enroll' ? (
            <div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">
                Join the 911 Club
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Fill in your details once and get your personal digital loyalty punch card.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
                </div>
              )}

              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Phone Number (Used for Stamps) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-zinc-600"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Give this number at the counter whenever you order to earn stamps!
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    What's your favorite 911 sweet treat?
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <select
                      value={formData.favoriteItem}
                      onChange={(e) => setFormData({ ...formData, favoriteItem: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    >
                      <option value="Nutella Lava Crunch Waffle" className="bg-[#1c120c]">Nutella Lava Crunch Waffle</option>
                      <option value="Belgian Golden Classic" className="bg-[#1c120c]">Belgian Golden Classic Waffle</option>
                      <option value="Lotus Biscoff Delight" className="bg-[#1c120c]">Lotus Biscoff Delight Waffle</option>
                      <option value="Triple Stack Golden Fluff" className="bg-[#1c120c]">Triple Stack Golden Fluff Pancakes</option>
                      <option value="Blueberry Burst Stack" className="bg-[#1c120c]">Blueberry Burst Pancakes</option>
                      <option value="Sizzling Fudgy Bownee & Ice Cream" className="bg-[#1c120c]">Sizzling Fudgy Brownie with Ice Cream</option>
                      <option value="Salted Caramel Sea-Salt Brownie" className="bg-[#1c120c]">Salted Caramel Brownie</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Activating Card...' : '🚀 Activate My Loyalty Card'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold font-serif text-white mb-2">
                Check My Stamp Card
              </h3>
              <p className="text-xs text-zinc-400 mb-6">
                Enter your registered phone number to view your stamp progress and rewards.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210 or 9845012345"
                      value={lookupPhone}
                      onChange={(e) => setLookupPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  {loading ? 'Finding Card...' : '🔍 Find My Loyalty Card'}
                </button>
              </form>

              {/* Demo Quick Pick */}
              <div className="mt-6 pt-4 border-t border-amber-500/15">
                <span className="text-[11px] text-zinc-500 block mb-2 font-medium">
                  Try with sample demo members:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setLookupPhone('9876543210'); }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-black/50 hover:bg-amber-500/20 text-amber-300/80 border border-amber-500/20 cursor-pointer"
                  >
                    Aarav (4 Stamps)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLookupPhone('9845012345'); }}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-black/50 hover:bg-amber-500/20 text-amber-300/80 border border-amber-500/20 cursor-pointer"
                  >
                    Priya (5 Stamps - Reward Ready!)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Display Punch Card */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {activeCustomer ? (
            <div>
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Live Member Status
                </span>
                <button
                  onClick={refreshCustomer}
                  className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>
              <PunchCard customer={activeCustomer} onRefresh={refreshCustomer} />
            </div>
          ) : (
            <div className="border border-dashed border-amber-500/30 rounded-3xl p-8 sm:p-12 text-center bg-black/20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl mb-4 text-amber-400">
                🎫
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Your Digital Card Will Appear Here
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-4">
                Enroll on the left or enter your mobile number to view your real-time 5-stamp punch card and unlock the 6th visit offer!
              </p>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <span>1</span> <span>→</span>
                <span>2</span> <span>→</span>
                <span>3</span> <span>→</span>
                <span>4</span> <span>→</span>
                <span>5</span> <span>→</span>
                <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-bold">6th FREE!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
