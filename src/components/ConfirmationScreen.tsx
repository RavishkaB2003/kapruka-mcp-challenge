'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { trackOrder } from '@/app/actions';
import { 
  CreditCard, CheckCircle2, RotateCcw, 
  MapPin, Calendar, ExternalLink, RefreshCw, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        background?: string;
        speed?: string;
        loop?: boolean;
        autoplay?: boolean;
        style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}

interface ConfirmationScreenProps {
  orderData: {
    orderNumber: string;
    paymentUrl: string;
    grandTotal: number;
    recipientName: string;
    deliveryCity: string;
    deliveryDate: string;
  };
  productImage: string;
  onNewOrder: () => void;
}

export default function ConfirmationScreen({
  orderData,
  productImage,
  onNewOrder
}: ConfirmationScreenProps) {
  const [liveStatus, setLiveStatus] = useState<string>('pending');
  const [liveStatusDisplay, setLiveStatusDisplay] = useState<string>('Awaiting Secure Payment');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes countdown
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Inject Lottie player script dynamically
  useEffect(() => {
    const scriptId = 'lottie-player-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Auto-collapse success text after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for link expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Poll / Refresh Order Status from MCP
  const refreshStatus = useCallback(async () => {
    if (orderData.orderNumber === 'PENDING') return;
    setIsRefreshing(true);
    try {
      const response = await trackOrder(orderData.orderNumber);
      const status = response?.status?.toLowerCase() || 'pending';
      
      if (status === 'delivered') {
        setLiveStatus('delivered');
        setLiveStatusDisplay('Delivered successfully! 🎉');
      } else if (status === 'dispatched' || status === 'shipped') {
        setLiveStatus('shipped');
        setLiveStatusDisplay('Out for Delivery 🚚');
      } else if (status === 'prepared' || status === 'processing') {
        setLiveStatus('processing');
        setLiveStatusDisplay('Preparing / Baking 🎂');
      } else {
        setLiveStatus('pending');
        setLiveStatusDisplay('Awaiting Secure Payment');
      }
    } catch (err) {
      console.error('Error tracking order:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [orderData.orderNumber]);

  useEffect(() => {
    // Initial fetch
    refreshStatus();
  }, [refreshStatus]);

  return (
    <div className="flex-1 flex flex-col h-full bg-card-bg border border-border-warm rounded-2xl shadow-soft overflow-hidden font-sans relative">
      
      {/* 1. LOTTIE DELIVERY ANIMATION HEADER PANEL (Option A) */}
      <div className="h-[140px] sm:h-[200px] w-full bg-warm-alabaster/85 border-b border-border-warm relative overflow-hidden flex flex-col items-center justify-center p-4">
        <div className="w-36 h-28 sm:w-48 sm:h-36 relative">
          <lottie-player
            src="/assets/lottie/delivery-truck.json"
            background="transparent"
            speed="1.2"
            style={{ width: '100%', height: '100%' }}
            loop
            autoplay
          />
        </div>
        
        {/* Dynamic status floating label */}
        <div className="absolute bottom-3 right-4 z-20">
          <div className="bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-border-warm shadow-soft text-[10px] font-bold uppercase tracking-wider text-slate-black flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
            <span>Status: {liveStatusDisplay}</span>
          </div>
        </div>
      </div>

      {/* 2. ORDER DETAILS & CONFIRMATION PANEL */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* Success Card Header / Collapsible Lottie Area */}
        <div className="text-center max-w-md mx-auto pt-2 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Toggle success message"
            className="p-3 rounded-full bg-green-50 text-green-600 border border-green-200 shadow-soft hover:scale-105 transition-transform duration-300 cursor-pointer focus:outline-none"
          >
            <CheckCircle2 className="h-8 w-8" />
          </button>
          
          <AnimatePresence initial={false}>
            {!isCollapsed ? (
              <motion.div
                key="thank-you-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <h2 className="font-display font-bold text-slate-black text-2xl mt-2">Thank you for Gifting!</h2>
                <p className="text-sm text-slate-black/60 font-light leading-relaxed mt-1 px-4">
                  Your guest order has been generated on Kapruka. Secure your slot by completing the payment details.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="lottie-collapsed-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden flex flex-col items-center mt-1"
              >
                <h2 className="font-display font-semibold text-slate-black text-base mt-1">Order Created Successfully</h2>
                <p className="text-xs text-slate-black/60 font-light mt-0.5 px-4">
                  Ready for payment settlement to schedule your delivery.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCollapsed(false)}
                  className="text-[10px] text-terracotta underline hover:text-slate-black transition-colors mt-1.5 focus:outline-none"
                >
                  Show detailed summary
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Order Reference & Pay CTA */}
        <div className="bg-card-bg border border-border-warm rounded-2xl p-4 md:p-6 shadow-soft space-y-5 max-w-lg mx-auto relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-border-warm pb-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-black/40 uppercase tracking-widest block">Order Reference</span>
              <span className="font-mono font-bold text-slate-black text-lg">{orderData.orderNumber}</span>
            </div>
            
            {/* Pay link expiration timer */}
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>Expires in: {formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-light text-slate-black/75">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-terracotta shrink-0" />
              <div>
                <span className="font-semibold block text-[10px] uppercase tracking-wider text-slate-black/45">Deliver To</span>
                {orderData.recipientName} ({orderData.deliveryCity})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-terracotta shrink-0" />
              <div>
                <span className="font-semibold block text-[10px] uppercase tracking-wider text-slate-black/45">Fulfillment Date</span>
                {orderData.deliveryDate}
              </div>
            </div>
          </div>

          {/* Secure Pay Link CTA */}
          <div className="bg-warm-alabaster/85 border border-border-warm rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-black uppercase tracking-wider">
              <span>Payable Total</span>
              <span className="font-mono text-terracotta font-bold text-lg">LKR {orderData.grandTotal.toLocaleString()}</span>
            </div>
            <a
              href={orderData.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-terracotta hover:bg-slate-black text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-xl text-center flex items-center justify-center gap-2 transition-all shadow-soft"
            >
              <CreditCard className="h-4 w-4" /> Pay Securely on Kapruka <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="text-[10px] text-slate-black/45 font-light text-center">
              🔒 Bypasses registrations. Opens secure official Kapruka payment gateway directly.
            </p>
          </div>

          {/* Manual Refresh Status */}
          <div className="flex items-center justify-between text-xs text-slate-black/55">
            <span>Tracking status changes?</span>
            <button
              onClick={refreshStatus}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-terracotta hover:text-slate-black font-semibold transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Tracking
            </button>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center">
          <button
            onClick={onNewOrder}
            className="inline-flex items-center gap-2 rounded-xl border border-border-warm bg-card-bg px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-black/70 hover:text-terracotta transition-colors shadow-soft"
          >
            <RotateCcw className="h-4 w-4" /> Start New Gift Search
          </button>
        </div>
      </div>
    </div>
  );
}
