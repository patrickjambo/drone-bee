'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, ShoppingBag, Minus, Plus, Leaf, ShieldCheck, Truck,
  Package, Star, User, ChevronRight,
} from 'lucide-react';

const WHATSAPP = '250783314404';
const FALLBACK = ['/p1.jpg', '/p2.jpg', '/p3.jpg'];
function imgFor(p: { id: string; image_url?: string | null }) {
  if (p.image_url) return p.image_url;
  const n = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK[n % FALLBACK.length];
}

type Product = {
  id: string; name: string; honey_type: string; origin?: string | null; image_url?: string | null;
  batch_size: number; price_per_batch: number; price_per_unit: number; stock_units: number; min_stock_threshold: number;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`).then(r => { if (!r.ok) { setNotFound(true); return null; } return r.json(); })
      .then(d => { if (d) setProduct(d); }).finally(() => setLoading(false));
    fetch('/api/products').then(r => r.ok ? r.json() : []).then((d) => { if (Array.isArray(d)) setRelated(d); }).catch(() => {});
  }, [id]);

  const soldOut = product ? product.stock_units <= 0 : false;
  const total = product ? product.price_per_unit * qty : 0;

  const order = () => {
    if (!product) return;
    const msg = `Hello Drone Bee! 🍯\nI'd like to order:\n• ${qty} x ${product.name} — RWF ${total.toLocaleString()}\n\nTotal: RWF ${total.toLocaleString()}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const relatedItems = related.filter(p => p.id !== id && (product ? p.honey_type === product.honey_type : true)).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FDFBF6] font-sans text-[#171B2C]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0F1320] border-b border-white/10">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="w-14 h-14 flex items-center justify-center shrink-0 mr-2"><img src="/logo.png" alt="Drone Bee" className="w-full h-full object-contain drop-shadow-xl scale-[1.25]" /></div>
            <span style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-semibold tracking-wide text-[#E8C265]">Drone Bee</span>
          </Link>
          <nav className="hidden md:flex items-center gap-9">
            <Link href="/" className="text-gray-300 hover:text-[#E8C265] font-medium">Home</Link>
            <Link href="/shop" className="text-[#E8C265] font-semibold">Shop Hub</Link>
            <Link href="/wholesale" className="text-gray-300 hover:text-[#E8C265] font-medium">Wholesale</Link>
            <Link href="/about" className="text-gray-300 hover:text-[#E8C265] font-medium">About Us</Link>
          </nav>
          <Link href="/admin/login" className="flex items-center gap-1.5 bg-[#E8C265] hover:bg-amber-300 text-[#171B2C] px-4 py-2.5 rounded-xl font-bold transition"><User size={16} /><span className="text-sm">Portal</span></Link>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
          <Link href="/shop" className="hover:text-amber-600 font-medium flex items-center gap-1"><ArrowLeft size={15} /> Shop Hub</Link>
          <ChevronRight size={14} /> <span className="text-gray-700 font-semibold truncate">{product?.name || 'Product'}</span>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="aspect-square rounded-3xl bg-white border border-gray-100 animate-pulse" />
            <div className="space-y-4"><div className="h-10 w-2/3 bg-gray-100 rounded-xl animate-pulse" /><div className="h-6 w-1/3 bg-gray-100 rounded-xl animate-pulse" /><div className="h-32 bg-gray-100 rounded-xl animate-pulse" /></div>
          </div>
        ) : notFound || !product ? (
          <div className="py-24 text-center">
            <Package size={52} className="text-amber-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black">Product not found</h2>
            <p className="text-gray-500 mt-2">It may have been removed or is no longer available.</p>
            <Link href="/shop" className="inline-block mt-6 bg-[#171B2C] text-white px-6 py-3 rounded-xl font-bold">Back to Shop</Link>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-amber-100 bg-gradient-to-br from-amber-100 to-orange-50 shadow-[0_20px_50px_rgba(23,27,44,0.08)]">
                <img src={imgFor(product)} alt={product.name} className="w-full h-full object-cover" />
                <span className="absolute top-5 left-5 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide text-[#171B2C] shadow-sm">{product.honey_type}</span>
                {soldOut && <span className="absolute top-5 right-5 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow">Sold out</span>}
              </div>

              {/* Details */}
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}<span className="text-gray-400 text-sm font-medium ml-1">Top rated</span></div>
                <h1 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-black leading-tight">{product.name}</h1>
                <p className="text-gray-500 mt-2">{product.honey_type}{product.origin ? ` · ${product.origin}` : ''}</p>

                <div className="mt-5 flex items-baseline gap-3">
                  <span className="text-4xl font-black text-amber-600">RWF {product.price_per_unit.toLocaleString()}</span>
                  <span className="text-gray-400 font-medium">/ unit</span>
                </div>
                {product.batch_size > 1 && product.price_per_batch > 0 && (
                  <p className="text-sm text-gray-500 mt-1">or RWF {product.price_per_batch.toLocaleString()} per batch of {product.batch_size}</p>
                )}

                <p className="mt-6 text-gray-600 leading-relaxed">Rich, natural nectar straight from the hive — raw, unfiltered and cold-extracted to preserve every drop of flavour and goodness. Harvested in Rwanda and fully traceable from hive to your table.</p>

                <div className="mt-5">
                  {soldOut
                    ? <span className="inline-block bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl">Currently out of stock</span>
                    : product.stock_units <= product.min_stock_threshold
                      ? <span className="inline-block bg-amber-50 text-amber-700 font-bold px-4 py-2 rounded-xl">Only {product.stock_units} left — order soon</span>
                      : <span className="inline-block bg-emerald-50 text-emerald-700 font-bold px-4 py-2 rounded-xl">In stock · ready to ship</span>}
                </div>

                {/* Quantity + order */}
                {!soldOut && (
                  <div className="mt-7 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl w-fit">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-xl"><Minus size={18} /></button>
                      <span className="w-12 text-center font-black text-lg">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(product.stock_units, q + 1))} className="w-11 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-xl"><Plus size={18} /></button>
                    </div>
                    <button onClick={order} className="flex-1 py-4 rounded-xl font-black bg-[#25D366] hover:bg-[#1da851] text-white shadow-lg transition flex items-center justify-center gap-2">
                      <ShoppingBag size={20} /> Order on WhatsApp · RWF {total.toLocaleString()}
                    </button>
                  </div>
                )}

                {/* Trust */}
                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
                  {[{ i: Leaf, t: '100% Natural', c: 'text-emerald-500' }, { i: ShieldCheck, t: 'Traceable', c: 'text-amber-500' }, { i: Truck, t: 'Fast delivery', c: 'text-sky-500' }].map(({ i: Icon, t, c }) => (
                    <div key={t} className="flex flex-col items-center text-center gap-1.5"><Icon size={22} className={c} /><span className="text-xs font-bold text-gray-600">{t}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Related */}
            {relatedItems.length > 0 && (
              <section className="mt-16">
                <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-black mb-6">You may also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedItems.map(p => (
                    <Link key={p.id} href={`/shop/${p.id}`} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-[0_18px_45px_rgba(229,181,61,0.2)] hover:-translate-y-1 transition-all">
                      <div className="h-48 overflow-hidden bg-amber-50"><img src={imgFor(p)} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                      <div className="p-5">
                        <p className="text-xs font-bold uppercase text-amber-600">{p.honey_type}</p>
                        <h3 className="font-black mt-0.5">{p.name}</h3>
                        <p className="text-amber-600 font-black mt-1">RWF {p.price_per_unit.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="bg-[#0F1320] text-gray-400 py-10 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-sm">&copy; {new Date().getFullYear()} Drone Bee Ltd.</span>
          <div className="flex gap-4 text-sm"><Link href="/shop" className="hover:text-[#E8C265]">Shop</Link><Link href="/wholesale" className="hover:text-[#E8C265]">Wholesale</Link><Link href="/about" className="hover:text-[#E8C265]">About</Link></div>
        </div>
      </footer>
    </div>
  );
}
