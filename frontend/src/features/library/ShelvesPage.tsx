import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi, LibraryEntry, ShelfStatus } from '../../api/library';
import { fromLibraryEntry } from '../../api/adapters';
import { BookCard3D } from '../../components/css3d/BookCard3D';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Heart,
  Clock,
  ShieldCheck,
  Trash2,
  ArrowRightLeft,
  Sparkles,
  Search,
} from 'lucide-react';
import { clsx } from 'clsx';

export const ShelvesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError, toast } = useToast();
  const navigate = useNavigate();

  // Active view tab: 'all' | 'WANT_TO_READ' | 'READING' | 'READ' | 'FAVORITES'
  const [activeTab, setActiveTab] = useState<'all' | ShelfStatus | 'FAVORITES'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');

  // Load all library entries client-side
  const {
    data: entries = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['library-all'],
    queryFn: () => libraryApi.getAllLibraryEntries(),
  });

  // MUTATION: Move Shelf
  const moveMutation = useMutation({
    mutationFn: ({ bookId, status }: { bookId: string; status: ShelfStatus }) =>
      libraryApi.updateShelf(bookId, status),
    onSuccess: (_, { status }) => {
      const labels = {
        WANT_TO_READ: 'Want to Read',
        READING: 'Currently Reading',
        READ: 'Finished Reading',
      };
      success(`Moved volume to "${labels[status]}" shelf!`);
      queryClient.invalidateQueries({ queryKey: ['library-all'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Could not move book.');
    },
  });

  // MUTATION: Remove with Undo
  const removeMutation = useMutation({
    mutationFn: async (entry: LibraryEntry) => {
      await libraryApi.removeFromShelf(entry.book_id);
      return entry;
    },
    onSuccess: (removedEntry) => {
      toast({
        type: 'info',
        title: 'Volume Shelved Away',
        message: `Removed "${removedEntry.book?.title}" from your library.`,
        action: {
          label: 'Undo',
          onClick: async () => {
            await libraryApi.addToShelf(removedEntry.book_id, removedEntry.status);
            queryClient.invalidateQueries({ queryKey: ['library-all'] });
            success('Volume restored to shelf!');
          },
        },
      });
      queryClient.invalidateQueries({ queryKey: ['library-all'] });
    },
    onError: (err: any) => {
      toastError(err?.message || 'Failed to remove from shelf.');
    },
  });

  // MUTATION: Favorite toggle
  const favoriteMutation = useMutation({
    mutationFn: async ({ bookId, isFav }: { bookId: string; isFav: boolean }) => {
      if (isFav) {
        return libraryApi.unfavoriteBook(bookId);
      } else {
        return libraryApi.favoriteBook(bookId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-all'] });
    },
  });

  // Sort and group entries
  const sortedEntries = [...entries].sort((a, b) => {
    if (sortBy === 'title') {
      return (a.book?.title || '').localeCompare(b.book?.title || '');
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const wantToReadEntries = sortedEntries.filter((e) => e.status === 'WANT_TO_READ');
  const readingEntries = sortedEntries.filter((e) => e.status === 'READING');
  const readEntries = sortedEntries.filter((e) => e.status === 'READ');
  const favoriteEntries = sortedEntries.filter((e) => e.favorited);

  const displayedEntries =
    activeTab === 'all'
      ? sortedEntries
      : activeTab === 'FAVORITES'
      ? favoriteEntries
      : sortedEntries.filter((e) => e.status === activeTab);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* HEADER & REAL STATS PLAQUE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-wood/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brass-dark">
            Personal Repository
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-ink-dark mt-1">
            My Personal Shelves
          </h1>
          <p className="text-xs text-ink-light mt-1 font-serif">
            A private reading sanctum for curating and contemplating your literary journey.
          </p>
        </div>

        {/* Real Data Stats Bar (No fake progress/streaks) */}
        <div className="flex items-center gap-2 sm:gap-3 bg-parchment-50 p-2 rounded-2xl border border-wood/25 shadow-sm text-xs font-bold text-ink-dark">
          <div className="px-3 py-1 bg-parchment-100 rounded-xl flex items-center gap-1.5 border border-wood/15">
            <BookOpen className="w-4 h-4 text-wood-dark" />
            <span>{wantToReadEntries.length} Want</span>
          </div>
          <div className="px-3 py-1 bg-amber-50 text-amber-800 rounded-xl flex items-center gap-1.5 border border-amber-200">
            <Clock className="w-4 h-4" />
            <span>{readingEntries.length} Reading</span>
          </div>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-1.5 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            <span>{readEntries.length} Read</span>
          </div>
          <div className="px-3 py-1 bg-rose-50 text-jewel-ruby rounded-xl flex items-center gap-1.5 border border-rose-200">
            <Heart className="w-4 h-4 fill-current" />
            <span>{favoriteEntries.length} Favs</span>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SORT CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-parchment-50 rounded-2xl border border-wood/25 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl transition-all',
              activeTab === 'all'
                ? 'bg-wood-dark text-parchment-50 shadow'
                : 'text-ink-light hover:text-ink'
            )}
          >
            All Shelves ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab('WANT_TO_READ')}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl transition-all',
              activeTab === 'WANT_TO_READ'
                ? 'bg-wood-dark text-parchment-50 shadow'
                : 'text-ink-light hover:text-ink'
            )}
          >
            Want to Read ({wantToReadEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('READING')}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl transition-all',
              activeTab === 'READING'
                ? 'bg-wood-dark text-parchment-50 shadow'
                : 'text-ink-light hover:text-ink'
            )}
          >
            Currently Reading ({readingEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('READ')}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl transition-all',
              activeTab === 'READ'
                ? 'bg-wood-dark text-parchment-50 shadow'
                : 'text-ink-light hover:text-ink'
            )}
          >
            Finished Reading ({readEntries.length})
          </button>
          <button
            onClick={() => setActiveTab('FAVORITES')}
            className={clsx(
              'px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 text-jewel-ruby',
              activeTab === 'FAVORITES'
                ? 'bg-jewel-ruby text-white shadow'
                : 'hover:text-red-700'
            )}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Favorites ({favoriteEntries.length})</span>
          </button>
        </div>

        {/* Client-side Sort */}
        <div className="flex items-center gap-2 text-xs text-ink-light">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-parchment-50 border border-wood/30 rounded-xl px-2.5 py-1 text-ink-dark font-medium shadow-xs"
          >
            <option value="updated">Recently Shelved</option>
            <option value="title">Manuscript Title</option>
          </select>
        </div>
      </div>

      {/* 3D SHELF DISPLAY UNITS */}
      {displayedEntries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {displayedEntries.map((entry) => {
            const card = fromLibraryEntry(entry);

            return (
              <div
                key={entry.id}
                className="group relative flex flex-col justify-between p-3 bg-parchment-50 rounded-2xl border border-wood/25 shadow-sm hover:shadow-md transition-all"
              >
                {/* 3D Book */}
                <div onClick={() => navigate(`/books/${entry.book_id}`)}>
                  <BookCard3D
                    id={card.id}
                    title={card.title}
                    authors={card.authors}
                    coverUrl={card.coverUrl}
                    variant="card"
                  />
                </div>

                {/* Shelf Control Toolbar Beneath Book */}
                <div className="mt-3 pt-2.5 border-t border-wood/15 flex items-center justify-between text-xs">
                  {/* Heart Favorite Toggle */}
                  <button
                    onClick={() =>
                      favoriteMutation.mutate({
                        bookId: entry.book_id,
                        isFav: entry.favorited,
                      })
                    }
                    className="p-1 rounded text-ink-light hover:text-jewel-ruby transition-colors"
                    title={entry.favorited ? 'Unfavorite' : 'Favorite'}
                  >
                    <Heart
                      className={clsx(
                        'w-4 h-4',
                        entry.favorited ? 'fill-current text-jewel-ruby' : ''
                      )}
                    />
                  </button>

                  {/* Move To Shelf Selector */}
                  <div className="flex items-center gap-1">
                    <select
                      value={entry.status}
                      onChange={(e) =>
                        moveMutation.mutate({
                          bookId: entry.book_id,
                          status: e.target.value as ShelfStatus,
                        })
                      }
                      className="text-[10px] bg-parchment-100 rounded-lg px-1.5 py-0.5 border border-wood/30 text-ink-dark font-bold cursor-pointer"
                    >
                      <option value="WANT_TO_READ">Want</option>
                      <option value="READING">Reading</option>
                      <option value="READ">Read</option>
                    </select>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeMutation.mutate(entry)}
                      className="p-1 rounded text-ink-light hover:text-jewel-ruby hover:bg-red-50 transition-colors"
                      title="Remove from shelf"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-parchment-50 rounded-3xl border-2 border-wood/25 shadow-parchment max-w-md mx-auto my-12 parchment-texture">
          <BookOpen className="w-12 h-12 text-wood/60 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-xl text-ink-dark">Nothing On This Shelf Yet</h3>
          <p className="text-xs text-ink-light mt-1 mb-6 font-serif leading-relaxed">
            Peruse the universal stacks to discover books and place them upon your personal library shelves.
          </p>
          <Link to="/catalogue">
            <Button variant="brass" className="gap-2 shadow">
              <Search className="w-4 h-4" />
              <span>Explore The Stacks</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};
