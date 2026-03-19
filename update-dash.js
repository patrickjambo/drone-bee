const fs = require('fs');

let code = fs.readFileSync('src/app/manager/dashboard/page.tsx', 'utf8');

// Replace stats logic safely
const statsRegex = /const stats = \{[\s\S]*?\};/;
code = code.replace(statsRegex, "const [stats, setStats] = useState({ todaySales: 0, revenue: 0, inStock: 0, lowStockQty: 0, outOfStockQty: 0, offlineQueue: 0 });\n  const [recentTx, setRecentTx] = useState<any[]>([]);");

// Add fetchDashboardData to useEffect
const effectRegex = /useEffect\(\(\) => \{\s*fetchProducts\(\);\s*\}, \[\]\);/;
code = code.replace(
  effectRegex, 
  `useEffect(() => {
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
      }
    } catch (err) {
      console.error(err);
    }
  };`
);

// confirmSale refetching
code = code.replace(/fetchProducts\(\);\s*setTimeout\(/m, 'fetchProducts();\n      fetchDashboardData();\n      setTimeout(');

// Replace Recent Transactions
const recentTxStart = code.indexOf('{/* Dummy Transaction matching mockup */}');
let recentTxEnd = code.indexOf('{cart.length > 0', recentTxStart);
if (recentTxEnd !== -1) {
  const toReplace = code.substring(recentTxStart, recentTxEnd);
  const replacement = `{recentTx.length === 0 ? (
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
                     )}\n                     `;
  code = code.replace(toReplace, replacement);
}

code = code.replace(/<p className="font-black text-gray-900">RWF 10,000<\/p>/, `<p className="font-black text-gray-900">RWF {stats.revenue.toLocaleString()}</p>`);
code = code.replace(/<p className="font-black text-gray-900">1<\/p>/, `<p className="font-black text-gray-900">{stats.todaySales}</p>`);
code = code.replace(/<p className="font-black text-gray-900">RWF 10,000<\/p>/, `<p className="font-black text-gray-900">RWF {stats.todaySales > 0 ? Math.round(stats.revenue / stats.todaySales).toLocaleString() : 0}</p>`);

fs.writeFileSync('src/app/manager/dashboard/page.tsx', code);
console.log('done');
