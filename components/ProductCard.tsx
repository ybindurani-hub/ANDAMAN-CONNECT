import React from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (timestamp: any) => {
      if(!timestamp) return 'Just now';
      // Handle both Firestore Timestamp and regular Date objects
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderSubtitle = () => {
    if (product.category === Category.Cars && product.year) {
        return (
            <div className="text-xs text-gray-500 mb-1">
                {product.year} {product.kmDriven ? ` - ${product.kmDriven} km` : ''}
            </div>
        );
    }
    if (product.category === Category.Properties && product.propertyType) {
         return (
             <div className="text-xs text-gray-500 mb-1">
                 {product.propertyType} {product.bedrooms ? ` - ${product.bedrooms} BHK` : ''}
             </div>
         );
    }
    return null;
  };

  return (
    <Link 
        to={`/product/${product.id}`} 
        className={`group bg-white rounded-md border overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative ${product.isBoosted ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-gray-200'}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Boosted/Featured Badge */}
        {product.isBoosted && (
            <div className="absolute top-0 left-0 bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-1 shadow-sm z-10">
                FEATURED
            </div>
        )}

        <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full cursor-pointer hover:bg-white text-gray-600 hover:text-red-500 transition-colors z-10">
            <Heart className="w-4 h-4" />
        </div>
        {product.images.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 rounded">
                {product.images.length} photos
            </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
             <h3 className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</h3>
        </div>
        
        {renderSubtitle()}

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow leading-snug">
          {product.title}
        </p>

        <div className="flex justify-between items-end text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
            <span className="truncate max-w-[60%]">{product.category}</span>
            <span>{formatDate(product.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;