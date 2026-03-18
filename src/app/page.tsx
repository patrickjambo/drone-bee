import Link from 'next/link';

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 6.1 Navigation Bar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-amber-600 font-bold text-2xl tracking-tight">Drone Bee</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-900 font-medium hover:text-amber-600">Home</Link>
            <Link href="/honey" className="text-gray-500 font-medium hover:text-amber-600">Our Honey</Link>
            <Link href="/about" className="text-gray-500 font-medium hover:text-amber-600">About Us</Link>
            <Link href="/contact" className="text-gray-500 font-medium hover:text-amber-600">Contact</Link>
          </div>
          <div className="flex items-center">
            {/* The SRS requests a modal, but for phase 1 we'll provide a direct clean dropdown or link flow */}
            <div className="relative group">
              <button className="bg-amber-100 text-amber-800 px-4 py-2 rounded-md font-medium hover:bg-amber-200 transition">
                Staff Login
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-10">
                <Link href="/admin/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded-t-md border-b">
                  Admin Login
                </Link>
                <Link href="/manager/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 rounded-b-md">
                  Manager Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 6.2 Hero Section */}
      <main className="flex-grow">
        <div className="bg-amber-600 min-h-[60vh] flex items-center justify-center relative overflow-hidden">
          {/* Fallback pattern / image overlay would go here */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1587049352847-ecb8dc570656?q=80&w=2070')] bg-cover bg-center mix-blend-multiply"></div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Welcome to Drone Bee Ltd Company
            </h1>
            <p className="text-xl md:text-3xl text-amber-100 font-medium drop-shadow-sm">
              Pure Honey. Natural Goodness. Every Jar.
            </p>
            <div className="pt-8">
              <Link href="/honey" className="bg-white text-amber-700 hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg transition shadow-lg inline-block">
                Explore Our Honey
              </Link>
            </div>
          </div>
        </div>

        {/* 6.3 Features / Quick Intro */}
        <div className="bg-gray-50 py-20 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-12">
            <h2 className="text-3xl font-bold text-gray-900 border-b-4 border-amber-500 inline-block pb-2">From Our Hives to Your Home</h2>
            <p className="max-w-2xl mx-auto text-gray-600 text-lg">
              We manage premium honey production from extraction to packaging. Browse our catalog of fresh, organic batches directly harvested from Rwanda's finest floral regions.
            </p>
            
            {/* Note: In Phase 2, we will pull active products from the DB and render the real Catalog Grid here */}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 text-center text-sm">
        <p>© {new Date().getFullYear()} Drone Bee Ltd Company, Rwanda. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
