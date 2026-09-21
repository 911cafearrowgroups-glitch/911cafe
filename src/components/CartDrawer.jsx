import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, MapPin, Phone, User, Sparkles, Check, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveSingleStoredOrder } from '../utils/persistentSync';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced
}) {
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'takeaway'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  
  // Loyalty link state
  const [loyaltyCustomer, setLoyaltyCustomer] = useState(null);
  const [applyReward, setApplyReward] = useState(false);
  const [checkingLoyalty, setCheckingLoyalty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-check customer loyalty when phone changes (10 digits)
  useEffect(() => {
    const clean = customerPhone.replace(/\D/g, '');
    if (clean.length >= 10) {
      checkLoyalty(clean);
    } else {
      setLoyaltyCustomer(null);
      setApplyReward(false);
    }
  }, [customerPhone]);

  const checkLoyalty = async (phone) => {
    setCheckingLoyalty(true);
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
      setCheckingLoyalty(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // 6th Visit reward discount calculation
  let discount = 0;
  if (applyReward && loyaltyCustomer?.rewardAvailable) {
    const highestItem = [...cartItems].sort((a, b) => b.price - a.price)[0];
    discount = highestItem ? highestItem.price : 200;
  }

  // Official 911 Cafe parcel charge: ₹10 for EACH item
  const parcelCharges = totalItemCount * 10;
  const deliveryFee = orderType === 'delivery' ? (subtotal >= 400 ? 0 : 30) : 0;
  const grandTotal = Math.max(0, subtotal - discount + parcelCharges + deliveryFee);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (cartItems.length === 0) {
      setError('Your craving cart is empty!');
      return;
    }
    if (!customerName.trim()) {
      setError('Please provide your name (required).');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('Please enter your full delivery address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          orderType,
          deliveryAddress,
          landmark,
          items: cartItems,
          instructions,
          paymentMethod,
          applyLoyaltyReward: applyReward
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      saveSingleStoredOrder(data.order);
      onClearCart();
      onClose();
      if (onOrderPlaced) {
        onOrderPlaced(data.order);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#140e0b] border-l border-amber-500/20 text-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-amber-500/20 flex items-center justify-between bg-[#19110d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">Your Craving Order</h3>
              <p className="text-[11px] text-zinc-400">{cartItems.length} item(s) in cart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cart Items List */}
          {cartItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <div className="text-4xl mb-3">🧇</div>
              <p className="text-sm font-medium text-zinc-400">Your craving basket is empty!</p>
              <p className="text-xs text-zinc-500 mt-1">Explore our waffles, pancakes, and brownies to add.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Items</span>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-amber-400 hover:text-amber-300 text-[11px]"
                >
                  Clear all
                </button>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-black/40 border border-amber-500/15 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                    <span className="text-xs font-serif text-amber-400 font-bold">₹{item.price} each</span>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 bg-[#1f1510] px-2 py-1 rounded-xl border border-amber-500/20">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="text-zinc-400 hover:text-amber-400 p-0.5"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="text-zinc-400 hover:text-amber-400 p-0.5"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-white font-mono w-14 text-right">
                    ₹{item.price * item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Order Type: Delivery vs Takeaway */}
          {cartItems.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-amber-500/15">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Order Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      orderType === 'delivery'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-black/40 text-zinc-400 border border-white/10'
                    }`}
                  >
                    🛵 Home Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      orderType === 'takeaway'
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-black/40 text-zinc-400 border border-white/10'
                    }`}
                  >
                    🛍️ Takeaway / Dine-In
                  </button>
                </div>
              </div>

              {/* Customer Contact & Loyalty Check */}
              <div className="space-y-3">
                {/* 1. Customer Name (REQUIRED) */}
                <div>
                  <label className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Your Name *</span>
                    <span className="text-[9px] text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded">REQUIRED</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-amber-500/40 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>
                </div>

                {/* 2. Customer Phone (OPTIONAL) */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Mobile Number</span>
                    <span className="text-[9px] text-zinc-500 font-normal">Optional (For 5+1 Loyalty Stamps)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210 (optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                {/* Loyalty Recognition Banner */}
                {loyaltyCustomer && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    loyaltyCustomer.rewardAvailable 
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-yellow-400 text-yellow-200' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold">Welcome back, {loyaltyCustomer.name}!</span>
                      </div>
                      <span className="text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded-full">
                        {loyaltyCustomer.stampsCount}/5 Stamps
                      </span>
                    </div>

                    {loyaltyCustomer.rewardAvailable ? (
                      <div className="mt-2 pt-2 border-t border-yellow-400/30">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-yellow-300">
                          <input
                            type="checkbox"
                            checked={applyReward}
                            onChange={(e) => setApplyReward(e.target.checked)}
                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                          />
                          <span>🎉 Apply 6th Visit Free Treat (Save ₹{discount || 200})!</span>
                        </label>
                      </div>
                    ) : (
                      <p className="text-[10px] text-zinc-300 mt-1">
                        🌟 Completing this order earns you Stamp #{loyaltyCustomer.stampsCount + 1}! (Just {5 - loyaltyCustomer.stampsCount} to go for 6th free offer).
                      </p>
                    )}
                  </div>
                )}

                {orderType === 'delivery' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Full Delivery Address *
                      </label>
                      <textarea
                        required
                        rows="2"
                        placeholder="House/Flat No, Apartment Name, Street..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-amber-500/25 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Near Metro Station / Temple"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-amber-500/25 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Special Cooking / Delivery Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra chocolate fudge, keep separate"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-amber-500/25 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      onClick={() => setPaymentMethod('cash_on_delivery')}
                      className={`p-2 rounded-xl border text-center cursor-pointer ${
                        paymentMethod === 'cash_on_delivery'
                          ? 'bg-amber-500/20 border-amber-400 font-bold text-white'
                          : 'bg-black/30 border-white/10 text-zinc-400'
                      }`}
                    >
                      💵 Cash on Delivery
                    </label>
                    <label
                      onClick={() => setPaymentMethod('upi_online')}
                      className={`p-2 rounded-xl border text-center cursor-pointer ${
                        paymentMethod === 'upi_online'
                          ? 'bg-amber-500/20 border-amber-400 font-bold text-white'
                          : 'bg-black/30 border-white/10 text-zinc-400'
                      }`}
                    >
                      📱 Pay via UPI / QR
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-amber-500/20 bg-[#17100d] space-y-3">
            <div className="space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-white">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-yellow-400 font-bold">
                  <span>6th Visit Free Treat Discount:</span>
                  <span className="font-mono">-₹{discount}</span>
                </div>
              )}

              {parcelCharges > 0 && (
                <div className="flex justify-between text-amber-400 font-medium">
                  <span>Parcel Charges (₹10 × {totalItemCount} items):</span>
                  <span className="font-mono font-bold">+₹{parcelCharges}</span>
                </div>
              )}

              {orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Delivery Partner Fee:</span>
                  <span className="font-mono text-white">
                    {deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE (Above ₹400)</span> : `₹${deliveryFee}`}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                <span>Total to Pay:</span>
                <span className="text-lg font-serif text-amber-400 font-bold">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitOrder}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Sending to Kitchen...</span>
              ) : (
                <>
                  <span>Place {orderType === 'delivery' ? 'Delivery' : 'Takeaway'} Order (₹{grandTotal})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-zinc-500">
              ⚡ Orders are prepared fresh immediately upon confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
