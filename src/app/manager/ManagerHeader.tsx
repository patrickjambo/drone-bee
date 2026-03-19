'use client';
import React, { useState, useEffect } from 'react';
import { Search, Clock, Bell, ChevronDown, CheckCircle, X, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ManagerHeader({ title = "Search products, sales..." }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<{id: number, text: string, time: string, read: boolean}[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({ name: 'Loading...', role: 'Agent', avatar: 'https://ui-avatars.com/api/?name=User&background=random' });

  useEffect(() => {
    // Fetch actual logged-in user profile
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name,
            role: data.role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`
          });
        }
      } catch (error) {
        console.error("Failed to load user profile", error);
      }
    };
    fetchProfile();

    // Mock realtime notifications fetch
    const fetchNotifs = () => {
       const mockNotifs = [
          { id: 1, text: "New bulk order pending approval", time: "2 min ago", read: false },
          { id: 2, text: "Stock alert: Acacia Honey low", time: "1 hr ago", read: false },
       ];
       setNotifications(mockNotifs);
    };
    fetchNotifs();
    const interval = setInterval(() => {
       if (Math.random() > 0.8) {
          setNotifications(prev => [{ id: Date.now(), text: "System sync complete", time: "Just now", read: false }, ...prev].slice(0, 5));
       }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: number) => {
     setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('name') as string;
    if (newName) {
       setProfile(prev => ({ 
           ...prev, 
           name: newName,
           avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`
       }));
       setShowProfile(false);
    }
  };

  return (
    <header className="h-[76px] bg-white flex items-center justify-between px-8 border-b border-gray-100 shrink-0 relative z-40">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder={title} className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <Clock size={16} /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        {/* Notifications */}
        <div className="relative cursor-pointer" onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}>
          <Bell size={20} className="text-gray-600 hover:text-amber-500 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-white">
              {unreadCount}
            </span>
          )}
        </div>

        {showNotifs && (
          <div className="absolute top-20 right-40 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              <span className="text-xs text-amber-500 cursor-pointer font-bold" onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}>Mark all read</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={(e) => { e.stopPropagation(); markRead(n.id); }} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!n.read ? 'bg-amber-50/30' : ''}`}>
                    <div className="mt-0.5"><CheckCircle size={16} className={n.read ? "text-green-500" : "text-amber-500"} /></div>
                    <div>
                      <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-800 font-bold'}`}>{n.text}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Profile */}
        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer relative" onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}>
          <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden shrink-0">
            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-gray-800">{profile.name}</p>
            <p className="text-xs text-gray-500">{profile.role}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>

        {/* Profile Edit Dropdown */}
        {showProfile && (
           <div className="absolute top-20 right-8 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-5">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><UserIcon size={16}/> Edit Profile</h3>
                 <X size={16} className="text-gray-400 hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setShowProfile(false); }} />
              </div>
              <form onSubmit={handleProfileUpdate} onClick={(e) => e.stopPropagation()} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                    <input name="name" defaultValue={profile.name} required className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                 </div>
                 <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-sm transition-colors">Save</button>
                    <button type="button" onClick={() => setShowProfile(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg text-sm transition-colors">Cancel</button>
                 </div>
              </form>
           </div>
        )}
      </div>
    </header>
  );
}
