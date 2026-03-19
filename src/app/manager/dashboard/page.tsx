'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingCart, Clock, Package,
  Users, RefreshCcw, BarChart3, Settings, 
  Search, Bell, Plus, Printer, Wallet, 
  Banknote, Smartphone, CreditCard, ChevronDown,
  MoreHorizontal, Activity, ArrowUpRight
} from 'lucide-react';

export default function ManagerDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sumTotal, setSumTotal] = useState(0);
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [customerType, setCustomerType] = useState('Walk-in');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  
  
  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      alert("Cart is empty! Nothing to print.");
      return;
    }
    window.print();
  };

  const handleNewSale = () => {
    setCart([]);
    setCustomerType('Walk-in');
    setPaymentMethod('Cash');
    setCheckoutStatus('');
    document.getElementById('record-sale')?.scrollIntoView({ behavior: 'smooth' });
  };

  const [stats, setStats] = useState({ todaySales: 0, revenue: 0, inStock: 0, lowStockQty: 0, outOfStockQty: 0, offlineQueue: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([0,0,0,0,0,0,0]);

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/manager/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentTx(data.recentTransactions);
        if(data.chartData) setChartData(data.chartData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const freshTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setSumTotal(freshTotal);
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
         if(res.status === 401 || res.status === 403) router.push('/manager/login');
         return;
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if(!product) return;
    
    const price = product.price_per_unit;
    if (product.stock_units < 1) {
      alert(`Not enough stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(p => p.productId === product.id);
      if (existing) {
         if(product.stock_units < existing.quantity + 1) {
            alert('Maximum stock capacity reached.');
            return prev;
         }
         return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      } else {
         return [...prev, { productId: product.id, name: product.name, saleType: 'UNIT', price, quantity: 1 }];
      }
    });
  };

  const confirmSale = async () => {
    if (cart.length === 0) return;
    setCheckoutStatus('Processing...');
    
    try {
      const payload = cart.map(item => ({
         productId: item.productId,
         saleType: item.saleType,
         quantity: item.quantity
      }));

      const res = await fetch('/api/manager/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCheckoutStatus(`Success!`);
      setCart([]);
      fetchProducts();
      fetchDashboardData();
      setTimeout(() => setCheckoutStatus(''), 3000);
    } catch (err: any) {
      setCheckoutStatus(`Failed: ${err.message}`);
      setTimeout(() => setCheckoutStatus(''), 5000);
    }
  };

  return (
  <div className="h-full w-full">
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        aside { display: none !important; }
        header { display: none !important; }
        .overflow-y-auto { overflow: visible !important; }
        .hide-on-print { display: none !important; }
        body { background: white !
important; }
      }
    ` }} />
<main className="flex-1 flex flex-col overflow-hidden">
        

        <div className="flex-1 overflow-y-auto p-8 layout-content">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard Overview</h2>
              <p className="text-gray-500 text-sm">Welcome back, Jambo! Here's your today's sales summary.</p>
            </div>
            <div className="flex gap-3 hide-on-print">
              <button onClick={() => router.push('/manager/inventory')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
                 <Plus size={16} /> Add Product
              </button>
              <button onClick={handlePrintReceipt} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
                 <Printer size={16} /> Print Receipt
              </button>
              <button onClick={handleNewSale} className="flex items-center gap-2 px-5 py-2 bg-[#FFC107] hover:bg-[#F2B705] text-gray-900 rounded-lg text-sm font-bold shadow-md transition">
                 <Plus size={18} /> New Sale
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShoppingCart size={20} /></div>
                   <h3 className="font-bold text-gray-800 text-sm">Today's Sales</h3>
                 </div>
                 <MoreHorizontal size={20} className="text-gray-400" />
               </div>
               <div className="flex items-end gap-3">
                 <span className="text-3xl font-black text-gray-900">{stats.todaySales}</span>
                 <span className="text-sm text-gray-500 mb-1">Transactions</span>
                 <div className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center"><ArrowUpRight size={12} className="mr-1"/> 100%</div>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Banknote size={20} /></div>
                   <h3 className="font-bold text-gray-800 text-sm">Total Revenue</h3>
                 </div>
                 <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-medium">1day</span>
               </div>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-gray-900">RWF {stats.revenue.toLocaleString()}</span>
               </div>
               <div className="h-1 bg-green-500 w-1/3 mt-4 rounded-full"></div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Package size={20} /></div>
                   <h3 className="font-bold text-gray-800 text-sm">Products In Stock</h3>
                 </div>
               </div>
               <div className="flex items-end gap-4">
                 <span className="text-3xl font-black text-gray-900">{stats.inStock}</span>
                 <span className="text-sm text-gray-500 mb-1">Low Stock: <span className="text-red-500 font-bold">{stats.lowStockQty}</span></span>
               </div>
               <Package size={80} className="absolute -bottom-4 -right-4 text-amber-100 opacity-50" />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><RefreshCcw size={20} /></div>
                   <h3 className="font-bold text-gray-800 text-sm">Offline Queue</h3>
                 </div>
                 <MoreHorizontal size={20} className="text-gray-400" />
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-end gap-3">
                   <span className="text-3xl font-black text-gray-900">{stats.offlineQueue}</span>
                   <span className="text-sm text-green-500 font-medium mb-1 flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> Synced</span>
                 </div>
                 <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><Activity size={20} /></div>
               </div>
            </div>
          </div>

          <div id="record-sale" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-24">
             <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><CreditCard className="text-amber-500" /> Record New Sale</h3>
                    <MoreHorizontal className="text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-5 gap-6 hide-on-print">
                    <div className="col-span-3 space-y-5">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-600 w-32">Customer Type</span>
                        <div className="flex gap-2">
                           <button onClick={() => setCustomerType('Walk-in')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border transition-colors ${customerType === 'Walk-in' ? 'bg-[#FFF8E1] text-[#FFA000] border-[#FFE082]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Users size={16} /> Walk-in</button>
                           <button onClick={() => setCustomerType('Registered')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border transition-colors ${customerType === 'Registered' ? 'bg-[#FFF8E1] text-[#FFA000] border-[#FFE082]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Users size={16} /> Registered</button>
                           <button onClick={() => setCustomerType('New')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border transition-colors ${customerType === 'New' ? 'bg-[#FFF8E1] text-[#FFA000] border-[#FFE082]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>+ New Customer</button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-600 w-32">Select Product</span>
                        <div className="flex-1 relative">
                          <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:border-amber-500" onChange={(e) => addToCart(e.target.value)} value="">
                             <option value="" disabled>Choose Product ~</option>
                             {products.map(p => (
                               <option key={p.id} value={p.id}>{p.name} - RWF {p.price_per_unit}</option>
                             ))}
                          </select>
                          <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-600 w-32">Payment Method</span>
                        <div className="flex gap-2">
                           <button onClick={() => setPaymentMethod('Cash')} className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 border transition-colors ${paymentMethod === 'Cash' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Wallet size={16} /> Cash</button>
                           <button onClick={() => setPaymentMethod('Mobile Money')} className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 border transition-colors ${paymentMethod === 'Mobile Money' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Smartphone size={16} /> Mobile Money</button>
                           <button onClick={() => setPaymentMethod('Card')} className={`px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 border transition-colors ${paymentMethod === 'Card' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><CreditCard size={16} /> Card</button>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col justify-between">
                       <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col items-center justify-center text-center flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">Amount</p>
                          <p className="text-3xl font-black text-gray-900"><span className="text-xl">RWF</span> {sumTotal.toLocaleString()}</p>
                          {cart.map((c, i) => (
                            <div key={i} className="text-xs text-gray-500 mt-2">{c.name} x {c.quantity} <button onClick={()=>setCart([])} className="text-red-500 ml-2">Clear</button></div>
                          ))}
                       </div>
                       <button onClick={confirmSale} disabled={cart.length === 0 || checkoutStatus !== ''} className="w-full mt-4 bg-[#0d6efd] disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition">
                         {checkoutStatus || "Confirm Sale"}
                       </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex gap-6">
                   <div className="w-2/3 border-r border-gray-100 pr-6 relative">
                      <div className="flex items-center gap-2 mb-6">
                         <BarChart3 className="text-amber-500" />
                         <h3 className="text-lg font-bold text-gray-900">Sales Analytics Today</h3>
                      </div>
                      <p className="text-xs font-bold text-gray-500 mb-4">Sales Over Time</p>
                      <div className="relative h-40 w-full flex items-end">
                         
{/* Dynamic Chart SVG */}
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
  {(() => {
    // chartData has 7 points mapped to 8AM..8PM
    // To match 0-100 x-axis, points are at x: 0, 16.6, 33.3, 50, 66.6, 83.3, 100.
    // SVG y-axis is inverted (100 is bottom). Our data is 0-100 where 100 is max.
    // So y = 100 - (val * 0.9) to keep it off the very top edge.
    const pts = chartData.map((val, i) => ({
      x: (i / 6) * 100,
      y: 95 - (val * 0.8) // max height is 15 (95-80) to 95 for 0
    }));
    
    if (pts.length === 0) return null;
    
    const pathD = `M${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ');
    const polygonD = pathD + ` L100,100 L0,100 Z`;
    
    return (
  <>
    <path d={polygonD} fill="rgba(66, 133, 244, 0.1)" stroke="none" />
    <path d={pathD} fill="none" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2" fill="#4285F4" />)}
  </>
    )
  })()}

</svg>

                      </div>
                      <div className="flex justify-between w-full text-[10px] text-gray-500 mt-2 font-medium"><span>8AM</span><span>10AM</span><span>12PM</span><span>2PM</span><span>4PM</span><span>6PM</span><span>8PM</span></div>
                   </div>
                   
                   <div className="w-1/3 flex flex-col justify-center space-y-6 pl-2">
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-green-50 rounded-lg text-green-600"><Banknote size={20} /></div>
                           <div>
                            <p className="text-xs text-gray-500 font-medium">Total Sales</p>
                            <p className="font-black text-gray-900">RWF {stats.revenue.toLocaleString()}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><ShoppingCart size={20} /></div>
                           <div>
                            <p className="text-xs text-gray-500 font-medium">Transactions</p>
                            <p className="font-black text-gray-900">{stats.todaySales}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-4">
                           <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><BarChart3 size={20} /></div>
                           <div>
                            <p className="text-xs text-gray-500 font-medium">Avg. Sale</p>
                            <p className="font-black text-gray-900">RWF {stats.todaySales > 0 ? Math.round(stats.revenue / stats.todaySales).toLocaleString() : 0}</p>
                           </div>
                       </div>
                   </div>
                </div>

             </div>

             <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-900 flex items-center gap-2">Stock Alerts</h3>
                     <MoreHorizontal className="text-gray-400" />
                   </div>
                   <div className="space-y-5">
                      <div className="flex justify-between items-center bg-amber-50/50 p-3 flex-wrap rounded-xl border border-amber-100/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Package size={16}/></div>
                           <div>
                             <p className="text-sm font-bold text-gray-800">Low Stock</p>
                             <p className="text-xs text-amber-600 font-bold">{stats.lowStockQty} items</p>
                           </div>
                        </div>
                        <span className="text-xl font-bold text-amber-500 border-b-2 border-amber-500 px-1">{stats.lowStockQty}</span>
                      </div>
                      <div className="flex justify-between items-center bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-red-100 text-red-600 rounded-lg"><Package size={16}/></div>
                           <div>
                             <p className="text-sm font-bold text-gray-800">Out of Stock</p>
                             <p className="text-xs text-red-600 font-bold">{stats.outOfStockQty} items</p>
                           </div>
                        </div>
                        <span className="text-xl font-bold text-red-500 border-b-2 border-red-500 px-1">{stats.outOfStockQty}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl border border-blue-100/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={16}/></div>
                           <div>
                             <p className="text-sm font-bold text-gray-800">Total Products</p>
                             <p className="text-xs text-green-600 font-bold">{products.length} item</p>
                           </div>
                        </div>
                        <span className="text-xl font-bold text-blue-500 border-b-2 border-blue-500 px-1">{products.length}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[350px]">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={16} /> Recent Transactions</h3>
                     <MoreHorizontal className="text-gray-400" />
                   </div>
                   <div className="space-y-4">
                     {recentTx.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No recent transactions.</p>
                     ) : (
                        recentTx.map((tx: any) => (
                           <div key={tx.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-2">
                             <div className="flex justify-between items-start mb-2 border-b border-gray-200 pb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-md flex items-center justify-center">
                                     <Package size={12}/>
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-gray-900 text-left">#SALE-{tx.id.substring(tx.id.length - 4).toUpperCase()}</p>
                                    <p className="text-[10px] text-gray-500 leading-none text-left">{tx.productName} ({tx.quantity} {tx.saleType})</p>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             <div className="flex justify-between items-center pt-1">
                                <div className="flex gap-2"></div>
                                <div className="text-right">
                                   <p className="font-black text-green-600 text-sm">RWF {tx.totalAmount.toLocaleString()}</p>
                                   <p className="text-[10px] font-bold text-gray-500 flex items-center justify-end gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Confirmed</p>
                                </div>
                             </div>
                           </div>
                        ))
                     )}
                     {cart.length > 0 && <p className="text-xs text-center text-amber-600 mt-4 animate-pulse">Sale in progress...</p>}
                   </div>
                </div>

             </div>
</div></div></main></div>
  );
}
