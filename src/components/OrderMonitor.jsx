import React, { useState, useEffect } from 'react';
import { 
  Clock, ChefHat, Bike, CheckCircle2, AlertTriangle, 
  MapPin, Phone, User, RefreshCw, Sparkles, Filter, 
  ArrowRight, Search, Volume2, VolumeX, ShieldAlert, Check, Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getStoredOrders, saveStoredOrders, updateStoredOrderStatus, 
  triggerServerSync, clearStoredOrders, getStoredClearedAt 
} from '../utils/persistentSync';

const STATUS_RANK = {
  'waiting': 1,
  'preparing': 2,
  'out_for_delivery': 3,
  'delivered': 4
};

export default function OrderMonitor() {
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [filter, setFilter] = useState('active'); // 'active' | 'waiting' | 'preparing' | 'out_for_delivery' | 'delivered' | 'all'
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastWaitingCount, setLastWaitingCount] = useState(0);
  const [paymentPromptOrder, setPaymentPromptOrder] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) {
        const serverOrders = data.data || [];
        const serverClearedAt = Number(data.clearedAt) || 0;
        const localClearedAt = getStoredClearedAt();

        if (serverClearedAt > localClearedAt) {
          clearStoredOrders(serverClearedAt);
          setOrders([]);
          return;
        }

        const validLocalOrders = getStoredOrders().filter(o => {
          const ot = o.createdAt ? new Date(o.createdAt).getTime() : 0;
          return !serverClearedAt || ot >= serverClearedAt;
        });

        if (serverOrders.length === 0 && validLocalOrders.length === 0) {
          setOrders([]);
          saveStoredOrders([]);
        } else {
          const localMap = new Map(validLocalOrders.map(o => [o.id, o]));
          const resolvedServerOrders = (serverOrders || []).map(so => {
            const lo = localMap.get(so.id);
            if (!lo) return so;
            const sRank = STATUS_RANK[so.status] || 0;
            const lRank = STATUS_RANK[lo.status] || 0;
            if (lRank > sRank) {
              return {
                ...so,
                status: lo.status,
                paymentMethod: lo.paymentMethod || so.paymentMethod,
                updatedAt: lo.updatedAt || so.updatedAt
              };
            }
            return so;
          });

          const serverIds = new Set(resolvedServerOrders.map(o => o.id));
          const missing = validLocalOrders.filter(o => !serverIds.has(o.id));
          const merged = [...resolvedServerOrders, ...missing];

          if (validLocalOrders.length > serverOrders.length) {
            triggerServerSync();
          }

          setOrders(merged);
          saveStoredOrders(merged);
        }
        
        const currentWaiting = (serverOrders || []).filter(o => o.status === 'waiting').length;
        if (soundEnabled && currentWaiting > lastWaitingCount && lastWaitingCount !== 0) {
          playAlertSound();
        }
        setLastWaitingCount(currentWaiting);
      } else {
        setOrders(getStoredOrders());
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
      setOrders(getStoredOrders());
    } finally {
      setLoading(false);
    }
  };

  const playAlertSound = () => {
    try {
      // Gentle web audio beep chime
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // AudioContext may be restricted by browser policy before first interaction
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // Poll every 4 seconds
    const handleOrdersCleared = () => {
      setOrders([]);
    };
    window.addEventListener('911_orders_cleared', handleOrdersCleared);
    return () => {
      clearInterval(interval);
      window.removeEventListener('911_orders_cleared', handleOrdersCleared);
    };
  }, [soundEnabled, lastWaitingCount]);

  const handleUpdateStatus = async (orderId, newStatus, paymentMethod = null) => {
    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    // Immediately persist locally
    updateStoredOrderStatus(orderId, newStatus, paymentMethod);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, paymentMethod: paymentMethod || o.paymentMethod || 'cash' } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          paymentMethod: paymentMethod 
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (newStatus === 'delivered') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
        if (data.order) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data.order } : o));
          updateStoredOrderStatus(orderId, data.order.status || newStatus, data.order.paymentMethod || paymentMethod);
        }
        await fetchOrders();
      }
    } catch (err) {
      console.warn('Network sync status warning:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleConfirmDeliveryClick = (order) => {
    setPaymentPromptOrder(order);
    setSelectedPaymentMethod(order.paymentMethod === 'upi' ? 'upi' : 'cash');
  };

  const handleFinalizeDelivery = async () => {
    if (!paymentPromptOrder) return;
    const orderId = paymentPromptOrder.id;
    const payment = selectedPaymentMethod;
    setPaymentPromptOrder(null);
    await handleUpdateStatus(orderId, 'delivered', payment);
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('🚨 Are you sure you want to delete ALL order data? This will wipe all test order history from the system. This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/orders', { method: 'DELETE' });
      const data = await res.json();
      const ts = data?.clearedAt || Date.now();
      clearStoredOrders(ts);
      setOrders([]);
      alert('✅ All order data deleted successfully!');
    } catch (e) {
      console.error('Failed to clear orders:', e);
      clearStoredOrders(Date.now());
      setOrders([]);
      alert('Local order data cleared successfully.');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    // Status filter
    if (filter === 'active' && !['waiting', 'preparing', 'out_for_delivery'].includes(o.status)) return false;
    if (filter === 'waiting' && o.status !== 'waiting') return false;
    if (filter === 'preparing' && o.status !== 'preparing') return false;
    if (filter === 'out_for_delivery' && o.status !== 'out_for_delivery') return false;
    if (filter === 'delivered' && o.status !== 'delivered') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const waitingCount = orders.filter(o => o.status === 'waiting').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const deliveryCount = orders.filter(o => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  const getElapsedTimeText = (createdAt) => {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#18110e] border border-amber-500/20 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black">
              LIVE MONITOR
            </span>
            <span className="text-xs font-mono text-amber-400">
              Auto-syncing every 4s
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
            Kitchen & Delivery Orders Queue
          </h2>
          <p className="text-xs text-zinc-400">
            Monitor incoming waiting orders, dispatch to kitchen, and track deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound alert toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-black/40 text-zinc-500 border-white/10'
            }`}
            title="Toggle audio alert on new waiting orders"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-[11px]">Refresh</span>
          </button>

          {/* Delete All Orders */}
          <button
            type="button"
            onClick={handleClearAllOrders}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Delete all user order data"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline text-[11px]">Clear All Orders</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setFilter('waiting')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            filter === 'waiting'
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40'
              : 'bg-[#17100d] border-amber-500/15 hover:border-amber-500/30'
          } ${waitingCount > 0 ? 'border-amber-500/50 glow-gold' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">⏳ Waiting Orders</span>
            {waitingCount > 0 && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
            {waitingCount}
          </p>
          <span className="text-[10px] text-zinc-400">Needs kitchen acceptance</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('preparing')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            filter === 'preparing'
              ? 'bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-400/40'
              : 'bg-[#17100d] border-amber-500/15 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-yellow-300 uppercase tracking-wider">
            <span>🍳 Baking / Prep</span>
            <ChefHat className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
            {preparingCount}
          </p>
          <span className="text-[10px] text-zinc-400">In ovens & waffle irons</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('out_for_delivery')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            filter === 'out_for_delivery'
              ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/40'
              : 'bg-[#17100d] border-amber-500/15 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-300 uppercase tracking-wider">
            <span>🛵 On The Road</span>
            <Bike className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
            {deliveryCount}
          </p>
          <span className="text-[10px] text-zinc-400">Out for delivery to customer</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('delivered')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            filter === 'delivered'
              ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/40'
              : 'bg-[#17100d] border-amber-500/15 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <span>✅ Delivered</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-black text-white mt-1">
            {deliveredCount}
          </p>
          <span className="text-[10px] text-zinc-400">Completed & stamped</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap gap-1.5 bg-[#140e0b] p-1.5 rounded-2xl border border-amber-500/20">
          {[
            { id: 'active', label: `Active (${waitingCount + preparingCount + deliveryCount})` },
            { id: 'waiting', label: `⏳ Waiting (${waitingCount})` },
            { id: 'preparing', label: `🍳 Baking (${preparingCount})` },
            { id: 'out_for_delivery', label: `🛵 Delivery (${deliveryCount})` },
            { id: 'delivered', label: `✅ Delivered (${deliveredCount})` },
            { id: 'all', label: `All (${orders.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search order #, customer, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="border border-dashed border-amber-500/20 rounded-3xl p-12 text-center bg-black/20">
          <div className="text-3xl mb-2">✨</div>
          <h4 className="text-base font-bold text-white mb-1">No orders found in this queue</h4>
          <p className="text-xs text-zinc-500">
            {filter === 'waiting'
              ? 'Great job! No pending orders waiting in the kitchen queue.'
              : 'Switch filters above or place a test order from the website.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isWaiting = order.status === 'waiting';
            const isPreparing = order.status === 'preparing';
            const isOutForDelivery = order.status === 'out_for_delivery';
            const isDelivered = order.status === 'delivered';
            const isBusy = actionLoading[order.id];

            // Calculate elapsed waiting duration
            const elapsedMins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const isUrgentWaiting = isWaiting && elapsedMins >= 5;

            return (
              <div
                key={order.id}
                className={`rounded-3xl p-5 border flex flex-col justify-between transition-all duration-300 shadow-xl ${
                  isUrgentWaiting
                    ? 'bg-gradient-to-b from-[#2e140d] to-[#180b06] border-red-500/60 ring-2 ring-red-500/30'
                    : isWaiting
                    ? 'bg-gradient-to-b from-[#24150c] to-[#140b07] border-amber-500/40 glow-gold'
                    : isPreparing
                    ? 'bg-gradient-to-b from-[#1f160e] to-[#140e0b] border-yellow-500/30'
                    : isOutForDelivery
                    ? 'bg-gradient-to-b from-[#111924] to-[#0c1017] border-blue-500/30'
                    : 'bg-[#140e0b] border-white/10 opacity-75'
                }`}
              >
                <div>
                  {/* Card Header: Order ID, Type, Stopwatch */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black font-mono text-white">
                          #{order.id}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          order.orderType === 'delivery'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {order.orderType === 'delivery' ? '🛵 Delivery' : '🛍️ Takeaway'}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Elapsed Waiting Stopwatch */}
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold font-mono ${
                        isUrgentWaiting
                          ? 'bg-red-500 text-white animate-pulse'
                          : isWaiting
                          ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                          : 'bg-black/40 text-zinc-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{getElapsedTimeText(order.createdAt)}</span>
                      </div>
                      {isUrgentWaiting && (
                        <span className="text-[9px] text-red-400 font-bold block uppercase tracking-tight mt-0.5">
                          ⚠️ Priority! &gt;5m
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        <span>{order.customerName}</span>
                      </h4>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-amber-500/20"
                      >
                        <Phone className="w-3 h-3" /> {order.customerPhone}
                      </a>
                    </div>

                    {/* Delivery Destination */}
                    {order.orderType === 'delivery' && (
                      <div className="mt-1.5 p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-300 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span className="text-zinc-200">{order.deliveryAddress}</span>
                          {order.landmark && (
                            <span className="block text-[10px] text-zinc-500">Near: {order.landmark}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Loyalty / Offer Badge */}
                  {order.rewardApplied && (
                    <div className="mb-3 p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-yellow-400/40 text-[10px] font-bold text-yellow-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>🎉 Customer Redeemed 6th Visit Free Treat (Saved ₹{order.discount})</span>
                    </div>
                  )}

                  {/* Itemized Order List */}
                  <div className="space-y-1 py-2 border-t border-b border-white/10 text-xs">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Kitchen Items:
                    </span>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-zinc-200">
                        <span className="font-semibold">
                          <strong className="text-amber-400 font-bold font-mono mr-1.5">{item.quantity}x</strong>
                          {item.name}
                        </span>
                        <span className="text-zinc-400 font-mono text-[11px]">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}

                    {/* Cooking Notes */}
                    {order.instructions && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200/90 font-medium">
                        📝 Note: "{order.instructions}"
                      </div>
                    )}
                  </div>

                  {/* Total & Payment */}
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-zinc-400 uppercase text-[10px] font-semibold">
                      Payment ({order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online UPI'}):
                    </span>
                    <span className="font-bold text-amber-400 font-serif text-sm">
                      ₹{order.total}
                    </span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-3 border-t border-white/10 mt-2">
                  {isWaiting && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>{isBusy ? 'Updating...' : '🍳 Accept & Start Baking'}</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Bike className="w-4 h-4" />
                      <span>{isBusy ? 'Updating...' : '🛵 Handover & Mark Out for Delivery'}</span>
                    </button>
                  )}

                  {isOutForDelivery && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleConfirmDeliveryClick(order)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isBusy ? 'Updating...' : '✅ Mark Delivered & Record Payment'}</span>
                    </button>
                  )}

                  {isDelivered && (
                    <div className="text-center py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      <span>Delivered • Paid via {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'CASH'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Payment Collection on Delivery (Cash vs UPI) */}
      {paymentPromptOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#19110d] border-2 border-emerald-400 rounded-3xl p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  PAYMENT RECONCILIATION
                </span>
                <h3 className="text-lg font-serif font-black text-white mt-0.5">
                  Confirm Delivery & Payment
                </h3>
              </div>
              <button 
                onClick={() => setPaymentPromptOrder(null)} 
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-mono font-bold text-white">#{paymentPromptOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Customer:</span>
                <span className="font-medium text-white">{paymentPromptOrder.customerName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/5 text-sm font-bold">
                <span className="text-zinc-300">Amount Collected:</span>
                <span className="font-serif text-amber-400 text-base">₹{paymentPromptOrder.total}</span>
              </div>
            </div>

            {/* Select Payment Method */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                How did the customer pay? *
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedPaymentMethod === 'cash'
                      ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/40 scale-105'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xl mb-1">💵</div>
                  <div className="text-xs font-black">CASH</div>
                  <span className="text-[10px] opacity-80 font-mono">₹{paymentPromptOrder.total} to Drawer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedPaymentMethod === 'upi'
                      ? 'bg-blue-500/20 border-blue-400 text-white font-bold ring-2 ring-blue-400/40 scale-105'
                      : 'bg-black/30 border-white/10 text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xl mb-1">📱</div>
                  <div className="text-xs font-black">UPI / QR</div>
                  <span className="text-[10px] opacity-80 font-mono">₹{paymentPromptOrder.total} Online</span>
                </button>
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentPromptOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeDelivery}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                Confirm Paid ({selectedPaymentMethod.toUpperCase()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
