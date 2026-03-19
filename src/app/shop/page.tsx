"use client";

import Link from "next/link";
import { User, ShieldCheck, ShoppingCart, CheckCircle, Search, Star } from "lucide-react";
import { useState } from "react";

const products = [
  { id: 1, name: "Premium Raw Honey", price: 24.99, rating: 5, reviews: 128, type: "Raw", image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&q=80" },
  { id: 2, name: "Acacia Honey", price: 29.99, rating: 5, reviews: 84, type: "Organic", image: "https://images.unsplash.com/photo-1471943311424-646960669fbc?w=800&q=80" },
  { id: 3, name: "Wildflower Drone Blend", price: 19.99, rating: 4, reviews: 256, type: "Blend", image: "https://images.unsplash.com/photo-1536788567643-8c2368376526?w=800&q=80" },
  { id: 4, name: "Forest Honey Comb", price: 34.99, rating: 5, reviews: 92, type: "Comb", image: "https://images.unsplash.com/photo-1587049352847-81a56d773c1c?w=800&q=80" },
  { id: 5, name: "Eucalyptus Honey", price: 27.99, rating: 4, reviews: 45, type: "Organic", image: "https://images.unsplash.com/photo-1628795000572-181156e50912?w=800&q=80" },
  { id: 6, name: "Mountain Dark Honey", price: 31.99, rating: 5, reviews: 112, type: "Raw", image: "https://images.unsplash.com/photo-1587049352858-8d4e89133924?w=800&q=80" },
];

export default function ShopHub() {
  const [cartCount, setCartCount] = useState(0);
  const [addedItems, setAddedItems] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<{product: any, qty: number}[]>([]);
  const [toast, setToast] = useState<{show: boolean, message: string}>({ show: false, message: "" });
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    // Show success toast
    setToast({ show: true, message: "Order placed successfully! Redirecting..." });
    setIsCartOpen(false);
    
    // Clear cart and reset state after a short delay
    setTimeout(() => {
      setCartItems([]);
      setCartCount(0);
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const handleAddToCart = (product: any) => {
    setCartCount(prev => prev + 1);
    setAddedItems(prev => [...prev, product.id]);
    
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? {...item, qty: item.qty + 1} : item);
      }
      return [...prev, {product, qty: 1}];
    });

    // Show toast
    setToast({ show: true, message: `${product.name} added to cart!` });
    
    // Reset button and toast after delay
    setTimeout(() => {
      setAddedItems(prev => prev.filter(itemId => itemId !== product.id));
    }, 2000);
    
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const filteredProducts = products.filter(product => {
    const matchesFilter = filter === "All" || product.type === filter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDF9ED] flex flex-col font-sans relative pb-20">
      {/* Toast Notification */}
      <div className={`fixed top-24 right-6 z-[100] bg-[#181D2D] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100 visible' : '-translate-y-4 opacity-0 invisible'}`}>
        <CheckCircle className="text-[#4ADE80]" size={20} />
        <span className="font-medium tracking-wide">{toast.message}</span>
      </div>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-[120] shadow-2xl transform transition-transform duration-300 flex flex-col ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#181D2D] text-white">
          <h2 className="text-xl font-serif font-bold text-[#E8C265]">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-300 hover:text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-gray-400">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mt-2">Looks like you haven't added any honey yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{item.product.name}</h4>
                    <p className="text-gray-500 text-xs">${item.product.price} x {item.qty}</p>
                  </div>
                  <div className="font-black text-[#D7A336]">
                    ${(item.product.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="font-black text-xl text-gray-800">
                    ${cartItems.reduce((acc, item) => acc + (item.product.price * item.qty), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={handleCheckout}
              className="w-full py-4 rounded-xl font-bold bg-[#181D2D] hover:bg-[#2C3446] text-[#E8C265] shadow-lg hover:shadow-xl transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      <header className="fixed top-0 left-0 right-0 bg-[#181D2D] text-white w-full border-b border-[#2C3446] shadow-xl z-50 transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 flex justify-between items-center relative">
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
            <Link href="/shop" className="text-[#E8C265] font-medium tracking-wide transition-colors border-b-2 border-[#E8C265] py-1">Shop Hub</Link>
            <Link href="/wholesale" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">Wholesale</Link>
            <Link href="/about" className="text-gray-300 hover:text-[#E8C265] font-medium tracking-wide transition-colors">About Us</Link>
          </div>

          <div className="flex items-center gap-4">
            <div 
              onClick={() => setIsCartOpen(true)}
              className="relative mr-4 cursor-pointer p-2 text-gray-300 hover:text-[#E8C265] transition-colors rounded-full hover:bg-white/5"
            >
              <ShoppingCart size={22} className="relative z-10" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#E8C265] text-[#181D2D] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1 shadow-md">
                  {cartCount}
                </span>
              )}
            </div>
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
      
      <main className="flex-grow pt-32 pb-20 px-6 sm:px-12 max-w-[1400px] mx-auto w-full flex flex-col items-center justify-center">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-serif text-[#181D2D] mb-6 tracking-wide text-center">Shop Hub</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our premium selection of natural Rwandan honey. Sourced sustainably for the highest quality and purest taste.
          </p>
        </div>
        
        {/* Filters/Search Mockup */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-12 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search our premium honey..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#E8C265] focus:bg-white outline-none transition-all" 
            />
          </div>
          <div className="flex gap-2">
            {["All", "Raw", "Organic", "Comb"].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${filter === f ? 'bg-[#181D2D] text-[#E8C265] shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <Search size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">No products found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
              <button onClick={() => { setFilter('All'); setSearchQuery(''); }} className="mt-6 text-[#181D2D] font-medium border-b border-[#181D2D]">Clear all filters</button>
            </div>
          ) : filteredProducts.map(product => {
            const isAdded = addedItems.includes(product.id);
            return (
              <div key={product.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-[0_20px_40px_rgba(229,181,61,0.15)] transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col transform hover:-translate-y-2">
                <div className="relative h-[280px] overflow-hidden bg-gray-100">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#181D2D] shadow-sm">
                    {product.type}
                  </div>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-[#181D2D] font-serif leading-tight">{product.name}</h3>
                    <span className="text-2xl font-black text-[#D7A336] tracking-tight">${product.price}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-[#E5B53D]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < product.rating ? "currentColor" : "none"} className={i >= product.rating ? "text-gray-300" : ""} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400 font-medium">({product.reviews} reviews)</span>
                  </div>
                  
                  <p className="text-gray-600 mb-8 text-sm leading-relaxed flex-grow">
                    Rich, natural nectar straight from the hive. Untreated, unfiltered, and exquisitely delicious down to the last drop.
                  </p>
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                      isAdded 
                        ? 'bg-[#4ADE80] text-black shadow-[0_4px_15px_rgba(74,222,128,0.4)] transform scale-[0.98]' 
                        : 'bg-[#181D2D] hover:bg-[#2C3446] text-[#E8C265] shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle size={20} />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}