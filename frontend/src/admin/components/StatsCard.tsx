import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'text-nude-700 bg-nude-50',
  success: 'text-emerald-700 bg-emerald-50',
  warning: 'text-amber-700 bg-amber-50',
  danger: 'text-rose-700 bg-rose-50',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          {title}
        </p>
        <p className="text-2xl font-serif font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${variantStyles[variant]}`}>
        {icon}
      </div>
    </div>
  );
};

