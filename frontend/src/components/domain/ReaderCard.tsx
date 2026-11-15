import React, { useState } from 'react';
import { clsx } from 'clsx';
import { getReaderIdentity } from '../../api/adapters';
import { BookOpen } from 'lucide-react';

export interface ReaderCardProps {
  userId?: string;
  username: string;
  displayName?: string | null;
  className?: string;
}

export const ReaderCard: React.FC<ReaderCardProps> = ({
  userId,
  username,
  displayName,
  className,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const identity = getReaderIdentity(userId || username);

  return (
    <div className={clsx('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        className="flex items-center gap-2 group text-left focus:outline-none"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-parchment-50 shadow-sm border border-brass-dark/30 group-hover:scale-105 transition-transform"
          style={{ backgroundColor: identity.bg }}
        >
          {identity.initials}
        </div>

        {/* Names */}
        <div className="flex flex-col">
          <span className="font-serif font-bold text-xs text-ink-dark group-hover:text-wood-dark transition-colors line-clamp-1">
            {displayName || username}
          </span>
          {displayName && (
            <span className="text-[10px] text-ink-light">@{username}</span>
          )}
        </div>
      </button>

      {/* Reader Micro-Profile Popover */}
      {showPopover && (
        <div
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
          className="absolute left-0 bottom-full mb-2 z-30 w-56 p-3.5 bg-parchment-50 rounded-xl border border-brass-antique/40 shadow-parchment-lg parchment-texture animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-3 border-b border-wood/15 pb-2.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-parchment-50 shadow border border-brass-light/40"
              style={{ backgroundColor: identity.bg }}
            >
              {identity.initials}
            </div>
            <div className="overflow-hidden">
              <h5 className="font-serif font-bold text-sm text-ink-dark truncate">
                {displayName || username}
              </h5>
              <p className="text-xs text-ink-light font-mono truncate">@{username}</p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink-light">
            <BookOpen className="w-3.5 h-3.5 text-wood-dark" />
            <span>Akashic Reading Circle Member</span>
          </div>
        </div>
      )}
    </div>
  );
};
