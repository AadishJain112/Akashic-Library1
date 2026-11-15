import React from 'react';
import { clsx } from 'clsx';
import { useTheme } from '../../app/ThemeContext';
import { ShieldCheck, User, Sparkles, BookOpen, Clock, Heart, ShoppingBag } from 'lucide-react';
import { UserRole } from '../../api/auth';
import { formatDate } from '../../api/adapters';

export interface LibraryCard3DProps {
  isFlipped?: boolean;
  onFlip?: () => void;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
  // Account Mode props
  isAccountMode?: boolean;
  username?: string;
  displayName?: string | null;
  email?: string;
  role?: UserRole | 'GUEST';
  createdAt?: string;
  bio?: string | null;
  stats?: {
    wantToRead: number;
    reading: number;
    read: number;
    favorites: number;
    ordersCount: number;
  };
}

export const LibraryCard3D: React.FC<LibraryCard3DProps> = ({
  isFlipped = false,
  onFlip,
  frontContent,
  backContent,
  isAccountMode = false,
  username = 'Scholar',
  displayName,
  email,
  role = 'USER',
  createdAt,
  bio,
  stats,
}) => {
  const { playPageTurn, lite3D } = useTheme();

  const handleCardClick = () => {
    if (onFlip) {
      playPageTurn();
      onFlip();
    }
  };

  const getRoleSeal = (r: UserRole | 'GUEST') => {
    switch (r) {
      case 'ADMIN':
        return {
          title: 'High Keeper',
          sub: 'Supreme Archivist',
          color: 'bg-jewel-ruby text-parchment-50 border-brass-light',
          border: 'border-jewel-ruby',
        };
      case 'MODERATOR':
        return {
          title: 'Warden',
          sub: 'Night Watch Order',
          color: 'bg-jewel-amethyst text-parchment-50 border-brass-light',
          border: 'border-jewel-amethyst',
        };
      case 'STORE_MANAGER':
        return {
          title: 'Curator',
          sub: 'Bookshop Merchant',
          color: 'bg-wood-deep text-parchment-50 border-brass-light',
          border: 'border-wood-deep',
        };
      default:
        return {
          title: 'Scholar',
          sub: 'Registered Reader',
          color: 'bg-jewel-emerald text-parchment-50 border-brass-light',
          border: 'border-jewel-emerald',
        };
    }
  };

  const seal = getRoleSeal(role);

  return (
    <div className="relative w-full max-w-md perspective-1200 mx-auto select-none">
      {/* 3D Card Shell */}
      <div
        onClick={handleCardClick}
        className={clsx(
          'relative w-full aspect-[1.58/1] rounded-2xl cursor-pointer transition-transform duration-700 preserve-3d shadow-2xl',
          isFlipped ? 'rotate-y-180' : ''
        )}
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT OF THE LIBRARY CARD */}
        <div
          className="absolute inset-0 rounded-2xl p-6 backface-hidden border-2 border-brass-dark/60 shadow-xl overflow-hidden flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, #FFFDF7 0%, #F6EAD3 100%)',
          }}
        >
          {/* Subtle Gilded Crest Watermark */}
          <div className="absolute right-4 bottom-2 text-brass/15 text-8xl font-serif pointer-events-none select-none">
            ⚜
          </div>

          {/* Gilded Top Border */}
          <div className="flex items-center justify-between border-b-2 border-brass-antique/30 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-wood-dark border border-brass flex items-center justify-center text-brass font-serif font-bold text-sm shadow">
                A
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm tracking-widest text-ink-dark uppercase">
                  Akashic Library
                </h3>
                <p className="text-[10px] text-ink-light tracking-wider uppercase font-semibold">
                  Official Reader Charter
                </p>
              </div>
            </div>

            {/* Wax Seal / Stamp */}
            <div
              className={clsx(
                'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow border flex items-center gap-1',
                seal.color
              )}
            >
              <Sparkles className="w-3 h-3 text-brass-light" />
              <span>{seal.title}</span>
            </div>
          </div>

          {/* Card Body */}
          {frontContent ? (
            <div className="my-auto">{frontContent}</div>
          ) : isAccountMode ? (
            <div className="my-auto space-y-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-light/75">
                  Reader Name
                </span>
                <p className="font-serif text-xl font-bold text-ink-dark">
                  {displayName || username}
                </p>
                {displayName && <p className="text-xs text-ink-light italic">@{username}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ink-light/75">Email</span>
                  <p className="font-mono text-ink text-[11px] truncate">{email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-ink-light/75">Chartered</span>
                  <p className="text-ink text-[11px]">{formatDate(createdAt)}</p>
                </div>
              </div>

              {bio && (
                <p className="text-xs text-ink-light font-hand text-sm bg-parchment-100/70 p-2 rounded-lg border border-wood/15 line-clamp-2">
                  "{bio}"
                </p>
              )}
            </div>
          ) : null}

          {/* Card Footer */}
          <div className="flex items-center justify-between border-t border-brass-antique/30 pt-2 text-[10px] text-ink-light">
            <span className="font-mono">NO. AK-{username.slice(0, 4).toUpperCase()}-942</span>
            <span className="italic">Click card to turn over ↺</span>
          </div>
        </div>

        {/* BACK OF THE LIBRARY CARD */}
        <div
          className="absolute inset-0 rounded-2xl p-6 backface-hidden border-2 border-brass-dark/60 shadow-xl overflow-hidden flex flex-col justify-between"
          style={{
            background: 'linear-gradient(135deg, #FBF4E6 0%, #EBD8B7 100%)',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-brass-antique/30 pb-2">
            <h4 className="font-serif font-bold text-sm text-ink-dark">Reading Ledger & Records</h4>
            <span className="text-[10px] text-ink-light font-semibold uppercase">Seal of Entry</span>
          </div>

          {/* Back Body */}
          {backContent ? (
            <div className="my-auto">{backContent}</div>
          ) : isAccountMode && stats ? (
            <div className="my-auto grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-parchment-50 rounded-xl border border-wood/20 shadow-sm">
                <BookOpen className="w-4 h-4 mx-auto text-wood-dark mb-1" />
                <span className="text-lg font-bold text-ink-dark">{stats.wantToRead}</span>
                <p className="text-[10px] text-ink-light uppercase">Want to Read</p>
              </div>

              <div className="p-2.5 bg-parchment-50 rounded-xl border border-wood/20 shadow-sm">
                <Clock className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                <span className="text-lg font-bold text-ink-dark">{stats.reading}</span>
                <p className="text-[10px] text-ink-light uppercase">Reading</p>
              </div>

              <div className="p-2.5 bg-parchment-50 rounded-xl border border-wood/20 shadow-sm">
                <ShieldCheck className="w-4 h-4 mx-auto text-jewel-emerald mb-1" />
                <span className="text-lg font-bold text-ink-dark">{stats.read}</span>
                <p className="text-[10px] text-ink-light uppercase">Read</p>
              </div>

              <div className="p-2.5 bg-parchment-50 rounded-xl border border-wood/20 shadow-sm col-span-1">
                <Heart className="w-4 h-4 mx-auto text-jewel-ruby mb-1 fill-current" />
                <span className="text-lg font-bold text-ink-dark">{stats.favorites}</span>
                <p className="text-[10px] text-ink-light uppercase">Favorites</p>
              </div>

              <div className="p-2.5 bg-parchment-50 rounded-xl border border-wood/20 shadow-sm col-span-2 flex flex-col justify-center">
                <div className="flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brass-dark" />
                  <span className="text-lg font-bold text-ink-dark">{stats.ordersCount}</span>
                </div>
                <p className="text-[10px] text-ink-light uppercase">Bookshop Parcels</p>
              </div>
            </div>
          ) : null}

          {/* Footer with barcode styling */}
          <div className="flex items-center justify-between border-t border-brass-antique/30 pt-2 text-[10px] text-ink-light">
            <div className="flex gap-0.5 items-center h-4">
              <div className="w-0.5 h-full bg-ink-dark" />
              <div className="w-1 h-full bg-ink-dark" />
              <div className="w-0.5 h-full bg-ink-dark" />
              <div className="w-1.5 h-full bg-ink-dark" />
              <div className="w-0.5 h-full bg-ink-dark" />
              <div className="w-1 h-full bg-ink-dark" />
            </div>
            <span className="italic">Click card to turn back ↺</span>
          </div>
        </div>
      </div>
    </div>
  );
};
