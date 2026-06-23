'use client';

import React, { useState, useEffect } from 'react';
import { checkDelivery } from '@/app/actions';
import { KaprukaProduct } from '@/lib/kapruka';
import { Calendar, Truck, AlertCircle, Check, Loader2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from './DatePicker';

interface CakeCustomizerProps {
  product: KaprukaProduct;
  city: string;
  initialDate: string;
  onAdd: (customization: {
    weight: string;
    flavour: string;
    icingText: string;
    addedPrice: number;
    deliveryDate: string;
    deliveryFee: number;
  }) => void;
  onBack: () => void;
}

export default function CakeCustomizer({ product, city, initialDate, onAdd, onBack }: CakeCustomizerProps) {
  const [weight, setWeight] = useState<'1kg' | '2kg'>('1kg');
  const [flavour, setFlavour] = useState<'Chocolate' | 'Vanilla' | 'Ribbon'>('Chocolate');
  const [icingText, setIcingText] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  
  const [isChecking, setIsChecking] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{
    deliverable: boolean;
    rate: number;
    message: string;
  } | null>(null);

  const weightMarkup = weight === '2kg' ? 1500 : 0;
  const totalPrice = product.price + weightMarkup;

  // Run delivery feasibility check
  useEffect(() => {
    let active = true;
    const verifyAvailability = async () => {
      if (!city || !deliveryDate) return;
      setIsChecking(true);
      try {
        const res = await checkDelivery(city, deliveryDate, product.id);
        if (active) {
          setDeliveryResult(res);
        }
      } catch (err) {
        if (active) {
          setDeliveryResult({
            deliverable: false,
            rate: 0,
            message: 'Unable to connect to delivery checker.'
          });
        }
      } finally {
        if (active) {
          setIsChecking(false);
        }
      }
    };

    verifyAvailability();
    return () => {
      active = false;
    };
  }, [deliveryDate, city, product.id]);

  const handleAddToCart = () => {
    if (deliveryResult && !deliveryResult.deliverable) return;
    onAdd({
      weight,
      flavour,
      icingText: icingText.trim(),
      addedPrice: weightMarkup,
      deliveryDate,
      deliveryFee: deliveryResult?.rate || 0
    });
  };

  return (
    <div className="bg-card-bg border border-border-warm rounded-2xl p-4 md:p-6 lg:p-8 shadow-soft space-y-6 max-w-xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-border-warm pb-4">
        <div>
          <span className="text-[10px] font-semibold text-terracotta uppercase tracking-wider">Configure Cake</span>
          <h2 className="font-display font-bold text-slate-black text-xl leading-tight mt-1">{product.name}</h2>
        </div>
        <button
          onClick={onBack}
          className="text-xs uppercase tracking-wider text-slate-black/50 hover:text-terracotta transition-colors font-semibold"
        >
          Cancel
        </button>
      </div>

      {/* 1. Size / Weight Selector */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-black/60 block">1. Select Size</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setWeight('1kg')}
            className={`border rounded-xl p-4 flex flex-col items-start gap-1.5 transition-all text-left ${
              weight === '1kg'
                ? 'border-terracotta bg-terracotta/5 shadow-soft ring-1 ring-terracotta'
                : 'border-border-warm bg-warm-alabaster/40 hover:border-slate-black/30'
            }`}
          >
            <span className="font-display font-bold text-slate-black text-base">1.0 Kg</span>
            <span className="text-xs text-slate-black/55 font-light">Standard size, serves 6-8 people.</span>
          </button>
          <button
            type="button"
            onClick={() => setWeight('2kg')}
            className={`border rounded-xl p-4 flex flex-col items-start gap-1.5 transition-all text-left ${
              weight === '2kg'
                ? 'border-terracotta bg-terracotta/5 shadow-soft ring-1 ring-terracotta'
                : 'border-border-warm bg-warm-alabaster/40 hover:border-slate-black/30'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-display font-bold text-slate-black text-base">2.0 Kg</span>
              <span className="text-[10px] font-semibold bg-terracotta text-white px-2 py-0.5 rounded-full uppercase tracking-wider">+ LKR 1,500</span>
            </div>
            <span className="text-xs text-slate-black/55 font-light">Double tier, serves 12-16 people.</span>
          </button>
        </div>
      </div>

      {/* 2. Flavour Selector */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-black/60 block">2. Select Flavour</label>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {(['Chocolate', 'Vanilla', 'Ribbon'] as const).map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => setFlavour(fl)}
              className={`flex-1 min-w-[100px] border rounded-xl py-3 text-center text-sm font-semibold tracking-wide uppercase transition-all ${
                flavour === fl
                  ? 'border-slate-black bg-slate-black text-white shadow-soft'
                  : 'border-border-warm bg-card-bg text-slate-black/65 hover:text-terracotta hover:border-terracotta/40'
              }`}
            >
              {fl}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Icing Message Input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="icingText" className="text-xs font-semibold uppercase tracking-wider text-slate-black/60 block">3. Icing Message</label>
          <span className="text-[10px] text-slate-black/40 font-mono">{icingText.length}/120</span>
        </div>
        <input
          id="icingText"
          name="icingText"
          type="text"
          maxLength={120}
          placeholder="Happy Birthday Mom! (Written in decorative icing)"
          value={icingText}
          onChange={(e) => setIcingText(e.target.value)}
          className="w-full border border-border-warm rounded-xl px-4 py-3 bg-warm-alabaster/40 text-slate-black placeholder-slate-black/35 focus:outline-none focus:border-terracotta transition-colors text-base"
        />
      </div>

      {/* 4. Delivery Date Checker */}
      <div className="space-y-3 border-t border-border-warm pt-5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-black/60 block">4. Delivery Date to {city}</label>
          <span className="text-[10px] text-slate-black/50 font-light">Today-or-future deliveries</span>
        </div>
        <div className="relative border border-border-warm rounded-xl px-4 py-2 bg-warm-alabaster/40 text-slate-black focus-within:border-terracotta transition-colors flex items-center">
          <DatePicker value={deliveryDate} onChange={setDeliveryDate} />
        </div>

        {/* Live Status Message */}
        <AnimatePresence mode="wait">
          {isChecking ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 text-xs text-slate-black/50 font-light mt-2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-terracotta" />
              <span>Verifying Kapruka delivery capacity...</span>
            </motion.div>
          ) : deliveryResult ? (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`flex items-start gap-2.5 rounded-xl p-3 text-xs mt-2 border ${
                deliveryResult.deliverable
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {deliveryResult.deliverable ? (
                <>
                  <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold">Deliverable to {city}</p>
                    <p className="font-light">Shipping Fee: <span className="font-mono font-medium">LKR {deliveryResult.rate.toLocaleString()}</span></p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-semibold">Unavailable for {deliveryDate}</p>
                    <p className="font-light">{deliveryResult.message}</p>
                  </div>
                </>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Submission CTA */}
      <div className="pt-4 border-t border-border-warm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-black/35 font-light">Customized Total</span>
          <span className="font-mono font-bold text-slate-black text-xl sm:text-2xl">
            LKR {totalPrice.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isChecking || !deliveryResult || !deliveryResult.deliverable}
          className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl h-12 px-4 font-semibold text-center transition-colors shadow-soft text-xs uppercase tracking-wider whitespace-nowrap bg-terracotta hover:bg-slate-black disabled:opacity-40 disabled:hover:bg-opacity-40"
        >
          <ShoppingBag className="h-4 w-4" /> ADD TO CART
        </button>
      </div>
    </div>
  );
}
