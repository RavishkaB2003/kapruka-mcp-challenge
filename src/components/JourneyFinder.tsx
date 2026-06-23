'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getDeliveryCities } from '@/app/actions';
import { Calendar, MapPin, Gift, User, ArrowRight } from 'lucide-react';
import DatePicker from './DatePicker';
import { cleanCityName } from '@/lib/utils';

interface JourneyFinderProps {
  onSearch: (criteria: {
    giftType: string;
    recipient: string;
    city: string;
    date: string;
  }) => void;
  initialCriteria?: {
    giftType: string;
    recipient: string;
    city: string | null;
    date: string | null;
  } | null;
}

const GIFT_TYPES = ['Cakes', 'Flowers', 'Chocolates', 'Grocery', 'Gifts'];
const RECIPIENTS = ['Mom', 'Dad', 'Lover', 'Friend', 'Someone Special'];

export default function JourneyFinder({ onSearch, initialCriteria }: JourneyFinderProps) {
  const [giftType, setGiftType] = useState(initialCriteria?.giftType || 'Cakes');
  const [recipient, setRecipient] = useState(initialCriteria?.recipient || 'Someone Special');
  const [city, setCity] = useState(initialCriteria?.city || '');
  const [date, setDate] = useState(initialCriteria?.date || '');

  // Sync state if criteria updates from parent (e.g. Chat input)
  useEffect(() => {
    if (initialCriteria) {
      setGiftType(initialCriteria.giftType || 'Cakes');
      setRecipient(initialCriteria.recipient || 'Someone Special');
      setCity(initialCriteria.city || '');
      setDate(initialCriteria.date || '');
    } else {
      setCity('');
      setDate('');
    }
  }, [initialCriteria]);
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'gift' | 'recipient' | 'city' | null>(null);
  
  // City autocomplete states
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch city suggestions as user types
  useEffect(() => {
    if (city.trim().length < 2) {
      setCitySuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsCityLoading(true);
      try {
        const results = await getDeliveryCities(city);
        // Clean and format suggestion array
        setCitySuggestions(results);
      } catch (err) {
        console.error('Failed to load city suggestions:', err);
      } finally {
        setIsCityLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !date) return;
    onSearch({ giftType, recipient, city, date });
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl bg-card-bg rounded-2xl border border-border-warm p-4 md:p-6 shadow-soft relative overflow-visible">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sentence Builder Layout */}
        <div className="text-base sm:text-xl md:text-2xl font-light leading-relaxed text-slate-black tracking-wide">
          I want to send{' '}
          
          {/* Gift Type Dropdown */}
          <span className="inline-block relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'gift' ? null : 'gift')}
              className="font-medium text-terracotta border-b-2 border-terracotta/30 hover:border-terracotta px-1 pb-0.5 transition-colors cursor-pointer"
            >
              {giftType}
            </button>
            {openDropdown === 'gift' && (
              <div className="absolute left-0 mt-2 w-44 sm:w-48 bg-card-bg border border-border-warm rounded-lg shadow-hover z-30 p-1">
                {GIFT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setGiftType(type);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-base font-light rounded-md hover:bg-warm-alabaster transition-colors ${
                      giftType === type ? 'text-terracotta font-medium bg-terracotta/5' : 'text-slate-black'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </span>
          
          {' '}to{' '}
          
          {/* Recipient Dropdown */}
          <span className="inline-block relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'recipient' ? null : 'recipient')}
              className="font-medium text-terracotta border-b-2 border-terracotta/30 hover:border-terracotta px-1 pb-0.5 transition-colors cursor-pointer"
            >
              {recipient}
            </button>
            {openDropdown === 'recipient' && (
              <div className="absolute left-0 mt-2 w-44 sm:w-48 bg-card-bg border border-border-warm rounded-lg shadow-hover z-30 p-1">
                {RECIPIENTS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRecipient(r);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 text-base font-light rounded-md hover:bg-warm-alabaster transition-colors ${
                      recipient === r ? 'text-terracotta font-medium bg-terracotta/5' : 'text-slate-black'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </span>
          
          {' '}in{' '}
          
          {/* City Auto-complete Input */}
          <span className="inline-block relative w-36 sm:w-44">
            <label htmlFor="journey-city" className="sr-only">Delivery City</label>
            <input
              id="journey-city"
              name="journey-city"
              type="text"
              placeholder="which city?"
              aria-label="Delivery City"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setOpenDropdown('city');
              }}
              onFocus={() => setOpenDropdown('city')}
              className="w-full font-medium text-terracotta bg-transparent border-b-2 border-terracotta/30 focus:border-terracotta focus:outline-none placeholder:text-slate-black/30 placeholder:font-light px-1 pb-0.5 text-center"
            />
            {openDropdown === 'city' && citySuggestions.length > 0 && (
              <div className="absolute left-0 mt-2 w-48 sm:w-56 bg-card-bg border border-border-warm rounded-lg shadow-hover z-30 max-h-48 overflow-y-auto p-1">
                {citySuggestions.map((cityName) => {
                  const cleaned = cleanCityName(cityName);
                  return (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => {
                        setCity(cleaned);
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm font-light rounded-md hover:bg-warm-alabaster transition-colors text-slate-black"
                    >
                      {cleaned}
                    </button>
                  );
                })}
              </div>
            )}
          </span>
          
          {' '}on{' '}
          
          {/* Date Picker Input */}
          <span className="inline-block relative">
            <DatePicker value={date} onChange={setDate} />
          </span>
          .
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!city || !date}
            className="flex items-center gap-2 rounded-lg bg-terracotta px-6 py-3 font-semibold text-white hover:bg-slate-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            Find Gifts
            <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
