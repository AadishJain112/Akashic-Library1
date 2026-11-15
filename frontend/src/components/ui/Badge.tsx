import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'ruby' | 'sapphire' | 'amber' | 'brass' | 'violet' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
}) => {
  const variants = {
    emerald: 'bg-emerald-50 text-jewel-emerald border-jewel-emerald/30',
    ruby: 'bg-rose-50 text-jewel-ruby border-jewel-ruby/30',
    sapphire: 'bg-blue-50 text-jewel-sapphire border-jewel-sapphire/30',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    brass: 'bg-amber-100/70 text-ink-dark border-brass-dark/40 font-semibold',
    violet: 'bg-purple-50 text-jewel-amethyst border-jewel-amethyst/30',
    neutral: 'bg-parchment-200/80 text-ink-light border-wood/20',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium border',
    md: 'text-sm px-2.5 py-1 rounded-lg font-medium border',
  };

  return (
    <span className={clsx('inline-flex items-center gap-1.5 whitespace-nowrap', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
};
