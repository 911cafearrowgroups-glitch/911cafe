import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, Trash2, Phone, User, ShoppingBag, 
  Sparkles, Check, Printer, RotateCcw, Search, Clock, 
  AlertCircle, ChefHat, CheckCircle2, DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveSingleStoredOrder } from '../utils/persistentSync';

export default function TakeOrderPage({ onOrderPunched, onSwitchToMonitor }) {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ticket / Cart State
  const [ticketItems, setTicketItems] = useState([]);
  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' | 'parcel' | 'delivery'
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Customer Loyalty Lookup
  const [loyaltyCustomer, setLoyaltyCustomer] = useState(null);
  const [applyReward, setApplyReward] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  
  // Submission & Receipt State
  const [submitting, setSubmitting] = useState(false);
  const [lastPunchedOrder, setLastPunchedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch Menu
  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMenuItems(data.data);
      })
      .catch(console.error);
  }, []);

  // Auto-check customer when phone is entered (at least 7 digits)
  useEffect(() => {
    const clean = customerPhone.replace(/\D/g, '');
    if (clean.length >= 7) {
      checkCustomer(clean);
    } else {
      setLoyaltyCustomer(null);
      setApplyReward(false);
    }
  }, [customerPhone]);

  const checkCustomer = async (phone) => {
    setLoadingCustomer(true);
    try {
      const res = await fetch(`/api/customers/${phone}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setLoyaltyCustomer(data.data);
        if (!customerName && data.data.name) {
          setCustomerName(data.data.name);
        }
      } else {
        setLoyaltyCustomer(null);
      }
    } catch (e) {
      setLoyaltyCustomer(null);
    } finally {
      setLoadingCustomer(false);
    }
  };

  // Add Item to Ticket
  const handleAddItem = (item) => {
    setTicketItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, qty) => {
    if (qty <= 0) {
      setTicketItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      setTicketItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
    }
  };

  const handleClearTicket = () => {
    setTicketItems([]);
    setCustomerPhone('');
    setCustomerName('');
    setDeliveryAddress('');
    setOrderNote('');
    setApplyReward(false);
    setLoyaltyCustomer(null);
    setErrorMsg(null);
  };

  // Calculate totals
  const subtotal = ticketItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItemCount = ticketItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // Official 911 Cafe parcel charge: ₹10 for EACH item on parcel and delivery
  const parcelCharges = (orderType === 'parcel' || orderType === 'delivery') ? (totalItemCount * 10) : 0;
  
  let discount = 0;
  if (applyReward && loyaltyCustomer?.rewardAvailable) {
    const highestPriceItem = [...ticketItems].sort((a, b) => b.price - a.price)[0];
    discount = highestPriceItem ? highestPriceItem.price : 99;
  }

  const grandTotal = Math.max(0, subtotal - discount + parcelCharges);

  // Punch Order
  const handlePunchOrder = async () => {
    setErrorMsg(null);
    if (ticketItems.length === 0) {
      setErrorMsg('Please tap items on the left to add to the order ticket.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Customer Name is required to punch the order.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          orderType,
          deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
          items: ticketItems,
          instructions: orderNote,
          paymentMethod,
          applyLoyaltyReward: applyReward
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to punch order');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setLastPunchedOrder(data.order);
      saveSingleStoredOrder(data.order);
      handleClearTicket();
      if (onOrderPunched) onOrderPunched(data.order);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter menu
  const categories = [
    { id: 'all', label: 'All Items (30)' },
    { id: 'classic', label: 'Classic (₹89)' },
    { id: 'double', label: 'Double Choc (₹99)' },
    { id: 'crunch', label: 'Crunch Bites (₹99)' },
    { id: 'special', label: 'Special Waffles' },
    { id: 'pancake', label: '🥞 Pan Cakes' },
    { id: 'brownie', label: '🍫 Brownies' },
  ];

  const filteredItems = menuItems.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-4">
      {/* Top Banner - hidden on mobile to eliminate double headings, clean on desktop */}
      <div className="hidden sm:flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
            COUNTER POS
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
            Take Order & Quick Billing
          </h2>
          <p className="text-xs text-zinc-400">
            Official 911 Cafe Menu • Auto-calculates 5+1 Loyalty Stamps & ₹10 Parcel fee
          </p>
        </div>
      </div>

      {/* Main Split Layout: Left Menu (7 Cols) + Right Order Ticket (5 Cols) */}
      <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* LEFT: Quick Menu Selection */}
        <div className="lg:col-span-7 space-y-3">
          {/* Category Filter Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex overflow-x-auto gap-1.5 pb-1 scrollbar-none whitespace-nowrap -mx-1 px-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-black shadow-md font-black'
                      : 'bg-[#18110e] text-zinc-400 hover:text-white border border-amber-500/15'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48 shrink-0">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search menu item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/25 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Menu Items Fast-Tap Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const inTicket = ticketItems.find(i => i.id === item.id);
              const qty = inTicket ? inTicket.quantity : 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddItem(item)}
                  className={`p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                    qty > 0
                      ? 'bg-gradient-to-b from-[#2e1d13] to-[#1c110a] border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                      : 'bg-[#18110e] border-amber-500/15 hover:border-amber-500/40 hover:bg-[#201510]'
                  }`}
                >
                  {/* Quantity Badge */}
                  {qty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-black font-black font-mono text-xs flex items-center justify-center shadow-md">
                      {qty}
                    </span>
                  )}

                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-400/80 block">
                      {item.categoryLabel || item.category}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight mt-0.5 group-hover:text-amber-300">
                      {item.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold font-serif text-amber-400">
                      ₹{item.price}
                    </span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-white flex items-center gap-0.5">
                      <Plus className="w-3 h-3" /> Add
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Active Order Ticket */}
        <div id="order-ticket" className="lg:col-span-5 bg-[#160f0c] border-2 border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
          {/* Ticket Header & Type Selection */}
          <div className="pb-3 border-b border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Current Ticket
              </span>
              <h3 className="text-base font-bold text-white font-serif">Order Details</h3>
            </div>

            {ticketItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearTicket}
                className="text-[11px] text-amber-400 hover:text-red-400 font-semibold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Order Type Toggle */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'dine-in', label: '🍽️ Dine-In', note: '₹0 fee' },
              { id: 'parcel', label: '📦 Parcel', note: '+₹10 fee' },
              { id: 'delivery', label: '🛵 Delivery', note: '+₹10 fee' },
            ].map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setOrderType(type.id)}
                className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                  orderType === type.id
                    ? 'bg-amber-500 text-black shadow-md font-black'
                    : 'bg-black/40 text-zinc-400 border border-white/10'
                }`}
              >
                <div className="leading-tight">{type.label}</div>
                <span className="text-[9px] font-normal opacity-80">{type.note}</span>
              </button>
            ))}
          </div>

          {/* Customer Details: Name is Required, Mobile is Optional */}
          <div className="space-y-2.5">
            {/* Customer Name (REQUIRED) */}
            <div>
              <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Customer Name *</span>
                <span className="text-[9px] text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded">REQUIRED</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter Customer Name (e.g. Ramesh)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-amber-500/40 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>
            </div>

            {/* Customer Phone (OPTIONAL) */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Mobile Number</span>
                <span className="text-[9px] text-zinc-500 font-normal">Optional (For 5+1 Stamp Tracking)</span>
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="10-digit mobile (optional)..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Loyalty Feedback Banner */}
            {loyaltyCustomer && (
              <div className={`p-2.5 rounded-xl text-xs border ${
                loyaltyCustomer.rewardAvailable
                  ? 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border-yellow-400 text-yellow-100 animate-pulse'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {loyaltyCustomer.name}
                  </span>
                  <span className="font-mono text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded-md">
                    {loyaltyCustomer.stampsCount}/5 Stamps
                  </span>
                </div>

                {loyaltyCustomer.rewardAvailable ? (
                  <div className="mt-2 pt-1.5 border-t border-yellow-400/30">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-yellow-300">
                      <input
                        type="checkbox"
                        checked={applyReward}
                        onChange={(e) => setApplyReward(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span>🎉 6th Visit Offer: Apply Free Waffle (Save ₹{discount || 89})!</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-300 mt-0.5">
                    Order will earn Stamp #{loyaltyCustomer.stampsCount + 1}! ({5 - loyaltyCustomer.stampsCount} more to 6th free offer)
                  </p>
                )}
              </div>
            )}

            {/* Delivery Address if delivery */}
            {orderType === 'delivery' && (
              <div>
                <textarea
                  rows="2"
                  placeholder="Delivery Address & Landmark..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-amber-500/25 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            )}
          </div>

          {/* Ticket Items List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {ticketItems.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl">
                Tap items on the left to add to bill
              </div>
            ) : (
              ticketItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <h5 className="font-bold text-white truncate">{item.name}</h5>
                    <span className="text-[10px] text-amber-400 font-mono">₹{item.price} each</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold font-mono text-xs w-4 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-5 h-5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-bold font-mono text-white text-xs w-12 text-right">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Special Kitchen Instruction */}
          <div>
            <input
              type="text"
              placeholder="Kitchen Note (e.g. extra crispy, warm chocolate)"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/20 border-amber-400 text-white'
                    : 'bg-black/30 border-white/10 text-zinc-400'
                }`}
              >
                💵 Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-1.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-amber-500/20 border-amber-400 text-white'
                    : 'bg-black/30 border-white/10 text-zinc-400'
                }`}
              >
                📱 UPI / Card
              </button>
            </div>
          </div>

          {/* Bill Calculation Summary */}
          <div className="pt-3 border-t border-amber-500/20 space-y-1 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-mono text-white">₹{subtotal}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-yellow-300 font-bold">
                <span>6th Visit Free Treat:</span>
                <span className="font-mono">-₹{discount}</span>
              </div>
            )}

            {parcelCharges > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Parcel Charges (₹10 × {totalItemCount} items):</span>
                <span className="font-mono font-bold">+₹{parcelCharges}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
              <span>Grand Total:</span>
              <span className="text-xl font-serif text-amber-400">₹{grandTotal}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Big Punch Button */}
          <button
            type="button"
            disabled={submitting || ticketItems.length === 0}
            onClick={handlePunchOrder}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChefHat className="w-5 h-5" />
            <span>{submitting ? 'Punching...' : `Punch Order (₹${grandTotal})`}</span>
          </button>
        </div>
      </div>

      {/* POPUP: Order Confirmation & Print Slip */}
      {lastPunchedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1a110d] border-2 border-amber-400 rounded-3xl p-6 text-white shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500 text-black flex items-center justify-center text-2xl font-black shadow-lg">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                911 CAFE • ORDER CONFIRMED
              </span>
              <h3 className="text-2xl font-bold font-serif text-white mt-1">
                Order #{lastPunchedOrder.id}
              </h3>
              <p className="text-xs text-zinc-300 font-mono mt-0.5">
                {lastPunchedOrder.orderType.toUpperCase()} • ₹{lastPunchedOrder.total}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-left text-xs space-y-1">
              {lastPunchedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-mono text-zinc-400">₹{it.price * it.quantity}</span>
                </div>
              ))}
              {lastPunchedOrder.parcelCharges > 0 && (
                <div className="flex justify-between text-amber-400 pt-1 border-t border-white/5">
                  <span>Parcel Charge:</span>
                  <span>+₹{lastPunchedOrder.parcelCharges}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-emerald-400 font-semibold">
              ✓ Sent to Kitchen Waiting Orders Monitor!
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Slip
              </button>
              <button
                type="button"
                onClick={() => setLastPunchedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Floating Ticket Bar */}
      {ticketItems.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('order-ticket');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 text-black font-extrabold text-xs flex items-center justify-between shadow-2xl shadow-amber-500/40 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-black text-amber-400 font-mono text-xs flex items-center justify-center font-black">
                {ticketItems.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)}
              </span>
              <span>Ticket Items</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-sm">
                ₹{ticketItems.reduce((sum, i) => sum + (Number(i.price) * (Number(i.quantity) || 1)), 0)}
              </span>
              <span className="underline font-bold">Punch Order ↓</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
