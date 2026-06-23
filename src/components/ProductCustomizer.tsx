'use client';

import React, { useState, useEffect } from 'react';
import { KaprukaProduct } from '@/lib/kapruka';
import CakeCustomizer from './CakeCustomizer';
import { checkDelivery } from '@/app/actions';
import { 
  ShoppingBag, Check, Info, ShieldCheck, Heart, 
  ChevronRight, Calendar, MapPin, Loader2, Sparkles, Image as ImageIcon 
} from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import DatePicker from './DatePicker';

interface ProductCustomizerProps {
  product: KaprukaProduct;
  city: string;
  initialDate: string;
  onAdd: (item: {
    product: KaprukaProduct;
    quantity: number;
    customization?: {
      weight: string;
      flavour: string;
      icingText: string;
      addedPrice: number;
      deliveryDate: string;
      deliveryFee: number;
    };
    selectedVariantId?: string;
  }) => void;
  onBack: () => void;
}

export default function ProductCustomizer({ product, city, initialDate, onAdd, onBack }: ProductCustomizerProps) {
  const isCake = product.category?.toLowerCase() === 'cakes' || product.id.toUpperCase().startsWith('CAKE');
  
  // States for general product
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{
    deliverable: boolean;
    rate: number;
    message: string;
  } | null>(null);

  // Sync active image when product changes
  useEffect(() => {
    setActiveImage(product.image);
    setImageError(false);
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // Delivery check for non-cake items
  useEffect(() => {
    if (isCake || !city || !deliveryDate) return;
    let active = true;
    const verifyDelivery = async () => {
      setIsCheckingDelivery(true);
      try {
        const res = await checkDelivery(city, deliveryDate, product.id);
        if (active) setDeliveryResult(res);
      } catch (err) {
        if (active) {
          setDeliveryResult({
            deliverable: false,
            rate: 0,
            message: 'Delivery check failed'
          });
        }
      } finally {
        if (active) setIsCheckingDelivery(false);
      }
    };
    verifyDelivery();
    return () => { active = false; };
  }, [deliveryDate, city, product.id, isCake]);

  if (isCake) {
    return (
      <CakeCustomizer
        product={product}
        city={city}
        initialDate={initialDate}
        onBack={onBack}
        onAdd={(customDetails) => {
          onAdd({
            product,
            quantity: 1,
            customization: customDetails
          });
        }}
      />
    );
  }

  const isGrocery = product.category?.toLowerCase() === 'grocery' || 
                    product.category?.toLowerCase() === 'vegetables' || 
                    product.category?.toLowerCase() === 'food';
                    
  const activeColorClass = isGrocery ? 'text-sage-moss' : 'text-terracotta';
  const activeBgClass = isGrocery ? 'bg-sage-moss hover:bg-slate-black' : 'bg-terracotta hover:bg-slate-black';
  const activeBorderClass = isGrocery ? 'border-sage-moss' : 'border-terracotta';

  // Handle generic product add to cart
  const handleGenericAdd = () => {
    const finalProduct = {
      ...product,
      id: selectedVariant ? selectedVariant.sku || selectedVariant.id : product.id,
      name: selectedVariant && selectedVariant.name !== 'Default' ? `${product.name} (${selectedVariant.name})` : product.name,
      price: selectedVariant ? selectedVariant.price?.amount || selectedVariant.price : product.price,
    };

    onAdd({
      product: finalProduct,
      quantity,
      selectedVariantId: selectedVariant?.id
    });
  };

  const currentPrice = selectedVariant 
    ? (selectedVariant.price?.amount || selectedVariant.price) 
    : product.price;

  return (
    <div className="bg-card-bg border border-border-warm rounded-2xl p-4 md:p-6 lg:p-8 shadow-soft max-w-4xl mx-auto flex flex-col md:flex-row gap-8 relative overflow-hidden">
      
      {/* Left Column: Image Gallery */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        {/* Main Display Image */}
        <div className="aspect-square relative rounded-2xl overflow-hidden border border-border-warm bg-warm-alabaster flex items-center justify-center shadow-soft group">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={() => {
              const cat = (product.category || '').toLowerCase();
              let fallback = '/assets/images/fallbacks/uniquegifts.png';
              if (cat.includes('cake')) fallback = '/assets/images/fallbacks/cakes.png';
              else if (cat.includes('flower')) fallback = '/assets/images/fallbacks/flowers.png';
              else if (cat.includes('chocolate')) fallback = '/assets/images/fallbacks/chocolates.png';
              else if (cat.includes('grocery') || cat.includes('vegetables') || cat.includes('food')) fallback = '/assets/images/fallbacks/grocery.png';
              setActiveImage(fallback);
            }}
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          
          {/* Quick Info Tags */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-slate-black shadow-soft`}>
              <Sparkles className={`h-3 w-3 ${activeColorClass}`} /> 100% Authentic
            </span>
          </div>
        </div>

        {/* Thumbnail Carousel */}
        {product.images && product.images.length > 1 && !imageError && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 rounded-lg overflow-hidden border relative shrink-0 transition-all ${
                  activeImage === img ? `border-2 ${activeBorderClass} scale-95 shadow-soft` : 'border-border-warm hover:border-slate-black/30'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Customizer, Specs & Delivery checks */}
      <div className="w-full md:w-1/2 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {/* Header Metadata */}
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${activeColorClass}`}>
                {product.category}
              </span>
              <button
                onClick={onBack}
                className="text-xs uppercase tracking-wider text-slate-black/40 hover:text-terracotta transition-colors font-semibold"
              >
                Back to catalog
              </button>
            </div>
            <h2 className="font-display font-bold text-slate-black text-2xl leading-tight mt-1">
              {product.name}
            </h2>
            <p className="text-xs text-slate-black/40 font-light mt-1">
              Vendor: {product.vendor || 'Kapruka Direct'}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="font-mono font-bold text-slate-black text-2xl sm:text-3xl">
              LKR {currentPrice.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > currentPrice && (
              <span className="font-mono text-sm text-slate-black/40 line-through">
                LKR {product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Product Description */}
          <p className="text-sm text-slate-black/75 font-light leading-relaxed max-h-32 overflow-y-auto">
            {product.description || 'Premium curated e-commerce gifting selection from Kapruka Sri Lanka.'}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-2 border-t border-border-warm pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-black/60 block">
                Select Option
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.sku) {
                        // Sometimes variants have different images, if so, switch
                        // Typically, we can keep the first image or variant specifics
                      }
                    }}
                    className={`border rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                      selectedVariant?.id === v.id
                        ? `border-2 ${activeBorderClass} bg-card-bg shadow-soft`
                        : 'border-border-warm bg-warm-alabaster/90 hover:border-slate-black/30 text-slate-black/70'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Date Validator */}
          <div className="space-y-3 border-t border-border-warm pt-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-black/60 block">
                Fulfillment Date to {city}
              </label>
            </div>
            <div className="relative border border-border-warm rounded-xl px-4 py-2 bg-warm-alabaster/90 text-slate-black focus-within:border-terracotta transition-colors flex items-center">
              <DatePicker value={deliveryDate} onChange={setDeliveryDate} />
            </div>

            {/* Live checker status overlay */}
            <AnimatePresence mode="wait">
              {isCheckingDelivery ? (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 text-[11px] text-slate-black/50 font-light"
                >
                  <Loader2 className={`h-3.5 w-3.5 animate-spin ${activeColorClass}`} />
                  <span>Checking Kapruka schedule...</span>
                </motion.div>
              ) : deliveryResult ? (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`flex items-start gap-2 rounded-xl p-2.5 text-[11px] border ${
                    deliveryResult.deliverable
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {deliveryResult.deliverable ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold">Deliverable to {city}.</span> Shipping: <span className="font-mono">LKR {deliveryResult.rate.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Info className="h-3.5 w-3.5 text-red-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold">Unavailable for delivery.</span> {deliveryResult.message}
                      </div>
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border-warm flex items-center gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center border border-border-warm rounded-xl bg-warm-alabaster/90 px-3 h-12 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="text-slate-black/50 hover:text-slate-black px-2 text-lg font-bold"
            >
              −
            </button>
            <span className="w-8 text-center font-mono font-bold text-sm text-slate-black">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="text-slate-black/50 hover:text-slate-black px-2 text-lg font-bold"
            >
              +
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            type="button"
            onClick={handleGenericAdd}
            disabled={isCheckingDelivery || (deliveryResult !== null && !deliveryResult.deliverable)}
            className={`flex-1 flex items-center justify-center gap-2 text-white rounded-xl h-12 px-4 font-semibold text-center transition-colors shadow-soft text-xs uppercase tracking-wider whitespace-nowrap ${activeBgClass} disabled:opacity-40 disabled:hover:bg-opacity-40`}
          >
            <ShoppingBag className="h-4 w-4" /> ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
