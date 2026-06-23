'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import createGlobe from 'cobe';
import { DISTRICTS } from '@/lib/districts';

/**
 * Preloader component that handles the initial loading animation sequence.
 * Animates the Sri Lanka district network map and triggers a curtain split transition.
 */
interface PreloaderProps {
  onComplete: () => void;
  onReveal?: () => void;
}

// Sri Lanka Coordinates
const TARGET_LAT = 7.8731;
const TARGET_LON = 80.7718;

// Convert to Cobe spherical coordinates
const TARGET_THETA = (TARGET_LAT * Math.PI) / 180; // Colatitude (tilt) ~0.1374
const TARGET_PHI = Math.PI * 2 - (TARGET_LON * Math.PI) / 180; // Azimuthal (rotation) ~4.8738

export default function Preloader({ onComplete, onReveal }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  // Animation DOM references
  const preloaderRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const nodeLinesGroupRef = useRef<SVGGElement>(null);
  const cityNodesRef = useRef<SVGGElement>(null);
  const logoTextRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLParagraphElement>(null);

  const onCompleteRef = useRef(onComplete);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onRevealRef.current = onReveal;
  });

  useEffect(() => {
    let globeInstance: ReturnType<typeof createGlobe> | null = null;
    let currentPhi = 0;
    let currentTheta = 0.3;
    let isTransitioning = false;
    let completed = false;

    const safeComplete = () => {
      if (!completed) {
        completed = true;
        onCompleteRef.current();
      }
    };

    const safetyTimeout = setTimeout(() => {
      console.warn('[Preloader] Safety timeout triggered. Bypassing preloader visual locks.');
      safeComplete();
    }, 6000);

    // --- 1. SETUP INITIAL STYLES ---
    gsap.set([leftCurtainRef.current, rightCurtainRef.current], { xPercent: 0 });
    gsap.set(svgWrapperRef.current, { opacity: 0.9 });
    gsap.set(canvasWrapperRef.current, { opacity: 1, scale: 1 });
    
    // Set SVG path bounds for all district paths
    const districtPaths = svgWrapperRef.current?.querySelectorAll<SVGPathElement>('.district-path');
    if (districtPaths) {
      districtPaths.forEach((pathElement) => {
        const pathLength = pathElement.getTotalLength();
        gsap.set(pathElement, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });
      });
    }

    if (nodeLinesGroupRef.current) {
      const lines = nodeLinesGroupRef.current.querySelectorAll('line');
      lines.forEach((line) => {
        const lineLength = line.getTotalLength ? line.getTotalLength() : 300;
        gsap.set(line, {
          strokeDasharray: lineLength,
          strokeDashoffset: lineLength,
        });
      });
    }

    if (cityNodesRef.current) {
      const circles = cityNodesRef.current.querySelectorAll('circle');
      gsap.set(circles, { scale: 0, transformOrigin: 'center center' });
    }

    // Split logo characters for stagger effect
    if (logoTextRef.current) {
      const text = logoTextRef.current.innerText;
      logoTextRef.current.innerHTML = text
        .split('')
        .map((char) => `<span class="letter inline-block translate-y-5 opacity-0">${char}</span>`)
        .join('');
    }

    gsap.set(subTextRef.current, { opacity: 0, y: 10, letterSpacing: '0.1em' });

    // --- 2. INITIALIZE COBE 3D GLOBE ---
    if (canvasRef.current) {
      globeInstance = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: 320 * 2,
        height: 320 * 2,
        phi: 0,
        theta: 0.3,
        dark: 0,
        diffuse: 1.2,
        mapSamples: 12000,
        mapBrightness: 4.5,
        baseColor: [0.93, 0.91, 0.88], // Neutral Warm Sand
        markerColor: [226 / 255, 92 / 255, 61 / 255], // Terracotta Clay
        glowColor: [0, 0, 0], // Completely disable the glow shader to eliminate the white ring
        markers: [
          { location: [TARGET_LAT, TARGET_LON], size: 0.06 } // Sri Lanka Marker
        ],
        onRender: (state: { phi: number; theta: number }) => {
          if (!isTransitioning) {
            currentPhi += 0.008;
            state.phi = currentPhi;
          } else {
            // Smoothly interpolate camera rotation to lock directly on Sri Lanka
            const phiDiff = TARGET_PHI - currentPhi;
            const adjustedPhiDiff = Math.atan2(Math.sin(phiDiff), Math.cos(phiDiff));
            
            currentPhi += adjustedPhiDiff * 0.08;
            currentTheta += (TARGET_THETA - currentTheta) * 0.08;

            state.phi = currentPhi;
            state.theta = currentTheta;
          }
        }
      } as any);
    }

    // --- 3. TIMELINE & LOADING SIMULATION ---
    const progressObj = { value: 0 };
    const loadingDuration = 2.8; // Smooth 2.8s load visual progress

    const masterTimeline = gsap.timeline({
      onComplete: () => {
        // Unblock scroll on completion
        safeComplete();
      }
    });

    // Animate loader progress bar and number
    masterTimeline.to(progressObj, {
      value: 100,
      duration: loadingDuration,
      ease: 'power1.inOut',
      onUpdate: () => {
        const currentProgress = Math.round(progressObj.value);
        setProgress(currentProgress);
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${currentProgress}%`;
        }
        if (progressTextRef.current) {
          progressTextRef.current.innerText = `${currentProgress}%`;
        }
      }
    });

    // At 85% progress, trigger the camera focus transition
    masterTimeline.add(() => {
      isTransitioning = true;
    }, loadingDuration * 0.85);

    // Zoom & Fade WebGL, Morph into SVG Outline
    masterTimeline.to(canvasWrapperRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, loadingDuration - 0.4);

    // Draw SVG District Paths with Stagger (drawn throughout the load progress)
    if (districtPaths && districtPaths.length > 0) {
      masterTimeline.to(districtPaths, {
        strokeDashoffset: 0,
        duration: 1.4,
        stagger: 0.04,
        ease: 'power2.inOut'
      }, 0.2);
    }

    // Stagger Node Line Radiations from Colombo
    if (nodeLinesGroupRef.current) {
      const lines = nodeLinesGroupRef.current.querySelectorAll('line');
      masterTimeline.to(lines, {
        strokeDashoffset: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power2.out'
      }, 1.2);
    }

    // Scale Up City Nodes with Elastic Pop
    if (cityNodesRef.current) {
      const circles = cityNodesRef.current.querySelectorAll('circle');
      masterTimeline.to(circles, {
        scale: 1,
        duration: 0.8,
        stagger: 0.06,
        ease: 'elastic.out(1.0, 0.5)'
      }, 1.4);
    }

    // Typographic Reveal (KAPRUKA letters slide up, subtitle slide in & coordinates fade in at the start)
    masterTimeline.to('.letter', {
      y: 0,
      opacity: 1,
      stagger: 0.04,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, 0.1);

    masterTimeline.to(subTextRef.current, {
      opacity: 1,
      y: 0,
      letterSpacing: '0.22em',
      duration: 0.7,
      ease: 'power2.out'
    }, 0.3);

    // Hold the complete network layout briefly
    masterTimeline.addLabel('visualComplete');
    masterTimeline.to({}, { duration: 0.4 }); // Hold delay

    // --- 4. EXIT CURTAIN SPLIT REVEAL ---
    masterTimeline.to([progressBarRef.current?.parentElement, progressTextRef.current], {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in'
    });

    masterTimeline.to([logoTextRef.current, subTextRef.current, svgWrapperRef.current], {
      scale: 1.08,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    }, '-=0.1');

    // Split Curtains
    masterTimeline.to(leftCurtainRef.current, {
      xPercent: -100,
      duration: 1.1,
      ease: 'expo.inOut',
      onStart: () => {
        if (onRevealRef.current) onRevealRef.current();
      }
    }, '-=0.3');

    masterTimeline.to(rightCurtainRef.current, {
      xPercent: 100,
      duration: 1.1,
      ease: 'expo.inOut'
    }, '-=1.1');

    // Hide container pointer events
    masterTimeline.to(preloaderRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.3
    }, '-=0.3');

    // Cleanup WebGL on unmount
    return () => {
      clearTimeout(safetyTimeout);
      if (globeInstance) {
        globeInstance.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={preloaderRef} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent overflow-hidden"
    >
      {/* Curtain Panels */}
      <div 
        ref={leftCurtainRef} 
        className="absolute top-0 left-0 w-1/2 h-full bg-[#e2dfd7] border-r border-border-warm/40 will-change-transform"
      />
      <div 
        ref={rightCurtainRef} 
        className="absolute top-0 right-0 w-1/2 h-full bg-[#e2dfd7] border-l border-border-warm/40 will-change-transform"
      />

      {/* Main Content Arena */}
      <div className="relative flex flex-col items-center justify-center z-10 select-none">
        
        {/* Central Logo Overlay - Positioned above map to prevent overlap */}
        <div className="flex flex-col items-center justify-center mb-6 pointer-events-none">
          <div 
            ref={logoTextRef}
            className="text-sm font-display font-bold tracking-widest text-slate-black uppercase"
          >
            KAPRUKA
          </div>
          <span 
            ref={subTextRef}
            className="text-[10px] uppercase font-light text-slate-black/50 tracking-wider mt-1"
          >
            Gifting Concierge
          </span>
        </div>

        {/* Visual Layer container */}
        <div className="relative h-[min(380px,85vw)] w-[min(380px,85vw)] flex items-center justify-center">
          
          {/* Cobe 3D WebGL Canvas Layer - Removed to eliminate the dark sphere border and glow */}
          <div ref={canvasWrapperRef} className="absolute inset-0 flex items-center justify-center pointer-events-none" />

          {/* Constellation Sri Lanka SVG Map Layer */}
          <div ref={svgWrapperRef} className="absolute inset-0 flex items-center justify-center text-terracotta pointer-events-none">
            <svg
              viewBox="0 0 450 793"
              className="h-full w-full opacity-90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Geographically Accurate District Paths (Darker outlines for better contrast) */}
              <g stroke="rgba(22, 25, 30, 0.35)" strokeWidth="1.2" strokeDasharray="3 3">
                {DISTRICTS.map((district) => (
                  <path
                    key={district.id}
                    id={district.id}
                    d={district.d}
                    className="district-path transition-colors duration-300 hover:fill-terracotta/10"
                    aria-label={district.label}
                  />
                ))}
              </g>

              {/* Network lines radiating from Colombo (80, 580) (Increased opacity) */}
              <g ref={nodeLinesGroupRef} stroke="currentColor" strokeWidth="1" strokeOpacity="0.65">
                <line x1="80" y1="580" x2="130" y2="80" />   {/* Colombo to Jaffna */}
                <line x1="80" y1="580" x2="160" y2="270" />  {/* Colombo to Anuradhapura */}
                <line x1="80" y1="580" x2="250" y2="260" />  {/* Colombo to Trincomalee */}
                <line x1="80" y1="580" x2="200" y2="480" />  {/* Colombo to Kandy */}
                <line x1="80" y1="580" x2="330" y2="390" />  {/* Colombo to Batticaloa */}
                <line x1="80" y1="580" x2="110" y2="710" />  {/* Colombo to Galle */}
                <line x1="80" y1="580" x2="150" y2="740" />  {/* Colombo to Matara */}
              </g>

              {/* City Nodes */}
              <g ref={cityNodesRef} fill="currentColor">
                {/* Colombo hub */}
                <circle cx="80" cy="580" r="5.5" className="text-terracotta" />
                {/* Regional points (darker) */}
                <circle cx="200" cy="480" r="3.5" className="text-slate-black/60" />
                <circle cx="110" cy="710" r="3.5" className="text-slate-black/60" />
                <circle cx="130" cy="80" r="3.5" className="text-slate-black/60" />
                <circle cx="250" cy="260" r="3.5" className="text-slate-black/60" />
                <circle cx="330" cy="390" r="3.5" className="text-slate-black/60" />
              </g>
            </svg>
          </div>

        </div>

        {/* Loading Progress Bar */}
        <div className="mt-8 w-36 sm:w-48 space-y-2 text-center">
          <div className="h-[2px] w-full bg-border-warm rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-terracotta w-0"
              style={{ transition: 'none' }}
            />
          </div>
          <p 
            ref={progressTextRef}
            className="text-[10px] font-mono text-slate-black/40 tracking-wider"
          >
            0%
          </p>
        </div>

      </div>
    </div>
  );
}
