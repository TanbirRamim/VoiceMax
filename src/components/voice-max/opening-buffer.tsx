
'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export function OpeningBuffer() {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Start fade-out after a delay
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3000); // Content visible for 3 seconds

    // Remove from DOM after fade-out animation completes
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 4000); // 3s visible + 1s fade-out duration (1000ms)

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex flex-col items-center justify-center
        bg-background transition-opacity duration-1000 ease-in-out
        ${isFadingOut ? 'opacity-0' : 'opacity-100'}
      `}
      style={{ pointerEvents: isFadingOut ? 'none' : 'auto' }}
    >
      <div className="text-center animate-textPopInOnce">
        <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-primary animate-pulseSlowIcon" />
        <p className="text-xl sm:text-2xl font-semibold text-foreground mb-1">
          An Initiative from
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-primary mb-3">
          Hackaburg 2025
        </p>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Team 2.1
        </p>
      </div>
      <style jsx global>{`
        @keyframes textPopInAnimationDetails {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-textPopInOnce {
          animation: textPopInAnimationDetails 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
          opacity: 0; /* Start hidden */
        }

        @keyframes pulseSlowAnimationIcon {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
        .animate-pulseSlowIcon {
          animation: pulseSlowAnimationIcon 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
