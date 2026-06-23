'use client';

import React from 'react';

export default function BackgroundAura() {
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Dynamic blurred glow spheres using pure CSS keyframes */}
      <div 
        className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-terracotta/8 blur-[60px] sm:blur-[90px] md:blur-[120px]"
        style={{
          animation: 'float-slow 25s infinite alternate ease-in-out'
        }}
      />
      <div 
        className="absolute bottom-[-15%] right-[-10%] h-[70%] w-[70%] rounded-full bg-sage-moss/6 blur-[60px] sm:blur-[100px] md:blur-[140px]"
        style={{
          animation: 'float-reverse 30s infinite alternate ease-in-out'
        }}
      />
      <div 
        className="absolute top-[30%] right-[10%] h-[40%] w-[45%] rounded-full bg-terracotta/4 blur-[40px] sm:blur-[70px] md:blur-[100px]"
        style={{
          animation: 'float-slow 20s infinite alternate-reverse ease-in-out'
        }}
      />

      {/* Styled inline keyframes injected into the page */}
      <style jsx global>{`
        @keyframes float-slow {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(40px, 60px) scale(1.1);
          }
          100% {
            transform: translate(-20px, -40px) scale(0.95);
          }
        }
        @keyframes float-reverse {
          0% {
            transform: translate(0px, 0px) scale(0.9);
          }
          50% {
            transform: translate(-50px, -30px) scale(1.05);
          }
          100% {
            transform: translate(30px, 50px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
