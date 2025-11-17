"use client";

export type LoadingRingsProps = {
  color: string;
};

/**
 * LoadingRings - Concentric pulsing rings animation for page transition loading state
 * Shows expanding, fading rings emanating from card center to indicate active loading
 */
export function LoadingRings({ color }: LoadingRingsProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 p-8">
      <style jsx>{`
        @keyframes expandFade {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          5% {
            opacity: 0.4;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .ring {
          animation: expandFade 1.5s ease-out infinite;
          filter: drop-shadow(0 0 4px ${color});
          opacity: 0;
          transform: scale(0);
        }
        .ring-1 {
          animation-delay: 0s;
        }
        .ring-2 {
          animation-delay: 0.5s;
        }
        .ring-3 {
          animation-delay: 1s;
        }
      `}</style>

      <div
        className="absolute rounded-full border-2 w-20 h-20 ring ring-1"
        style={{ borderColor: color }}
      />
      <div
        className="absolute rounded-full border-2 w-20 h-20 ring ring-2"
        style={{ borderColor: color }}
      />
      <div
        className="absolute rounded-full border-2 w-20 h-20 ring ring-3"
        style={{ borderColor: color }}
      />
    </div>
  );
}
