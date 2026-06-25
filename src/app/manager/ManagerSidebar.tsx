'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, Clock, Package,
  Users, RefreshCcw, BarChart3, Settings, ArrowUpRight, LogOut
} from 'lucide-react';

const NAV = [
  { href: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manager/inventory', label: 'Inventory', icon: Package },
  { href: '/manager/reconcile', label: 'Daily Reconcile', icon: Clock },
  { href: '/manager/customers', label: 'Customers', icon: Users },
  { href: '/manager/reports', label: 'Reports', icon: BarChart3 },
  { href: '/manager/sync', label: 'Sync Center', icon: RefreshCcw },
  { href: '/manager/settings', label: 'Settings', icon: Settings },
];

export default function ManagerSidebar() {
  const pathname = usePathname();
  const [summary, setSummary] = useState<{ revenue: number; chart: number[] }>({ revenue: 0, chart: [0, 0, 0, 0, 0, 0, 0] });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/manager/dashboard');
        if (res.ok) {
          const data = await res.json();
          setSummary({ revenue: data.stats?.revenue || 0, chart: data.chartData || [0, 0, 0, 0, 0, 0, 0] });
        }
      } catch { /* ignore */ }
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const linkClasses = (active: boolean) =>
    active
      ? 'flex items-center gap-3 bg-[#FFC107] text-[#1E2336] px-4 py-3 rounded-xl font-semibold shadow-md'
      : 'flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition';

  return (
    <aside className="w-[280px] bg-[#1E2336] text-gray-300 flex flex-col h-full overflow-y-auto">
      <div className="h-20 px-4 flex items-center border-b border-[#2C314A]">
        <div className="w-16 h-16 flex items-center justify-center shrink-0 mr-3">
          <img src="/logo.png" alt="Drone Bee Logo" className="w-full h-full object-contain filter drop-shadow-xl scale-[1.3]" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-2xl font-bold tracking-wide text-[#E8C265] leading-none mb-1 whitespace-nowrap">Drone Bee</h1>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Smart Sales</p>
        </div>
      </div>

      {/* Prominent New Sale CTA */}
      <div className="px-4 mt-4">
        <Link href="/manager/dashboard"
          className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 px-4 py-3 rounded-xl font-bold transition">
          <ShoppingCart size={18} className="text-[#FFC107]" /> New Sale
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={linkClasses(active)}>
              <Icon size={20} className={active ? 'text-[#1E2336]' : ''} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Real today's summary */}
      <div className="m-4 bg-[#262C40] rounded-2xl p-4">
        <p className="text-white font-bold text-sm mb-1">Today&apos;s Revenue</p>
        <p className="text-[#FFC107] text-lg font-black mb-3">RWF {summary.revenue.toLocaleString()}</p>
        <div className="h-16 flex items-end justify-between gap-1 opacity-90">
          {(() => {
            const max = Math.max(...summary.chart, 1);
            return summary.chart.map((v, i) => (
              <div key={i} className="w-full bg-[#FFC107]/80 rounded-sm transition-all duration-500 hover:bg-white"
                style={{ height: `${Math.max((v / max) * 100, 4)}%` }} />
            ));
          })()}
        </div>
        <p className="text-green-400 text-[11px] font-semibold mt-3 flex items-center gap-1">
          <ArrowUpRight size={13} /> Live · updates every 15s
        </p>
      </div>

      <div className="p-4 pt-0">
        <form action="/api/auth/logout" method="POST">
          <button className="w-full py-3 bg-[#ff3b3b]/10 hover:bg-[#ff3b3b]/20 text-[#ff3b3b] font-bold rounded-xl transition-colors border border-[#ff3b3b]/20 text-sm flex items-center justify-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
