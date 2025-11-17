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
      <div
        className="absolute rounded-full border-2 w-20 h-20 animate-[expandFade_1.5s_ease-out_infinite]"
        style={{
          borderColor: color,
          filter: `drop-shadow(0 0 8px ${color})`,
          animationDelay: "0s",
        }}
      />
      <div
        className="absolute rounded-full border-2 w-20 h-20 animate-[expandFade_1.5s_ease-out_infinite]"
        style={{
          borderColor: color,
          filter: `drop-shadow(0 0 8px ${color})`,
          animationDelay: "0.5s",
        }}
      />
      <div
        className="absolute rounded-full border-2 w-20 h-20 animate-[expandFade_1.5s_ease-out_infinite]"
        style={{
          borderColor: color,
          filter: `drop-shadow(0 0 8px ${color})`,
          animationDelay: "1s",
        }}
      />
    </div>
  );
}
