import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const { data: health, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => authApi.checkHealth(),
    refetchInterval: 30000,
    retry: false,
  });

  const isHealthy = Boolean(health?.status === 'ok') && !isError;

  return (
    <footer className="bg-parchment-200/70 border-t border-wood/20 text-ink py-12 mt-16 text-xs selection:bg-brass-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-wood/20">
          {/* Colophon Note */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-wood-dark text-brass flex items-center justify-center font-serif font-bold text-xs">
                A
              </div>
              <h4 className="font-serif font-bold text-sm text-ink-dark tracking-wider uppercase">
                Akashic Library Colophon
              </h4>
            </div>
            <p className="text-xs text-ink-light leading-relaxed max-w-md font-serif">
              An archival sanctuary uniting book discovery, personal scholarship, community discourse, and rare physical volumes. Preserved in memory of ancient Alexandria and digital Alexandria alike.
            </p>
          </div>

          {/* Quick Wings */}
          <div>
            <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-ink-dark mb-3">
              Wings & Chambers
            </h5>
            <ul className="space-y-1.5 text-xs text-ink-light font-medium">
              <li>
                <Link to="/catalogue" className="hover:text-wood-dark transition-colors">
                  The Stacks (Catalogue)
                </Link>
              </li>
              <li>
                <Link to="/bookshop" className="hover:text-wood-dark transition-colors">
                  The Bookshop
                </Link>
              </li>
              <li>
                <Link to="/circle" className="hover:text-wood-dark transition-colors">
                  Reading Circle
                </Link>
              </li>
              <li>
                <Link to="/shelves" className="hover:text-wood-dark transition-colors">
                  Personal Library
                </Link>
              </li>
            </ul>
          </div>

          {/* System & Lamp */}
          <div>
            <h5 className="font-serif font-bold text-xs uppercase tracking-wider text-ink-dark mb-3">
              Library Lamp
            </h5>
            <div className="flex items-center gap-2.5 p-2.5 bg-parchment-50 rounded-xl border border-wood/20 shadow-sm">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isHealthy ? 'bg-jewel-emerald animate-ping' : 'bg-jewel-ruby animate-pulse'
                  } opacity-75`}
                />
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isHealthy ? 'bg-jewel-emerald' : 'bg-jewel-ruby'
                  } absolute`}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[11px] text-ink-dark">
                  {isHealthy ? 'Desk Lantern Lit' : 'Librarian Stepped Out'}
                </span>
                <span className="text-[10px] text-ink-light">
                  {isHealthy ? 'API Status: Optimal' : 'Connecting to Stacks…'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-light/80">
          <p>© {new Date().getFullYear()} Akashic Library. Discover. Read. Connect. Shop.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-serif italic">
              <Sparkles className="w-3 h-3 text-brass-dark" />
              <span>Crafted with Three.js & Tactile Parchment</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
