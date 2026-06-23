'use client';

import React from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, FileText, Gift, Info, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { KaprukaProduct } from '@/lib/kapruka';
import Image from 'next/image';

interface CartItem {
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
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (idx: number, qty: number) => void;
  onRemoveItem: (idx: number) => void;
  giftMessage: string;
  onUpdateGiftMessage: (msg: string) => void;
  onCheckout: () => void;
}

const FREE_SHIPPING_THRESHOLD = 8000;

function CartItemImage({ product }: { product: KaprukaProduct }) {
  const [imgSrc, setImgSrc] = React.useState(product.image);

  React.useEffect(() => {
    setImgSrc(product.image);
  }, [product.image]);

  const handleImageError = () => {
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('cake')) setImgSrc('/assets/images/fallbacks/cakes.png');
    else if (cat.includes('flower')) setImgSrc('/assets/images/fallbacks/flowers.png');
    else if (cat.includes('chocolate')) setImgSrc('/assets/images/fallbacks/chocolates.png');
    else if (cat.includes('grocery') || cat.includes('vegetables') || cat.includes('food')) setImgSrc('/assets/images/fallbacks/grocery.png');
    else setImgSrc('/assets/images/fallbacks/uniquegifts.png');
  };

  return (
    <Image
      src={imgSrc}
      alt={product.name}
      fill
      sizes="64px"
      onError={handleImageError}
      className="object-cover"
    />
  );
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  giftMessage,
  onUpdateGiftMessage,
  onCheckout
}: CartDrawerProps) {
  // Calculate subtotal
  const itemsSubtotal = cartItems.reduce((acc, item) => {
    const unitPrice = item.product.price + (item.customization?.addedPrice || 0);
    return acc + (unitPrice * item.quantity);
  }, 0);

  // Delivery fee is the max of the delivery fees of the items (per order flat fee)
  const deliveryFee = cartItems.length > 0 
    ? Math.max(...cartItems.map(item => item.customization?.deliveryFee || 0))
    : 0;

  const freeShippingProgress = Math.min(100, (itemsSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - itemsSubtotal;
  const isFreeShipping = itemsSubtotal >= FREE_SHIPPING_THRESHOLD;

  const totalDeliveryFee = isFreeShipping ? 0 : deliveryFee;
  const grandTotal = itemsSubtotal + totalDeliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-black/30 backdrop-blur-sm z-40"
          />

          {/* Cart Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card-bg border-l border-border-warm shadow-hover flex flex-col z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-4 py-4 md:px-6 md:py-5 border-b border-border-warm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-terracotta" />
                <span className="font-display font-bold text-slate-black text-lg uppercase tracking-wide">
                  Your Gift Cart
                </span>
                <span className="bg-warm-alabaster text-slate-black/70 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-black/50 hover:text-terracotta hover:bg-warm-alabaster transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {cartItems.length === 0 ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-xs mx-auto">
                  <div className="p-4 rounded-full bg-warm-alabaster text-slate-black/30">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                  <h3 className="font-display font-bold text-slate-black text-lg">Your cart is empty</h3>
                  <p className="text-sm text-slate-black/60 font-light leading-relaxed">
                    Browse the catalog and configure unique Sri Lankan gifts to send to your loved ones!
                  </p>
                  <button
                    onClick={onClose}
                    className="border border-border-warm bg-card-bg text-slate-black hover:text-terracotta hover:border-terracotta/40 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-soft transition-all"
                  >
                    Start Gifting
                  </button>
                </div>
              ) : (
                /* Cart Items List */
                <div className="space-y-6">
                  {/* Free Shipping Tracker */}
                  <div className="bg-warm-alabaster/50 border border-border-warm rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-black/75 uppercase tracking-wide">
                      <span>Delivery Service Status</span>
                      <span className={isFreeShipping ? 'text-green-700' : 'text-terracotta'}>
                        {isFreeShipping ? 'Qualified' : `LKR ${remainingForFreeShipping.toLocaleString()} left`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-border-warm rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isFreeShipping ? 'bg-green-600' : 'bg-terracotta'
                        }`}
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-black/45 font-light leading-relaxed">
                      {isFreeShipping 
                        ? '🎉 Perfect! Your order has qualified for FREE delivery in Colombo!'
                        : `Add LKR ${remainingForFreeShipping.toLocaleString()} more to qualify for FREE delivery.`}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item, idx) => {
                      const itemPrice = item.product.price + (item.customization?.addedPrice || 0);
                      return (
                        <div key={idx} className="flex gap-4 border-b border-border-warm pb-4 items-start last:border-b-0 last:pb-0">
                          {/* Image display */}
                          <div className="w-16 h-16 rounded-xl border border-border-warm overflow-hidden bg-warm-alabaster relative shrink-0">
                            <CartItemImage product={item.product} />
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 space-y-1">
                            <h4 className="font-display font-bold text-slate-black text-sm leading-snug line-clamp-1">
                              {item.product.name}
                            </h4>
                            
                            {/* Customization Details */}
                            {item.customization && (
                              <div className="bg-warm-alabaster/90 rounded-lg p-2 text-[10px] text-slate-black/55 space-y-0.5 border border-border-warm/50">
                                <p>Size: <span className="font-semibold">{item.customization.weight}</span> | Flavour: <span className="font-semibold">{item.customization.flavour}</span></p>
                                {item.customization.icingText && (
                                  <p className="line-clamp-1 italic">Icing: &quot;{item.customization.icingText}&quot;</p>
                                )}
                                <p>Delivery: <span className="font-semibold">{item.customization.deliveryDate}</span></p>
                              </div>
                            )}

                            {/* Pricing and Qty Controls */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center border border-border-warm rounded-lg bg-warm-alabaster/20 px-2 py-0.5">
                                <button
                                  onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                                  className="text-slate-black/50 hover:text-slate-black p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-sm font-bold"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center font-mono font-semibold text-xs text-slate-black">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(idx, Math.min(99, item.quantity + 1))}
                                  className="text-slate-black/50 hover:text-slate-black p-2 min-w-[36px] min-h-[36px] flex items-center justify-center text-sm font-bold"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-slate-black text-xs">
                                  LKR {(itemPrice * item.quantity).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => onRemoveItem(idx)}
                                  className="text-slate-black/35 hover:text-red-600 transition-colors p-1.5 -m-1.5 rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Greeting Card Customizer Box */}
                  <div className="border-t border-border-warm pt-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-black/60 uppercase tracking-wider">
                      <Gift className="h-4 w-4 text-terracotta" />
                      <span>Greeting Card Message</span>
                    </div>
                    <textarea
                      maxLength={300}
                      placeholder="Write a warm note to go with your gift... (e.g. 'Wishing you a very Happy Birthday! With love, Amal')"
                      value={giftMessage}
                      onChange={(e) => onUpdateGiftMessage(e.target.value)}
                      rows={3}
                      className="w-full border border-border-warm rounded-xl px-4 py-3 bg-warm-alabaster/90 text-slate-black placeholder-slate-black/30 focus:outline-none focus:border-terracotta transition-colors text-sm font-light leading-relaxed resize-none"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-black/40 font-mono">
                      <span>Card included free with wrapping</span>
                      <span>{giftMessage.length}/300</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-border-warm p-4 md:p-6 bg-card-bg space-y-4 shadow-soft">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-black/50 font-light">
                    <span>Items Subtotal</span>
                    <span className="font-mono">LKR {itemsSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-black/50 font-light items-center">
                    <span className="flex items-center gap-1">
                      Delivery Fee 
                      <span className="group relative cursor-pointer">
                        <Info className="h-3.5 w-3.5 text-slate-black/30" />
                        <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 w-48 rounded bg-slate-black px-2 py-1 text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100 font-light text-center">
                          Flat shipping rate based on destination city. Free over LKR 8,000.
                        </span>
                      </span>
                    </span>
                    <span className="font-mono">
                      {isFreeShipping ? (
                        <span className="text-green-600 font-semibold uppercase tracking-wider text-[10px]">Free</span>
                      ) : (
                        `LKR ${deliveryFee.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-black pt-2 border-t border-border-warm">
                    <span className="font-display">Total Summary</span>
                    <span className="font-mono">LKR {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full bg-slate-black text-white py-3.5 rounded-xl font-semibold uppercase tracking-wider text-xs hover:bg-terracotta transition-colors flex items-center justify-center gap-2 shadow-soft"
                >
                  <ShieldCheck className="h-4 w-4" /> Proceed to Guest Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
