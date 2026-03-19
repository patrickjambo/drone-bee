"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  User,
  Facebook,
  Twitter,
  Instagram,
  ShieldCheck,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Navigation
} from "lucide-react";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTracking(true);
    
    // Simulate API call and tracking result
    setTimeout(() => {
      setIsTracking(false);
      setTrackingResult({
        orderId: orderId || "#DB-78421",
        status: "In Transit",
        estimatedDelivery: "Tomorrow by 5:00 PM",
        steps: [
          { label: "Order Placed", date: "Oct 12, 10:30 AM", completed: true, icon: Package },
          { label: "Processing in Warehouse", date: "Oct 12, 02:15 PM", completed: true, icon: Clock },
          { label: "Shipped", date: "Oct 13, 08:45 AM", completed: true, icon: Truck },
          { label: "Out for Delivery", date: "Oct 14, 07:20 AM", completed: false, icon: Navigation },
          { label: "Delivered", date: "Pending", completed: false, icon: CheckCircle2 }
        ]
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDF9ED] flex flex-col font-sans overflow-x-hidden relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-20 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='103.923' viewBox='0 0 60 103.923' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64l-30 17.32L0 51.96V17.32z' fill='none' stroke='%23d4af37' stroke-width='1' stroke-opacity='0.4'/%3E%3Cpath d='M30 103.923l30-17.32V51.96l-30-17.32L0 51.96v34.643z' fill='none' stroke='%23d4af37' stroke-width='1' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "120px",
        }}
      />

      <header className="fixed top-0 left-0 right-0 bg-[#181D2D] text-white w-full border-b border-[#2C3446] shadow-xl z-50 transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 mr-2 sm:mr-3">
              <img src="/logo.png" alt="Drone Bee Logo" className="w-full h-full object-contain filter drop-shadow-xl scale-[1.3]" />
            </div>
            <span className="font-serif text-xl sm:text-[28px] font-semibold tracking-wide text-[#E8C265] leading-none whitespace-nowrap">
              Drone Bee
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">Home</Link>
            <Link href="/shop" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">Shop Hub</Link>
            <Link href="/wholesale" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">Wholesale</Link>
            <Link href="/about" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">About Us</Link>
            <Link href="/track" className="text-[#E8C265] font-bold tracking-wide transition-colors border-b-2 border-[#E8C265] pb-1">Track</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/manager/login" className="flex items-center gap-1.5 sm:gap-2 bg-[#2B3448] hover:bg-[#34415A] text-[#E8C265] px-2.5 sm:px-5 py-2 rounded-lg border border-[#3C4A63] transition-all duration-300 shadow-md">
              <User size={16} />
              <span className="text-xs sm:text-[14px] font-medium tracking-wide">Staff</span>
            </Link>
            <Link href="/admin/login" className="flex items-center gap-1.5 sm:gap-2 bg-[#2B3448] hover:bg-[#3A455A] text-[#E8C265] px-2.5 sm:px-5 py-2 rounded-lg border border-[#3C4A63] transition-all duration-300 shadow-md">
              <ShieldCheck size={16} />
              <span className="text-xs sm:text-[14px] font-medium tracking-wide">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20 relative z-10 w-full flex flex-col items-center justify-center px-4">
        
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-amber-100">
          <div className="bg-[#181D2D] p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8C265]/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#E8C265]/10 rounded-full blur-3xl transform -translate-x-10 translate-y-10"></div>
            
            <MapPin className="w-12 h-12 text-[#E8C265] mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-3">Track Your Order</h1>
            <p className="text-gray-400 text-lg max-w-lg mx-auto">Enter your order ID and email to see the real-time status of your sweet delivery.</p>
          </div>

          <div className="p-8 sm:p-10">
            {!trackingResult ? (
              <form onSubmit={handleTrack} className="space-y-6 max-w-xl mx-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Order ID</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      required
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. #DB-10042" 
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-lg" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="email" 
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter the email used for order" 
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-lg" 
                    />
                  </div>
                </div>

                <button 
                  disabled={isTracking}
                  className="w-full mt-4 bg-[#181D2D] hover:bg-[#2C3446] text-[#E8C265] py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {isTracking ? (
                    <div className="w-6 h-6 border-2 border-[#E8C265] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search size={22} />
                      <span>Track Order</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order {trackingResult.orderId}</h3>
                    <p className="text-sm text-gray-500 mt-1">Via Premium Shipment</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-bold mb-1">
                      {trackingResult.status}
                    </span>
                    <p className="text-sm font-medium text-gray-900">Est. {trackingResult.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-6 top-4 bottom-8 w-0.5 bg-gray-200"></div>
                  <div className="space-y-8">
                    {trackingResult.steps.map((step: any, idx: number) => {
                      const Icon = step.icon;
                      return (
                        <div key={idx} className={`relative flex items-center gap-6 ${step.completed ? 'opacity-100' : 'opacity-40'}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shrink-0 ${step.completed ? 'bg-amber-400 text-amber-950 shadow-md' : 'bg-gray-100 text-gray-400 border-2 border-white'}`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</h4>
                            <p className="text-sm text-gray-500">{step.date}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => setTrackingResult(null)}
                  className="mt-10 px-6 py-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium transition-colors w-full border border-gray-200"
                >
                  Track Another Order
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-[#181D2D] text-gray-400 py-12 border-t border-[#2C3446] z-10 w-full relative mt-auto">
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
              Delivering the highest quality, natural honey from Rwanda to the world. Sustainably sourced, expertly handled.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-[#E8C265] transition">Home</Link></li>
              <li><Link href="/shop" className="hover:text-[#E8C265] transition">Shop Hub</Link></li>
              <li><Link href="/wholesale" className="hover:text-[#E8C265] transition">Wholesale</Link></li>
              <li><Link href="/about" className="hover:text-[#E8C265] transition">About Us</Link></li>
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
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#2B3448] hover:bg-[#E8C265] hover:text-[#181D2D] flex items-center justify-center transition"><Facebook size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#2B3448] hover:bg-[#E8C265] hover:text-[#181D2D] flex items-center justify-center transition"><Twitter size={18} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#2B3448] hover:bg-[#E8C265] hover:text-[#181D2D] flex items-center justify-center transition"><Instagram size={18} /></a>
            </div>
            <div className="mt-4 text-sm flex flex-col space-y-2">
              <a href="mailto:jambopatrick456@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E8C265] transition block">jambopatrick456@gmail.com</a>
              <a href="tel:+250783314404" className="hover:text-[#E8C265] transition block">0783314404</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-[#2C3446] text-sm flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Drone Bee Ltd. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
