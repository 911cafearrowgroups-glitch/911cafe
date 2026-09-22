import React, { useState, useEffect } from 'react';
import StaffDashboard from './components/StaffDashboard';
import LoginPage from './components/LoginPage';
import { triggerServerSync } from './utils/persistentSync';

export default function App() {
  const [authenticatedStaff, setAuthenticatedStaff] = useState(() => {
    try {
      const saved = localStorage.getItem('911_staff_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    // Initial and periodic background sync across devices
    triggerServerSync();
    const interval = setInterval(triggerServerSync, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (staffData) => {
    setAuthenticatedStaff(staffData);
    try {
      localStorage.setItem('911_staff_user', JSON.stringify(staffData));
    } catch (e) {}
  };

  const handleLogout = () => {
    setAuthenticatedStaff(null);
    try {
      localStorage.removeItem('911_staff_user');
    } catch (e) {}
  };

  if (!authenticatedStaff) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#0d0908] text-white selection:bg-amber-500 selection:text-black">
      <StaffDashboard 
        staffUser={authenticatedStaff}
        onClose={handleLogout}
      />
    </div>
  );
}
