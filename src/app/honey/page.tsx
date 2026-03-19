import Link from 'next/link';
import prisma from '@/lib/prisma';

// Simple server component to fetch products for public viewing
async function getPublicProducts() {
  const products = await prisma.product.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' }
  });
  return products;
}

export default async function PublicHoneyCatalog() {
  let products: any[] = [];
  try {
    products = await getPublicProducts();
  } catch (error) {
    // Handling error silently for public catalog 
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="text-amber-600 font-bold text-2xl tracking-tight">Drone Bee</Link>
          <div className="flex space-x-8">
            <Link href="/" className="text-gray-500 hover:text-amber-600 font-medium">Home</Link>
            <span className="text-amber-600 font-bold">Our Honey</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-sm mb-4">Our Honey Collection</h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">Browse our pure, organic honey harvested with care.</p>
        </div>

        {/* 6.4 Product Catalog (Public) - NO PRICES SHOWN PUBLICLY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-amber-200 flex items-center justify-center relative">
                 {/* Placeholder for real images */}
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587049352847-ecb8dc570656?q=80&w=2070')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                 <span className="relative z-10 text-amber-800 font-bold px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm">Pure {product.honey_type}</span>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-900 border-b border-amber-100 pb-3 mb-3">{product.name}</h3>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <p><span className="font-semibold text-gray-800">Origin:</span> {product.origin || 'Rwanda'}</p>
                  <p><span className="font-semibold text-gray-800">Type:</span> {product.honey_type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center text-gray-500 bg-white py-12 rounded-xl shadow-sm">
            <p>Our catalog is currently being updated. Please check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
