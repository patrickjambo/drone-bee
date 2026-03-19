import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Clock, Package,
  Users, RefreshCcw, BarChart3, Settings, ArrowUpRight
} from 'lucide-react';

export default function ManagerSidebar() {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    return pathname === path
      ? "flex items-center gap-3 bg-[#FFC107] text-[#1E2336] px-4 py-3 rounded-xl font-semibold shadow-md"
      : "flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition";
  };

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

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/manager/dashboard" className={getLinkClasses('/manager/dashboard')}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/manager/dashboard" className={getLinkClasses('/manager/record')}>
            <ShoppingCart size={20} className={pathname === '/manager/dashboard' ? "text-[#1E2336]" : "text-amber-500"} />
            Record Sale
          </Link>
          <Link href="/manager/reconcile" className={getLinkClasses('/manager/reconcile')}>
            <Clock size={20} />
            Daily Reconcile
          </Link>
          <Link href="/manager/inventory" className={getLinkClasses('/manager/inventory')}>
            <Package size={20} />
            Inventory
          </Link>
          <Link href="/manager/customers" className={getLinkClasses('/manager/customers')}>
            <Users size={20} />
            Customers
          </Link>
          <Link href="/manager/sync" className={getLinkClasses('/manager/sync')}>
            <RefreshCcw size={20} />
            Sync Center
          </Link>
          <Link href="/manager/reports" className={getLinkClasses('/manager/reports')}>
            <BarChart3 size={20} />
            Reports
          </Link>
          <Link href="/manager/settings" className={getLinkClasses('/manager/settings')}>
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        {/* Today's Summary Chart Mock in Sidebar */}
        <div className="m-6 bg-[#262C40] rounded-2xl p-4">
          <p className="text-white font-bold text-sm mb-1">Today's Summary</p>
          <p className="text-green-400 text-xs font-semibold mb-4 flex items-center gap-1"><ArrowUpRight size={14}/> 12% vs Yesterday</p>
          <div className="h-16 flex items-end justify-between gap-1 opacity-80">
            {/* Fake chart bars */}
             {[4, 6, 3, 7, 5, 8, 10, 8].map((h, i) => (
                <div key={i} className="w-full bg-[#FFC107] rounded-sm transition-all duration-500 hover:bg-white" style={{ height: `${h * 10}%` }}></div>
             ))}
          </div>
        </div>
        
        <div className="p-6 pt-0">
          <form action="/api/auth/logout" method="POST">
             <button className="w-full py-3 bg-[#ff3b3b]/10 hover:bg-[#ff3b3b]/20 text-[#ff3b3b] font-bold rounded-xl transition-colors border border-[#ff3b3b]/20 text-sm">
                Logout
             </button>
          </form>
        </div>
    </aside>
  );
}
