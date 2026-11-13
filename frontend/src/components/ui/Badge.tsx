import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'promo' | 'new' | 'out_of_stock' | 'low_stock' | 'default' | 'success';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  promo: 'bg-rose-100 text-rose-800 border-rose-200',
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  out_of_stock: 'bg-gray-200 text-gray-700 border-gray-300',
  low_stock: 'bg-orange-100 text-orange-800 border-orange-200',
  default: 'bg-nude-100 text-nude-800 border-nude-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

