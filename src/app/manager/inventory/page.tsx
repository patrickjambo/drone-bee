'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Package, Search, X, PackagePlus, AlertTriangle } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  honey_type: string;
  origin?: string | null;
  batch_size: number;
  price_per_batch: number;
  price_per_unit: number;
  stock_units: number;
  min_stock_threshold: number;
  is_active: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '', honey_type: '', origin: '', image_url: '', batch_size: 12,
    price_per_batch: 0, price_per_unit: 0, stock_units: 0, min_stock_threshold: 5,
  });

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/manager/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.honey_type || '').toLowerCase().includes(q) ||
      (p.origin || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/manager/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price_per_batch: formData.price_per_batch || formData.price_per_unit * formData.batch_size,
        }),
      });
      if (res.ok) {
        setShowAdd(false);
        setFormData({ name: '', honey_type: '', origin: '', image_url: '', batch_size: 12, price_per_batch: 0, price_per_unit: 0, stock_units: 0, min_stock_threshold: 5 });
        fetchProducts();
        showToast('success', 'Product added to inventory.');
      } else {
        const d = await res.json().catch(() => ({}));
        showToast('error', d.error || 'Failed to add product.');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Something went wrong.');
    }
  };

  const totalUnits = products.reduce((a, p) => a + p.stock_units, 0);
  const lowCount = products.filter(p => p.stock_units > 0 && p.stock_units <= p.min_stock_threshold).length;
  const outCount = products.filter(p => p.stock_units === 0).length;

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400';
  const field = (label: string, node: React.ReactNode) => (
    <div><label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>{node}</div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Package className="text-amber-500" size={26} /> Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Add honey products, track stock and restock low items.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatTile label="Products" value={products.length} tint="bg-blue-50 text-blue-600" />
        <StatTile label="Total Units" value={totalUnits.toLocaleString()} tint="bg-emerald-50 text-emerald-600" />
        <StatTile label="Low Stock" value={lowCount} tint="bg-amber-50 text-amber-600" />
        <StatTile label="Out of Stock" value={outCount} tint="bg-red-50 text-red-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Inventory List</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading inventory…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs tracking-wide uppercase">Product</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs tracking-wide uppercase">Type / Origin</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs tracking-wide uppercase">Stock</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs tracking-wide uppercase">Unit / Batch (RWF)</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs tracking-wide uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 px-5 text-center text-gray-400">No products found.</td></tr>
                ) : filtered.map(p => {
                  const low = p.stock_units <= p.min_stock_threshold;
                  const out = p.stock_units === 0;
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><Package size={18} /></div>
                          <span className="font-bold text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-medium text-gray-800">{p.honey_type}</p>
                        <p className="text-sm text-gray-400">{p.origin || '—'}</p>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`font-bold px-3 py-1 rounded-lg text-sm ${out ? 'text-red-600 bg-red-50' : low ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'}`}>
                          {p.stock_units} units
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-gray-900">{p.price_per_unit.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{p.price_per_batch.toLocaleString()} / batch of {p.batch_size}</p>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button onClick={() => setRestockTarget(p)}
                          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-sm transition inline-flex items-center gap-1.5">
                          <PackagePlus size={15} /> Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add product modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Package size={18} className="text-amber-500" /> Add New Product</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">{field('Product Name', <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="e.g. Acacia Raw Honey 500g" />)}</div>
              {field('Honey Type', <input required value={formData.honey_type} onChange={e => setFormData({ ...formData, honey_type: e.target.value })} className={inputCls} placeholder="e.g. Raw" />)}
              {field('Origin', <input value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} className={inputCls} placeholder="e.g. Nyungwe" />)}
              <div className="col-span-2">{field('Image URL (optional)', <input value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className={inputCls} placeholder="https://… product photo (shows in Shop)" />)}</div>
              {field('Price / Unit (RWF)', <input type="number" min="0" required value={formData.price_per_unit || ''} onChange={e => setFormData({ ...formData, price_per_unit: Number(e.target.value) })} className={inputCls} />)}
              {field('Units / Batch', <input type="number" min="1" required value={formData.batch_size || ''} onChange={e => setFormData({ ...formData, batch_size: Number(e.target.value) })} className={inputCls} />)}
              {field('Price / Batch (RWF)', <input type="number" min="0" value={formData.price_per_batch || ''} onChange={e => setFormData({ ...formData, price_per_batch: Number(e.target.value) })} className={inputCls} placeholder="auto" />)}
              {field('Low-stock Alert At', <input type="number" min="0" required value={formData.min_stock_threshold || ''} onChange={e => setFormData({ ...formData, min_stock_threshold: Number(e.target.value) })} className={inputCls} />)}
              <div className="col-span-2">{field('Initial Stock (units)', <input type="number" min="0" required value={formData.stock_units || ''} onChange={e => setFormData({ ...formData, stock_units: Number(e.target.value) })} className={inputCls} />)}</div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock modal */}
      {restockTarget && (
        <RestockModal product={restockTarget} onClose={() => setRestockTarget(null)}
          onDone={() => { setRestockTarget(null); fetchProducts(); showToast('success', 'Stock updated successfully.'); }}
          onError={(m) => showToast('error', m)} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-4 z-[60] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-bold text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <PackagePlus size={18} /> : <AlertTriangle size={18} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, tint }: { label: string; value: any; tint: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${tint}`}><Package size={16} /></div>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function RestockModal({ product, onClose, onDone, onError }: { product: Product; onClose: () => void; onDone: () => void; onError: (m: string) => void }) {
  const [qty, setQty] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || qty <= 0) { onError('Enter a quantity greater than zero.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/manager/products/${product.id}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Restock failed');
      }
      onDone();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><PackagePlus size={18} className="text-amber-500" /> Restock</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="font-bold text-gray-900">{product.name}</p>
            <p className="text-xs text-gray-500">Current stock: <span className="font-bold">{product.stock_units}</span> units</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Units to add</label>
            <input type="number" min="1" autoFocus value={qty || ''} onChange={e => setQty(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="0" />
            {qty > 0 && <p className="text-xs text-emerald-600 font-medium mt-1.5">New stock will be {(product.stock_units + qty).toLocaleString()} units</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-gray-900 font-bold">{saving ? 'Saving…' : 'Confirm'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
