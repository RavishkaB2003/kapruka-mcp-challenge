'use client';

import React from 'react';
import Image from 'next/image';
import { KaprukaProduct } from '@/lib/kapruka';
import { ShoppingBag, Truck, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProductCardProps {
  product: KaprukaProduct;
  onSelect: (product: KaprukaProduct) => void;
  onAddToCart: (product: KaprukaProduct) => void;
}

export default function ProductCard({ product, onSelect, onAddToCart }: ProductCardProps) {
  // Determine if it's a grocery item (to use Sage Moss colorway)
  const isGrocery = product.category?.toLowerCase() === 'grocery' || product.category?.toLowerCase() === 'vegetables' || product.category?.toLowerCase() === 'food';
  
  // Parse stock status
  const isLowStock = product.stock?.toLowerCase().includes('low');
  const isOutOfStock = product.stock?.toLowerCase().includes('out');

  // Fallback image handling
  const [imgSrc, setImgSrc] = React.useState(product.image);
  const handleImageError = () => {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('cake')) setImgSrc('/assets/images/fallbacks/cakes.png');
    else if (cat.includes('flower')) setImgSrc('/assets/images/fallbacks/flowers.png');
    else if (cat.includes('chocolate')) setImgSrc('/assets/images/fallbacks/chocolates.png');
    else if (cat.includes('grocery') || cat.includes('vegetables') || cat.includes('food')) setImgSrc('/assets/images/fallbacks/grocery.png');
    else setImgSrc('/assets/images/fallbacks/uniquegifts.png');
  };

  return (
    <div
      className={`group bg-card-bg border border-border-warm rounded-2xl p-3 sm:p-4 shadow-soft hover:shadow-hover hover:border-terracotta/20 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer`}
      onClick={() => onSelect(product)}
    >
      <div className="space-y-3">
        {/* Image Display Area with scale-on-hover */}
        <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-warm-alabaster border border-border-warm">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            onError={handleImageError}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Quick specs overlay on hover */}
          <div className="absolute inset-0 bg-slate-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
            <p className="text-xs font-light tracking-wide uppercase">
              {product.weight ? `Weight: ${product.weight}` : 'Premium Quality'}
            </p>
            <p className="text-[10px] text-white/80 font-light flex items-center gap-1.5 mt-0.5">
              <Truck className="h-3.5 w-3.5 text-terracotta" /> Same Day Delivery Available
            </p>
          </div>

          {/* Stock Badges */}
          <div className="absolute top-2.5 right-2.5 z-10">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <AlertTriangle className="h-3 w-3" /> Out
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <AlertTriangle className="h-3 w-3" /> Low Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle className="h-3 w-3" /> Active
              </span>
            )}
          </div>
        </div>

        {/* Product Meta details */}
        <div>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
            isGrocery ? 'text-sage-moss' : 'text-terracotta'
          }`}>
            {product.category}
          </span>
          <h3 className="font-display font-bold text-slate-black leading-snug line-clamp-2 mt-1 min-h-[44px]">
            {product.name}
          </h3>
          <p className="text-xs text-slate-black/40 font-light mt-0.5">
            {product.vendor || 'Kapruka Direct'}
          </p>
        </div>
      </div>

      {/* LKR Price and Call-to-action button */}
      <div className="mt-4 pt-3 border-t border-border-warm flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-black/35 font-light">Price</span>
          <span className="font-mono font-bold text-slate-black text-lg">
            LKR {product.price.toLocaleString()}
          </span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-xs font-semibold text-white transition-all duration-300 min-h-[44px] ${
            isGrocery 
              ? 'bg-sage-moss hover:bg-slate-black' 
              : 'bg-slate-black hover:bg-terracotta'
          }`}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
