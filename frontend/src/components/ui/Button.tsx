import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../app/ThemeContext';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'brass' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  onClick,
  ...props
}) => {
  const { playBrassClick } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playBrassClick();
    if (onClick) onClick(e);
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brass-dark focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-wood-dark hover:bg-wood text-parchment-50 shadow-sm hover:shadow active:bg-wood-deep border border-wood-deep/40',
    secondary: 'bg-parchment-50 hover:bg-parchment-200 text-ink border border-wood/30 shadow-sm hover:border-wood/60',
    brass: 'bg-brass hover:bg-brass-light text-ink-dark font-semibold shadow-sm hover:shadow active:bg-brass-dark border border-brass-antique/50',
    danger: 'bg-jewel-ruby hover:bg-red-700 text-parchment-50 shadow-sm border border-red-900/30',
    ghost: 'bg-transparent hover:bg-wood/10 text-ink-dark',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Consulting archives…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
