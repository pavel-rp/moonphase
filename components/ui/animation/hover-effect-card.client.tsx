"use client";

import { Card } from "../card";
import { cn } from "@/lib/utils/utils";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useRef } from "react";

export type HoverEffectCardProps = {
  children: React.ReactNode;
  className?: string;
  glowColor: string;
  onClick?: () => void;
};

const ROTATION_RANGE = 20;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

export function HoverEffectCard({
  glowColor,
  children,
  className,
  onClick,
}: HoverEffectCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowColorVarStyle: React.CSSProperties & { "--tw-glow-color": string } = {
    "--tw-glow-color": glowColor,
  };

  // Removed debug logging for production code.

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="transform-3d relative"
      style={{
        transform,
      }}
    >
      <Card
        className={cn(
          className,
          "glassmorphic",
          "hover:shadow-glow",
          "select-none",
          "cursor-pointer",
          "transform-3d",
          "transform-gpu",
          "min-h-[202px]"
        )}
        style={glowColorVarStyle}
        onClick={onClick}
      >
        {children}
      </Card>
      <div
        className="absolute border-2 border-(--tw-glow-color) opacity-80 inset-0 rounded-xl translate-z-0"
        style={glowColorVarStyle}
      />
    </motion.div>
  );
}
