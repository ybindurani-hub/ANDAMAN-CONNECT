import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../types';
import { Trash2, Edit2, Package, Zap } from 'lucide-react';
import { ref, deleteObject } from 'firebase/storage';
import { Link } from 'react-router-dom';

const MyProducts: React.FC = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!currentUser) return;
      
      const q = query(
        collection(db, 'products'),
        where('owner', '==', currentUser.uid)
      );

      try {
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Product[];
        setProducts(data);
      } catch (error) {
        console.error("Error fetching my products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [currentUser]);

  const handleDelete = async (productId: string, imageUrls: string[]) => {
      if(!window.confirm("Are you sure you want to delete this ad?")) return;

      try {
          // Delete from Firestore
          await deleteDoc(doc(db, 'products', productId));
          
          setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
          console.error("Error deleting product", error);
          alert("Failed to delete product.");
      }
  };

  const handleBoost = async (product: Product) => {
    if (!currentUser) return;

    const options = {
        key: "rzp_test_PlaceHolderKey", // TODO: Replace with your actual Razorpay Test Key ID
        amount: 4900, // Amount in paise (4900 = ₹49)
        currency: "INR",
        name: "Andaman Connect",
        description: `Boost Ad: ${product.title}`,
        image: "https://your-logo-url.com/logo.png", // Optional
        handler: async function (response: any) {
            // Payment Success Handler
            try {
                // In a real app, verify signature on backend here.
                // For this frontend-only demo, we proceed to update Firestore directly.
                
                // Calculate expiry (7 days from now)
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);

                const productRef = doc(db, 'products', product.id!);
                await updateDoc(productRef, {
                    isBoosted: true,
                    boostedUntil: Timestamp.fromDate(expiryDate)
                });

                // Update local state to reflect change immediately
                setProducts(products.map(p => 
                    p.id === product.id 
                    ? { ...p, isBoosted: true, boostedUntil: Timestamp.fromDate(expiryDate) } 
                    : p
                ));

                alert(`Success! Payment ID: ${response.razorpay_payment_id}. Your ad is now boosted for 7 days.`);

            } catch (error) {
                console.error("Error updating boost status:", error);
                alert("Payment successful but failed to update ad status. Please contact support.");
            }
        },
        prefill: {
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            contact: ""
        },
        theme: {
            color: "#0d9488" // Teal-600 to match app theme
        }
    };

    // Check if Razorpay script loaded
    if ((window as any).Razorpay) {
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
    } else {
        alert("Razorpay SDK not loaded. Check internet connection.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  if (loading) return <div className="p-20 text-center">Loading your ads...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">My Ads</h1>
      
      {products.length === 0 ? (
          <div className="text-center bg-white p-12 rounded border border-gray-200">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">You haven't listed anything yet.</p>
              <Link to="/add-product" className="inline-block bg-teal-500 text-white font-bold py-2 px-6 rounded hover:bg-teal-600 transition">
                  Start Selling
              </Link>
          </div>
      ) : (
          <div className="space-y-4">
              {products.map(product => (
                  <div key={product.id} className={`bg-white border rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition ${product.isBoosted ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-200'}`}>
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 rounded overflow-hidden relative">
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          {product.isBoosted && (
                              <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-slate-900 text-[10px] font-bold text-center py-1">
                                  FEATURED
                              </div>
                          )}
                      </div>
                      
                      <div className="flex-grow">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{product.title}</h3>
                          <div className="text-xl font-bold text-slate-900 mb-2">{formatPrice(product.price)}</div>
                          <div className="flex items-center gap-2">
                             <div className="text-sm text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded">
                                 {product.category}
                             </div>
                             {product.isBoosted && (
                                 <span className="text-xs text-yellow-600 font-semibold flex items-center">
                                     <Zap className="w-3 h-3 mr-1 fill-yellow-500" />
                                     Boosted
                                 </span>
                             )}
                          </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                          <Link to={`/product/${product.id}`} className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded text-sm font-medium transition">
                             View
                          </Link>
                          
                          {!product.isBoosted ? (
                              <button 
                                onClick={() => handleBoost(product)}
                                className="flex items-center justify-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded text-sm font-bold transition shadow-sm"
                              >
                                <Zap className="w-4 h-4 mr-1" /> Boost ₹49
                              </button>
                          ) : (
                              <div className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded text-sm font-medium border border-green-200">
                                  Active
                              </div>
                          )}

                          <button 
                             onClick={() => handleDelete(product.id!, product.images)}
                             className="flex items-center justify-center px-4 py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded text-sm font-medium transition"
                          >
                             <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default MyProducts;