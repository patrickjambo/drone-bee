'use client';
import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Search, Bell, ChevronDown, Calendar, Download, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

export interface TopProduct {
  name: string;
  type: string;
  sales: number;
  rev: number;
  pct: number;
}

export interface RawSale {
  created_at: string;
  product: { name: string };
  quantity: number;
  unit_price_at_sale: number;
  total_amount: number;
}

export interface StatsList {
  totalRevenue: number;
  netProfit: number;
  itemsSold: number;
  avgTransaction: number;
  topProducts: TopProduct[];
  trend: number[];
  rawSales: RawSale[];
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('This Week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsList>({
    totalRevenue: 0,
    netProfit: 0,
    itemsSold: 0,
    avgTransaction: 0,
    topProducts: [],
    trend: [0,0,0,0,0,0,0],
    rawSales: []
  });

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/manager/reports?range=${encodeURIComponent(dateRange)}`);
      const data = await res.json();
      if (!data.error) {
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchReports();
    // Refresh strictly every 10s
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const handleExportCSV = () => {
    if (!stats.rawSales || stats.rawSales.length === 0) {
      alert("No sales data available to export in this range.");
      return;
    }
    
    // Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Product,Quantity,Unit Price,Total Amount\\n";
    
    // Rows
    stats.rawSales.forEach(s => {
       const date = new Date(s.created_at).toLocaleString();
       const product = s.product?.name || "Unknown Product";
       const row = `"${date}","${product}",${s.quantity},${s.unit_price_at_sale},${s.total_amount}`;
       csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `drone_bee_report_${dateRange.replace(' ','_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full w-full">
      
      <div className="h-full w-full">
        

        <div className="h-full w-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3"><BarChart3 className="text-amber-500" size={28} /> Analytics & Reports</h1>
              <p className="text-gray-500 mt-1 text-sm">Generate advanced performance metrics, custom date ranges, and CSV exports.</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
              <button onClick={handleExportCSV} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer">
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md"><TrendingUp size={12} className="mr-1"/> +14.5%</span>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Gross Revenue</p>
              <h3 className="text-2xl font-black text-gray-900">RWF {stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Target size={24} />
                </div>
                <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-md"><TrendingUp size={12} className="mr-1"/> +5.2%</span>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Estimated Net Profit</p>
              <h3 className="text-2xl font-black text-gray-900">RWF {(stats.netProfit || 0).toLocaleString()}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 size={24} />
                </div>
                <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">- 0.0%</span>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Items Sold</p>
              <h3 className="text-2xl font-black text-gray-900">{stats.itemsSold} Units</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <Target size={24} />
                </div>
                <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">- 0.0%</span>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">Avg. Transaction Value</p>
              <h3 className="text-2xl font-black text-gray-900">RWF {Number(stats.avgTransaction).toLocaleString()}</h3>
            </div>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-amber-500"/> Revenue Trend ({dateRange})</h3>
                <div className="flex items-end justify-between h-64 gap-2 pt-4">
                   {stats.trend.map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer" title={`Value: ${h.toFixed(0)}%`}>
                         <div className="w-full bg-blue-50 rounded-t-lg relative flex items-end justify-center transition-all group-hover:bg-blue-100" style={{ height: '100%' }}>
                            <div className="w-full bg-blue-500 rounded-t-sm transition-all duration-500" style={{ height: `${Math.max(h, 2)}%` }}></div>
                         </div>
                         <span className="text-xs text-gray-400 font-medium">
                           {dateRange === 'Today' || dateRange === 'Yesterday' ? `${i*4}h` : 'M T W T F S S'.split(' ')[i]}
                         </span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-amber-500"/> Top Performing Products</h3>
                <div className="space-y-5">
                   {stats.topProducts && stats.topProducts.length > 0 ? stats.topProducts.map((item, idx) => (
                     <div key={idx}>
                       <div className="flex justify-between items-center mb-2">
                         <div>
                            <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.type} • {item.sales} sold</p>
                         </div>
                         <p className="font-black text-gray-900 text-sm">RWF {item.rev.toLocaleString()}</p>
                       </div>
                       <div className="w-full bg-gray-100 rounded-full h-2">
                         <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${item.pct}%` }}></div>
                       </div>
                     </div>
                   )) : (
                     <div className="h-48 flex items-center justify-center text-gray-400">
                       No products sold in this period.
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
