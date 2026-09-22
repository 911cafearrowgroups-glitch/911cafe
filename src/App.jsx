import React, { useEffect } from 'react';
import StaffDashboard from './components/StaffDashboard';
import { triggerServerSync } from './utils/persistentSync';

export default function App() {
  const staffUser = {
    name: 'Counter Cashier',
    role: 'cashier',
    id: 'staff-1'
  };

  useEffect(() => {
    // Background persistent synchronization
    triggerServerSync();
    const interval = setInterval(triggerServerSync, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#0d0908] text-white selection:bg-amber-500 selection:text-black">
      <StaffDashboard 
        staffUser={staffUser}
      />
    </div>
  );
}
