import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  BellRing, 
  FileText, 
  Settings, 
  LogOut,
  Hexagon
} from 'lucide-react';

export default function AdminSidebar({ unwatchedAlerts = 0 }: { unwatchedAlerts?: number }) {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname.startsWith(path);
    return isActive
      ? "flex items-center gap-3 px-4 py-3 bg-amber-500 rounded-xl text-white font-medium shadow-lg shadow-[#4318FF]/20"
      : "flex items-center gap-3 px-4 py-3 text-[#8F9BBA] hover:text-white hover:bg-[#2C314A] rounded-xl font-medium transition-colors";
  };

  return (
    <aside className="w-[280px] bg-[#1E2336] text-white flex flex-col justify-between h-full shadow-xl">
      <div>
        {/* Logo */}
        <div className="h-20 px-4 flex items-center border-b border-[#2C314A]">
          <div className="w-16 h-16 flex items-center justify-center shrink-0 mr-3">
            <img src="/logo.png" alt="Drone Bee Logo" className="w-full h-full object-contain filter drop-shadow-xl scale-[1.3]" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-wide text-[#E8C265] leading-none whitespace-nowrap">Drone Bee.</span>
        </div>

        {/* Profile */}
        <div className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-[#1E2336] font-bold text-xl">
            S
          </div>
          <div>
            <h3 className="font-semibold text-white">System Owner</h3>
            <p className="text-[#8F9BBA] text-sm">@superadmin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-2 mt-4">
          <Link href="/admin/dashboard" className={getLinkClasses('/admin/dashboard')}>
            <LayoutDashboard size={20} />
            Dashboard Overview
          </Link>
          <Link href="/admin/managers" className={getLinkClasses('/admin/managers')}>
            <Users size={20} />
            Sales Agents
          </Link>
          <Link href="/admin/products" className={getLinkClasses('/admin/products')}>
            <Package size={20} />
            Products & Inventory
          </Link>
          <Link href="/admin/dashboard#alerts" className="flex items-center gap-3 px-4 py-3 text-[#8F9BBA] hover:text-white hover:bg-[#2C314A] rounded-xl font-medium transition-colors relative">
            <BellRing size={20} />
            System Alerts
            {unwatchedAlerts > 0 && (
              <span className="absolute right-4 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                {unwatchedAlerts}
              </span>
            )}
          </Link>
          <Link href="/admin/audits" className={getLinkClasses('/admin/audits')}>
            <FileText size={20} />
            Reports & Audits
          </Link>
          <Link href="/admin/reconciliations" className={getLinkClasses('/admin/reconciliations')}>
            <Settings size={20} />
            Reconciliations
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-6">
        <form action="/api/auth/logout" method="POST">
          <button className="w-full flex items-center justify-center gap-2 bg-[#ff3b3b]/10 hover:bg-[#ff3b3b]/20 text-[#ff3b3b] py-4 rounded-xl font-bold transition-colors border border-[#ff3b3b]/20">
            <LogOut size={20} />
            Logout Out Safely
          </button>
        </form>
      </div>
    </aside>
  );
}
