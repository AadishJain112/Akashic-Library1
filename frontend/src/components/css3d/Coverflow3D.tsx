import React, { useState } from 'react';
import { BookCardModel } from '../../api/adapters';
import { BookCard3D } from './BookCard3D';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '../../app/ThemeContext';

export interface Coverflow3DProps {
  books: BookCardModel[];
  onSelectBook?: (book: BookCardModel) => void;
  className?: string;
}

export const Coverflow3D: React.FC<Coverflow3DProps> = ({
  books,
  onSelectBook,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(Math.min(2, Math.floor(books.length / 2)));
  const { playPageTurn, lite3D } = useTheme();

  if (!books || books.length === 0) {
    return null;
  }

  const prev = () => {
    if (activeIndex > 0) {
      playPageTurn();
      setActiveIndex(activeIndex - 1);
    }
  };

  const next = () => {
    if (activeIndex < books.length - 1) {
      playPageTurn();
      setActiveIndex(activeIndex + 1);
    }
  };

  return (
    <div className={clsx('relative w-full py-8 overflow-hidden select-none', className)}>
      {/* 3D Stage */}
      <div className="relative h-96 flex items-center justify-center perspective-1200">
        {books.map((book, idx) => {
          const offset = idx - activeIndex;
          const isCenter = offset === 0;

          // If lite3D is enabled, simplify transforms
          let transform = '';
          let zIndex = 10 - Math.abs(offset);
          let opacity = 1;

          if (Math.abs(offset) > 3) {
            opacity = 0;
          }

          if (lite3D) {
            transform = `translateX(${offset * 140}px) scale(${isCenter ? 1 : 0.85})`;
          } else {
            const rotateY = offset < 0 ? 45 : offset > 0 ? -45 : 0;
            const translateX = offset * 160;
            const translateZ = isCenter ? 120 : -Math.abs(offset) * 80;
            transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
          }

          return (
            <div
              key={book.id || idx}
              onClick={() => {
                if (isCenter && onSelectBook) {
                  onSelectBook(book);
                } else {
                  playPageTurn();
                  setActiveIndex(idx);
                }
              }}
              style={{
                transform,
                zIndex,
                opacity,
                transition: 'all 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className="absolute w-52 md:w-60 preserve-3d cursor-pointer"
            >
              <BookCard3D
                id={book.id}
                title={book.title}
                authors={book.authors}
                coverUrl={book.coverUrl}
                rating={book.rating}
                reviewCount={book.reviewCount}
                inStore={book.inStore}
                recommendationReason={book.recommendationReason}
                className={clsx(isCenter ? 'ring-2 ring-brass-antique/50 rounded-lg' : 'opacity-85 hover:opacity-100')}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={prev}
          disabled={activeIndex === 0}
          className="w-10 h-10 rounded-full bg-parchment-50 border border-wood/30 shadow hover:bg-parchment-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-ink transition-colors"
          aria-label="Previous book"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-serif font-bold text-ink-light tracking-wider">
          {activeIndex + 1} of {books.length}
        </span>

        <button
          onClick={next}
          disabled={activeIndex === books.length - 1}
          className="w-10 h-10 rounded-full bg-parchment-50 border border-wood/30 shadow hover:bg-parchment-200 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-ink transition-colors"
          aria-label="Next book"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
