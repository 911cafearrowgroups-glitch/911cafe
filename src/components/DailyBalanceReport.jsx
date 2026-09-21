import React, { useState, useEffect } from 'react';
import { 
  Calendar, DollarSign, Smartphone, Banknote, 
  Printer, RefreshCw, ShoppingBag, Package, TrendingUp, CheckCircle, Clock
} from 'lucide-react';

export default function DailyBalanceReport() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyBalance = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/daily?date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setBalanceData(data.data);
      }
    } catch (err) {
      console.error('Failed to load daily balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyBalance(selectedDate);
  }, [selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Selector */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#18110d] border border-amber-500/20 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            DAY-END REGISTER
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white mt-1">
            One-Day Sales & Cash vs UPI Balance
          </h2>
          <p className="text-xs text-zinc-400">
            Daily reconciliation of cash in drawer, UPI transfers, and parcel fees
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-amber-500/25">
            <Calendar className="w-4 h-4 text-amber-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none font-mono cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchDailyBalance(selectedDate)}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Closing Slip</span>
          </button>
        </div>
      </div>

      {loading && !balanceData ? (
        <div className="py-16 text-center text-zinc-500 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span className="text-xs">Calculating one-day balance...</span>
        </div>
      ) : balanceData ? (
        <div className="space-y-6">
          {/* Balance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#24170d] to-[#160e09] border-2 border-amber-500/40 shadow-xl">
              <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Day Sales</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-serif text-white mt-2">
                ₹{balanceData.totalSales}
              </p>
              <span className="text-[11px] text-zinc-400">
                {balanceData.completedOrdersCount} completed orders
              </span>
            </div>

            {/* Cash in Hand / Drawer */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#122214] to-[#0b160d] border-2 border-emerald-500/40 shadow-xl">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span>💵 Cash in Drawer</span>
                <Banknote className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-serif text-emerald-300 mt-2">
                ₹{balanceData.cashTotal}
              </p>
              <span className="text-[11px] text-zinc-400">
                Physical cash to tally at closing
              </span>
            </div>

            {/* UPI Online Collections */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#101b2a] to-[#0a111a] border-2 border-blue-500/40 shadow-xl">
              <div className="flex items-center justify-between text-blue-400 text-xs font-bold uppercase tracking-wider">
                <span>📱 UPI Collections</span>
                <Smartphone className="w-4 h-4" />
              </div>
              <p className="text-3xl font-black font-serif text-blue-300 mt-2">
                ₹{balanceData.upiTotal}
              </p>
              <span className="text-[11px] text-zinc-400">
                Direct bank / QR transfers
              </span>
            </div>

            {/* Parcel Charges */}
            <div className="p-5 rounded-3xl bg-[#17100d] border border-amber-500/20 shadow-xl">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <span>📦 Parcel Fees</span>
                <Package className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black font-serif text-amber-400 mt-2">
                ₹{balanceData.parcelTotal}
              </p>
              <span className="text-[11px] text-zinc-400">
                Official ₹10 packing fees collected
              </span>
            </div>
          </div>

          {/* Payment Mode Ratio Bar */}
          {balanceData.totalSales > 0 && (
            <div className="p-4 rounded-2xl bg-[#17100d] border border-amber-500/20 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1">
                  💵 Cash: ₹{balanceData.cashTotal} ({Math.round((balanceData.cashTotal / balanceData.totalSales) * 100)}%)
                </span>
                <span className="text-blue-400 flex items-center gap-1">
                  📱 UPI: ₹{balanceData.upiTotal} ({Math.round((balanceData.upiTotal / balanceData.totalSales) * 100)}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${(balanceData.cashTotal / balanceData.totalSales) * 100}%` }}
                />
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${(balanceData.upiTotal / balanceData.totalSales) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Two-Column Detail Layout: Items Sold Breakdown (Left) + Orders Audit Log (Right) */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Items Sold Breakdown */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-[#160f0c] border border-amber-500/20 shadow-xl">
              <h3 className="text-base font-bold font-serif text-white mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Waffles & Items Sold Today ({balanceData.itemsSold?.length || 0})</span>
              </h3>

              {balanceData.itemsSold?.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No items sold yet on {selectedDate}.
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {balanceData.itemsSold.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-white line-clamp-1">{it.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {it.quantity} sold @ ₹{it.price}
                        </span>
                      </div>
                      <span className="font-bold font-mono text-amber-400">
                        ₹{it.revenue}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivered Orders Audit List */}
            <div className="lg:col-span-7 p-5 rounded-3xl bg-[#160f0c] border border-amber-500/20 shadow-xl">
              <h3 className="text-base font-bold font-serif text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Completed Orders ({balanceData.orders?.length || 0})</span>
              </h3>

              {balanceData.orders?.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No orders completed/delivered yet on {selectedDate}.
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {balanceData.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black font-mono text-white">#{ord.id}</span>
                          <span className="text-[10px] uppercase font-bold text-zinc-400">
                            {ord.orderType}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 mt-0.5">
                          {ord.customerName} {ord.customerPhone ? `(${ord.customerPhone})` : ''}
                        </p>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          ord.paymentMethod === 'upi'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {ord.paymentMethod === 'upi' ? '📱 UPI' : '💵 Cash'}
                        </span>

                        <span className="font-black font-serif text-sm text-amber-400 w-14 text-right">
                          ₹{ord.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Printable Thermal Receipt Style Slip (Hidden until printed) */}
          <div className="print-only hidden p-6 bg-white text-black font-mono text-xs max-w-sm mx-auto">
            <div className="text-center pb-2 border-b border-black">
              <h2 className="text-base font-black">911 CAFE</h2>
              <p className="text-[10px]">Arrow Groups</p>
              <p className="text-xs font-bold mt-1">DAILY SALES CLOSING REPORT</p>
              <p className="text-[10px]">Date: {balanceData.date}</p>
            </div>

            <div className="py-2 border-b border-black space-y-1">
              <div className="flex justify-between">
                <span>TOTAL REVENUE:</span>
                <span className="font-black">₹{balanceData.totalSales}</span>
              </div>
              <div className="flex justify-between">
                <span>CASH IN HAND:</span>
                <span className="font-bold">₹{balanceData.cashTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>UPI RECEIVED:</span>
                <span className="font-bold">₹{balanceData.upiTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>PARCEL FEES:</span>
                <span>₹{balanceData.parcelTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>TOTAL ORDERS:</span>
                <span>{balanceData.completedOrdersCount}</span>
              </div>
            </div>

            <div className="py-2 text-[10px] text-center">
              <p>Cashier Signature: __________________</p>
              <p className="mt-1">Printed: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
