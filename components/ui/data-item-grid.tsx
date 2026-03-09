import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type DataItem = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
};

type DataItemGridProps = {
  items: DataItem[];
};

export function DataItemGrid({ items }: DataItemGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div
            key={index}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <IconComponent className="hidden sm:block h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            {typeof item.value === 'string' ? (
              <span className="text-base md:text-lg lg:text-xl font-semibold tabular-nums text-right">
                {item.value}
              </span>
            ) : (
              item.value
            )}
          </div>
        );
      })}
    </div>
  );
}
