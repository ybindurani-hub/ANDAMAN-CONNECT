import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // We fetch by date DESC first
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        // Perform Client-Side sorting to handle "isBoosted" priority
        // This avoids complex Firestore composite indexes for this demo
        const sortedProducts = productsData.sort((a, b) => {
            // If 'a' is boosted and 'b' is not, 'a' comes first (-1)
            if (a.isBoosted === true && b.isBoosted !== true) return -1;
            // If 'b' is boosted and 'a' is not, 'b' comes first (1)
            if (a.isBoosted !== true && b.isBoosted === true) return 1;
            // Otherwise maintain date order (already sorted by query, but good to be explicit if needed)
            return 0; 
        });

        setProducts(sortedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Category Bar */}
      <div className="bg-white shadow-sm mb-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-3 flex space-x-6 whitespace-nowrap">
            <button
                onClick={() => setSelectedCategory('All')}
                className={`text-sm font-semibold transition-colors ${selectedCategory === 'All' ? 'text-teal-600' : 'text-slate-700 hover:text-teal-600'}`}
            >
                ALL CATEGORIES
            </button>
            {Object.values(Category).map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-sm transition-colors ${selectedCategory === cat ? 'text-teal-600 font-bold' : 'text-slate-600 hover:text-teal-600'}`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="mb-8 rounded-lg overflow-hidden relative bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 md:p-12 shadow-lg">
            <div className="relative z-10 max-w-xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-4">Sell it. Buy it. Love it.</h1>
                <p className="text-lg text-gray-300 mb-6">Discover amazing deals on pre-owned items nearby.</p>
                <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full transition shadow-lg">
                    Start Exploring
                </button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500 opacity-10 skew-x-12 transform origin-bottom-left"></div>
        </div>

        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-slate-800">Fresh recommendations</h2>
            {filteredProducts.length > 0 && <span className="text-sm text-blue-600 font-bold cursor-pointer hover:underline flex items-center">View more <ChevronRight className="w-4 h-4" /></span>}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[...Array(8)].map((_, i) => (
                 <div key={i} className="bg-white rounded-md h-64 animate-pulse border border-gray-200">
                     <div className="h-2/3 bg-gray-200"></div>
                     <div className="p-3 space-y-2">
                         <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                         <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                     </div>
                 </div>
             ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-2 text-6xl">🔍</div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500">Try changing the category or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;