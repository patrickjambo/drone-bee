"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin, User, Facebook, Twitter, Instagram, Leaf, Globe2,
  ShieldCheck, ArrowRight, Star, ShoppingBag, BadgeCheck,
  Truck, Sparkles, Menu, X,
} from "lucide-react";

const heroSlides = [
  { src: "/p1.jpg", fit: "cover", label: "Classic Honey Jar", sub: "500g · Glass Jar" },
  { src: "/p2.jpg", fit: "cover", label: "Family Honey Can", sub: "2L · Jerrycan" },
  { src: "/p3.jpg", fit: "cover", label: "Squeeze Bottle", sub: "750ml · Easy-Pour" },
  { src: "/suko22.jpg", fit: "cover", label: "Loved Across Rwanda", sub: "Our customers' favourite" },
  { src: "/logo.png", fit: "contain", label: "Drone Bee Ltd", sub: "Premium Rwandan Honey" },
];

const products = [
  { img: "/p1.jpg", name: "Classic Honey Jar", size: "500g · Glass Jar", desc: "Our signature raw, unfiltered honey — golden, thick and rich.", tag: "Bestseller", tagCls: "bg-amber-400 text-[#171B2C]" },
  { img: "/p2.jpg", name: "Family Honey Can", size: "2L · Jerrycan", desc: "Pure natural honey in a generous size for the whole household.", tag: "Best Value", tagCls: "bg-emerald-400 text-[#0c2b1e]" },
  { img: "/p3.jpg", name: "Squeeze Bottle", size: "750ml · Easy-Pour", desc: "Everyday honey in a convenient, mess-free squeeze bottle.", tag: "New", tagCls: "bg-sky-400 text-[#0b2230]" },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % heroSlides.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1320] font-sans overflow-x-hidden text-white">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#111521]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 mr-2">
              <img src="/logo.png" alt="Drone Bee" className="w-full h-full object-contain drop-shadow-xl scale-[1.25]" />
            </div>
            <span className="font-serif text-2xl sm:text-[28px] font-semibold tracking-wide text-[#E8C265] whitespace-nowrap">Drone Bee</span>
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {[["Home", "/"], ["Shop Hub", "/shop"], ["Wholesale", "/wholesale"], ["About Us", "/about"]].map(([l, h]) => (
              <Link key={l} href={h} className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">{l}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/manager/login" className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#E8C265] px-3 sm:px-5 py-2.5 rounded-xl border border-white/10 transition shadow-sm">
              <User size={16} /><span className="text-xs sm:text-sm font-semibold">Staff</span>
            </Link>
            <Link href="/admin/login" className="flex items-center gap-1.5 bg-[#E8C265] hover:bg-amber-300 text-[#171B2C] px-3 sm:px-5 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 font-bold">
              <ShieldCheck size={16} /><span className="text-xs sm:text-sm">Admin</span>
            </Link>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden ml-1 text-gray-200 p-1">{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
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

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
        {/* backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1320] via-[#171B2C] to-[#0c0f1a]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='56' height='100' viewBox='0 0 56 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0l28 16v33L28 65 0 49V16z' fill='none' stroke='%23E8C265' stroke-width='1.5'/%3E%3C/svg%3E\")",
          backgroundSize: "70px",
        }} />
        <div className="absolute -top-32 -right-24 w-[38rem] h-[38rem] bg-amber-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-24 w-[34rem] h-[34rem] bg-orange-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-[1500px] mx-auto px-6 sm:px-10 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm font-semibold text-amber-300 backdrop-blur-sm">
              <Sparkles size={15} /> 100% Natural · Harvested in Rwanda
            </span>
            <h1 className="mt-6 text-[2.75rem] sm:text-6xl xl:text-[64px] font-black leading-[1.05] tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-[#FDF9ED] to-[#E5B53D]">Pure Rwandan</span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#E8C265] to-amber-500">Honey</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
              From our hives to your table — raw, traceable honey from the heart of Rwanda. Experience the purest sweetness nature has to offer.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/shop" className="group inline-flex items-center justify-center gap-2.5 bg-[#E8C265] hover:bg-amber-300 text-[#171B2C] px-7 py-4 rounded-2xl font-black text-base shadow-xl shadow-amber-500/25 transition">
                <ShoppingBag size={20} /> Shop Our Honey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/wholesale" className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-7 py-4 rounded-2xl font-bold text-base border border-white/15 backdrop-blur-sm transition">
                Wholesale Inquiry
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-1.5">
                <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={18} className="text-amber-400" fill="currentColor" />)}</div>
                <span className="text-sm font-semibold text-gray-300 ml-1">Top rated in Rwanda</span>
              </div>
              <div className="h-8 w-px bg-white/15 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2 text-gray-300">
                <BadgeCheck size={20} className="text-emerald-400" />
                <span className="text-sm font-semibold">Fully Traceable</span>
              </div>
            </div>
          </div>

          {/* Right: product gallery */}
          <div className="relative w-full max-w-[34rem] mx-auto mt-6 lg:mt-0">
            <div className="absolute -inset-6 bg-gradient-to-br from-amber-400/25 to-orange-500/10 blur-3xl rounded-full pointer-events-none" />

            {/* Main image */}
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/15 bg-gradient-to-br from-amber-200 via-amber-100 to-orange-50 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              {heroSlides.map((s, i) => (
                <img key={s.src} src={s.src} alt={s.label} loading="eager"
                  className={`absolute inset-0 w-full h-full transition-opacity duration-[1100ms] ease-in-out ${s.fit === "contain" ? "object-contain p-10" : "object-cover"} ${i === current ? "opacity-100" : "opacity-0"}`} />
              ))}

              {/* Made in badge */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2">
                <p className="text-[11px] text-amber-200 font-semibold leading-none">Made in</p>
                <p className="text-sm font-black text-white">🇷🇼 Rwanda</p>
              </div>

              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 p-5 pt-12 bg-gradient-to-t from-black/75 via-black/30 to-transparent">
                <p className="text-amber-300 text-[11px] font-bold uppercase tracking-[0.18em]">{heroSlides[current].sub}</p>
                <p className="text-white text-2xl font-black leading-tight">{heroSlides[current].label}</p>
              </div>
            </div>

            {/* Floating rating chip */}
            <div className="absolute -top-4 -left-3 sm:-left-5 bg-white text-[#171B2C] rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5 z-10">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={13} className="text-amber-400" fill="currentColor" />)}</div>
              <span className="text-xs font-black">4.9/5</span>
            </div>

            {/* Thumbnail strip — all images always visible */}
            <div className="mt-5 grid grid-cols-5 gap-2.5 sm:gap-3">
              {heroSlides.map((s, i) => (
                <button key={s.src} onClick={() => setCurrent(i)} aria-label={s.label}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${i === current ? "border-amber-400 ring-2 ring-amber-400/30 scale-[1.04]" : "border-white/10 opacity-55 hover:opacity-100"}`}>
                  <img src={s.src} alt={s.label} className={`w-full h-full ${s.fit === "contain" ? "object-contain p-1.5 bg-amber-50" : "object-cover"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="relative z-10 border-y border-white/10 bg-white/[0.03] backdrop-blur-sm">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Leaf, c: "text-emerald-400", t: "100% Natural", s: "No additives" },
            { icon: ShieldCheck, c: "text-amber-400", t: "Traceable", s: "Hive to table" },
            { icon: Truck, c: "text-sky-400", t: "Nationwide", s: "Fast delivery" },
            { icon: MapPin, c: "text-rose-400", t: "Rwanda Grown", s: "Local farmers" },
          ].map(({ icon: Icon, c, t, s }) => (
            <div key={t} className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><Icon size={22} className={c} /></div>
              <div>
                <p className="font-bold text-white leading-tight">{t}</p>
                <p className="text-xs text-gray-400">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRODUCT SHOWCASE ===== */}
      <section className="relative bg-gradient-to-b from-[#FDFBF6] to-[#F6EFE0] text-[#171B2C] py-24 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-amber-600 font-bold uppercase tracking-[0.25em] text-sm">Our Collection</h4>
            <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">Taste the Golden Standard</h2>
            <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">Hand-picked sizes for every home — from a classic jar to a family-sized can.</p>
            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((p) => (
              <div key={p.name} className="group bg-white rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(23,27,44,0.08)] hover:shadow-[0_24px_60px_rgba(229,181,61,0.25)] border border-amber-100 transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <span className={`absolute top-4 left-4 text-xs font-black px-3 py-1.5 rounded-full shadow-md ${p.tagCls}`}>{p.tag}</span>
                </div>
                <div className="p-7">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">{p.size}</p>
                  <h3 className="mt-1 text-2xl font-black">{p.name}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{p.desc}</p>
                  <Link href="/shop" className="mt-6 inline-flex items-center justify-center gap-2 w-full bg-[#171B2C] hover:bg-[#E8C265] hover:text-[#171B2C] text-white py-3.5 rounded-2xl font-bold transition-colors">
                    <ShoppingBag size={18} /> Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE ===== */}
      <section className="relative bg-[#FDFBF6] text-[#171B2C] pb-28 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-amber-600 font-bold uppercase tracking-[0.25em] text-sm">Our Promise</h4>
            <h2 className="mt-3 text-4xl md:text-5xl font-black tracking-tight">Why Choose Drone Bee?</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: "100% Organic", desc: "Sustainably harvested directly from wild blossoms — no additives, no artificial processing. Pure nature in every drop." },
              { icon: Globe2, title: "Rwanda Grown", desc: "Supporting local farming communities and preserving the pristine natural ecosystem of Rwanda's rich landscape." },
              { icon: ShieldCheck, title: "Traceable Supply", desc: "Every jar is tracked from our rural hives straight to your table, guaranteeing uncompromised authenticity." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group relative bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(229,181,61,0.18)] transition-all duration-500 hover:-translate-y-2 border border-amber-100/60 overflow-hidden">
                <div className="absolute -right-8 -top-8 text-amber-500/[0.06] group-hover:text-amber-500/10 transition-colors duration-500 group-hover:scale-110">
                  <Icon size={160} strokeWidth={1} />
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-7 shadow-inner border border-white group-hover:rotate-6 transition-transform duration-500">
                    <Icon className="text-amber-600 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-3">{title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BAND ===== */}
      <section className="relative overflow-hidden bg-[#171B2C] py-20 px-6">
        <div className="absolute -top-24 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Taste the <span className="text-[#E8C265]">difference</span> today
          </h2>
          <p className="mt-5 text-gray-300 text-lg max-w-2xl mx-auto">Join thousands of happy customers enjoying Rwanda&apos;s finest natural honey.</p>
          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="inline-flex items-center justify-center gap-2 bg-[#E8C265] hover:bg-amber-300 text-[#171B2C] px-8 py-4 rounded-2xl font-black shadow-xl shadow-amber-500/25 transition">
              <ShoppingBag size={20} /> Start Shopping
            </Link>
            <Link href="/wholesale" className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold border border-white/15 transition">
              Become a Reseller
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0F1320] text-gray-400 py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center shrink-0 mr-3">
                <img src="/logo.png" alt="Drone Bee" className="w-full h-full object-contain drop-shadow-md scale-[1.3]" />
              </div>
              <span className="font-serif text-xl font-bold text-white whitespace-nowrap">Drone Bee</span>
            </div>
            <p className="text-sm leading-relaxed">Delivering the highest quality natural honey from Rwanda to the world. Sustainably sourced, expertly handled.</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[["Home", "/"], ["Shop Hub", "/shop"], ["Wholesale", "/wholesale"], ["About Us", "/about"]].map(([l, h]) => (
                <li key={l}><Link href={h} className="hover:text-[#E8C265] transition">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Portals</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/manager/login" className="hover:text-[#E8C265] transition">Staff Login</Link></li>
              <li><Link href="/admin/login" className="hover:text-[#E8C265] transition">Super Admin</Link></li>
              <li><Link href="/track" className="hover:text-[#E8C265] transition">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#E8C265] hover:text-[#171B2C] flex items-center justify-center transition"><Icon size={18} /></a>
              ))}
            </div>
            <div className="mt-4 text-sm flex flex-col space-y-2">
              <a href="mailto:jambopatrick456@gmail.com" className="hover:text-[#E8C265] transition">jambopatrick456@gmail.com</a>
              <a href="tel:+250783314404" className="hover:text-[#E8C265] transition">0783314404</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Drone Bee Ltd. All rights reserved.</p>
          <div className="space-x-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
