import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, UserProfile, Category } from '../types';
import { User, MapPin, Calendar, ChevronLeft, ChevronRight, Share2, Heart } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [seller, setSeller] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data() as Product;
          setProduct({ id: docSnap.id, ...productData });
          
          // Fetch seller info
          if (productData.owner) {
             const userRef = doc(db, 'users', productData.owner);
             const userSnap = await getDoc(userRef);
             if (userSnap.exists()) {
                 setSeller(userSnap.data() as UserProfile);
             }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div></div>;
  if (!product) return <div className="text-center p-20">Product not found.</div>;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (timestamp: any) => {
    if(!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderSpecificDetails = () => {
    if (product.category === Category.Cars) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-4">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    {product.year && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Year</span><span className="font-semibold text-slate-800">{product.year}</span></div>}
                    {product.kmDriven !== undefined && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">KM Driven</span><span className="font-semibold text-slate-800">{product.kmDriven} km</span></div>}
                    {product.fuelType && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Fuel Type</span><span className="font-semibold text-slate-800">{product.fuelType}</span></div>}
                    {product.transmission && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Transmission</span><span className="font-semibold text-slate-800">{product.transmission}</span></div>}
                </div>
            </div>
        );
    }
    if (product.category === Category.Properties) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-4">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Details</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    {product.propertyType && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Type</span><span className="font-semibold text-slate-800">{product.propertyType}</span></div>}
                    {product.bedrooms !== undefined && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Bedrooms</span><span className="font-semibold text-slate-800">{product.bedrooms}</span></div>}
                    {product.bathrooms !== undefined && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Bathrooms</span><span className="font-semibold text-slate-800">{product.bathrooms}</span></div>}
                    {product.furnished && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Furnished</span><span className="font-semibold text-slate-800">{product.furnished}</span></div>}
                    {product.area !== undefined && <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Area</span><span className="font-semibold text-slate-800">{product.area} sq ft</span></div>}
                </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-4 flex items-center">
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Home</span> 
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline">{product.category}</span>
          <span className="mx-2">/</span>
          <span className="truncate max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images and Description */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Image Slider */}
          <div className="bg-black rounded-lg overflow-hidden relative aspect-video flex items-center justify-center group">
            <img
              src={product.images[activeImageIndex]}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
            />
            
            {product.images.length > 1 && (
                <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {product.images.map((_, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full ${idx === activeImageIndex ? 'bg-teal-500' : 'bg-white/50'}`}></div>
                        ))}
                    </div>
                </>
            )}
          </div>
            
          {/* Category Specific Details Table */}
          {renderSpecificDetails()}

          {/* Details Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
          </div>
        </div>

        {/* Right Column: Price and Seller */}
        <div className="space-y-4">
          
          {/* Price Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{formatPrice(product.price)}</h1>
                <div className="flex space-x-3">
                    <Share2 className="w-6 h-6 text-gray-400 cursor-pointer hover:text-slate-900" />
                    <Heart className="w-6 h-6 text-gray-400 cursor-pointer hover:text-red-500" />
                </div>
            </div>
            <p className="text-gray-600 mb-4">{product.title}</p>
            
            <div className="flex justify-between items-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>Location (Approx)</span>
                </div>
                <div className="flex items-center">
                     <Calendar className="w-3 h-3 mr-1" />
                     <span>{formatDate(product.createdAt)}</span>
                </div>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-6">
                <img 
                    src={seller?.profileImage || "https://picsum.photos/60/60"} 
                    alt="Seller" 
                    className="w-16 h-16 rounded-full object-cover mr-4 border border-gray-200"
                />
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{seller?.name || 'User'}</h3>
                    <p className="text-xs text-gray-500">Member since {new Date().getFullYear()}</p>
                </div>
                <div className="ml-auto">
                    <ChevronRight className="text-gray-400" />
                </div>
            </div>
            
            <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded border border-teal-600 mb-3 transition">
                Chat with Seller
            </button>
            <div className="text-center text-xs text-gray-500">
               Safety Tips: Do not pay in advance.
            </div>
          </div>

          {/* Map (Placeholder) */}
           <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="font-bold mb-2">Posted in</h3>
              <div className="bg-gray-200 h-32 w-full rounded flex items-center justify-center text-gray-500 text-sm">
                  Map Preview
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;