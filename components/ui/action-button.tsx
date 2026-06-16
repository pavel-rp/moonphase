import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  /**
   * Render a muted, non-interactive "working" state: the button is dimmed and
   * disabled while a continuous shine sweeps across it. Used for the AI card's
   * "Generating analysis…" affordance so the same button morphs into the active
   * CTA when the work finishes.
   */
  loading?: boolean;
};

export function ActionButton({
  children,
  className,
  loading = false,
  disabled,
  ...rest
}: Props) {
  return (
    <Button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        // Layout & positioning
        "relative inline-flex items-center justify-center overflow-hidden",
        "group",
        // Responsive sizing (overrides default Button size, py-0 resets default py-2)
        "h-9 px-4 py-0 sm:h-10 sm:px-5 md:h-11 md:px-6",
        // Shape & typography
        "rounded-xl font-semibold corner-shape-squircle",
        // Background & borders
        "bg-stone-900/80 backdrop-blur-md",
        "border-outset border-1",
        "ring-1 ring-stone-600/40",
        // Text color
        "text-orange-50/100",
        // Shadows
        "shadow-md",
        // Transitions & transforms
        "transition-all duration-300",
        "translate-z-3 transform-gpu",
        loading
          ? // Muted, non-interactive while generating.
            "cursor-default opacity-60 saturate-50"
          : // Interactive states
            cn(
              "cursor-pointer",
              "hover:bg-stone-800/100 hover:ring-stone-600/50 hover:shadow-lg hover:border-orange-50/100 hover:scale-104",
              "hover:border-outset hover:border-1 hover:border-[var(--tw-glow-color)]",
              "active:border-inset active:border-1 active:ring-0 active:bg-stone-900/70",
              "focus-visible:outline-none",
            ),
        className,
      )}
    >
      <span
        className={cn(
          "text-sm sm:text-base md:text-lg relative z-10 transition flex items-center gap-2 sm:gap-3",
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          // Positioning
          "pointer-events-none absolute inset-y-0 left-[-40%] w-[40%]",
          // Background gradient
          "bg-gradient-to-r from-transparent via-white/40 to-transparent",
          // Transform
          "skew-x-[-20deg] -translate-x-[120%]",
          // Initial state
          "opacity-0",
          loading
            ? // Continuous sweep while generating (suppressed for reduced motion).
              "animate-[shimmerSweep_1.8s_ease-in-out_infinite] motion-reduce:animate-none"
            : // Hover sweep
              cn(
                "group-hover:translate-x-[360%] group-hover:opacity-100",
                "transition duration-300 ease-out",
              ),
        )}
      />
    </Button>
  );
}
