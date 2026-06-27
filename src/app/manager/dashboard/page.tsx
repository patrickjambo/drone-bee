'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Package, Search, Plus, Minus, Printer, Trash2,
  Banknote, Smartphone, CreditCard, BarChart3, Clock, X,
  TrendingUp, AlertTriangle, CheckCircle2, Layers,
  Box, User, Sparkles, Receipt, Wallet, Percent, Tag,
  Pause, RotateCcw, LayoutGrid, List, Coins, Crown
} from 'lucide-react';
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

type CartItem = {
  key: string;
  productId: string;
  name: string;
  saleType: 'UNIT' | 'BATCH';
  price: number;
  quantity: number;
  stockUnits: number;
  batchSize: number;
};

type Parked = { id: string; items: CartItem[]; customer: string; payment: string; total: number; at: string };

const PAYMENTS = [
  { id: 'Cash', label: 'Cash', icon: Wallet },
  { id: 'Mobile Money', label: 'MoMo', icon: Smartphone },
  { id: 'Card', label: 'Card', icon: CreditCard },
] as const;

const DISCOUNTS = [0, 5, 10, 15];

export default function ManagerDashboard() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);          // amount in RWF
  const [discountPct, setDiscountPct] = useState(0);     // active % chip
  const [tendered, setTendered] = useState<string>('');  // cash received

  const [parked, setParked] = useState<Parked[]>([]);
  const [showParked, setShowParked] = useState(false);

  const [stats, setStats] = useState({ todaySales: 0, revenue: 0, inStock: 0, lowStockQty: 0, outOfStockQty: 0, offlineQueue: 0 });
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [userName, setUserName] = useState('there');

  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [lastSale, setLastSale] = useState<any>(null);

  const [cartOpen, setCartOpen] = useState(false); // mobile drawer
  const [showAddProduct, setShowAddProduct] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // ---- Data loading -------------------------------------------------------
  useEffect(() => {
    fetchProducts();
    fetchDashboardData();
    fetchProfile();
    fetchCustomers();
    fetchTopSellers();
    const interval = setInterval(() => { fetchDashboardData(); fetchTopSellers(); }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Hydrate cart + parked sales from localStorage (survive refresh).
  useEffect(() => {
    try {
      const c = localStorage.getItem('db_cart');
      if (c) setCart(JSON.parse(c));
      const p = localStorage.getItem('db_parked');
      if (p) setParked(JSON.parse(p));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { try { localStorage.setItem('db_cart', JSON.stringify(cart)); } catch { /* ignore */ } }, [cart]);
  useEffect(() => { try { localStorage.setItem('db_parked', JSON.stringify(parked)); } catch { /* ignore */ } }, [parked]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/manager/products');
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push('/manager/login');
        return;
      }
      setProducts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/manager/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentTx(data.recentTransactions || []);
        if (data.chartData) setChartData(data.chartData);
      }
    } catch (e) { console.error(e); }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) { const data = await res.json(); setUserName((data.name || 'there').split(' ')[0]); }
    } catch { /* ignore */ }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/manager/customers');
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch { /* ignore */ }
  };

  const fetchTopSellers = async () => {
    try {
      const res = await fetch('/api/manager/reports?range=Today');
      if (res.ok) { const data = await res.json(); setTopSellers(data.topProducts || []); }
    } catch { /* ignore */ }
  };

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ---- Derived data -------------------------------------------------------
  const honeyTypes = useMemo(() => {
    const set = new Set(products.map(p => p.honey_type).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products.filter(p => {
      const matchesType = typeFilter === 'All' || p.honey_type === typeFilter;
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.honey_type || '').toLowerCase().includes(q) ||
        (p.origin || '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [products, searchTerm, typeFilter]);

  const subtotal = useMemo(() => cart.reduce((a, i) => a + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((a, i) => a + i.quantity, 0), [cart]);
  const discountValue = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - discountValue);
  const tenderedNum = Number(tendered) || 0;
  const change = paymentMethod === 'Cash' && tenderedNum > 0 ? Math.max(0, tenderedNum - total) : 0;
  const cashShort = paymentMethod === 'Cash' && tenderedNum > 0 && tenderedNum < total;

  // physical units committed in cart for a product (optionally excluding a line)
  const committedUnits = useCallback((productId: string, exceptKey?: string) =>
    cart
      .filter(i => i.productId === productId && i.key !== exceptKey)
      .reduce((a, i) => a + (i.saleType === 'BATCH' ? i.batchSize * i.quantity : i.quantity), 0),
  [cart]);

  // ---- Cart ops -----------------------------------------------------------
  const addToCart = useCallback((product: Product, saleType: 'UNIT' | 'BATCH') => {
    const unitsNeeded = saleType === 'BATCH' ? product.batch_size : 1;
    if (committedUnits(product.id) + unitsNeeded > product.stock_units) {
      showToast('error', `Not enough stock of ${product.name}.`);
      return;
    }
    const key = `${product.id}-${saleType}`;
    setCart(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, {
        key, productId: product.id, name: product.name, saleType,
        price: saleType === 'BATCH' ? product.price_per_batch : product.price_per_unit,
        quantity: 1, stockUnits: product.stock_units, batchSize: product.batch_size,
      }];
    });
  }, [committedUnits, showToast]);

  const changeQty = (key: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.key === key);
      if (!item) return prev;
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) return prev.filter(i => i.key !== key);
      if (delta > 0) {
        const unitsNeeded = item.saleType === 'BATCH' ? item.batchSize : 1;
        if (committedUnits(item.productId) + unitsNeeded > item.stockUnits) {
          showToast('error', `Maximum available stock reached for ${item.name}.`);
          return prev;
        }
      }
      return prev.map(i => i.key === key ? { ...i, quantity: nextQty } : i);
    });
  };

  const setQty = (key: string, value: string) => {
    const item = cart.find(i => i.key === key);
    if (!item) return;
    let q = Math.max(0, Math.floor(Number(value) || 0));
    if (q === 0) { setCart(prev => prev.filter(i => i.key !== key)); return; }
    const perUnit = item.saleType === 'BATCH' ? item.batchSize : 1;
    const maxQ = Math.floor((item.stockUnits - committedUnits(item.productId, key)) / perUnit);
    if (q > maxQ) { q = maxQ; showToast('error', `Only ${maxQ} available for ${item.name}.`); }
    setCart(prev => prev.map(i => i.key === key ? { ...i, quantity: q } : i));
  };

  const removeItem = (key: string) => setCart(prev => prev.filter(i => i.key !== key));

  const resetSale = () => { setCart([]); setDiscount(0); setDiscountPct(0); setTendered(''); };
  const clearCart = () => resetSale();

  const applyDiscountPct = (pct: number) => { setDiscountPct(pct); setDiscount(Math.round((subtotal * pct) / 100)); };

  const parkSale = () => {
    if (cart.length === 0) return;
    setParked(prev => [{ id: `P-${Date.now()}`, items: cart, customer: customerName, payment: paymentMethod, total, at: new Date().toISOString() }, ...prev]);
    resetSale();
    setCustomerName('Walk-in Customer');
    showToast('success', 'Order parked. Start a new sale.');
  };

  const resumeSale = (id: string) => {
    if (cart.length > 0) { showToast('error', 'Finish or park the current order first.'); return; }
    const s = parked.find(p => p.id === id);
    if (!s) return;
    setCart(s.items);
    setCustomerName(s.customer);
    setPaymentMethod(s.payment);
    setParked(prev => prev.filter(p => p.id !== id));
    setShowParked(false);
  };

  const confirmSale = async () => {
    if (cart.length === 0) return;
    if (cashShort) { showToast('error', 'Cash received is less than the total.'); return; }
    setProcessing(true);
    try {
      const payload = cart.map(i => ({ productId: i.productId, saleType: i.saleType, quantity: i.quantity }));
      const res = await fetch('/api/manager/pos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sale failed');

      setLastSale({
        items: cart, subtotal, discount: discountValue, total,
        customer: customerName, payment: paymentMethod,
        tendered: tenderedNum, change, id: data.transactionId || `S-${Date.now()}`, at: new Date(),
      });
      showToast('success', `Sale confirmed · RWF ${total.toLocaleString()}${change > 0 ? ` · Change ${change.toLocaleString()}` : ''}`);
      resetSale();
      setCartOpen(false);
      fetchProducts(); fetchDashboardData(); fetchTopSellers();
    } catch (e: any) {
      showToast('error', e.message || 'Could not complete sale');
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    if (cart.length === 0 && !lastSale) { showToast('error', 'Nothing to print yet.'); return; }
    window.print();
  };

  // ---- Keyboard: "/" focuses search ---------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSearchEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const first = filteredProducts.find(p => p.stock_units > 0);
      if (first) { addToCart(first, 'UNIT'); showToast('success', `Added ${first.name}`); }
    }
  };

  const stockBadge = (p: Product) => {
    if (p.stock_units === 0) return { label: 'Out of stock', cls: 'bg-red-100 text-red-600' };
    if (p.stock_units <= p.min_stock_threshold) return { label: `Low · ${p.stock_units}`, cls: 'bg-amber-100 text-amber-700' };
    return { label: `${p.stock_units} in stock`, cls: 'bg-emerald-100 text-emerald-700' };
  };

  // ---- Order panel (shared desktop + mobile drawer) -----------------------
  // Plain JSX (evaluated once per render) — NOT an inline component, so the
  // text inputs below keep focus across keystrokes.
  const orderPanel = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <ShoppingCart size={20} className="text-amber-500" /> Current Order
          {cartCount > 0 && <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{cartCount}</span>}
        </h3>
        <div className="flex items-center gap-3">
          {cart.length > 0 && (
            <>
              <button onClick={parkSale} className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1"><Pause size={13} /> Hold</button>
              <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"><Trash2 size={13} /> Clear</button>
            </>
          )}
        </div>
      </div>

      {/* Customer */}
      <div className="px-5 pt-4">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer</label>
        <div className="relative mt-1.5">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={customerName} onChange={e => setCustomerName(e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option>Walk-in Customer</option>
            {customers.map(c => <option key={c.id} value={c.name}>{c.name}{c.type ? ` · ${c.type}` : ''}</option>)}
          </select>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[110px]">
        {cart.length === 0 ? (
          <div className="h-full min-h-[130px] flex flex-col items-center justify-center text-center text-gray-400">
            <ShoppingCart size={36} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No items yet</p>
            <p className="text-xs mt-1">Tap a product, or press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-500">/</kbd> then Enter</p>
          </div>
        ) : cart.map(item => (
          <div key={item.key} className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.saleType === 'BATCH' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                  {item.saleType === 'BATCH' ? `Batch ×${item.batchSize}` : 'Unit'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">RWF {item.price.toLocaleString()} each</p>
            </div>
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
              <button onClick={() => changeQty(item.key, -1)} className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600"><Minus size={14} /></button>
              <input value={item.quantity} onChange={e => setQty(item.key, e.target.value)}
                className="w-8 text-center text-sm font-bold text-gray-900 bg-transparent focus:outline-none" />
              <button onClick={() => changeQty(item.key, 1)} className="w-7 h-7 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-600"><Plus size={14} /></button>
            </div>
            <div className="text-right w-16 shrink-0">
              <p className="font-bold text-sm text-gray-900">{(item.price * item.quantity).toLocaleString()}</p>
              <button onClick={() => removeItem(item.key)} className="text-[11px] text-red-400 hover:text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* Discount + payment + totals */}
      <div className="border-t border-gray-100 p-5 space-y-4">
        {/* Discount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1"><Percent size={12} /> Discount</label>
            <div className="flex gap-1">
              {DISCOUNTS.map(d => (
                <button key={d} onClick={() => applyDiscountPct(d)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${discountPct === d ? 'bg-amber-500 text-gray-900' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{d}%</button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="number" min="0" value={discount || ''} onChange={e => { setDiscount(Number(e.target.value)); setDiscountPct(-1); }}
              placeholder="Amount off (RWF)" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {/* Payment */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Payment</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5">
            {PAYMENTS.map(p => {
              const Icon = p.icon; const active = paymentMethod === p.id;
              return (
                <button key={p.id} onClick={() => setPaymentMethod(p.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] font-bold transition ${active ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  <Icon size={16} /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash tendering */}
        {paymentMethod === 'Cash' && cart.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
            <div className="relative">
              <Coins size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" min="0" value={tendered} onChange={e => setTendered(e.target.value)}
                placeholder="Cash received" className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            {tenderedNum > 0 && (
              <div className={`flex justify-between text-sm font-bold ${cashShort ? 'text-red-500' : 'text-emerald-600'}`}>
                <span>{cashShort ? 'Short by' : 'Change due'}</span>
                <span>RWF {(cashShort ? total - tenderedNum : change).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>RWF {subtotal.toLocaleString()}</span></div>
          {discountValue > 0 && <div className="flex justify-between text-sm text-amber-600 font-medium"><span>Discount</span><span>− RWF {discountValue.toLocaleString()}</span></div>}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-100">
            <span className="text-base font-bold text-gray-700">Total</span>
            <span className="text-[26px] font-black text-gray-900">RWF {total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={printReceipt} className="px-4 py-3.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm flex items-center justify-center"><Printer size={16} /></button>
          <button onClick={confirmSale} disabled={cart.length === 0 || processing || cashShort}
            className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-gray-900 font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm">
            {processing ? 'Processing…' : <><CheckCircle2 size={18} /> Confirm Sale</>}
          </button>
        </div>
      </div>
    </div>
  );

  // ---- Render -------------------------------------------------------------
  return (
    <div className="w-full pb-24 lg:pb-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden !important; }
          .receipt-print, .receipt-print * { visibility: visible !important; }
          .receipt-print { display: block !important; position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#171B2C] via-[#242B47] to-[#171B2C] p-6 sm:p-8 mb-6 shadow-[0_12px_40px_rgba(23,27,44,0.25)]">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='56' height='100' viewBox='0 0 56 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0l28 16v33L28 65 0 49V16z' fill='none' stroke='%23E8C265' stroke-width='1.5'/%3E%3C/svg%3E\")",
          backgroundSize: '64px',
        }} />
        <div className="absolute -top-16 -right-10 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 tracking-tight">Hi {userName} <Sparkles size={26} className="text-amber-400" /></h1>
            <p className="text-gray-300 text-[15px] sm:text-base mt-2 font-medium">Your point-of-sale is ready. Sell faster, track everything live.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {parked.length > 0 && (
              <div className="relative">
                <button onClick={() => setShowParked(v => !v)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-sm font-bold text-white transition backdrop-blur-sm">
                  <Pause size={16} /> Parked <span className="bg-amber-400 text-[#171B2C] text-[11px] px-1.5 py-0.5 rounded-full font-black">{parked.length}</span>
                </button>
                {showParked && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <p className="px-4 py-3 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">Parked orders</p>
                    <div className="max-h-72 overflow-y-auto">
                      {parked.map(p => (
                        <button key={p.id} onClick={() => resumeSale(p.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{p.customer}</p>
                            <p className="text-[11px] text-gray-500">{p.items.length} item(s) · {new Date(p.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <span className="text-sm font-black text-gray-900 flex items-center gap-1"><RotateCcw size={13} className="text-amber-500" /> {p.total.toLocaleString()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 rounded-xl text-sm font-black text-[#171B2C] shadow-lg shadow-amber-500/20 transition"><Plus size={18} /> Add Product</button>
            <button onClick={() => router.push('/manager/reconcile')} className="hidden sm:flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-sm font-bold text-white transition backdrop-blur-sm"><Clock size={16} /> EOD Count</button>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KpiCard icon={ShoppingCart} tint="blue" label="Today's Sales" value={stats.todaySales} suffix="txns" />
        <KpiCard icon={Banknote} tint="green" label="Revenue Today" value={`RWF ${stats.revenue.toLocaleString()}`} />
        <KpiCard icon={BarChart3} tint="amber" label="Avg. Sale" value={`RWF ${stats.todaySales > 0 ? Math.round(stats.revenue / stats.todaySales).toLocaleString() : 0}`} />
        <KpiCard icon={AlertTriangle} tint={stats.outOfStockQty > 0 ? 'red' : 'gray'} label="Stock Alerts" value={stats.lowStockQty + stats.outOfStockQty} suffix="low/out" />
      </div>

      {/* POS grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><Box size={20} className="text-amber-500" /> Products</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 font-semibold">{filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={16} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}><List size={16} /></button>
                  </div>
                </div>
              </div>
              <div className="relative mb-3.5">
                <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input ref={searchRef} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={onSearchEnter}
                  placeholder="Search products…  (press / to focus, Enter to add)"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {honeyTypes.map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${typeFilter === t ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {loading ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-xl bg-gray-100 animate-pulse" />)}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-gray-400 flex flex-col items-center">
                  <Package size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No products match your search.</p>
                  <button onClick={() => setShowAddProduct(true)} className="mt-3 text-amber-600 font-bold text-sm">+ Add a product</button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {filteredProducts.map(p => {
                    const badge = stockBadge(p); const soldOut = p.stock_units === 0; const hasBatch = p.batch_size > 1 && p.price_per_batch > 0;
                    return (
                      <div key={p.id} className={`group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-200 ${soldOut ? 'opacity-60' : 'hover:shadow-[0_10px_30px_rgba(16,24,40,0.10)] hover:border-amber-300 hover:-translate-y-0.5'}`}>
                        <div className="h-24 bg-gradient-to-br from-amber-300 via-amber-200 to-amber-100 relative flex items-center justify-center">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package size={32} className="text-amber-600/70" />}
                          <span className={`absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <div className="p-3.5">
                          <p className="font-bold text-[15px] text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate mb-2.5">{p.honey_type}{p.origin ? ` · ${p.origin}` : ''}</p>
                          <div className="flex items-baseline justify-between mb-3">
                            <span className="text-lg font-black text-gray-900">RWF {p.price_per_unit.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 font-medium">/unit</span>
                          </div>
                          <div className="flex gap-2">
                            <button disabled={soldOut} onClick={() => addToCart(p, 'UNIT')} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition shadow-sm shadow-amber-500/20"><Plus size={15} /> Unit</button>
                            {hasBatch && <button disabled={soldOut} onClick={() => addToCart(p, 'BATCH')} title={`Batch of ${p.batch_size} · RWF ${p.price_per_batch.toLocaleString()}`} className="flex-1 py-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 text-indigo-700 text-sm font-bold flex items-center justify-center gap-1.5 transition"><Layers size={15} /> Batch</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredProducts.map(p => {
                    const badge = stockBadge(p); const soldOut = p.stock_units === 0; const hasBatch = p.batch_size > 1 && p.price_per_batch > 0;
                    return (
                      <div key={p.id} className={`flex items-center gap-3 py-3 ${soldOut ? 'opacity-60' : ''}`}>
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><Package size={18} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{p.honey_type}{p.origin ? ` · ${p.origin}` : ''}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls} hidden sm:inline`}>{badge.label}</span>
                        <span className="font-black text-gray-900 text-sm w-24 text-right hidden sm:block">RWF {p.price_per_unit.toLocaleString()}</span>
                        <div className="flex gap-1.5 shrink-0">
                          <button disabled={soldOut} onClick={() => addToCart(p, 'UNIT')} className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 text-xs font-bold flex items-center gap-1"><Plus size={12} /> Unit</button>
                          {hasBatch && <button disabled={soldOut} onClick={() => addToCart(p, 'BATCH')} className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 disabled:bg-gray-100 disabled:text-gray-400 text-indigo-600 text-xs font-bold flex items-center gap-1"><Layers size={12} /> Batch</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order panel (desktop) */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-gray-100 lg:sticky lg:top-24 overflow-hidden">{orderPanel}</div>
        </div>
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2"><TrendingUp size={20} className="text-amber-500" /> Sales Over Time</h3>
            <span className="text-xs text-gray-400">Today</span>
          </div>
          <div className="relative h-40 w-full">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              {(() => {
                const pts = chartData.map((val, i) => ({ x: (i / 6) * 100, y: 95 - val * 0.8 }));
                if (pts.length === 0) return null;
                const pathD = `M${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ');
                const polygonD = pathD + ` L100,100 L0,100 Z`;
                return (<>
                  <path d={polygonD} fill="rgba(245, 158, 11, 0.12)" stroke="none" />
                  <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#f59e0b" />)}
                </>);
              })()}
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
            <span>8AM</span><span>10AM</span><span>12PM</span><span>2PM</span><span>4PM</span><span>6PM</span><span>8PM</span>
          </div>
        </div>

        {/* Top sellers today */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-gray-100 p-5">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-4"><Crown size={20} className="text-amber-500" /> Top Sellers Today</h3>
          {topSellers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No sales yet today.</p>
          ) : (
            <div className="space-y-4">
              {topSellers.slice(0, 5).map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-sm font-bold text-gray-800 truncate flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md text-[11px] flex items-center justify-center font-black ${i === 0 ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                      {p.name}
                    </p>
                    <span className="text-xs font-black text-gray-900">{p.sales}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${p.pct}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions full width */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(16,24,40,0.05)] border border-gray-100 p-5 mt-6">
        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-4"><Clock size={20} className="text-amber-500" /> Recent Transactions</h3>
        {recentTx.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No sales yet today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Receipt size={14} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{tx.productName}</p>
                    <p className="text-[11px] text-gray-500">{tx.quantity} {tx.saleType} · {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <p className="font-black text-emerald-600 text-sm shrink-0 ml-2">+{tx.totalAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile cart bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button onClick={() => setCartOpen(true)} className="w-full flex items-center justify-between bg-amber-500 text-gray-900 rounded-xl px-4 py-3 font-bold">
            <span className="flex items-center gap-2"><ShoppingCart size={18} /> {cartCount} item{cartCount !== 1 ? 's' : ''}</span>
            <span>RWF {total.toLocaleString()} · View</span>
          </button>
        </div>
      )}

      {/* Mobile order drawer */}
      {cartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="relative bg-white rounded-t-3xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-center pt-3"><div className="w-10 h-1.5 bg-gray-200 rounded-full" /></div>
            <button onClick={() => setCartOpen(false)} className="absolute top-3 right-4 text-gray-400"><X size={22} /></button>
            <div className="flex-1 overflow-hidden">{orderPanel}</div>
          </div>
        </div>
      )}

      {/* Add product modal */}
      {showAddProduct && (
        <AddProductModal onClose={() => setShowAddProduct(false)}
          onCreated={() => { setShowAddProduct(false); fetchProducts(); fetchDashboardData(); showToast('success', 'Product added to inventory.'); }}
          onError={(m) => showToast('error', m)} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-24 lg:bottom-6 right-4 z-[60] px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-bold text-white animate-in slide-in-from-bottom-3 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}{toast.msg}
        </div>
      )}

      {/* Printable receipt */}
      <div className="receipt-print hidden">
        <ReceiptView
          items={(cart.length > 0 ? cart : lastSale?.items) || []}
          subtotal={cart.length > 0 ? subtotal : (lastSale?.subtotal || 0)}
          discount={cart.length > 0 ? discountValue : (lastSale?.discount || 0)}
          total={cart.length > 0 ? total : (lastSale?.total || 0)}
          tendered={cart.length > 0 ? tenderedNum : (lastSale?.tendered || 0)}
          change={cart.length > 0 ? change : (lastSale?.change || 0)}
          customer={cart.length > 0 ? customerName : (lastSale?.customer || 'Walk-in Customer')}
          payment={cart.length > 0 ? paymentMethod : (lastSale?.payment || 'Cash')}
          cashier={userName}
          when={cart.length > 0 ? new Date() : (lastSale?.at || new Date())}
        />
      </div>
    </div>
  );
}

// ---- Sub components -------------------------------------------------------
function KpiCard({ icon: Icon, tint, label, value, suffix }: { icon: any; tint: string; label: string; value: any; suffix?: string }) {
  const tints: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
    amber: 'from-amber-400 to-amber-500 shadow-amber-500/30',
    red: 'from-red-500 to-rose-600 shadow-rose-500/30',
    gray: 'from-slate-400 to-slate-500 shadow-slate-500/30',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_24px_rgba(16,24,40,0.06)] hover:shadow-[0_10px_30px_rgba(16,24,40,0.10)] hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br text-white shadow-lg ${tints[tint]}`}><Icon size={22} /></div>
      <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-[26px] sm:text-3xl font-black text-gray-900 leading-none">{value}</span>
        {suffix && <span className="text-xs text-gray-400 font-semibold mb-1">{suffix}</span>}
      </div>
    </div>
  );
}

function ReceiptView({ items, subtotal, discount, total, tendered, change, customer, payment, cashier, when }: {
  items: CartItem[]; subtotal: number; discount: number; total: number; tendered: number; change: number;
  customer: string; payment: string; cashier: string; when: Date;
}) {
  return (
    <div style={{ fontFamily: 'monospace', maxWidth: 320, margin: '0 auto', color: '#000' }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontWeight: 800 }}>DRONE BEE LTD</h2>
        <p style={{ margin: 0, fontSize: 12 }}>Honey Sales Receipt</p>
        <p style={{ margin: 0, fontSize: 11 }}>{when.toLocaleString()}</p>
      </div>
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', fontSize: 12 }}>
        <p style={{ margin: 0 }}>Customer: {customer}</p>
        <p style={{ margin: 0 }}>Cashier: {cashier}</p>
        <p style={{ margin: 0 }}>Payment: {payment}</p>
      </div>
      <table style={{ width: '100%', fontSize: 12, marginTop: 8 }}>
        <tbody>
          {items.map(i => (
            <tr key={i.key}>
              <td>{i.name} {i.saleType === 'BATCH' ? `(Batch×${i.batchSize})` : ''} x{i.quantity}</td>
              <td style={{ textAlign: 'right' }}>{(i.price * i.quantity).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ borderTop: '1px dashed #000', marginTop: 8, paddingTop: 8, fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{subtotal.toLocaleString()}</span></div>
        {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span>- {discount.toLocaleString()}</span></div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, marginTop: 4 }}><span>TOTAL (RWF)</span><span>{total.toLocaleString()}</span></div>
        {tendered > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cash</span><span>{tendered.toLocaleString()}</span></div>}
        {change > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Change</span><span>{change.toLocaleString()}</span></div>}
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, marginTop: 14 }}>Thank you for choosing Drone Bee honey!</p>
    </div>
  );
}

function AddProductModal({ onClose, onCreated, onError }: { onClose: () => void; onCreated: () => void; onError: (m: string) => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', honey_type: '', origin: '', image_url: '', batch_size: 12, price_per_batch: 0, price_per_unit: 0, stock_units: 0, min_stock_threshold: 5 });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/manager/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price_per_batch: form.price_per_batch || form.price_per_unit * form.batch_size }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Failed to add product'); }
      onCreated();
    } catch (err: any) { onError(err.message); } finally { setSaving(false); }
  };

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400';
  const field = (label: string, node: React.ReactNode) => (<div><label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>{node}</div>);

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Package size={18} className="text-amber-500" /> Add New Product</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">{field('Product Name', <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Acacia Raw Honey 500g" />)}</div>
          {field('Honey Type', <input required value={form.honey_type} onChange={e => setForm({ ...form, honey_type: e.target.value })} className={inputCls} placeholder="e.g. Raw" />)}
          {field('Origin', <input value={form.origin} onChange={e => setForm({ ...form, origin: e.target.value })} className={inputCls} placeholder="e.g. Nyungwe" />)}
          <div className="col-span-2">{field('Product Photo', <ImageUploadField value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />)}</div>
          {field('Price / Unit (RWF)', <input type="number" min="0" required value={form.price_per_unit || ''} onChange={e => setForm({ ...form, price_per_unit: Number(e.target.value) })} className={inputCls} />)}
          {field('Units / Batch', <input type="number" min="1" required value={form.batch_size || ''} onChange={e => setForm({ ...form, batch_size: Number(e.target.value) })} className={inputCls} />)}
          {field('Price / Batch (RWF)', <input type="number" min="0" value={form.price_per_batch || ''} onChange={e => setForm({ ...form, price_per_batch: Number(e.target.value) })} className={inputCls} placeholder="auto" />)}
          {field('Low-stock Alert At', <input type="number" min="0" required value={form.min_stock_threshold || ''} onChange={e => setForm({ ...form, min_stock_threshold: Number(e.target.value) })} className={inputCls} />)}
          <div className="col-span-2">{field('Initial Stock (units)', <input type="number" min="0" required value={form.stock_units || ''} onChange={e => setForm({ ...form, stock_units: Number(e.target.value) })} className={inputCls} />)}</div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-gray-900 font-bold">{saving ? 'Saving…' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
