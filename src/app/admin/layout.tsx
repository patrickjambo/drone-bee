'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unwatchedAlerts, setUnwatchedAlerts] = useState(0);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Optionally fetch unwatched alerts globally here so it stays fresh
  useEffect(() => {
    if (pathname.startsWith('/admin/login')) return;
    const fetchAlerts = async () => {
       try {
         const res = await fetch('/api/admin/system');
         if (res.ok) {
           const data = await res.json();
           setUnwatchedAlerts(data.unreadAlertsCount || 0);
         }
       } catch (e) {}
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-gray-800">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white h-[70px] z-[60] flex items-center px-4 border-b border-gray-200">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 -ml-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-md">
          {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
        <span className="font-serif text-xl font-bold tracking-wide text-[#1E2336]">Drone Bee Admin</span>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[40] lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-[50] lg:w-[280px]`}>
        <AdminSidebar unwatchedAlerts={unwatchedAlerts} />
      </div>

      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen pt-[70px] lg:pt-0 pb-10 w-full overflow-x-hidden">
        <div className="hidden lg:block sticky top-0 z-40 bg-white">
          <AdminHeader title="Search admin portal..." />
        </div>
        
        <main className="flex-1 p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}