import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Heart, ShoppingBag, Check } from 'lucide-react';

export default function MenuSection({ onSelectForLoyalty, onAddToCart, cartItems = [] }) {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [savedCraving, setSavedCraving] = useState({});

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (res.ok) {
        setMenuItems(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Items (30)' },
    { id: 'classic', label: '🧇 Classic Waffles (₹89)' },
    { id: 'double', label: '🍫 Double Chocolate (₹99)' },
    { id: 'crunch', label: '⭐ Crunch Bites (₹99)' },
    { id: 'special', label: '👑 Special Waffles (₹109 - ₹129)' },
    { id: 'pancake', label: '🥞 Pan Cakes (₹59 - ₹79)' },
    { id: 'brownie', label: '🍫 Brownies (₹49 - ₹99)' },
  ];

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const toggleCraving = (id) => {
    setSavedCraving(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getItemCartQuantity = (itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };

  return (
    <section id="menu" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Flame className="w-3.5 h-3.5" /> Arrow Groups • 911 Cafe
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-white tracking-tight">
          Official <span className="gold-gradient-text">Cafe Menu</span>
        </h2>
        <p className="text-zinc-400 mt-2 text-sm sm:text-base leading-relaxed">
          Waffles, Pan Cakes & Brownies that make every moment special! Handcrafted fresh to order.
        </p>

        {/* Official Parcel Notice */}
        <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-xl bg-[#1d130d] border border-amber-500/30 text-xs text-amber-300 font-medium">
          <span>📦 Parcel Charges: <strong>₹10 Per Item</strong> (Applicable on takeaway & delivery)</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap justify-start sm:justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold scale-105'
                : 'bg-[#18110e] text-zinc-400 hover:text-white border border-amber-500/15 hover:border-amber-500/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Grid - 2 columns on mobile, 4 columns on desktop */}
      {loading ? (
        <div className="text-center py-16 text-zinc-500">Loading delicious treats...</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredItems.map((item) => {
            const isFav = !!savedCraving[item.id];
            const qty = getItemCartQuantity(item.id);
            return (
              <div
                key={item.id}
                className="group rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1c1410] to-[#120b08] border border-amber-500/15 overflow-hidden hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 overflow-hidden bg-black/40">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1410] via-transparent to-transparent"></div>

                    {/* Badge */}
                    {item.badge && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black shadow-md">
                        {item.badge}
                      </span>
                    )}

                    {/* Favorite / Crave Button */}
                    <button
                      type="button"
                      onClick={() => toggleCraving(item.id)}
                      className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                        isFav ? 'bg-red-500 text-white' : 'bg-black/50 text-zinc-300 hover:text-red-400'
                      }`}
                      title="Save craving"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center gap-1 mb-1.5 sm:mb-2 overflow-hidden">
                      {item.tags?.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400/90 font-medium truncate">
                          {t}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xs sm:text-base font-bold font-serif text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-tight">
                      {item.name}
                    </h3>
                    <p className="hidden sm:block text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & Order / Cart Button */}
                <div className="p-3 sm:p-5 pt-0 border-t border-amber-500/10 mt-1 sm:mt-2 flex items-center justify-between gap-1.5 sm:gap-2">
                  <div>
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase block font-medium">Price</span>
                    <span className="text-sm sm:text-lg font-bold font-serif text-amber-400">
                      ₹{item.price}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(item)}
                    className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md active:scale-95 ${
                      qty > 0
                        ? 'bg-amber-400 text-black font-black scale-105'
                        : 'bg-amber-500 hover:bg-amber-400 text-black hover:scale-105'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{qty > 0 ? `+(${qty})` : 'Add'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sweet Craving Guarantee Banner */}
      <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#221610] via-[#1a100a] to-[#221610] border border-amber-500/25 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h4 className="text-lg sm:text-xl font-bold font-serif text-white">
            Craving an emergency dessert delivery or counter pickup?
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Give your phone number when you order — stamps are credited automatically to your digital 911 card!
          </p>
        </div>
        <a
          href="#loyalty-club"
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
        >
          View My Loyalty Punch Card
        </a>
      </div>
    </section>
  );
}
