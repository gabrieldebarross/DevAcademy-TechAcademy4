import type { ReactNode } from 'react';

type BadgeColor = 'gray' | 'green' | 'yellow' | 'orange' | 'red' | 'blue';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
}

const COLORS: Record<BadgeColor, string> = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-primary-100 text-primary-700',
};

export function Badge({ color = 'gray', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[color]}`}
    >
      {children}
    </span>
  );
}
