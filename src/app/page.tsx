"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  MapPin,
  User,
  Facebook,
  Twitter,
  Instagram,
  Leaf,
  Globe2,
  ShieldCheck,
  ArrowRight,
  Award,
  Star
} from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&q=80&w=2070",
  "https://images.unsplash.com/photo-1536788567643-8c2368376526?auto=format&fit=crop&q=80&w=2070",
  "/logo.png",
  "/suko.png"
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4500); // Increased slightly for a calmer transition
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF9ED] flex flex-col font-sans overflow-x-hidden relative">
      {/* Background Honeycomb Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.923' viewBox='0 0 60 103.923' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64l-30 17.32L0 51.96V17.32z' fill='none' stroke='%23d4af37' stroke-width='1' stroke-opacity='0.4'/%3E%3Cpath d='M30 103.923l30-17.32V51.96l-30-17.32L0 51.96v34.643z' fill='none' stroke='%23d4af37' stroke-width='1' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "120px",
        }}
      />

      {/* 1. FIXED HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-[#181D2D] text-white w-full border-b border-[#2C3446] shadow-xl z-50 transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 mr-2 sm:mr-3">
              <img src="/logo.png" alt="Drone Bee Logo" className="w-full h-full object-contain filter drop-shadow-xl scale-[1.3]" />
            </div>
            <span className="font-serif text-xl sm:text-[28px] font-semibold tracking-wide text-[#E8C265] leading-none whitespace-nowrap">
              Drone Bee
            </span>
          </Link>

          {/* Middle: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">
              Shop Hub
            </Link>
            <Link href="/wholesale" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">
              Wholesale
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">
              About Us
            </Link>
          </div>

          {/* Right: Portals */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/manager/login"
              className="flex items-center gap-1.5 sm:gap-2 bg-[#2B3448] hover:bg-[#34415A] text-[#E8C265] px-2.5 sm:px-5 py-2 rounded-lg border border-[#3C4A63] transition-all duration-300 shadow-md"
            >
              <User size={16} />
              <span className="text-xs sm:text-[14px] font-medium tracking-wide">
                Staff
              </span>
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 sm:gap-2 bg-[#2B3448] hover:bg-[#3A455A] text-[#E8C265] px-2.5 sm:px-5 py-2 rounded-lg border border-[#3C4A63] transition-all duration-300 shadow-md"
            >
              <ShieldCheck size={16} />
              <span className="text-xs sm:text-[14px] font-medium tracking-wide">
                Admin
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA - Account for 80px fixed header with pt-20 */}
      <main className="flex-grow pt-20 relative z-10 w-full flex flex-col">
        {/* Full Width Hero Section */}
        <section className="relative w-full h-[85vh] min-h-[600px] flex flex-col justify-center items-center bg-gray-900 overflow-hidden">
          {/* Animated Background Images */}
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                idx === currentImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={img}
                alt="Beautiful Honey Visuals"
                className={`w-full h-full ${
                  img.includes('suko')
                    ? 'object-contain object-center scale-[1.30] drop-shadow-2xl p-4'
                    : img.includes('logo')
                    ? 'object-contain object-center scale-[1.10] drop-shadow-2xl p-4'
                    : 'object-cover object-center'
                }`}
              />
              {/* Overlay gradient - optimized for readability (white text over dark gradient) */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#1e293b]/40 to-[#0F172A]/80 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}

          {/* Hero Content (Floating over Images) */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes appearDisappear {
              0%, 100% { opacity: 0; transform: translateY(5px); }
              50% { opacity: 1; transform: translateY(0); }
            }
            .animate-hero-text {
              animation: appearDisappear 3s ease-in-out infinite;
            }
          `}} />
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto h-full w-full">
            <div className="animate-hero-text flex flex-col items-center">
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-[#FDF9ED] to-[#E5B53D] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] mb-6 tracking-tight font-sans">
                Pure Rwandan Honey
              </h1>
              <p className="max-w-3xl text-xl md:text-[26px] leading-relaxed text-gray-200 font-medium mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                From Our Hives to Your Table. Natural, raw, traceable honey from
                the heart of Rwanda. Experience the purest sweetness nature has to
                offer.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link href="/shop" className="flex items-center justify-center gap-2 bg-[#2B3448] hover:bg-[#34415A] text-[#E8C265] px-6 py-2.5 rounded-lg border border-[#3C4A63] transition-all duration-300 shadow-md">
                  <span className="text-[14px] font-medium tracking-wide">
                    Shop Our Honey
                  </span>
                </Link>
                <Link href="/wholesale" className="flex items-center justify-center gap-2 bg-[#2B3448] hover:bg-[#34415A] text-[#E8C265] px-6 py-2.5 rounded-lg border border-[#3C4A63] transition-all duration-300 shadow-md">
                  <span className="text-[14px] font-medium tracking-wide">
                    Wholesale Inquiry
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust/Status Bar Anchored to Bottom of Hero */}
          <div className="absolute bottom-0 w-full h-[70px] bg-[#181D2D]/95 backdrop-blur-sm border-t border-[#3C4A63]/50 text-white flex items-center justify-between px-6 md:px-16 z-20">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#E5B53D]">
                <Award size={24} />
                <span className="font-bold text-lg tracking-wide uppercase">
                  Premium Quality
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-1 text-gray-400 text-sm font-medium">
                <Star size={16} fill="currentColor" className="text-[#E5B53D] opacity-90" />
                <Star size={16} fill="currentColor" className="text-[#E5B53D] opacity-90" />
                <Star size={16} fill="currentColor" className="text-[#E5B53D] opacity-90" />
                <Star size={16} fill="currentColor" className="text-[#E5B53D] opacity-90" />
                <Star size={16} fill="currentColor" className="text-[#E5B53D] opacity-90" />
                <span className="ml-3 text-gray-300 tracking-wide uppercase text-xs font-bold">Top Rated in Rwanda</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-8 text-[15px] font-medium text-gray-300">
              <div className="flex items-center gap-2">
                <Leaf size={18} className="text-[#4ADE80]" />
                <span className="tracking-wide hidden sm:inline">100% Natural</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#E5B53D]" />
                <span className="tracking-wide text-white">Harvested in Rwanda</span>
              </div>
            </div>
          </div>
        </section>

        {/* Following Section (Content under Hero) */}
        <section className="py-24 px-6 w-full z-10 bg-white rounded-t-[40px] mt-[-30px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative border-t border-[#E8C265]/30">
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-[40px]">
            {/* Background glowing orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[100px] mix-blend-multiply flex-shrink-0"></div>
            <div className="absolute top-[20%] right-1/4 w-[400px] h-[400px] bg-orange-50/50 rounded-full blur-[80px] mix-blend-multiply flex-shrink-0"></div>
            
            {/* Beautiful faint hex overlay */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.923' viewBox='0 0 60 103.923' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64l-30 17.32L0 51.96V17.32z' fill='none' stroke='%23000000' stroke-width='2' stroke-opacity='1'/%3E%3Cpath d='M30 103.923l30-17.32V51.96l-30-17.32L0 51.96v34.643z' fill='none' stroke='%23000000' stroke-width='2' stroke-opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: "60px",
              }}
            />
          </div>

          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
              <h4 className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm">Our Promise</h4>
              <h2 className="text-4xl md:text-5xl font-black text-[#181D2D] tracking-tight">
                Why Choose Drone Bee?
              </h2>
              <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full mt-4"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Card 1 */}
              <div className="group relative bg-[#FDFBF7] p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(229,181,61,0.15)] transition-all duration-500 hover:-translate-y-2 border border-amber-100/50 overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-8 -top-8 text-amber-500/5 group-hover:text-amber-500/10 transition-colors duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                  <Leaf size={160} strokeWidth={1} />
                </div>
                
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white group-hover:rotate-6 transition-transform duration-500">
                    <Leaf className="text-amber-600 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#181D2D] mb-4">
                    100% Organic
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    Sustainably harvested directly from wild blossoms without any
                    additives or artificial processing. Pure nature in every drop.
                  </p>
                </div>
                
                <div className="flex items-center text-amber-600 font-semibold cursor-pointer group/btn w-max">
                  <span className="group-hover/btn:underline underline-offset-4">Learn More</span>
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative bg-[#FDFBF7] p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(229,181,61,0.15)] transition-all duration-500 hover:-translate-y-2 border border-amber-100/50 overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-8 -top-8 text-amber-500/5 group-hover:text-amber-500/10 transition-colors duration-500 transform group-hover:-rotate-12 group-hover:scale-110">
                  <Globe2 size={160} strokeWidth={1} />
                </div>
                
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white group-hover:rotate-[-6deg] transition-transform duration-500">
                    <Globe2 className="text-amber-600 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#181D2D] mb-4">
                    Rwanda Grown
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    Supporting local farming communities and preserving the pristine
                    natural ecosystem of Rwanda&apos;s rich, diverse landscape.
                  </p>
                </div>
                
                <div className="flex items-center text-amber-600 font-semibold cursor-pointer group/btn w-max">
                  <span className="group-hover/btn:underline underline-offset-4">Learn More</span>
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-[#FDFBF7] p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(229,181,61,0.15)] transition-all duration-500 hover:-translate-y-2 border border-amber-100/50 overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-8 -top-8 text-amber-500/5 group-hover:text-amber-500/10 transition-colors duration-500 transform group-hover:rotate-12 group-hover:scale-110">
                  <ShieldCheck size={160} strokeWidth={1} />
                </div>
                
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white group-hover:rotate-6 transition-transform duration-500">
                    <ShieldCheck className="text-amber-600 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#181D2D] mb-4">
                    Traceable Supply
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    Every single jar is tracked from our rural hives straight to
                    your breakfast table, guaranteeing uncompromised authenticity.
                  </p>
                </div>
                
                <div className="flex items-center text-amber-600 font-semibold cursor-pointer group/btn w-max">
                  <span className="group-hover/btn:underline underline-offset-4">Learn More</span>
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#181D2D] text-gray-400 py-12 border-t border-[#2C3446] z-10 w-full relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center shrink-0 mr-3">
                <img src="/logo.png" alt="Drone Bee Logo" className="w-full h-full object-contain filter drop-shadow-md scale-[1.3]" />
              </div>
              <span className="font-serif text-xl font-bold text-white leading-none whitespace-nowrap">
                Drone Bee
              </span>
            </div>
            <p className="text-sm">
              Delivering the highest quality, natural honey from Rwanda to the
              world. Sustainably sourced, expertly handled.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#E8C265] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#E8C265] transition">
                  Shop Hub
                </Link>
              </li>
              <li>
                <Link
                  href="/wholesale"
                  className="hover:text-[#E8C265] transition"
                >
                  Wholesale
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#E8C265] transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Portals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/manager/login"
                  className="hover:text-[#E8C265] transition"
                >
                  Staff Login
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-[#E8C265] transition"
                >
                  Super Admin
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#E8C265] transition">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#2B3448] hover:bg-[#E8C265] hover:text-[#181D2D] flex items-center justify-center transition"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#2B3448] hover:bg-[#E8C265] hover:text-[#181D2D] flex items-center justify-center transition"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#2B3448] hover:bg-[#E8C265] hover:text-[#181D2D] flex items-center justify-center transition"
              >
                <Instagram size={18} />
              </a>
            </div>
            <div className="mt-4 text-sm flex flex-col space-y-2">
              <a href="mailto:jambopatrick456@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E8C265] transition block">jambopatrick456@gmail.com</a>
              <a href="tel:+250783314404" className="hover:text-[#E8C265] transition block">0783314404</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[#2C3446] text-sm flex flex-col md:flex-row justify-between items-center">
          <p>
            &copy; {new Date().getFullYear()} Drone Bee Ltd. All rights
            reserved.
          </p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
