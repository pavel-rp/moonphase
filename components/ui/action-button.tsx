// ShinyButton.tsx
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function ActionButton({ children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={
        "relative inline-flex items-center justify-center overflow-hidden " +
        "rounded-xl px-5 py-2.5 font-semibold corner-shape-squircle" +
        "shadow-md backdrop-blur-md bg-stone-900/80 ring-1 ring-stone-600/40 text-orange-50/100 " +
        "hover:bg-stone-800/70 hover:ring-stone-400/50 " +
        "shadow-md hover:shadow-lg focus-visible:outline-none " +
        "transition-all duration-200 " +
        "cursor-pointer " +
        "group " + // <- needed for group-hover
        "translate-z-30 transform-gpu hover:scale-104 " +
        "border-orange-50/50 border-1 border-solid" +
        "hover:border-orange-50/100" +
        "shadow-glow" +
        className
      }
    >
      {/* label sits above everything */}
      <span
        className={
          "relative z-10 " +
          "group-hover:scale-104   " +
          "transition"
        }
      >
        {children}
      </span>

      {/* shiny overlay */}
      <span
        className={
          "pointer-events-none absolute inset-y-0 left-[-40%] w-[40%] " +
          "bg-gradient-to-r from-transparent via-white/40 to-transparent " +
          "skew-x-[-20deg] " +
          // initial state
          "-translate-x-[120%] opacity-0 " +
          // on hover: sweep across + fade in
          "group-hover:translate-x-[360%] group-hover:opacity-100 " +
          // Tailwind v4: a single transition utility already covers transform + opacity
          "transition duration-300 ease-out"
        }
      />
    </button>
  );
}
