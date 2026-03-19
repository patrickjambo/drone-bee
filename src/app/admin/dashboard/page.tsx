
'use client';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  BellRing, 
  FileText, 
  Settings, 
  LogOut,
  Hexagon,
  Download,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalRevenue: 0, unitsSold: 0, activeManagers: 0, unreadAlertsCount: 0 });
  const [sales, setSales] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for quick agent
  const [agentName, setAgentName] = useState('');
  const [agentPass, setAgentPass] = useState('');

  // Form states for quick restock
  const [selectedProduct, setSelectedProduct] = useState('');
  
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, salesRes, alertsRes, productsRes] = await Promise.all([
        fetch('/api/admin/system'),
        fetch('/api/admin/sales'),
        fetch('/api/admin/alerts'),
        fetch('/api/admin/products')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (salesRes.ok) setSales(await salesRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!agentName) {
      alert("Please enter a username strictly.");
      return;
    }
    try {
      const res = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: agentName,
          password: agentPass || undefined, // Allow backend to generate or use this
          full_name: agentName,
          shift_start: '08:00',
          shift_end: '17:00'
        })
      });
      if (res.ok) {
        alert("Sales Agent Created Successfully!");
        setAgentName('');
        setAgentPass('');
        fetchAllData();
      } else {
        alert("Failed to create agent. Username might be taken.");
      }
    } catch (e) {
      alert("Error creating agent.");
    }
  };

  const handleRestockProduct = async () => {
    if (!selectedProduct) {
      alert("Please select a product first.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 100 })
      });
      if (res.ok) {
        alert("100 Stock added to product successfully!");
        fetchAllData();
      } else {
        alert("Failed to restock product.");
      }
    } catch (e) {
      alert("Error restocking product.");
    }
  };

  const handleDownloadReport = () => {
    // Generate simple CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time,Manager,Product,Qty,Total RWF\n";
    sales.forEach(row => {
      const time = new Date(row.created_at).toLocaleString();
      const manager = row.manager?.full_name || 'Unknown';
      const product = row.product?.name || 'Unknown';
      csvContent += `"${time}","${manager}","${product}",${row.quantity},${row.total_amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily-sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link); 
  };


  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  });

  const rawHoneyCount = products.filter(p => (p.honey_type || '').toLowerCase().includes('raw')).length;
  const accessoriesCount = products.filter(p => (p.honey_type || '').toLowerCase().includes('accessories') || (p.honey_type || '').toLowerCase().includes('drone')).length;
  const totalStockInStore = products.reduce((acc, p) => acc + p.stock_units, 0);

  return (
    <div className="h-full">
      {/* Sidebar */}
      

      {/* Main Content */}
      <div className="h-full w-full">
        
        <div className="h-full w-full">
        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard Overview</h1>
            <p className="text-gray-500 font-medium">{currentDate}</p>
          </div>
        </header>

        {/* Top Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Earnings Card */}
          <div className="bg-gradient-to-br from-[#1E2336] to-[#2B3674] rounded-[20px] p-6 shadow-sm relative overflow-hidden text-white">
            <div className="relative z-10">
              <p className="text-sm font-medium text-gray-500 mb-1">TODAY'S EARNINGS</p>
              <h2 className="text-3xl font-bold mb-6">RWF {stats.totalRevenue.toLocaleString()}</h2>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Sales: <span className="text-white font-medium">{stats.unitsSold}</span></p>
                <p className="text-sm text-gray-500">Avg Per Sale: <span className="text-white font-medium">RWF {stats.unitsSold > 0 ? Math.round(stats.totalRevenue / stats.unitsSold).toLocaleString() : 0}</span></p>
              </div>
            </div>
            {/* Abstract Background Graph */}
            <svg className="absolute bottom-0 right-0 w-full h-[60%] opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,100 C20,80 40,90 60,40 C80,-10 100,60 100,60 L100,100 Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Active Agents */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E9EDF7] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-10 h-10 rounded-full bg-[#E5ECF6] flex items-center justify-center">
                <Users className="text-amber-500 w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">ACTIVE AGENTS</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{stats.activeManagers}</h2>
            <div className="flex items-center text-sm font-medium text-[#01B574]">
              <span className="bg-[#01B574]/10 px-2 py-0.5 rounded-md mr-2 text-xs">+Active</span>
              <span className="text-gray-500">registered users</span>
            </div>
            {/* Simple Line Graphic */}
            <svg className="absolute bottom-4 right-4 w-24 h-12" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 L20,60 L40,70 L60,30 L80,50 L100,20" fill="none" stroke="#4318FF" strokeWidth="4" />
            </svg>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E9EDF7] relative">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-10 h-10 rounded-full bg-[#E5ECF6] flex items-center justify-center">
                <Package className="text-[#01B574] w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">TOTAL PRODUCTS</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{products.length}</h2>
            <div className="space-y-1">
              <p className="text-sm text-gray-500"><span className="text-gray-900 font-medium border-l-2 border-[#01B574] pl-2">{rawHoneyCount}</span> X Raw Honey</p>
              <p className="text-sm text-gray-500"><span className="text-gray-900 font-medium border-l-2 border-[#EE5D50] pl-2">{accessoriesCount}</span> X Accessories</p>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E9EDF7] relative">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-10 h-10 rounded-full bg-[#FFE2E5] flex items-center justify-center">
                <BellRing className="text-[#EE5D50] w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">UNRESOLVED ALERTS</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{stats.unreadAlertsCount}</h2>
            <div className="space-y-1">
              <p className="text-sm text-[#EE5D50] bg-[#EE5D50]/10 px-2 py-1 rounded inline-block mr-2 font-medium">{alerts.filter(a => a.severity === 'CRITICAL').length} critical</p>
              <p className="text-sm text-[#FFB547] bg-[#FFB547]/10 px-2 py-1 rounded inline-block font-medium">{alerts.filter(a => a.severity === 'WARNING').length} warnings</p>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Products Available */}
          <div className="bg-[#E9EDF7] rounded-[20px] p-8 flex items-center justify-between shadow-inner">
            <div>
              <p className="text-sm font-bold text-gray-500 tracking-wider mb-2">PRODUCTS AVAILABLE IN STORE</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-gray-900">{totalStockInStore}</span>
                <span className="text-xl font-bold text-gray-900">in stock</span>
              </div>
            </div>
            <div className="text-right space-y-2">
              {products.slice(0, 5).map(p => (
                 <p key={p.id} className="text-gray-900 font-medium"><span className="bg-white text-xs px-2 py-1 rounded shadow-sm mr-2">{p.stock_units}</span> {p.name}</p>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E9EDF7] flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-gray-900 w-full text-left mb-6">TODAY'S SALES</h3>
            <div className="text-center w-full">
               <span className="text-5xl font-black text-gray-900">{stats.unitsSold}</span>
               <p className="text-gray-500 font-medium mt-2 mb-4">transactions completed</p>
               {/* Chart placeholder */}
               <div className="w-full h-24 bg-[#F4F7FE] rounded-lg mt-4 flex items-end justify-between px-4 pb-2">
                 {[40, 20, 60, 30, 80, 50, 90, 45, 60, 30, 20, 50].map((h, i) => (
                   <div key={i} className="w-[6%] bg-amber-500 rounded-t-sm opacity-80" style={{ height: `${h}%` }}></div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Quick Report */}
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E9EDF7]">
               <h3 className="text-lg font-bold text-gray-900 mb-4">QUICK REPORT GENERATION</h3>
               <button onClick={handleDownloadReport} className="w-full bg-amber-500 hover:bg-[#3211b8] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#4318FF]/20">
                 <Download size={20} />
                 Download CSV Daily Report
               </button>
            </div>

            {/* Create Sales Agent */}
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E9EDF7]">
               <h3 className="text-lg font-bold text-gray-900 mb-6">CREATE SALES AGENT QUICK</h3>
               <div className="space-y-4">
                 <div>
                   <label className="text-sm font-medium text-gray-900 mb-2 block">Agent Username</label>
                   <input 
                     value={agentName}
                     onChange={e => setAgentName(e.target.value)}
                     className="w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#4318FF]"
                     placeholder="no spaces"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium text-gray-900 mb-2 block">Temporary Password (optional)</label>
                   <input 
                     type="password"
                     value={agentPass}
                     onChange={e => setAgentPass(e.target.value)}
                     className="w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#4318FF]"
                     placeholder="Auto-generated if empty"
                   />
                 </div>
                 <button onClick={handleCreateAgent} className="w-full bg-[#1E2336] hover:bg-[#111421] text-white py-4 rounded-xl font-bold transition-colors mt-2">
                   Create Agent
                 </button>
               </div>
            </div>
          </div>

          {/* Right Column: Add Product */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#E9EDF7] relative overflow-hidden">
             
             <h3 className="text-lg font-bold text-gray-900 mb-6">QUICK ADD PRODUCTS STOCK</h3>
             
             <div className="p-6 bg-white border border-[#E9EDF7] shadow-xl rounded-[20px] mb-8 relative z-10">
               <div className="space-y-4 mb-6">
                 <div>
                   <label className="text-sm font-medium text-gray-500 mb-2 block">Select Product to Restock</label>
                   <select 
                      value={selectedProduct} 
                      onChange={e => setSelectedProduct(e.target.value)}
                      className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-gray-900 font-medium appearance-none outline-none"
                   >
                     <option value="">Pick a product...</option>
                     {products.map(p => (
                       <option key={p.id} value={p.id}>{p.name} (Current: {p.stock_units})</option>
                     ))}
                   </select>
                 </div>
               </div>
               
               <button onClick={handleRestockProduct} className="w-full bg-[#FFCE20] hover:bg-[#e6b91c] text-[#1E2336] py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#FFCE20]/30">
                 <Plus size={20} />
                 Add +100 Stock to Selected
               </button>
             </div>

             <div className="mt-8 relative z-10">
               <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase">Recent Inventory List</h4>
               <div className="space-y-3 h-[200px] overflow-y-auto pr-2">
                 {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-[#F4F7FE] rounded-xl transition-colors bg-white border border-transparent hover:border-[#E9EDF7]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${p.stock_units < 10 ? 'bg-[#FFE2E5] text-[#EE5D50]' : 'bg-[#E5ECF6] text-amber-500'}`}>
                           {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{p.name}</p>
                          <p className={`text-sm ${p.stock_units < 10 ? 'text-[#EE5D50] font-bold' : 'text-gray-500'}`}>{p.stock_units} In Stock</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">RWF {p.price_per_unit.toLocaleString()}</span>
                    </div>
                 ))}
                 {products.length === 0 && <p className="text-gray-500 text-sm py-4">No products found.</p>}
               </div>
             </div>

             {/* Background Decoration */}
             <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-gradient-to-br from-[#4318FF]/5 to-transparent rounded-full blur-3xl z-0 pointer-events-none"></div>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}
