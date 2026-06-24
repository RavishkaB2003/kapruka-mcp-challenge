'use client';

import React, { useState } from 'react';
import { createOrder, getDeliveryCities } from '@/app/actions';
import { 
  User, MapPin, Gift, Phone, Mail, ArrowLeft, 
  CreditCard, Loader2, AlertCircle, ShieldAlert 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from './DatePicker';
import { cleanCityName } from '@/lib/utils';

interface CartItem {
  product: { id: string; price: number; name: string };
  quantity: number;
  customization?: {
    weight: string;
    flavour: string;
    icingText: string;
    addedPrice: number;
    deliveryDate: string;
    deliveryFee: number;
  };
}

interface CheckoutFormProps {
  cartItems: CartItem[];
  giftMessage: string;
  onUpdateGiftMessage?: (message: string) => void;
  initialCity: string;
  initialDate: string;
  prefilledRecipient?: {
    name?: string | null;
    address?: string | null;
    phone?: string | null;
  } | null;
  onBack: () => void;
  onSuccess: (orderData: {
    orderNumber: string;
    paymentUrl: string;
    grandTotal: number;
    recipientName: string;
    deliveryCity: string;
    deliveryDate: string;
  }) => void;
}

export default function CheckoutForm({
  cartItems,
  giftMessage,
  onUpdateGiftMessage,
  initialCity,
  initialDate,
  prefilledRecipient,
  onBack,
  onSuccess
}: CheckoutFormProps) {
  // Accordion Step State
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Recipient details
  const [recipientName, setRecipientName] = useState(prefilledRecipient?.name || '');
  const [recipientPhone, setRecipientPhone] = useState(prefilledRecipient?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(prefilledRecipient?.address || '');
  const [deliveryCity, setDeliveryCity] = useState(initialCity || 'Colombo');
  const [deliveryDate, setDeliveryDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  // Synchronize prefilled recipient details from page.tsx (AI extracted)
  React.useEffect(() => {
    if (prefilledRecipient) {
      if (prefilledRecipient.name) setRecipientName(prefilledRecipient.name);
      if (prefilledRecipient.phone) setRecipientPhone(prefilledRecipient.phone);
      if (prefilledRecipient.address) setDeliveryAddress(prefilledRecipient.address);
    }
  }, [prefilledRecipient]);
  
  // City search autocomplete
  const [cityQuery, setCityQuery] = useState(initialCity || 'Colombo');
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);

  // Wrapping Details
  const [premiumWrap, setPremiumWrap] = useState(false);

  // Sender details
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  // Submit Order States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // City query autocomplete handler
  const handleCityChange = async (val: string) => {
    setCityQuery(val);
    setDeliveryCity(val);
    if (val.trim().length >= 2) {
      setIsSearchingCities(true);
      try {
        const results = await getDeliveryCities(val, 6);
        setCitySuggestions(results);
      } catch (err) {
        setCitySuggestions([]);
      } finally {
        setIsSearchingCities(false);
      }
    } else {
      setCitySuggestions([]);
    }
  };

  // Pricing calculations
  const itemsSubtotal = cartItems.reduce((acc, item) => {
    const unitPrice = item.product.price + (item.customization?.addedPrice || 0);
    return acc + (unitPrice * item.quantity);
  }, 0);

  const deliveryFee = cartItems.length > 0
    ? Math.max(...cartItems.map(item => item.customization?.deliveryFee || 0))
    : 0;

  const isFreeShipping = itemsSubtotal >= 8000;
  const wrappingCost = premiumWrap ? 350 : 0;
  const activeDeliveryFee = isFreeShipping ? 0 : deliveryFee;
  const grandTotal = itemsSubtotal + activeDeliveryFee + wrappingCost;

  // Validation
  const validateStep1 = () => {
    return recipientName.trim().length > 0 && 
           recipientPhone.trim().length >= 7 && 
           deliveryAddress.trim().length > 3 && 
           deliveryCity.trim().length > 0 &&
           deliveryDate.length > 0;
  };

  const validateStep3 = () => {
    return senderName.trim().length > 0 && 
           senderPhone.trim().length >= 7 && 
           senderEmail.includes('@');
  };

  // Order Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateStep1()) {
      setActiveStep(1);
      return;
    }
    if (!validateStep3()) {
      setActiveStep(3);
      return;
    }

    setIsSubmitting(true);
    
    // Format cart payload for MCP
    const cartPayload = cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      icing_text: item.customization?.icingText || null
    }));

    try {
      const orderRes = await createOrder({
        cart: cartPayload,
        recipient: {
          name: recipientName.trim(),
          address: deliveryAddress.trim(),
          phone: recipientPhone.trim()
        },
        delivery: {
          city: deliveryCity.trim(),
          date: deliveryDate,
          fee: activeDeliveryFee
        },
        sender: {
          name: senderName.trim(),
          phone: senderPhone.trim(),
          email: senderEmail.trim()
        },
        giftMessage: giftMessage || undefined
      });

      // Call success handler
      onSuccess({
        orderNumber: orderRes.orderNumber,
        paymentUrl: orderRes.paymentUrl,
        grandTotal,
        recipientName: recipientName.trim(),
        deliveryCity: deliveryCity.trim(),
        deliveryDate
      });
    } catch (err) {
      console.error('[Checkout] Submission error:', err);
      const errMsg = err instanceof Error ? err.message : 'We ran into an issue submitting your Kapruka order. Please try again.';
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between bg-card-bg font-sans">
      
      {/* Top Header Navigation */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-border-warm flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full text-slate-black/55 hover:text-terracotta hover:bg-warm-alabaster transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <span className="text-[10px] font-semibold text-terracotta uppercase tracking-wider">Guest Checkout</span>
          <h2 className="font-display font-bold text-slate-black text-base uppercase tracking-wider leading-none mt-0.5">
            Checkout Details
          </h2>
        </div>
      </div>

      {/* Accordion Panels */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        
        {/* STEP 1: Recipient & Delivery Details */}
        <div className={`border rounded-2xl transition-all ${
          activeStep === 1 ? 'border-terracotta bg-card-bg shadow-soft overflow-visible' : 'border-border-warm bg-warm-alabaster/80 overflow-hidden'
        }`}>
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="w-full flex items-center justify-between p-4 text-left border-b border-border-warm bg-white hover:bg-warm-alabaster/10 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                activeStep === 1 ? 'bg-terracotta text-white' : 'bg-warm-alabaster text-slate-black/55 border border-border-warm'
              }`}>
                1
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-black uppercase tracking-wider">Recipient & Delivery</h3>
                <p className="text-[10px] text-slate-black/45 font-light">Where and to whom should we send this?</p>
              </div>
            </div>
            {validateStep1() && activeStep !== 1 && (
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Valid</span>
            )}
          </button>

          {activeStep === 1 && (
            <div className="p-5 space-y-4 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="recipientName" className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Recipient Name *</label>
                  <input
                    id="recipientName"
                    name="recipientName"
                    type="text"
                    required
                    placeholder="Recipient's Full Name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full border border-border-warm rounded-xl px-4 py-2.5 text-base bg-warm-alabaster/90 text-slate-black focus:outline-none focus:border-terracotta transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="recipientPhone" className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Recipient Phone *</label>
                  <input
                    id="recipientPhone"
                    name="recipientPhone"
                    type="tel"
                    required
                    placeholder="e.g. 0771234567"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full border border-border-warm rounded-xl px-4 py-2.5 text-base bg-warm-alabaster/90 text-slate-black focus:outline-none focus:border-terracotta transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="deliveryAddress" className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Delivery Street Address *</label>
                <input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  type="text"
                  required
                  placeholder="Street name, house/apartment number"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full border border-border-warm rounded-xl px-4 py-2.5 text-base bg-warm-alabaster/90 text-slate-black focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative">
                <div className="space-y-1.5 relative">
                  <label htmlFor="deliveryCity" className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Delivery City *</label>
                  <input
                    id="deliveryCity"
                    name="deliveryCity"
                    type="text"
                    required
                    placeholder="Search delivery city..."
                    value={cityQuery}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full border border-border-warm rounded-xl px-4 py-2.5 text-base bg-warm-alabaster/90 text-slate-black focus:outline-none focus:border-terracotta transition-colors"
                  />
                  {isSearchingCities && (
                    <Loader2 className="absolute right-3 top-8 h-4 w-4 animate-spin text-terracotta" />
                  )}
                  {citySuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-16 bg-white border border-border-warm rounded-xl shadow-hover z-30 max-h-40 overflow-y-auto p-1.5">
                      {citySuggestions.map((c) => {
                        const cleaned = cleanCityName(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setCityQuery(cleaned);
                              setDeliveryCity(cleaned);
                              setCitySuggestions([]);
                            }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-warm-alabaster rounded-lg text-slate-black"
                          >
                            {cleaned}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Fulfillment Date *</label>
                  <div className="relative border border-border-warm rounded-xl px-4 py-2 bg-warm-alabaster/90 text-slate-black focus-within:border-terracotta transition-colors flex items-center min-h-[42px]">
                    <DatePicker value={deliveryDate} onChange={setDeliveryDate} className="w-full" />
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!validateStep1()}
                onClick={() => setActiveStep(2)}
                className="w-full bg-slate-black text-white text-xs font-semibold py-2.5 rounded-xl uppercase tracking-wider hover:bg-terracotta transition-colors disabled:opacity-40"
              >
                Continue to Packaging
              </button>
            </div>
          )}
        </div>

        {/* STEP 2: Packaging & Wrapping */}
        <div className={`border rounded-2xl transition-all ${
          activeStep === 2 ? 'border-terracotta bg-card-bg shadow-soft overflow-visible' : 'border-border-warm bg-warm-alabaster/80 overflow-hidden'
        }`}>
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="w-full flex items-center justify-between p-4 text-left border-b border-border-warm bg-white hover:bg-warm-alabaster/10 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                activeStep === 2 ? 'bg-terracotta text-white' : 'bg-warm-alabaster text-slate-black/55 border border-border-warm'
              }`}>
                2
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-black uppercase tracking-wider">Packaging & Wrapping</h3>
                <p className="text-[10px] text-slate-black/45 font-light">Custom gift wraps & card presentation</p>
              </div>
            </div>
          </button>

          {activeStep === 2 && (
            <div className="p-5 space-y-4 bg-white">
              {/* Premium wrapping toggle */}
              <div
                onClick={() => setPremiumWrap(!premiumWrap)}
                className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  premiumWrap 
                    ? 'border-terracotta bg-terracotta/5 shadow-soft ring-1 ring-terracotta' 
                    : 'border-border-warm bg-warm-alabaster/90 hover:border-slate-black/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-terracotta mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-black">Premium Terracotta Gift Wrapping</h4>
                    <p className="text-[10px] text-slate-black/55 font-light mt-0.5">
                      Wrapped in natural clay-toned papers with cotton ribbon tags.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-mono font-bold text-slate-black">LKR 350</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    premiumWrap ? 'bg-terracotta text-white' : 'bg-warm-alabaster text-slate-black/40 border border-border-warm'
                  }`}>
                    {premiumWrap ? 'Selected' : 'Add'}
                  </span>
                </div>
              </div>

              {/* Greeting Card message display */}
              <div className="border border-border-warm rounded-xl p-4 bg-warm-alabaster/85 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-black/60 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-black/40" />
                    <span>Greeting Card Message</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-black/45 lowercase font-mono">
                    {giftMessage.length}/300 characters
                  </span>
                </div>
                <textarea
                  className="w-full min-h-[80px] p-2.5 bg-white border border-border-warm rounded-lg text-xs text-slate-black/85 font-light focus:outline-none focus:ring-1 focus:ring-terracotta transition-all resize-none"
                  value={giftMessage}
                  onChange={(e) => onUpdateGiftMessage?.(e.target.value.slice(0, 300))}
                  placeholder="Enter greeting card message here..."
                  maxLength={300}
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="w-full bg-slate-black text-white text-xs font-semibold py-2.5 rounded-xl uppercase tracking-wider hover:bg-terracotta transition-colors"
              >
                Continue to Sender Details
              </button>
            </div>
          )}
        </div>

        {/* STEP 3: Sender Details */}
        <div className={`border rounded-2xl transition-all ${
          activeStep === 3 ? 'border-terracotta bg-card-bg shadow-soft overflow-visible' : 'border-border-warm bg-warm-alabaster/80 overflow-hidden'
        }`}>
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            className="w-full flex items-center justify-between p-4 text-left border-b border-border-warm bg-white hover:bg-warm-alabaster/10 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                activeStep === 3 ? 'bg-terracotta text-white' : 'bg-warm-alabaster text-slate-black/55 border border-border-warm'
              }`}>
                3
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-black uppercase tracking-wider">Sender Information</h3>
                <p className="text-[10px] text-slate-black/45 font-light">To receive confirmation and order updates</p>
              </div>
            </div>
            {validateStep3() && activeStep !== 3 && (
              <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Valid</span>
            )}
          </button>

          {activeStep === 3 && (
            <div className="p-5 space-y-4 bg-white">
              <div className="space-y-1.5">
                <label htmlFor="senderName" className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Sender Full Name *</label>
                <input
                  id="senderName"
                  name="senderName"
                  type="text"
                  required
                  placeholder="Your Name (As shown on card)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full border border-border-warm rounded-xl px-4 py-2.5 text-base bg-warm-alabaster/90 text-slate-black focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="senderPhone" className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Sender Phone *</label>
                  <input
                    id="senderPhone"
                    name="senderPhone"
                    type="tel"
                    required
                    placeholder="Your Phone Number"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full border border-border-warm rounded-xl px-4 py-2.5 text-base bg-warm-alabaster/90 text-slate-black focus:outline-none focus:border-terracotta transition-colors font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="senderEmail" className="text-[10px] font-bold uppercase tracking-wider text-slate-black/55 block">Sender Email *</label>
                  <input
                    id="senderEmail"
                    name="senderEmail"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full border border-border-warm rounded-xl px-4 py-2.5 text-base bg-warm-alabaster/90 text-slate-black focus:outline-none focus:border-terracotta transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Submission Errors */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-start gap-2.5 border border-red-200 bg-red-50 text-red-800 rounded-xl p-3.5 text-xs"
            >
              <ShieldAlert className="h-4.5 w-4.5 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-0.5">
                <p className="font-semibold">Checkout Failure</p>
                <p className="font-light">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Pricing Summary & Submission */}
      <div className="border-t border-border-warm p-4 md:p-6 bg-card-bg space-y-4 shadow-soft">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-black/50 font-light">
            <span>Subtotal</span>
            <span className="font-mono">LKR {itemsSubtotal.toLocaleString()}</span>
          </div>
          {wrappingCost > 0 && (
            <div className="flex justify-between text-xs text-slate-black/50 font-light">
              <span>Terracotta Wrapping</span>
              <span className="font-mono">LKR {wrappingCost.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-black/50 font-light">
            <span>Fulfillment Shipping ({deliveryCity})</span>
            <span className="font-mono">
              {isFreeShipping ? (
                <span className="text-green-600 font-semibold uppercase tracking-wider text-[10px]">Free</span>
              ) : (
                `LKR ${deliveryFee.toLocaleString()}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-slate-black pt-2 border-t border-border-warm">
            <span className="font-display">Grand Total</span>
            <span className="font-mono text-terracotta">LKR {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !validateStep1() || !validateStep3()}
          className="w-full bg-terracotta text-white py-3.5 rounded-xl font-semibold uppercase tracking-wider text-xs hover:bg-slate-black transition-colors flex items-center justify-center gap-2 shadow-soft disabled:opacity-40 disabled:hover:bg-terracotta"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Secure Pay Link...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" /> Place Order & Secure Pay
            </>
          )}
        </button>
      </div>
    </form>
  );
}
