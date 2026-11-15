import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

export interface BookRatingTowerProps {
  averageRating: number | null;
  ratingCount: number;
  distribution?: Record<string, number>;
  className?: string;
}

export const BookRatingTower: React.FC<BookRatingTowerProps> = ({
  averageRating,
  ratingCount,
  distribution = {},
  className,
}) => {
  // Normalize distribution counts
  const dist = {
    5: distribution['5'] || 0,
    4: distribution['4'] || 0,
    3: distribution['3'] || 0,
    2: distribution['2'] || 0,
    1: distribution['1'] || 0,
  };

  const maxCount = Math.max(1, ...Object.values(dist));

  const bookSpineColors = {
    5: 'bg-jewel-emerald',
    4: 'bg-jewel-sapphire',
    3: 'bg-jewel-saffron',
    2: 'bg-jewel-terracotta',
    1: 'bg-jewel-ruby',
  };

  return (
    <div
      className={clsx(
        'p-5 bg-parchment-50 rounded-2xl border border-wood/20 shadow-parchment flex flex-col md:flex-row items-center gap-6 parchment-texture',
        className
      )}
    >
      {/* Average Score Badge */}
      <div className="flex flex-col items-center justify-center p-4 min-w-[120px] text-center border-b md:border-b-0 md:border-r border-wood/20">
        <span className="font-serif text-4xl font-extrabold text-ink-dark">
          {averageRating !== null && averageRating !== undefined
            ? Number(averageRating).toFixed(1)
            : '—'}
        </span>
        <div className="flex items-center text-amber-500 my-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={clsx(
                'w-4 h-4',
                averageRating && averageRating >= star
                  ? 'fill-current'
                  : averageRating && averageRating >= star - 0.5
                  ? 'fill-current opacity-70'
                  : 'text-wood/30'
              )}
            />
          ))}
        </div>
        <span className="text-xs text-ink-light font-medium">
          {ratingCount} {ratingCount === 1 ? 'scholar' : 'scholars'} rated
        </span>
      </div>

      {/* 3D Book Tower Histogram */}
      <div className="flex-1 w-full space-y-2">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-ink-light">
          Archival Consensus Distribution
        </h5>
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = dist[stars as keyof typeof dist];
          const pct = Math.round((count / maxCount) * 100);

          return (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-bold text-ink-dark flex items-center gap-1 shrink-0">
                <span>{stars}</span>
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              </span>

              {/* Stack of books spine bar */}
              <div className="flex-1 h-5 bg-parchment-200/60 rounded-md overflow-hidden p-0.5 border border-wood/15 flex items-center">
                <div
                  className={clsx(
                    'h-full rounded-xs transition-all duration-500 relative flex items-center justify-end pr-1.5 shadow-sm',
                    bookSpineColors[stars as keyof typeof bookSpineColors]
                  )}
                  style={{ width: `${Math.max(pct > 0 ? 8 : 0, pct)}%` }}
                >
                  {/* Spine Gilded Lines */}
                  <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-brass-light/40" />
                  <div className="absolute right-1 top-0 bottom-0 w-0.5 bg-brass-light/40" />
                </div>
              </div>

              <span className="w-8 text-right font-mono text-[11px] text-ink-light shrink-0">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
