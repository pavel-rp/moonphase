"use client";

import { Card } from "../../ui/card";
import { Asset } from "@/lib/data/assets";
import { cn } from "@/lib/utils/utils";

type CryptoCardProps = {
  ref?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
  className?: string;
  // HOC-specific props that can be injected
  glowColor?: string;
  defaultBorderColor?: string;
  perspective?: number;
  bounceSequence?: Array<{
    rotateX: number;
    duration: number;
    ease: string;
  }>;
  onLeaveDuration?: number;
} & Asset;

function CryptoCardBase({
  changePercent24Hr,
  children,
  ref,
  className,
}: CryptoCardProps) {
  const glowColor = changePercent24Hr >= 0 ? "green" : "red";

  const classNames = cn(
    className,
    "glassmorphic hover:shadow-glow",
    "hover:shadow-glow",
    "select-none",
    "cursor-pointer"
  );

  console.log(classNames);

  return (
    <Card
      ref={ref}
      className={classNames}
      data-change-positive={changePercent24Hr >= 0}
      style={
        {
          ["--tw-glow-color" as any]:
            changePercent24Hr >= 0
              ? "var(--color-green-300)"
              : "var(--color-red-300)",
        } as React.CSSProperties
      }
    >
      {children}
    </Card>
  );
}

export const CryptoCard = CryptoCardBase;
