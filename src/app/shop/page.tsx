"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  User, ShieldCheck, ShoppingCart, CheckCircle, Search, Menu, X,
  Plus, Minus, Trash2, Package, ArrowRight, Leaf, ShieldCheck as Shield,
} from "lucide-react";

const WHATSAPP = "250783314404"; // business order line

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
  is_active: boolean;
};

type CartItem = { product: Product; qty: number };

export default function ShopHub() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setProducts(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const honeyTypes = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.honey_type).filter(Boolean)))], [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchType = filter === "All" || p.honey_type === filter;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.honey_type || "").toLowerCase().includes(q) || (p.origin || "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [products, filter, search]);

  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);
  const subtotal = cartItems.reduce((a, i) => a + i.product.price_per_unit * i.qty, 0);

  const qtyInCart = (id: string) => cartItems.find((i) => i.product.id === id)?.qty || 0;

  const addToCart = (product: Product) => {
    if (qtyInCart(product.id) + 1 > product.stock_units) { showToast("No more stock available"); return; }
    setCartItems((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { product, qty: 1 }];
    });
    showToast(`${product.name} added to cart`);
  };

  const changeQty = (id: string, delta: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.product.id === id);
      if (!item) return prev;
      const next = item.qty + delta;
      if (next <= 0) return prev.filter((i) => i.product.id !== id);
      if (next > item.product.stock_units) { showToast("Reached available stock"); return prev; }
      return prev.map((i) => (i.product.id === id ? { ...i, qty: next } : i));
    });
  };

  const removeItem = (id: string) => setCartItems((prev) => prev.filter((i) => i.product.id !== id));

  const checkout = () => {
    if (cartItems.length === 0) return;
    const lines = cartItems
      .map((i) => `• ${i.qty} x ${i.product.name} — RWF ${(i.product.price_per_unit * i.qty).toLocaleString()}`)
      .join("\n");
    const msg = `Hello Drone Bee! 🍯\nI would like to order:\n${lines}\n\nTotal: RWF ${subtotal.toLocaleString()}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    showToast("Opening WhatsApp to place your order…");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF6] font-sans text-[#171B2C]">
      {/* Toast */}
      <div className={`fixed top-24 right-6 z-[130] bg-[#171B2C] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"}`}>
        <CheckCircle className="text-emerald-400" size={18} /> <span className="font-semibold text-sm">{toast}</span>
      </div>

      {/* Cart drawer */}
      <div className={`fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setIsCartOpen(false)} />
      <aside className={`fixed top-0 right-0 h-full w-full sm:w-[26rem] bg-white z-[120] shadow-2xl flex flex-col transition-transform duration-300 ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-5 flex justify-between items-center bg-[#171B2C] text-white">
          <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold text-[#E8C265] flex items-center gap-2"><ShoppingCart size={20} /> Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-300 hover:text-white"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-40" />
              <p className="text-lg font-bold text-gray-600">Your cart is empty</p>
              <p className="text-sm mt-1">Add some golden honey to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-amber-50 flex items-center justify-center shrink-0">
                    {item.product.image_url ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" /> : <Package size={24} className="text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                    <p className="text-amber-600 font-black text-sm">RWF {item.product.price_per_unit.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center bg-white rounded-lg border border-gray-200">
                        <button onClick={() => changeQty(item.product.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"><Minus size={13} /></button>
                        <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                        <button onClick={() => changeQty(item.product.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"><Plus size={13} /></button>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="font-black text-[#171B2C] text-sm">RWF {(item.product.price_per_unit * item.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-semibold">Subtotal</span>
              <span className="font-black text-2xl">RWF {subtotal.toLocaleString()}</span>
            </div>
            <button onClick={checkout} className="w-full py-4 rounded-xl font-black bg-[#25D366] hover:bg-[#1da851] text-white shadow-lg transition flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.044z"/></svg>
              Order on WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400">You&apos;ll confirm your order with our team on WhatsApp.</p>
          </div>
        )}
      </aside>

      {/* Header */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0F1320]/95 backdrop-blur-xl border-b border-white/10 shadow-lg" : "bg-[#0F1320]"}`}>
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 mr-2">
              <img src="/logo.png" alt="Drone Bee" className="w-full h-full object-contain drop-shadow-xl scale-[1.25]" />
            </div>
            <span style={{ fontFamily: "var(--font-display)" }} className="text-2xl sm:text-[28px] font-semibold tracking-wide text-[#E8C265] whitespace-nowrap">Drone Bee</span>
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            <Link href="/" className="text-gray-300 hover:text-[#E8C265] font-medium transition-colors">Home</Link>
            <Link href="/shop" className="text-[#E8C265] font-semibold border-b-2 border-[#E8C265] py-1">Shop Hub</Link>
            <Link href="/wholesale" className="text-gray-300 hover:text-[#E8C265] font-medium transition-colors">Wholesale</Link>
            <Link href="/about" className="text-gray-300 hover:text-[#E8C265] font-medium transition-colors">About Us</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 text-gray-200 hover:text-[#E8C265] rounded-xl hover:bg-white/5 transition">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#E8C265] text-[#171B2C] text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
            </button>
            <Link href="/manager/login" className="hidden sm:flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#E8C265] px-4 py-2.5 rounded-xl border border-white/10 transition"><User size={16} /><span className="text-sm font-semibold">Staff</span></Link>
            <Link href="/admin/login" className="hidden sm:flex items-center gap-1.5 bg-[#E8C265] hover:bg-amber-300 text-[#171B2C] px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition"><ShieldCheck size={16} /><span className="text-sm">Admin</span></Link>
            <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden text-gray-200 p-1">{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#111521]/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-3">
            {[["Home", "/"], ["Shop Hub", "/shop"], ["Wholesale", "/wholesale"], ["About Us", "/about"]].map(([l, h]) => (
              <Link key={l} href={h} onClick={() => setMenuOpen(false)} className="text-gray-200 hover:text-[#E8C265] font-medium py-1">{l}</Link>
            ))}
          </div>
        )}
      </header>

      {/* Hero banner */}
      <section className="relative pt-32 pb-14 px-6 bg-gradient-to-br from-[#0F1320] via-[#171B2C] to-[#0c0f1a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='56' height='100' viewBox='0 0 56 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0l28 16v33L28 65 0 49V16z' fill='none' stroke='%23E8C265' stroke-width='1.5'/%3E%3C/svg%3E\")",
          backgroundSize: "70px",
        }} />
        <div className="absolute -top-20 right-10 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px]" />
        <div className="relative max-w-[1400px] mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm font-semibold text-amber-300">
            <Leaf size={15} /> 100% Natural · Harvested in Rwanda
          </span>
          <h1 style={{ fontFamily: "var(--font-display)" }} className="mt-5 text-5xl md:text-6xl font-black tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white to-[#E5B53D]">Shop Hub</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">Browse our premium selection of natural Rwandan honey — sustainably sourced for the purest taste.</p>
        </div>
      </section>

      {/* Trust strip */}
      <div className="bg-[#E8C265] text-[#171B2C] py-3">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-1 text-sm font-bold">
          <span className="flex items-center gap-2"><Leaf size={15} /> 100% Raw & Natural</span>
          <span className="flex items-center gap-2"><Shield size={15} /> Fully Traceable</span>
          <span className="flex items-center gap-2"><ArrowRight size={15} /> Free Delivery in Kigali</span>
        </div>
      </div>

      {/* Catalog */}
      <main className="max-w-[1400px] mx-auto w-full px-6 py-12">
        {/* Search + filters */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-10 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={19} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search honey by name, type or origin…"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#E8C265] focus:bg-white outline-none transition" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {honeyTypes.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition ${filter === f ? "bg-[#171B2C] text-[#E8C265]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[440px] rounded-3xl bg-white border border-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center">
            <Package size={52} className="text-amber-300 mb-4" />
            <h3 className="text-xl font-black">No products available</h3>
            <p className="text-gray-500 mt-2">{products.length === 0 ? "Our shelves are being restocked — check back soon." : "Try adjusting your search or filters."}</p>
            {products.length > 0 && <button onClick={() => { setFilter("All"); setSearch(""); }} className="mt-5 text-[#171B2C] font-bold border-b-2 border-[#E8C265]">Clear filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => {
              const soldOut = p.stock_units <= 0;
              const lowStock = !soldOut && p.stock_units <= 5;
              const inCart = qtyInCart(p.id);
              return (
                <div key={p.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_10px_40px_rgba(23,27,44,0.06)] hover:shadow-[0_22px_55px_rgba(229,181,61,0.22)] hover:-translate-y-2 transition-all duration-500 flex flex-col">
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-50">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={56} className="text-amber-400/70" /></div>}
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide text-[#171B2C] shadow-sm">{p.honey_type}</span>
                    {soldOut
                      ? <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow">Sold out</span>
                      : lowStock && <span className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-black shadow">Only {p.stock_units} left</span>}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-3 mb-1">
                      <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-black leading-tight">{p.name}</h3>
                      <span className="text-xl font-black text-amber-600 whitespace-nowrap">RWF {p.price_per_unit.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{p.honey_type}{p.origin ? ` · ${p.origin}` : ""}{p.batch_size > 1 && p.price_per_batch > 0 ? ` · batch of ${p.batch_size} @ RWF ${p.price_per_batch.toLocaleString()}` : ""}</p>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">Rich, natural nectar straight from the hive — raw, unfiltered and full of flavour to the last drop.</p>
                    <button onClick={() => addToCart(p)} disabled={soldOut}
                      className={`w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition ${soldOut ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#171B2C] hover:bg-[#E8C265] hover:text-[#171B2C] text-[#E8C265]"}`}>
                      {soldOut ? "Out of Stock" : inCart > 0 ? <><CheckCircle size={18} /> In Cart ({inCart})</> : <><ShoppingCart size={18} /> Add to Cart</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F1320] text-gray-400 py-12 border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <div className="w-11 h-11 flex items-center justify-center mr-3"><img src="/logo.png" alt="Drone Bee" className="w-full h-full object-contain scale-[1.3]" /></div>
            <span style={{ fontFamily: "var(--font-display)" }} className="text-lg font-bold text-white">Drone Bee</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Drone Bee Ltd. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="hover:text-[#E8C265]">Home</Link>
            <Link href="/wholesale" className="hover:text-[#E8C265]">Wholesale</Link>
            <Link href="/about" className="hover:text-[#E8C265]">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
