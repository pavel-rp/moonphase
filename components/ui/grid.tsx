import clsx from "clsx";
import { HTMLAttributes, ReactNode } from "react";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  colsClass?: string;
  gapClass?: string;
  children: ReactNode;
}
export function Grid({
  colsClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  gapClass = "gap-6",
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div className={clsx("grid", colsClass, gapClass, className)} {...props}>
      {children}
    </div>
  );
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  span?: number;
  children: ReactNode;
}

const spanClasses = {
  1: "col-span-1",
  2: "col-span-2", 
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
} as const;

export function GridItem({
  span = 1,
  className,
  children,
  ...props
}: GridItemProps) {
  const spanClass = `${spanClasses[1]} md:${spanClasses[span as keyof typeof spanClasses]}`;
  return (
    <div className={clsx(spanClass, className)} {...props}>
      {children}
    </div>
  );
}

Grid.Item = GridItem;
