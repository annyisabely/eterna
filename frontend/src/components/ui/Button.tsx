import React from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-nude-600 text-white hover:bg-nude-700 active:bg-nude-800 disabled:bg-nude-300',
  secondary:
    'bg-mocha-600 text-white hover:bg-mocha-700 active:bg-mocha-800 disabled:bg-mocha-300',
  outline:
    'border border-nude-600 text-nude-600 hover:bg-nude-50 active:bg-nude-100 disabled:border-nude-300 disabled:text-nude-300',
  ghost:
    'text-nude-600 hover:bg-nude-50 active:bg-nude-100 disabled:text-nude-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => (
  <button
    className={clsx(
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-nude-400 focus:ring-offset-1',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      (disabled || loading) && 'cursor-not-allowed opacity-70',
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    )}
    {children}
  </button>
);
