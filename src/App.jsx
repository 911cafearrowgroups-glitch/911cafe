import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import LoyaltyEnrollment from './components/LoyaltyEnrollment';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import StaffDashboard from './components/StaffDashboard';
import CartDrawer from './components/CartDrawer';
import OrderTrackerModal from './components/OrderTrackerModal';
import PosLoginModal from './components/PosLoginModal';
import MobileBottomNav from './components/MobileBottomNav';
import InstallAppBanner from './components/InstallAppBanner';
import { triggerServerSync } from './utils/persistentSync';
import { ShieldCheck, ArrowLeft, Sparkles, ShoppingBag, Check, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('website'); // 'website' | 'staff'
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authenticatedStaff, setAuthenticatedStaff] = useState(null);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);
  const [waitingOrdersCount, setWaitingOrdersCount] = useState(0);
  const [cartToast, setCartToast] = useState(null);
  const [phonePreviewMode, setPhonePreviewMode] = useState(false);

  // Poll waiting orders count periodically
  const fetchWaitingCount = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok && data.data) {
        setWaitingOrdersCount(data.data.waitingOrders || 0);
      }
    } catch (e) {
      // ignore silently
    }
  };

  useEffect(() => {
    // Immediately sync with serverless backend
    triggerServerSync();
    fetchWaitingCount();
    const interval = setInterval(() => {
      fetchWaitingCount();
      triggerServerSync();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Show toast and open cart drawer
    setCartToast(`Added "${item.name}" to cart!`);
    setTimeout(() => setCartToast(null), 3000);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQuantity } : i));
    }
  };

  const handleRemoveItem = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderPlaced = (order) => {
    setActiveTrackingOrderId(order.id);
    fetchWaitingCount();
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-screen max-w-full overflow-x-hidden bg-[#0f0c0b] text-[#f5ebe0] selection:bg-amber-500 selection:text-black ${phonePreviewMode ? 'py-8 px-4 flex flex-col items-center justify-center bg-zinc-950/90 min-h-screen' : ''}`}>
      {/* Toast Alert for Add to Cart */}
      {cartToast && (
        <div className="fixed top-24 right-5 z-50 p-4 rounded-2xl bg-[#1e130c] border border-amber-400 text-amber-200 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{cartToast}</span>
        </div>
      )}

      {/* Desktop Simulator Toggle */}
      <div className="hidden lg:block fixed bottom-5 left-5 z-40">
        <button
          type="button"
          onClick={() => setPhonePreviewMode(!phonePreviewMode)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#1e130c]/90 hover:bg-[#2b1b12] border border-amber-500/30 text-amber-300 text-xs font-bold shadow-2xl backdrop-blur-md transition-all cursor-pointer hover:scale-105"
          title="Toggle Mobile Screen Frame"
        >
          {phonePreviewMode ? <Monitor className="w-4 h-4 text-amber-400" /> : <Smartphone className="w-4 h-4 text-amber-400" />}
          <span>{phonePreviewMode ? 'Switch to Full Desktop' : '📱 Preview Mobile App Frame'}</span>
        </button>
      </div>

      {/* PWA In-App Install Prompt Banner */}
      <InstallAppBanner />

      {/* Phone Mockup Frame (Active when Phone Simulator Mode is enabled) */}
      <div className={phonePreviewMode ? 'w-full max-w-[420px] h-[860px] overflow-y-auto rounded-[46px] border-[10px] border-[#2a1c14] shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative bg-[#0f0c0b] scrollbar-none' : 'w-full max-w-full overflow-x-hidden'}>
        {phonePreviewMode && (
          <div className="sticky top-0 left-0 right-0 z-50 flex justify-center pt-2.5 pb-1 bg-[#0f0c0b] pointer-events-none">
            <div className="w-28 h-4 rounded-full bg-black border border-white/10 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1c1410] border border-white/20"></div>
              <div className="w-2 h-2 rounded-full bg-blue-900/60"></div>
            </div>
          </div>
        )}

        {currentView === 'staff' ? (
          <div>
            {/* Staff POS & Live Order Monitor Mode */}
            <StaffDashboard 
              staffUser={authenticatedStaff}
              onClose={() => {
                setAuthenticatedStaff(null);
                setCurrentView('website');
              }} 
            />
          </div>
        ) : (
          <div>
            {/* Public Cafe Website */}
            <Navbar 
              onOpenStaffLogin={() => setIsLoginModalOpen(true)}
              cartItemCount={totalCartCount}
              onOpenCart={() => setIsCartOpen(true)}
              waitingOrdersCount={waitingOrdersCount}
            />
            
            <main className="pb-24 md:pb-0 max-w-full overflow-x-hidden">
              <Hero />
              <MenuSection 
                onSelectForLoyalty={(item) => {
                  const el = document.getElementById('loyalty-club');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
              />
              <LoyaltyEnrollment onCustomerLoaded={(cust) => setCurrentCustomer(cust)} />
              <AboutSection />
            </main>

            <Footer onOpenStaffLogin={() => setIsLoginModalOpen(true)} />

            {/* Mobile App Bottom Navigation Bar */}
            <MobileBottomNav
              cartItemCount={totalCartCount}
              onOpenCart={() => setIsCartOpen(true)}
              onOpenStaffLogin={() => setIsLoginModalOpen(true)}
              waitingOrdersCount={waitingOrdersCount}
            />

            {/* Customer Order Tracker Floating Shortcut (Above bottom nav on mobile) */}
            {activeTrackingOrderId && (
              <aside aria-label="Order Tracking" className="fixed bottom-20 md:bottom-5 right-4 z-40">
                <button
                  onClick={() => setActiveTrackingOrderId(activeTrackingOrderId)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-2xl border border-blue-400 cursor-pointer animate-pulse"
                >
                  <span>Track Order #{activeTrackingOrderId}</span>
                </button>
              </aside>
            )}

            {/* POS Staff PIN Login Modal */}
            <PosLoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onLoginSuccess={(staff) => {
                setAuthenticatedStaff(staff);
                setIsLoginModalOpen(false);
                setCurrentView('staff');
              }}
            />

            {/* Cart & Checkout Drawer */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onOrderPlaced={handleOrderPlaced}
            />

            {/* Live Order Tracker Modal */}
            {activeTrackingOrderId && (
              <OrderTrackerModal
                orderId={activeTrackingOrderId}
                onClose={() => setActiveTrackingOrderId(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
