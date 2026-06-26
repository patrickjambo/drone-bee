'use client';
import { useState, useEffect } from 'react';
import { Search, Clock, Bell, ChevronDown, AlertTriangle, Package, User as UserIcon } from 'lucide-react';

type Alert = { id: string; severity: string; title: string; description: string; created_at: string };

export default function AdminHeader({ title = 'Search admin portal...' }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: 'Loading...', role: 'Super Admin', avatar: 'https://ui-avatars.com/api/?name=Admin&background=E8C265&color=1E2336&bold=true' });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.name) setProfile({ name: d.name, role: d.role, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=E8C265&color=1E2336&bold=true` });
    }).catch(() => {});

    const fetchAlerts = () => fetch('/api/admin/alerts').then(r => r.ok ? r.json() : []).then(d => { if (Array.isArray(d)) setAlerts(d); }).catch(() => {});
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  const unread = alerts.length;

  return (
    <header className="h-[76px] bg-white flex items-center justify-between px-8 border-b border-gray-100 shrink-0 relative z-40">
      <div className="relative w-96 max-w-[40vw]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder={title} className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden xl:flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Clock size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }} className="relative">
            <Bell size={20} className="text-gray-600 hover:text-amber-500 transition-colors" />
            {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {showNotifs && (
            <div className="absolute top-10 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-sm">System Alerts</h3>
                <span className="text-xs text-gray-400 font-bold">{unread} unresolved</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="p-6 text-sm text-gray-500 text-center">No active alerts 🎉</p>
                ) : alerts.slice(0, 8).map(a => (
                  <div key={a.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex gap-3">
                    <div className={`mt-0.5 ${a.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'}`}>{a.severity === 'CRITICAL' ? <AlertTriangle size={16} /> : <Package size={16} />}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button className="flex items-center gap-3 border-l border-gray-200 pl-6" onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}>
            <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden shrink-0"><img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /></div>
            <div className="hidden sm:block text-left"><p className="text-sm font-bold text-gray-800">{profile.name}</p><p className="text-xs text-gray-500">{profile.role}</p></div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {showProfile && (
            <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-5 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <div className="w-12 h-12 rounded-full overflow-hidden"><img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /></div>
                <div><p className="font-bold text-gray-900 text-sm flex items-center gap-1.5"><UserIcon size={14} /> {profile.name}</p><p className="text-xs text-gray-500">{profile.role}</p></div>
              </div>
              <div className="p-3"><form action="/api/auth/logout" method="POST"><button className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm transition-colors">Sign out</button></form></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
