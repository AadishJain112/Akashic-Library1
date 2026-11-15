import React from 'react';
import { clsx } from 'clsx';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-wood/15 rounded-lg border border-wood/10',
        className
      )}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-parchment-50/60 rounded-xl border border-wood/20 animate-pulse">
      <div className="w-full aspect-[2/3] bg-wood/20 rounded-lg" />
      <div className="h-4 bg-wood/25 rounded w-3/4" />
      <div className="h-3 bg-wood/15 rounded w-1/2" />
    </div>
  );
};

export const BookSpineSkeleton: React.FC = () => {
  return (
    <div className="w-12 h-56 bg-wood/20 rounded-sm border-l-2 border-r-2 border-wood/40 animate-pulse shrink-0" />
  );
};
