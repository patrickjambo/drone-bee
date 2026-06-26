'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Package, BellRing, FileText,
  Settings, LogOut, Store,
} from 'lucide-react';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/managers', label: 'Sales Agents', icon: Users },
  { href: '/admin/products', label: 'Products & Inventory', icon: Package },
  { href: '/admin/audits', label: 'Reports & Audits', icon: FileText },
  { href: '/admin/reconciliations', label: 'Reconciliations', icon: Settings },
];

export default function AdminSidebar({ unwatchedAlerts = 0 }: { unwatchedAlerts?: number }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState({ name: 'System Owner', role: 'Super Admin' });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.name) setProfile({ name: d.name, role: d.role || 'Super Admin' }); }).catch(() => {});
  }, []);

  const linkClasses = (active: boolean) =>
    active
      ? 'flex items-center gap-3 px-4 py-3 bg-amber-500 rounded-xl text-white font-semibold shadow-lg shadow-amber-500/25'
      : 'flex items-center gap-3 px-4 py-3 text-[#8F9BBA] hover:text-white hover:bg-[#2C314A] rounded-xl font-medium transition-colors';

  const initials = profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className="w-[280px] bg-[#1E2336] text-white flex flex-col justify-between h-full shadow-xl overflow-y-auto">
      <div>
        <div className="h-20 px-4 flex items-center border-b border-[#2C314A]">
          <div className="w-16 h-16 flex items-center justify-center shrink-0 mr-3">
            <img src="/logo.png" alt="Drone Bee" className="w-full h-full object-contain drop-shadow-xl scale-[1.3]" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold tracking-wide text-[#E8C265] leading-none whitespace-nowrap">Drone Bee</span>
        </div>

        {/* Profile */}
        <div className="m-4 p-4 rounded-2xl bg-[#262C40] flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-[#1E2336] font-black text-lg shrink-0">{initials}</div>
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate">{profile.name}</h3>
            <p className="text-amber-300/80 text-xs font-semibold">{profile.role}</p>
          </div>
        </div>

        <nav className="px-4 space-y-1.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={linkClasses(active)}>
                <Icon size={20} /> {label}
              </Link>
            );
          })}
          <Link href="/admin/dashboard#alerts" className="flex items-center gap-3 px-4 py-3 text-[#8F9BBA] hover:text-white hover:bg-[#2C314A] rounded-xl font-medium transition-colors relative">
            <BellRing size={20} /> System Alerts
            {unwatchedAlerts > 0 && (
              <span className="absolute right-4 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">{unwatchedAlerts}</span>
            )}
          </Link>
        </nav>

        {/* View storefront */}
        <div className="px-4 mt-4">
          <a href="/shop" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#E8C265] font-semibold transition">
            <Store size={20} /> View Storefront
          </a>
        </div>
      </div>

      <div className="p-4">
        <form action="/api/auth/logout" method="POST">
          <button className="w-full flex items-center justify-center gap-2 bg-[#ff3b3b]/10 hover:bg-[#ff3b3b]/20 text-[#ff3b3b] py-3.5 rounded-xl font-bold transition-colors border border-[#ff3b3b]/20">
            <LogOut size={18} /> Logout Safely
          </button>
        </form>
      </div>
    </aside>
  );
}
