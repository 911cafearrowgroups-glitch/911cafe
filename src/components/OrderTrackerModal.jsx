import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle2, Bike, ChefHat, Sparkles, MapPin, Phone, RefreshCw, AlertCircle } from 'lucide-react';

export default function OrderTrackerModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data.data);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Live polling every 5s for real-time status updates from the kitchen monitor
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (!orderId) return null;

  const steps = [
    { key: 'waiting', label: 'Order Received', desc: 'In queue with 911 kitchen', icon: Clock },
    { key: 'preparing', label: 'Baking & Preparing', desc: 'Fresh on irons & in ovens', icon: ChefHat },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider dispatched to doorstep', icon: Bike },
    { key: 'delivered', label: 'Delivered', desc: 'Fresh & warm! Enjoy your treat', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepKey) => {
    if (!order) return 'upcoming';
    const statusOrder = ['waiting', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#18110e] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-500/20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center font-black text-xl shadow-lg">
            🥞
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Order Tracker
              </span>
              <span className="text-xs font-mono text-zinc-400 font-bold">
                #{order?.id}
              </span>
            </div>
            <h3 className="text-xl font-serif font-black text-white mt-1">
              Tracking Your Sweet Emergency
            </h3>
          </div>
        </div>

        {loading && !order ? (
          <div className="py-12 text-center text-zinc-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Fetching live status from kitchen...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Status Banner */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              order.status === 'waiting'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                : order.status === 'preparing'
                ? 'bg-yellow-500/20 border-yellow-400 text-yellow-100'
                : order.status === 'out_for_delivery'
                ? 'bg-blue-500/20 border-blue-400 text-blue-100'
                : 'bg-emerald-500/20 border-emerald-400 text-emerald-100'
            }`}>
              <div className="flex items-center gap-3">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                </span>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">
                    {order.status === 'waiting' && '⏳ Waiting for Kitchen Slot'}
                    {order.status === 'preparing' && '🍳 Freshly Baking in Kitchen!'}
                    {order.status === 'out_for_delivery' && '🛵 Out For Delivery to You!'}
                    {order.status === 'delivered' && '🎉 Delivered! Hope you love it!'}
                  </h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    {order.status === 'waiting' && 'Your order was received and chefs are picking up your ticket.'}
                    {order.status === 'preparing' && 'Waffles on irons & brownies warming up fresh to order.'}
                    {order.status === 'out_for_delivery' && 'Packed hot with thermal packaging on rider bike.'}
                    {order.status === 'delivered' && 'Thank you for choosing 911 Cafe!'}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold bg-black/40 px-2.5 py-1 rounded-full text-zinc-300">
                {order.elapsedMinutes || 0}m elapsed
              </span>
            </div>

            {/* Step Progress Tracker */}
            <div className="space-y-4 relative py-2">
              {steps.map((step, idx) => {
                const status = getStepStatus(step.key);
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Line between steps */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-10 -ml-[1px] transition-colors ${
                          status === 'completed' ? 'bg-amber-400' : 'bg-white/10'
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      status === 'completed'
                        ? 'bg-amber-500 text-black shadow-md'
                        : status === 'current'
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black ring-4 ring-amber-500/25 animate-pulse'
                        : 'bg-black/40 border border-white/10 text-zinc-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Step Details */}
                    <div className="pt-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-xs font-bold ${
                          status === 'current' ? 'text-amber-300 font-extrabold' : status === 'completed' ? 'text-white' : 'text-zinc-500'
                        }`}>
                          {step.label}
                        </h5>
                        {status === 'completed' && (
                          <span className="text-[10px] text-amber-400 font-semibold font-mono">Completed</span>
                        )}
                        {status === 'current' && (
                          <span className="text-[10px] text-amber-400 font-bold uppercase animate-pulse">In Progress</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Details & Address */}
            <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/15 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                  Order Items ({order.items?.length})
                </span>
                <span className="font-bold text-amber-400 font-serif">₹{order.total}</span>
              </div>

              <div className="space-y-1.5">
                {order.items?.map((it, i) => (
                  <div key={i} className="flex items-center justify-between text-zinc-300">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="font-mono text-zinc-400">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {order.deliveryAddress && (
                <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="text-white font-medium block">Delivery Destination:</span>
                    <span>{order.deliveryAddress}</span>
                    {order.landmark && <span className="block text-zinc-500">Landmark: {order.landmark}</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Helpline */}
            <div className="flex items-center justify-between pt-2 text-xs text-zinc-400">
              <span className="text-[11px]">Have questions about your order?</span>
              <a
                href="tel:9110000000"
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold"
              >
                <Phone className="w-3.5 h-3.5" /> Call 911 Cafe Kitchen
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
