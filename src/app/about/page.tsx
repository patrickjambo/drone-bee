import Link from "next/link";
import { User, ShieldCheck, HeartPulse, Recycle, Shield, Network } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#FDF9ED] flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-40 left-0 w-96 h-96 bg-amber-100/50 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-40 right-0 w-96 h-96 bg-orange-100/30 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>

      <header className="fixed top-0 left-0 right-0 bg-[#181D2D] text-white w-full border-b border-[#2C3446] shadow-xl z-50 transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="w-16 h-16 flex items-center justify-center shrink-0 mr-3">
              <img src="/logo.png" alt="Drone Bee Logo" className="w-full h-full object-contain filter drop-shadow-xl scale-[1.3]" />
            </div>
            <span className="font-serif text-[28px] font-semibold tracking-wide text-[#E8C265] leading-none whitespace-nowrap">
              Drone Bee
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">Home</Link>
            <Link href="/shop" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">Shop Hub</Link>
            <Link href="/wholesale" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">Wholesale</Link>
            <Link href="/about" className="text-[#E8C265] font-medium tracking-wide transition-colors border-b-2 border-[#E8C265] py-1">About Us</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/manager/login" className="hidden sm:flex items-center gap-2 bg-[#2B3448] hover:bg-[#34415A] text-[#E8C265] px-5 py-2 rounded-lg border border-[#3C4A63] transition-all">
              <User size={16} />
              <span className="text-[14px] font-medium tracking-wide">Staff Portal</span>
            </Link>
            <Link href="/admin/login" className="flex items-center gap-2 bg-[#2B3448] hover:bg-[#3A455A] text-[#E8C265] px-5 py-2 rounded-lg border border-[#3C4A63] transition-all">
              <ShieldCheck size={16} />
              <span className="text-[14px] font-medium tracking-wide">Admin Access</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-24 px-6 sm:px-12 max-w-[1200px] mx-auto w-full flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-16 max-w-3xl">
          <h4 className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm mb-4">Our Heritage</h4>
          <h1 className="text-5xl md:text-7xl font-serif text-[#181D2D] mb-6 tracking-wide">The Drone Bee Story</h1>
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            Bridging traditional beekeeping artistry with modern global distribution, we bring the heart of Rwanda&apos;s nature directly to your family.
          </p>
        </div>
        
        {/* Featured Image & Mission Statement Split */}
        <div className="w-full flex flex-col lg:flex-row gap-12 items-center mb-24 relative">
          <div className="absolute inset-0 bg-[#E8C265]/10 rounded-[3rem] transform -rotate-2 -z-10 w-full h-[110%] lg:w-[110%] lg:h-full lg:-left-[5%] shadow-xl"></div>
          <div className="w-full lg:w-1/2 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
            <img src="https://images.unsplash.com/photo-1471943311424-646960669fbc?w=1200&q=80" alt="Beekeeper in Rwanda" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181D2D]/80 via-transparent to-transparent"></div>
          </div>
          <div className="w-full lg:w-1/2 space-y-6 lg:pr-8">
            <h2 className="text-4xl font-serif text-[#181D2D] font-bold">Nature&apos;s Purest Gold</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Founded in the beautiful rolling hills of Rwanda, <strong>Drone Bee</strong> is dedicated to bringing the purest, most natural honey from our local communities straight to your table.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Every jar is strictly untouched by artificial processes, ensuring maximum nutritional benefit and robust, authentic flavor that respects the ecosystems it stems from.
            </p>
          </div>
        </div>

        {/* Our Pillars Cards */}
        <div className="w-full mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-[#181D2D] font-bold mb-4">Our Core Pillars</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-400 to-[#E8C265] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Uncompromised Quality", desc: "No pasteurization, no hidden syrups. Just 100% genuine honeycomb extract." },
              { icon: Recycle, title: "Sustainable Harvesting", desc: "We protect vital bee populations using eco-friendly, non-invasive extraction." },
              { icon: Network, title: "Community Driven", desc: "Empowering local Rwandan beekeepers through fair-trade micro-economies." }
            ].map((pillar, i) => (
              <div key={i} className="bg-white p-10 rounded-[2rem] shadow-[0_10px_30px_rgba(229,181,61,0.08)] border border-amber-100 hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <pillar.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#181D2D] mb-4">{pillar.title}</h3>
                <p className="text-gray-600 leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats */}
        <div className="w-full bg-[#181D2D] rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=1200&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-700">
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <span className="text-5xl md:text-6xl font-black text-[#E8C265] tracking-tighter mb-2">500+</span>
              <span className="text-gray-300 font-medium uppercase tracking-widest text-sm">Local Beekeepers</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <span className="text-5xl md:text-6xl font-black text-[#E8C265] tracking-tighter mb-2">100%</span>
              <span className="text-gray-300 font-medium uppercase tracking-widest text-sm">Organic Processing</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
              <span className="text-5xl md:text-6xl font-black text-[#E8C265] tracking-tighter mb-2">15k</span>
              <span className="text-gray-300 font-medium uppercase tracking-widest text-sm">Jars Shipped</span>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}