"use client";

export type LoadingRingsProps = {
  color: string;
};

// Staggered start times for the three rings, one third of the 1.5s loop apart.
const RING_DELAYS = ["0s", "0.5s", "1s"];

/**
 * LoadingRings - Concentric pulsing rings animation for page transition loading state
 * Shows expanding, fading rings emanating from card center to indicate active loading
 */
export function LoadingRings({ color }: LoadingRingsProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 p-8">
      {RING_DELAYS.map((delay) => (
        <div
          key={delay}
          // Under reduced motion the rings hold still, overlapping as one static ring.
          className="absolute rounded-full border-2 w-20 h-20 animate-expand-fade motion-reduce:animate-none"
          style={{
            borderColor: color,
            filter: `drop-shadow(0 0 8px ${color})`,
            animationDelay: delay,
          }}
        />
      ))}
    </div>
  );
}
