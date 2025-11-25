import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function ActionButton({ children, className, ...rest }: Props) {
  return (
    <Button
      size="xl"
      {...rest}
      className={cn(
        // Layout & positioning
        "relative inline-flex items-center justify-center overflow-hidden",
        "group",
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
        // Interactive states
        "hover:bg-stone-800/100 hover:ring-stone-600/50 hover:shadow-lg hover:border-orange-50/100 hover:scale-104",
        "hover:border-outset hover:border-1 hover:border-[var(--tw-glow-color)]",
        "active:border-inset active:border-1 active:ring-0 active:bg-stone-900/70",
        "focus-visible:outline-none",
        // Transitions & transforms
        "transition-all duration-300",
        "translate-z-3 transform-gpu",
        // Cursor
        "cursor-pointer",
        className
      )}
    >
      <span className={cn("text-lg relative z-10 transition flex items-center gap-3")}>
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
          // Hover state
          "group-hover:translate-x-[360%] group-hover:opacity-100",
          // Transition
          "transition duration-300 ease-out"
        )}
      />
    </Button>
  );
}
