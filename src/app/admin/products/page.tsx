'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Package, Search, X, PackagePlus, AlertTriangle, ExternalLink, Pencil, EyeOff } from 'lucide-react';
import ImageUploadField from '@/components/ImageUploadField';

type Product = {
  id: string;
  name: string;
  honey_type: string;
  origin?: string | null;
  image_url?: string | null;
  batch_size: number;
  price_per_batch: number;
  price_per_unit: number;
  stock_units: number;
  min_stock_threshold: number;
  is_active: boolean;
};

// Common suggestions to speed up data entry (merged with existing values).
const COMMON_TYPES = ['Raw', 'Acacia', 'Wildflower', 'Multiflora', 'Forest', 'Eucalyptus', 'Organic', 'Comb', 'Creamed', 'Mountain'];
const COMMON_ORIGINS = ['Nyungwe', 'Musanze', 'Huye', 'Nyamagabe', 'Rwamagana', 'Gicumbi', 'Rubavu', 'Nyabihu', 'Gakenke', 'Kayonza'];
const COMMON_NAMES = ['Raw Honey 500g', 'Raw Honey 1kg', 'Acacia Honey 500g', 'Wildflower Honey 250g', 'Forest Honey Comb', 'Family Honey Can 2L', 'Squeeze Bottle 750ml'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalProduct, setModalProduct] = useState<Product | 'new' | null>(null);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const showToast = (type: 'success' | 'error', msg: string) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const typeOptions = useMemo(() => Array.from(new Set([...products.map(p => p.honey_type), ...COMMON_TYPES].filter(Boolean))), [products]);
  const originOptions = useMemo(() => Array.from(new Set([...products.map(p => p.origin || ''), ...COMMON_ORIGINS].filter(Boolean))), [products]);
  const nameOptions = useMemo(() => Array.from(new Set([...products.map(p => p.name), ...COMMON_NAMES].filter(Boolean))), [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => p.name.toLowerCase().includes(q) || (p.honey_type || '').toLowerCase().includes(q) || (p.origin || '').toLowerCase().includes(q));
  }, [products, search]);

  const totalUnits = products.reduce((a, p) => a + p.stock_units, 0);
  const lowCount = products.filter(p => p.stock_units > 0 && p.stock_units <= p.min_stock_threshold).length;
  const outCount = products.filter(p => p.stock_units === 0).length;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2.5"><Package className="text-amber-500" size={28} /> Products & Inventory</h1>
          <p className="text-gray-500 mt-1">Add or edit products with photos — they appear instantly in the Shop Hub & Home page.</p>
        </div>
        <button onClick={() => setModalProduct('new')} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition">
          <Plus size={20} /> Add New Product
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Products" value={products.length} tint="bg-blue-50 text-blue-600" />
        <StatTile label="Total Units" value={totalUnits.toLocaleString()} tint="bg-emerald-50 text-emerald-600" />
        <StatTile label="Low Stock" value={lowCount} tint="bg-amber-50 text-amber-600" />
        <StatTile label="Out of Stock" value={outCount} tint="bg-red-50 text-red-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7] overflow-hidden">
        <div className="p-5 border-b border-[#E9EDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Inventory List</h2>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-10 pr-4 py-2.5 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading inventory…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-[#F4F7FE] border-b border-[#E9EDF7]">
                <tr>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Product</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Type / Origin</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Stock</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide">Unit / Batch (RWF)</th>
                  <th className="py-3.5 px-5 text-gray-400 font-bold text-xs uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 px-5 text-center text-gray-400">No products found.</td></tr>
                ) : filtered.map(p => {
                  const low = p.stock_units <= p.min_stock_threshold; const out = p.stock_units === 0;
                  return (
                    <tr key={p.id} className={`border-b border-[#E9EDF7] hover:bg-[#F4F7FE]/60 transition-colors ${!p.is_active ? 'opacity-60' : ''}`}>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                            {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" className="w-full h-full object-cover" /> : <Package size={20} />}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{p.name}</span>
                            {!p.is_active && <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1"><EyeOff size={11} /> Hidden from shop</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5"><p className="font-medium text-gray-800">{p.honey_type}</p><p className="text-sm text-gray-400">{p.origin || '—'}</p></td>
                      <td className="py-4 px-5"><span className={`font-bold px-3 py-1 rounded-lg text-sm ${out ? 'text-red-600 bg-red-50' : low ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'}`}>{p.stock_units} units</span></td>
                      <td className="py-4 px-5"><p className="font-bold text-gray-900">{p.price_per_unit.toLocaleString()}</p><p className="text-xs text-gray-400">{p.price_per_batch.toLocaleString()} / batch of {p.batch_size}</p></td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setModalProduct(p)} title="Edit" className="bg-[#F4F7FE] hover:bg-[#E9EDF7] text-gray-700 px-3 py-2 rounded-lg font-bold text-sm transition inline-flex items-center gap-1.5"><Pencil size={15} /> Edit</button>
                          <button onClick={() => setRestockTarget(p)} title="Restock" className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-lg font-bold text-sm transition inline-flex items-center gap-1.5"><PackagePlus size={15} /> Restock</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct === 'new' ? null : modalProduct}
          typeOptions={typeOptions} originOptions={originOptions} nameOptions={nameOptions}
          onClose={() => setModalProduct(null)}
          onSaved={(edited) => { setModalProduct(null); fetchProducts(); showToast('success', edited ? 'Product updated.' : 'Product added — it now shows in Shop & Home.'); }}
          onError={(m) => showToast('error', m)}
        />
      )}

      {restockTarget && (
        <RestockModal product={restockTarget} onClose={() => setRestockTarget(null)}
          onDone={() => { setRestockTarget(null); fetchProducts(); showToast('success', 'Stock updated successfully.'); }}
          onError={(m) => showToast('error', m)} />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-4 z-[60] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-bold text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <PackagePlus size={18} /> : <AlertTriangle size={18} />}{toast.msg}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, tint }: { label: string; value: any; tint: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-[#E9EDF7]">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${tint}`}><Package size={16} /></div>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

const inputCls = 'w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400';

function ProductModal({ product, typeOptions, originOptions, nameOptions, onClose, onSaved, onError }: {
  product: Product | null;
  typeOptions: string[]; originOptions: string[]; nameOptions: string[];
  onClose: () => void; onSaved: (edited: boolean) => void; onError: (m: string) => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '', honey_type: product?.honey_type || '', origin: product?.origin || '',
    image_url: product?.image_url || '', batch_size: product?.batch_size ?? 12,
    price_per_batch: product?.price_per_batch ?? 0, price_per_unit: product?.price_per_unit ?? 0,
    stock_units: product?.stock_units ?? 0, min_stock_threshold: product?.min_stock_threshold ?? 5,
    is_active: product?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isEdit && product) {
      fetch(`/api/admin/products/${product.id}`).then(r => r.ok ? r.json() : []).then(d => { if (Array.isArray(d)) setHistory(d); }).catch(() => {});
    }
  }, [isEdit, product]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price_per_batch: form.price_per_batch || form.price_per_unit * form.batch_size };
      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : '/api/admin/products', {
        method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Save failed'); }
      onSaved(isEdit);
    } catch (err: any) { onError(err.message); } finally { setSaving(false); }
  };

  const field = (label: string, node: React.ReactNode) => (<div><label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>{node}</div>);

  return (
    <div className="fixed inset-0 z-50 bg-[#1E2336]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E9EDF7] sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {isEdit ? <Pencil size={18} className="text-amber-500" /> : <Package size={18} className="text-amber-500" />}
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        {/* shared datalists */}
        <datalist id="dl-names">{nameOptions.map(o => <option key={o} value={o} />)}</datalist>
        <datalist id="dl-types">{typeOptions.map(o => <option key={o} value={o} />)}</datalist>
        <datalist id="dl-origins">{originOptions.map(o => <option key={o} value={o} />)}</datalist>

        <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Product Photo</label>
            <ImageUploadField value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
            <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1"><ExternalLink size={11} /> Shows in Shop Hub & Home hero</p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4 content-start">
            <div className="col-span-2">{field('Product Name', <input list="dl-names" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Start typing… e.g. Acacia Honey 500g" />)}</div>
            {field('Honey Type', <input list="dl-types" required value={form.honey_type} onChange={e => setForm({ ...form, honey_type: e.target.value })} className={inputCls} placeholder="e.g. Raw" />)}
            {field('Origin', <input list="dl-origins" value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} className={inputCls} placeholder="e.g. Nyungwe" />)}
            {field('Price / Unit (RWF)', <input type="number" min="0" required value={form.price_per_unit || ''} onChange={e => setForm({ ...form, price_per_unit: Number(e.target.value) })} className={inputCls} />)}
            {field('Units / Batch', <input type="number" min="1" required value={form.batch_size || ''} onChange={e => setForm({ ...form, batch_size: Number(e.target.value) })} className={inputCls} />)}
            {field('Price / Batch (RWF)', <input type="number" min="0" value={form.price_per_batch || ''} onChange={e => setForm({ ...form, price_per_batch: Number(e.target.value) })} className={inputCls} placeholder="auto" />)}
            {field('Low-stock Alert At', <input type="number" min="0" required value={form.min_stock_threshold || ''} onChange={e => setForm({ ...form, min_stock_threshold: Number(e.target.value) })} className={inputCls} />)}
            {!isEdit
              ? <div className="col-span-2">{field('Initial Stock (units)', <input type="number" min="0" required value={form.stock_units || ''} onChange={e => setForm({ ...form, stock_units: Number(e.target.value) })} className={inputCls} />)}</div>
              : (
                <label className="col-span-2 flex items-center gap-3 bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3.5 py-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-amber-500" />
                  <span className="text-sm font-bold text-gray-700">Active — visible in Shop & Home</span>
                  <span className="ml-auto text-xs text-gray-400">Stock: {product!.stock_units} (use Restock to change)</span>
                </label>
              )}
          </div>

          {isEdit && history.length > 0 && (
            <div className="md:col-span-3 border-t border-[#E9EDF7] pt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price history</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between text-xs bg-[#F4F7FE] rounded-lg px-3 py-2">
                    <span className="text-gray-500">{new Date(h.changed_at).toLocaleDateString()} · {h.changed_by?.full_name || 'Admin'}</span>
                    <span className="font-bold text-gray-800">RWF {Number(h.old_unit_price ?? 0).toLocaleString()} → {Number(h.new_unit_price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="md:col-span-3 flex gap-3 pt-2 border-t border-[#E9EDF7]">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-white font-bold shadow-lg shadow-amber-500/25">{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Product'}</button>
          </div>
        </form>
      </div>
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
      const res = await fetch(`/api/admin/products/${product.id}/restock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: qty }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Restock failed'); }
      onDone();
    } catch (err: any) { onError(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1E2336]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-[#E9EDF7]">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><PackagePlus size={18} className="text-amber-500" /> Restock</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="bg-[#F4F7FE] rounded-xl p-3 border border-[#E9EDF7] flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <Package size={20} />}
            </div>
            <div><p className="font-bold text-gray-900">{product.name}</p><p className="text-xs text-gray-500">Current: <span className="font-bold">{product.stock_units}</span> units</p></div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Units to add</label>
            <input type="number" min="1" autoFocus value={qty || ''} onChange={e => setQty(Number(e.target.value))} className="w-full bg-[#F4F7FE] border border-[#E9EDF7] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="0" />
            {qty > 0 && <p className="text-xs text-emerald-600 font-medium mt-1.5">New stock will be {(product.stock_units + qty).toLocaleString()} units</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-white font-bold">{saving ? 'Saving…' : 'Confirm'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
