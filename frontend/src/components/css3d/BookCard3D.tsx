import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { generateProceduralCover } from '../../api/adapters';
import { Star, ShoppingBag, Sparkles } from 'lucide-react';
import { useTheme } from '../../app/ThemeContext';

export interface BookCard3DProps {
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string | null;
  rating?: number | null;
  reviewCount?: number;
  inStore?: boolean;
  recommendationReason?: string;
  variant?: 'card' | 'spine' | 'open' | 'hero';
  className?: string;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

export const BookCard3D: React.FC<BookCard3DProps> = ({
  id,
  title,
  authors,
  coverUrl,
  rating,
  reviewCount,
  inStore,
  recommendationReason,
  variant = 'card',
  className,
  onClick,
  onDragStart,
  draggable = false,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isOpen, setIsOpen] = useState(variant === 'open');
  const cardRef = useRef<HTMLDivElement>(null);
  const { playPageTurn, lite3D } = useTheme();

  const procedural = generateProceduralCover(title, authors);
  const showImg = Boolean(coverUrl) && !imgFailed;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lite3D || variant === 'spine' || isFlipped) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxTilt = 14;
    setRotateX((-y / (rect.height / 2)) * maxTilt);
    setRotateY((x / (rect.width / 2)) * maxTilt);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Spine-only representation for bookshelf mode
  if (variant === 'spine') {
    return (
      <div
        ref={cardRef}
        draggable={draggable}
        onDragStart={onDragStart}
        onClick={onClick}
        className={clsx(
          'group relative h-64 w-12 rounded-sm cursor-pointer transition-all duration-300 transform hover:-translate-y-4 hover:shadow-2xl flex flex-col justify-between py-3 px-1 border-r border-black/30 book-spine-shadow select-none shrink-0',
          className
        )}
        style={{ backgroundColor: procedural.bg }}
        title={`${title} by ${authors.join(', ')}`}
        role="button"
        tabIndex={0}
        aria-label={`Book spine: ${title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onClick) onClick();
          }
        }}
      >
        {/* Top gilded band */}
        <div className="w-full h-1.5 bg-brass-dark/80 rounded-sm mb-1" />

        {/* Vertical Title & Author */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <p
            className="text-[11px] font-serif font-bold text-parchment-100 tracking-wider whitespace-nowrap overflow-hidden text-ellipsis -rotate-90 transform origin-center max-w-[190px]"
            style={{ color: procedural.accent }}
          >
            {title}
          </p>
        </div>

        {/* Bottom gilded stamp & in-store dot */}
        <div className="flex flex-col items-center gap-1 mt-1">
          {inStore && <div className="w-2 h-2 rounded-full bg-brass animate-pulse" title="In Bookshop" />}
          <div className="w-4 h-4 rounded-full border border-brass-dark/60 flex items-center justify-center text-[8px] text-brass">
            A
          </div>
          <div className="w-full h-1.5 bg-brass-dark/80 rounded-sm" />
        </div>
      </div>
    );
  }

  // 3D Card / Hero view
  const currentRotateY = isFlipped ? 180 : rotateY;

  return (
    <div
      className={clsx('relative perspective-1000 select-none group', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Recommendation Ribbon if present */}
      {recommendationReason && (
        <div className="absolute -top-3 -left-2 z-20 bg-jewel-saffron text-ink-dark text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md border border-amber-600/40 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-ink-dark" />
          <span>{recommendationReason}</span>
        </div>
      )}

      {/* In Bookshop Badge */}
      {inStore && (
        <div className="absolute top-2 right-2 z-20 bg-brass-dark/95 text-parchment-50 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 border border-brass-light/40">
          <ShoppingBag className="w-3 h-3" />
          <span>Bookshop</span>
        </div>
      )}

      {/* 3D Book Container */}
      <div
        ref={cardRef}
        onClick={onClick}
        className={clsx(
          'relative w-full aspect-[2/3] rounded-r-lg rounded-l-sm transition-transform duration-200 preserve-3d cursor-pointer shadow-book group-hover:shadow-book-hover',
          lite3D ? 'hover:scale-105' : ''
        )}
        style={{
          transform: lite3D
            ? undefined
            : `rotateX(${rotateX}deg) rotateY(${currentRotateY}deg) ${isHovered ? 'translateZ(15px)' : 'translateZ(0)'}`,
        }}
        role="button"
        tabIndex={0}
        aria-label={`${title} by ${authors.join(', ')}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (onClick) onClick();
          }
        }}
      >
        {/* FRONT COVER */}
        <div
          className="absolute inset-0 rounded-r-lg rounded-l-sm overflow-hidden backface-hidden border-r-2 border-black/20 flex flex-col justify-between"
          style={{ backgroundColor: procedural.bg }}
        >
          {showImg ? (
            <img
              src={coverUrl!}
              alt={`Cover of ${title}`}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover rounded-r-lg rounded-l-sm"
            />
          ) : (
            /* Procedural Cover Design */
            <div
              className="w-full h-full p-4 flex flex-col justify-between border-4 m-1 rounded"
              style={{
                borderColor: procedural.border,
                backgroundColor: procedural.bg,
                width: 'calc(100% - 8px)',
                height: 'calc(100% - 8px)',
              }}
            >
              {/* Top border filigree */}
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-parchment-200/80">
                <span>✦</span>
                <span className="font-serif italic font-semibold">Akashic Edition</span>
                <span>✦</span>
              </div>

              {/* Title & Authors */}
              <div className="text-center my-auto px-2">
                <h3
                  className="font-serif font-bold text-base md:text-lg leading-snug line-clamp-3 mb-2"
                  style={{ color: procedural.accent }}
                >
                  {title}
                </h3>
                <div className="w-12 h-0.5 mx-auto bg-brass/60 my-2" />
                <p className="text-xs text-parchment-100 line-clamp-2 italic">
                  {authors.length > 0 ? authors.join(', ') : 'Ancient Scholar'}
                </p>
              </div>

              {/* Bottom emblem */}
              <div className="flex justify-center items-center">
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-serif font-bold text-xs"
                  style={{ borderColor: procedural.accent, color: procedural.accent }}
                >
                  ⚜
                </div>
              </div>
            </div>
          )}

          {/* Book Spine Crease Highlight on left edge */}
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* 3D SPINE (Left edge) */}
        {!lite3D && (
          <div
            className="absolute top-0 bottom-0 left-0 w-6 origin-left -rotate-90-y flex items-center justify-center overflow-hidden book-spine-shadow"
            style={{
              backgroundColor: procedural.spineColor,
              transform: 'rotateY(-90deg) translateX(-12px)',
            }}
          >
            <span className="text-[8px] font-serif text-parchment-200/80 whitespace-nowrap -rotate-90">
              {title}
            </span>
          </div>
        )}

        {/* 3D PAGE BLOCK (Right edge) */}
        {!lite3D && (
          <div
            className="absolute top-1 bottom-1 right-0 w-5 origin-right page-block-texture rounded-r-xs shadow-inner"
            style={{
              transform: 'rotateY(90deg) translateZ(-2px)',
            }}
          />
        )}

        {/* BACK COVER */}
        <div
          className="absolute inset-0 rounded-l-lg rounded-r-sm overflow-hidden backface-hidden p-4 flex flex-col justify-between border-4 border-black/20"
          style={{
            backgroundColor: procedural.bg,
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-center pt-2">
            <h4 className="font-serif font-bold text-sm text-parchment-50 line-clamp-2">{title}</h4>
            <p className="text-xs text-parchment-200 italic mt-1">{authors.join(', ')}</p>
          </div>

          <div className="bg-parchment-100/90 p-2.5 rounded-lg text-ink text-xs line-clamp-5 leading-relaxed font-serif shadow-inner">
            A preserved manuscript in the Akashic Library repository, cataloged for scholarly reading and inquiry.
          </div>

          <div className="flex items-center justify-between border-t border-parchment-200/40 pt-2 text-[10px] text-parchment-200">
            <span>Library ID: {id.slice(0, 8)}</span>
            <span>✦ Archive</span>
          </div>
        </div>
      </div>

      {/* Book Metadata beneath card */}
      <div className="mt-2.5 px-0.5">
        <h4 className="font-serif font-bold text-sm text-ink-dark line-clamp-1 group-hover:text-wood-dark transition-colors">
          {title}
        </h4>
        <p className="text-xs text-ink-light line-clamp-1 mt-0.5">
          {authors.length > 0 ? authors.join(', ') : 'Unknown Author'}
        </p>

        {rating !== null && rating !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-bold text-ink-dark ml-1">{Number(rating).toFixed(1)}</span>
            </div>
            {reviewCount !== undefined && reviewCount > 0 && (
              <span className="text-[11px] text-ink-light">({reviewCount})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
