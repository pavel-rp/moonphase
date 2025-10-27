"use client";

import React from "react";

interface PieBaseProps {
  size: number;
  children: React.ReactNode;
}

export function PieBase({ size, children }: PieBaseProps) {
  return (
    <div className="relative inline-block">
      <div className="relative rounded-3xl bg-white/5 p-4 md:p-6 ring-1 ring-white/10 backdrop-blur-md">
        <div className="relative grid place-items-center">
          <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="relative">
            {children}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default PieBase;


