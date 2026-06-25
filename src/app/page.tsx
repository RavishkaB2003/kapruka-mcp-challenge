'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const Preloader = dynamic(() => import('@/components/Preloader'), { ssr: false });
import BackgroundAura from '@/components/BackgroundAura';
import JourneyFinder from '@/components/JourneyFinder';
import ProductCard from '@/components/ProductCard';
import ProductCustomizer from '@/components/ProductCustomizer';
const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false });
const CheckoutForm = dynamic(() => import('@/components/CheckoutForm'), { ssr: false });
const ConfirmationScreen = dynamic(() => import('@/components/ConfirmationScreen'), { ssr: false });
import { searchProducts, processChatMessage, checkDelivery, trackOrder } from '@/app/actions';
import { getIngredientsForProduct, getAllergensForProduct, generateGreetings, extractCustomMemories } from '@/lib/gifting-helpers';
import { KaprukaProduct } from '@/lib/kapruka';
import { 
  ShoppingBag, Search, Sparkles, RotateCcw, 
  MapPin, Calendar, ArrowRight, MessageSquare, Info,
  ShieldAlert, Clock, CheckCircle2, AlertCircle, Check, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';


interface DeliveryWidgetData {
  city: string;
  date: string;
  rate: number;
  deliverable: boolean;
  message: string;
}

interface TrackingWidgetData {
  orderNumber: string;
  status: string;
  city?: string;
  verified: boolean;
  message?: string;
  items?: string;
}

interface ProductInfoWidgetData {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: string;
  description: string;
  weight: string;
  ingredients: string[];
  allergens: string[];
}

interface CartAddSuccessWidgetData {
  image: string;
  productName: string;
  quantity: number;
  city: string;
  date: string;
  price: number;
  deliveryFee: number;
  total: number;
}

interface RecommendationsWidgetData {
  occasion: string;
  products: {
    id: string;
    name: string;
    price: number;
    image: string;
    stock: string;
    category?: string;
    url?: string;
    weight?: string;
  }[];
}

interface ComposeGreetingWidgetData {
  relationship: string;
  occasion: string;
  tone: string;
  options: string[];
}

type WidgetPayload = 
  | { type: 'delivery'; data: DeliveryWidgetData }
  | { type: 'tracking'; data: TrackingWidgetData }
  | { type: 'product_info'; data: ProductInfoWidgetData }
  | { type: 'cart_add_success'; data: CartAddSuccessWidgetData }
  | { type: 'recommendations'; data: RecommendationsWidgetData }
  | { type: 'compose_greeting'; data: ComposeGreetingWidgetData };

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  widget?: WidgetPayload;
  widgets?: WidgetPayload[];
}

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

const CATEGORY_HUBS = [
  { label: 'Cakes', value: 'cakes', colorway: 'terracotta' },
  { label: 'Flowers', value: 'flowers', colorway: 'terracotta' },
  { label: 'Chocolates', value: 'Chocolates', colorway: 'terracotta' },
  { label: 'Grocery', value: 'Grocery', colorway: 'moss' },
  { label: 'Gifts', value: 'uniquegifts', colorway: 'terracotta' }
];

const SUGGESTION_CHIPS = [
  { label: 'Check Galle Delivery', prompt: 'Check if we deliver to Galle on Sunday', icon: '🚚' },
  { label: '🎂 Recommend Father\'s Day Gift', prompt: 'I have my father\'s birthday coming up, please recommend a cake or gift.', icon: '' },
  { label: '✍️ Compose Greeting Note', prompt: 'Compose a greeting note for my gift.', icon: '' },
  { label: '✨ Recommend One For Me', prompt: 'Recommend one for me', icon: '' },
  { label: 'Track Order ORD-MOCK-123', prompt: 'Track my order ORD-MOCK-123', icon: '📦' }
];



function GiftingImage({ src, alt, fill, sizes, className, category }: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  category?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleImageError = () => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('cake') || cat.includes('gateau') || cat.includes('cupcake')) setImgSrc('/assets/images/fallbacks/cakes.png');
    else if (cat.includes('flower') || cat.includes('rose') || cat.includes('bouquet') || cat.includes('lily') || cat.includes('orchid') || cat.includes('gerbera')) setImgSrc('/assets/images/fallbacks/flowers.png');
    else if (cat.includes('chocolate') || cat.includes('ferrero') || cat.includes('toblerone') || cat.includes('truffle') || cat.includes('choc')) setImgSrc('/assets/images/fallbacks/chocolates.png');
    else if (cat.includes('grocery') || cat.includes('groceries') || cat.includes('fruit') || cat.includes('veggie') || cat.includes('vegetable') || cat.includes('hamper') || cat.includes('basket') || cat.includes('food')) setImgSrc('/assets/images/fallbacks/grocery.png');
    else setImgSrc('/assets/images/fallbacks/uniquegifts.png');
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      onError={handleImageError}
      className={className}
    />
  );
}

const mapRecipientToDropdown = (rec: string): string => {
  if (!rec) return 'Someone Special';
  const r = rec.toLowerCase();
  if (r.includes('father') || r.includes('dad') || r.includes('thaththa')) return 'Dad';
  if (r.includes('mother') || r.includes('mom') || r.includes('amma')) return 'Mom';
  if (r.includes('partner') || r.includes('love') || r.includes('lover') || r.includes('husband') || r.includes('wife') || r.includes('gf') || r.includes('bf')) return 'Lover';
  if (r.includes('friend') || r.includes('yaluwa')) return 'Friend';
  return 'Someone Special';
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);
  const [view, setView] = useState<'browse' | 'details' | 'checkout' | 'confirmation'>('browse');
  const [selectedProduct, setSelectedProduct] = useState<KaprukaProduct | null>(null);
  
  // Cart & checkout states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [giftMessage, setGiftMessage] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    paymentUrl: string;
    grandTotal: number;
    recipientName: string;
    deliveryCity: string;
    deliveryDate: string;
  } | null>(null);

  const [searchCriteria, setSearchCriteria] = useState<{
    giftType: string;
    recipient: string;
    city: string | null;
    date: string | null;
  } | null>(null);

  const isSearchComplete = !!(searchCriteria && searchCriteria.city && searchCriteria.date);
  
  const [products, setProducts] = useState<KaprukaProduct[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  const [trackingPhoneInputs, setTrackingPhoneInputs] = useState<Record<string, string>>({});
  const [prefilledRecipient, setPrefilledRecipientState] = useState<{
    name?: string | null;
    address?: string | null;
    phone?: string | null;
  } | null>(null);

  const setPrefilledRecipient = useCallback((
    val: { name?: string | null; address?: string | null; phone?: string | null } | null | 
         ((prev: { name?: string | null; address?: string | null; phone?: string | null } | null) => 
           { name?: string | null; address?: string | null; phone?: string | null } | null)
  ) => {
    setPrefilledRecipientState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        if (next) {
          localStorage.setItem('kapruka_gifting_recipient', JSON.stringify(next));
        } else {
          localStorage.removeItem('kapruka_gifting_recipient');
        }
      } catch (e) {
        console.warn('Failed to save recipient to localStorage', e);
      }
      return next;
    });
  }, []);

  const [chatContext, setChatContext] = useState<{
    type: 'awaiting_recommendation_category' | 'awaiting_greeting_details' | 'awaiting_delivery_details';
    relationship?: string | null;
    occasion?: string | null;
    tone?: string | null;
  } | null>(null);

  const [chatLanguage, setChatLanguage] = useState<'en' | 'si'>('en');

  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'chat' | 'shop'>('chat');

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const isTransitioningRef = useRef(false);

  const scrollToSection = useCallback((targetStage: number) => {
    if (targetStage < 1 || targetStage > 4 || isTransitioningRef.current) return;
    
    isTransitioningRef.current = true;
    setCurrentSection(targetStage);
    setActiveStage(targetStage as 1 | 2 | 3 | 4);
    setIsWorkspaceActive(targetStage >= 2);

    const progressMap = {
      1: 0.0,
      2: 0.333,
      3: 0.666,
      4: 1.0
    };
    const targetProgress = progressMap[targetStage as 1 | 2 | 3 | 4];

    // 1. Animate main container translation
    const viewportHeight = window.innerHeight;
    const targetY = (targetStage - 1) * viewportHeight;

    gsap.to(containerRef.current, {
      y: -targetY,
      duration: 1.2,
      ease: 'power2.out',
      overwrite: 'auto'
    });

    // 2. Animate timeline progress (video currentTime & panel animation properties)
    if (tlRef.current) {
      gsap.to(tlRef.current, {
        progress: targetProgress,
        duration: 1.2,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => {
          isTransitioningRef.current = false;
        }
      });
    } else {
      isTransitioningRef.current = false;
    }
  }, []);

  // Handle Resize to adjust translation offset
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const viewportHeight = window.innerHeight;
        const targetY = (currentSection - 1) * viewportHeight;
        gsap.set(containerRef.current, { y: -targetY });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentSection]);

  // Lock body/html scroll when loaded
  useEffect(() => {
    if (isLoaded) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
    } else {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
  }, [isLoaded]);

  // Auto-scroll chat feed on new messages
  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages, isSearching]);

  // Gestural Scroll-Snapping Interceptor
  useEffect(() => {
    if (!isLoaded) return;
    
    // Wheel event interceptor
    const handleWheel = (e: WheelEvent) => {
      // Allow scroll inside scrollable containers (like chat feed or product lists)
      const target = e.target as HTMLElement;
      if (target && (target.closest('.overflow-y-auto') || target.closest('input') || target.closest('textarea'))) {
        const scrollContainer = target.closest('.overflow-y-auto') as HTMLElement;
        if (scrollContainer) {
          const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
          const isAtTop = scrollContainer.scrollTop === 0;
          const isAtBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 1;
          
          if (e.deltaY > 0 && !isAtBottom) return; // scroll down inside container
          if (e.deltaY < 0 && !isAtTop) return;    // scroll up inside container
        }
      }

      // Trackpad/wheel drift threshold
      if (Math.abs(e.deltaY) < 25) return;

      e.preventDefault();
      if (isTransitioningRef.current) return;

      if (e.deltaY > 0) {
        if (currentSection < 4) {
          scrollToSection(currentSection + 1);
        }
      } else if (e.deltaY < 0) {
        if (currentSection > 1) {
          scrollToSection(currentSection - 1);
        }
      }
    };

    // Touch events for mobile swiping
    let touchStart = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.closest('.overflow-y-auto') || target.closest('input') || target.closest('textarea'))) {
        return; // Let touch events handle native scrolling inside scrollable panels
      }

      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      const touchEnd = e.touches[0].clientY;
      const diff = touchStart - touchEnd;

      if (Math.abs(diff) > 80) { // minimum swipe distance (80px for mobile to avoid conflicts with panel scrolling)
        e.preventDefault();
        if (diff > 0) {
          if (currentSection < 4) {
            scrollToSection(currentSection + 1);
          }
        } else {
          if (currentSection > 1) {
            scrollToSection(currentSection - 1);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isLoaded, currentSection, scrollToSection]);

  // Master timeline initialization (paused, not driven by ScrollTrigger)
  useEffect(() => {
    if (!isLoaded || !videoRef.current) return;

    const video = videoRef.current;

    // iOS/Safari priming sequence
    const primeVideo = async () => {
      try {
        await video.play();
        video.pause();
        video.currentTime = 0;
      } catch (e) {
        console.warn('Video autoplay/priming blocked:', e);
      }
    };
    primeVideo();

    // Create master scrubbing timeline (paused, manually controlled by progress)
    const tl = gsap.timeline({
      paused: true
    });
    tlRef.current = tl;

    // 1. Scrub video currentTime linearly using a proxy to prevent sub-frame decoding jitter
    const videoProxy = { time: 0 };
    tl.to(videoProxy, {
      time: video.duration || 10,
      ease: 'none',
      duration: 1.0,
      onUpdate: () => {
        const frameTime = Math.round(videoProxy.time * 30) / 30;
        if (video.currentTime !== frameTime) {
          video.currentTime = frameTime;
        }
      }
    }, 0);

    // 2. Animate Hero Section (Section 1)
    tl.to('.hero-panel', { y: -100, opacity: 0, ease: 'none', duration: 0.20 }, 0);
    tl.to('.header-panel', { y: -80, opacity: 0, ease: 'none', duration: 0.20 }, 0);
    tl.to('.indicator-panel', { opacity: 0, ease: 'none', duration: 0.15 }, 0);

    // 3. Animate Workspace Section (Section 2)
    tl.fromTo('.sec2-left-panel', { y: 150, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.20 }, 0.10);
    tl.to('.sec2-left-panel', { y: -150, opacity: 0, ease: 'none', duration: 0.10 }, 0.45);

    tl.fromTo('.sec2-right-panel', { y: 200, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.20 }, 0.12);
    tl.to('.sec2-right-panel', { y: -200, opacity: 0, ease: 'none', duration: 0.10 }, 0.47);

    // 4. Animate Delivery Section (Section 3)
    tl.fromTo('.sec3-left-panel', { y: 150, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.20 }, 0.45);
    tl.to('.sec3-left-panel', { y: -150, opacity: 0, ease: 'none', duration: 0.10 }, 0.78);

    tl.fromTo('.sec3-right-panel', { y: 200, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.20 }, 0.47);
    tl.to('.sec3-right-panel', { y: -200, opacity: 0, ease: 'none', duration: 0.10 }, 0.80);

    // 5. Animate Confirmation Section (Section 4)
    tl.fromTo('.sec4-panel', { y: 150, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.20 }, 0.78);

    const handleMetadata = () => {
      tl.to(videoProxy, {
        time: video.duration || 10,
        ease: 'none',
        duration: 1.0,
        onUpdate: () => {
          const frameTime = Math.round(videoProxy.time * 30) / 30;
          if (video.currentTime !== frameTime) {
            video.currentTime = frameTime;
          }
        }
      }, 0);
    };
    if (video.readyState >= 1) {
      handleMetadata();
    } else {
      video.addEventListener('loadedmetadata', handleMetadata);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      tl.kill();
    };
  }, [isLoaded]);

  // Load cart on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kapruka_gifting_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
      
      const savedMsg = localStorage.getItem('kapruka_gifting_msg');
      if (savedMsg) setGiftMessage(savedMsg);

      const savedRecipient = localStorage.getItem('kapruka_gifting_recipient');
      if (savedRecipient) setPrefilledRecipientState(JSON.parse(savedRecipient));
    } catch (e) {
      console.warn('Failed to load cart/recipient from localStorage', e);
    }

    setMessages([
      {
        sender: 'ai',
        text: 'Ayubowan! 🇱🇰 Welcome to Kapruka Gifting. I am your premium Gifting Concierge. How can I help you make someone special smile today?\n\n💡 Try asking:\n• "Send a Chocolate fudge cake to Galle"\n• "Recommend one for me" (Let me pick the perfect gift for you!)\n• "Check if we deliver flowers to Galle on Sunday"\n• "Track my order ORD-MOCK-123"',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Save cart changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem('kapruka_gifting_cart', JSON.stringify(newCart));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  };

  const saveGiftMessage = (msg: string) => {
    setGiftMessage(msg);
    try {
      localStorage.setItem('kapruka_gifting_msg', msg);
    } catch (e) {
      console.warn('Failed to save message to localStorage', e);
    }
  };

  // Handle Journey Finder Search
  const handleJourneySearch = async (criteria: {
    giftType: string;
    recipient: string;
    city: string;
    date: string;
  }) => {
    setSearchCriteria(criteria);
    setIsSearching(true);
    setView('browse');
    
    const categoryMap: Record<string, string> = {
      'Cakes': 'cakes',
      'Flowers': 'flowers',
      'Chocolates': 'Chocolates',
      'Grocery': 'Grocery',
      'Gifts': 'uniquegifts'
    };
    const targetCat = categoryMap[criteria.giftType] || 'all';
    setActiveCategory(targetCat);

    const giftTypeSiMap: Record<string, string> = {
      'Cakes': 'කේක්',
      'Flowers': 'මල් බූකේ',
      'Chocolates': 'චොකලට්',
      'Grocery': 'ග්‍රොසරි (බඩු) පැකේජ්',
      'Gifts': 'විශේෂ තෑගි'
    };
    const recipientSiMap: Record<string, string> = {
      'Mom': 'අම්මා',
      'Dad': 'තාත්තා',
      'Lover': 'ආදරණීයයා',
      'Friend': 'මිතුරා',
      'Someone Special': 'විශේෂ කෙනෙකු',
      'Mother': 'අම්මා',
      'Father': 'තාත්තා',
      'Partner': 'ආදරණීයයා'
    };
    const citySiMap: Record<string, string> = {
      'Colombo': 'කොළඹ',
      'Galle': 'ගාල්ල',
      'Kandy': 'මහනුවර',
      'Negombo': 'මීගමුව',
      'Jaffna': 'යාපනය'
    };

    const giftTypeSi = giftTypeSiMap[criteria.giftType] || criteria.giftType;
    const recipientSi = recipientSiMap[criteria.recipient] || criteria.recipient;
    const citySi = criteria.city ? (citySiMap[criteria.city] || criteria.city) : '';

    const userText = chatLanguage === 'si'
      ? `${criteria.date} දින ${recipientSi} වෙත ${citySi} සඳහා ${giftTypeSi} යැවීමට මට අවශ්‍යයි.`
      : `I want to send ${criteria.giftType} to ${criteria.recipient} in ${criteria.city} on ${criteria.date}.`;
    
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    await performProductQuery(targetCat, criteria.city, criteria.date, criteria.recipient);
  };

  /**
   * Primary worker method to execute product catalog queries via server actions.
   * Feeds the visual shop workspace cards on the right-hand canvas.
   * 
   * @param category The target category search filter.
   * @param city The city recipient resides in.
   * @param date The date selected for delivery.
   * @param recipient The recipient label.
   * @param silent If true, suppresses posting a conversational update message from the assistant.
   */
  const performProductQuery = async (category: string, city: string | null, date: string | null, recipient: string, silent = false) => {
    if (!city || !date) {
      setIsSearching(false);
      if (!silent) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: chatLanguage === 'si'
              ? `බෙදා හැරීමේ හැකියාව පරීක්‍ෂා කිරීමට සහ සුදුසු තෑගි තේරීමට කරුණාකර දකුණු පසින් නගරය සහ දිනය තෝරන්න.`
              : `Please select a delivery city and date on the right panel to check availability for ${recipient}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      return;
    }
    setIsSearching(true);
    try {
      const queryCat = category === 'all' ? 'cakes' : category;
      const results = await searchProducts('', queryCat, 6);
      setProducts(results);
      if (results && results.length > 0) {
        setMobileActiveTab('shop');
      }

      if (!silent) {
        const giftTypeSiMap: Record<string, string> = {
          'cakes': 'කේක්',
          'flowers': 'මල් බූකේ',
          'Chocolates': 'චොකලට්',
          'Grocery': 'ග්‍රොසරි (බඩු) පැකේජ්',
          'uniquegifts': 'විශේෂ තෑගි',
          'all': 'තෑගි'
        };
        const recipientSiMap: Record<string, string> = {
          'Mom': 'අම්මා',
          'Dad': 'තාත්තා',
          'Lover': 'ආදරණීයයා',
          'Friend': 'මිතුරා',
          'Someone Special': 'විශේෂ කෙනෙකු',
          'Mother': 'අම්මා',
          'Father': 'තාත්තා',
          'Partner': 'ආදරණීයයා'
        };
        const citySiMap: Record<string, string> = {
          'Colombo': 'කොළඹ',
          'Galle': 'ගාල්ල',
          'Kandy': 'මහනුවර',
          'Negombo': 'මීගමුව',
          'Jaffna': 'යාපනය'
        };

        const giftTypeSi = giftTypeSiMap[category] || 'තෑගි';
        const recipientSi = recipientSiMap[recipient] || recipient;
        const citySi = city ? (citySiMap[city] || city) : '';

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: chatLanguage === 'si'
              ? `${recipientSi} සඳහා ${citySi} වෙත බෙදා හැරිය හැකි ප්‍රිමියම් ${giftTypeSi} ${results.length} ක් සොයා ගන්නා ලදී. විස්තර දකුණු පසින් බලාගත හැක.`
              : `Found ${results.length} premium options deliverable to ${city} for ${recipient}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Query error:', err);
      const errorText = chatLanguage === 'si'
        ? `කනගාටුයි, තෑගි නාමාවලිය සම්බන්ධ කර ගැනීමට අපහසු වී ඇත. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න.`
        : `We are temporarily experiencing difficulty connecting to the gifting catalog. Please try again in a few moments.`;
      
      if (!silent) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: errorText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Category Selector click handler
  const handleCategoryClick = async (catValue: string) => {
    if (isSearching) return;
    setActiveCategory(catValue);
    
    const cityName = searchCriteria?.city || 'Colombo';
    const deliveryDate = searchCriteria?.date || new Date().toISOString().split('T')[0];
    const rec = searchCriteria?.recipient || 'Someone Special';

    await performProductQuery(catValue, cityName, deliveryDate, rec, true);
  };

  const handleVerifyTracking = async (msgIdx: number, widgetIdx: number, orderNumber: string, phone: string) => {
    try {
      const trackInfo = await trackOrder(orderNumber, phone);
      
      setMessages(prev => {
        const next = [...prev];
        const msg = next[msgIdx];
        if (msg) {
          const updatedWidget = {
            type: 'tracking' as const,
            data: {
              orderNumber,
              status: trackInfo.status,
              city: trackInfo.city,
              items: trackInfo.items || 'Gifting Items',
              verified: trackInfo.verified,
              message: trackInfo.message
            }
          };
          if (msg.widgets && msg.widgets[widgetIdx]) {
            msg.widgets[widgetIdx] = updatedWidget;
          } else if (msg.widget) {
            msg.widget = updatedWidget;
          }
        }
        return next;
      });
      

    } catch (err) {
      console.error('Failed to verify tracking:', err);
    }
  };

  // Conversational text input
  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    
    const userText = customText || inputValue;
    if (!userText.trim() || isSearching) return;

    if (!customText) {
      setInputValue('');
    }

    // Auto-detect Sinhala or Tanglish
    const isSinhalaInput = /[\u0D80-\u0DFF]/.test(userText) || /\b(thaththa|thaththata|amma|ammata|malli|mallita|nangi|nangita|yaluwa|yaluwata|upandinaya|updandinaya|upandinayata|updandinayata|upadinaya|upadinayata|subha|suba|wachana|wewa|onee|oni|onay|mata|mage|oyata|oyage|keeyada|kiyada|keeyak|kiyak|gana|ganan|ganada|tiyenawada|thiyenawada|tiyeda|thiyeda|puluwanda|puluwada|yawanna|yavanna|denna|nadda|mokakda|mokadda)\b/i.test(userText) || /\bekak\s+one\b/i.test(userText);
    
    let activeLang = chatLanguage;
    if (isSinhalaInput && chatLanguage !== 'si') {
      setChatLanguage('si');
      activeLang = 'si';
    } else if (!isSinhalaInput && chatLanguage === 'si') {
      setChatLanguage('en');
      activeLang = 'en';
    }

    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsSearching(true);
    setView('browse');

    try {
      let finalReply = '';
      let widgetPayload: WidgetPayload | undefined = undefined;
      let widgetsArray: WidgetPayload[] = [];

      const citySiMap: Record<string, string> = {
        'Colombo': 'කොළඹ',
        'Galle': 'ගාල්ල',
        'Kandy': 'මහනුවර',
        'Negombo': 'මීගමුව',
        'Jaffna': 'යාපනය'
      };

      const recipientSiMap: Record<string, string> = {
        'Someone Special': 'විශේෂ කෙනෙකු',
        'Mother': 'අම්මා',
        'Father': 'තාත්තා',
        'Partner': 'ආදරණීයයා',
        'Brother': 'මල්ලි/අයියා',
        'Sister': 'නංගි/අක්කා',
        'Friend': 'මිතුරා',
        'mother': 'අම්මා',
        'father': 'තාත්තා',
        'partner': 'ආදරණීයයා',
        'brother': 'මල්ලි/අයියා',
        'sister': 'නංගි/අක්කා',
        'friend': 'මිතුරා'
      };

      if (chatContext?.type === 'awaiting_recommendation_category') {
        const textLower = userText.toLowerCase();
        let chosenCategory = 'all';
        if (textLower.includes('cake') || textLower.includes('කේක්')) {
          chosenCategory = 'cakes';
        } else if (textLower.includes('flower') || textLower.includes('මල්') || textLower.includes('rose')) {
          chosenCategory = 'flowers';
        } else if (textLower.includes('chocolate') || textLower.includes('චොකලට්')) {
          chosenCategory = 'Chocolates';
        } else if (textLower.includes('grocer') || textLower.includes('එළවළු') || textLower.includes('fruit')) {
          chosenCategory = 'Grocery';
        } else if (textLower.includes('gift') || textLower.includes('තෑගි')) {
          chosenCategory = 'uniquegifts';
        }

        setActiveCategory(chosenCategory);
        setChatContext(null);

        const searchResults = await searchProducts('gift', chosenCategory, 3);

        if (searchResults && searchResults.length > 0) {
          setProducts(searchResults);
          setMobileActiveTab('shop');
          widgetPayload = {
            type: 'recommendations',
            data: {
              occasion: chatContext.occasion || 'Special Celebration',
              products: searchResults.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                stock: p.stock,
                weight: p.weight || '2.2 lbs (1.0 kg)',
                category: p.category,
                url: p.url
              }))
            }
          };
          finalReply = `Perfect! Based on your preference for ${chosenCategory === 'all' ? 'gifts' : chosenCategory}, here are some recommended items for your ${chatContext.relationship || 'special'} gift:`;
        } else {
          finalReply = `I couldn't find any specific catalog recommendations for ${chosenCategory}. Let me know if you would like to search for cakes, flowers, or chocolates.`;
        }

      } else if (chatContext?.type === 'awaiting_greeting_details') {
        const textLower = userText.toLowerCase();

        // Dynamically resolve relationship
        let relationship = chatContext.relationship;
        if (!relationship) {
          if (textLower.includes('husband') || textLower.includes('hubby')) relationship = 'husband';
          else if (textLower.includes('wife') || textLower.includes('wifey')) relationship = 'wife';
          else if (textLower.includes('boyfriend') || textLower.includes('bf')) relationship = 'boyfriend';
          else if (textLower.includes('girlfriend') || textLower.includes('gf')) relationship = 'girlfriend';
          else if (textLower.includes('mom') || textLower.includes('mother') || textLower.includes('amma')) relationship = 'mother';
          else if (textLower.includes('dad') || textLower.includes('father') || textLower.includes('thaththa')) relationship = 'father';
          else if (textLower.includes('brother') || textLower.includes('malli') || textLower.includes('ayiya')) relationship = 'brother';
          else if (textLower.includes('sister') || textLower.includes('nangi') || textLower.includes('akka')) relationship = 'sister';
          else if (textLower.includes('friend') || textLower.includes('bestie') || textLower.includes('yaluwa')) relationship = 'friend';
          else if (textLower.includes('partner') || textLower.includes('love')) relationship = 'partner';
        }

        // Dynamically resolve occasion (supporting Sinhala & Tanglish)
        let occasion = chatContext.occasion;
        if (!occasion) {
          if (textLower.includes('birthday') || textLower.includes('bday') || textLower.includes('upandinaya') || textLower.includes('updandinaya') || textLower.includes('upadinaya') || textLower.includes('upandina') || textLower.includes('උපන්දිනය') || textLower.includes('උපන්දින') || textLower.includes('updandinayata') || textLower.includes('upandinayata') || textLower.includes('upadinayata')) occasion = 'birthday';
          else if (textLower.includes('anniversary') || textLower.includes('wedding') || textLower.includes('සංවත්සරය') || textLower.includes('anniversariya')) occasion = 'anniversary';
          else if (textLower.includes('retirement') || textLower.includes('විශ්‍රාම') || textLower.includes('visrama')) occasion = 'retirement';
          else if (textLower.includes('graduation') || textLower.includes('උපාධි') || textLower.includes('upadhi')) occasion = 'graduation';
          else if (textLower.includes('valentines') || textLower.includes('valentine')) occasion = 'valentine';
          else if (textLower.includes('christmas')) occasion = 'christmas';
        }

        relationship = relationship || 'someone special';
        occasion = occasion || 'special day';
        const tone = chatContext.tone || (textLower.includes('romantic') ? 'romantic' : textLower.includes('funny') || textLower.includes('humorous') ? 'funny' : 'warm');

        // Extract recipient name if mentioned
        let extractedRecName = prefilledRecipient?.name || null;
        const nameRegex = /(?:name is|name:|recipient is|recipient name is|for)\s+([a-z]+(?:\s+[a-z]+)?)/i;
        const nameM = userText.match(nameRegex);
        if (nameM) {
          const relationWords = ['boyfriend', 'girlfriend', 'husband', 'wife', 'dad', 'mom', 'father', 'mother', 'friend', 'someone', 'partner'];
          const matchedName = nameM[1].trim();
          if (!relationWords.includes(matchedName.toLowerCase())) {
            extractedRecName = matchedName;
          }
        }

        // Extract custom memories and avoid placeholders
        const memories = extractCustomMemories(userText, relationship, occasion, extractedRecName);

        setChatContext(null);

        const greetings = generateGreetings(relationship, occasion, tone, memories, activeLang === 'si', extractedRecName);

        widgetPayload = {
          type: 'compose_greeting',
          data: {
            relationship,
            occasion,
            tone,
            options: greetings
          }
        };
        finalReply = activeLang === 'si'
          ? `ඔබගේ ${relationship === 'father' ? 'තාත්තා' : relationship === 'mother' ? 'අම්මා' : relationship} ගේ ${occasion === 'birthday' ? 'උපන්දිනය' : 'විශේෂ දිනය'} වෙනුවෙන් මා සකස් කල සුබපැතුම් 3 මෙන්න. එය ඇතුලත් කිරීමට "Apply" ක්ලික් කරන්න!`
          : `Here are 3 custom intimate greeting note options I've written for your ${relationship}'s ${occasion} based on your personal details. Click "Apply" to copy it directly to your gift note!`;

      } else if (chatContext?.type === 'awaiting_delivery_details') {
        const textLower = userText.toLowerCase();
        
        let extractedName: string | null = null;
        let extractedAddress: string | null = null;
        let extractedPhone: string | null = null;

        const phoneRegex = /(?:\+94|0)?7[0-9]{8}\b/;
        const phoneM = userText.match(phoneRegex);
        if (phoneM) extractedPhone = phoneM[0];

        const addressRegex = /(?:address is|address:|deliver to|delivery address:)\s+([^,.\n]+)/i;
        const addressM = userText.match(addressRegex);
        if (addressM) {
          extractedAddress = addressM[1].trim();
        } else {
          const roadM = userText.match(/(\d+\s+[^,.\n]+(?:road|street|lane|ward|ave|avenue|garden|gardens)[^,.\n]*)/i);
          if (roadM) extractedAddress = roadM[1].trim();
        }

        const nameRegex = /(?:name is|name:|recipient is|recipient name is|for)\s+([a-z]+(?:\s+[a-z]+)?)/i;
        const nameM = userText.match(nameRegex);
        if (nameM) {
          const relationWords = ['boyfriend', 'girlfriend', 'husband', 'wife', 'dad', 'mom', 'father', 'mother', 'friend', 'someone', 'partner'];
          const matchedName = nameM[1].trim();
          if (!relationWords.includes(matchedName.toLowerCase())) {
            extractedName = matchedName;
          }
        }

        if (!extractedName && userText.split(' ').length <= 3 && !extractedPhone && !textLower.includes('road') && !textLower.includes('street')) {
          extractedName = userText.trim();
        } else if (!extractedAddress && (textLower.includes('road') || textLower.includes('street') || textLower.includes('house') || textLower.includes('no.'))) {
          extractedAddress = userText.trim();
        }

        setPrefilledRecipient((prev) => {
          const updated = {
            name: extractedName || prev?.name || null,
            address: extractedAddress || prev?.address || null,
            phone: extractedPhone || prev?.phone || null
          };

          const hasName = updated.name;
          const hasAddress = updated.address;
          const hasPhone = updated.phone;

          if (!hasName || !hasAddress || !hasPhone) {
            const missingList = [];
            if (!hasName) missingList.push("recipient's name");
            if (!hasAddress) missingList.push("delivery address");
            if (!hasPhone) missingList.push("contact phone number");
            
            finalReply = `Thank you! I've updated the delivery details. Could you please also tell me the ${missingList.join(', ')}?`;
          } else {
            setChatContext(null);
            finalReply = `Excellent! I have successfully collected all delivery details:\n\n• Name: ${updated.name}\n• Address: ${updated.address}\n• Phone: ${updated.phone}\n\nI have prefilled these details in your delivery form. You can proceed with the checkout!`;
          }

          return updated;
        });

      } else {
        // 1. Process chat message using Gemini to extract intent & criteria
        const result = await processChatMessage(userText, activeLang === 'si');
        const { detectedIntent, detectedIntents, detectedCategory, cleanSearchTerm, requiresClarification, clarificationPrompt, extractedCriteria, widgetData, conversationalReply } = result;

        // Sync active category if found
        if (detectedCategory && detectedCategory !== 'all') {
          setActiveCategory(detectedCategory);
        }

        // Sync prefilled recipient details if extracted from chat
        if (widgetData) {
          setPrefilledRecipient((prev) => ({
            name: widgetData.recipientDetails?.name || widgetData.recipientName || prev?.name || null,
            address: widgetData.recipientDetails?.address || prev?.address || null,
            phone: widgetData.recipientDetails?.phone || prev?.phone || null
          }));
        }

        finalReply = conversationalReply;

        // Synchronize Journey Finder state for all AI processed intents
        setSearchCriteria(prev => {
          const giftTypeMap: Record<string, string> = {
            'cakes': 'Cakes',
            'flowers': 'Flowers',
            'Chocolates': 'Chocolates',
            'Grocery': 'Grocery',
            'uniquegifts': 'Gifts'
          };
          const currentCriteria = prev || {
            giftType: 'Cakes',
            recipient: 'Someone Special',
            city: null,
            date: null
          };
          
          const rawRecipient = extractedCriteria?.recipient || currentCriteria.recipient;
          const mappedRecipient = mapRecipientToDropdown(rawRecipient);

          return {
            giftType: giftTypeMap[detectedCategory] || extractedCriteria?.giftType || currentCriteria.giftType,
            recipient: mappedRecipient,
            city: extractedCriteria?.city || currentCriteria.city,
            date: extractedCriteria?.date || currentCriteria.date
          };
        });

        // Handle Clarification Requests (Do not let AI guess)
        let accumulatedReply = conversationalReply || '';

        if (requiresClarification && clarificationPrompt) {
          accumulatedReply = clarificationPrompt;
          if (detectedIntent === 'recommend') {
            setChatContext({
              type: 'awaiting_recommendation_category',
              relationship: widgetData?.relationship,
              occasion: widgetData?.occasion
            });
          } else if (detectedIntent === 'compose_greeting') {
            setChatContext({
              type: 'awaiting_greeting_details',
              relationship: widgetData?.relationship,
              occasion: widgetData?.occasion,
              tone: widgetData?.tone
            });
          }
        } else {
          // Process all detected intents
          const intentsToProcess = detectedIntents || [detectedIntent];
          
          for (const intent of intentsToProcess) {
            if (intent === 'add_to_cart') {
              const prodQuery = widgetData?.productName || cleanSearchTerm || '';
              const city = widgetData?.city || extractedCriteria?.city || 'Colombo';
              const date = widgetData?.date || extractedCriteria?.date || new Date().toISOString().split('T')[0];
              const qty = widgetData?.quantity || 1;

              // Query product catalog
              const searchResults = await searchProducts(prodQuery, 'all', 1);

              if (searchResults && searchResults.length > 0) {
                const product = searchResults[0];

                // Run delivery availability check
                const deliveryInfo = await checkDelivery(city, date, product.id);

                if (deliveryInfo.deliverable) {
                  // Setup customization and add directly to cart
                  const newItem = {
                    product,
                    quantity: qty,
                    customization: {
                      weight: product.weight || '2.2 lbs (1.0 kg)',
                      flavour: product.category === 'cakes' ? 'Chocolate Fudge' : 'Standard',
                      icingText: '',
                      addedPrice: 0,
                      deliveryDate: date,
                      deliveryFee: deliveryInfo.rate
                    }
                  };

                  const newCart = [...cart, newItem];
                  saveCart(newCart);

                  widgetsArray.push({
                    type: 'cart_add_success',
                    data: {
                      productName: product.name,
                      image: product.image,
                      quantity: qty,
                      city,
                      date,
                      price: product.price,
                      deliveryFee: deliveryInfo.rate,
                      total: (product.price * qty) + deliveryInfo.rate
                    }
                  });

                  const successMsg = activeLang === 'si'
                    ? `"${product.name}" (ප්‍රමාණය: ${qty}) සාර්ථකව ඔබගේ කාර්ට් එකට එකතු කරන ලදී, බෙදා හැරීම ${citySiMap[city] || city} වෙත ${date} දින සිදු කෙරේ.`
                    : `I've successfully added "${product.name}" (Qty: ${qty}) to your cart, set for delivery to ${city} on ${date}.`;

                  // Ask for missing recipient details if they are not already filled
                  const hasName = prefilledRecipient?.name || widgetData?.recipientDetails?.name;
                  const hasAddress = prefilledRecipient?.address || widgetData?.recipientDetails?.address;
                  const hasPhone = prefilledRecipient?.phone || widgetData?.recipientDetails?.phone;

                  let detailPrompt = '';
                  if (!hasName || !hasAddress || !hasPhone) {
                    const missingList = [];
                    if (!hasName) missingList.push(activeLang === 'si' ? "ලබන්නාගේ නම" : "recipient's name");
                    if (!hasAddress) missingList.push(activeLang === 'si' ? "බෙදා හැරීමේ ලිපිනය" : "delivery address");
                    if (!hasPhone) missingList.push(activeLang === 'si' ? "දුරකථන අංකය" : "contact phone number");
                    
                    detailPrompt = activeLang === 'si'
                      ? `\n\nබෙදා හැරීම සම්පූර්ණ කිරීම සඳහා කරුණාකර මට ${missingList.join(', ')} පවසන්න.`
                      : `\n\nTo complete delivery setup, could you please tell me the ${missingList.join(', ')}?`;
                    setChatContext({
                      type: 'awaiting_delivery_details'
                    });
                  } else {
                    detailPrompt = activeLang === 'si'
                      ? `\n\nමම මෙම බෙදා හැරීමේ තොරතුරු පහත ඇණවුම් පෝරමයේ ඇතුලත් කර ඇත. ඔබට ඕනෑම වේලාවක එය පරීක්ෂා කළ හැක!`
                      : `\n\nI have prefilled these delivery details in your order form below. You can review them anytime!`;
                  }
                  
                  if (accumulatedReply === conversationalReply || !accumulatedReply) {
                    accumulatedReply = successMsg + detailPrompt;
                  } else {
                    accumulatedReply += '\n\n' + successMsg + detailPrompt;
                  }
                } else {
                  const errMessage = activeLang === 'si'
                    ? `"${product.name}" සොයා ගන්නා ලදී නමුත් ${citySiMap[city] || city} වෙත ${date} දින බෙදා හැරීම සිදු කළ නොහැක. (හේතුව: ${deliveryInfo.message})`
                    : `I found "${product.name}" but delivery is not available to ${city} on ${date}. Reason: ${deliveryInfo.message}`;
                  
                  if (accumulatedReply === conversationalReply || !accumulatedReply) {
                    accumulatedReply = errMessage;
                  } else {
                    accumulatedReply += '\n\n' + errMessage;
                  }
                }
              } else {
                const notFoundMsg = activeLang === 'si'
                  ? `"${prodQuery}" සඳහා ගැළපෙන නිෂ්පාදනයක් සෙවිය නොහැක. කරුණාකර ඔබ කැමති කේක්, මල් බූකේ, හෝ චොකලට් වර්ගය කුමක්දැයි පැහැදිලි කරන්න.`
                  : `I couldn't find a product matching "${prodQuery}" to add to your cart. Could you please specify which exact cake, chocolate, or flowers you would like to select?`;
                
                if (accumulatedReply === conversationalReply || !accumulatedReply) {
                  accumulatedReply = notFoundMsg;
                } else {
                  accumulatedReply += '\n\n' + notFoundMsg;
                }
              }

            } else if (intent === 'recommend') {
              const queryCat = detectedCategory === 'all' ? 'cakes' : detectedCategory;
              const searchResults = await searchProducts(cleanSearchTerm || 'gift', queryCat, 3);

              if (searchResults && searchResults.length > 0) {
                setProducts(searchResults);
                setMobileActiveTab('shop');
                widgetsArray.push({
                  type: 'recommendations',
                  data: {
                    occasion: widgetData?.occasion || 'Special Celebration',
                    products: searchResults.map(p => ({
                      id: p.id,
                      name: p.name,
                      price: p.price,
                      image: p.image,
                      stock: p.stock,
                      weight: p.weight || '2.2 lbs (1.0 kg)',
                      category: p.category,
                      url: p.url
                    }))
                  }
                });
                const relDisplay = widgetData?.relationship ? (recipientSiMap[widgetData.relationship] || widgetData.relationship) : 'විශේෂ කෙනෙකු';
                const recMsg = activeLang === 'si'
                  ? `ඔබගේ ${relDisplay} සඳහා වන නිර්දේශ කිහිපයක් මෙන්න. විස්තර පහතින් බලාගත හැක:`
                  : `Based on your request for a ${widgetData?.relationship || 'special'} gift, I recommend these options. You can review and select them directly below:`;
                
                if (accumulatedReply === conversationalReply || !accumulatedReply) {
                  accumulatedReply = recMsg;
                } else {
                  accumulatedReply += '\n\n' + recMsg;
                }
              } else {
                const noRecMsg = activeLang === 'si'
                  ? `"${cleanSearchTerm}" සඳහා නිර්දේශ කිහිපයක් සෙවිය නොහැක. කරුණාකර කේක්, මල් බූකේ, හෝ චොකලට් වලින් කුමක් තෝරන්නේදැයි පවසන්න.`
                  : `I couldn't find any specific catalog recommendations for "${cleanSearchTerm}". Could you please clarify if you prefer Cakes, Flowers, or Chocolates?`;
                
                if (accumulatedReply === conversationalReply || !accumulatedReply) {
                  accumulatedReply = noRecMsg;
                } else {
                  accumulatedReply += '\n\n' + noRecMsg;
                }
              }

            } else if (intent === 'compose_greeting') {
              const tone = widgetData?.tone || 'warm';
              const relationship = widgetData?.relationship || 'friend';
              const occasion = widgetData?.occasion || 'birthday';

              // Use memory extracted by Gemini if available (even if null), otherwise fallback to local regex helper
              const memories = widgetData && widgetData.customMemory !== undefined
                ? widgetData.customMemory
                : extractCustomMemories(userText, relationship, occasion, widgetData?.recipientName);
              const greetings = generateGreetings(relationship, occasion, tone, memories, activeLang === 'si', widgetData?.recipientName);

              widgetsArray.push({
                type: 'compose_greeting',
                data: {
                  relationship,
                  occasion,
                  tone,
                  options: greetings
                }
              });
              const greetingMsg = activeLang === 'si'
                ? `ඔබගේ ${relationship === 'father' ? 'තාත්තා' : relationship === 'mother' ? 'අම්මා' : relationship} ගේ ${occasion === 'birthday' ? 'උපන්දිනය' : 'විශේෂ දිනය'} වෙනුවෙන් මා සකස් කල සුබපැතුම් 3 මෙන්න. එය ඇතුලත් කිරීමට "Apply" ක්ලික් කරන්න!`
                : `Here are 3 custom greeting note options I've written for your ${relationship}'s ${occasion}. Click "Apply" to copy it directly to your gift note!`;

              if (accumulatedReply === conversationalReply || !accumulatedReply) {
                accumulatedReply = greetingMsg;
              } else {
                accumulatedReply += '\n\n' + greetingMsg;
              }

            } else if (intent === 'check_delivery') {
              const city = widgetData?.city || extractedCriteria?.city || 'Colombo';
              const date = widgetData?.date || extractedCriteria?.date || new Date().toISOString().split('T')[0];
              const deliveryInfo = await checkDelivery(city, date);

              widgetsArray.push({
                type: 'delivery',
                data: {
                  city,
                  date,
                  deliverable: deliveryInfo.deliverable,
                  rate: deliveryInfo.rate,
                  message: deliveryInfo.message
                }
              });
              const deliveryMsg = deliveryInfo.deliverable
                ? (activeLang === 'si'
                  ? `${citySiMap[city] || city} වෙත ${date} දින බෙදා හැරීම සිදු කළ හැක. බෙදා හැරීමේ ගාස්තුව: LKR ${deliveryInfo.rate.toLocaleString()}`
                  : `Delivery is available to ${city} on ${date}. Delivery fee is LKR ${deliveryInfo.rate.toLocaleString()}`)
                : (activeLang === 'si'
                  ? `${citySiMap[city] || city} වෙත ${date} දින බෙදා හැරීම සිදු කළ නොහැක. (හේතුව: ${deliveryInfo.message})`
                  : `Delivery is not available to ${city} on ${date}. Reason: ${deliveryInfo.message}`);
              
              if (accumulatedReply === conversationalReply || !accumulatedReply) {
                accumulatedReply = deliveryMsg;
              } else {
                accumulatedReply += '\n\n' + deliveryMsg;
              }

            } else if (intent === 'track_order') {
              const orderNumber = widgetData?.orderNumber || '';
              const verificationPhone = widgetData?.verificationPhone || '';

              const trackInfo = await trackOrder(orderNumber, verificationPhone);
              widgetsArray.push({
                type: 'tracking',
                data: {
                  orderNumber,
                  status: trackInfo.status,
                  city: trackInfo.city,
                  items: trackInfo.items || 'Gifting Items',
                  verified: trackInfo.verified,
                  message: trackInfo.message
                }
              });

              let trackMsg = '';
              if (trackInfo.verified) {
                const statusMapEn: Record<string, string> = { ordered: 'Ordered', prepared: 'Prepared/Baking', dispatched: 'Dispatched/Out for Delivery', delivered: 'Delivered' };
                const statusMapSi: Record<string, string> = { ordered: 'ඇණවුම් කර ඇත', prepared: 'සූදානම් කරමින් පවතී', dispatched: 'බෙදාහැරීමට පිටත්ව ඇත', delivered: 'භාර දී ඇත' };
                
                const currentStatus = trackInfo.status || 'ordered';
                const destCity = trackInfo.city || '';
                trackMsg = activeLang === 'si'
                  ? `ඇණවුම් අංක ${orderNumber} සාර්ථකව සොයා ගන්නා ලදී. වත්මන් තත්ත්වය: ${statusMapSi[currentStatus] || currentStatus} (${citySiMap[destCity] || destCity} වෙත)`
                  : `Order ${orderNumber} status retrieved: ${statusMapEn[currentStatus] || currentStatus} (delivering to ${destCity}).`;
              } else {
                trackMsg = trackInfo.message || 'Verification failed.';
              }

              if (accumulatedReply === conversationalReply || !accumulatedReply) {
                accumulatedReply = trackMsg;
              } else {
                accumulatedReply += '\n\n' + trackMsg;
              }

            } else if (intent === 'get_product_info') {
              const productQuery = widgetData?.productQuery || cleanSearchTerm || '';
              const searchResults = await searchProducts(productQuery, 'all', 1);

              if (searchResults && searchResults.length > 0) {
                const matchedProduct = searchResults[0];
                const ingredients = getIngredientsForProduct(matchedProduct.name, matchedProduct.category || 'cakes');
                const allergens = getAllergensForProduct(matchedProduct.name, matchedProduct.category || 'cakes');

                widgetsArray.push({
                  type: 'product_info',
                  data: {
                    id: matchedProduct.id,
                    name: matchedProduct.name,
                    price: matchedProduct.price,
                    image: matchedProduct.image,
                    stock: matchedProduct.stock,
                    description: matchedProduct.description || 'A premium selection from Kapruka Gifting.',
                    weight: matchedProduct.weight || '2.2 lbs (1.0 kg)',
                    ingredients,
                    allergens
                  }
                });

                const infoMsg = activeLang === 'si'
                  ? `"${matchedProduct.name}" සඳහා භාණ්ඩයේ විස්තර සහ අඩංගු ද්‍රව්‍ය සූදානම් කර ඇත.`
                  : `Here are the product specifications and ingredients for "${matchedProduct.name}".`;

                if (accumulatedReply === conversationalReply || !accumulatedReply) {
                  accumulatedReply = infoMsg;
                } else {
                  accumulatedReply += '\n\n' + infoMsg;
                }
              } else {
                const notFoundInfoMsg = activeLang === 'si'
                  ? `"${productQuery}" සඳහා විස්තර සෙවිය නොහැක. වෙනත් භාණ්ඩයක් සඳහා විමසන්න.`
                  : `I couldn't find details for a product matching "${productQuery}". Let me know if you would like me to search for another gift.`;

                if (accumulatedReply === conversationalReply || !accumulatedReply) {
                  accumulatedReply = notFoundInfoMsg;
                } else {
                  accumulatedReply += '\n\n' + notFoundInfoMsg;
                }
              }
            } else {
              // Fallback or search intent
              const queryCat = detectedCategory === 'all' ? 'cakes' : detectedCategory;
              const results = await searchProducts(cleanSearchTerm, queryCat, 6);
              setProducts(results);
              if (results && results.length > 0) {
                setMobileActiveTab('shop');
              }
            }
          }
        }

        finalReply = accumulatedReply;
      }

      // 3. Post AI response to chat
      if (widgetPayload && widgetsArray.indexOf(widgetPayload) === -1) {
        widgetsArray.push(widgetPayload);
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: finalReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          widgets: widgetsArray
        }
      ]);
    } catch (err) {
      console.error('Search error:', err);
      const errorText = chatLanguage === 'si'
        ? `සන්නිවේදන ගැටලුවක් පවතී. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න.`
        : `We encountered a connection issue processing your request. Please try again in a moment.`;
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: errorText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSend(undefined, prompt);
  };

  // Product Selection (triggers customizer view)
  const handleProductSelect = (product: KaprukaProduct) => {
    setSelectedProduct(product);
    setView('details');

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: chatLanguage === 'si'
          ? `විශිෂ්ට තේරීමක්! "${product.name}" සඳහා වන හැඩගැස්වීමේ පැනලය දකුණු පසින් විවෘත කර ඇත. කරුණාකර ඔබගේ කැමැත්ත පරිදි සකසා, බෙදාහැරීමේ දිනය පරීක්ෂා කර එය කාර්ට් එකට එකතු කරන්න.`
          : `Excellent choice! I have opened the customization panel for "${product.name}" on the right workspace. Please configure your options, check the deliverability date, and add it to your cart.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Add customized item to cart
  const handleAddToCart = (item: CartItem) => {
    const updatedCart = [...cart, item];
    saveCart(updatedCart);
    setIsCartOpen(true);
    setView('browse');
    setSelectedProduct(null);

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: chatLanguage === 'si'
          ? `"${item.product.name}" සාර්ථකව ඔබගේ කාර්ට් එකට එකතු කරන ලදී! ඔබට එය පැති මෙනුවෙන් බලාගත හැක. තවත් තෑගි බැලීමට හෝ කෙලින්ම checkout කිරීමට මට පවසන්න.`
          : `Successfully added "${item.product.name}" to your gifting cart! You can see it in the sidebar drawer. Let me know if you would like to browse more gifts or proceed directly to checkout.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Add product directly to cart from product card list
  const handleDirectAddToCart = async (product: KaprukaProduct) => {
    const city = searchCriteria?.city || 'Colombo';
    const date = searchCriteria?.date || new Date().toISOString().split('T')[0];
    
    let deliveryFee = 350;
    try {
      const deliveryInfo = await checkDelivery(city, date, product.id);
      if (deliveryInfo.deliverable) {
        deliveryFee = deliveryInfo.rate;
      }
    } catch (err) {
      console.warn('Failed to check direct delivery fee, using fallback:', err);
    }

    const newItem: CartItem = {
      product,
      quantity: 1,
      customization: {
        weight: product.weight || '1kg',
        flavour: product.category === 'cakes' ? 'Chocolate' : 'Standard',
        icingText: '',
        addedPrice: 0,
        deliveryDate: date,
        deliveryFee
      }
    };

    handleAddToCart(newItem);
  };

  // Cart helper functions
  const handleUpdateQuantity = (idx: number, qty: number) => {
    const newCart = [...cart];
    newCart[idx].quantity = qty;
    saveCart(newCart);
  };

  const handleRemoveItem = (idx: number) => {
    const newCart = cart.filter((_, i) => i !== idx);
    saveCart(newCart);
  };

  const handleCheckoutTrigger = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      scrollToSection(3);
    }, 100);
  };

  // Success checkout redirect
  const handleCheckoutSuccess = (data: typeof orderData) => {
    setOrderData(data);
    
    // Clear cart locally but keep state until starting a new order
    saveCart([]);
    saveGiftMessage('');
    setPrefilledRecipient(null);

    setTimeout(() => {
      scrollToSection(4);
    }, 100);

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: chatLanguage === 'si'
          ? `සුබ පැතුම්! ඔබගේ ඇණවුම #${data?.orderNumber} සාර්ථකව නිර්මාණය කරන ලදී. ගෙවීම් අවසන් කිරීමට දකුණු පස ඇති ලින්ක් එක භාවිතා කරන්න. මම ඇණවුමේ තත්ත්වය නිරීක්ෂණය කරමින් සිටිමි!`
          : `Congratulations! Order Reference #${data?.orderNumber} has been successfully created. Click the payment link on the right workspace to complete the transaction secure link. I will be tracking your delivery status!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleReset = () => {
    setSearchCriteria(null);
    setProducts([]);
    setActiveCategory('all');
    setView('browse');
    setSelectedProduct(null);
  };

  const handleNewOrder = () => {
    setOrderData(null);
    setSearchCriteria(null);
    setProducts([]);
    setActiveCategory('all');
    setView('browse');
    setSelectedProduct(null);
    saveCart([]);
    setPrefilledRecipient(null);
    setTimeout(() => {
      scrollToSection(2);
    }, 100);
  };

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <>
      {/* Video Background Frame Engine - rendered immediately to preload at root */}
      <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#16191e] transition-opacity duration-700 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          src="/assets/video/BACKGROUND.mp4" 
          muted 
          playsInline 
          preload="auto" 
        />
        {/* Subtle dark vignette overlay to preserve foreground text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/65 opacity-85" />
      </div>

      {/* Preloader mapping */}
      {!isLoaded && (
        <Preloader 
          onReveal={() => setShowContent(true)} 
          onComplete={() => {
            setShowContent(true);
            setIsLoaded(true);
          }} 
        />
      )}

      {/* SIDEBAR CART DRAWER - Rendered at root level to prevent parent container transform translation offset (fixed containing-block bug) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        giftMessage={giftMessage}
        onUpdateGiftMessage={saveGiftMessage}
        onCheckout={handleCheckoutTrigger}
      />

      {showContent && (
        <div 
          ref={containerRef} 
          className="relative w-full min-h-screen transition-transform duration-100 ease-out" 
          id="main-scroll-container"
          style={{ willChange: 'transform' }}
        >
          <style>{`
            @keyframes scrollDot {
              0% { transform: translateY(0); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateY(10px); opacity: 0; }
            }
            .animate-scroll-dot {
              animation: scrollDot 1.6s infinite ease-in-out;
            }
          `}</style>

          {/* SECTION 1: Immersive Hero Landing */}
          <div className={`h-screen w-full relative z-10 flex flex-col justify-between items-center p-4 md:p-8 text-white ${activeStage !== 1 ? 'pointer-events-none' : ''}`}>
            {/* Header */}
            <div className="w-full flex justify-between items-center max-w-7xl mx-auto header-panel">
              <span className="font-display font-bold text-2xl uppercase tracking-widest text-white">
                Kapruka
              </span>
              <button
                onClick={() => scrollToSection(2)}
                className="text-xs uppercase tracking-wider border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 min-h-[44px] flex items-center rounded-full transition-all cursor-pointer pointer-events-auto"
              >
                Go to Shop
              </button>
            </div>

            {/* Central Headings */}
            <div className="text-center space-y-4 max-w-2xl px-4 my-auto hero-panel">
              <span className="inline-flex items-center gap-1.5 bg-slate-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-orange-200 animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-terracotta" /> Premium Gifting Experience
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-white drop-shadow-xl">
                Gifting Joy, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Delivered Home.</span>
              </h1>
              <p className="text-base md:text-lg text-white/95 font-light max-w-lg mx-auto leading-relaxed drop-shadow-lg">
                Send fresh cakes, premium flowers, artisanal chocolates, and grocery baskets to your loved ones in Sri Lanka.
              </p>
            </div>

            <button 
              type="button"
              onClick={() => scrollToSection(2)}
              className="flex flex-col items-center gap-2 cursor-pointer group pb-4 animate-bounce pointer-events-auto indicator-panel bg-transparent border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded"
              aria-label="Scroll Down to Shop"
            >
              <span className="text-xs uppercase tracking-widest font-semibold text-white/60 group-hover:text-white transition-colors">
                Scroll Down
              </span>
              <div className="h-8 w-5 rounded-full border-2 border-white/30 flex justify-center p-1">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-scroll-dot" />
              </div>
            </button>
          </div>

          {/* SECTION 2: Split-screen Gifting App Workspace */}
          <main id="workspace-section" className="h-screen w-full flex flex-col md:flex-row relative z-10 overflow-hidden bg-transparent font-sans p-3 sm:p-5 md:p-8 gap-3 sm:gap-5 md:gap-8 items-center justify-center">
            <BackgroundAura />

            {/* Mobile Tab Toggle (hidden on md+) */}
            <div className="md:hidden w-full flex bg-card-bg/80 backdrop-blur-sm border border-border-warm rounded-xl p-1 z-20 shrink-0">
              <button
                onClick={() => setMobileActiveTab('chat')}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                  mobileActiveTab === 'chat'
                    ? 'bg-terracotta text-white shadow-soft'
                    : 'text-slate-black/60 hover:text-slate-black'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setMobileActiveTab('shop')}
                className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                  mobileActiveTab === 'shop'
                    ? 'bg-terracotta text-white shadow-soft'
                    : 'text-slate-black/60 hover:text-slate-black'
                }`}
              >
                🛍️ Shop
              </button>
            </div>

            {/* LEFT PANEL: Conversational Workspace */}
            <div 
              className={`flex w-full md:w-[46%] h-[calc(100vh-140px)] md:h-[85vh] flex-col border border-border-warm bg-card-bg rounded-2xl shadow-soft relative z-10 overflow-hidden sec2-left-panel ${activeStage !== 2 ? 'pointer-events-none' : ''} ${mobileActiveTab !== 'chat' ? 'hidden md:flex' : ''}`}
            >
              <div className="h-full flex flex-col justify-between">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-border-warm px-3 py-3 md:px-6 md:py-4">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-terracotta animate-pulse"></span>
                    <span className="font-display font-bold uppercase tracking-widest text-slate-black text-sm">
                      Kapruka Concierge
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        const next = chatLanguage === 'en' ? 'si' : 'en';
                        setChatLanguage(next);
                        setMessages(messagesPrev => [
                          ...messagesPrev,
                          {
                            sender: 'ai',
                            text: next === 'si'
                              ? "භාෂාව සිංහලට මාරු කරන ලදී. 🇱🇰 ඔබට අවශ්‍ය කුමන ආකාරයේ තෑග්ගක්ද?"
                              : "Language switched to English. 🇺🇸 How can I help you today?",
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          }
                        ]);
                      }}
                      className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${chatLanguage === 'si' ? 'bg-terracotta border-terracotta text-white font-bold' : 'border-border-warm bg-warm-alabaster text-slate-black/60 hover:text-terracotta'}`}
                    >
                      {chatLanguage === 'si' ? 'සිංහල 🇱🇰' : 'English 🇺🇸'}
                    </button>
                    <button 
                      type="button"
                      className="relative cursor-pointer focus:outline-none"
                      onClick={() => setIsCartOpen(true)}
                      aria-label="View Shopping Cart"
                    >
                      <ShoppingBag className="h-5 w-5 text-slate-black/70 hover:text-terracotta transition-colors" />
                      {totalCartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white animate-bounce">
                          {totalCartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </header>

                {/* Chat message feed */}
                <div ref={chatFeedRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" style={{ overscrollBehaviorY: 'contain' }}>
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-soft relative ${
                          m.sender === 'user'
                            ? 'bg-terracotta text-white rounded-tr-none'
                            : 'bg-warm-alabaster text-slate-black border border-border-warm rounded-tl-none'
                        }`}
                      >
                        <p className="text-base font-light leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        
                        {(() => {
                          const allWidgets = m.widgets || (m.widget ? [m.widget] : []);
                          return allWidgets.map((widget, wIdx) => {
                            if (widget.type === 'delivery') {
                              return (
                                <div key={wIdx} className="mt-3 p-4 rounded-xl border border-border-warm bg-card-bg shadow-sm text-slate-black space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-terracotta shrink-0" />
                                      <span className="text-sm font-bold tracking-wide uppercase">{widget.data.city}</span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${
                                      widget.data.deliverable 
                                        ? 'bg-green-50 text-green-700 border border-green-200' 
                                        : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                      {widget.data.deliverable ? 'Deliverable' : 'Unavailable'}
                                    </span>
                                  </div>
                                  
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-slate-black/55 font-light">Delivery Date:</span>
                                      <span className="font-semibold">{widget.data.date}</span>
                                    </div>
                                    {widget.data.deliverable && (
                                      <div className="flex justify-between">
                                        <span className="text-slate-black/55 font-light">Shipping Fee:</span>
                                        <span className="font-bold text-terracotta">LKR {widget.data.rate.toLocaleString()}</span>
                                      </div>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-slate-black/60 font-light italic leading-snug border-t border-border-warm pt-2">
                                    {widget.data.message}
                                  </p>
                                </div>
                              );
                            }

                            if (widget.type === 'tracking') {
                              const trackingData = widget.data;
                              const orderNum = trackingData.orderNumber;
                              
                              if (!trackingData.verified) {
                                return (
                                  <div key={wIdx} className="mt-3 p-4 rounded-xl border border-border-warm bg-card-bg shadow-sm text-slate-black space-y-3 min-w-[260px] md:min-w-[320px]">
                                    <div className="flex items-center justify-between border-b border-border-warm pb-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold font-mono tracking-wider text-slate-black">{orderNum}</span>
                                      </div>
                                      <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border border-red-100">
                                        Verification Required
                                      </span>
                                    </div>
                                    <div className="space-y-3">
                                      <p className="text-[11px] text-slate-black/60 font-light leading-relaxed">
                                        For security, please enter the {"recipient's"} phone number used during checkout to view delivery status.
                                      </p>
                                      <div className="flex gap-2">
                                        <input
                                          type="tel"
                                          placeholder="Recipient Phone (e.g. 0771234567)"
                                          value={trackingPhoneInputs[orderNum] || ''}
                                          onChange={(e) => setTrackingPhoneInputs(prev => ({
                                            ...prev,
                                            [orderNum]: e.target.value
                                          }))}
                                          className="flex-1 border border-border-warm rounded-lg px-3 py-1.5 text-xs bg-warm-alabaster text-slate-black focus:outline-none focus:border-terracotta transition-colors font-mono"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const phone = trackingPhoneInputs[orderNum] || '';
                                            if (phone.trim()) {
                                              handleVerifyTracking(idx, wIdx, orderNum, phone);
                                            }
                                          }}
                                          className="bg-slate-black text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider hover:bg-terracotta transition-colors"
                                        >
                                          Verify
                                        </button>
                                      </div>
                                      {trackingData.message && (
                                        <p className="text-[10px] text-red-600 font-medium">{trackingData.message}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={wIdx} className="mt-3 p-4 rounded-xl border border-border-warm bg-card-bg shadow-sm text-slate-black space-y-4 min-w-[260px] md:min-w-[320px]">
                                  <div className="flex items-center justify-between border-b border-border-warm pb-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold font-mono tracking-wider text-slate-black">{orderNum}</span>
                                    </div>
                                    <span className="text-[9px] bg-slate-black/5 text-slate-black/75 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                                      Live Status
                                    </span>
                                  </div>

                                  {/* Progress Timeline */}
                                  <div className="relative flex justify-between items-center px-1 py-4">
                                    {/* Connection lines */}
                                    <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-border-warm -translate-y-1/2 z-0" />
                                    <div 
                                      className="absolute left-6 top-1/2 h-0.5 bg-terracotta -translate-y-1/2 z-0 transition-all duration-1000 ease-out" 
                                      style={{ 
                                        width: `${
                                          trackingData.status === 'delivered' ? '100%' :
                                          trackingData.status === 'dispatched' ? '66%' :
                                          trackingData.status === 'prepared' ? '33%' : '0%'
                                        }` 
                                      }}
                                    />

                                    {(() => {
                                      return [
                                        { key: 'ordered', label: 'Ordered', icon: '📝' },
                                        { key: 'prepared', label: 'Prepared', icon: '🎂' },
                                        { key: 'dispatched', label: 'Dispatched', icon: '🚚' },
                                        { key: 'delivered', label: 'Delivered', icon: '🎁' }
                                      ].map((step, stepIdx, arr) => {
                                        const currentStatus = trackingData.status;
                                        const statusIdx = arr.findIndex(s => s.key === currentStatus);
                                        const isActive = stepIdx <= statusIdx;
                                        const isCurrent = stepIdx === statusIdx;

                                        return (
                                          <div key={step.key} className="relative z-10 flex flex-col items-center">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all duration-500 shadow-sm ${
                                              isCurrent 
                                                ? 'bg-terracotta text-white ring-4 ring-terracotta/20 ring-offset-2Ring animate-pulse'
                                                : isActive 
                                                  ? 'bg-slate-black text-white' 
                                                  : 'bg-warm-alabaster text-slate-black/35 border border-border-warm'
                                            }`}>
                                              <span>{step.icon}</span>
                                            </div>
                                            <span className={`text-[9px] mt-2 font-semibold tracking-wider uppercase transition-colors duration-300 ${
                                              isActive ? 'text-slate-black' : 'text-slate-black/35'
                                            }`}>
                                              {step.label}
                                            </span>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>

                                  <div className="text-[11px] text-slate-black/60 font-light leading-relaxed border-t border-border-warm pt-3 space-y-1">
                                    <div className="flex justify-between">
                                      <span>Destination:</span>
                                      <span className="font-semibold text-slate-black">{trackingData.city}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.type === 'product_info') {
                              return (
                                <div key={wIdx} className="mt-3 p-4 rounded-xl border border-border-warm bg-card-bg shadow-sm text-slate-black space-y-4">
                                  {/* Product Header */}
                                  <div className="flex gap-3 items-center">
                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-border-warm relative shrink-0">
                                      <GiftingImage
                                        src={widget.data.image}
                                        alt={widget.data.name}
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                        category={widget.data.name}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-bold leading-snug text-slate-black line-clamp-2">{widget.data.name}</h4>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-xs font-bold text-terracotta">LKR {widget.data.price.toLocaleString()}</span>
                                        <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                          {widget.data.stock}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <p className="text-[11px] text-slate-black/60 font-light leading-relaxed line-clamp-2">
                                    {widget.data.description}
                                  </p>

                                  {/* Specs Badges */}
                                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-warm-alabaster/40 p-2.5 rounded-lg border border-border-warm">
                                    <div className="flex flex-col">
                                      <span className="text-slate-black/45 text-[9px] uppercase tracking-wider font-semibold">Weight</span>
                                      <span className="font-medium text-slate-black mt-0.5">{widget.data.weight}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-slate-black/45 text-[9px] uppercase tracking-wider font-semibold">Portions</span>
                                      <span className="font-medium text-slate-black mt-0.5">8 - 10 Servings</span>
                                    </div>
                                  </div>

                                  {/* Ingredients list */}
                                  <div className="space-y-1.5">
                                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-black/45 block">Ingredients</span>
                                    <div className="flex flex-wrap gap-1">
                                      {widget.data.ingredients.map((ing, i) => (
                                        <span key={i} className="text-[9px] bg-slate-black/5 text-slate-black/75 px-2 py-0.5 rounded-md font-medium">
                                          {ing}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Allergens warning */}
                                  {widget.data.allergens.length > 0 && (
                                    <div className="space-y-1.5 border-t border-border-warm pt-3">
                                      <span className="text-[9px] uppercase tracking-wider font-bold text-red-600/80 block">Allergen Information</span>
                                      <div className="flex flex-wrap gap-1">
                                        {widget.data.allergens.map((alg, i) => (
                                          <span key={i} className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md font-semibold">
                                            ⚠️ Contains {alg}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (widget.type === 'cart_add_success') {
                              return (
                                <div key={wIdx} className="mt-3 p-4 rounded-xl border border-green-200 bg-green-50/50 shadow-sm text-slate-black space-y-3">
                                  <div className="flex gap-3 items-center">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-warm relative shrink-0">
                                      <GiftingImage
                                        src={widget.data.image}
                                        alt={widget.data.productName}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                        category={widget.data.productName}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-bold leading-snug text-slate-black line-clamp-1">{widget.data.productName}</h4>
                                      <p className="text-[10px] text-green-700 font-semibold mt-1">✓ Added to Gifting Cart</p>
                                    </div>
                                  </div>
                                  <div className="text-xs space-y-1 border-t border-green-100 pt-2 text-slate-black/75">
                                    <div className="flex justify-between">
                                      <span>Quantity:</span>
                                      <span className="font-semibold text-slate-black">{widget.data.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Deliver to:</span>
                                      <span className="font-semibold text-slate-black">{widget.data.city} ({widget.data.date})</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span className="font-semibold text-slate-black">LKR {(widget.data.price * widget.data.quantity).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Delivery Fee:</span>
                                      <span className="font-semibold text-slate-black">LKR {widget.data.deliveryFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-green-200 pt-1.5 font-bold text-slate-black">
                                      <span>Total Price:</span>
                                      <span className="text-terracotta">LKR {widget.data.total.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            if (widget.type === 'recommendations') {
                              return (
                                <div key={wIdx} className="mt-3 space-y-3">
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-black/45 block mb-1">
                                    AI Recommended for {widget.data.occasion}
                                  </span>
                                  <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth" style={{ overscrollBehaviorX: 'contain' }}>
                                    {widget.data.products.map((p) => (
                                      <div key={p.id} className="w-[180px] shrink-0 p-3 bg-card-bg border border-border-warm rounded-xl shadow-sm flex flex-col justify-between">
                                        <div className="space-y-2">
                                          <div className="aspect-video w-full rounded-lg overflow-hidden border border-border-warm relative">
                                            <GiftingImage
                                              src={p.image}
                                              alt={p.name}
                                              fill
                                              sizes="160px"
                                              className="object-cover"
                                              category={p.name}
                                            />
                                          </div>
                                          <h5 className="text-[11px] font-bold text-slate-black line-clamp-2 leading-snug">{p.name}</h5>
                                        </div>
                                        
                                        <div className="mt-3 space-y-2">
                                          <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-terracotta">LKR {p.price.toLocaleString()}</span>
                                            <span className="text-[9px] text-slate-black/55">{p.stock}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleProductSelect({
                                              id: p.id,
                                              name: p.name,
                                              price: p.price,
                                              image: p.image,
                                              stock: p.stock,
                                              category: p.category || 'General',
                                              url: p.url || '#'
                                            })}
                                            className="w-full py-1.5 bg-slate-black hover:bg-terracotta text-white rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer text-center"
                                          >
                                            Choose
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            if (widget.type === 'compose_greeting') {
                              return (
                                <div key={wIdx} className="mt-3 p-3 rounded-xl border border-border-warm bg-card-bg shadow-sm text-slate-black space-y-3">
                                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-black/45 block">
                                    AI Composed Notes
                                  </span>
                                  <div className="space-y-2.5">
                                    {widget.data.options.map((option, i) => (
                                      <div key={i} className="group relative p-2.5 bg-warm-alabaster/40 border border-border-warm rounded-lg text-xs hover:border-terracotta/40 transition-colors">
                                        <p className="italic text-slate-black/85 leading-relaxed pr-12">&quot;{option}&quot;</p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            saveGiftMessage(option);
                                            setMessages(prev => [
                                              ...prev,
                                              {
                                                sender: 'ai',
                                                text: chatLanguage === 'si'
                                                  ? `සුබපැතුම් පතේ පණිවිඩය ලෙස ${i + 1} වන විකල්පය ඇතුලත් කරන ලදී! ඔබට එය Checkout විස්තර තුල බලාගත හැක.`
                                                  : `Applied note option ${i + 1} to your gift card! You can see it inside the Checkout details.`,
                                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                              }
                                            ]);
                                          }}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-terracotta hover:bg-slate-black text-white text-[9px] font-bold rounded-md uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                          Apply
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          });
                        })()}

                        <span
                          className={`block text-[10px] mt-1.5 font-mono ${
                            m.sender === 'user' ? 'text-white/60' : 'text-slate-black/40'
                          }`}
                        >
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}

                  {messages.length === 1 && (
                    <div className="flex flex-col gap-2 mt-4 ml-2 animate-fade-in">
                      <p className="text-[10px] font-semibold text-slate-black/50 uppercase tracking-wider">Quick Suggestions</p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTION_CHIPS.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSuggestionClick(chip.prompt)}
                            className="bg-warm-alabaster hover:bg-terracotta hover:text-white border border-border-warm text-slate-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow flex items-center gap-1.5"
                          >
                            <span>{chip.icon}</span>
                            <span>{chip.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {isSearching && (
                    <div className="flex justify-start">
                      <div className="bg-warm-alabaster text-slate-black border border-border-warm rounded-2xl rounded-tl-none px-5 py-4 shadow-soft flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-2 w-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-2 w-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSend} className="border-t border-border-warm p-3 md:p-5 bg-card-bg flex gap-2.5">
                  <label htmlFor="chat-input" className="sr-only">Talk to the concierge</label>
                  <input
                    id="chat-input"
                    name="chat-input"
                    type="text"
                    placeholder="Talk to the concierge in English/Sinhala/Tanglish..."
                    aria-label="Talk to the concierge"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isSearching}
                    className="flex-1 rounded-lg border border-border-warm px-4 py-3 bg-warm-alabaster text-slate-black focus:outline-none focus:border-terracotta disabled:opacity-50 transition-colors text-base"
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !inputValue.trim()}
                    className="rounded-lg bg-slate-black hover:bg-terracotta px-4 md:px-6 py-3 font-semibold text-white transition-colors disabled:opacity-40"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT PANEL: Visual Shop Canvas */}
            <div 
              className={`w-full md:w-[46%] h-[calc(100vh-140px)] md:h-[85vh] flex flex-col relative bg-transparent overflow-hidden justify-center pb-12 sec2-right-panel ${activeStage !== 2 ? 'pointer-events-none' : ''} ${mobileActiveTab !== 'shop' ? 'hidden md:flex' : ''}`}
            >
              <AnimatePresence mode="wait">
                {view === 'details' && selectedProduct ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 overflow-y-auto p-4 z-10 flex items-center justify-center"
                  >
                    <ProductCustomizer
                      product={selectedProduct}
                      city={searchCriteria?.city || 'Colombo'}
                      initialDate={searchCriteria?.date || ''}
                      onAdd={handleAddToCart}
                      onBack={() => {
                        setView('browse');
                        setSelectedProduct(null);
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="browse"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col h-full w-full"
                  >
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col relative z-10 h-full overflow-y-auto p-4 md:p-6" style={{ overscrollBehaviorY: 'contain' }}>
                      {/* Header Hero text when no search criteria */}
                      <AnimatePresence>
                        {!isSearchComplete && (
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isWorkspaceActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ delay: isWorkspaceActive ? 0.3 : 0, duration: 0.8, ease: "easeOut" }}
                            className="max-w-md space-y-3 mt-auto mb-6 pointer-events-none"
                          >
                            <span className="inline-flex items-center gap-1.5 bg-slate-black/75 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-orange-200">
                              <Sparkles className="h-3 w-3 text-terracotta" /> Conversational Gifting
                            </span>
                            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                              Gifting Joy, Delivered Home.
                            </h2>
                            <p className="text-base text-white/80 font-light leading-relaxed">
                              Send fresh cakes, flowers, chocolates, and groceries directly to loved ones in Sri Lanka.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Journey Finder */}
                      <motion.div
                        layout
                        id="journey-finder-wrapper"
                        initial={{ opacity: 0, y: 40 }}
                        animate={isWorkspaceActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                        transition={{ 
                          layout: { type: 'spring', stiffness: 120, damping: 20 },
                          opacity: { delay: isWorkspaceActive ? 0.4 : 0, duration: 0.8, ease: "easeOut" },
                          y: { delay: isWorkspaceActive ? 0.4 : 0, duration: 0.8, ease: "easeOut" }
                        }}
                        className={`w-full ${
                          isSearchComplete ? 'mb-6 mt-2' : 'mb-8'
                        }`}
                      >
                        <JourneyFinder onSearch={handleJourneySearch} initialCriteria={searchCriteria} />
                      </motion.div>

                      {/* Product Listings / Results */}
                      <AnimatePresence>
                        {isSearchComplete && searchCriteria && (
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="flex-1 flex flex-col space-y-6"
                          >
                            <div className="flex items-center justify-between bg-card-bg border border-border-warm rounded-2xl p-4 mb-2 shadow-soft">
                              <div>
                                <h2 className="font-display text-sm font-bold text-slate-black uppercase tracking-widest">
                                  Curated Selections
                                </h2>
                                <p className="text-[10px] text-slate-black/60 font-light mt-1">
                                  Available delivery options to {searchCriteria.city}
                                </p>
                              </div>
                              
                              <button
                                onClick={handleReset}
                                className="flex items-center gap-2 rounded-xl border border-border-warm bg-warm-alabaster px-3.5 py-2 text-[10px] font-semibold text-slate-black hover:bg-slate-black hover:text-white transition-all shadow-soft cursor-pointer shrink-0 group"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-slate-black/70 group-hover:text-white transition-colors" /> Reset Search
                              </button>
                            </div>

                            {/* Category tabs hubs */}
                            <div className="flex gap-2 overflow-x-auto py-1">
                              <button
                                onClick={() => handleCategoryClick('all')}
                                className={`px-3.5 py-1.5 rounded-full text-[9px] font-semibold tracking-wider uppercase border transition-all ${
                                  activeCategory === 'all'
                                    ? 'bg-terracotta border-terracotta text-white shadow-soft'
                                    : 'bg-card-bg border border-border-warm text-slate-black/70 hover:bg-warm-alabaster hover:text-slate-black'
                                }`}
                              >
                                All
                              </button>
                              {CATEGORY_HUBS.map((hub) => (
                                <button
                                  key={hub.value}
                                  onClick={() => handleCategoryClick(hub.value)}
                                  className={`px-3.5 py-1.5 rounded-full text-[9px] font-semibold tracking-wider uppercase border transition-all ${
                                    activeCategory === hub.value
                                      ? hub.colorway === 'moss'
                                        ? 'bg-sage-moss border-sage-moss text-white shadow-soft'
                                        : 'bg-terracotta border-terracotta text-white shadow-soft'
                                      : 'bg-card-bg border border-border-warm text-slate-black/70 hover:bg-warm-alabaster hover:text-slate-black'
                                  }`}
                                >
                                  {hub.label}
                                </button>
                              ))}
                            </div>

                            {/* Cards Grid */}
                            <div className="flex-1">
                              {isSearching ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="bg-card-bg border border-border-warm rounded-2xl p-3 space-y-2 animate-pulse shadow-soft h-[300px]">
                                      <div className="aspect-square bg-warm-alabaster rounded-lg w-full"></div>
                                      <div className="h-3.5 bg-warm-alabaster rounded w-3/4"></div>
                                      <div className="h-3.5 bg-warm-alabaster rounded w-1/4"></div>
                                    </div>
                                  ))}
                                </div>
                              ) : products.length > 0 ? (
                                <motion.div
                                  variants={{
                                    show: { transition: { staggerChildren: 0.05 } }
                                  }}
                                  initial="hidden"
                                  animate="show"
                                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                                >
                                  {products.map((p) => (
                                    <motion.div
                                      key={p.id}
                                      className="h-full flex flex-col"
                                      variants={{
                                        hidden: { opacity: 0, y: 15 },
                                        show: { opacity: 1, y: 0 }
                                      }}
                                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                                    >
                                      <ProductCard
                                        product={p}
                                        onSelect={handleProductSelect}
                                        onAddToCart={handleDirectAddToCart}
                                      />
                                    </motion.div>
                                  ))}
                                </motion.div>
                              ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-2 max-w-sm mx-auto">
                                  <div className="p-3 rounded-full bg-card-bg shadow-soft border border-border-warm text-slate-black/40">
                                    <Search className="h-6 w-6" />
                                  </div>
                                  <h3 className="font-display text-sm font-bold text-slate-black">No Products Found</h3>
                                  <p className="text-xs text-slate-black/60 font-light leading-relaxed">
                                    We couldn&apos;t retrieve items for this selection in {searchCriteria.city}. Try toggling other categories or changing details above.
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* SECTION 3: Delivery Details */}
          <section id="delivery-section" className="h-screen w-full flex flex-col md:flex-row relative z-10 overflow-hidden bg-transparent font-sans p-3 sm:p-5 md:p-8 gap-3 sm:gap-5 md:gap-8 items-center justify-center">
            {/* LEFT PANEL: Checkout Accordion */}
            <div 
              className={`flex w-full md:w-[46%] h-auto md:h-[85vh] flex-col border border-border-warm bg-card-bg rounded-2xl shadow-soft relative z-10 overflow-hidden sec3-left-panel order-2 md:order-1 ${activeStage !== 3 ? 'pointer-events-none' : ''}`}
            >
              <div className="h-full relative">
                {/* Embedded CheckoutForm */}
                <CheckoutForm
                  cartItems={cart}
                  giftMessage={giftMessage}
                  onUpdateGiftMessage={saveGiftMessage}
                  initialCity={searchCriteria?.city || 'Colombo'}
                  initialDate={searchCriteria?.date || ''}
                  prefilledRecipient={prefilledRecipient}
                  onBack={() => {
                    scrollToSection(2);
                  }}
                  onSuccess={handleCheckoutSuccess}
                />

                {/* Gifting Cart Lock Overlay */}
                {cart.length === 0 && (
                  <div className="absolute inset-0 z-30 bg-card-bg/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 md:p-6 select-none">
                    <div className="p-3 md:p-4 rounded-full bg-warm-alabaster border border-border-warm text-terracotta/75 shadow-soft mb-4">
                      <ShieldAlert className="h-8 w-8 md:h-10 md:w-10 animate-pulse" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-black uppercase tracking-wider">Delivery Details Locked</h3>
                    <p className="text-sm text-slate-black/60 font-light max-w-xs mt-2 leading-relaxed">
                      Your Gifting Cart is empty. Please add a product to your cart in the Gifting Workspace above to start checkout.
                    </p>
                    <button
                      onClick={() => {
                        scrollToSection(2);
                      }}
                      className="mt-6 px-6 py-3 bg-terracotta text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-slate-black transition-colors shadow-soft cursor-pointer pointer-events-auto"
                    >
                      Go to Workspace
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Gift Basket Review Summary */}
            <div 
              className={`w-full md:w-[38%] h-auto max-h-[40vh] md:max-h-[70vh] self-start mt-4 md:mt-12 border border-border-warm bg-card-bg rounded-2xl shadow-soft p-4 md:p-6 relative z-10 flex flex-col justify-center max-w-md mx-auto md:mx-0 sec3-right-panel order-1 md:order-2 ${activeStage !== 3 ? 'pointer-events-none' : ''}`}
            >
              <div className="space-y-4">
                <h3 className="font-display font-bold text-slate-black text-sm border-b border-border-warm pb-3 uppercase tracking-wide">
                  Gift Basket Review
                </h3>
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                  {cart.length > 0 ? (
                    cart.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-warm relative shrink-0">
                          <GiftingImage
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            category={item.product.name}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-slate-black leading-tight line-clamp-1">{item.product.name}</h4>
                          <p className="text-[10px] text-slate-black/55 font-light mt-0.5">
                            Qty: {item.quantity} · LKR {(item.product.price + (item.customization?.addedPrice || 0)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-black/45 italic font-light py-4 text-center">Your cart is empty.</p>
                  )}
                </div>

                {giftMessage && (
                  <div className="bg-warm-alabaster/40 border border-border-warm rounded-xl p-3 text-xs space-y-1">
                    <span className="font-semibold text-slate-black/55 uppercase text-[9px] tracking-wider block">Greeting Note</span>
                    <p className="italic text-slate-black/75 font-light leading-relaxed">&quot;{giftMessage}&quot;</p>
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="flex gap-2 items-center bg-green-50 border border-green-200 p-3 rounded-xl text-green-800 text-[11px] font-light leading-snug">
                    <Sparkles className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span>Your items are reserved. Complete checkout in the left pane to initialize order.</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 4: Order Confirmation */}
          <section id="confirmation-section" className="h-screen w-full flex flex-col md:flex-row relative z-10 overflow-hidden bg-transparent font-sans p-3 sm:p-5 md:p-8 gap-3 sm:gap-5 md:gap-8 items-center justify-center">
            {/* LEFT PANEL: Confirmation details */}
            <div 
              className={`flex w-full md:w-[50%] h-auto min-h-[60vh] md:h-[85vh] flex-col border border-border-warm bg-card-bg rounded-2xl shadow-soft relative z-10 overflow-hidden sec4-panel ${activeStage !== 4 ? 'pointer-events-none' : ''}`}
            >
              <div className="h-full relative flex flex-col">
                {orderData ? (
                  <ConfirmationScreen
                    orderData={orderData}
                    productImage={cart.length > 0 ? cart[0].product.image : ''}
                    onNewOrder={handleNewOrder}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center select-none bg-card-bg">
                    <div className="p-4 rounded-full bg-warm-alabaster border border-border-warm text-slate-black/40 shadow-soft mb-4">
                      <Clock className="h-10 w-10" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-slate-black uppercase tracking-wider">Awaiting Checkout</h3>
                    <p className="text-sm text-slate-black/60 font-light max-w-xs mt-2 leading-relaxed">
                      Please complete the checkout in the Delivery Details section above to generate your order confirmation.
                    </p>
                    <button
                      onClick={() => {
                        scrollToSection(3);
                      }}
                      className="mt-6 px-6 py-3 bg-slate-black text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-terracotta transition-colors shadow-soft cursor-pointer pointer-events-auto"
                    >
                      Go to Delivery Details
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Completely empty to show the gift box */}
            <div className="hidden md:block md:w-[38%] h-full" />
          </section>

        </div>
      )}
    </>
  );
}
