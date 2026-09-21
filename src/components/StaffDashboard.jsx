import React, { useState, useEffect } from 'react';
import { 
  Search, PlusCircle, Award, CheckCircle, Sparkles, 
  Users, Gift, RotateCcw, AlertTriangle, ArrowRight, 
  ShoppingBag, Phone, User, Check, RefreshCw, X, ChefHat, Clock, ClipboardList, TrendingUp, LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import PunchCard from './PunchCard';
import OrderMonitor from './OrderMonitor';
import TakeOrderPage from './TakeOrderPage';
import DailyBalanceReport from './DailyBalanceReport';

export default function StaffDashboard({ onClose, staffUser }) {
  const [activeTab, setActiveTab] = useState('take-order'); // 'take-order' | 'orders' | 'balance' | 'loyalty'
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [orderNote, setOrderNote] = useState('');
  const [cashierName, setCashierName] = useState(staffUser?.name || 'Counter Cashier 1');

  // New Customer Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    favoriteItem: 'Nutella Lava Crunch Waffle'
  });

  // Redemption Modal
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [chosenReward, setChosenReward] = useState('Free Waffle of Choice');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok) setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCustomers = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.data);
        // If one exact customer was selected, update their details
        if (selectedCustomer) {
          const updated = data.data.find(c => c.id === selectedCustomer.id);
          if (updated) {
            // fetch detailed
            fetchCustomerDetails(updated.id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (id) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedCustomer(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  // Cashier adds purchase stamp (+1)
  const handleAddStamp = async () => {
    if (!selectedCustomer) return;
    setActionMsg(null);

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/stamp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: orderNote || 'Counter Order Purchase',
          staff: cashierName
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add stamp');

      setActionMsg({
        type: data.rewardUnlocked ? 'reward' : 'success',
        text: data.message
      });

      if (data.rewardUnlocked) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      }

      setOrderNote('');
      fetchCustomerDetails(selectedCustomer.id);
      fetchStats();
      fetchCustomers(searchQuery);
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  // Cashier redeems 6th visit offer
  const handleConfirmRedemption = async () => {
    if (!selectedCustomer) return;
    setActionMsg(null);

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardTitle: '6th Visit Special Offer: Free Gourmet Treat',
          redeemedBy: cashierName,
          itemChosen: chosenReward
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to redeem offer');

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 }
      });

      setActionMsg({
        type: 'success',
        text: data.message
      });

      setShowRedeemModal(false);
      fetchCustomerDetails(selectedCustomer.id);
      fetchStats();
      fetchCustomers(searchQuery);
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enroll');

      setShowNewModal(false);
      setNewCustomerData({ name: '', phone: '', email: '', favoriteItem: 'Nutella Lava Crunch Waffle' });
      setSelectedCustomer(data.data);
      fetchCustomers();
      fetchStats();
      setActionMsg({ type: 'success', text: `Customer ${data.data.name} enrolled successfully!` });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0908] text-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-black">
              911 CAFE STAFF PORTAL
            </span>
            <span className="text-xs text-amber-400 font-mono">
              Cashier POS Loyalty Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
            Customer Visit & Offer Tracking Software
          </h1>
          <p className="text-xs text-zinc-400">
            Rule: 5 Purchases recorded → 6th Visit qualifies for Free Treat offer
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={cashierName}
            onChange={(e) => setCashierName(e.target.value)}
            className="text-xs bg-[#19110d] border border-amber-500/30 rounded-xl px-3 py-2 text-amber-300 focus:outline-none"
          >
            <option value="Counter Cashier 1">Counter Cashier 1</option>
            <option value="Counter Cashier 2">Counter Cashier 2</option>
            <option value="Manager Shift">Manager Shift</option>
          </select>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Enroll New Customer
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-bold transition-colors cursor-pointer"
              title="Lock POS & return to website"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock / Exit POS</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-6">
        {/* Navigation Tabs for Staff */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-amber-500/20 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('take-order')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'take-order'
                ? 'bg-amber-500 text-black shadow-lg font-black scale-105'
                : 'bg-[#18110e] text-zinc-400 hover:text-white border border-amber-500/20'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>📝 Take Order (Counter POS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-black shadow-lg font-black scale-105'
                : 'bg-[#18110e] text-zinc-400 hover:text-white border border-amber-500/20'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>🛎️ Kitchen Waiting Monitor</span>
            {stats?.waitingOrders > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-black animate-pulse">
                {stats.waitingOrders} Waiting
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'balance'
                ? 'bg-amber-500 text-black shadow-lg font-black scale-105'
                : 'bg-[#18110e] text-zinc-400 hover:text-white border border-amber-500/20'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>📊 Daily Balance (Cash vs UPI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'loyalty'
                ? 'bg-amber-500 text-black shadow-lg font-black scale-105'
                : 'bg-[#18110e] text-zinc-400 hover:text-white border border-amber-500/20'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>💳 Customer Loyalty & Punch Card POS</span>
          </button>
        </div>

        {activeTab === 'take-order' ? (
          <TakeOrderPage 
            onOrderPunched={() => fetchStats()} 
            onSwitchToMonitor={() => setActiveTab('orders')} 
          />
        ) : activeTab === 'orders' ? (
          <OrderMonitor />
        ) : activeTab === 'balance' ? (
          <DailyBalanceReport />
        ) : (
          <div>
            {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-[#17100d] border border-amber-500/15">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Total Club Members</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-serif text-white mt-2">
                {stats.totalCustomers}
              </p>
              <span className="text-[10px] text-zinc-500">Enrolled in 911 rewards</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#17100d] border border-amber-500/15">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Stamps Granted</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-serif text-amber-400 mt-2">
                {stats.totalStampsGiven}
              </p>
              <span className="text-[10px] text-zinc-500">Total purchase stamps given</span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2a1708] to-[#1a0e05] border border-amber-500/40 glow-gold">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>6th Visit Offers Ready</span>
                <Gift className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-serif text-yellow-400 mt-2">
                {stats.rewardsReady} Customers
              </p>
              <span className="text-[10px] text-amber-300/80">Completed 5 visits, eligible for free treat</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#17100d] border border-amber-500/15">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Total Redeemed</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-serif text-emerald-400 mt-2">
                {stats.totalRedeemed}
              </p>
              <span className="text-[10px] text-zinc-500">Free rewards redeemed</span>
            </div>
          </div>
        )}

        {/* Action Status Banner */}
        {actionMsg && (
          <div className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 ${
            actionMsg.type === 'reward' 
              ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-2 border-yellow-400 text-yellow-200'
              : actionMsg.type === 'error'
              ? 'bg-red-950/40 border border-red-500/40 text-red-300'
              : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span className="font-semibold">{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Work Area: Split into Search & Cashier Desk (Left) + Selected Customer Card (Right) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Search & Punch Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Customer Search */}
            <div className="p-6 rounded-3xl bg-[#160f0c] border border-amber-500/20 shadow-xl">
              <h2 className="text-lg font-bold font-serif text-white mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" /> Look Up Customer at Counter
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                Search by phone number or customer name to add a stamp or redeem offer.
              </p>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Enter phone number (e.g. 9876543210) or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-zinc-600"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); fetchCustomers(''); }}
                  className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  title="Reset Search"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Punch Desk (When a customer is selected) */}
            {selectedCustomer && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1f140e] to-[#140b07] border-2 border-amber-500/40 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      Selected Member at Counter
                    </span>
                    <h3 className="text-xl font-bold font-serif text-white">
                      {selectedCustomer.name}
                    </h3>
                    <p className="text-xs text-amber-300 font-mono">
                      📞 {selectedCustomer.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 border border-amber-500/30">
                      <span className="text-xs text-zinc-400">Current Stamps:</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {selectedCustomer.stampsCount}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6th Visit Trigger Alert if ready */}
                {selectedCustomer.rewardAvailable ? (
                  <div className="p-4 mb-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-600/20 border-2 border-yellow-400 text-yellow-100 flex items-center justify-between gap-4 animate-pulse">
                    <div>
                      <h4 className="text-sm font-black text-yellow-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> 6TH VISIT OFFER UNLOCKED!
                      </h4>
                      <p className="text-xs text-zinc-200 mt-1">
                        Customer completed 5 purchases! They qualify for a <strong>FREE Waffle, Pancake, or Brownie</strong> today!
                      </p>
                    </div>

                    <button
                      onClick={() => setShowRedeemModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/40 transition-all cursor-pointer shrink-0"
                    >
                      🎁 Redeem Free Treat
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Purchase / Order Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 1x Nutella Lava Waffle + 1x Brownie"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleAddStamp}
                        className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Award className="w-5 h-5" /> +1 Add Purchase Stamp (Visit #{selectedCustomer.stampsCount + 1})
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-400 text-center">
                      {5 - selectedCustomer.stampsCount === 1 
                        ? '🔥 Next stamp will unlock the 6th Visit Free Offer!' 
                        : `${5 - selectedCustomer.stampsCount} more stamp(s) needed to unlock 6th visit offer.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Customers Table */}
            <div className="p-6 rounded-3xl bg-[#160f0c] border border-amber-500/20 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" /> Enrolled Customers ({customers.length})
                </h3>
                <button
                  onClick={() => fetchCustomers(searchQuery)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Phone</th>
                      <th className="pb-3 font-semibold text-center">Stamps (Current)</th>
                      <th className="pb-3 font-semibold text-center">Status / 6th Offer</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map((c) => {
                      const isSelected = selectedCustomer?.id === c.id;
                      return (
                        <tr 
                          key={c.id} 
                          className={`hover:bg-white/5 transition-colors cursor-pointer ${
                            isSelected ? 'bg-amber-500/15' : ''
                          }`}
                          onClick={() => fetchCustomerDetails(c.id)}
                        >
                          <td className="py-3 font-medium text-white">
                            <div>{c.name}</div>
                            <span className="text-[10px] text-zinc-500">Round #{c.cycleCount}</span>
                          </td>
                          <td className="py-3 font-mono text-zinc-300">
                            {c.phone}
                          </td>
                          <td className="py-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full font-bold font-mono bg-black/40 border border-amber-500/20 text-amber-400">
                              {c.stampsCount}/5
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {c.rewardAvailable ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black animate-pulse">
                                🎁 6th Offer Ready!
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-400">
                                {5 - c.stampsCount} to go
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchCustomerDetails(c.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-semibold text-[11px] transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Selected Customer Digital Punch Card View */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              {selectedCustomer ? (
                <div>
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Customer Punch Card Preview
                    </span>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <PunchCard 
                    customer={selectedCustomer} 
                    onRefresh={() => fetchCustomerDetails(selectedCustomer.id)} 
                  />
                </div>
              ) : (
                <div className="border border-dashed border-amber-500/30 rounded-3xl p-10 text-center bg-black/20 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl mb-3 text-amber-400">
                    💳
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    No Customer Selected
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                    Search above or click any customer in the table to load their card, punch a visit, or redeem their 6th visit offer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>

      {/* MODAL: Register New Customer at Counter */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#18110e] border border-amber-500/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" /> Enroll Customer at Counter
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={newCustomerData.phone}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                  Favorite 911 Item
                </label>
                <select
                  value={newCustomerData.favoriteItem}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, favoriteItem: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/25 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Nutella Lava Crunch Waffle" className="bg-[#18110e]">Nutella Lava Crunch Waffle</option>
                  <option value="Belgian Golden Classic" className="bg-[#18110e]">Belgian Golden Classic Waffle</option>
                  <option value="Triple Stack Golden Fluff" className="bg-[#18110e]">Triple Stack Golden Fluff Pancakes</option>
                  <option value="Sizzling Fudgy Bownee & Ice Cream" className="bg-[#18110e]">Sizzling Fudgy Brownie & Ice Cream</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider"
                >
                  Enroll Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Redeem 6th Visit Free Offer */}
      {showRedeemModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1a110d] border-2 border-yellow-400 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
              <h3 className="text-lg font-bold font-serif text-yellow-400 flex items-center gap-2">
                🎁 Redeem 6th Visit Offer
              </h3>
              <button onClick={() => setShowRedeemModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
              Customer: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone}) has completed 5 visits!
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select Free Treat Chosen by Customer:
                </label>
                <div className="space-y-2">
                  {[
                    'Free Belgian / Nutella Waffle',
                    'Free Triple Stack Fluffy Pancakes',
                    'Free Sizzling Fudgy Brownie & Ice Cream',
                    '50% Off Total Bill Value'
                  ].map((opt) => (
                    <label
                      key={opt}
                      onClick={() => setChosenReward(opt)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        chosenReward === opt
                          ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                          : 'bg-black/30 border-white/10 text-zinc-400 hover:bg-white/5'
                      }`}
                    >
                      <span>{opt}</span>
                      {chosenReward === opt && <Check className="w-4 h-4 text-amber-400" />}
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-zinc-400">
                ⚠️ Clicking confirm will apply the reward, increment lifetime visits, and reset the customer's punch card for their next 5-visit cycle!
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRedemption}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30"
                >
                  Confirm & Redeem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
