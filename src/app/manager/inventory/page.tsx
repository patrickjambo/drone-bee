'use client';

import { useState, useEffect } from 'react';
import { Plus, Package, Search } from 'lucide-react';


export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    honey_type: '',
    origin: '',
    batch_size: 10,
    price_per_batch: 0,
    price_per_unit: 0,
    stock_units: 0,
    min_stock_threshold: 5,
  });

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/manager/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (product: any) => {
    const qtyStr = prompt(`How many units of ${product.name} are you adding?`);
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Invalid quantity');
      return;
    }
    
    try {
      const res = await fetch(`/api/manager/products/${product.id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty })
      });
      if (res.ok) {
        alert('Stock updated successfully');
        fetchProducts();
      } else {
        const data = await res.json();
        alert('Failed: ' + data.error);
      }
    } catch (err) {
      alert('Error updating stock');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/manager/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchProducts();
        setFormData({
          name: '', honey_type: '', origin: '', batch_size: 10,
          price_per_batch: 0, price_per_unit: 0, stock_units: 0, min_stock_threshold: 5
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-full w-full">
      
      
      <main className="ml-[280px] flex-1 p-8 overflow-y-auto">
        

        {loading ? (
          <div className="flex justify-center p-12 text-[#A3AED0]">Loading inventory...</div>
        ) : (
          <div className="bg-white rounded-[20px] shadow-sm border border-[#E9EDF7] overflow-hidden">
            <div className="p-6 border-b border-[#E9EDF7] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2B3674]">Inventory List</h2>
              <div className="flex bg-[#F4F7FE] items-center px-4 py-2 rounded-xl">
                 <Search size={18} className="text-[#A3AED0] mr-2" />
                 <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-[#2B3674] text-sm" />
              </div>
            </div>
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7]">
                <tr>
                  <th className="py-4 px-6 text-[#A3AED0] font-bold text-sm tracking-wide">PRODUCT NAME</th>
                  <th className="py-4 px-6 text-[#A3AED0] font-bold text-sm tracking-wide">TYPE / ORIGIN</th>
                  <th className="py-4 px-6 text-[#A3AED0] font-bold text-sm tracking-wide">STOCK</th>
                  <th className="py-4 px-6 text-[#A3AED0] font-bold text-sm tracking-wide">PRICE (RWF)</th>
                  <th className="py-4 px-6 text-[#A3AED0] font-bold text-sm tracking-wide">STATUS</th>
                  <th className="py-4 px-6 text-[#A3AED0] font-bold text-sm tracking-wide text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 px-6 text-center text-[#A3AED0]">No products found in inventory.</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#E5ECF6] flex items-center justify-center text-[#4318FF]">
                             <Package size={20} />
                          </div>
                          <span className="font-bold text-[#2B3674]">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-[#2B3674]">{p.honey_type}</p>
                        <p className="text-sm text-[#A3AED0]">{p.origin || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-bold ${p.stock_units < p.min_stock_threshold ? 'text-[#EE5D50] bg-[#EE5D50]/10 px-3 py-1 rounded-lg' : 'text-[#01B574] bg-[#01B574]/10 px-3 py-1 rounded-lg'}`}>
                          {p.stock_units} Units
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#2B3674]">
                        {p.price_per_unit.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        {p.is_active ? 
                          <span className="text-[#01B574] font-medium text-sm">Active</span> : 
                          <span className="text-[#EE5D50] font-medium text-sm">Inactive</span>
                        }
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => handleRestock(p)}
                          className="bg-[#1E2336] hover:bg-[#111421] text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-[#1E2336]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 border-b border-[#E9EDF7] bg-[#F4F7FE]">
                <h3 className="text-xl font-bold text-[#2B3674]">Add New Honey Product</h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Product Name</label>
                    <input type="text" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-[#2B3674] focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Type (e.g. Raw)</label>
                    <input type="text" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-[#2B3674] focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.honey_type} onChange={(e) => setFormData({...formData, honey_type: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Origin</label>
                    <input type="text" className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-[#2B3674] focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Price / Unit (RWF)</label>
                    <input type="number" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-[#2B3674] focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.price_per_unit || ''} onChange={(e) => setFormData({...formData, price_per_unit: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Low Stock Alert Level</label>
                    <input type="number" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-[#2B3674] focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.min_stock_threshold || ''} onChange={(e) => setFormData({...formData, min_stock_threshold: Number(e.target.value)})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-[#2B3674] mb-2">Initial Stock Amount</label>
                    <input type="number" required className="w-full bg-[#F4F7FE] border-none rounded-xl px-4 py-3 text-[#2B3674] focus:outline-none focus:ring-2 focus:ring-[#4318FF]/50" value={formData.stock_units || ''} onChange={(e) => setFormData({...formData, stock_units: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-[#A3AED0] hover:bg-[#F4F7FE] transition-colors">Cancel</button>
                  <button type="submit" className="bg-[#4318FF] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#3211b8] transition-colors shadow-lg shadow-[#4318FF]/20">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}
            </main>
  </div>
  );
}
