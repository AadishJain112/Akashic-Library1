import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | string[];
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-ink-light flex justify-between">
          <span>{label}</span>
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={clsx(
          'w-full px-3.5 py-2.5 rounded-xl text-sm bg-parchment-50 border transition-all duration-200 text-ink placeholder:text-ink-light/50 shadow-inner focus:outline-none focus:ring-2',
          errorMessage
            ? 'border-jewel-ruby/60 focus:ring-jewel-ruby/30 focus:border-jewel-ruby'
            : 'border-wood/30 focus:ring-brass/40 focus:border-brass-dark hover:border-wood/60',
          className
        )}
        {...props}
      />
      {errorMessage ? (
        <p className="text-xs text-jewel-ruby font-medium flex items-center gap-1">
          <span>•</span> {errorMessage}
        </p>
      ) : helperText ? (
        <p className="text-xs text-ink-light/75">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
