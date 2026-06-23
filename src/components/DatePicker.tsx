'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
}

export default function DatePicker({ value, onChange, className = '' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current date or fallback to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close calendar popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        (!popoverRef.current || !popoverRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to calculate and update coordinates
  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      const left = rect.left + rect.width / 2 + scrollX;
      
      // Measure actual height of the calendar popover, or default to a safe 350px
      const calendarHeight = popoverRef.current ? popoverRef.current.offsetHeight : 350;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Check overflow container space below and above
      let parentSpaceBelow = spaceBelow;
      let parentSpaceAbove = spaceAbove;
      let parent = containerRef.current.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        const overflow = style.overflow + style.overflowY;
        if (overflow.includes('auto') || overflow.includes('scroll') || overflow.includes('hidden')) {
          const parentRect = parent.getBoundingClientRect();
          parentSpaceBelow = parentRect.bottom - rect.bottom;
          parentSpaceAbove = rect.top - parentRect.top;
          break;
        }
        parent = parent.parentElement;
      }

      // Check where the calendar fits better
      const canFitBelow = spaceBelow >= calendarHeight && parentSpaceBelow >= calendarHeight;
      
      // Determine if we should open upward
      let shouldOpenUp = false;
      if (!canFitBelow) {
        // If it doesn't fit below, open upward if there is more space above
        if (spaceAbove > spaceBelow || parentSpaceAbove > parentSpaceBelow) {
          shouldOpenUp = true;
        }
      }

      setOpenUp(shouldOpenUp);

      let top = shouldOpenUp
        ? rect.top + scrollY - calendarHeight - 8 // render above
        : rect.bottom + scrollY + 8; // render below

      // Boundary collision check to keep popover within viewport limits
      if (shouldOpenUp) {
        const minTop = scrollY + 8;
        if (top < minTop) {
          // If upward position overflows the top of viewport, push it down.
          // But if there is more space below than above, default to downward position.
          if (spaceBelow > spaceAbove) {
            shouldOpenUp = false;
            setOpenUp(false);
            top = rect.bottom + scrollY + 8;
          } else {
            top = minTop;
          }
        }
      } else {
        const maxBottom = scrollY + window.innerHeight - 8;
        if (top + calendarHeight > maxBottom) {
          // If downward position overflows the bottom of viewport, push it up.
          // But if there is more space above than below, default to upward position.
          if (spaceAbove > spaceBelow) {
            shouldOpenUp = true;
            setOpenUp(true);
            top = Math.max(scrollY + 8, rect.top + scrollY - calendarHeight - 8);
          } else {
            top = Math.max(scrollY + 8, maxBottom - calendarHeight);
          }
        }
      }

      setCoords({ top, left });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(!isOpen);
  };

  // Keep position updated on scroll and resize when open
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    // Listen to all scroll events (using capture: true to catch scrolls on parent elements)
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, value, currentMonth]);

  // Format selected date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDaySelect = (day: number) => {
    const selected = new Date(year, month, day);
    const offsetYear = selected.getFullYear();
    const offsetMonth = (selected.getMonth() + 1).toString().padStart(2, '0');
    const offsetDay = selected.getDate().toString().padStart(2, '0');
    onChange(`${offsetYear}-${offsetMonth}-${offsetDay}`);
    setIsOpen(false);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  // Generate days grid
  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(i);
  }

  const isDaySelected = (day: number) => {
    if (!value) return false;
    const currentVal = new Date(value);
    return currentVal.getFullYear() === year &&
           currentVal.getMonth() === month &&
           currentVal.getDate() === day;
  };

  const isDayPast = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const popoverMarkup = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: openUp ? -10 : 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: openUp ? -10 : 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            transform: 'translateX(-50%)',
          }}
          className="w-[min(288px,calc(100vw-32px))] bg-card-bg border border-border-warm rounded-2xl shadow-hover p-4 z-50"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border-warm mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-warm-alabaster text-slate-black/55 hover:text-terracotta transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-display font-semibold text-sm text-slate-black">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-warm-alabaster text-slate-black/55 hover:text-terracotta transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekdays Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <span key={day} className="text-[10px] uppercase font-semibold text-slate-black/35 font-mono">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return <span key={`blank-${idx}`} className="w-8 h-8" />;
              }

              const selected = isDaySelected(day);
              const past = isDayPast(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={past}
                  onClick={() => handleDaySelect(day)}
                  className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all font-light ${
                    selected
                      ? 'bg-terracotta text-white font-semibold shadow-soft'
                      : past
                      ? 'text-slate-black/20 cursor-not-allowed'
                      : 'text-slate-black hover:bg-terracotta/10 hover:text-terracotta hover:font-semibold'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today Quick-select shortcut */}
          <div className="mt-3 pt-2.5 border-t border-border-warm flex justify-end">
            <button
              type="button"
              onClick={() => {
                const offsetYear = today.getFullYear();
                const offsetMonth = (today.getMonth() + 1).toString().padStart(2, '0');
                const offsetDay = today.getDate().toString().padStart(2, '0');
                onChange(`${offsetYear}-${offsetMonth}-${offsetDay}`);
                setIsOpen(false);
              }}
              className="text-[10px] uppercase font-bold text-terracotta tracking-wider hover:text-slate-black transition-colors py-2"
            >
              Select Today
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Date Toggle Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="font-medium text-terracotta border-b-2 border-terracotta/30 hover:border-terracotta px-1 pb-0.5 transition-colors cursor-pointer flex items-center gap-1.5 inline-flex"
      >
        <CalendarIcon className="h-4 w-4 opacity-70" />
        <span>{value ? formatDateDisplay(value) : 'Select delivery date'}</span>
      </button>

      {mounted && typeof document !== 'undefined' ? createPortal(popoverMarkup, document.body) : null}
    </div>
  );
}
