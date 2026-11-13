import React from 'react';
import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-2',
  lg: 'h-10 w-10 border-3',
};

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-nude-200 border-t-nude-600',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Carregando"
    />
  );
};

