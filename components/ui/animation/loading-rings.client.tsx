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
      <style>{`
        @keyframes expandFade {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .loading-ring-anim {
          animation: expandFade 1.5s ease-out infinite;
        }
      `}</style>

      <div
        className="absolute rounded-full border-2 w-20 h-20 loading-ring-anim"
        style={{
          borderColor: color,
          filter: `drop-shadow(0 0 8px ${color})`,
          animationDelay: "0s",
        }}
      />
      <div
        className="absolute rounded-full border-2 w-20 h-20 loading-ring-anim"
        style={{
          borderColor: color,
          filter: `drop-shadow(0 0 8px ${color})`,
          animationDelay: "0.5s",
        }}
      />
      <div
        className="absolute rounded-full border-2 w-20 h-20 loading-ring-anim"
        style={{
          borderColor: color,
          filter: `drop-shadow(0 0 8px ${color})`,
          animationDelay: "1s",
        }}
      />
    </div>
  );
}
