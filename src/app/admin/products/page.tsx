'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
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
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
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
      const res = await fetch(`/api/admin/products/${product.id}/restock`, {
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
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-amber-600 text-white shadow-md rounded-b-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Honey Product Management</h1>
          <Link href="/admin/dashboard" className="text-amber-100 font-medium hover:text-white transition">
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium shadow transition"
          >
            + Add New Product
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading products...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y border-gray-200">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type / Origin</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Units</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (RWF)</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No products found.</td></tr>
                ) : (
                  products.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{p.honey_type} <br/><span className="text-xs text-gray-400">{p.origin}</span></td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${p.stock_units < p.min_stock_threshold ? 'text-red-600' : 'text-green-600'}`}>
                          {p.stock_units}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono">{p.price_per_unit.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {p.is_active ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">Active</span> : <span className="text-red-500 bg-red-50 px-2 py-1 rounded text-xs">Inactive</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleRestock(p)}
                          className="text-amber-600 hover:text-amber-900 font-medium text-sm border border-amber-200 px-3 py-1 rounded bg-amber-50"
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

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Add New Honey Product</h3>
              <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Product Name</label>
                    <input type="text" required className="w-full border rounded p-2 focus:ring-amber-500 focus:border-amber-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Honey Type</label>
                    <input type="text" placeholder="e.g. Raw, Infused" required className="w-full border rounded p-2" value={formData.honey_type} onChange={(e) => setFormData({...formData, honey_type: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Origin (Optional)</label>
                    <input type="text" placeholder="e.g. Nyungwe Forest" className="w-full border rounded p-2" value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price per Jar/Unit (RWF)</label>
                    <input type="number" required className="w-full border rounded p-2" value={formData.price_per_unit || ''} onChange={(e) => setFormData({...formData, price_per_unit: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price per Batch (RWF)</label>
                    <input type="number" required className="w-full border rounded p-2" value={formData.price_per_batch || ''} onChange={(e) => setFormData({...formData, price_per_batch: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Batch Size (Jars per Box)</label>
                    <input type="number" required className="w-full border rounded p-2" value={formData.batch_size || ''} onChange={(e) => setFormData({...formData, batch_size: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Minimum Stock Alert Threshold</label>
                    <input type="number" required className="w-full border rounded p-2" value={formData.min_stock_threshold || ''} onChange={(e) => setFormData({...formData, min_stock_threshold: Number(e.target.value)})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Initial Stock (Individual Units)</label>
                    <input type="number" required className="w-full border rounded p-2" value={formData.stock_units || ''} onChange={(e) => setFormData({...formData, stock_units: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-medium rounded hover:bg-amber-700">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
