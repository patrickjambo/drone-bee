'use client';
import { useState, useEffect } from 'react';
import { Search, Clock, Bell, ChevronDown, Package, AlertTriangle, User as UserIcon } from 'lucide-react';

type Notif = { id: string; text: string; level: 'warning' | 'critical' };

export default function ManagerHeader({ title = 'Search products, sales...' }) {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: 'Loading...', role: 'Agent', avatar: 'https://ui-avatars.com/api/?name=User&background=FFC107&color=1E2336' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name,
            role: data.role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=FFC107&color=1E2336&bold=true`,
          });
        }
      } catch (error) {
        console.error('Failed to load user profile', error);
      }
    };

    // Build real notifications from live inventory health.
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/manager/products');
        if (!res.ok) return;
        const products = await res.json();
        if (!Array.isArray(products)) return;
        const list: Notif[] = [];
        products.forEach((p: any) => {
          if (p.stock_units === 0) list.push({ id: `out-${p.id}`, text: `${p.name} is out of stock`, level: 'critical' });
          else if (p.stock_units <= p.min_stock_threshold) list.push({ id: `low-${p.id}`, text: `${p.name} is low (${p.stock_units} left)`, level: 'warning' });
        });
        setNotifications(list);
      } catch { /* ignore */ }
    };

    fetchProfile();
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;

  return (
    <header className="h-[76px] bg-white flex items-center justify-between px-8 border-b border-gray-100 shrink-0 relative z-40">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder={title} className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden xl:flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Clock size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }} className="relative">
            <Bell size={20} className="text-gray-600 hover:text-amber-500 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute top-10 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">Stock Alerts</h3>
                <span className="text-xs text-gray-400 font-bold">{unreadCount} active</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-sm text-gray-500 text-center">All stock levels are healthy 🎉</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3">
                      <div className={`mt-0.5 ${n.level === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>
                        {n.level === 'critical' ? <AlertTriangle size={16} /> : <Package size={16} />}
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button className="flex items-center gap-3 border-l border-gray-200 pl-6" onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}>
            <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden shrink-0">
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-gray-800">{profile.name}</p>
              <p className="text-xs text-gray-500">{profile.role}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {showProfile && (
            <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <div className="w-12 h-12 rounded-full overflow-hidden"><img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><UserIcon size={14} /> {profile.name}</p>
                  <p className="text-xs text-gray-500">{profile.role}</p>
                </div>
              </div>
              <div className="p-3">
                <form action="/api/auth/logout" method="POST">
                  <button className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors">Sign out</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
