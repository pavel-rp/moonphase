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
export function GridItem({
  span = 1,
  className,
  children,
  ...props
}: GridItemProps) {
  const spanClass = `col-span-${span}`;
  return (
    <div className={clsx(spanClass, className)} {...props}>
      {children}
    </div>
  );
}

Grid.Item = GridItem;
