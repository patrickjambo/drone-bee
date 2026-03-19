"use client";

import Link from "next/link";
import { User, ShieldCheck, CheckCircle2, ChevronRight, Building, Package, Truck, Target } from "lucide-react";
import { useState } from "react";

export default function Wholesale() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    email: "",
    phone: "",
    volume: "50 - 200 kg",
    info: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/public/wholesale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="min-h-screen bg-[#FDF9ED] flex flex-col font-sans relative">
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
            <Link href="/wholesale" className="text-[#E8C265] font-medium tracking-wide transition-colors border-b-2 border-[#E8C265] py-1">Wholesale</Link>
            <Link href="/about" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">About Us</Link>
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

      <main className="flex-grow pt-32 pb-24 px-6 sm:px-12 max-w-[1200px] mx-auto w-full">
        {/* Header content */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h4 className="text-amber-500 font-bold uppercase tracking-[0.2em] text-sm mb-4">Enterprise Partners</h4>
          <h1 className="text-5xl md:text-6xl font-serif text-[#181D2D] mb-6 tracking-wide">Wholesale Supply</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Partner with Drone Bee to supply your restaurants, premium retailers, or manufacturing lines with pristine, unadulterated Rwandan honey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Info Side */}
          <div className="lg:col-span-2 space-y-8 mt-4">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-amber-100/50">
              <h3 className="text-2xl font-bold text-[#181D2D] mb-6">Why Partner With Us?</h3>
              <ul className="space-y-6">
                {[
                  { icon: Target, title: "Unmatched Purity", desc: "100% natural, tested and certified raw." },
                  { icon: Building, title: "Scalable Volumes", desc: "Reliable supply chain from 10kg to 5000+ tons." },
                  { icon: Truck, title: "Global Logistics", desc: "Seamless export and localized delivery network." },
                  { icon: Package, title: "Custom Packaging", desc: "Available in drums, IBCs, or branded retail jars." }
                ].map((feature, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#181D2D]">{feature.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(229,181,61,0.08)] w-full p-10 md:p-14 border border-amber-100/50 relative overflow-hidden">
              
              {/* Background accent */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-100 rounded-full blur-[80px] opacity-60"></div>
              
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-20 text-center relative z-10 animate-in fade-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-4xl font-serif text-[#181D2D] mb-4">Request Received!</h3>
                  <p className="text-lg text-gray-600 max-w-md mb-8">
                    Thank you for your interest. Our wholesale team will review your requirements and contact you within 24 hours to discuss pricing and logistics.
                  </p>
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-amber-600 font-bold hover:text-amber-700 flex items-center gap-2 group transition-colors"
                  >
                    Submit another request
                    <ChevronRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-[#181D2D] mb-2">Company Name</label>
                      <input required name="company" value={formData.company} onChange={handleChange} type="text" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" placeholder="Your Business Ltd." />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#181D2D] mb-2">Contact Person</label>
                      <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#181D2D] mb-2">Email Address</label>
                      <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" placeholder="contact@business.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#181D2D] mb-2">Phone Number</label>
                      <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all" placeholder="+250 788 123 456" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-[#181D2D] mb-2">Estimated Volume (kg per month)</label>
                    <select name="volume" value={formData.volume} onChange={handleChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all appearance-none cursor-pointer">
                      <option>10 - 50 kg</option>
                      <option>50 - 200 kg</option>
                      <option>200 - 500 kg</option>
                      <option>500+ kg</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#181D2D] mb-2">Additional Information & Requirements</label>
                    <textarea name="info" value={formData.info} onChange={handleChange} rows={4} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none" placeholder="Tell us about your logistics needs, custom packaging requests, etc..."></textarea>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit" 
                    className="w-full relative overflow-hidden group bg-[#181D2D] hover:bg-[#2C3446] text-[#E8C265] font-bold text-lg py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#E8C265]/10 to-transparent transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-[#E8C265] border-t-transparent rounded-full animate-spin"></div>
                          Processing Request...
                        </>
                      ) : (
                        "Request Wholesale Quote"
                      )}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}